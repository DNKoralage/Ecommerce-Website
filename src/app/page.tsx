'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Gem, Flame } from 'lucide-react';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import HeroSection from '@/components/storefront/HeroSection';
import FeaturedCategories from '@/components/storefront/FeaturedCategories';
import PromotionalBanner from '@/components/storefront/PromotionalBanner';
import TrustBadges from '@/components/storefront/TrustBadges';
import TestimonialsSection from '@/components/storefront/TestimonialsSection';
import NewsletterSection from '@/components/storefront/NewsletterSection';
import { ProductCard } from '@/components/storefront/ProductCard';
import QuickViewModal from '@/components/storefront/QuickViewModal';
import { api } from '@/lib/store';
import { Product, Category, HeroSlide, SiteSettings } from '@/types';
import { defaultHeroSlides, defaultCategories, defaultSiteSettings, defaultProducts } from '@/lib/seed-data';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useSiteCustomization } from '@/context/SiteCustomizationContext';
import { sound } from '@/lib/sound';

export default function HomePage() {
  const { language, t } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const { customization } = useSiteCustomization();
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(defaultHeroSlides);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [newArrivals, setNewArrivals] = useState<Product[]>(defaultProducts.slice(0, 4));
  const [bestSellers, setBestSellers] = useState<Product[]>(defaultProducts.slice(4, 8));
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

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

        if (slidesData.length > 0) setHeroSlides(slidesData);
        if (catsData.length > 0) setCategories(catsData);
        if (settingsData) setSiteSettings(settingsData);
        setNewArrivals(newProds);
        setBestSellers(bestProds);
      } catch (e) {
        console.error('Failed to load homepage data', e);
      }
    }
    loadData();
  }, []);

  // Override hero slides with admin-customized slides when available
  const activeHeroSlides = (
    customization?.hero_slides?.filter(s => s.is_active) ?? heroSlides
  ).filter(s => s.is_active);

  return (
    <div className={`min-h-screen flex flex-col bg-transparent ${isLight ? 'text-slate-800' : 'text-[#E8E3D8]'} relative selection:bg-[#FFD700]/30 selection:text-[#FFD700]`}>
      {/* Dynamic Header */}
      <Header
        siteName={siteSettings.site_name}
        announcementText={siteSettings.announcement_bar_text}
        announcementActive={siteSettings.announcement_bar_active}
      />

      <main className="flex-1 relative z-10">
        {/* 1. Hero Section */}
        <HeroSection slides={activeHeroSlides.length > 0 ? activeHeroSlides : heroSlides} />

        {/* 2. Featured Disciplines / Categories */}
        <FeaturedCategories categories={categories} />

        {/* 3. New Arrivals Section */}
        <section className={`py-20 lg:py-28 max-w-[1440px] mx-auto px-6 lg:px-16 border-t ${isLight ? 'border-amber-900/10' : 'border-yellow-500/15'} relative`}>
          {/* Subtle neon ambient backdrop */}
          <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-80 h-80 bg-[radial-gradient(circle,rgba(255,215,0,0.05)_0%,transparent_70%)] pointer-events-none -z-10" />

          <div className={`flex flex-col sm:flex-row sm:items-end justify-between mb-12 pb-5 border-b ${isLight ? 'border-amber-900/10' : 'border-yellow-500/15'}`}>
            <div>
              <span
                className={`text-[11px] font-bold uppercase tracking-[0.25em] ${isLight ? 'text-amber-800' : 'text-[#FFD700]'} block mb-2 flex items-center gap-2`}
                style={{ fontFamily: 'var(--font-rajdhani)' }}
              >
                <Sparkles className={`w-3.5 h-3.5 ${isLight ? 'text-amber-700' : 'text-[#00FFFF]'}`} />
                {language === 'si' ? 'නවතම ශ්‍රී ලාංකීය නිර්මාණ' : 'Latest Island Creations'}
              </span>
              <h2 className={`font-serif text-3xl sm:text-4xl ${isLight ? 'text-slate-900 font-bold' : 'text-white font-normal'} tracking-wide`}>
                {language === 'si' ? 'නැවුම් කලා නිර්මාණ' : 'Fresh From The Workshops'}
              </h2>
            </div>
            <Link
              href="/products"
              onClick={() => sound.playClick()}
              className={`mt-4 sm:mt-0 text-xs font-bold uppercase tracking-[0.15em] ${isLight ? 'text-amber-800 hover:text-amber-950' : 'text-[#00FFFF] hover:text-white'} transition-all flex items-center gap-2 group`}
              style={{ fontFamily: 'var(--font-rajdhani)' }}
            >
              <span>{language === 'si' ? 'සියලු නිර්මාණ නරඹන්න' : 'Explore All Creations'}</span>
              <ArrowRight className={`w-4 h-4 group-hover:translate-x-1.5 transition-transform ${isLight ? 'text-amber-800' : 'text-[#FFD700]'}`} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </section>

        {/* 4. Promotional Banner with Countdown */}
        <PromotionalBanner />

        {/* 5. Best Sellers Section */}
        <section className={`py-20 lg:py-28 max-w-[1440px] mx-auto px-6 lg:px-16 border-t ${isLight ? 'border-amber-900/10' : 'border-yellow-500/15'} relative`}>
          {/* Subtle neon ambient backdrop */}
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-80 h-80 bg-[radial-gradient(circle,rgba(0,255,255,0.04)_0%,transparent_70%)] pointer-events-none -z-10" />

          <div className={`flex flex-col sm:flex-row sm:items-end justify-between mb-12 pb-5 border-b ${isLight ? 'border-amber-900/10' : 'border-yellow-500/15'}`}>
            <div>
              <span
                className={`text-[11px] font-bold uppercase tracking-[0.25em] ${isLight ? 'text-amber-800' : 'text-[#00FFFF]'} block mb-2 flex items-center gap-2`}
                style={{ fontFamily: 'var(--font-rajdhani)' }}
              >
                <Flame className={`w-3.5 h-3.5 ${isLight ? 'text-amber-600' : 'text-[#FF8C00]'}`} />
                {language === 'si' ? 'සිලෝන් විශිෂ්ටතම අංග' : 'Ceylon Masterworks'}
              </span>
              <h2 className={`font-serif text-3xl sm:text-4xl ${isLight ? 'text-slate-900 font-bold' : 'text-white font-normal'} tracking-wide`}>
                {language === 'si' ? 'වඩාත් ආකර්ෂණීය නිර්මාණ' : 'Patron Treasured Pieces'}
              </h2>
            </div>
            <Link
              href="/products?sort=best-selling"
              onClick={() => sound.playClick()}
              className={`mt-4 sm:mt-0 text-xs font-bold uppercase tracking-[0.15em] ${isLight ? 'text-amber-800 hover:text-amber-950' : 'text-[#FFD700] hover:text-white'} transition-all flex items-center gap-2 group`}
              style={{ fontFamily: 'var(--font-rajdhani)' }}
            >
              <span>{language === 'si' ? 'පූර්ණ එකතුව' : 'View Full Treasury'}</span>
              <ArrowRight className={`w-4 h-4 group-hover:translate-x-1.5 transition-transform ${isLight ? 'text-amber-800' : 'text-[#00FFFF]'}`} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestSellers.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(p) => setQuickViewProduct(p)}
              />
            ))}
          </div>
        </section>

        {/* 6. Trust & Craft Guarantees */}
        <TrustBadges />

        {/* 7. Patron Reflections / Testimonials */}
        <TestimonialsSection />

        {/* 8. Private Communique Newsletter */}
        <NewsletterSection />
      </main>

      {/* Footer */}
      <Footer siteName={siteSettings.site_name} tagline={siteSettings.tagline} />

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
}
