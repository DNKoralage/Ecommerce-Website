-- ============================================
-- LUXE STORE — Complete Supabase Database Schema
-- ============================================
-- Run this entire file in Supabase SQL Editor to set up
-- all tables, RLS policies, functions, triggers, and storage.
-- ============================================

-- ============================================
-- 1. ENUM TYPES
-- ============================================

CREATE TYPE user_role AS ENUM ('customer', 'admin');
CREATE TYPE product_status AS ENUM ('draft', 'active');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE fulfillment_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE coupon_type AS ENUM ('percentage', 'fixed');

-- ============================================
-- 2. TABLES
-- ============================================

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'customer' NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  is_primary_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Site Settings (singleton)
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_name TEXT DEFAULT 'Ceylon Times' NOT NULL,
  tagline TEXT DEFAULT 'Sovereign Sri Lankan Heritage Atelier',
  logo_url TEXT,
  logo_inverted_url TEXT,
  favicon_url TEXT,
  contact_email TEXT DEFAULT 'admin@ceylontimes.lk',
  contact_phone TEXT DEFAULT '+94 11 234 5678',
  business_address TEXT DEFAULT 'Colombo 03, Sri Lanka',
  currency_code TEXT DEFAULT 'LKR' NOT NULL,
  currency_symbol TEXT DEFAULT 'Rs.' NOT NULL,
  tax_rate NUMERIC(5,2) DEFAULT 18.00,
  tax_inclusive BOOLEAN DEFAULT FALSE,
  announcement_bar_active BOOLEAN DEFAULT FALSE,
  announcement_bar_text TEXT,
  announcement_bar_link TEXT,
  announcement_bar_color TEXT DEFAULT '#2563EB',
  social_instagram TEXT,
  social_facebook TEXT,
  social_twitter TEXT,
  social_tiktok TEXT,
  social_youtube TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- SEO Settings (singleton)
CREATE TABLE seo_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meta_title_template TEXT DEFAULT '{Page Title} | {Site Name}',
  default_meta_description TEXT DEFAULT 'Discover premium products at LUXE STORE. Shop the latest collections with free shipping.',
  og_default_image_url TEXT,
  ga_tracking_id TEXT,
  fb_pixel_id TEXT,
  search_console_meta TEXT,
  robots_txt TEXT DEFAULT E'User-agent: *\nAllow: /\nSitemap: /sitemap.xml',
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Page SEO (per-page overrides)
CREATE TABLE page_seo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_slug TEXT UNIQUE NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  og_image_url TEXT
);

-- Categories
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- Products
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  price NUMERIC(10,2) NOT NULL,
  sale_price NUMERIC(10,2),
  sale_start TIMESTAMPTZ,
  sale_end TIMESTAMPTZ,
  sku TEXT UNIQUE,
  stock_quantity INT DEFAULT 0,
  track_inventory BOOLEAN DEFAULT TRUE,
  allow_backorders BOOLEAN DEFAULT FALSE,
  status product_status DEFAULT 'draft' NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  og_image_url TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_created ON products(created_at DESC);
CREATE INDEX idx_products_price ON products(price);

-- Product Images
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  alt_text TEXT
);

CREATE INDEX idx_product_images_product ON product_images(product_id);

-- Product Options (e.g., "Size", "Color")
CREATE TABLE product_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

CREATE INDEX idx_product_options_product ON product_options(product_id);

-- Product Option Values (e.g., "XL", "Red")
CREATE TABLE product_option_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  option_id UUID NOT NULL REFERENCES product_options(id) ON DELETE CASCADE,
  value TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

CREATE INDEX idx_option_values_option ON product_option_values(option_id);

-- Product Variants
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku TEXT,
  price NUMERIC(10,2),
  stock_quantity INT DEFAULT 0,
  option_values JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_variants_product ON product_variants(product_id);

-- Addresses
CREATE TABLE addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_addresses_user ON addresses(user_id);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT NOT NULL,
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  shipping_method TEXT,
  shipping_cost NUMERIC(10,2) DEFAULT 0,
  subtotal NUMERIC(10,2) NOT NULL,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  tax_amount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  coupon_code TEXT,
  payment_status payment_status DEFAULT 'pending' NOT NULL,
  fulfillment_status fulfillment_status DEFAULT 'pending' NOT NULL,
  razorpay_payment_id TEXT,
  razorpay_order_id TEXT,
  tracking_number TEXT,
  tracking_carrier TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_fulfillment_status ON orders(fulfillment_status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- Order Items
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  variant_info JSONB,
  quantity INT NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  line_total NUMERIC(10,2) NOT NULL
);

CREATE INDEX idx_order_items_order ON order_items(order_id);

-- Order Timeline
CREATE TABLE order_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_order_timeline_order ON order_timeline(order_id);

-- Reviews
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- Coupons
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  type coupon_type NOT NULL,
  value NUMERIC(10,2) NOT NULL,
  min_order_amount NUMERIC(10,2) DEFAULT 0,
  usage_limit INT,
  per_customer_limit INT DEFAULT 1,
  times_used INT DEFAULT 0,
  valid_from TIMESTAMPTZ,
  valid_to TIMESTAMPTZ,
  applicable_products UUID[],
  applicable_categories UUID[],
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_coupons_code ON coupons(code);

-- Booking Requests (Atelier Bespoke & Archival Reservations)
CREATE TABLE booking_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  service_type TEXT NOT NULL,
  service_title TEXT NOT NULL,
  preferred_date TEXT NOT NULL,
  preferred_time TEXT NOT NULL,
  guests_count INT DEFAULT 1,
  special_requirements TEXT,
  order_id TEXT,
  items_summary TEXT,
  total_amount NUMERIC(12,2),
  status TEXT DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_booking_requests_user ON booking_requests(user_id);
CREATE INDEX idx_booking_requests_status ON booking_requests(status);

-- Newsletter Subscribers
CREATE TABLE subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Hero Slides
CREATE TABLE hero_slides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  heading TEXT,
  subheading TEXT,
  cta_text TEXT DEFAULT 'Shop Now',
  cta_link TEXT DEFAULT '/products',
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- Wishlist
CREATE TABLE wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, product_id)
);

CREATE INDEX idx_wishlist_user ON wishlist(user_id);

-- Media Library
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  filename TEXT NOT NULL,
  size INT,
  mime_type TEXT,
  uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Shipping Methods
CREATE TABLE shipping_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  estimated_delivery TEXT,
  free_shipping_threshold NUMERIC(10,2),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0
);

-- Contact Form Submissions
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Testimonials
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name TEXT NOT NULL,
  author_title TEXT,
  content TEXT NOT NULL,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Social/Instagram Feed Images
CREATE TABLE social_feed_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  link_url TEXT,
  alt_text TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE
);

-- ============================================
-- 3. FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seo_settings_updated_at
  BEFORE UPDATE ON seo_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  next_num INT;
BEGIN
  SELECT COALESCE(MAX(
    CAST(REPLACE(order_number, 'ORD-', '') AS INT)
  ), 10000) + 1
  INTO next_num
  FROM orders
  WHERE order_number IS NOT NULL;
  
  NEW.order_number = 'ORD-' || next_num;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_order_number_trigger
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL)
  EXECUTE FUNCTION generate_order_number();

-- Decrement stock on order creation
CREATE OR REPLACE FUNCTION decrement_stock_on_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrement product stock
  UPDATE products
  SET stock_quantity = stock_quantity - NEW.quantity
  WHERE id = NEW.product_id
    AND track_inventory = TRUE;
  
  -- Decrement variant stock if applicable
  IF NEW.variant_id IS NOT NULL THEN
    UPDATE product_variants
    SET stock_quantity = stock_quantity - NEW.quantity
    WHERE id = NEW.variant_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER decrement_stock_trigger
  AFTER INSERT ON order_items
  FOR EACH ROW EXECUTE FUNCTION decrement_stock_on_order();

-- Increment coupon usage on order with coupon
CREATE OR REPLACE FUNCTION increment_coupon_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.coupon_code IS NOT NULL THEN
    UPDATE coupons
    SET times_used = times_used + 1
    WHERE code = NEW.coupon_code;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER increment_coupon_usage_trigger
  AFTER INSERT ON orders
  FOR EACH ROW EXECUTE FUNCTION increment_coupon_usage();

-- Auto-create profile on user sign-up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add order timeline entry on status change
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.fulfillment_status IS DISTINCT FROM NEW.fulfillment_status THEN
    INSERT INTO order_timeline (order_id, status, note)
    VALUES (NEW.id, NEW.fulfillment_status::TEXT, 
      'Status changed from ' || OLD.fulfillment_status::TEXT || ' to ' || NEW.fulfillment_status::TEXT);
  END IF;
  
  IF OLD.payment_status IS DISTINCT FROM NEW.payment_status THEN
    INSERT INTO order_timeline (order_id, status, note)
    VALUES (NEW.id, 'payment_' || NEW.payment_status::TEXT,
      'Payment status changed to ' || NEW.payment_status::TEXT);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER log_order_status_change_trigger
  AFTER UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION log_order_status_change();

-- ============================================
-- 4. ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_seo ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_feed_images ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- === PROFILES ===
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (is_admin());

-- === SITE SETTINGS (public read, admin write) ===
CREATE POLICY "Anyone can read site settings" ON site_settings
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can update site settings" ON site_settings
  FOR UPDATE USING (is_admin());

CREATE POLICY "Admins can insert site settings" ON site_settings
  FOR INSERT WITH CHECK (is_admin());

-- === SEO SETTINGS (public read, admin write) ===
CREATE POLICY "Anyone can read SEO settings" ON seo_settings
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage SEO settings" ON seo_settings
  FOR ALL USING (is_admin());

-- === PAGE SEO (public read, admin write) ===
CREATE POLICY "Anyone can read page SEO" ON page_seo
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage page SEO" ON page_seo
  FOR ALL USING (is_admin());

-- === CATEGORIES (public read, admin write) ===
CREATE POLICY "Anyone can read categories" ON categories
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (is_admin());

-- === PRODUCTS (public read active, admin all) ===
CREATE POLICY "Anyone can read active products" ON products
  FOR SELECT USING (status = 'active' OR is_admin());

CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (is_admin());

-- === PRODUCT IMAGES (public read, admin write) ===
CREATE POLICY "Anyone can read product images" ON product_images
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage product images" ON product_images
  FOR ALL USING (is_admin());

-- === PRODUCT OPTIONS (public read, admin write) ===
CREATE POLICY "Anyone can read product options" ON product_options
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage product options" ON product_options
  FOR ALL USING (is_admin());

-- === PRODUCT OPTION VALUES (public read, admin write) ===
CREATE POLICY "Anyone can read option values" ON product_option_values
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage option values" ON product_option_values
  FOR ALL USING (is_admin());

-- === PRODUCT VARIANTS (public read, admin write) ===
CREATE POLICY "Anyone can read product variants" ON product_variants
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage product variants" ON product_variants
  FOR ALL USING (is_admin());

-- === ADDRESSES (own only) ===
CREATE POLICY "Users can manage own addresses" ON addresses
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all addresses" ON addresses
  FOR SELECT USING (is_admin());

-- === ORDERS ===
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all orders" ON orders
  FOR ALL USING (is_admin());

-- === ORDER ITEMS ===
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

CREATE POLICY "Users can create order items" ON order_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

CREATE POLICY "Admins can manage all order items" ON order_items
  FOR ALL USING (is_admin());

-- === ORDER TIMELINE ===
CREATE POLICY "Users can view own order timeline" ON order_timeline
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_timeline.order_id AND orders.user_id = auth.uid())
  );

CREATE POLICY "Admins can manage order timeline" ON order_timeline
  FOR ALL USING (is_admin());

-- === REVIEWS (public read, auth create, admin delete) ===
CREATE POLICY "Anyone can read reviews" ON reviews
  FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews" ON reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reviews" ON reviews
  FOR ALL USING (is_admin());

-- === COUPONS (public read active, admin manage) ===
CREATE POLICY "Anyone can read active coupons" ON coupons
  FOR SELECT USING (is_active = TRUE OR is_admin());

CREATE POLICY "Admins can manage coupons" ON coupons
  FOR ALL USING (is_admin());

-- === SUBSCRIBERS ===
CREATE POLICY "Anyone can subscribe" ON subscribers
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admins can view subscribers" ON subscribers
  FOR SELECT USING (is_admin());

-- === HERO SLIDES (public read active, admin manage) ===
CREATE POLICY "Anyone can read active hero slides" ON hero_slides
  FOR SELECT USING (is_active = TRUE OR is_admin());

CREATE POLICY "Admins can manage hero slides" ON hero_slides
  FOR ALL USING (is_admin());

-- === WISHLIST (own only) ===
CREATE POLICY "Users can manage own wishlist" ON wishlist
  FOR ALL USING (auth.uid() = user_id);

-- === MEDIA (admin only) ===
CREATE POLICY "Anyone can read media" ON media
  FOR SELECT USING (TRUE);

CREATE POLICY "Admins can manage media" ON media
  FOR ALL USING (is_admin());

-- === SHIPPING METHODS (public read, admin write) ===
CREATE POLICY "Anyone can read shipping methods" ON shipping_methods
  FOR SELECT USING (is_active = TRUE OR is_admin());

CREATE POLICY "Admins can manage shipping methods" ON shipping_methods
  FOR ALL USING (is_admin());

-- === CONTACT SUBMISSIONS ===
CREATE POLICY "Anyone can submit contact form" ON contact_submissions
  FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admins can manage contact submissions" ON contact_submissions
  FOR ALL USING (is_admin());

-- === TESTIMONIALS (public read, admin write) ===
CREATE POLICY "Anyone can read active testimonials" ON testimonials
  FOR SELECT USING (is_active = TRUE OR is_admin());

CREATE POLICY "Admins can manage testimonials" ON testimonials
  FOR ALL USING (is_admin());

-- === SOCIAL FEED IMAGES (public read, admin write) ===
CREATE POLICY "Anyone can read active social images" ON social_feed_images
  FOR SELECT USING (is_active = TRUE OR is_admin());

CREATE POLICY "Admins can manage social images" ON social_feed_images
  FOR ALL USING (is_admin());

-- ============================================
-- 5. STORAGE BUCKETS
-- ============================================

INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', TRUE);
INSERT INTO storage.buckets (id, name, public) VALUES ('brand-assets', 'brand-assets', TRUE);
INSERT INTO storage.buckets (id, name, public) VALUES ('media-library', 'media-library', TRUE);
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', FALSE);

-- Storage Policies
-- Product Images: public read, admin write
CREATE POLICY "Public read product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admins write product images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND is_admin());

CREATE POLICY "Admins update product images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images' AND is_admin());

CREATE POLICY "Admins delete product images" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images' AND is_admin());

-- Brand Assets: public read, admin write
CREATE POLICY "Public read brand assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'brand-assets');

CREATE POLICY "Admins write brand assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'brand-assets' AND is_admin());

CREATE POLICY "Admins update brand assets" ON storage.objects
  FOR UPDATE USING (bucket_id = 'brand-assets' AND is_admin());

CREATE POLICY "Admins delete brand assets" ON storage.objects
  FOR DELETE USING (bucket_id = 'brand-assets' AND is_admin());

-- Media Library: public read, admin write
CREATE POLICY "Public read media library" ON storage.objects
  FOR SELECT USING (bucket_id = 'media-library');

CREATE POLICY "Admins write media library" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'media-library' AND is_admin());

CREATE POLICY "Admins update media library" ON storage.objects
  FOR UPDATE USING (bucket_id = 'media-library' AND is_admin());

CREATE POLICY "Admins delete media library" ON storage.objects
  FOR DELETE USING (bucket_id = 'media-library' AND is_admin());

-- Avatars: authenticated read/write own folder
CREATE POLICY "Users read own avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars' AND auth.uid()::TEXT = (storage.foldername(name))[1]);

CREATE POLICY "Users write own avatars" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::TEXT = (storage.foldername(name))[1]);

CREATE POLICY "Users update own avatars" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::TEXT = (storage.foldername(name))[1]);

CREATE POLICY "Users delete own avatars" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::TEXT = (storage.foldername(name))[1]);

-- ============================================
-- 6. SEED DATA (Default Settings)
-- ============================================

-- Insert default site settings
INSERT INTO site_settings (site_name, tagline, currency_code, currency_symbol, tax_rate, tax_inclusive)
VALUES ('Ceylon Times', 'Sovereign Sri Lankan Heritage Atelier', 'LKR', 'Rs.', 18.00, FALSE);

-- Insert default SEO settings
INSERT INTO seo_settings (meta_title_template, default_meta_description)
VALUES ('{Page Title} | Ceylon Times', 'Discover certified Ratnapura sapphires, Kandyan handlooms, and sacred Sri Lankan heritage collections at Ceylon Times. Complimentary delivery on orders above Rs. 7,500.');

-- Insert default shipping methods
INSERT INTO shipping_methods (name, price, estimated_delivery, free_shipping_threshold, is_active, sort_order)
VALUES
  ('Island Standard Registered Courier', 350.00, '3-5 business days', 7500.00, TRUE, 1),
  ('Priority Island Courier Express', 750.00, '24-48 hours', NULL, TRUE, 2);

-- Insert sample hero slides
INSERT INTO hero_slides (image_url, heading, subheading, cta_text, cta_link, sort_order, is_active)
VALUES
  ('/images/hero-1.jpg', 'The New Collection', 'Discover pieces designed for the modern lifestyle', 'Shop Now', '/products', 1, TRUE),
  ('/images/hero-2.jpg', 'Timeless Elegance', 'Handcrafted with precision and care', 'Explore', '/products?category=new-arrivals', 2, TRUE),
  ('/images/hero-3.jpg', 'Summer Essentials', 'Light, breathable, and effortlessly stylish', 'Shop Collection', '/products?category=summer', 3, TRUE);
