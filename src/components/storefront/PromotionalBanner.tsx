'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Gem } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { sound } from '@/lib/sound';

export default function PromotionalBanner() {
  const { language, t } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [timeLeft, setTimeLeft] = useState({
    days: 4,
    hours: 18,
    minutes: 36,
    seconds: 45,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 max-w-[1440px] mx-auto px-6 lg:px-16">
      <div
        className="relative overflow-hidden p-8 sm:p-12 lg:p-16 transition-all duration-500 rounded-sm"
        style={{
          background: isLight
            ? 'linear-gradient(135deg, #FFFFFF 0%, #FAF8F2 100%)'
            : 'linear-gradient(135deg, rgba(6, 9, 24, 0.95) 0%, rgba(2, 3, 10, 0.98) 100%)',
          border: isLight
            ? '1px solid rgba(212, 175, 55, 0.45)'
            : '1px solid rgba(255, 215, 0, 0.25)',
          boxShadow: isLight
            ? '0 10px 30px rgba(0, 0, 0, 0.06)'
            : '0 0 50px rgba(255, 215, 0, 0.08), inset 0 0 40px rgba(0, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          clipPath:
            'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))',
        }}
      >
        {/* Holographic grid & corner decorations */}
        <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-[#FFD700]" />
        <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-[#00FFFF]" />
        <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-[#00FFFF]" />
        <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-[#FFD700]" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10">
          {/* Text Information */}
          <div className="max-w-xl text-center lg:text-left">
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase font-bold tracking-[0.2em] mb-4"
              style={{
                background: isLight ? 'rgba(212, 175, 55, 0.15)' : 'rgba(255, 215, 0, 0.1)',
                border: isLight
                  ? '1px solid rgba(212, 175, 55, 0.4)'
                  : '1px solid rgba(255, 215, 0, 0.35)',
                color: isLight ? '#996515' : '#FFD700',
                fontFamily: 'var(--font-rajdhani)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className={language === 'si' ? 'font-sinhala' : ''}>
                {t('privilegeBanner')}
              </span>
            </span>

            <h2
              className={`text-2xl sm:text-4xl lg:text-5xl font-normal leading-tight mb-4 tracking-wide ${
                language === 'si' ? 'font-sinhala font-bold' : 'font-serif'
              }`}
              style={{ color: isLight ? '#0F172A' : '#FFFFFF' }}
            >
              {language === 'si' ? (
                'රාජකීය සිලෝන් වට්ටම් වරප්‍රසාදය'
              ) : (
                <>
                  The Island Archive{' '}
                  <span
                    style={{
                      color: isLight ? '#B8860B' : '#FFD700',
                    }}
                  >
                    Privilege
                  </span>
                </>
              )}
            </h2>

            <p
              className={`text-xs sm:text-sm leading-relaxed max-w-lg ${
                language === 'si' ? 'font-sinhala text-[14px]' : ''
              }`}
              style={{ color: isLight ? '#475569' : 'rgba(232, 227, 216, 0.75)' }}
            >
              {language === 'si'
                ? 'SOLSTICE20 කේතය භාවිත කරමින් සහතිකලත් සිලෝන් නිල් මැණික්, උඩරට සේද රෙදිපිළි සහ පූජනීය පිත්තල පහන් සඳහා 20% ක විශේෂ වට්ටමක් ලබාගන්න.'
                : 'Enjoy 15% archival savings with code CEYLON22 across certified Ceylon sapphire jewelry, master-woven Kandyan handlooms, and ancient sacred bronze temple decor.'}
            </p>
          </div>

          {/* Countdown Clock & CTA */}
          <div className="flex flex-col items-center gap-6">
            <div className="flex items-center gap-2.5 sm:gap-3.5 text-center">
              {[
                { label: t('days'), val: timeLeft.days },
                { label: t('hours'), val: timeLeft.hours },
                { label: t('minutes'), val: timeLeft.minutes },
                { label: t('seconds'), val: timeLeft.seconds },
              ].map((unit, i) => (
                <div
                  key={unit.label}
                  className="w-16 sm:w-18 py-2.5 relative rounded-xs"
                  style={{
                    background: isLight ? '#FFFFFF' : 'rgba(10, 15, 35, 0.7)',
                    border: isLight
                      ? '1px solid rgba(212, 175, 55, 0.4)'
                      : `1px solid ${i % 2 === 0 ? 'rgba(255,215,0,0.35)' : 'rgba(0,255,255,0.35)'}`,
                    boxShadow: isLight
                      ? '0 2px 8px rgba(0,0,0,0.04)'
                      : i % 2 === 0
                      ? '0 0 15px rgba(255,215,0,0.15)'
                      : '0 0 15px rgba(0,255,255,0.15)',
                  }}
                >
                  <span
                    className="font-serif text-xl sm:text-2xl font-bold block"
                    style={{
                      color: isLight
                        ? '#996515'
                        : i % 2 === 0
                        ? '#FFD700'
                        : '#00FFFF',
                    }}
                  >
                    {String(unit.val).padStart(2, '0')}
                  </span>
                  <span
                    className={`text-[9px] uppercase tracking-[0.16em] block mt-0.5 font-bold ${
                      language === 'si' ? 'font-sinhala' : ''
                    }`}
                    style={{
                      color: isLight ? '#64748B' : 'rgba(232, 227, 216, 0.5)',
                      fontFamily: 'var(--font-rajdhani)',
                    }}
                  >
                    {unit.label}
                  </span>
                </div>
              ))}
            </div>

            <Link
              href="/products"
              onClick={() => sound.playClick()}
              className="btn-neon-gold text-xs"
            >
              <Gem className="w-4 h-4" />
              <span className={language === 'si' ? 'font-sinhala' : ''}>
                {language === 'si' ? 'වරප්‍රසාදය ලබාගන්න' : 'Claim Archival Privilege'}
              </span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
