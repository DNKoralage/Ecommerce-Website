'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import { HeroSlide } from '@/types';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { sound } from '@/lib/sound';

interface HeroSectionProps {
  slides: HeroSlide[];
}

export default function HeroSection({ slides }: HeroSectionProps) {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { language } = useLanguage();
  const { theme } = useTheme();

  // Auto-advance slides every 6 seconds unless user is hovering
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length, isPaused]);

  if (!slides || slides.length === 0) return null;
  const slide = slides[current];

  const currentHeading = language === 'si' && slide.heading_si ? slide.heading_si : slide.heading;
  const currentSubheading = language === 'si' && slide.subheading_si ? slide.subheading_si : slide.subheading;
  const currentCta = language === 'si' && slide.cta_text_si ? slide.cta_text_si : slide.cta_text;
  const currentBadge = language === 'si' && slide.badge_si ? slide.badge_si : (slide.badge || '✦ Authentic Ceylon Living Heritage');

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full h-[88vh] min-h-[620px] max-h-[960px] overflow-hidden"
      style={{
        background: theme === 'light' ? '#F8F6F0' : '#050814',
      }}
    >
      {/* 1. Animated Slide Background with High-Resolution Imagery */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0 w-full h-full"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slide.image_url}
            alt={currentHeading}
            className="w-full h-full object-cover object-center"
          />

          {/* Cinematic Dual Gradient Overlays tailored to Theme */}
          {theme === 'dark' ? (
            <>
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to top, rgba(3,5,15,0.95) 0%, rgba(3,5,15,0.65) 45%, rgba(3,5,15,0.2) 100%)',
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to right, rgba(3,5,15,0.85) 0%, rgba(3,5,15,0.4) 60%, transparent 100%)',
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse 60% 40% at 30% 90%, rgba(255,215,0,0.1) 0%, transparent 70%)',
                }}
              />
            </>
          ) : (
            <>
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to top, rgba(248,246,240,0.96) 0%, rgba(248,246,240,0.6) 50%, rgba(248,246,240,0.2) 100%)',
                }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(to right, rgba(248,246,240,0.92) 0%, rgba(248,246,240,0.5) 60%, transparent 100%)',
                }}
              />
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {/* 2. Cyber-Heritage Corner Accents */}
      <div className="absolute top-6 left-6 z-20 pointer-events-none opacity-40">
        <div className="w-8 h-8 border-t-2 border-l-2 border-[#FFD700]" />
      </div>
      <div className="absolute top-6 right-6 z-20 pointer-events-none opacity-40">
        <div className="w-8 h-8 border-t-2 border-r-2 border-[#00FFFF]" />
      </div>

      {/* 3. Hero Slide Main Content */}
      <div className="relative z-20 max-w-[1440px] mx-auto h-full px-6 lg:px-16 flex flex-col justify-end pb-24 sm:pb-28">
        <div className="max-w-2xl">
          {/* Badge */}
          <motion.div
            key={`badge-${slide.id}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 mb-4"
          >
            <span
              className="text-[10px] font-bold tracking-[0.22em] uppercase px-3 py-1.5 flex items-center gap-1.5"
              style={{
                background:
                  theme === 'light'
                    ? 'rgba(255, 255, 255, 0.95)'
                    : 'linear-gradient(135deg, rgba(255,215,0,0.18), rgba(255,140,0,0.1))',
                border:
                  theme === 'light'
                    ? '1px solid rgba(212, 175, 55, 0.45)'
                    : '1px solid rgba(255,215,0,0.5)',
                color: theme === 'light' ? '#996515' : '#FFD700',
                boxShadow:
                  theme === 'light'
                    ? '0 2px 10px rgba(0,0,0,0.06)'
                    : '0 0 14px rgba(255,215,0,0.25)',
                fontFamily: 'var(--font-rajdhani)',
                clipPath:
                  'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
              }}
            >
              <Sparkles className="w-3 h-3 text-[#00FFFF]" />
              <span className={language === 'si' ? 'font-sinhala text-[11px]' : ''}>
                {currentBadge}
              </span>
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            key={`heading-${slide.id}-${language}`}
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className={`text-3xl sm:text-5xl lg:text-6xl font-normal tracking-tight leading-[1.12] mb-4 ${
              language === 'si' ? 'font-sinhala font-bold leading-tight' : 'font-serif'
            }`}
            style={{
              color: theme === 'light' ? '#0F172A' : '#FFFFFF',
              textShadow:
                theme === 'light'
                  ? 'none'
                  : '0 0 25px rgba(255,215,0,0.25)',
            }}
          >
            {currentHeading}
          </motion.h1>

          {/* Golden / Cyan Neon Accent Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="origin-left mb-5"
            style={{
              height: '2px',
              width: '130px',
              background: 'linear-gradient(90deg, #FFD700, #00FFFF, transparent)',
              boxShadow: '0 0 10px rgba(255,215,0,0.6)',
            }}
          />

          {/* Subheading */}
          <motion.p
            key={`sub-${slide.id}-${language}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className={`text-sm sm:text-base font-normal leading-relaxed max-w-xl mb-8 ${
              language === 'si' ? 'font-sinhala text-[14px]' : ''
            }`}
            style={{
              color: theme === 'light' ? '#334155' : 'rgba(235, 230, 220, 0.82)',
            }}
          >
            {currentSubheading}
          </motion.p>

          {/* CTAs */}
          <motion.div
            key={`cta-${slide.id}`}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            className="flex items-center gap-3.5 flex-wrap"
          >
            <Link
              href={slide.cta_link}
              onClick={() => sound.playClick()}
              className="btn-neon-gold"
            >
              <span className={language === 'si' ? 'font-sinhala text-xs' : ''}>
                {currentCta}
              </span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/products"
              onClick={() => sound.playClick()}
              className="btn-neon-outline"
            >
              <span className={language === 'si' ? 'font-sinhala text-xs' : ''}>
                {language === 'si' ? 'සියලු නිර්මාණ බලන්න' : 'Browse All Treasures'}
              </span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* 4. Slide Navigation Controls (5 Interactive Dots + Prev/Next Arrows) */}
      <div className="absolute bottom-8 right-6 lg:right-16 z-20 flex items-center gap-4">
        {/* 5 Dots */}
        <div className="flex items-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                sound.playClick();
                setCurrent(i);
              }}
              aria-label={`Go to slide ${i + 1}`}
              className="group py-2 cursor-pointer"
            >
              <div
                className="h-1 transition-all duration-500 rounded-full"
                style={{
                  width: current === i ? '36px' : '10px',
                  background:
                    current === i
                      ? 'linear-gradient(90deg, #FFD700, #00FFFF)'
                      : theme === 'light'
                      ? 'rgba(15, 23, 42, 0.2)'
                      : 'rgba(255, 215, 0, 0.25)',
                  boxShadow:
                    current === i ? '0 0 10px rgba(255,215,0,0.8)' : 'none',
                }}
              />
            </button>
          ))}
        </div>

        {/* Prev / Next Arrows */}
        <div className="flex items-center gap-2 ml-1">
          <button
            onClick={() => {
              sound.playClick();
              setCurrent((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
            }}
            className="p-2 backdrop-blur-md transition-all cursor-pointer rounded-xs"
            style={{
              background:
                theme === 'light'
                  ? 'rgba(255, 255, 255, 0.9)'
                  : 'rgba(10, 15, 30, 0.8)',
              border:
                theme === 'light'
                  ? '1px solid rgba(212, 175, 55, 0.4)'
                  : '1px solid rgba(255, 215, 0, 0.3)',
              color: theme === 'light' ? '#0F172A' : '#FFD700',
            }}
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              sound.playClick();
              setCurrent((prev) => (prev + 1) % slides.length);
            }}
            className="p-2 backdrop-blur-md transition-all cursor-pointer rounded-xs"
            style={{
              background:
                theme === 'light'
                  ? 'rgba(255, 255, 255, 0.9)'
                  : 'rgba(10, 15, 30, 0.8)',
              border:
                theme === 'light'
                  ? '1px solid rgba(212, 175, 55, 0.4)'
                  : '1px solid rgba(255, 215, 0, 0.3)',
              color: theme === 'light' ? '#0F172A' : '#FFD700',
            }}
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
