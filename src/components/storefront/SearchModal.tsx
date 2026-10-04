'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ArrowRight, Clock, TrendingUp, Loader2 } from 'lucide-react';
import { Product } from '@/types';
import { api } from '@/lib/store';
import { useCurrency } from '@/context/CurrencyContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_SEARCHES = [
  'Ceylon Sapphire', 'Kandyan Silk', 'Brass Temple Lamp', 'Nuwara Eliya Tea', 'Ayurveda Elixir',
];

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { theme } = useTheme();
  const { language, t } = useLanguage();
  const { formatPrice } = useCurrency();
  const isLight = theme === 'light';

  const [query,           setQuery]           = useState('');
  const [results,         setResults]         = useState<Product[]>([]);
  const [isSearching,     setIsSearching]     = useState(false);
  const [recentSearches,  setRecentSearches]  = useState<string[]>(DEFAULT_SEARCHES);
  const inputRef = useRef<HTMLInputElement>(null);

  /* colour tokens */
  const bg      = isLight ? '#FFFFFF' : '#1E293B';
  const border  = isLight ? '#E2E8F0' : 'rgba(51,65,85,0.7)';
  const txtMain = isLight ? '#0F172A' : '#F1F5F9';
  const txtMute = isLight ? '#64748B' : '#94A3B8';

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ceylon_recent_searches');
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch (_e) {}
  }, []);

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

  useEffect(() => {
    if (!query.trim()) { setResults([]); setIsSearching(false); return; }
    setIsSearching(true);
    const handler = setTimeout(async () => {
      const hits = await api.getProducts({ search: query });
      setResults(hits);
      setIsSearching(false);
    }, 220);
    return () => clearTimeout(handler);
  }, [query]);

  const saveSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter((s) => s.toLowerCase() !== term.toLowerCase())].slice(0, 6);
    setRecentSearches(updated);
    try { localStorage.setItem('ceylon_recent_searches', JSON.stringify(updated)); } catch (_e) {}
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Search Panel */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative w-full max-h-[85vh] flex flex-col z-10"
            style={{
              background: bg,
              borderBottom: `1px solid ${border}`,
              boxShadow: isLight
                ? '0 20px 60px rgba(0,0,0,0.1)'
                : '0 20px 60px rgba(0,0,0,0.6)',
            }}
          >
            {/* Search Input Row */}
            <div className="max-w-4xl mx-auto w-full px-5 py-4 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(37,99,235,0.1)' }}
              >
                <Search className="w-5 h-5" style={{ color: '#2563EB' }} />
              </div>
              <input
                ref={inputRef}
                type="text"
                placeholder={language === 'si' ? 'සෙවීම...' : 'Search products, vendors, categories…'}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') onClose();
                  if (e.key === 'Enter' && query.trim()) saveSearch(query.trim());
                }}
                className="flex-1 text-base outline-none bg-transparent"
                style={{ color: txtMain, fontFamily: 'var(--font-inter)' }}
              />
              {isSearching && <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" style={{ color: '#2563EB' }} />}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                style={{ background: isLight ? '#F1F5F9' : 'rgba(30,41,59,0.8)', color: txtMute, border: `1px solid ${border}` }}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter chips */}
            <div className="max-w-4xl mx-auto w-full px-5 pb-4 flex items-center gap-2 overflow-x-auto hide-scrollbar border-b" style={{ borderColor: border }}>
              {['All', 'New Arrivals', 'On Sale', 'Top Rated', 'COD Available'].map((chip) => (
                <button
                  key={chip}
                  onClick={() => setQuery(chip === 'All' ? '' : chip)}
                  className={`chip flex-shrink-0 text-xs py-1.5 ${query === chip ? 'active' : ''}`}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Body */}
            <div className="max-w-4xl mx-auto w-full px-5 py-5 overflow-y-auto flex-1">
              {query.trim() === '' ? (
                /* Recent / Popular Searches */
                <div>
                  <h4
                    className="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-1.5"
                    style={{ color: '#2563EB' }}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    Popular Searches
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all"
                        style={{
                          background: isLight ? '#F8FAFC' : 'rgba(30,41,59,0.7)',
                          border: `1px solid ${border}`,
                          color: txtMute,
                        }}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.borderColor = 'rgba(37,99,235,0.3)';
                          el.style.color = '#2563EB';
                          el.style.background = isLight ? '#EFF6FF' : 'rgba(37,99,235,0.1)';
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.borderColor = border;
                          el.style.color = txtMute;
                          el.style.background = isLight ? '#F8FAFC' : 'rgba(30,41,59,0.7)';
                        }}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              ) : isSearching ? (
                <div className="py-10 text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: '#2563EB' }} />
                  <p className="text-sm" style={{ color: txtMute }}>Searching…</p>
                </div>
              ) : results.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-base font-semibold mb-1" style={{ color: txtMain }}>No results for &ldquo;{query}&rdquo;</p>
                  <p className="text-sm" style={{ color: txtMute }}>Try a different keyword or browse categories</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold" style={{ color: txtMain }}>
                      {results.length} results
                    </span>
                    <Link
                      href={`/products?search=${encodeURIComponent(query)}`}
                      onClick={() => { saveSearch(query); onClose(); }}
                      className="flex items-center gap-1 text-sm font-semibold transition-colors"
                      style={{ color: '#2563EB' }}
                    >
                      See all <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {results.slice(0, 6).map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={() => { saveSearch(query); onClose(); }}
                        className="group flex gap-3 p-3 rounded-2xl transition-all"
                        style={{
                          background: isLight ? '#F8FAFC' : 'rgba(30,41,59,0.6)',
                          border: `1px solid ${border}`,
                        }}
                        onMouseEnter={(e) => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.borderColor = 'rgba(37,99,235,0.3)';
                          el.style.boxShadow = '0 4px 12px rgba(37,99,235,0.08)';
                        }}
                        onMouseLeave={(e) => {
                          const el = e.currentTarget as HTMLElement;
                          el.style.borderColor = border;
                          el.style.boxShadow = 'none';
                        }}
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0" style={{ background: isLight ? '#E2E8F0' : '#0F172A' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={product.images[0]?.image_url || ''}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="flex flex-col justify-between py-0.5 min-w-0">
                          <h5
                            className="text-sm font-medium line-clamp-2 leading-snug transition-colors"
                            style={{ color: txtMain }}
                          >
                            {t(product.title)}
                          </h5>
                          <span className="text-sm font-bold" style={{ color: '#2563EB' }}>
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
