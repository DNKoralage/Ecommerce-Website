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
  Package,
} from 'lucide-react';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import { ProductCard } from '@/components/storefront/ProductCard';
import QuickViewModal from '@/components/storefront/QuickViewModal';
import { api } from '@/lib/store';
import { Product, Category, SiteSettings } from '@/types';
import { defaultCategories, defaultSiteSettings } from '@/lib/seed-data';
import { useCurrency } from '@/context/CurrencyContext';

// Skeleton component for loading state
function ProductListingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col">
      <div className="h-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 animate-pulse" />
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 flex-1">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg mb-4 animate-pulse" />
        <div className="h-4 w-96 bg-gray-100 dark:bg-gray-850 rounded-lg mb-10 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { formatPrice } = useCurrency();

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
        console.error('Error fetching meta:', err);
      }
    }
    loadMeta();
  }, []);

  // Fetch filtered products
  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const data = await api.getProducts({
          category: categoryParam === 'all' ? undefined : categoryParam,
          sort: sortParam as any,
          minPrice: minPriceParam ? Number(minPriceParam) : undefined,
          maxPrice: maxPriceParam ? Number(maxPriceParam) : undefined,
          inStock: inStockParam || undefined,
          tag: tagParam || undefined,
          search: searchQuery || undefined,
        });

        let filtered = data;
        if (ratingParam) {
          filtered = filtered.filter((p) => (p.rating || 5) >= ratingParam);
        }

        setAllProducts(filtered);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
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

  // Helper to update query string parameters
  const updateFilters = (newParams: Record<string, string | number | boolean | null>) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') {
        current.delete(key);
      } else {
        current.set(key, String(value));
      }
    });
    router.push(`/products?${current.toString()}`, { scroll: false });
  };

  const handleCategorySelect = (slug: string) => {
    updateFilters({ category: slug === 'all' ? null : slug });
  };

  const handleSortChange = (newSort: string) => {
    updateFilters({ sort: newSort === 'featured' ? null : newSort });
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

  const handleInStockToggle = () => {
    updateFilters({ inStock: inStockParam ? null : true });
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

  const visibleProducts = allProducts.slice(0, visibleCount);
  const hasMore = visibleCount < allProducts.length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Header
        siteName={siteSettings.site_name}
        announcementText={siteSettings.announcement_bar_text}
        announcementActive={siteSettings.announcement_bar_active}
      />

      <main className="flex-1 relative">
        {/* Collection Header Banner */}
        <section className="bg-gradient-to-b from-blue-50/60 to-transparent dark:from-blue-950/20 dark:to-transparent pt-10 pb-8 px-4 sm:px-6 lg:px-8 border-b border-gray-200/80 dark:border-gray-800">
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4 font-medium">
              <Link href="/" className="hover:text-blue-600 transition-colors">
                Home
              </Link>
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              <Link href="/products" className="hover:text-blue-600 transition-colors">
                Products
              </Link>
              {activeCategory && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  <span className="text-blue-600 dark:text-blue-400 font-semibold">{activeCategory.name}</span>
                </>
              )}
            </nav>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Curated Marketplace</span>
                </div>
                <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                  {activeCategory ? activeCategory.name : 'Explore All Products'}
                </h1>
                <p className="mt-1.5 text-sm text-gray-600 dark:text-gray-400 max-w-xl">
                  {activeCategory?.description ||
                    'Browse authentic products from certified sellers with Island-wide Cash on Delivery.'}
                </p>
              </div>

              {/* Product Count Pill */}
              <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                <span className="font-bold text-xl text-blue-600 dark:text-blue-400">{allProducts.length}</span>
                <span>products found</span>
              </div>
            </div>

            {/* Quick Category Navigation Bar */}
            <div className="mt-6 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                onClick={() => handleCategorySelect('all')}
                className={`chip ${categoryParam === 'all' ? 'active' : ''}`}
              >
                All Products
              </button>
              {categories.map((cat) => {
                const isActive = categoryParam === cat.slug;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.slug)}
                    className={`chip ${isActive ? 'active' : ''}`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Toolbar & Active Filters */}
        <section className="sticky top-[64px] z-30 py-3 px-4 sm:px-6 lg:px-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-xs">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            {/* Filter Toggle (Mobile) & Active Tag Chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Active Filter Chips */}
              <AnimatePresence>
                {activeCategory && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    <span>{activeCategory.name}</span>
                    <button
                      type="button"
                      onClick={() => handleCategorySelect('all')}
                      className="hover:text-red-500 cursor-pointer"
                      aria-label="Remove category filter"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {(minPriceParam || maxPriceParam) && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    <span>
                      {formatPrice(Number(minPriceParam || 0))} – {formatPrice(Number(maxPriceParam || 60000))}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateFilters({ minPrice: null, maxPrice: null })}
                      className="hover:text-red-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {inStockParam && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <span>In Stock Only</span>
                    <button
                      type="button"
                      onClick={handleInStockToggle}
                      className="hover:text-red-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {ratingParam && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                    <span>{ratingParam}★ &amp; above</span>
                    <button
                      type="button"
                      onClick={() => handleRatingSelect(ratingParam)}
                      className="hover:text-red-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                    <span>&ldquo;{searchQuery}&rdquo;</span>
                    <button
                      type="button"
                      onClick={() => updateFilters({ search: null })}
                      className="hover:text-red-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </AnimatePresence>

              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="text-xs text-red-500 hover:text-red-700 font-semibold ml-1 cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Right Controls: Sort Dropdown & Grid View Switcher */}
            <div className="flex items-center gap-3 ml-auto">
              {/* Grid Column Selector (Desktop) */}
              <div className="hidden md:flex items-center p-1 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setGridCols(2)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    gridCols === 2 ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-xs' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                  aria-label="2 Columns View"
                >
                  <Columns2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setGridCols(3)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    gridCols === 3 ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-xs' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                  aria-label="3 Columns View"
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setGridCols(4)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    gridCols === 4 ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-xs' : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                  }`}
                  aria-label="4 Columns View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5">
                <span className="hidden sm:inline text-xs text-gray-500 font-medium">Sort by:</span>
                <div className="relative">
                  <select
                    value={sortParam}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="appearance-none text-xs font-semibold py-1.5 pl-3 pr-7 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 focus:outline-none cursor-pointer"
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest</option>
                    <option value="best-selling">Best Selling</option>
                    <option value="rating">Top Rated</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Area: Sidebar + Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block lg:col-span-1 sticky top-[135px] space-y-6 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                  Filters
                </span>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>

              {/* Category Tree */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2.5">
                  Categories
                </h3>
                <div className="space-y-1 text-xs">
                  <button
                    type="button"
                    onClick={() => handleCategorySelect('all')}
                    className={`w-full flex items-center justify-between py-2 px-3 rounded-xl transition-all cursor-pointer ${
                      categoryParam === 'all'
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 font-semibold'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span>All Products</span>
                    <span className="text-gray-400 text-[11px]">{allProducts.length}</span>
                  </button>
                  {categories.map((cat) => {
                    const isSelected = categoryParam === cat.slug;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleCategorySelect(cat.slug)}
                        className={`w-full flex items-center justify-between py-2 px-3 rounded-xl transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 font-semibold'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <span>{cat.name}</span>
                        <span className="text-gray-400 text-[11px]">{cat.product_count || 3}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Price Range
                  </h3>
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
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
                  className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-3"
                />

                {/* Quick Price Pills */}
                <div className="grid grid-cols-2 gap-1.5 mb-3 text-xs">
                  <button
                    type="button"
                    onClick={() => handlePricePreset(0, 10000)}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 text-center text-gray-600 dark:text-gray-400 hover:text-blue-600"
                  >
                    Under Rs. 10k
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePricePreset(10000, 25000)}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 text-center text-gray-600 dark:text-gray-400 hover:text-blue-600"
                  >
                    Rs. 10k – 25k
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePricePreset(25000, 40000)}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 text-center text-gray-600 dark:text-gray-400 hover:text-blue-600"
                  >
                    Rs. 25k – 40k
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePricePreset(40000, 60000)}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 text-center text-gray-600 dark:text-gray-400 hover:text-blue-600"
                  >
                    Above Rs. 40k
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handlePriceApply}
                  className="w-full btn-outline py-2 text-xs rounded-xl"
                >
                  Apply Price Range
                </button>
              </div>

              {/* Availability Filter */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Availability
                </h3>
                <label className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={inStockParam}
                    onChange={handleInStockToggle}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-0 cursor-pointer accent-blue-600"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>

              {/* Rating Filter */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                  Rating
                </h3>
                <div className="space-y-1 text-xs">
                  {[5, 4.8, 4.5].map((starVal) => {
                    const isSelected = ratingParam === starVal;
                    return (
                      <button
                        key={starVal}
                        type="button"
                        onClick={() => handleRatingSelect(starVal)}
                        className={`w-full flex items-center justify-between py-1.5 px-2 rounded-lg transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 font-semibold'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="flex text-amber-500">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < Math.floor(starVal) ? 'fill-current' : 'opacity-30'
                                }`}
                              />
                            ))}
                          </div>
                          <span>{starVal} &amp; above</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
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
                  className={`grid gap-5 ${
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
                      className="aspect-[3/4] p-4 flex flex-col justify-end bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 animate-pulse"
                    >
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2" />
                      <div className="h-3 bg-gray-100 dark:bg-gray-850 rounded w-1/3" />
                    </div>
                  ))}
                </div>
              ) : allProducts.length === 0 ? (
                /* Empty State */
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-16 px-6 text-center max-w-md mx-auto my-8 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xs"
                >
                  <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center mx-auto mb-4 text-blue-600">
                    <Package className="w-7 h-7" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-gray-900 dark:text-white mb-2">
                    No Matching Products
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-sm mx-auto mb-6">
                    We could not find any products matching your filter criteria. Try adjusting your filters or search keywords.
                  </p>
                  <button
                    type="button"
                    onClick={handleClearAllFilters}
                    className="btn-primary text-xs"
                  >
                    <span>Reset All Filters</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                </motion.div>
              ) : (
                /* Product Grid */
                <div>
                  <div
                    className={`grid gap-5 ${
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

                  {/* Load More Button */}
                  {hasMore && (
                    <div className="mt-12 text-center">
                      <p className="text-xs text-gray-500 mb-3 font-medium">
                        Showing {visibleProducts.length} of {allProducts.length} products
                      </p>
                      <div className="w-48 h-1.5 bg-gray-200 dark:bg-gray-800 mx-auto rounded-full overflow-hidden mb-6">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-300"
                          style={{
                            width: `${(visibleProducts.length / allProducts.length) * 100}%`,
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setVisibleCount((prev) => prev + 4)}
                        className="btn-outline px-6 py-2.5 text-xs font-semibold rounded-xl"
                      >
                        Load More Products
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFilterOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-sm flex flex-col bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl"
            >
              <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="font-heading font-bold text-base text-gray-900 dark:text-white">
                  Filter Products
                </span>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
                  aria-label="Close filters"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 overflow-y-auto flex-1 space-y-5">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
                    Categories
                  </h4>
                  <div className="space-y-1">
                    <button
                      type="button"
                      onClick={() => handleCategorySelect('all')}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs text-left ${
                        categoryParam === 'all'
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 font-semibold'
                          : 'text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <span>All Products</span>
                    </button>
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleCategorySelect(c.slug)}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs text-left ${
                          categoryParam === c.slug
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 font-semibold'
                            : 'text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        <span>{c.name}</span>
                        <span className="text-gray-400">{c.product_count || 3}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
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
                    className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-600 mb-3"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      handlePriceApply();
                      setIsMobileFilterOpen(false);
                    }}
                    className="w-full btn-primary py-2 text-xs rounded-xl"
                  >
                    Apply Price
                  </button>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <label className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={inStockParam}
                      onChange={handleInStockToggle}
                      className="w-4 h-4 rounded text-blue-600 accent-blue-600"
                    />
                    <span>Show in-stock items only</span>
                  </label>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleClearAllFilters();
                    setIsMobileFilterOpen(false);
                  }}
                  className="flex-1 btn-outline text-xs py-2.5 rounded-xl"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  className="flex-1 btn-primary text-xs py-2.5 rounded-xl"
                >
                  View ({allProducts.length})
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
