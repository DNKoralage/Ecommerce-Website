'use client';

import React from 'react';
import { Truck, Gem, Award, Leaf } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

export default function TrustBadges() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const badges = [
    {
      icon: Gem,
      titleEn: 'Certified Ceylon Provenance',
      titleSi: 'සහතික කළ දේශීය සම්භවය',
      descEn:
        'Every gem, textile, and artifact is sourced directly from Sri Lankan artisan communities with full provenance documentation.',
      descSi:
        'සෑම මැණික්, රෙදිපිළි සහ කලා නිර්මාණයක්ම ශ්‍රී ලාංකීය පාරම්පරික කලා ශිල්පීන්ගෙන් සෘජුව ලබාගත් සහතිකලත් නිර්මාණ වේ.',
      color: isLight ? '#996515' : '#FFD700',
    },
    {
      icon: Truck,
      titleEn: 'Island & Worldwide Delivery',
      titleSi: 'දිවයින පුරා හා විදේශ බෙදාහැරීම',
      descEn:
        'Free island-wide shipping on orders over Rs.7,500. Insured courier across all 9 provinces and global DHL Express.',
      descSi:
        'රු. 7,500 ට වැඩි ඇණවුම් සඳහා දිවයින පුරා නොමිලේ බෙදාහැරීම. පළාත් 9 ම ආවරණය වන පරිදි විශ්වාසනීය කුරියර් සේවාව.',
      color: isLight ? '#0284C7' : '#00FFFF',
    },
    {
      icon: Award,
      titleEn: 'Master Artisan Lineage',
      titleSi: 'පාරම්පරික ශිල්පීය අභිමානය',
      descEn:
        'Each creation includes an authenticity seal recognizing the master craftsperson lineage and Sri Lanka heritage guild standard.',
      descSi:
        'සෑම කලා නිර්මාණයක් සමඟම පාරම්පරික ශිල්පීයත්වය සහතික කරන විශේෂ තත්ත්ව සහතිකයක් හිමිවේ.',
      color: isLight ? '#059669' : '#00FF88',
    },
    {
      icon: Leaf,
      titleEn: 'Ethically & Sustainably Made',
      titleSi: 'තිරසාර හා සාධාරණ වෙළඳාම',
      descEn:
        'We support fair artisan wages, natural zero-chemical dyes, and eco-conscious banana-fiber packaging across all cooperatives.',
      descSi:
        'දේශීය ශිල්පීන්ට සාධාරණ මිලක්, ස්වභාවික වර්ණක සහ පරිසර හිතකාමී ඇසුරුම්කරණය සහතික කරමු.',
      color: isLight ? '#7C3AED' : '#BF5FFF',
    },
  ];

  return (
    <section
      className="py-14 relative transition-colors"
      style={{
        background: isLight
          ? 'linear-gradient(180deg, #FFFFFF 0%, #FAF8F5 100%)'
          : 'linear-gradient(180deg, rgba(4,6,18,0.95) 0%, rgba(6,8,24,0.98) 100%)',
        borderTop: isLight ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(255,215,0,0.1)',
        borderBottom: isLight ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(255,215,0,0.1)',
      }}
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {badges.map((b) => {
            const Icon = b.icon;
            return (
              <div key={b.titleEn} className="flex items-start gap-3.5 group">
                <div
                  className="p-2.5 flex-shrink-0 transition-all duration-300 group-hover:scale-110 rounded-xs"
                  style={{
                    background: isLight ? '#FFFFFF' : `${b.color}15`,
                    border: isLight ? `1px solid rgba(212, 175, 55, 0.5)` : `1px solid ${b.color}40`,
                    boxShadow: isLight
                      ? '0 2px 8px rgba(0,0,0,0.05)'
                      : `0 0 12px ${b.color}20`,
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: b.color }} />
                </div>
                <div>
                  <h4
                    className={`text-sm font-bold mb-1 ${
                      language === 'si' ? 'font-sinhala' : 'font-serif'
                    }`}
                    style={{
                      color: isLight ? '#0F172A' : b.color,
                    }}
                  >
                    {language === 'si' ? b.titleSi : b.titleEn}
                  </h4>
                  <p
                    className={`text-xs leading-relaxed ${
                      language === 'si' ? 'font-sinhala text-[12px]' : ''
                    }`}
                    style={{
                      color: isLight ? '#475569' : 'rgba(232,227,216,0.65)',
                    }}
                  >
                    {language === 'si' ? b.descSi : b.descEn}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
