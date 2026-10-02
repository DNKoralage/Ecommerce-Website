'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Category } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { sound } from '@/lib/sound';

interface FeaturedCategoriesProps {
  categories: Category[];
}

export default function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  const { language, t } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <section className="py-16 lg:py-24 max-w-[1440px] mx-auto px-6 lg:px-16 relative">
      {/* Section Header */}
      <div
        className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 pb-4 border-b"
        style={{
          borderColor: isLight ? 'rgba(212, 175, 55, 0.3)' : 'rgba(255, 215, 0, 0.15)',
        }}
      >
        <div>
          <span
            className="text-[11px] font-bold uppercase tracking-[0.25em] block mb-2 flex items-center gap-1.5"
            style={{
              color: isLight ? '#996515' : '#FFD700',
              fontFamily: 'var(--font-rajdhani)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            {language === 'si' ? 'ශ්‍රී ලාංකීය උරුමය හා ශිල්පීයත්වය' : 'Heritage Guilds & Living Craft'}
          </span>
          <h2
            className={`text-2xl sm:text-4xl font-normal tracking-wide ${
              language === 'si' ? 'font-sinhala font-bold' : 'font-serif'
            }`}
            style={{
              color: isLight ? '#0F172A' : '#FFFFFF',
            }}
          >
            {language === 'si' ? 'සිලෝන් ප්‍රධාන කලා අංශ' : 'Ceylon Disciplines'}
          </h2>
        </div>
        <Link
          href="/products"
          onClick={() => sound.playClick()}
          className="mt-3 sm:mt-0 text-xs font-bold uppercase tracking-[0.15em] flex items-center gap-2 group transition-all"
          style={{
            color: isLight ? '#0284C7' : '#00FFFF',
            fontFamily: 'var(--font-rajdhani)',
          }}
        >
          <span className={language === 'si' ? 'font-sinhala' : ''}>
            {language === 'si' ? 'සියලු අංශ නරඹන්න' : 'Explore All Guilds'}
          </span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
        </Link>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {categories.map((cat, idx) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.08 }}
            onMouseEnter={() => sound.playChime()}
            className="group relative"
          >
            <Link
              href={`/products?category=${cat.slug}`}
              onClick={() => sound.playClick()}
              className="block h-full"
            >
              {/* Card Container */}
              <div
                className="relative aspect-[4/5] overflow-hidden rounded-sm transition-all duration-500 group-hover:-translate-y-2"
                style={{
                  background: isLight ? '#FFFFFF' : 'rgba(8, 12, 28, 0.75)',
                  border: isLight
                    ? '1px solid rgba(212, 175, 55, 0.4)'
                    : '1px solid rgba(255, 215, 0, 0.2)',
                  boxShadow: isLight
                    ? '0 6px 20px rgba(0, 0, 0, 0.06)'
                    : '0 4px 20px rgba(0, 0, 0, 0.6), inset 0 0 15px rgba(255, 215, 0, 0.03)',
                  backdropFilter: 'blur(12px)',
                  clipPath:
                    'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
                }}
              >
                {/* Image */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.image_url || 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                />

                {/* Gradient Overlay */}
                <div
                  className="absolute inset-0 transition-opacity duration-300"
                  style={{
                    background:
                      'linear-gradient(to top, rgba(5,7,18,0.92) 0%, rgba(5,7,18,0.4) 50%, transparent 100%)',
                  }}
                />

                {/* Corner Accents */}
                <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t border-l border-[#FFD700]" />
                <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t border-r border-[#00FFFF]" />

                {/* Content */}
                <div className="absolute bottom-4 left-4 right-4 text-white z-10">
                  <span
                    className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#00FFFF] block mb-1"
                    style={{ fontFamily: 'var(--font-rajdhani)' }}
                  >
                    {cat.product_count ?? 3} {language === 'si' ? 'නිර්මාණ' : 'Editions'}
                  </span>
                  <h3
                    className={`text-lg font-bold text-white group-hover:text-[#FFD700] transition-colors duration-300 leading-snug ${
                      language === 'si' ? 'font-sinhala' : 'font-serif'
                    }`}
                    style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
                  >
                    {t(cat.name)}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p
                className={`mt-2.5 text-xs line-clamp-2 leading-relaxed px-1 ${
                  language === 'si' ? 'font-sinhala' : ''
                }`}
                style={{
                  color: isLight ? '#475569' : 'rgba(232, 227, 216, 0.65)',
                }}
              >
                {t(cat.name)}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
