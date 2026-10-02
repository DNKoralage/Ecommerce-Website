import {
  defaultProducts,
  defaultCategories,
  defaultHeroSlides,
  defaultShippingMethods,
  defaultSiteSettings,
  defaultCoupons,
  defaultReviews,
} from './seed-data';
import { supabase, isSupabaseConfigured } from './supabase';
import {
  Product,
  Category,
  Order,
  SiteSettings,
  ShippingMethod,
  Coupon,
  Review,
  HeroSlide,
  SiteCustomization,
  NavLink,
  FooterColumn,
  SocialLink,
  BookingRequest,
} from '@/types';

// Browser persistent store keys
const STORAGE_KEYS = {
  PRODUCTS: 'luxe_products',
  ORDERS: 'luxe_orders',
  SETTINGS: 'luxe_settings',
  COUPONS: 'luxe_coupons',
  REVIEWS: 'luxe_reviews',
  WISHLIST: 'luxe_wishlist',
  HERO: 'luxe_hero_slides',
  CATEGORIES: 'luxe_categories',
  CUSTOMIZATION: 'luxe_site_customization',
  BOOKINGS: 'luxe_booking_requests',
};

const getLocal = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (_e) {
    return fallback;
  }
};

const getLocalProducts = (): Product[] => {
  if (typeof window === 'undefined') return defaultProducts;
  try {
    const item = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!item) return defaultProducts;
    const parsed = JSON.parse(item);
    if (!Array.isArray(parsed) || parsed.length < defaultProducts.length) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(defaultProducts));
      return defaultProducts;
    }
    return parsed;
  } catch (_e) {
    return defaultProducts;
  }
};

const setLocal = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('LocalStorage write error', e);
  }
};

export const api = {
  // --- PRODUCTS ---
  async getProducts(params?: {
    category?: string;
    tag?: string;
    sort?: string;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    inStock?: boolean;
    minRating?: number;
    limit?: number;
  }): Promise<Product[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase
          .from('products')
          .select('*, images:product_images(*), options:product_options(*, values:product_option_values(*)), variants:product_variants(*), category:categories(*)');

        if (params?.category && params.category !== 'all') {
          query = query.eq('categories.slug', params.category);
        }
        if (params?.search) {
          query = query.ilike('title', `%${params.search}%`);
        }
        if (params?.inStock) {
          query = query.gt('stock_quantity', 0);
        }
        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data as Product[];
        }
      } catch (e) {
        console.warn('Supabase fetch failed, falling back to local dataset', e);
      }
    }

    let products = getLocalProducts();

    if (params?.category && params.category !== 'all') {
      const cat = defaultCategories.find((c) => c.slug === params.category);
      if (cat) {
        products = products.filter((p) => p.category_id === cat.id);
      }
    }

    if (params?.tag) {
      products = products.filter((p) => p.tags?.includes(params.tag!));
    }

    if (params?.search) {
      const q = params.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (params?.minPrice !== undefined) {
      products = products.filter((p) => (p.sale_price ?? p.price) >= params.minPrice!);
    }
    if (params?.maxPrice !== undefined) {
      products = products.filter((p) => (p.sale_price ?? p.price) <= params.maxPrice!);
    }

    if (params?.inStock) {
      products = products.filter((p) => p.stock_quantity > 0);
    }

    if (params?.minRating !== undefined) {
      products = products.filter((p) => (p.rating ?? 0) >= params.minRating!);
    }

    if (params?.sort) {
      if (params.sort === 'price-low') {
        products.sort((a, b) => (a.sale_price ?? a.price) - (b.sale_price ?? b.price));
      } else if (params.sort === 'price-high') {
        products.sort((a, b) => (b.sale_price ?? b.price) - (a.sale_price ?? a.price));
      } else if (params.sort === 'best-selling') {
        products.sort((a, b) => (b.total_orders ?? 0) - (a.total_orders ?? 0));
      } else if (params.sort === 'rating') {
        products.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      } else if (params.sort === 'newest') {
        products.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
    }

    if (params?.limit) {
      products = products.slice(0, params.limit);
    }

    return products;
  },

  async getProductBySlug(slug: string): Promise<Product | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*, images:product_images(*), options:product_options(*, values:product_option_values(*)), variants:product_variants(*), category:categories(*)')
          .eq('slug', slug)
          .single();
        if (!error && data) return data as Product;
      } catch (e) {
        console.warn('Supabase fetch failed, falling back to local dataset', e);
      }
    }

    const products = getLocalProducts();
    return products.find((p) => p.slug === slug) || defaultProducts.find((p) => p.slug === slug) || null;
  },

  async saveProduct(product: Product): Promise<Product> {
    const products = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, defaultProducts);
    const index = products.findIndex((p) => p.id === product.id);
    if (index >= 0) {
      products[index] = { ...product, updated_at: new Date().toISOString() };
    } else {
      products.unshift({
        ...product,
        id: `prod-${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }
    setLocal(STORAGE_KEYS.PRODUCTS, products);
    return product;
  },

  async deleteProduct(id: string): Promise<boolean> {
    const products = getLocal<Product[]>(STORAGE_KEYS.PRODUCTS, defaultProducts);
    const filtered = products.filter((p) => p.id !== id);
    setLocal(STORAGE_KEYS.PRODUCTS, filtered);
    return true;
  },

  // --- CATEGORIES ---
  async getCategories(): Promise<Category[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('sort_order', { ascending: true });
        if (!error && data && data.length > 0) return data as Category[];
      } catch (e) {
        console.warn(e);
      }
    }
    return getLocal<Category[]>(STORAGE_KEYS.CATEGORIES, defaultCategories);
  },

  // --- SETTINGS ---
  async getSiteSettings(): Promise<SiteSettings> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('site_settings').select('*').limit(1).single();
        if (!error && data) return data as SiteSettings;
      } catch (e) {
        console.warn(e);
      }
    }
    return getLocal<SiteSettings>(STORAGE_KEYS.SETTINGS, defaultSiteSettings);
  },

  async updateSiteSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    const current = getLocal<SiteSettings>(STORAGE_KEYS.SETTINGS, defaultSiteSettings);
    const updated = { ...current, ...settings, updated_at: new Date().toISOString() };
    setLocal(STORAGE_KEYS.SETTINGS, updated);
    return updated;
  },

  // --- HERO SLIDES ---
  async getHeroSlides(): Promise<HeroSlide[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('hero_slides')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });
        if (!error && data && data.length > 0) return data as HeroSlide[];
      } catch (e) {
        console.warn(e);
      }
    }
    return getLocal<HeroSlide[]>(STORAGE_KEYS.HERO, defaultHeroSlides);
  },

  // --- SHIPPING METHODS ---
  async getShippingMethods(): Promise<ShippingMethod[]> {
    return defaultShippingMethods;
  },

  // --- COUPONS ---
  async getCoupons(): Promise<Coupon[]> {
    const raw = getLocal<Coupon[]>(STORAGE_KEYS.COUPONS, defaultCoupons);
    return (raw || []).map((c: Coupon): Coupon => ({
      id: c.id,
      code: c.code,
      type: c.type || 'percentage',
      value: Number(c.value) || 0,
      min_order_amount: Number(c.min_order_amount ?? c.min_order_value ?? 0),
      usage_limit: c.usage_limit !== undefined ? c.usage_limit : (c.max_uses ?? null),
      per_customer_limit: c.per_customer_limit ?? null,
      times_used: Number(c.times_used ?? c.uses_count ?? 0),
      valid_from: c.valid_from ?? c.created_at ?? null,
      valid_to: c.valid_to ?? c.expires_at ?? null,
      is_active: c.is_active !== undefined ? Boolean(c.is_active) : true,
    }));
  },

  async validateCoupon(code: string, subtotal: number): Promise<{ valid: boolean; coupon?: Coupon; message?: string }> {
    const coupons = await this.getCoupons();
    const found = coupons.find((c) => c.code.toUpperCase() === code.trim().toUpperCase());
    if (!found) {
      return { valid: false, message: 'Invalid promotional code' };
    }
    if (!found.is_active) {
      return { valid: false, message: 'This coupon has expired' };
    }
    const minAmount = Number(found.min_order_amount ?? 0);
    if (subtotal < minAmount) {
      return {
        valid: false,
        message: `Requires minimum order of ₹${minAmount.toLocaleString()}`,
      };
    }
    return { valid: true, coupon: found };
  },

  // --- ORDERS ---
  async getOrders(): Promise<Order[]> {
    return getLocal<Order[]>(STORAGE_KEYS.ORDERS, []);
  },

  async getOrderById(id: string): Promise<Order | null> {
    const orders = await this.getOrders();
    return orders.find((o) => o.id === id || o.order_number === id) || null;
  },

  async createOrder(orderData: Omit<Order, 'id' | 'order_number' | 'created_at' | 'updated_at'>): Promise<Order> {
    const orders = getLocal<Order[]>(STORAGE_KEYS.ORDERS, []);
    const newOrder: Order = {
      ...orderData,
      id: `ord_${Date.now()}`,
      order_number: `ORD-${10000 + orders.length + 1}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    orders.unshift(newOrder);
    setLocal(STORAGE_KEYS.ORDERS, orders);
    return newOrder;
  },

  async updateOrderStatus(
    orderId: string,
    updates: Partial<Pick<Order, 'fulfillment_status' | 'payment_status' | 'tracking_number' | 'tracking_carrier'>>
  ): Promise<Order | null> {
    const orders = getLocal<Order[]>(STORAGE_KEYS.ORDERS, []);
    const index = orders.findIndex((o) => o.id === orderId);
    if (index >= 0) {
      orders[index] = { ...orders[index], ...updates, updated_at: new Date().toISOString() };
      setLocal(STORAGE_KEYS.ORDERS, orders);
      return orders[index];
    }
    return null;
  },

  // --- REVIEWS ---
  async getReviewsForProduct(productId: string): Promise<Review[]> {
    const reviews = getLocal<Review[]>(STORAGE_KEYS.REVIEWS, defaultReviews);
    return reviews.filter((r) => r.product_id === productId);
  },

  async addReview(review: Omit<Review, 'id' | 'created_at'>): Promise<Review> {
    const reviews = getLocal<Review[]>(STORAGE_KEYS.REVIEWS, defaultReviews);
    const newRev: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    reviews.unshift(newRev);
    setLocal(STORAGE_KEYS.REVIEWS, reviews);
    return newRev;
  },

  async submitReview(review: Omit<Review, 'id' | 'created_at' | 'is_verified' | 'user_id'> & { is_verified?: boolean; user_id?: string }): Promise<Review> {
    return this.addReview({
      user_id: review.user_id || 'usr-guest',
      is_verified: review.is_verified ?? true,
      ...review,
    });
  },

  // --- WISHLIST ---
  getWishlist(): string[] {
    return getLocal<string[]>(STORAGE_KEYS.WISHLIST, ['prod-1', 'prod-3']);
  },

  toggleWishlist(productId: string): string[] {
    const current = this.getWishlist();
    const updated = current.includes(productId)
      ? current.filter((id) => id !== productId)
      : [...current, productId];
    setLocal(STORAGE_KEYS.WISHLIST, updated);
    return updated;
  },

  // --- NEWSLETTER ---
  async subscribeNewsletter(_email: string): Promise<{ success: boolean; message: string }> {
    return { success: true, message: 'Thank you for joining our private communique.' };
  },

  // --- CONTACT ---
  async submitContact(_data: { name: string; email: string; message: string }): Promise<{ success: boolean }> {
    return { success: true };
  },

  // --- BOOKING REQUESTS (CUSTOM ATELIER COMMISSIONS) ---
  async getBookingRequests(): Promise<BookingRequest[]> {
    return getLocal<BookingRequest[]>(STORAGE_KEYS.BOOKINGS, [
      {
        id: 'bk-demo-1',
        user_id: 'usr-cust-1',
        user_name: 'Ceylon Patron',
        user_email: 'patron@ceylontimes.lk',
        user_phone: '+94 77 123 4567',
        service_type: 'sapphire_consultation',
        service_title: 'Royal Ceylon Sapphire & Gem Consultation',
        preferred_date: '2026-10-15',
        preferred_time: '14:00 - 15:30',
        guests_count: 2,
        special_requirements: 'Looking for a certified unheated royal blue sapphire for bespoke pendant setting.',
        status: 'confirmed',
        created_at: '2026-10-01T10:30:00.000Z',
      },
    ]);
  },

  async getUserBookingRequests(userId: string, email?: string): Promise<BookingRequest[]> {
    const all = await this.getBookingRequests();
    return all.filter((b) => b.user_id === userId || (email && b.user_email.toLowerCase() === email.toLowerCase()));
  },

  async createBookingRequest(data: Omit<BookingRequest, 'id' | 'created_at' | 'status'>): Promise<BookingRequest> {
    const all = await this.getBookingRequests();
    const newBooking: BookingRequest = {
      ...data,
      id: `bk-${Date.now()}`,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    const updated = [newBooking, ...all];
    setLocal(STORAGE_KEYS.BOOKINGS, updated);
    return newBooking;
  },

  async updateBookingRequestStatus(id: string, status: BookingRequest['status']): Promise<BookingRequest | null> {
    const all = await this.getBookingRequests();
    const index = all.findIndex((b) => b.id === id);
    if (index !== -1) {
      all[index].status = status;
      setLocal(STORAGE_KEYS.BOOKINGS, all);
      return all[index];
    }
    return null;
  },

  // --- SITE CUSTOMIZATION ---
  async getSiteCustomization(): Promise<SiteCustomization> {
    const defaults = getDefaultCustomization();
    return getLocal<SiteCustomization>(STORAGE_KEYS.CUSTOMIZATION, defaults);
  },

  async updateSiteCustomization(data: Partial<SiteCustomization>): Promise<SiteCustomization> {
    const current = getLocal<SiteCustomization>(STORAGE_KEYS.CUSTOMIZATION, getDefaultCustomization());
    const updated: SiteCustomization = { ...current, ...data, updated_at: new Date().toISOString() };
    setLocal(STORAGE_KEYS.CUSTOMIZATION, updated);
    // Dispatch storage event so Header/Footer re-render across tabs
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEYS.CUSTOMIZATION }));
    }
    return updated;
  },
};

function getDefaultCustomization(): SiteCustomization {
  return {
    nav_links: [
      { id: 'nav-1', label: 'Shop All', href: '/products', enabled: true, sort_order: 1 },
      { id: 'nav-2', label: 'Jewellery', href: '/products?category=jewellery', enabled: true, sort_order: 2 },
      { id: 'nav-3', label: 'Textiles', href: '/products?category=textiles', enabled: true, sort_order: 3 },
      { id: 'nav-4', label: 'Sacred Living', href: '/products?category=sacred-living', enabled: true, sort_order: 4 },
      { id: 'nav-5', label: 'Ayurveda', href: '/products?category=ayurveda', enabled: true, sort_order: 5 },
      { id: 'nav-6', label: 'Tea', href: '/products?category=tea', enabled: true, sort_order: 6 },
      { id: 'nav-7', label: 'About', href: '/about', enabled: true, sort_order: 7 },
    ] as NavLink[],
    footer_tagline: 'Ceylon Times (ceylon-times.lk) is the sovereign digital atelier celebrating timeless Sri Lankan craftsmanship, certified Ratnapura sapphires, Kandyan handlooms, and sacred temple living arts.',
    footer_copyright: `© ${new Date().getFullYear()} Ceylon Times (ceylon-times.lk). All rights reserved. Proudly Sri Lankan.`,
    footer_columns: [
      {
        id: 'col-1',
        heading: 'Collections',
        links: [
          { id: 'fc-1', label: 'Jewellery', href: '/products?category=jewellery', enabled: true },
          { id: 'fc-2', label: 'Textiles', href: '/products?category=textiles', enabled: true },
          { id: 'fc-3', label: 'Sacred Living', href: '/products?category=sacred-living', enabled: true },
          { id: 'fc-4', label: 'Ayurveda', href: '/products?category=ayurveda', enabled: true },
          { id: 'fc-5', label: 'Tea', href: '/products?category=tea', enabled: true },
        ],
      },
      {
        id: 'col-2',
        heading: 'Island Support',
        links: [
          { id: 'fs-1', label: 'Our Heritage', href: '/about', enabled: true },
          { id: 'fs-2', label: 'Artisan Care Guide', href: '/faq', enabled: true },
          { id: 'fs-3', label: 'Island Delivery', href: '/shipping', enabled: true },
          { id: 'fs-4', label: 'Easy Exchanges', href: '/returns', enabled: true },
          { id: 'fs-5', label: 'Bespoke Inquiries', href: '/contact', enabled: true },
        ],
      },
      {
        id: 'col-3',
        heading: 'Platform',
        links: [
          { id: 'fp-1', label: 'My Account', href: '/account', enabled: true },
          { id: 'fp-2', label: 'Shopping Bag', href: '/cart', enabled: true },
          { id: 'fp-3', label: 'Privacy Policy', href: '/privacy', enabled: true },
          { id: 'fp-4', label: 'Terms of Service', href: '/terms', enabled: true },
        ],
      },
    ] as FooterColumn[],
    footer_social_links: [
      { id: 'soc-1', platform: 'Instagram', url: 'https://instagram.com', enabled: true },
      { id: 'soc-2', platform: 'Twitter/X', url: 'https://twitter.com', enabled: true },
      { id: 'soc-3', platform: 'Facebook', url: 'https://facebook.com', enabled: true },
      { id: 'soc-4', platform: 'YouTube', url: 'https://youtube.com', enabled: false },
    ] as SocialLink[],
    footer_badges: [
      { id: 'badge-1', icon: '🚚', text: 'Island-wide Courier', enabled: true },
      { id: 'badge-2', icon: '🛡️', text: 'Authenticity Seal', enabled: true },
      { id: 'badge-3', icon: '🔄', text: 'Provenance Guarantee', enabled: true },
    ],
    hero_slides: defaultHeroSlides,
  };
}
