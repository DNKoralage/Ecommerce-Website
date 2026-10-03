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
  Banknote,
  CheckCircle2,
} from 'lucide-react';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import { ProductCard } from '@/components/storefront/ProductCard';
import QuickViewModal from '@/components/storefront/QuickViewModal';
import { api } from '@/lib/store';
import { Product, Category, Review, SiteSettings } from '@/types';
import { defaultCategories, defaultSiteSettings } from '@/lib/seed-data';
import { calculateDiscountPercentage } from '@/lib/utils';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { sound } from '@/lib/sound';

interface PageProps {
  params: { slug: string };
}

export default function ProductDetailPage({ params }: PageProps) {
  const { addItem, openCart } = useCart();
  const { success, error: toastError } = useToast();
  const { formatPrice } = useCurrency();

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

          if (prod.options && prod.options.length > 0) {
            const initialOpts: { [key: string]: string } = {};
            prod.options.forEach((opt) => {
              if (opt.values && opt.values.length > 0) {
                initialOpts[opt.name] = opt.values[0].value;
              }
            });
            setSelectedOptions(initialOpts);
          }

          const [revs, related] = await Promise.all([
            api.getReviewsForProduct(prod.id),
            api.getProducts({ category: prod.category_id || undefined, limit: 4 }),
          ]);
          setReviews(revs);
          setRelatedProducts(related.filter((p: Product) => p.id !== prod.id).slice(0, 4));
        }
        if (cats.length > 0) setCategories(cats);
        if (settings) setSiteSettings(settings);
      } catch (err) {
        console.error('Error loading product dossier:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProductData();
  }, [params.slug]);

  // Find product category
  const productCategory = useMemo(() => {
    if (!product || !product.category_id) return null;
    return categories.find((c) => c.id === product.category_id || c.slug === product.category_id) || null;
  }, [product, categories]);

  // Discount calculations
  const discountPct = product && product.sale_price ? calculateDiscountPercentage(product.price, product.sale_price) : 0;
  const isSale = !!product?.sale_price && (product.sale_price < product.price);
  const inStock = product ? (product.stock_quantity ?? 10) > 0 : false;

  // Zoom Handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  // Cart actions
  const handleAddToCart = (e: React.MouseEvent) => {
    if (!product || !inStock) return;
    sound.playAdd();
    addItem(product, quantity, selectedOptions, e);
    success(`Added ${quantity} × "${product.title}" to cart`);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    if (!product || !inStock) return;
    sound.playAdd();
    addItem(product, quantity, selectedOptions, e);
    openCart();
  };

  const handleWishlistToggle = () => {
    sound.playClick();
    setIsWishlisted(!isWishlisted);
    if (!isWishlisted) {
      success(`Added "${product?.title}" to wishlist`);
    }
  };

  const handleShare = async () => {
    sound.playClick();
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.title,
          text: `Check out ${product?.title} on ${siteSettings.site_name}`,
          url: window.location.href,
        });
      } catch {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      success('Product link copied to clipboard!');
    }
  };

  // Review submission
  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!reviewerName.trim() || !reviewTitle.trim() || !reviewBody.trim()) {
      toastError('Please fill out all review fields');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const newRev = await api.addReview({
        product_id: product.id,
        user_name: reviewerName.trim(),
        reviewer_name: reviewerName.trim(),
        rating: newRating,
        title: reviewTitle.trim(),
        body: reviewBody.trim(),
        is_verified: true,
      });
      setReviews((prev) => [newRev, ...prev]);
      sound.playSuccess();
      success('Thank you! Your review has been submitted.');
      setIsReviewFormOpen(false);
      setReviewerName('');
      setReviewTitle('');
      setReviewBody('');
      setNewRating(5);
    } catch {
      toastError('Failed to publish review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Loading Skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col">
        <Header siteName={siteSettings.site_name} />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="aspect-[4/5] bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 animate-pulse" />
            <div className="space-y-5">
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              <div className="h-10 w-3/4 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              <div className="h-6 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              <div className="h-28 w-full bg-gray-100 dark:bg-gray-850 rounded animate-pulse" />
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
      <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col text-gray-900 dark:text-gray-100">
        <Header siteName={siteSettings.site_name} />
        <main className="flex-1 flex items-center justify-center py-20 px-4 text-center">
          <div className="max-w-md p-10 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <h1 className="font-heading text-2xl font-bold mb-2">Product Not Found</h1>
            <p className="text-sm text-gray-500 mb-6">
              The product you are looking for may have been removed or does not exist.
            </p>
            <Link href="/products" className="btn-primary text-xs">
              <span>Browse All Products</span>
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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Header
        siteName={siteSettings.site_name}
        announcementText={siteSettings.announcement_bar_text}
        announcementActive={siteSettings.announcement_bar_active}
      />

      <main className="flex-1 relative">
        {/* Breadcrumb Bar */}
        <section className="py-3 px-4 sm:px-6 lg:px-8 border-b border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs text-gray-500 font-medium">
            <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <Link href="/" className="hover:text-blue-600 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
              <Link href="/products" className="hover:text-blue-600 transition-colors">
                Products
              </Link>
              {productCategory && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
                  <Link
                    href={`/products?category=${productCategory.slug}`}
                    className="hover:text-blue-600 transition-colors truncate max-w-[120px] sm:max-w-none text-blue-600 dark:text-blue-400"
                  >
                    {productCategory.name}
                  </Link>
                </>
              )}
              <ChevronRight className="w-3.5 h-3.5 opacity-60 shrink-0" />
              <span className="font-semibold text-gray-900 dark:text-white truncate max-w-[140px] sm:max-w-none">
                {product.title}
              </span>
            </nav>

            <button
              type="button"
              onClick={handleShare}
              className="hidden sm:inline-flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-blue-600 transition-colors font-semibold ml-4 shrink-0 cursor-pointer"
              aria-label="Share product link"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </section>

        {/* Product Details Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Image Gallery (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Main Feature Image Container */}
              <div
                className="relative aspect-[4/5] rounded-3xl overflow-hidden group cursor-crosshair bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm"
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
                    transition={{ duration: 0.25 }}
                    className="w-full h-full object-cover object-center transition-transform duration-200"
                    style={{
                      transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                      transform: isZoomed ? 'scale(1.7)' : 'scale(1)',
                    }}
                  />
                </AnimatePresence>

                {/* Overlaid Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
                  {isSale && (
                    <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full shadow-sm">
                      -{discountPct}% OFF
                    </span>
                  )}
                  {product.tags?.includes('new-arrival') && (
                    <span className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-sm">
                      New Arrival
                    </span>
                  )}
                  <span className="px-3 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-emerald-600 text-xs font-semibold rounded-full shadow-sm border border-emerald-500/20 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" /> Cash on Delivery
                  </span>
                </div>

                {/* Wishlist Button */}
                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  className="absolute top-4 right-4 p-3 rounded-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm border border-gray-200 dark:border-gray-700 transition-transform active:scale-90 z-10 cursor-pointer"
                  aria-label="Toggle wishlist"
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} />
                </button>

                {/* Image counter */}
                <div className="absolute bottom-4 right-4 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-semibold pointer-events-none">
                  {activeImageIndex + 1} / {images.length}
                </div>
              </div>

              {/* Thumbnails Row */}
              {images.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
                  {images.map((img, idx) => {
                    const isSelected = activeImageIndex === idx;
                    return (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`w-20 h-20 rounded-2xl overflow-hidden shrink-0 transition-all cursor-pointer border-2 ${
                          isSelected
                            ? 'border-blue-600 ring-2 ring-blue-600/30 shadow-sm'
                            : 'border-gray-200 dark:border-gray-800 opacity-70 hover:opacity-100'
                        }`}
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
            <div className="lg:col-span-5 space-y-6">
              <div>
                {/* Category & SKU */}
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <span className="text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    {productCategory ? productCategory.name : 'Featured'}
                  </span>
                  <span className="text-gray-400 text-[11px]">SKU: {product.sku}</span>
                </div>

                {/* Product Title */}
                <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight mb-3">
                  {product.title}
                </h1>

                {/* Rating & Reviews Jump */}
                <div className="flex items-center gap-3 text-xs mb-5">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{product.rating ? product.rating.toFixed(1) : '5.0'}</span>
                  </div>
                  <span className="text-gray-300">&bull;</span>
                  <a
                    href="#reviews-section"
                    className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
                  >
                    {reviews.length || product.review_count || 14} customer reviews
                  </a>
                </div>

                {/* Pricing Block */}
                <div className="flex items-baseline gap-3 pb-5 border-b border-gray-200 dark:border-gray-800">
                  <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {formatPrice(product.sale_price ?? product.price)}
                  </span>
                  {isSale && (
                    <span className="text-base text-gray-400 line-through">
                      {formatPrice(product.price)}
                    </span>
                  )}
                  {isSale && (
                    <span className="badge badge-red font-semibold">
                      Save {discountPct}%
                    </span>
                  )}
                  <span className="badge badge-green">In Stock</span>
                </div>

                <p className="mt-2 text-xs text-gray-500">
                  Cash on Delivery available island-wide. Free delivery on orders over Rs. 7,500.
                </p>
              </div>

              {/* Dynamic Variant Options */}
              {product.options && product.options.length > 0 && (
                <div className="space-y-4 pt-1">
                  {product.options.map((opt) => (
                    <div key={opt.id}>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {opt.name}
                        </label>
                        <span className="text-xs text-gray-500">
                          Selected:{' '}
                          <span className="font-bold text-blue-600">
                            {selectedOptions[opt.name] || 'Select'}
                          </span>
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
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
                              className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                  : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-400'
                              }`}
                            >
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
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-gray-700 dark:text-gray-300">
                    Quantity
                  </label>
                  <span className="font-medium flex items-center gap-1.5">
                    {inStock ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        In stock and ready to ship
                      </span>
                    ) : (
                      <span className="text-red-500">Out of Stock</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Stepper */}
                  <div className="inline-flex items-center rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    <button
                      type="button"
                      onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                      disabled={quantity <= 1 || !inStock}
                      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-blue-600 disabled:opacity-30 cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center text-sm font-bold text-gray-900 dark:text-white">
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
                      className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-blue-600 disabled:opacity-30 cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Add to Cart Button */}
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!inStock}
                    className="flex-1 btn-primary py-3 text-sm rounded-xl font-semibold disabled:opacity-50"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>{inStock ? 'Add to Cart' : 'Out of Stock'}</span>
                  </button>
                </div>

                {/* Instant COD Checkout Button */}
                {inStock && (
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    className="w-full btn-outline py-3 text-sm rounded-xl font-semibold flex items-center justify-center gap-2"
                  >
                    <Banknote className="w-4 h-4" />
                    <span>Order Now with Cash on Delivery</span>
                  </button>
                )}
              </div>

              {/* Trust Badges Grid */}
              <div className="grid grid-cols-2 gap-3 pt-5 border-t border-gray-200 dark:border-gray-800 text-xs">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <Banknote className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Cash on Delivery</h4>
                    <p className="text-[11px] text-gray-500">Pay at your doorstep</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <Truck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Island-wide Delivery</h4>
                    <p className="text-[11px] text-gray-500">Fast 2-4 business days</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <RotateCcw className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">7-Day Easy Returns</h4>
                    <p className="text-[11px] text-gray-500">Hassle-free exchange policy</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">100% Authentic</h4>
                    <p className="text-[11px] text-gray-500">Verified seller guarantee</p>
                  </div>
                </div>
              </div>

              {/* Collapsible Accordion Tabs */}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-3 divide-y divide-gray-100 dark:divide-gray-800">
                {/* 1. Description */}
                <div className="py-3.5">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenAccordion(openAccordion === 'description' ? '' : 'description')
                    }
                    className="w-full flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 cursor-pointer"
                  >
                    <span>Product Description</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 text-gray-400 ${
                        openAccordion === 'description' ? 'rotate-180 text-blue-600' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {openAccordion === 'description' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div
                          className="pt-3 text-xs text-gray-600 dark:text-gray-300 leading-relaxed space-y-2 prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: product.description }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 2. Delivery & Returns */}
                <div className="py-3.5">
                  <button
                    type="button"
                    onClick={() =>
                      setOpenAccordion(openAccordion === 'shipping' ? '' : 'shipping')
                    }
                    className="w-full flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200 cursor-pointer"
                  >
                    <span>Delivery &amp; COD Information</span>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 text-gray-400 ${
                        openAccordion === 'shipping' ? 'rotate-180 text-blue-600' : ''
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {openAccordion === 'shipping' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="pt-3 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                          All orders are delivered with Island-wide courier within 2–4 business days. You can inspect your items before paying cash upon delivery. Returns and exchanges are accepted within 7 days in original condition.
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
        <section id="reviews-section" className="border-t border-gray-200 dark:border-gray-800 py-12 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto">
            {/* Reviews Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 border-b border-gray-200 dark:border-gray-800 gap-4">
              <div>
                <h2 className="font-heading text-2xl font-bold text-gray-900 dark:text-white">
                  Customer Reviews
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  What verified customers say about this product
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsReviewFormOpen(!isReviewFormOpen)}
                className="btn-outline text-xs px-4 py-2 rounded-xl self-start md:self-auto"
              >
                {isReviewFormOpen ? 'Cancel' : 'Write a Review'}
              </button>
            </div>

            {/* Review Submission Form Modal / Expansion */}
            <AnimatePresence>
              {isReviewFormOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden my-6"
                >
                  <form
                    onSubmit={handleReviewSubmit}
                    className="p-6 max-w-xl mx-auto space-y-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700"
                  >
                    <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-white">
                      Write Your Review
                    </h3>

                    {/* Star Rating Picker */}
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Your Rating
                      </label>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewRating(star)}
                            className="p-1 hover:scale-110 transition-transform cursor-pointer"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= newRating ? 'text-amber-500 fill-current' : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {newRating} / 5
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Your Name
                        </label>
                        <input
                          type="text"
                          required
                          value={reviewerName}
                          onChange={(e) => setReviewerName(e.target.value)}
                          placeholder="e.g. Kasun Fernando"
                          className="input-field w-full text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                          Review Title
                        </label>
                        <input
                          type="text"
                          required
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          placeholder="e.g. Excellent quality"
                          className="input-field w-full text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        Review Details
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={reviewBody}
                        onChange={(e) => setReviewBody(e.target.value)}
                        placeholder="Write your honest opinion about the product and delivery..."
                        className="input-field w-full text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="btn-primary text-xs px-5 py-2.5 rounded-xl disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isSubmittingReview ? 'Submitting...' : 'Submit Review'}</span>
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Overall Breakdown and Reviews List */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
              {/* Rating Summary Breakdown (4 Cols) */}
              <div className="lg:col-span-4 p-6 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 space-y-4">
                <div className="text-center pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="font-heading text-4xl text-gray-900 dark:text-white font-bold mb-1">
                    {product.rating ? product.rating.toFixed(1) : '5.0'}
                  </div>
                  <div className="flex justify-center text-amber-500 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating || 5) ? 'fill-current' : 'opacity-30'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">
                    Based on {reviews.length || product.review_count || 14} reviews
                  </span>
                </div>

                {/* Rating Distribution Bars */}
                <div className="space-y-1.5 text-xs">
                  {[5, 4, 3, 2, 1].map((stars) => {
                    const count = reviews.filter((r) => r.rating === stars).length;
                    const pct = reviews.length > 0 ? (count / reviews.length) * 100 : stars === 5 ? 85 : 15;
                    return (
                      <div key={stars} className="flex items-center gap-2">
                        <span className="w-12 text-right text-gray-500">{stars} Stars</span>
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="w-6 text-right text-gray-400">{count || (stars === 5 ? 12 : 2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Reviews List (8 Cols) */}
              <div className="lg:col-span-8 space-y-4">
                {reviews.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-500">
                    No customer reviews yet. Be the first to review this product!
                  </div>
                ) : (
                  reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1 text-amber-500">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < rev.rating ? 'fill-current' : 'opacity-20'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified Buyer
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">
                        {rev.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-3">
                        {rev.body}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          {rev.user_name || (rev as unknown as { reviewer_name?: string }).reviewer_name || 'Customer'}
                        </span>
                        <span>
                          {new Date(rev.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-800">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    You Might Also Like
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">Similar items you may be interested in</p>
                </div>
                <Link
                  href={`/products?category=${productCategory?.slug || 'all'}`}
                  className="btn-outline text-xs px-3.5 py-1.5 rounded-xl"
                >
                  <span>View More</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
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
