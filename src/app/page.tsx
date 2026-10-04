'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, TrendingUp, Store, Shield, Truck, RotateCcw, HeadphonesIcon, Star, ChevronRight } from 'lucide-react';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import HeroSection from '@/components/storefront/HeroSection';
import FeaturedCategories from '@/components/storefront/FeaturedCategories';
import PromotionalBanner from '@/components/storefront/PromotionalBanner';
import { ProductCard } from '@/components/storefront/ProductCard';
import QuickViewModal from '@/components/storefront/QuickViewModal';
import { api } from '@/lib/store';
import { Product, Category, HeroSlide, SiteSettings } from '@/types';
import { defaultHeroSlides, defaultCategories, defaultSiteSettings, defaultProducts } from '@/lib/seed-data';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useSiteCustomization } from '@/context/SiteCustomizationContext';

const FILTER_CHIPS = ['All', 'New Arrivals', 'Best Sellers', 'On Sale', 'Top Rated', 'Under $50'];

/** Fake vendor data for the multi-vendor section */
const SAMPLE_VENDORS = [
  { id: '1', name: 'Ceylon Gems Co.',     logo: '💎', products: 48,  rating: 4.9, tag: 'Verified' },
  { id: '2', name: 'Kandyan Silk House',  logo: '🧵', products: 32,  rating: 4.8, tag: 'Top Seller' },
  { id: '3', name: 'Ayur Botanics',       logo: '🌿', products: 61,  rating: 4.7, tag: 'Verified' },
  { id: '4', name: 'Ceylon Tea Direct',   logo: '🍃', products: 27,  rating: 4.9, tag: 'Verified' },
  { id: '5', name: 'Brass Temple Arts',   logo: '🪔', products: 19,  rating: 4.6, tag: 'Top Seller' },
];

const TRUST_BADGES = [
  { icon: Truck,         label: 'Free Delivery',  desc: 'On orders over Rs. 7,500' },
  { icon: Shield,        label: 'Secure Shopping', desc: 'SSL encrypted checkout' },
  { icon: RotateCcw,     label: 'Easy Returns',    desc: '7-day return policy' },
  { icon: HeadphonesIcon,label: '24/7 Support',    desc: 'Live chat & phone support' },
];

export default function HomePage() {
  const { language, t } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const { customization } = useSiteCustomization();

  const [heroSlides,     setHeroSlides]     = useState<HeroSlide[]>(defaultHeroSlides);
  const [categories,     setCategories]     = useState<Category[]>(defaultCategories);
  const [siteSettings,   setSiteSettings]   = useState<SiteSettings>(defaultSiteSettings);
  const [newArrivals,    setNewArrivals]    = useState<Product[]>(defaultProducts.slice(0, 4));
  const [bestSellers,    setBestSellers]    = useState<Product[]>(defaultProducts.slice(4, 8));
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    async function loadData() {
      try {
        const [slidesData, catsData, settingsData, newProds, bestProds] = await Promise.all([
          api.getHeroSlides(),
          api.getCategories(),
          api.getSiteSettings(),
          api.getProducts({ sort: 'newest', limit: 4 }),
          api.getProducts({ sort: 'best-selling', limit: 4 }),
        ]);
        if (slidesData.length > 0)  setHeroSlides(slidesData);
        if (catsData.length > 0)    setCategories(catsData);
        if (settingsData)            setSiteSettings(settingsData);
        setNewArrivals(newProds);
        setBestSellers(bestProds);
      } catch (e) {
        console.error('Failed to load homepage data', e);
      }
    }
    loadData();
  }, []);

  const activeHeroSlides = (
    customization?.hero_slides?.filter((s) => s.is_active) ?? heroSlides
  ).filter((s) => s.is_active);

  /* colour tokens */
  const bgPage  = isLight ? '#F8FAFC' : '#0F172A';
  const bgCard  = isLight ? '#FFFFFF' : '#1E293B';
  const bgMuted = isLight ? '#F1F5F9' : '#162032';
  const border  = isLight ? '#E2E8F0' : 'rgba(51,65,85,0.7)';
  const txtMain = isLight ? '#0F172A' : '#F1F5F9';
  const txtMute = isLight ? '#64748B' : '#94A3B8';

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: bgPage, color: txtMain, transition: 'background-color 0.3s, color 0.3s' }}
    >
      {/* ─── Header ─── */}
      <Header
        siteName={siteSettings.site_name || 'Ceylon Times'}
        logoUrl={siteSettings.logo_url}
        announcementText={siteSettings.announcement_bar_text}
        announcementActive={siteSettings.announcement_bar_active}
      />

      <main className="flex-1">
        {/* ─── 1. Hero ─── */}
        <HeroSection slides={activeHeroSlides.length > 0 ? activeHeroSlides : heroSlides} />

        {/* ─── 2. Trust Badges ─── */}
        <section style={{ background: isLight ? '#FFFFFF' : '#1E293B', borderBottom: `1px solid ${border}` }}>
          <div className="max-w-[1440px] mx-auto px-6 lg:px-16 py-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {TRUST_BADGES.map(({ icon: Icon, label, desc }) => (
                <div key={label} className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(37,99,235,0.08)' }}
                  >
                    <Icon className="w-5 h-5" style={{ color: '#2563EB' }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: txtMain }}>{label}</p>
                    <p className="text-xs" style={{ color: txtMute }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 3. Featured Categories ─── */}
        <FeaturedCategories categories={categories} />

        {/* ─── 4. Search Filter Chips ─── */}
        <section className="py-6" style={{ background: bgPage }}>
          <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 hide-scrollbar">
              {FILTER_CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => setActiveFilter(chip)}
                  className={`chip flex-shrink-0 ${activeFilter === chip ? 'active' : ''}`}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ─── 5. New Arrivals ─── */}
        <section className="pb-12 lg:pb-16" style={{ background: bgPage }}>
          <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest mb-1.5 block" style={{ color: '#2563EB' }}>
                  Just Dropped
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: txtMain, fontFamily: 'var(--font-outfit)' }}>
                  {language === 'si' ? 'නවතම නිර්මාණ' : 'New Arrivals'}
                </h2>
              </div>
              <Link
                href="/products"
                className="flex items-center gap-1.5 text-sm font-semibold group transition-colors"
                style={{ color: '#2563EB' }}
              >
                {language === 'si' ? 'සියල්ල' : 'See All'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              {newArrivals.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ─── 6. Promotional Banner ─── */}
        <PromotionalBanner />

        {/* ─── 7. Best Sellers ─── */}
        <section className="py-12 lg:py-16" style={{ background: isLight ? '#FFFFFF' : '#1E293B' }}>
          <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
            <div className="flex items-end justify-between mb-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest mb-1.5 flex items-center gap-1.5 block" style={{ color: '#2563EB' }}>
                  <TrendingUp className="w-3.5 h-3.5" />
                  Trending Now
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: txtMain, fontFamily: 'var(--font-outfit)' }}>
                  {language === 'si' ? 'ජනප්‍රිය නිර්මාණ' : 'Best Sellers'}
                </h2>
              </div>
              <Link
                href="/products?sort=best-selling"
                className="flex items-center gap-1.5 text-sm font-semibold group"
                style={{ color: '#2563EB' }}
              >
                {language === 'si' ? 'සියල්ල' : 'View All'}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
              {bestSellers.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={(p) => setQuickViewProduct(p)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ─── 8. Multi-Vendor Section ─── */}
        <section className="py-12 lg:py-16" style={{ background: bgMuted }}>
          <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="text-xs font-semibold uppercase tracking-widest mb-1.5 flex items-center gap-1.5 block" style={{ color: '#2563EB' }}>
                  <Store className="w-3.5 h-3.5" />
                  Multi-Vendor Marketplace
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold" style={{ color: txtMain, fontFamily: 'var(--font-outfit)' }}>
                  Top Vendor Stores
                </h2>
                <p className="text-sm mt-1.5" style={{ color: txtMute }}>
                  Browse curated stores from verified Sri Lankan artisans & sellers
                </p>
              </div>
              <Link
                href="/admin"
                className="hidden sm:flex items-center gap-1.5 text-sm font-semibold"
                style={{ color: '#2563EB' }}
              >
                Become a Vendor
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {SAMPLE_VENDORS.map((vendor, idx) => (
                <motion.div
                  key={vendor.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.07 }}
                >
                  <Link
                    href={`/products?vendor=${vendor.id}`}
                    className="block p-4 rounded-2xl transition-all duration-300"
                    style={{ background: bgCard, border: `1px solid ${border}` }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = 'rgba(37,99,235,0.3)';
                      el.style.boxShadow = '0 8px 24px rgba(37,99,235,0.1)';
                      el.style.transform = 'translateY(-3px)';
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = border;
                      el.style.boxShadow = 'none';
                      el.style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Logo */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3"
                      style={{ background: isLight ? '#EFF6FF' : 'rgba(37,99,235,0.1)' }}
                    >
                      {vendor.logo}
                    </div>

                    {/* Name */}
                    <h3 className="text-sm font-semibold leading-tight mb-1" style={{ color: txtMain }}>
                      {vendor.name}
                    </h3>

                    {/* Meta */}
                    <p className="text-xs mb-2" style={{ color: txtMute }}>
                      {vendor.products} products
                    </p>

                    {/* Rating + Tag */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-xs font-medium" style={{ color: txtMute }}>{vendor.rating}</span>
                      </div>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ background: 'rgba(37,99,235,0.08)', color: '#2563EB' }}
                      >
                        {vendor.tag}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Vendor CTA */}
            <div
              className="mt-8 p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
              style={{
                background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                borderRadius: '20px',
              }}
            >
              <div>
                <h3 className="text-xl font-bold text-white mb-1.5" style={{ fontFamily: 'var(--font-outfit)' }}>
                  Sell on Ceylon Times
                </h3>
                <p className="text-white/80 text-sm leading-relaxed max-w-md">
                  Join hundreds of verified vendors. Set up your store in minutes — zero listing fees, COD support included.
                </p>
              </div>
              <Link
                href="/admin"
                className="flex-shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
                style={{ background: '#FFFFFF', color: '#2563EB' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}
              >
                <Store className="w-4 h-4" />
                Open Your Store
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </section>

        {/* ─── 9. COD & Fast Shipping Info ─── */}
        <section className="py-12 lg:py-16" style={{ background: isLight ? '#FFFFFF' : '#1E293B' }}>
          <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* COD Card */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-6 sm:p-8 rounded-2xl"
                style={{ background: bgMuted, border: `1px solid ${border}` }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: '#F0FDF4' }}
                >
                  💵
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: txtMain, fontFamily: 'var(--font-outfit)' }}>
                  Cash on Delivery
                </h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: txtMute }}>
                  Order with confidence — pay when your package arrives at your door. No credit card required.
                </p>
                <Link href="/products" className="btn-primary text-sm inline-flex">
                  Shop with COD
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </motion.div>

              {/* Fast Delivery Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="p-6 sm:p-8 rounded-2xl"
                style={{ background: bgMuted, border: `1px solid ${border}` }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: '#EFF6FF' }}
                >
                  🚚
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: txtMain, fontFamily: 'var(--font-outfit)' }}>
                  Island-wide Fast Delivery
                </h3>
                <p className="text-sm leading-relaxed mb-4" style={{ color: txtMute }}>
                  Quick, tracked courier dispatch across all 9 provinces in Sri Lanka. Free delivery on orders over Rs. 7,500.
                </p>
                <Link href="/shipping" className="btn-outline text-sm inline-flex">
                  Shipping Details
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      {/* ─── Footer ─── */}
      <Footer siteName={siteSettings.site_name} tagline={siteSettings.tagline} />

      {/* ─── Quick View Modal ─── */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
