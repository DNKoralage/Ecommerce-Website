'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  ShieldAlert,
  Sun,
  Moon,
  Globe,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useCurrency } from '@/context/CurrencyContext';
import { useSiteCustomization } from '@/context/SiteCustomizationContext';
import { sound } from '@/lib/sound';
import SearchModal from './SearchModal';

interface HeaderProps {
  siteName?: string;
  logoUrl?: string | null;
  announcementText?: string | null;
  announcementActive?: boolean;
}

export default function Header({
  siteName = 'Ceylon Times',
  logoUrl,
  announcementText,
  announcementActive = true,
}: HeaderProps) {
  const { openCart, itemCount, setCartIconRef } = useCart();
  const { isAdmin } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { toggleCurrency, isUSD } = useCurrency();
  const { customization } = useSiteCustomization();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const cartButtonRef = useRef<HTMLButtonElement>(null);
  const isLight = theme === 'light';

  useEffect(() => {
    if (cartButtonRef.current) setCartIconRef(cartButtonRef);
  }, [setCartIconRef]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = (() => {
    if (customization?.nav_links && customization.nav_links.length > 0) {
      return customization.nav_links
        .filter((l) => l.enabled)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((l) => ({ label: l.label, href: l.href }));
    }
    return [
      { label: 'All Products', href: '/products' },
      { label: 'Jewellery',    href: '/products?category=jewellery' },
      { label: 'Textiles',     href: '/products?category=textiles' },
      { label: 'Ayurveda',     href: '/products?category=ayurveda' },
      { label: 'Tea',          href: '/products?category=tea' },
      { label: 'About',        href: '/about' },
    ];
  })();

  /* --- colour tokens that follow the theme --- */
  const bg      = isLight ? 'rgba(255,255,255,0.97)' : 'rgba(15,23,42,0.97)';
  const border  = isLight ? 'rgba(226,232,240,0.9)'  : 'rgba(51,65,85,0.8)';
  const txtMain = isLight ? '#0F172A'                 : '#F1F5F9';
  const txtMute = isLight ? '#64748B'                 : '#94A3B8';

  /* --- Logo rendering helper --- */
  const renderLogo = (size: 'sm' | 'md' = 'sm') => {
    const h = size === 'sm' ? 32 : 36;
    // Use theme-aware default logos if no custom logo is set
    const src = logoUrl || (isLight ? '/logo-black.png' : '/logo-white.png');
    return (
      <Image
        src={src}
        alt={siteName || 'Ceylon Times'}
        width={Math.round(h * (481 / 367))}
        height={h}
        className="object-contain flex-shrink-0"
        style={{ height: h, width: 'auto', maxWidth: size === 'sm' ? 110 : 130 }}
        unoptimized
        priority
      />
    );
  };

  return (
    <>
      {/* ─── Announcement Bar ─── */}
      {announcementActive && announcementText && (
        <div
          className="w-full py-2 px-4 text-center text-xs font-medium tracking-wide"
          style={{
            background: 'linear-gradient(90deg, #2563EB, #3B82F6)',
            color: '#FFFFFF',
          }}
        >
          {announcementText}
        </div>
      )}

      {/* ─── Main Header ─── */}
      <header
        className="sticky top-0 z-40 w-full transition-all duration-300"
        style={{
          background: bg,
          borderBottom: `1px solid ${border}`,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          boxShadow: isScrolled ? (isLight ? '0 4px 24px rgba(0,0,0,0.07)' : '0 4px 24px rgba(0,0,0,0.5)') : 'none',
        }}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 flex items-center h-16 gap-3">

          {/* Mobile Hamburger */}
          <button
            onClick={() => { sound.playClick(); setIsMobileMenuOpen(true); }}
            className="lg:hidden p-2 rounded-lg transition-colors flex-shrink-0"
            style={{ color: txtMain }}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Brand Logo */}
          <Link href="/" onClick={() => sound.playClick()} className="flex items-center gap-2.5 flex-shrink-0">
            {renderLogo('sm')}
            <span
              className="text-base sm:text-lg font-bold tracking-tight"
              style={{ color: txtMain, fontFamily: 'var(--font-outfit)', whiteSpace: 'nowrap' }}
            >
              {siteName || 'Ceylon Times'}
            </span>
          </Link>

          {/* Desktop Search Bar — flex-1 with min-width 0 to prevent overflow */}
          <div className="hidden md:flex flex-1 min-w-0 mx-3 relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: '#94A3B8' }}
            />
            <button
              onClick={() => { sound.playClick(); setIsSearchOpen(true); }}
              className="w-full text-left pl-9 pr-4 py-2 text-sm rounded-xl border transition-all cursor-text"
              style={{
                background: isLight ? '#F8FAFC' : 'rgba(30,41,59,0.6)',
                borderColor: isLight ? '#E2E8F0' : 'rgba(51,65,85,0.7)',
                color: '#94A3B8',
                fontFamily: 'var(--font-inter)',
                minWidth: 0,
              }}
            >
              Search products, categories…
            </button>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-shrink-0">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => sound.playClick()}
                className="px-3 py-2 text-[13px] font-medium rounded-lg transition-all duration-200"
                style={{ color: txtMute, whiteSpace: 'nowrap' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#2563EB'; (e.currentTarget as HTMLElement).style.background = isLight ? '#EFF6FF' : 'rgba(37,99,235,0.1)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = txtMute; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-1.5 flex-shrink-0 ml-auto">
            {/* Mobile Search */}
            <button
              onClick={() => { sound.playClick(); setIsSearchOpen(true); }}
              className="md:hidden p-2 rounded-lg transition-all"
              style={{ color: txtMute }}
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Admin — only show when logged in as admin */}
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                style={{ background: 'rgba(239,68,68,0.08)', color: '#DC2626', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin</span>
              </Link>
            )}

            {/* Language */}
            <button
              onClick={() => { sound.playClick(); setLanguage(language === 'en' ? 'si' : 'en'); }}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{ color: txtMute, border: `1px solid ${border}`, background: isLight ? '#F8FAFC' : 'rgba(30,41,59,0.5)' }}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'si' ? 'සිං' : 'EN'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-all"
              style={{ color: txtMute, border: `1px solid ${border}`, background: isLight ? '#F8FAFC' : 'rgba(30,41,59,0.5)' }}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-500" />
              )}
            </button>

            {/* Currency */}
            <button
              onClick={() => { sound.playClick(); toggleCurrency(); }}
              className="hidden sm:flex items-center px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all"
              style={{ color: txtMute, border: `1px solid ${border}`, background: isLight ? '#F8FAFC' : 'rgba(30,41,59,0.5)', fontFamily: 'var(--font-inter)' }}
            >
              {isUSD ? '$' : 'Rs'}
            </button>

            {/* User */}
            <Link
              href="/account"
              className="p-2 rounded-lg transition-all"
              style={{ color: txtMute }}
              aria-label="Account"
            >
              <User className="w-5 h-5 hover:text-[#2563EB] transition-colors" />
            </Link>

            {/* Cart Button */}
            <motion.button
              ref={cartButtonRef}
              onClick={() => { sound.playClick(); openCart(); }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              className="relative p-2 rounded-xl transition-all"
              style={{
                background: itemCount > 0 ? '#2563EB' : (isLight ? '#F8FAFC' : 'rgba(30,41,59,0.5)'),
                border: itemCount > 0 ? 'none' : `1px solid ${border}`,
                color: itemCount > 0 ? '#FFFFFF' : txtMute,
                boxShadow: itemCount > 0 ? '0 4px 14px rgba(37,99,235,0.4)' : 'none',
              }}
              aria-label="View cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {itemCount > 0 && (
                <motion.span
                  key={itemCount}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: [1, 1.3, 1], opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 text-[10px] font-bold rounded-full flex items-center justify-center text-white"
                  style={{ background: '#EF4444', boxShadow: '0 2px 6px rgba(239,68,68,0.5)' }}
                >
                  {itemCount}
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>
      </header>

      {/* ─── Search Modal ─── */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* ─── Mobile Drawer ─── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.28 }}
              className="fixed inset-y-0 left-0 w-full max-w-xs p-6 shadow-2xl z-10 flex flex-col"
              style={{
                background: isLight ? '#FFFFFF' : '#0F172A',
                color: isLight ? '#0F172A' : '#F1F5F9',
                borderRight: `1px solid ${border}`,
              }}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-5 border-b" style={{ borderColor: border }}>
                <div className="flex items-center gap-2.5">
                  {renderLogo('md')}
                  <span className="text-base font-bold" style={{ fontFamily: 'var(--font-outfit)' }}>
                    {siteName || 'Ceylon Times'}
                  </span>
                </div>
                <button onClick={() => { sound.playClick(); setIsMobileMenuOpen(false); }} className="p-2 rounded-lg" style={{ color: txtMute }}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Theme + Currency toggles */}
              <div className="flex items-center gap-2 py-4 border-b" style={{ borderColor: border }}>
                <button
                  onClick={toggleTheme}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{ background: isLight ? '#EFF6FF' : 'rgba(37,99,235,0.12)', color: '#2563EB', border: '1px solid rgba(37,99,235,0.2)' }}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {theme === 'dark' ? 'Light' : 'Dark'} Mode
                </button>
                <button
                  onClick={() => { sound.playClick(); toggleCurrency(); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium transition-all"
                  style={{ background: isLight ? '#F8FAFC' : 'rgba(30,41,59,0.5)', color: txtMute, border: `1px solid ${border}` }}
                >
                  {isUSD ? 'Switch to LKR' : 'Switch to USD'}
                </button>
              </div>

              {/* Nav Links */}
              <nav className="flex flex-col gap-1 py-4 flex-1 overflow-y-auto">
                {navLinks.map((link, idx) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => { sound.playClick(); setIsMobileMenuOpen(false); }}
                      className="block px-4 py-2.5 text-sm font-medium rounded-xl transition-all"
                      style={{ color: isLight ? '#334155' : '#CBD5E1' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = isLight ? '#EFF6FF' : 'rgba(37,99,235,0.1)'; (e.currentTarget as HTMLElement).style.color = '#2563EB'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = isLight ? '#334155' : '#CBD5E1'; }}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* Bottom: Admin link (only if admin) + Account */}
              <div className="space-y-2 pt-4 border-t" style={{ borderColor: border }}>
                <Link
                  href="/account"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: isLight ? '#F8FAFC' : 'rgba(30,41,59,0.5)', color: txtMute, border: `1px solid ${border}` }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User className="w-4 h-4" />
                  My Account
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                    style={{ background: 'rgba(239,68,68,0.08)', color: '#DC2626', border: '1px solid rgba(239,68,68,0.2)' }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    Admin Dashboard
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
