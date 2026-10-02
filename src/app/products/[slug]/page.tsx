'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  Heart,
  ShoppingBag,
  Truck,
  RotateCcw,
  ShieldCheck,
  Award,
  ChevronRight,
  ChevronDown,
  Check,
  Plus,
  Minus,
  Sparkles,
  ArrowRight,
  Send,
  Share2,
  Gem,
  Zap,
} from 'lucide-react';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import { ProductCard } from '@/components/storefront/ProductCard';
import QuickViewModal from '@/components/storefront/QuickViewModal';
import { api } from '@/lib/store';
import { Product, Category, Review, SiteSettings } from '@/types';
import { defaultCategories, defaultSiteSettings } from '@/lib/seed-data';
import { formatPrice, calculateDiscountPercentage } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';

interface PageProps {
  params: { slug: string };
}

export default function ProductDetailPage({ params }: PageProps) {
  const { addItem, openCart } = useCart();
  const { success, error: toastError } = useToast();

  // Data states
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Gallery state
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Purchase states
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Accordion active states
  const [openAccordion, setOpenAccordion] = useState<string>('description');

  // Review Form state
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Fetch product data
  useEffect(() => {
    async function loadProductData() {
      setIsLoading(true);
      try {
        const [prod, cats, settings] = await Promise.all([
          api.getProductBySlug(params.slug),
          api.getCategories(),
          api.getSiteSettings(),
        ]);

        if (prod) {
          setProduct(prod);

          // Initialize default options
          if (prod.options && prod.options.length > 0) {
            const initialOpts: { [key: string]: string } = {};
            prod.options.forEach((opt) => {
              if (opt.values && opt.values.length > 0) {
                initialOpts[opt.name] = opt.values[0].value;
              }
            });
            setSelectedOptions(initialOpts);
          }

          // Fetch reviews for this product
          const revs = await api.getReviewsForProduct(prod.id);
          setReviews(revs);

          // Fetch related products in the same category
          const related = await api.getProducts({
            category: prod.category?.slug,
            limit: 4,
          });
          setRelatedProducts(related.filter((p) => p.id !== prod.id));
        }

        if (cats.length > 0) setCategories(cats);
        if (settings) setSiteSettings(settings);
      } catch (err) {
        console.error('Failed to load product detail:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadProductData();
  }, [params.slug]);

  const productCategory = useMemo(() => {
    if (!product || !product.category_id) return null;
    return categories.find((c) => c.id === product.category_id) || product.category || null;
  }, [product, categories]);

  const isSale = !!product && product.sale_price !== null && product.sale_price < product.price;
  const discountPct = isSale && product ? calculateDiscountPercentage(product.price, product.sale_price!) : 0;
  const inStock = !!product && (product.stock_quantity > 0 || product.allow_backorders);

  // Zoom handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    api.toggleWishlist(product.id);
    setIsWishlisted(!isWishlisted);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    if (!product) return;
    addItem(product, quantity, selectedOptions, e);
    success(`Secured ${quantity}x "${product.title}" in bag`);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    if (!product) return;
    addItem(product, quantity, selectedOptions, e);
    openCart();
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product?.title,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        success('Creation link copied to clipboard');
      }
    } catch (_err) {}
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!reviewTitle.trim() || !reviewBody.trim() || !reviewerName.trim()) {
      toastError('Please fill in all testimonial fields.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const newRev = await api.submitReview({
        product_id: product.id,
        user_name: reviewerName,
        rating: newRating,
        title: reviewTitle,
        body: reviewBody,
      });

      setReviews((prev) => [newRev, ...prev]);
      success('Your testimony has been preserved in the archives');
      setIsReviewFormOpen(false);
      setReviewTitle('');
      setReviewBody('');
      setReviewerName('');
    } catch (_err) {
      toastError('Failed to publish testimony');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Loading Skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#02030A] flex flex-col">
        <Header siteName={siteSettings.site_name} />
        <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 lg:px-16 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-[3/4] bg-yellow-500/10 rounded animate-pulse" />
            <div className="space-y-6">
              <div className="h-6 w-32 bg-yellow-500/15 rounded animate-pulse" />
              <div className="h-10 w-3/4 bg-yellow-500/10 rounded animate-pulse" />
              <div className="h-6 w-24 bg-yellow-500/20 rounded animate-pulse" />
              <div className="h-28 w-full bg-yellow-500/5 rounded animate-pulse" />
            </div>
          </div>
        </main>
        <Footer siteName={siteSettings.site_name} />
      </div>
    );
  }

  // Not Found State
  if (!product) {
    return (
      <div className="min-h-screen bg-[#02030A] flex flex-col text-[#E8E3D8]">
        <Header siteName={siteSettings.site_name} />
        <main className="flex-1 flex items-center justify-center py-24 px-6 text-center">
          <div
            className="max-w-md p-12 relative"
            style={{
              background: 'rgba(8, 12, 28, 0.85)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              boxShadow: '0 0 40px rgba(255, 215, 0, 0.1)',
            }}
          >
            <h1 className="font-serif text-3xl text-white mb-3">Masterwork Not Located</h1>
            <p className="text-xs text-[#E8E3D8]/65 leading-relaxed mb-6">
              The archive you are querying has been retired or does not exist in our current Ceylon treasury ledger.
            </p>
            <Link href="/products" className="btn-neon-gold text-xs inline-flex">
              <span>Explore Treasury</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </main>
        <Footer siteName={siteSettings.site_name} />
      </div>
    );
  }

  const images = product.images && product.images.length > 0
    ? product.images
    : [{ id: 'default', image_url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=1200&q=85', sort_order: 1 }];

  return (
    <div className="min-h-screen flex flex-col bg-[#02030A] text-[#E8E3D8] selection:bg-[#FFD700]/30 selection:text-[#FFD700]">
      <Header
        siteName={siteSettings.site_name}
        announcementText={siteSettings.announcement_bar_text}
        announcementActive={siteSettings.announcement_bar_active}
      />

      <main className="flex-1 relative">
        {/* Breadcrumb Bar */}
        <section
          className="py-3.5 px-6 lg:px-16"
          style={{
            background: 'rgba(4, 6, 16, 0.95)',
            borderBottom: '1px solid rgba(255, 215, 0, 0.15)',
          }}
        >
          <div className="max-w-[1440px] mx-auto flex items-center justify-between text-xs text-[#E8E3D8]/60 uppercase tracking-[0.18em]" style={{ fontFamily: 'var(--font-rajdhani)' }}>
            <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <Link href="/" className="hover:text-[#FFD700] transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0 text-[#FFD700]" />
              <Link href="/products" className="hover:text-[#FFD700] transition-colors">
                Treasury
              </Link>
              {productCategory && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0 text-[#00FFFF]" />
                  <Link
                    href={`/products?category=${productCategory.slug}`}
                    className="hover:text-[#00FFFF] transition-colors truncate max-w-[120px] sm:max-w-none text-[#00FFFF]"
                  >
                    {productCategory.name}
                  </Link>
                </>
              )}
              <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0 text-[#FFD700]" />
              <span className="text-[#FFD700] font-bold truncate max-w-[140px] sm:max-w-none">
                {product.title}
              </span>
            </nav>

            <button
              type="button"
              onClick={handleShare}
              className="hidden sm:inline-flex items-center gap-1.5 hover:text-[#00FFFF] transition-colors font-bold ml-4 shrink-0 cursor-pointer"
              aria-label="Share creation link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Dossier</span>
            </button>
          </div>
        </section>

        {/* Product Details Section */}
        <section className="max-w-[1440px] mx-auto px-6 lg:px-16 py-12 lg:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left Column: Image Gallery (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Main Feature Image Container */}
              <div
                className="relative aspect-[4/5] overflow-hidden group cursor-crosshair"
                style={{
                  background: '#04060E',
                  border: '1px solid rgba(255, 215, 0, 0.25)',
                  boxShadow: '0 0 35px rgba(255, 215, 0, 0.08), inset 0 0 20px rgba(0, 255, 255, 0.03)',
                  clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
                }}
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleMouseMove}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={images[activeImageIndex]?.image_url}
                    src={images[activeImageIndex]?.image_url}
                    alt={product.title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                    className="w-full h-full object-cover object-center transition-transform duration-200"
                    style={{
                      transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                      transform: isZoomed ? 'scale(1.8)' : 'scale(1)',
                    }}
                  />
                </AnimatePresence>

                {/* Cyber Corner Decors */}
                <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-[#FFD700] pointer-events-none z-20" />
                <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-[#00FFFF] pointer-events-none z-20" />

                {/* Overlaid Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
                  {product.tags?.includes('new-arrival') && (
                    <span
                      className="px-3 py-1 text-[#02030A] text-[10px] font-bold uppercase tracking-[0.18em]"
                      style={{
                        background: 'linear-gradient(135deg, #00FFFF, #00B4D8)',
                        boxShadow: '0 0 10px rgba(0,255,255,0.6)',
                        fontFamily: 'var(--font-rajdhani)',
                      }}
                    >
                      Ceylon New Release
                    </span>
                  )}
                  {isSale && (
                    <span
                      className="px-3 py-1 text-white text-[10px] font-bold uppercase tracking-[0.18em]"
                      style={{
                        background: 'linear-gradient(135deg, #FF2D55, #E60039)',
                        boxShadow: '0 0 10px rgba(255,45,85,0.6)',
                        fontFamily: 'var(--font-rajdhani)',
                      }}
                    >
                      Archival Privilege -{discountPct}%
                    </span>
                  )}
                  {!inStock && (
                    <span
                      className="px-3 py-1 text-white text-[10px] font-bold uppercase tracking-[0.18em] backdrop-blur-md"
                      style={{
                        background: 'rgba(0, 0, 0, 0.8)',
                        border: '1px solid rgba(255, 45, 85, 0.5)',
                        fontFamily: 'var(--font-rajdhani)',
                      }}
                    >
                      Archived Edition
                    </span>
                  )}
                </div>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  className="absolute top-4 right-4 p-3 rounded-sm backdrop-blur-md transition-all z-10 cursor-pointer"
                  style={{
                    background: isWishlisted ? 'rgba(255, 45, 85, 0.85)' : 'rgba(2, 3, 10, 0.75)',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    boxShadow: '0 0 15px rgba(0, 0, 0, 0.6)',
                  }}
                  aria-label="Toggle wishlist"
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-white text-white' : 'text-[#FFD700]'}`} />
                </button>

                {/* Image index counter */}
                <div
                  className="absolute bottom-4 right-4 px-2.5 py-1 text-white text-[11px] font-bold pointer-events-none"
                  style={{
                    background: 'rgba(2, 3, 10, 0.7)',
                    border: '1px solid rgba(255, 215, 0, 0.3)',
                    fontFamily: 'var(--font-rajdhani)',
                  }}
                >
                  {activeImageIndex + 1} / {images.length}
                </div>
              </div>

              {/* Thumbnails Row */}
              {images.length > 1 && (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {images.map((img, idx) => {
                    const isSelected = activeImageIndex === idx;
                    return (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`aspect-square overflow-hidden transition-all cursor-pointer ${
                          isSelected
                            ? 'border-2 border-[#FFD700] shadow-[0_0_12px_rgba(255,215,0,0.5)] scale-98'
                            : 'border border-yellow-500/20 opacity-60 hover:opacity-100'
                        }`}
                        style={{ background: '#04060E' }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img.image_url}
                          alt={`${product.title} thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Information & CTAs (5 Cols) */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                {/* Discipline Tag & SKU */}
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.2em] mb-2.5" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                  <span className="text-[#00FFFF] flex items-center gap-1.5" style={{ textShadow: '0 0 8px rgba(0,255,255,0.5)' }}>
                    <Sparkles className="w-3 h-3" />
                    {productCategory ? productCategory.name : 'Ceylon Master Atelier'}
                  </span>
                  <span className="text-[#E8E3D8]/50">SKU: {product.sku}</span>
                </div>

                {/* Product Title */}
                <h1
                  className="font-serif text-3xl sm:text-4xl text-white font-normal tracking-wide leading-tight mb-4"
                  style={{ textShadow: '0 2px 20px rgba(0,0,0,0.8)' }}
                >
                  {product.title}
                </h1>

                {/* Rating & Reviews Jump */}
                <div className="flex items-center gap-3 text-xs mb-6" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                  <div className="flex text-[#FFD700]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < Math.floor(product.rating || 5) ? 'fill-current' : 'opacity-30'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-[#FFD700]">
                    {product.rating ? product.rating.toFixed(1) : '5.0'}
                  </span>
                  <span className="text-[#E8E3D8]/40">&bull;</span>
                  <a
                    href="#reviews-section"
                    className="text-[#00FFFF] underline underline-offset-4 hover:text-white transition-colors font-bold"
                  >
                    {reviews.length || product.review_count || 14} Patron Testimonies
                  </a>
                </div>

                {/* Pricing Block in LKR */}
                <div className="flex items-baseline gap-4 pb-6 border-b border-yellow-500/15">
                  <span
                    className="font-serif text-3xl sm:text-4xl text-[#FFD700] font-bold tracking-tight"
                    style={{ textShadow: '0 0 15px rgba(255,215,0,0.5)' }}
                  >
                    {formatPrice(product.sale_price ?? product.price)}
                  </span>
                  {isSale && (
                    <span className="text-base text-[#E8E3D8]/40 line-through font-sans">
                      {formatPrice(product.price)}
                    </span>
                  )}
                  {isSale && (
                    <span
                      className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-[#FF2D55] border border-[#FF2D55]/40"
                      style={{ background: 'rgba(255,45,85,0.1)', fontFamily: 'var(--font-rajdhani)' }}
                    >
                      Save {discountPct}%
                    </span>
                  )}
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#00FFFF]/70" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    LKR · Island Tax Included
                  </span>
                </div>

                <p className="mt-2 text-[11px] text-[#E8E3D8]/60 font-sans">
                  Complimentary island-wide courier across Sri Lanka on orders over Rs. 7,500. DHL Worldwide air express available.
                </p>
              </div>

              {/* Dynamic Variant Options */}
              {product.options && product.options.length > 0 && (
                <div className="space-y-6 pt-2">
                  {product.options.map((opt) => (
                    <div key={opt.id}>
                      <div className="flex items-center justify-between mb-2.5">
                        <label className="text-xs font-bold uppercase tracking-[0.18em] text-[#FFD700]" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                          {opt.name}
                        </label>
                        <span className="text-xs text-[#E8E3D8]/60" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                          Selected:{' '}
                          <span className="font-bold text-white">
                            {selectedOptions[opt.name] || 'Select option'}
                          </span>
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2.5">
                        {opt.values?.map((val) => {
                          const isSelected = selectedOptions[opt.name] === val.value;
                          return (
                            <button
                              key={val.id}
                              type="button"
                              onClick={() =>
                                setSelectedOptions((prev) => ({
                                  ...prev,
                                  [opt.name]: val.value,
                                }))
                              }
                              className="px-4 py-2.5 text-xs transition-all flex items-center gap-2 cursor-pointer font-bold"
                              style={{
                                background: isSelected ? 'rgba(255, 215, 0, 0.25)' : 'rgba(8, 12, 28, 0.8)',
                                border: `1px solid ${isSelected ? '#FFD700' : 'rgba(255, 215, 0, 0.2)'}`,
                                color: isSelected ? '#FFFFFF' : '#E8E3D8',
                                boxShadow: isSelected ? '0 0 15px rgba(255, 215, 0, 0.4)' : 'none',
                                fontFamily: 'var(--font-rajdhani)',
                              }}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 text-[#FFD700]" />}
                              <span>{val.value}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity Selector & Stock Indicator */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-[0.18em] text-[#FFD700]" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    Quantity
                  </label>
                  <span className="text-xs font-bold flex items-center gap-1.5" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    {inStock ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-[#00FF88] shadow-[0_0_8px_rgba(0,255,136,0.8)] animate-pulse" />
                        <span className="text-[#00FF88]">
                          {product.stock_quantity < 10
                            ? `Only ${product.stock_quantity} creations in atelier vault`
                            : 'In Atelier Stock & Ready for Island Courier'}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-[#FF2D55]" />
                        <span className="text-[#FF2D55]">Currently Archived Edition</span>
                      </>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Styled Stepper */}
                  <div
                    className="inline-flex items-center"
                    style={{
                      background: 'rgba(8, 12, 28, 0.9)',
                      border: '1px solid rgba(255, 215, 0, 0.3)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      disabled={quantity <= 1 || !inStock}
                      className="p-3 text-[#E8E3D8] hover:text-[#FFD700] hover:bg-yellow-500/10 disabled:opacity-30 transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-5 text-xs font-bold text-white font-sans">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((prev) =>
                          Math.min(product.stock_quantity || 99, prev + 1)
                        )
                      }
                      disabled={quantity >= (product.stock_quantity || 99) || !inStock}
                      className="p-3 text-[#E8E3D8] hover:text-[#FFD700] hover:bg-yellow-500/10 disabled:opacity-30 transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Add to Bag 3D Neon Button */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!inStock}
                    className="flex-1 btn-neon-gold py-3.5 text-xs disabled:opacity-40"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{inStock ? 'Acquire Piece' : 'Vault Exhausted'}</span>
                  </button>
                </div>

                {/* Instant Checkout Button */}
                {inStock && (
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="w-full btn-neon-cyan py-3.5 text-xs flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Instant Galle Face Concierge Checkout</span>
                  </button>
                )}
              </div>

              {/* Trust Badges / Guarantees Grid */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-yellow-500/15 text-xs">
                <div
                  className="flex items-start gap-3 p-3.5"
                  style={{
                    background: 'rgba(8, 12, 28, 0.75)',
                    border: '1px solid rgba(255, 215, 0, 0.2)',
                  }}
                >
                  <Truck className="w-4 h-4 text-[#FFD700] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white" style={{ fontFamily: 'var(--font-rajdhani)' }}>Insured Island Courier</h4>
                    <p className="text-[11px] text-[#E8E3D8]/60 mt-0.5">Complimentary across Sri Lanka on Rs. 7,500+</p>
                  </div>
                </div>
                <div
                  className="flex items-start gap-3 p-3.5"
                  style={{
                    background: 'rgba(8, 12, 28, 0.75)',
                    border: '1px solid rgba(0, 255, 255, 0.2)',
                  }}
                >
                  <RotateCcw className="w-4 h-4 text-[#00FFFF] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white" style={{ fontFamily: 'var(--font-rajdhani)' }}>30-Day Atelier Guarantee</h4>
                    <p className="text-[11px] text-[#E8E3D8]/60 mt-0.5">Hassle-free exchange policy</p>
                  </div>
                </div>
                <div
                  className="flex items-start gap-3 p-3.5"
                  style={{
                    background: 'rgba(8, 12, 28, 0.75)',
                    border: '1px solid rgba(0, 255, 255, 0.2)',
                  }}
                >
                  <Award className="w-4 h-4 text-[#00FFFF] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white" style={{ fontFamily: 'var(--font-rajdhani)' }}>Ceylon Provenance Certificate</h4>
                    <p className="text-[11px] text-[#E8E3D8]/60 mt-0.5">Stamps of authenticity from Galle Fort &amp; Kandy</p>
                  </div>
                </div>
                <div
                  className="flex items-start gap-3 p-3.5"
                  style={{
                    background: 'rgba(8, 12, 28, 0.75)',
                    border: '1px solid rgba(255, 215, 0, 0.2)',
                  }}
                >
                  <ShieldCheck className="w-4 h-4 text-[#FFD700] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-white" style={{ fontFamily: 'var(--font-rajdhani)' }}>Artisan Care Warranty</h4>
                    <p className="text-[11px] text-[#E8E3D8]/60 mt-0.5">Lifetime craft support from Sri Lankan guilds</p>
                  </div>
                </div>
              </div>

              {/* Collapsible Accordion Tabs */}
              <div className="border-t border-yellow-500/15 pt-4 divide-y divide-yellow-500/15">
                {/* 1. Description & Craftsmanship */}
                <div className="py-4">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenAccordion(openAccordion === 'description' ? '' : 'description')
                    }
                    className="w-full flex items-center justify-between text-left text-xs font-bold uppercase tracking-[0.18em] text-[#FFD700] cursor-pointer"
                    style={{ fontFamily: 'var(--font-rajdhani)' }}
                  >
                    <span>Description &amp; Sri Lankan Provenance</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        openAccordion === 'description' ? 'rotate-180 text-[#00FFFF]' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {openAccordion === 'description' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div
                          className="pt-3 text-xs text-[#E8E3D8]/75 leading-relaxed space-y-3 font-sans prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: product.description }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 2. Specifications Table */}
                <div className="py-4">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenAccordion(openAccordion === 'specs' ? '' : 'specs')
                    }
                    className="w-full flex items-center justify-between text-left text-xs font-bold uppercase tracking-[0.18em] text-[#00FFFF] cursor-pointer"
                    style={{ fontFamily: 'var(--font-rajdhani)' }}
                  >
                    <span>Artisan Specifications &amp; Origin</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        openAccordion === 'specs' ? 'rotate-180 text-[#FFD700]' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {openAccordion === 'specs' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <table className="w-full mt-3 text-xs border border-yellow-500/20 divide-y divide-yellow-500/15">
                          <tbody>
                            <tr className="divide-x divide-yellow-500/15">
                              <td className="p-2.5 font-bold text-[#FFD700] w-1/3 bg-yellow-500/5" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                                Guild &amp; Origin
                              </td>
                              <td className="p-2.5 text-[#E8E3D8]/80 font-sans">
                                Handcrafted by Ceylon Heritage Artisans (Galle Fort &amp; Kandy, Sri Lanka)
                              </td>
                            </tr>
                            <tr className="divide-x divide-yellow-500/15">
                              <td className="p-2.5 font-bold text-[#FFD700] bg-yellow-500/5" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                                Primary Medium
                              </td>
                              <td className="p-2.5 text-[#E8E3D8]/80 font-sans">
                                Certified Ceylon Gemstones / Pure Kandyan Silk / Traditional Cast Brass
                              </td>
                            </tr>
                            <tr className="divide-x divide-yellow-500/15">
                              <td className="p-2.5 font-bold text-[#FFD700] bg-yellow-500/5" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                                Certification
                              </td>
                              <td className="p-2.5 text-[#E8E3D8]/80 font-sans">
                                Verified Ceylon Provenance Certificate with Artisan Stamped Seal
                              </td>
                            </tr>
                            <tr className="divide-x divide-yellow-500/15">
                              <td className="p-2.5 font-bold text-[#FFD700] bg-yellow-500/5" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                                Catalog SKU
                              </td>
                              <td className="p-2.5 text-[#E8E3D8]/80 font-sans">{product.sku}</td>
                            </tr>
                          </tbody>
                        </table>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 3. Shipping & Returns */}
                <div className="py-4">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenAccordion(openAccordion === 'shipping' ? '' : 'shipping')
                    }
                    className="w-full flex items-center justify-between text-left text-xs font-bold uppercase tracking-[0.18em] text-[#FFD700] cursor-pointer"
                    style={{ fontFamily: 'var(--font-rajdhani)' }}
                  >
                    <span>Island Delivery &amp; Global Air Express</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        openAccordion === 'shipping' ? 'rotate-180 text-[#00FFFF]' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {openAccordion === 'shipping' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p className="pt-3 text-xs text-[#E8E3D8]/75 leading-relaxed font-sans">
                          Dispatched in our signature Ceylon Times matte-black presentation casing with wax seal. Island deliveries take 2–4 business days via registered courier. Express Colombo same-day delivery available on special request. International courier delivers in 5–8 days worldwide with full tracking.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Reviews Section */}
        <section id="reviews-section" className="border-t border-yellow-500/15 py-20 px-6 lg:px-16 relative">
          <div className="max-w-[1440px] mx-auto">
            {/* Reviews Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-yellow-500/15 gap-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#00FFFF] block mb-2" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                  Patron Reflections &amp; Chronicles
                </span>
                <h2 className="font-serif text-3xl text-white font-normal tracking-wide">
                  Testimonies from Collectors
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
                className="btn-neon-gold text-xs self-start md:self-auto"
              >
                {isReviewFormOpen ? 'Close Form' : 'Submit Patron Testimony'}
              </button>
            </div>

            {/* Review Submission Form Modal / Expansion */}
            <AnimatePresence>
              {isReviewFormOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden my-8"
                >
                  <form
                    onSubmit={handleReviewSubmit}
                    className="p-8 max-w-2xl mx-auto space-y-5"
                    style={{
                      background: 'rgba(8, 12, 28, 0.95)',
                      border: '1px solid rgba(255, 215, 0, 0.3)',
                      boxShadow: '0 0 30px rgba(0, 0, 0, 0.8)',
                    }}
                  >
                    <h3 className="font-serif text-xl text-white font-medium">
                      Record Your Ceylon Patron Experience
                    </h3>

                    {/* Star Rating Picker */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-[0.18em] text-[#FFD700] mb-2" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                        Rating
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            className="p-1 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= newRating
                                  ? 'text-[#FFD700] fill-current drop-shadow-[0_0_6px_rgba(255,215,0,0.8)]'
                                  : 'text-white/20'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-xs font-bold text-white" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                          {newRating} of 5 Stars
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-[0.18em] text-[#00FFFF] mb-1.5" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                          Your Name
                        </label>
                        <input
                          type="text"
                          required
                          value={reviewerName}
                          onChange={(e) => setReviewerName(e.target.value)}
                          placeholder="e.g. Kasun Fernando"
                          className="w-full p-2.5 text-xs text-[#E8E3D8] placeholder:text-[#E8E3D8]/30 focus:outline-none"
                          style={{
                            background: 'rgba(2, 3, 10, 0.8)',
                            border: '1px solid rgba(255, 215, 0, 0.25)',
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-[0.18em] text-[#00FFFF] mb-1.5" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                          Testimony Title
                        </label>
                        <input
                          type="text"
                          required
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          placeholder="e.g. Breathtaking gem clarity"
                          className="w-full p-2.5 text-xs text-[#E8E3D8] placeholder:text-[#E8E3D8]/30 focus:outline-none"
                          style={{
                            background: 'rgba(2, 3, 10, 0.8)',
                            border: '1px solid rgba(255, 215, 0, 0.25)',
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-[0.18em] text-[#FFD700] mb-1.5" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                        Detailed Reflection
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={reviewBody}
                        onChange={(e) => setReviewBody(e.target.value)}
                        placeholder="Describe your impression of the Sri Lankan craftsmanship, material authenticity, and unboxing..."
                        className="w-full p-2.5 text-xs text-[#E8E3D8] placeholder:text-[#E8E3D8]/30 focus:outline-none"
                        style={{
                          background: 'rgba(2, 3, 10, 0.8)',
                          border: '1px solid rgba(255, 215, 0, 0.25)',
                        }}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="btn-neon-gold text-xs px-6 py-3 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmittingReview ? 'Inscribing...' : 'Inscribe Testimony'}</span>
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Overall Breakdown and Reviews List */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-10">
              {/* Rating Summary Breakdown (4 Cols) */}
              <div
                className="lg:col-span-4 p-8 h-fit space-y-6"
                style={{
                  background: 'rgba(8, 12, 28, 0.75)',
                  border: '1px solid rgba(255, 215, 0, 0.2)',
                  clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
                }}
              >
                <div className="text-center pb-6 border-b border-yellow-500/15">
                  <div
                    className="font-serif text-5xl text-[#FFD700] font-bold mb-2"
                    style={{ textShadow: '0 0 15px rgba(255,215,0,0.5)' }}
                  >
                    {product.rating ? product.rating.toFixed(1) : '5.0'}
                  </div>
                  <div className="flex justify-center text-[#FFD700] mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating || 5) ? 'fill-current' : 'opacity-30'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-[#E8E3D8]/60" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    Based on {reviews.length || product.review_count || 14} verified patron reviews
                  </span>
                </div>

                {/* Rating Distribution Bars */}
                <div className="space-y-2 text-xs" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = reviews.filter((r) => r.rating === stars).length;
                    const pct = reviews.length > 0 ? (count / reviews.length) * 100 : stars === 5 ? 85 : 15;
                    return (
                      <div key={stars} className="flex items-center gap-3">
                        <span className="w-10 text-right text-[#E8E3D8]/60 font-bold">{stars} Star</span>
                        <div className="flex-1 h-1.5 bg-yellow-500/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#FFD700] to-[#00FFFF]"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-8 text-right text-[#E8E3D8]/50">{count || (stars === 5 ? 12 : 2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews List (8 Cols) */}
              <div className="lg:col-span-8 space-y-6">
                {reviews.length === 0 ? (
                  <div className="py-12 text-center text-xs text-[#E8E3D8]/60" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    No testimonies have been recorded for this creation yet. Be the first patron to inscribe your review.
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-6 transition-all duration-300"
                      style={{
                        background: 'rgba(8, 12, 28, 0.7)',
                        border: '1px solid rgba(255, 215, 0, 0.15)',
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1 text-[#FFD700]">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? 'fill-current' : 'opacity-20'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] text-[#00FF88] flex items-center gap-1 uppercase tracking-wider font-bold" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                          <ShieldCheck className="w-3.5 h-3.5" /> Verified Collector
                        </span>
                      </div>

                      <h4 className="font-serif text-base text-white mb-1.5 font-bold">
                        {rev.title}
                      </h4>
                      <p className="text-xs text-[#E8E3D8]/70 leading-relaxed font-sans mb-4">
                        {rev.body}
                      </p>

                      <div className="flex items-center justify-between text-xs text-[#E8E3D8]/50 pt-3 border-t border-yellow-500/10" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                        <span className="font-bold text-white">{rev.user_name || (rev as unknown as { reviewer_name?: string }).reviewer_name || 'Ceylon Patron'}</span>
                        <span>{new Date(rev.created_at).toLocaleDateString('en-LK', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Related Artifacts Section */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-yellow-500/15 py-20 px-6 lg:px-16">
            <div className="max-w-[1440px] mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 pb-5 border-b border-yellow-500/15">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#00FFFF] block mb-2" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    Harmonious Creations
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl text-white font-normal tracking-wide">
                    Complementary Pieces
                  </h2>
                </div>
                <Link
                  href={`/products?category=${productCategory?.slug || 'all'}`}
                  className="mt-4 sm:mt-0 text-xs font-bold uppercase tracking-[0.15em] text-[#FFD700] hover:text-white transition-colors flex items-center gap-1.5"
                  style={{ fontFamily: 'var(--font-rajdhani)' }}
                >
                  <span>Explore Guild</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onQuickView={(prod) => setQuickViewProduct(prod)}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

      <Footer
        siteName={siteSettings.site_name}
        tagline={siteSettings.tagline}
      />
    </div>
  );
}
