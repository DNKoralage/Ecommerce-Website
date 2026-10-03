'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Tag, Clock, Zap, Gift } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { sound } from '@/lib/sound';

export default function PromotionalBanner() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [timeLeft, setTimeLeft] = useState({ days: 4, hours: 18, minutes: 36, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0)   return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0)    return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  /* Multiple banner slides */
  const banners = [
    {
      id: 'sale',
      tag: '🔥 Flash Sale',
      title: language === 'si' ? 'රාජකීය වට්ටම් 30%' : 'Get 30% OFF Sitewide',
      subtitle: language === 'si'
        ? 'SOLSTICE20 කේතය භාවිත කරන්න'
        : 'Use code CEYLON22 at checkout. Limited time only!',
      cta: 'Shop the Sale',
      href: '/products',
      gradient: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 50%, #1E40AF 100%)',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const banner = banners[0];

  return (
    <section className="py-8 lg:py-12 max-w-[1440px] mx-auto px-6 lg:px-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden"
        style={{
          background: banner.gradient,
          borderRadius: '24px',
          minHeight: '200px',
          boxShadow: '0 16px 48px rgba(37,99,235,0.35)',
        }}
      >
        {/* Background decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="absolute -bottom-10 right-1/4 w-40 h-40 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.07)' }} />
        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-72 h-72 rounded-full pointer-events-none" style={{ background: 'rgba(255,255,255,0.04)' }} />

        {/* Product image on right */}
        <div className="absolute right-0 top-0 bottom-0 w-56 sm:w-72 lg:w-96 pointer-events-none hidden sm:block overflow-hidden" style={{ borderRadius: '0 24px 24px 0' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={banner.image}
            alt="Sale banner"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(37,99,235,0.9) 0%, rgba(37,99,235,0.3) 100%)' }} />
        </div>

        {/* Content */}
        <div className="relative z-10 p-8 sm:p-10 lg:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          {/* Text */}
          <div className="max-w-lg">
            <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-bold rounded-full bg-white/20 text-white mb-4">
              <Zap className="w-3.5 h-3.5" />
              {banner.tag}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight" style={{ fontFamily: 'var(--font-outfit)' }}>
              {banner.title}
            </h2>
            <p className="text-white/80 text-sm sm:text-base mb-6 leading-relaxed">{banner.subtitle}</p>

            <Link
              href={banner.href}
              onClick={() => sound.playClick()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: '#FFFFFF',
                color: '#2563EB',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 14px rgba(0,0,0,0.15)'; }}
            >
              <Gift className="w-4 h-4" />
              {banner.cta}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {/* Countdown */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-1.5 text-white/70 text-xs font-semibold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5" />
              Offer Ends In
            </div>
            <div className="flex items-center gap-2">
              {[
                { label: 'Days',  val: timeLeft.days },
                { label: 'Hrs',   val: timeLeft.hours },
                { label: 'Min',   val: timeLeft.minutes },
                { label: 'Sec',   val: timeLeft.seconds },
              ].map((unit, i) => (
                <React.Fragment key={unit.label}>
                  <div
                    className="flex flex-col items-center px-3 py-2 rounded-2xl min-w-[52px]"
                    style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
                  >
                    <span className="text-xl sm:text-2xl font-bold text-white tabular-nums" style={{ fontFamily: 'var(--font-outfit)' }}>
                      {String(unit.val).padStart(2, '0')}
                    </span>
                    <span className="text-[9px] font-medium text-white/70 uppercase tracking-wider mt-0.5">
                      {unit.label}
                    </span>
                  </div>
                  {i < 3 && <span className="text-xl font-bold text-white/50 -mt-3">:</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
