'use client';

import React, { useState } from 'react';
import { ArrowRight, Check, Send, Sparkles } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/lib/store';
import { sound } from '@/lib/sound';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { success, error } = useToast();
  const { language, t } = useLanguage();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      error(language === 'si' ? 'කරුණාකර නිවැරදි විද්‍යුත් තැපැල් ලිපිනයක් ඇතුළත් කරන්න.' : 'Please enter a valid email address.');
      return;
    }
    sound.playSuccess();
    setIsSubmitting(true);
    await api.subscribeNewsletter(email);
    setIsSubmitting(false);
    setIsSubscribed(true);
    success(language === 'si' ? 'සිලෝන් ටයිම්ස් පුවත් පත්‍රිකාවට ඔබව සාදරයෙන් පිළිගනිමු.' : 'You are subscribed to the Ceylon Times private communique.');
  };

  return (
    <section
      className="py-18 lg:py-24 relative overflow-hidden transition-colors"
      style={{
        borderTop: isLight ? '1px solid rgba(212, 175, 55, 0.25)' : '1px solid rgba(255, 215, 0, 0.15)',
        background: isLight ? 'linear-gradient(180deg, #FAF8F5 0%, #FFFFFF 100%)' : 'transparent',
      }}
    >
      <div className="max-w-2xl mx-auto px-6 text-center relative z-10">
        <span
          className="text-[11px] font-bold uppercase tracking-[0.25em] block mb-2"
          style={{
            color: isLight ? '#996515' : '#FFD700',
            fontFamily: 'var(--font-rajdhani)',
          }}
        >
          <Sparkles className="w-3.5 h-3.5 inline mr-1.5 text-amber-500" />
          {language === 'si' ? 'සිලෝන් ටයිම්ස් නිල පුවත් සේවාව' : 'Colombo Concierge Dispatch'}
        </span>

        <h2
          className={`text-2xl sm:text-4xl font-normal mb-4 tracking-wide ${
            language === 'si' ? 'font-sinhala font-bold' : 'font-serif'
          }`}
          style={{ color: isLight ? '#0F172A' : '#FFFFFF' }}
        >
          {language === 'si' ? 'සුවිශේෂී වරප්‍රසාද සඳහා ලියාපදිංචි වන්න' : 'Reserve Archival Access'}
        </h2>

        <p
          className={`text-xs sm:text-sm leading-relaxed mb-8 max-w-lg mx-auto ${
            language === 'si' ? 'font-sinhala text-[14px]' : ''
          }`}
          style={{ color: isLight ? '#475569' : 'rgba(232, 227, 216, 0.75)' }}
        >
          {language === 'si'
            ? 'කොළඹ අපගේ නිර්මාණාගාරයෙන් සෘජුවම පැවැත්වෙන මැණික් වෙන්දේසි, සුවිශේෂී තේ අස්වැන්න සහ නවතම අත්යන්ත්‍ර නිර්මාණ පිළිබඳ තොරතුරු ලබාගැනීමට එක්වන්න.'
            : 'Inscribe your coordinates to receive priority allocation for rare Ceylon sapphire releases, limited Kandyan handloom runs, and private Galle Fort atelier invitations.'}
        </p>

        {isSubscribed ? (
          <div
            className="inline-flex items-center gap-2 px-8 py-3.5 backdrop-blur-md text-xs font-bold tracking-wider uppercase rounded-xs"
            style={{
              background: isLight ? 'rgba(5, 150, 105, 0.1)' : 'rgba(0, 255, 136, 0.08)',
              border: isLight ? '1px solid rgba(5, 150, 105, 0.5)' : '1px solid rgba(0, 255, 136, 0.4)',
              color: isLight ? '#059669' : '#00FF88',
              fontFamily: 'var(--font-rajdhani)',
            }}
          >
            <Check className="w-4 h-4" />
            <span className={language === 'si' ? 'font-sinhala' : ''}>
              {language === 'si'
                ? 'ඔබගේ ලියාපදිංචිය සාර්ථකයි. ආයුබෝවන්!'
                : 'Your correspondence coordinate has been inscribed. Ayubowan.'}
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder={language === 'si' ? 'විද්‍යුත් තැපැල් ලිපිනය ඇතුළත් කරන්න...' : 'Inscribe email address...'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 px-4 py-3 text-xs focus:outline-none transition-all rounded-xs"
              style={{
                background: isLight ? '#FFFFFF' : 'rgba(8, 12, 28, 0.85)',
                border: isLight ? '1px solid rgba(212, 175, 55, 0.5)' : '1px solid rgba(255, 215, 0, 0.3)',
                color: isLight ? '#0F172A' : '#E8E3D8',
                boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.04)' : 'inset 0 0 10px rgba(0, 0, 0, 0.8)',
              }}
            />
            <button
              type="submit"
              disabled={isSubmitting}
              onClick={() => sound.playClick()}
              className="btn-neon-gold text-xs px-6 py-3 disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span className={language === 'si' ? 'font-sinhala' : ''}>
                {isSubmitting
                  ? language === 'si' ? 'ලියාපදිංචි වෙමින්...' : 'Inscribing...'
                  : language === 'si' ? 'ලියාපදිංචි වන්න' : 'Inscribe'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
