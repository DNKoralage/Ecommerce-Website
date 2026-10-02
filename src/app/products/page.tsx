'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal,
  X,
  ChevronDown,
  LayoutGrid,
  Grid3X3,
  Columns2,
  Sparkles,
  Star,
  RotateCcw,
  Check,
  ChevronRight,
  ArrowRight,
  Gem,
} from 'lucide-react';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import { ProductCard } from '@/components/storefront/ProductCard';
import QuickViewModal from '@/components/storefront/QuickViewModal';
import { api } from '@/lib/store';
import { Product, Category, SiteSettings } from '@/types';
import { defaultCategories, defaultSiteSettings } from '@/lib/seed-data';
import { formatPrice } from '@/lib/utils';

// Skeleton component for loading state
function ProductListingSkeleton() {
  return (
    <div className="min-h-screen bg-[#02030A] flex flex-col">
      <div className="h-24 bg-[#060814]/80 border-b border-yellow-500/15 animate-pulse" />
      <div className="max-w-[1440px] mx-auto w-full px-6 lg:px-16 py-12 flex-1">
        <div className="h-8 w-48 bg-yellow-500/10 rounded mb-4 animate-pulse" />
        <div className="h-4 w-96 bg-yellow-500/5 rounded mb-12 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-[#080C1C] border border-yellow-500/10 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL Query Parameters
  const categoryParam = searchParams.get('category') || 'all';
  const sortParam = searchParams.get('sort') || 'featured';
  const minPriceParam = searchParams.get('minPrice');
  const maxPriceParam = searchParams.get('maxPrice');
  const inStockParam = searchParams.get('inStock') === 'true';
  const tagParam = searchParams.get('tag') || '';
  const ratingParam = searchParams.get('rating') ? Number(searchParams.get('rating')) : null;
  const searchQuery = searchParams.get('search') || '';

  // Data states
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // UI states
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(4);
  const [visibleCount, setVisibleCount] = useState(8);

  // Local filter inputs for price slider (in LKR)
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({
    min: minPriceParam ? Number(minPriceParam) : 0,
    max: maxPriceParam ? Number(maxPriceParam) : 60000,
  });

  // Sync priceRange if URL changes
  useEffect(() => {
    setPriceRange({
      min: minPriceParam ? Number(minPriceParam) : 0,
      max: maxPriceParam ? Number(maxPriceParam) : 60000,
    });
  }, [minPriceParam, maxPriceParam]);

  // Load initial meta & categories
  useEffect(() => {
    async function loadMeta() {
      try {
        const [cats, settings] = await Promise.all([
          api.getCategories(),
          api.getSiteSettings(),
        ]);
        if (cats.length > 0) setCategories(cats);
        if (settings) setSiteSettings(settings);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    }
    loadMeta();
  }, []);

  // Fetch products with active filter queries
  useEffect(() => {
    let isMounted = true;
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const filterOpts: Record<string, unknown> = {
          sort: sortParam,
          inStock: inStockParam || undefined,
        };

        if (categoryParam && categoryParam !== 'all') {
          filterOpts.category = categoryParam;
        }
        if (minPriceParam) filterOpts.minPrice = Number(minPriceParam);
        if (maxPriceParam) filterOpts.maxPrice = Number(maxPriceParam);
        if (tagParam) filterOpts.tag = tagParam;
        if (ratingParam) filterOpts.rating = ratingParam;
        if (searchQuery) filterOpts.search = searchQuery;

        const results = await api.getProducts(filterOpts);
        if (isMounted) {
          setAllProducts(results);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to query products:', err);
        if (isMounted) setIsLoading(false);
      }
    }

    fetchProducts();
    return () => {
      isMounted = false;
    };
  }, [
    categoryParam,
    sortParam,
    minPriceParam,
    maxPriceParam,
    inStockParam,
    tagParam,
    ratingParam,
    searchQuery,
  ]);

  // Helper to update query string without page reloads
  const updateFilters = (newParams: Record<string, string | number | boolean | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));

    Object.entries(newParams).forEach(([key, val]) => {
      if (val === null || val === undefined || val === '') {
        current.delete(key);
      } else {
        current.set(key, String(val));
      }
    });

    const search = current.toString();
    const query = search ? `?${search}` : '';
    router.push(`/products${query}`, { scroll: false });
  };

  const handleCategorySelect = (slug: string) => {
    updateFilters({ category: slug === 'all' ? null : slug });
  };

  const handleSortChange = (newSort: string) => {
    updateFilters({ sort: newSort });
  };

  const handleInStockToggle = () => {
    updateFilters({ inStock: inStockParam ? null : true });
  };

  const handlePriceApply = () => {
    updateFilters({
      minPrice: priceRange.min > 0 ? priceRange.min : null,
      maxPrice: priceRange.max < 60000 ? priceRange.max : null,
    });
  };

  const handlePricePreset = (min: number, max: number) => {
    setPriceRange({ min, max });
    updateFilters({
      minPrice: min > 0 ? min : null,
      maxPrice: max < 60000 ? max : null,
    });
  };

  const handleTagSelect = (tag: string) => {
    updateFilters({ tag: tagParam === tag ? null : tag });
  };

  const handleRatingSelect = (rating: number) => {
    updateFilters({ rating: ratingParam === rating ? null : rating });
  };

  const handleClearAllFilters = () => {
    setPriceRange({ min: 0, max: 60000 });
    router.push('/products', { scroll: false });
  };

  // Find active category details
  const activeCategory = useMemo(() => {
    if (!categoryParam || categoryParam === 'all') return null;
    return categories.find((c) => c.slug === categoryParam) || null;
  }, [categories, categoryParam]);

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (categoryParam && categoryParam !== 'all') count++;
    if (minPriceParam || maxPriceParam) count++;
    if (inStockParam) count++;
    if (ratingParam) count++;
    if (tagParam) count++;
    if (searchQuery) count++;
    return count;
  }, [categoryParam, minPriceParam, maxPriceParam, inStockParam, ratingParam, tagParam, searchQuery]);

  // Products to show
  const visibleProducts = allProducts.slice(0, visibleCount);
  const hasMore = visibleCount < allProducts.length;

  return (
    <div className="min-h-screen flex flex-col bg-[#02030A] text-[#E8E3D8] selection:bg-[#FFD700]/30 selection:text-[#FFD700]">
      <Header
        siteName={siteSettings.site_name}
        announcementText={siteSettings.announcement_bar_text}
        announcementActive={siteSettings.announcement_bar_active}
      />

      <main className="flex-1 relative">
        {/* Editorial Collection Header Banner */}
        <section
          className="pt-12 pb-14 px-6 lg:px-16 relative overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(8,12,28,0.9) 0%, rgba(2,3,10,0.95) 100%)',
            borderBottom: '1px solid rgba(255, 215, 0, 0.15)',
          }}
        >
          {/* Subtle neon backdrop */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[radial-gradient(circle,rgba(255,215,0,0.06)_0%,transparent_70%)] pointer-events-none" />

          <div className="max-w-[1440px] mx-auto relative z-10">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-[#E8E3D8]/60 uppercase tracking-[0.18em] mb-6" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              <Link href="/" className="hover:text-[#FFD700] transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 opacity-40 text-[#FFD700]" />
              <Link href="/products" className="hover:text-[#FFD700] transition-colors">
                Treasury
              </Link>
              {activeCategory && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 opacity-40 text-[#00FFFF]" />
                  <span className="text-[#00FFFF] font-bold">{activeCategory.name}</span>
                </>
              )}
            </nav>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="max-w-2xl">
                <div
                  className="inline-flex items-center gap-2 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FFD700] mb-3"
                  style={{
                    background: 'rgba(255,215,0,0.1)',
                    border: '1px solid rgba(255,215,0,0.3)',
                    fontFamily: 'var(--font-rajdhani)',
                  }}
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#00FFFF]" />
                  Ceylon Heritage Guilds ✦ Colombo Archive
                </div>
                <h1
                  className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white font-normal tracking-wide"
                  style={{ textShadow: '0 0 25px rgba(255,215,0,0.3)' }}
                >
                  {activeCategory ? activeCategory.name : 'The Complete Ceylon Treasury'}
                </h1>
                <p className="mt-3 text-xs sm:text-sm text-[#E8E3D8]/70 leading-relaxed font-sans max-w-xl">
                  {activeCategory?.description ||
                    'Hand-set Ceylon sapphires from Galle Fort master gemmologists, authentic Kandyan silk handlooms, sacred bronze temple lamps, and single-estate Nuwara Eliya silver tip teas.'}
                </p>
              </div>

              {/* Quick stats */}
              <div className="text-right flex items-center md:flex-col md:items-end gap-2 text-xs text-[#E8E3D8]/60" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                <span className="font-serif text-3xl text-[#FFD700] font-bold" style={{ textShadow: '0 0 10px rgba(255,215,0,0.5)' }}>
                  {allProducts.length}
                </span>
                <span className="uppercase tracking-[0.15em] text-[10px]">Masterworks Cataloged</span>
              </div>
            </div>

            {/* Quick Category Navigation Bar */}
            <div className="mt-8 pt-6 border-t border-yellow-500/15 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                onClick={() => handleCategorySelect('all')}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] whitespace-nowrap transition-all cursor-pointer ${
                  categoryParam === 'all'
                    ? 'btn-neon-gold'
                    : 'btn-neon-outline'
                }`}
              >
                All Guilds ({categories.reduce((acc, c) => acc + (c.product_count || 0), 0) || 12})
              </button>
              {categories.map((cat) => {
                const isActive = categoryParam === cat.slug;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.slug)}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] whitespace-nowrap transition-all cursor-pointer ${
                      isActive
                        ? 'btn-neon-gold'
                        : 'btn-neon-outline'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Toolbar & Active Filters */}
        <section
          className="sticky top-[64px] z-30 py-3.5 px-6 lg:px-16 transition-all"
          style={{
            background: 'rgba(2, 3, 10, 0.95)',
            borderBottom: '1px solid rgba(255, 215, 0, 0.15)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="max-w-[1440px] mx-auto flex flex-wrap items-center justify-between gap-4">
            {/* Filter Toggle & Active Tag Chips */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-[#FFD700] transition-colors"
                style={{
                  background: 'rgba(255, 215, 0, 0.1)',
                  border: '1px solid rgba(255, 215, 0, 0.35)',
                  fontFamily: 'var(--font-rajdhani)',
                }}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#FFD700] text-[#02030A] text-[10px] flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Active Filter Chips */}
              <AnimatePresence>
                {activeCategory && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs text-[#00FFFF] border border-[#00FFFF]/40 bg-[#00FFFF]/10"
                    style={{ fontFamily: 'var(--font-rajdhani)' }}
                  >
                    <span>Guild: {activeCategory.name}</span>
                    <button
                      type="button"
                      onClick={() => handleCategorySelect(activeCategory.slug)}
                      className="hover:text-[#FF2D55] cursor-pointer"
                      aria-label="Remove category filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.span>
                )}

                {(minPriceParam || maxPriceParam) && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs text-[#FFD700] border border-[#FFD700]/40 bg-[#FFD700]/10"
                    style={{ fontFamily: 'var(--font-rajdhani)' }}
                  >
                    <span>
                      LKR: {formatPrice(Number(minPriceParam || 0))} –{' '}
                      {formatPrice(Number(maxPriceParam || 60000))}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateFilters({ minPrice: null, maxPrice: null })}
                      className="hover:text-[#FF2D55] cursor-pointer"
                      aria-label="Remove price filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.span>
                )}

                {inStockParam && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs text-[#00FF88] border border-[#00FF88]/40 bg-[#00FF88]/10"
                    style={{ fontFamily: 'var(--font-rajdhani)' }}
                  >
                    <span>In Stock Only</span>
                    <button
                      type="button"
                      onClick={handleInStockToggle}
                      className="hover:text-[#FF2D55] cursor-pointer"
                      aria-label="Remove in stock filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.span>
                )}

                {ratingParam && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs text-[#FFD700] border border-[#FFD700]/40 bg-[#FFD700]/10"
                    style={{ fontFamily: 'var(--font-rajdhani)' }}
                  >
                    <span>{ratingParam}★ & above</span>
                    <button
                      type="button"
                      onClick={() => handleRatingSelect(ratingParam)}
                      className="hover:text-[#FF2D55] cursor-pointer"
                      aria-label="Remove rating filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.span>
                )}

                {tagParam && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs text-[#00FFFF] border border-[#00FFFF]/40 bg-[#00FFFF]/10 capitalize"
                    style={{ fontFamily: 'var(--font-rajdhani)' }}
                  >
                    <span>Tag: {tagParam.replace('-', ' ')}</span>
                    <button
                      type="button"
                      onClick={() => handleTagSelect(tagParam)}
                      className="hover:text-[#FF2D55] cursor-pointer"
                      aria-label="Remove tag filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.span>
                )}

                {searchQuery && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1 text-xs text-[#FFD700] border border-[#FFD700]/40 bg-[#FFD700]/10"
                    style={{ fontFamily: 'var(--font-rajdhani)' }}
                  >
                    <span>Enquiry: &ldquo;{searchQuery}&rdquo;</span>
                    <button
                      type="button"
                      onClick={() => updateFilters({ search: null })}
                      className="hover:text-[#FF2D55] cursor-pointer"
                      aria-label="Clear search"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.span>
                )}
              </AnimatePresence>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="text-xs text-[#FF2D55] underline underline-offset-4 hover:text-white transition-colors ml-2 cursor-pointer font-bold"
                  style={{ fontFamily: 'var(--font-rajdhani)' }}
                >
                  Clear All
                </button>
              )}
            </div>

            {/* Right Controls: Sort Dropdown & Grid View Switcher */}
            <div className="flex items-center gap-4 ml-auto">
              {/* Grid Column Selector (Desktop) */}
              <div
                className="hidden md:flex items-center p-0.5"
                style={{
                  background: 'rgba(8, 12, 28, 0.8)',
                  border: '1px solid rgba(255, 215, 0, 0.25)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setGridCols(2)}
                  className={`p-1.5 text-xs transition-colors cursor-pointer ${
                    gridCols === 2 ? 'bg-[#FFD700] text-[#02030A]' : 'text-[#E8E3D8]/50 hover:text-white'
                  }`}
                  aria-label="2 Columns View"
                >
                  <Columns2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setGridCols(3)}
                  className={`p-1.5 text-xs transition-colors cursor-pointer ${
                    gridCols === 3 ? 'bg-[#FFD700] text-[#02030A]' : 'text-[#E8E3D8]/50 hover:text-white'
                  }`}
                  aria-label="3 Columns View"
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setGridCols(4)}
                  className={`p-1.5 text-xs transition-colors cursor-pointer ${
                    gridCols === 4 ? 'bg-[#FFD700] text-[#02030A]' : 'text-[#E8E3D8]/50 hover:text-white'
                  }`}
                  aria-label="4 Columns View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-xs text-[#E8E3D8]/50 uppercase tracking-[0.15em]" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                  Sort:
                </span>
                <div className="relative">
                  <select
                    value={sortParam}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="appearance-none text-xs text-[#FFD700] font-bold py-1.5 pl-3 pr-8 focus:outline-none cursor-pointer"
                    style={{
                      background: 'rgba(8, 12, 28, 0.9)',
                      border: '1px solid rgba(255, 215, 0, 0.3)',
                      fontFamily: 'var(--font-rajdhani)',
                    }}
                  >
                    <option value="featured" className="bg-[#02030A] text-white">Ceylon Featured</option>
                    <option value="price-low" className="bg-[#02030A] text-white">Price: Low to High</option>
                    <option value="price-high" className="bg-[#02030A] text-white">Price: High to Low</option>
                    <option value="newest" className="bg-[#02030A] text-white">Latest Creations</option>
                    <option value="best-selling" className="bg-[#02030A] text-white">Patron Treasured</option>
                    <option value="rating" className="bg-[#02030A] text-white">Highest Acclaimed</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#FFD700]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Area: Sidebar + Grid */}
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-start">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block lg:col-span-1 sticky top-[130px] space-y-8 pr-4">
              <div className="flex items-center justify-between pb-4 border-b border-yellow-500/15">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFD700] flex items-center gap-2" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#00FFFF]" />
                  Filter Archives
                </span>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    className="text-[11px] text-[#FF2D55] hover:text-white transition-colors flex items-center gap-1 cursor-pointer font-bold"
                    style={{ fontFamily: 'var(--font-rajdhani)' }}
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>

              {/* Category Tree */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#00FFFF] mb-3" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                  Ceylon Guilds
                </h3>
                <div className="space-y-1 text-xs" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                  <button
                    type="button"
                    onClick={() => handleCategorySelect('all')}
                    className={`w-full flex items-center justify-between py-2 px-3 text-left transition-all cursor-pointer ${
                      categoryParam === 'all'
                        ? 'bg-[#FFD700]/20 border border-[#FFD700] text-[#FFD700] font-bold'
                        : 'text-[#E8E3D8]/70 hover:bg-yellow-500/5 hover:text-white border border-transparent'
                    }`}
                  >
                    <span>All Collections</span>
                    <span className={categoryParam === 'all' ? 'text-[#FFD700]' : 'text-[#E8E3D8]/40'}>
                      {categories.reduce((acc, c) => acc + (c.product_count || 0), 0) || 12}
                    </span>
                  </button>
                  {categories.map((cat) => {
                    const isSelected = categoryParam === cat.slug;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategorySelect(cat.slug)}
                        className={`w-full flex items-center justify-between py-2 px-3 text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#FFD700]/20 border border-[#FFD700] text-[#FFD700] font-bold'
                            : 'text-[#E8E3D8]/70 hover:bg-yellow-500/5 hover:text-white border border-transparent'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className={isSelected ? 'text-[#FFD700]' : 'text-[#E8E3D8]/40'}>
                          {cat.product_count || 3}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="pt-4 border-t border-yellow-500/15">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#00FFFF]" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    Price Range (LKR)
                  </h3>
                  <span className="text-[11px] text-[#FFD700] font-bold" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    {formatPrice(priceRange.min)} – {formatPrice(priceRange.max)}
                  </span>
                </div>

                {/* Range Slider */}
                <input
                  type="range"
                  min="0"
                  max="60000"
                  step="2500"
                  value={priceRange.max}
                  onChange={(e) =>
                    setPriceRange((prev) => ({ ...prev, max: Number(e.target.value) }))
                  }
                  className="w-full h-1 bg-yellow-500/20 rounded-lg appearance-none cursor-pointer accent-[#FFD700] mb-3"
                />

                {/* Quick Price Pills in LKR */}
                <div className="grid grid-cols-2 gap-1.5 mb-3 text-[11px]" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                  <button
                    type="button"
                    onClick={() => handlePricePreset(0, 10000)}
                    className="p-1.5 transition-colors text-center text-[#E8E3D8]/70 hover:text-[#FFD700] cursor-pointer"
                    style={{
                      background: 'rgba(8, 12, 28, 0.8)',
                      border: '1px solid rgba(255, 215, 0, 0.2)',
                    }}
                  >
                    Under Rs. 10k
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePricePreset(10000, 25000)}
                    className="p-1.5 transition-colors text-center text-[#E8E3D8]/70 hover:text-[#FFD700] cursor-pointer"
                    style={{
                      background: 'rgba(8, 12, 28, 0.8)',
                      border: '1px solid rgba(255, 215, 0, 0.2)',
                    }}
                  >
                    Rs. 10k – 25k
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePricePreset(25000, 40000)}
                    className="p-1.5 transition-colors text-center text-[#E8E3D8]/70 hover:text-[#FFD700] cursor-pointer"
                    style={{
                      background: 'rgba(8, 12, 28, 0.8)',
                      border: '1px solid rgba(255, 215, 0, 0.2)',
                    }}
                  >
                    Rs. 25k – 40k
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePricePreset(40000, 60000)}
                    className="p-1.5 transition-colors text-center text-[#E8E3D8]/70 hover:text-[#FFD700] cursor-pointer"
                    style={{
                      background: 'rgba(8, 12, 28, 0.8)',
                      border: '1px solid rgba(255, 215, 0, 0.2)',
                    }}
                  >
                    Above Rs. 40k
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handlePriceApply}
                  className="w-full btn-neon-gold py-2 text-xs"
                >
                  Apply Price Range
                </button>
              </div>

              {/* Availability Filter */}
              <div className="pt-4 border-t border-yellow-500/15">
                <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#00FFFF] mb-3" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                  Availability
                </h3>
                <label className="flex items-center gap-2.5 text-xs text-[#E8E3D8] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inStockParam}
                    onChange={handleInStockToggle}
                    className="w-4 h-4 rounded border-yellow-500/30 text-[#FFD700] focus:ring-0 cursor-pointer accent-[#FFD700]"
                  />
                  <span>In Atelier Stock Only</span>
                </label>
              </div>

              {/* Minimum Customer Rating Filter */}
              <div className="pt-4 border-t border-yellow-500/15">
                <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#00FFFF] mb-3" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                  Patron Rating
                </h3>
                <div className="space-y-1.5 text-xs">
                  {[5, 4.8, 4.5].map((starVal) => {
                    const isSelected = ratingParam === starVal;
                    return (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => handleRatingSelect(starVal)}
                        className={`w-full flex items-center justify-between py-1.5 px-2.5 transition-colors cursor-pointer ${
                          isSelected ? 'bg-[#FFD700]/20 text-[#FFD700] border border-[#FFD700]' : 'text-[#E8E3D8]/70 hover:bg-yellow-500/5'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="flex text-[#FFD700]">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.floor(starVal) ? 'fill-current' : 'opacity-30'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[11px]" style={{ fontFamily: 'var(--font-rajdhani)' }}>{starVal} & above</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#00FF88]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Curated Tags / Badges */}
              <div className="pt-4 border-t border-yellow-500/15">
                <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#00FFFF] mb-3" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                  Artisan Badges
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {['new-arrival', 'best-seller', 'featured'].map((tag) => {
                    const isSelected = tagParam === tag;
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagSelect(tag)}
                        className={`px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-[#FFD700] text-[#02030A] border-[#FFD700]'
                            : 'bg-transparent border-yellow-500/30 text-[#E8E3D8]/70 hover:border-[#FFD700]'
                        }`}
                        style={{ fontFamily: 'var(--font-rajdhani)' }}
                      >
                        {tag.replace('-', ' ')}
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* Product Grid Area */}
            <div className="lg:col-span-3">
              {isLoading ? (
                /* Loading Skeletons */
                <div
                  className={`grid gap-6 ${
                    gridCols === 2
                      ? 'grid-cols-1 sm:grid-cols-2'
                      : gridCols === 3
                      ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3'
                      : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                  }`}
                >
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="aspect-[3/4] p-4 flex flex-col justify-end animate-pulse"
                      style={{
                        background: 'rgba(8, 12, 28, 0.7)',
                        border: '1px solid rgba(255, 215, 0, 0.15)',
                      }}
                    >
                      <div className="h-4 bg-yellow-500/15 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-yellow-500/10 rounded w-1/3" />
                    </div>
                  ))}
                </div>
              ) : allProducts.length === 0 ? (
                /* Empty State */
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-20 px-8 text-center max-w-xl mx-auto my-8"
                  style={{
                    background: 'rgba(8, 12, 28, 0.75)',
                    border: '1px solid rgba(255, 215, 0, 0.25)',
                    backdropFilter: 'blur(16px)',
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-6"
                    style={{
                      background: 'rgba(255, 215, 0, 0.1)',
                      border: '1px solid rgba(255, 215, 0, 0.3)',
                    }}
                  >
                    <SlidersHorizontal className="w-6 h-6 text-[#FFD700]" />
                  </div>
                  <h3 className="font-serif text-2xl text-white font-normal mb-2">
                    No Matching Ceylon Artifacts
                  </h3>
                  <p className="text-xs text-[#E8E3D8]/65 leading-relaxed max-w-sm mx-auto mb-6">
                    We could not locate any pieces matching your current filter specifications.
                    Consider loosening your criteria or exploring our complete island treasury.
                  </p>
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    className="btn-neon-gold text-xs"
                  >
                    <span>Reset All Filters</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                </motion.div>
              ) : (
                /* Product Grid */
                <div>
                  <div
                    className={`grid gap-6 ${
                      gridCols === 2
                        ? 'grid-cols-1 sm:grid-cols-2'
                        : gridCols === 3
                        ? 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3'
                        : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
                    }`}
                  >
                    {visibleProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onQuickView={(p) => setQuickViewProduct(p)}
                      />
                    ))}
                  </div>

                  {/* Pagination / Load More */}
                  {hasMore && (
                    <div className="mt-14 text-center">
                      <div className="text-xs text-[#E8E3D8]/50 mb-3" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                        Displaying {visibleProducts.length} of {allProducts.length} Ceylon masterworks
                      </div>
                      <div className="w-48 h-1 bg-yellow-500/15 mx-auto rounded-full overflow-hidden mb-6">
                        <div
                          className="h-full bg-gradient-to-r from-[#FFD700] to-[#00FFFF] transition-all duration-300"
                          style={{
                            width: `${(visibleProducts.length / allProducts.length) * 100}%`,
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setVisibleCount((prev) => prev + 4)}
                        className="btn-neon-outline text-xs px-8 py-3.5"
                      >
                        Unveil More Masterworks
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Filters Slide-Over Drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-sm flex flex-col text-[#E8E3D8]"
              style={{
                background: 'rgba(5, 7, 18, 0.98)',
                borderLeft: '1px solid rgba(255, 215, 0, 0.3)',
                boxShadow: '-10px 0 50px rgba(0, 0, 0, 0.9)',
                backdropFilter: 'blur(25px)',
              }}
            >
              {/* Drawer Header */}
              <div className="p-6 border-b border-yellow-500/15 flex items-center justify-between">
                <span className="font-serif text-lg text-white">Filter Ceylon Archives</span>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1.5 text-[#E8E3D8]/60 hover:text-[#FFD700]"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {/* Categories */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-[#00FFFF] mb-3" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    Ceylon Guilds
                  </h4>
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() => handleCategorySelect('all')}
                      className={`w-full flex items-center justify-between p-2 text-xs text-left ${
                        categoryParam === 'all'
                          ? 'bg-[#FFD700]/20 border border-[#FFD700] text-[#FFD700] font-bold'
                          : 'bg-[#080C1C] text-[#E8E3D8]'
                      }`}
                    >
                      <span>All Collections</span>
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleCategorySelect(c.slug)}
                        className={`w-full flex items-center justify-between p-2 text-xs text-left ${
                          categoryParam === c.slug
                            ? 'bg-[#FFD700]/20 border border-[#FFD700] text-[#FFD700] font-bold'
                            : 'bg-[#080C1C] text-[#E8E3D8]'
                        }`}
                      >
                        <span>{c.name}</span>
                        <span>{c.product_count || 3}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div className="pt-4 border-t border-yellow-500/15">
                  <h4 className="text-xs font-bold uppercase tracking-[0.18em] text-[#00FFFF] mb-2" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    Max Price: {formatPrice(priceRange.max)}
                  </h4>
                  <input
                    type="range"
                    min="0"
                    max="60000"
                    step="2500"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange((prev) => ({ ...prev, max: Number(e.target.value) }))
                    }
                    className="w-full h-1 bg-yellow-500/20 rounded-lg appearance-none cursor-pointer accent-[#FFD700] mb-3"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      handlePriceApply();
                      setIsMobileFilterOpen(false);
                    }}
                    className="w-full btn-neon-gold py-2 text-xs"
                  >
                    Apply Price
                  </button>
                </div>

                {/* In Stock */}
                <div className="pt-4 border-t border-yellow-500/15">
                  <label className="flex items-center gap-3 text-xs text-[#E8E3D8] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockParam}
                      onChange={handleInStockToggle}
                      className="w-4 h-4 rounded text-[#FFD700] accent-[#FFD700]"
                    />
                    <span>Show in-stock items only</span>
                  </label>
                </div>
              </div>

              {/* Drawer Footer */}
              <div className="p-6 border-t border-yellow-500/15 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    handleClearAllFilters();
                    setIsMobileFilterOpen(false);
                  }}
                  className="flex-1 btn-neon-outline text-xs py-3"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 btn-neon-gold text-xs py-3"
                >
                  View ({allProducts.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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

export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductListingSkeleton />}>
      <ProductsContent />
    </Suspense>
  );
}
