'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Package } from 'lucide-react';
import { Category } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { sound } from '@/lib/sound';

interface FeaturedCategoriesProps {
  categories: Category[];
}

const CATEGORY_EMOJIS: Record<string, string> = {
  jewellery:    '💎',
  textiles:     '🧵',
  'sacred-living': '🪔',
  ayurveda:     '🌿',
  tea:          '🍃',
  default:      '🛍️',
};

export default function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  const { language, t } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const bg      = isLight ? '#FFFFFF' : '#1E293B';
  const bgMuted = isLight ? '#F8FAFC' : '#0F172A';
  const border  = isLight ? '#E2E8F0' : 'rgba(51,65,85,0.7)';
  const txtMain = isLight ? '#0F172A' : '#F1F5F9';
  const txtMute = isLight ? '#64748B' : '#94A3B8';

  return (
    <section
      className="py-12 lg:py-16"
      style={{ background: bgMuted }}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">

        {/* Section Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <span
              className="text-xs font-semibold uppercase tracking-widest mb-1.5 block"
              style={{ color: '#2563EB' }}
            >
              Shop by Category
            </span>
            <h2
              className="text-2xl sm:text-3xl font-bold"
              style={{ color: txtMain, fontFamily: 'var(--font-outfit)' }}
            >
              {language === 'si' ? 'ප්‍රධාන කලා අංශ' : 'Explore Disciplines'}
            </h2>
          </div>
          <Link
            href="/products"
            onClick={() => sound.playClick()}
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold transition-all group"
            style={{ color: '#2563EB' }}
          >
            View All
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Horizontal Scrollable Chips (mobile) / Grid (desktop) */}
        <div className="flex overflow-x-auto gap-3 pb-2 hide-scrollbar sm:grid sm:grid-cols-3 lg:grid-cols-6 sm:overflow-visible sm:pb-0">
          {categories.map((cat, idx) => {
            const emoji = CATEGORY_EMOJIS[cat.slug] ?? CATEGORY_EMOJIS.default;
            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                className="flex-shrink-0"
              >
                <Link
                  href={`/products?category=${cat.slug}`}
                  onClick={() => sound.playClick()}
                  className="group block"
                >
                  <div
                    className="relative overflow-hidden transition-all duration-300 flex flex-col items-center text-center"
                    style={{
                      background: bg,
                      border: `1.5px solid ${border}`,
                      borderRadius: '20px',
                      padding: '20px 12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      minWidth: '110px',
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = 'rgba(37,99,235,0.4)';
                      el.style.boxShadow = '0 8px 24px rgba(37,99,235,0.12)';
                      el.style.transform = 'translateY(-4px)';
                      el.style.background = isLight ? '#EFF6FF' : 'rgba(37,99,235,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLElement;
                      el.style.borderColor = border;
                      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
                      el.style.transform = 'translateY(0)';
                      el.style.background = bg;
                    }}
                  >
                    {/* Image or Emoji */}
                    {cat.image_url ? (
                      <div className="w-14 h-14 rounded-2xl overflow-hidden mb-3 flex-shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={cat.image_url}
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 text-2xl flex-shrink-0"
                        style={{ background: isLight ? '#EFF6FF' : 'rgba(37,99,235,0.12)' }}
                      >
                        {emoji}
                      </div>
                    )}

                    <h3
                      className="text-xs font-semibold leading-tight mb-1"
                      style={{ color: txtMain }}
                    >
                      {t(cat.name)}
                    </h3>
                    <span className="text-[10px]" style={{ color: txtMute }}>
                      {cat.product_count ?? 0} items
                    </span>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
