'use client';

import React from 'react';
import { Star, Quote, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';

export default function TestimonialsSection() {
  const { language, t } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const reviews = [
    {
      id: 'rev-1',
      titleEn: 'Exquisite Ratnapura Sapphire Provenance',
      titleSi: 'විශිෂ්ට රත්නපුර නිල් මැණික් පළඳනාවක්',
      bodyEn:
        'The unheated Ceylon blue sapphire pendant arrived in a carved ebony box with its National Gem Authority certificate. The stone clarity in sunlight is peerless.',
      bodySi:
        'ජාතික මැණික් අධිකාරියේ සහතිකය සමඟ කළුවර දැව පෙට්ටියක ඉතා අලංකාරව ලබාදුන් රත්නපුර නිල් මැණික් පෙන්ඩනය සැබවින්ම විශිෂ්ටයි.',
      author: 'Dr. Senaka Weerakoon',
      roleEn: 'Verified Collector · Colombo',
      roleSi: 'තහවුරු කළ පාරිභෝගික · කොළඹ',
      rating: 5,
    },
    {
      id: 'rev-2',
      titleEn: 'Heirloom-Grade Kandyan Silk Handloom',
      titleSi: 'පරම්පරාවට උරුමවන උඩරට සේද සාරියක්',
      bodyEn:
        'The Degaldoruwa temple motif handloom saree is a true work of art. The weight of the pure silk and gold zari weave speaks volumes of master village weavers.',
      bodySi:
        'දෙගල්දොරුව විහාරයේ සම්ප්‍රදායික කැටයම් රටාවෙන් අතින් වියන ලද සේද සාරියේ නිමාව ඉතා විශිෂ්ටයි. අපගේ පවුලේ විශේෂ උත්සව සඳහා වඩාත් සුදුසුය.',
      author: 'Anoma Jayasinghe',
      roleEn: 'Heritage Patron · Kandy',
      roleSi: 'කලා ලෝලී පාරිභෝගික · මහනුවර',
      rating: 5,
    },
    {
      id: 'rev-3',
      titleEn: 'Single-Estate Nuwara Eliya Silver Tips',
      titleSi: 'නුවරඑළියේ අග්‍රගන්‍ය සිල්වර් ටිප්ස් තේ',
      bodyEn:
        'Pure celestial aroma. Drinking this single-estate tea in London instantly transported me back to the misty tea slopes of Pedro Estate in Nuwara Eliya.',
      bodySi:
        'නුවරඑළිය කඳුකරයේ සැබෑ සුවඳ සහ රසය මේ සිල්වර් ටිප්ස් තේ එකෙන් විඳින්න පුළුවන්. විදේශයක සිටියත් ශ්‍රී ලාංකීය රසය සෘජුවම අත්විඳින්න ලැබීම සතුටක්.',
      author: 'Kavinda Perera',
      roleEn: 'Tea Connoisseur · London / Galle',
      roleSi: 'තේ රසඥ · ලන්ඩන් / ගාල්ල',
      rating: 5,
    },
  ];

  return (
    <section className="py-18 lg:py-24 max-w-[1440px] mx-auto px-6 lg:px-16 relative">
      <div className="text-center max-w-xl mx-auto mb-12">
        <span
          className="text-[11px] font-bold uppercase tracking-[0.25em] block mb-2"
          style={{
            color: isLight ? '#996515' : '#00FFFF',
            fontFamily: 'var(--font-rajdhani)',
          }}
        >
          {language === 'si' ? 'පාරිභෝගික පැසසුම් සහ අදහස්' : 'Patron Communique & Chronicles'}
        </span>
        <h2
          className={`text-2xl sm:text-4xl font-normal tracking-wide ${
            language === 'si' ? 'font-sinhala font-bold' : 'font-serif'
          }`}
          style={{ color: isLight ? '#0F172A' : '#FFFFFF' }}
        >
          {language === 'si' ? 'අපගේ නිර්මාණ අගය කළ පාරිභෝගික අදහස්' : 'Reflections from Custodians'}
        </h2>
        <div
          className="h-[2px] w-24 mx-auto mt-4"
          style={{
            background: isLight
              ? 'linear-gradient(90deg, transparent, #B8860B, transparent)'
              : 'linear-gradient(90deg, transparent, #FFD700, transparent)',
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((rev, idx) => (
          <div
            key={rev.id}
            className="p-7 relative flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 rounded-sm"
            style={{
              background: isLight ? '#FFFFFF' : 'rgba(8, 12, 28, 0.75)',
              border: isLight
                ? '1px solid rgba(212, 175, 55, 0.35)'
                : `1px solid ${idx % 2 === 0 ? 'rgba(255, 215, 0, 0.22)' : 'rgba(0, 255, 255, 0.22)'}`,
              boxShadow: isLight
                ? '0 6px 20px rgba(0,0,0,0.06)'
                : '0 10px 30px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(16px)',
              clipPath:
                'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
            }}
          >
            <div>
              <Quote
                className="w-6 h-6 mb-3"
                style={{
                  color: isLight ? '#B8860B' : idx % 2 === 0 ? '#FFD700' : '#00FFFF',
                  opacity: 0.6,
                }}
              />

              <div className="flex items-center gap-1 mb-2.5">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-current text-amber-500" />
                ))}
              </div>

              <h4
                className={`text-base mb-2 leading-snug font-bold ${
                  language === 'si' ? 'font-sinhala' : 'font-serif'
                }`}
                style={{ color: isLight ? '#0F172A' : '#FFFFFF' }}
              >
                &ldquo;{language === 'si' ? rev.titleSi : rev.titleEn}&rdquo;
              </h4>
              <p
                className={`text-xs leading-relaxed ${
                  language === 'si' ? 'font-sinhala text-[13px]' : ''
                }`}
                style={{ color: isLight ? '#475569' : 'rgba(232,227,216,0.7)' }}
              >
                {language === 'si' ? rev.bodySi : rev.bodyEn}
              </p>
            </div>

            <div
              className="mt-6 pt-3.5 border-t flex items-center justify-between text-xs"
              style={{
                borderColor: isLight ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 215, 0, 0.15)',
              }}
            >
              <span
                className="font-bold"
                style={{
                  color: isLight ? '#0F172A' : '#FFFFFF',
                  fontFamily: 'var(--font-rajdhani)',
                }}
              >
                {rev.author}
              </span>
              <span
                className="text-[10px] flex items-center gap-1 uppercase font-bold"
                style={{
                  color: isLight ? '#059669' : '#00FF88',
                  fontFamily: 'var(--font-rajdhani)',
                }}
              >
                <ShieldCheck className="w-3 h-3" />
                <span>{language === 'si' ? rev.roleSi : rev.roleEn}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
