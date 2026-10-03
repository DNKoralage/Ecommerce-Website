'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Tag, Zap } from 'lucide-react';
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
  const isLight = theme === 'light';

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [slides.length, isPaused]);

  if (!slides || slides.length === 0) return null;
  const slide = slides[current];

  const currentHeading    = language === 'si' && slide.heading_si    ? slide.heading_si    : slide.heading;
  const currentSubheading = language === 'si' && slide.subheading_si ? slide.subheading_si : slide.subheading;
  const currentCta        = language === 'si' && slide.cta_text_si   ? slide.cta_text_si   : slide.cta_text;
  const currentBadge      = language === 'si' && slide.badge_si      ? slide.badge_si      : (slide.badge || '🎉 Special Offer');

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full overflow-hidden"
      style={{
        minHeight: '520px',
        height: 'clamp(440px, 70vh, 760px)',
        background: isLight
          ? 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 40%, #F0F9FF 100%)'
          : 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 40%, #0F172A 100%)',
      }}
    >
      {/* Background Image with Overlay */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.0, ease: [0.4, 0, 0.2, 1] }}
          className="absolute inset-0"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slide.image_url}
            alt={currentHeading}
            className="w-full h-full object-cover object-center"
          />
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: isLight
                ? 'linear-gradient(to right, rgba(239,246,255,0.95) 0%, rgba(219,234,254,0.85) 50%, rgba(239,246,255,0.4) 100%)'
                : 'linear-gradient(to right, rgba(15,23,42,0.97) 0%, rgba(15,23,42,0.82) 55%, rgba(15,23,42,0.3) 100%)',
            }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Decorative circles */}
      <div
        className="absolute -top-24 -right-24 w-96 h-96 rounded-full pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)' }}
      />
      <div
        className="absolute -bottom-20 right-1/3 w-64 h-64 rounded-full pointer-events-none opacity-10"
        style={{ background: 'radial-gradient(circle, #60A5FA 0%, transparent 70%)' }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-[1440px] mx-auto h-full px-6 lg:px-16 flex flex-col justify-center">
        <div className="max-w-xl">
          {/* Badge */}
          <motion.div
            key={`badge-${slide.id}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="mb-5"
          >
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold rounded-full"
              style={{
                background: 'rgba(37,99,235,0.12)',
                color: '#2563EB',
                border: '1px solid rgba(37,99,235,0.25)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Zap className="w-3.5 h-3.5" />
              {currentBadge}
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            key={`heading-${slide.id}-${language}`}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.1] mb-4 tracking-tight"
            style={{
              color: isLight ? '#0F172A' : '#F1F5F9',
              fontFamily: 'var(--font-outfit)',
            }}
          >
            {currentHeading}
          </motion.h1>

          {/* Blue accent line */}
          <motion.div
            initial={{ scaleX: 0, originX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="mb-5"
            style={{
              height: '3px',
              width: '72px',
              background: 'linear-gradient(90deg, #2563EB, #60A5FA)',
              borderRadius: '999px',
            }}
          />

          {/* Subheading */}
          <motion.p
            key={`sub-${slide.id}-${language}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-base sm:text-lg leading-relaxed mb-8 max-w-md"
            style={{ color: isLight ? '#475569' : '#94A3B8' }}
          >
            {currentSubheading}
          </motion.p>

          {/* CTAs */}
          <motion.div
            key={`cta-${slide.id}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="flex items-center gap-3 flex-wrap"
          >
            <Link
              href={slide.cta_link}
              onClick={() => sound.playClick()}
              className="btn-primary text-sm"
            >
              {currentCta}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
            <Link
              href="/products"
              onClick={() => sound.playClick()}
              className="btn-outline text-sm"
            >
              Browse All
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Slide Controls */}
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-6 lg:left-16 z-20 flex items-center gap-3">
          {/* Dots */}
          <div className="flex items-center gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => { sound.playClick(); setCurrent(i); }}
                aria-label={`Slide ${i + 1}`}
                className="transition-all duration-400 cursor-pointer rounded-full"
                style={{
                  width: current === i ? '28px' : '8px',
                  height: '8px',
                  background: current === i ? '#2563EB' : (isLight ? 'rgba(37,99,235,0.3)' : 'rgba(148,163,184,0.4)'),
                }}
              />
            ))}
          </div>

          {/* Arrows */}
          <div className="flex items-center gap-1.5 ml-2">
            {[
              { icon: ChevronLeft,  label: 'Previous', fn: () => setCurrent((p) => (p === 0 ? slides.length - 1 : p - 1)) },
              { icon: ChevronRight, label: 'Next',     fn: () => setCurrent((p) => (p + 1) % slides.length) },
            ].map(({ icon: Icon, label, fn }) => (
              <button
                key={label}
                onClick={() => { sound.playClick(); fn(); }}
                className="p-2 rounded-xl transition-all cursor-pointer"
                style={{
                  background: isLight ? 'rgba(255,255,255,0.9)' : 'rgba(30,41,59,0.8)',
                  border: `1px solid ${isLight ? '#E2E8F0' : 'rgba(51,65,85,0.7)'}`,
                  color: isLight ? '#0F172A' : '#F1F5F9',
                  backdropFilter: 'blur(8px)',
                }}
                aria-label={label}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
