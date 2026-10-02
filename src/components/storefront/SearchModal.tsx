'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Clock, Sparkles } from 'lucide-react';
import { Product } from '@/types';
import { api } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { theme } = useTheme();
  const { language, t } = useLanguage();
  const isLight = theme === 'light';

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ceylon_recent_searches');
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      } else {
        setRecentSearches(
          language === 'si'
            ? ['සිලෝන් නිල් මැණික්', 'නුවර අත්යන්ත්‍ර සේද', 'පිත්තල පහන', 'නුවරඑළිය තේ', 'සුවදායී ආයුර්වේද']
            : ['Ceylon Sapphire', 'Kandyan Silk', 'Brass Temple Lamp', 'Nuwara Eliya Tea', 'Ayurveda Elixir']
        );
      }
    } catch (_e) {}
  }, [language]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(async () => {
      const hits = await api.getProducts({ search: query });
      setResults(hits);
      setIsSearching(false);
    }, 200);

    return () => clearTimeout(handler);
  }, [query]);

  const handleSelectRecent = (term: string) => {
    setQuery(term);
  };

  const handleSaveSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem('ceylon_recent_searches', JSON.stringify(updated));
    } catch (_e) {}
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-start">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className={`fixed inset-0 ${isLight ? 'bg-slate-900/40' : 'bg-black/80'} backdrop-blur-md`}
          />

          {/* Search Container */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className={`relative w-full max-h-[85vh] flex flex-col z-10 ${isLight ? 'text-slate-900' : 'text-[#E8E3D8]'}`}
            style={{
              background: isLight ? 'rgba(255, 255, 255, 0.98)' : 'rgba(6, 9, 22, 0.98)',
              borderBottom: isLight ? '1px solid rgba(184, 134, 11, 0.3)' : '1px solid rgba(255, 215, 0, 0.3)',
              boxShadow: isLight
                ? '0 20px 40px rgba(0, 0, 0, 0.1), 0 0 20px rgba(184, 134, 11, 0.08)'
                : '0 20px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(255, 215, 0, 0.12)',
              backdropFilter: 'blur(25px)',
            }}
          >
            {/* Brand Banner above Search Bar */}
            <div className={`max-w-5xl mx-auto w-full px-6 pt-6 pb-3 flex items-center justify-between border-b ${isLight ? 'border-amber-900/10' : 'border-yellow-500/15'}`}>
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={isLight ? '/logo-black.png' : '/logo-white.png'}
                  alt="Ceylon Times"
                  className="h-8 w-auto object-contain"
                />
                <div className="flex flex-col">
                  <span className={`text-sm font-bold uppercase tracking-[0.18em] ${isLight ? 'text-amber-900' : 'text-[#FFD700]'}`} style={{ fontFamily: 'var(--font-cinzel)' }}>
                    Ceylon Times
                  </span>
                  <span className={`text-[10px] ${isLight ? 'text-amber-700' : 'text-[#00FFFF]'} uppercase tracking-wider font-mono`}>
                    {language === 'si' ? 'නිල රාජකීය සංග්‍රහය' : 'Official Sovereign Catalogue'}
                  </span>
                </div>
              </div>
              <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-[#00FFFF]'} uppercase tracking-wider font-mono hidden sm:inline`}>
                ceylontimes.lk · Sri Lanka
              </span>
            </div>

            {/* Input Bar */}
            <div className={`max-w-5xl mx-auto w-full px-6 py-6 flex items-center gap-4 border-b ${isLight ? 'border-amber-900/10' : 'border-yellow-500/15'}`}>
              <Search className={`w-6 h-6 ${isLight ? 'text-amber-700' : 'text-[#FFD700]'} flex-shrink-0`} />
              <input
                ref={inputRef}
                type="text"
                placeholder={
                  language === 'si'
                    ? 'සිලෝන් ටයිම්ස් සොයන්න: නිල් මැණික්, නුවර අත්යන්ත්‍ර, පිත්තල පහන්, තේ...'
                    : 'Search Ceylon Times: sapphires, Kandyan handlooms, temple brass lamps, tea...'
                }
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') onClose();
                  if (e.key === 'Enter' && query.trim()) handleSaveSearch(query.trim());
                }}
                className={`w-full text-lg sm:text-2xl font-serif ${isLight ? 'text-slate-900 placeholder:text-slate-400' : 'text-white placeholder:text-[#E8E3D8]/30'} outline-none bg-transparent`}
              />
              <button
                onClick={onClose}
                className={`p-2 ${isLight ? 'text-slate-500 hover:text-slate-900' : 'text-[#E8E3D8]/60 hover:text-[#FFD700]'} transition-colors cursor-pointer`}
                aria-label="Close search"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Results or Recent Searches */}
            <div className="max-w-5xl mx-auto w-full px-6 py-8 overflow-y-auto flex-1">
              {query.trim() === '' ? (
                <div>
                  <h4 className={`text-[10px] uppercase tracking-[0.2em] ${isLight ? 'text-amber-800' : 'text-[#FFD700]'} mb-4 font-bold flex items-center gap-1.5`} style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    <Sparkles className={`w-3.5 h-3.5 ${isLight ? 'text-amber-600' : 'text-[#00FFFF]'}`} />
                    {language === 'si' ? 'ජනප්‍රිය සෙවුම්' : 'Popular Island Enquiries'}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSelectRecent(term)}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs transition-all cursor-pointer font-medium ${isLight ? 'hover:bg-amber-50' : ''}`}
                        style={{
                          background: isLight ? '#FFFFFF' : 'rgba(10, 15, 35, 0.8)',
                          border: isLight ? '1px solid rgba(184, 134, 11, 0.3)' : '1px solid rgba(255, 215, 0, 0.25)',
                          color: isLight ? '#0F172A' : '#E8E3D8',
                          boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
                          clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
                        }}
                      >
                        <Clock className={`w-3.5 h-3.5 ${isLight ? 'text-amber-700' : 'text-[#FFD700]/60'}`} />
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : isSearching ? (
                <div className={`py-12 text-center text-xs ${isLight ? 'text-amber-800' : 'text-[#00FFFF]'} tracking-widest uppercase font-bold animate-pulse`} style={{ fontFamily: 'var(--font-rajdhani)' }}>
                  {language === 'si' ? 'සිලෝන් නිර්මාණ සංග්‍රහය පිරික්සමින්...' : 'Scanning Ceylon Atelier Archives...'}
                </div>
              ) : results.length === 0 ? (
                <div className="py-12 text-center">
                  <p className={`text-base font-serif ${isLight ? 'text-slate-900 font-bold' : 'text-white'}`}>
                    {language === 'si' ? `"${query}" සඳහා නිර්මාණ හමු නොවීය` : `No creations located for "${query}"`}
                  </p>
                  <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-[#E8E3D8]/50'} mt-1`}>
                    {language === 'si' ? '"මැණික්", "අත්යන්ත්‍ර", හෝ "පිත්තල" ලෙස සොයා බලන්න' : 'Try querying "Sapphire", "Handloom", or "Brass"'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`flex justify-between items-center text-xs ${isLight ? 'text-amber-900' : 'text-[#FFD700]'} uppercase tracking-[0.2em] pb-2 border-b ${isLight ? 'border-amber-900/10' : 'border-yellow-500/15'}`} style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    <span>{language === 'si' ? `හමු වූ නිර්මාණ (${results.length})` : `Treasury Matches (${results.length})`}</span>
                    <Link
                      href={`/products?search=${encodeURIComponent(query)}`}
                      onClick={() => {
                        handleSaveSearch(query);
                        onClose();
                      }}
                      className={`${isLight ? 'text-amber-800 hover:text-amber-950' : 'text-[#00FFFF] hover:text-white'} flex items-center gap-1 font-bold transition-colors`}
                    >
                      <span>{language === 'si' ? 'සියලු ප්‍රතිඵල නරඹන්න' : 'Explore All Results'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {results.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={() => {
                          handleSaveSearch(query);
                          onClose();
                        }}
                        className={`group flex gap-3 p-3 transition-all duration-300 ${isLight ? 'hover:shadow-md' : ''}`}
                        style={{
                          background: isLight ? '#FFFFFF' : 'rgba(8, 12, 28, 0.7)',
                          border: isLight ? '1px solid rgba(184, 134, 11, 0.25)' : '1px solid rgba(255, 215, 0, 0.15)',
                          clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))',
                        }}
                      >
                        <div className="w-16 h-20 bg-[#04060E] overflow-hidden flex-shrink-0 border border-yellow-500/20">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={product.images[0]?.image_url}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex flex-col justify-between py-0.5 min-w-0">
                          <div>
                            <h5 className={`font-serif text-xs ${isLight ? 'text-slate-900 group-hover:text-amber-800 font-bold' : 'text-[#E8E3D8] group-hover:text-[#FFD700]'} transition-colors line-clamp-2 leading-snug`}>
                              {t(product.title)}
                            </h5>
                          </div>
                          <span className={`text-xs font-bold ${isLight ? 'text-amber-800' : 'text-[#FFD700]'}`} style={{ fontFamily: 'var(--font-rajdhani)' }}>
                            {formatPrice(product.sale_price ?? product.price)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
