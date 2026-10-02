'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingBag,
  User,
  Menu,
  X,
  ShieldAlert,
  Volume2,
  VolumeX,
  Globe,
  Sun,
  Moon,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useSiteCustomization } from '@/context/SiteCustomizationContext';
import { sound } from '@/lib/sound';
import SearchModal from './SearchModal';
import SriLankaWidgets from './SriLankaWidgets';

interface HeaderProps {
  siteName?: string;
  announcementText?: string | null;
  announcementActive?: boolean;
}

export default function Header({
  siteName = 'Ceylon Times',
  announcementText,
  announcementActive = true,
}: HeaderProps) {
  const { openCart, itemCount, setCartIconRef } = useCart();
  const { isAdmin } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { customization } = useSiteCustomization();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAnnouncement, setShowAnnouncement] = useState(announcementActive);
  const [isMuted, setIsMuted] = useState(false);
  const cartButtonRef = useRef<HTMLButtonElement>(null);

  const isLight = theme === 'light';

  useEffect(() => {
    setIsMuted(sound.getMuted());
  }, []);

  const toggleSound = () => {
    const next = sound.toggleMuted();
    setIsMuted(next);
    if (!next) {
      sound.playClick();
    }
  };

  const toggleLanguage = () => {
    sound.playClick();
    setLanguage(language === 'en' ? 'si' : 'en');
  };

  useEffect(() => {
    if (cartButtonRef.current) {
      setCartIconRef(cartButtonRef);
    }
  }, [setCartIconRef]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Build nav links: use customization if available, fall back to hardcoded defaults
  const navLinks = (() => {
    if (customization?.nav_links && customization.nav_links.length > 0) {
      return customization.nav_links
        .filter((l) => l.enabled)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((l) => ({ label: l.label, href: l.href }));
    }
    return [
      { label: t('shopAll'), href: '/products' },
      { label: t('jewellery'), href: '/products?category=jewellery' },
      { label: t('textiles'), href: '/products?category=textiles' },
      { label: t('sacredLiving'), href: '/products?category=sacred-living' },
      { label: t('ayurveda'), href: '/products?category=ayurveda' },
      { label: t('tea'), href: '/products?category=tea' },
      { label: t('about'), href: '/about' },
    ];
  })();

  return (
    <>
      <header className="sticky top-0 z-40 w-full transition-all duration-300">
        {/* Top Info Bar: Live Sri Lanka Widgets + Announcement + Theme & Language Switchers */}
        <div
          style={{
            background: isLight
              ? 'linear-gradient(90deg, #FFFFFF 0%, #FAF8F5 50%, #FFFFFF 100%)'
              : 'linear-gradient(90deg, #050814 0%, #0A1024 50%, #050814 100%)',
            borderBottom: isLight
              ? '1px solid rgba(212, 175, 55, 0.35)'
              : '1px solid rgba(255, 215, 0, 0.22)',
            boxShadow: isLight
              ? '0 2px 8px rgba(0,0,0,0.03)'
              : '0 2px 15px rgba(0,0,0,0.4)',
          }}
          className="text-[11px] py-1.5 px-3 sm:px-6 relative flex flex-wrap items-center justify-between gap-2.5 z-20 transition-colors"
        >
          {/* Left: Live Sri Lanka Date, Time & Animated Weather */}
          <div className="flex items-center">
            <SriLankaWidgets />
          </div>

          {/* Center: Curated Island Announcement (Desktop) */}
          {showAnnouncement && (
            <div
              className="hidden xl:flex items-center gap-2 text-center text-[11px] font-medium tracking-[0.14em] uppercase"
              style={{
                color: isLight ? '#854D0E' : '#FFD700',
              }}
            >
              <span className={isLight ? 'text-amber-600' : 'animate-pulse text-[#00FFFF]'}>✦</span>
              <span style={{ textShadow: isLight ? 'none' : '0 0 10px rgba(255,215,0,0.4)' }}>
                {announcementText || t('announcement')}
              </span>
              <span className={isLight ? 'text-amber-600' : 'animate-pulse text-[#00FFFF]'}>✦</span>
            </div>
          )}

          {/* Right: Controls (Theme Toggle + Language Switcher + Sound Toggle) */}
          <div className="flex items-center gap-2 sm:gap-2.5 ml-auto">
            {/* Dark / Light Mode Toggle Switch */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded transition-all cursor-pointer"
              style={{
                background: isLight ? '#FFFFFF' : '#090E1D',
                border: isLight
                  ? '1px solid rgba(212, 175, 55, 0.5)'
                  : '1px solid rgba(255, 215, 0, 0.35)',
                color: isLight ? '#0F172A' : '#FFD700',
                boxShadow: isLight ? '0 2px 6px rgba(0,0,0,0.04)' : '0 0 10px rgba(255,215,0,0.1)',
              }}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Dark or Light Mode"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-[#FFD700] animate-[spin_16s_linear_infinite]" />
                  <span className="text-[10px] text-yellow-300 font-mono font-bold">LIGHT</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="text-[10px] text-slate-800 font-mono font-bold">DARK</span>
                </>
              )}
            </motion.button>

            {/* Language Switcher Toggle */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-bold tracking-wider transition-all cursor-pointer"
              style={{
                background: isLight ? '#FFFFFF' : '#090E1D',
                border: isLight
                  ? '1px solid rgba(212, 175, 55, 0.5)'
                  : '1px solid rgba(255, 215, 0, 0.35)',
                color: isLight ? '#0F172A' : '#FFD700',
                boxShadow: isLight ? '0 2px 6px rgba(0,0,0,0.04)' : '0 0 10px rgba(255,215,0,0.1)',
              }}
              title="Toggle Sinhala / English"
            >
              <Globe className={`w-3.5 h-3.5 ${isLight ? 'text-amber-600' : 'text-[#00FFFF]'}`} />
              <span className={language === 'si' ? 'font-sinhala text-xs text-amber-600 font-bold' : isLight ? 'text-slate-900' : 'text-yellow-400'}>
                {language === 'si' ? 'සිංහල' : 'ENGLISH'}
              </span>
              <span className={isLight ? 'text-slate-300 text-[9px]' : 'text-white/30 text-[9px]'}>/</span>
              <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-white/60'}`}>
                {language === 'si' ? 'EN' : 'සිං'}
              </span>
            </motion.button>

            {/* Audio Feedback Toggle */}
            <motion.button
              type="button"
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={toggleSound}
              className="p-1.5 rounded-full transition-all cursor-pointer"
              style={{
                background: isLight ? '#FFFFFF' : '#090E1D',
                border: isLight
                  ? '1px solid rgba(212, 175, 55, 0.4)'
                  : '1px solid rgba(255, 215, 0, 0.25)',
                boxShadow: isLight ? '0 2px 6px rgba(0,0,0,0.04)' : 'none',
              }}
              title={isMuted ? 'Enable UI Audio Feedback' : 'Mute UI Audio Feedback'}
              aria-label="Toggle UI Audio"
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-red-500" />
              ) : (
                <Volume2 className={`w-3.5 h-3.5 ${isLight ? 'text-amber-600' : 'text-[#00FFFF] animate-pulse'}`} />
              )}
            </motion.button>
          </div>
        </div>

        {/* Main Navigation Bar */}
        <motion.div
          animate={{
            height: isScrolled ? 70 : 86,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          style={{
            background: isLight
              ? isScrolled
                ? 'rgba(255, 255, 255, 0.98)'
                : 'rgba(255, 255, 255, 0.94)'
              : isScrolled
              ? 'rgba(10, 14, 26, 0.96)'
              : 'rgba(10, 14, 26, 0.88)',
            borderBottom: isLight
              ? '1px solid rgba(212, 175, 55, 0.3)'
              : '1px solid rgba(255, 215, 0, 0.2)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: isLight
              ? isScrolled
                ? '0 6px 25px rgba(0,0,0,0.08)'
                : '0 2px 10px rgba(0,0,0,0.04)'
              : isScrolled
              ? '0 10px 30px rgba(0,0,0,0.7), 0 0 25px rgba(255,215,0,0.06)'
              : '0 4px 20px rgba(0,0,0,0.4)',
          }}
          className="flex items-center px-4 sm:px-6 lg:px-12 transition-colors relative"
        >
          <div className="max-w-[1440px] mx-auto w-full flex items-center justify-between">
            {/* Mobile Hamburger */}
            <button
              onClick={() => {
                sound.playClick();
                setIsMobileMenuOpen(true);
              }}
              className="lg:hidden p-2 transition-colors"
              style={{ color: isLight ? '#0F172A' : '#FFD700' }}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Official Primary Brand Logo & 'Ceylon Times' Title */}
            <Link
              href="/"
              onClick={() => sound.playClick()}
              className="flex items-center gap-2.5 sm:gap-3 group py-1"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={isLight ? '/logo-black.png' : '/logo-white.png'}
                alt="Ceylon Times"
                className="h-10 sm:h-12 md:h-13 w-auto object-contain transition-all duration-300 group-hover:scale-105"
                style={{
                  filter: isLight
                    ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))'
                    : 'drop-shadow(0 2px 8px rgba(0,0,0,0.6)) drop-shadow(0 0 15px rgba(255,215,0,0.45))',
                }}
              />
              <div className="flex flex-col">
                <span
                  className="text-base sm:text-lg md:text-xl font-bold tracking-[0.16em] uppercase transition-colors"
                  style={{
                    fontFamily: 'var(--font-cinzel)',
                    color: isLight ? '#0F172A' : '#FFD700',
                    textShadow: isLight ? 'none' : '0 0 12px rgba(255,215,0,0.35)',
                  }}
                >
                  Ceylon Times
                </span>
                <span
                  className="text-[9px] tracking-[0.22em] uppercase font-mono hidden sm:block"
                  style={{
                    color: isLight ? '#996515' : '#00FFFF',
                  }}
                >
                  ceylon-times.lk
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => sound.playClick()}
                  onMouseEnter={() => sound.playChime()}
                  className="text-[12px] uppercase tracking-[0.14em] font-semibold transition-all duration-300 relative py-1 group"
                  style={{
                    color: isLight ? '#1E293B' : 'rgba(235, 230, 220, 0.85)',
                  }}
                >
                  <span
                    className="transition-colors duration-300"
                    onMouseEnter={(e) => {
                      (e.target as HTMLElement).style.color = isLight ? '#B8860B' : '#FFD700';
                    }}
                    onMouseLeave={(e) => {
                      (e.target as HTMLElement).style.color = isLight ? '#1E293B' : 'rgba(235, 230, 220, 0.85)';
                    }}
                  >
                    {link.label}
                  </span>
                  <span
                    className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-300"
                    style={{
                      background: isLight
                        ? 'linear-gradient(90deg, #B8860B, #D4AF37)'
                        : 'linear-gradient(90deg, #FFD700, #00FFFF)',
                      boxShadow: isLight ? 'none' : '0 0 8px rgba(0,255,255,0.7)',
                    }}
                  />
                </Link>
              ))}
            </nav>

            {/* Right Action Icons */}
            <div className="flex items-center gap-2.5 sm:gap-4">
              {/* Admin Portal Link */}
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => sound.playClick()}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300"
                  style={{
                    background: isLight ? '#FFFFFF' : 'rgba(255,215,0,0.15)',
                    border: isLight ? '1px solid rgba(212, 175, 55, 0.5)' : '1px solid rgba(255,215,0,0.5)',
                    color: isLight ? '#996515' : '#FFD700',
                    fontFamily: 'var(--font-rajdhani)',
                  }}
                  title="Ceylon Times Private Admin Workspace"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span>Admin</span>
                </Link>
              )}

              {/* Search Trigger */}
              <button
                onClick={() => {
                  sound.playClick();
                  setIsSearchOpen(true);
                }}
                className="p-2 transition-colors cursor-pointer"
                style={{ color: isLight ? '#0F172A' : '#E8E3D8' }}
                aria-label="Search catalog"
              >
                <Search className="w-5 h-5 hover:text-amber-600 transition-colors" />
              </button>

              {/* User Account */}
              <Link
                href="/account"
                onClick={() => sound.playClick()}
                className="p-2 transition-colors cursor-pointer"
                style={{ color: isLight ? '#0F172A' : '#E8E3D8' }}
                aria-label="Your account"
              >
                <User className="w-5 h-5 hover:text-amber-600 transition-colors" />
              </Link>

              {/* Shopping Bag */}
              <motion.button
                ref={cartButtonRef}
                onClick={() => {
                  sound.playClick();
                  openCart();
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                className="p-2 transition-colors relative cursor-pointer"
                style={{ color: isLight ? '#0F172A' : '#E8E3D8' }}
                aria-label="View bag"
              >
                <ShoppingBag className="w-5 h-5 hover:text-amber-600 transition-colors" />
                {itemCount > 0 && (
                  <motion.span
                    key={itemCount}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: [1, 1.25, 1], opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 text-[10px] font-bold rounded-full flex items-center justify-center text-white"
                    style={{
                      background: 'linear-gradient(135deg, #B8860B, #D4AF37)',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    }}
                  >
                    {itemCount}
                  </motion.span>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-full max-w-xs p-6 shadow-2xl z-10 flex flex-col justify-between"
              style={{
                background: isLight ? '#FFFFFF' : '#070C1B',
                color: isLight ? '#0F172A' : '#FFFFFF',
                borderRight: isLight ? '1px solid rgba(212, 175, 55, 0.3)' : '1px solid rgba(255, 215, 0, 0.2)',
              }}
            >
              <div>
                <div
                  className="flex items-center justify-between pb-5"
                  style={{ borderBottom: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255,215,0,0.18)' }}
                >
                  <div className="flex items-center gap-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={isLight ? '/logo-black.png' : '/logo-white.png'}
                      alt="Ceylon Times"
                      className="h-9 w-auto object-contain"
                    />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold tracking-widest" style={{ fontFamily: 'var(--font-cinzel)', color: isLight ? '#0F172A' : '#FFD700' }}>
                        Ceylon Times
                      </span>
                      <span className="text-[8px] font-mono tracking-widest" style={{ color: isLight ? '#996515' : '#00FFFF' }}>
                        ceylon-times.lk
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="p-2"
                    style={{ color: isLight ? '#0F172A' : '#FFD700' }}
                    aria-label="Close menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mobile Theme & Language Switchers */}
                <div className="flex items-center justify-between py-3.5 border-b" style={{ borderColor: isLight ? '#E2E8F0' : 'rgba(255,215,0,0.15)' }}>
                  <div className="flex items-center gap-2">
                    {theme === 'dark' ? <Moon className="w-4 h-4 text-[#00FFFF]" /> : <Sun className="w-4 h-4 text-amber-500" />}
                    <span className="text-xs" style={{ color: isLight ? '#475569' : 'rgba(255,255,255,0.7)' }}>Theme Mode:</span>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="px-3 py-1 rounded text-xs font-bold"
                    style={{
                      background: isLight ? '#F1F5F9' : '#090E1D',
                      border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255,215,0,0.3)',
                      color: isLight ? '#0F172A' : '#FFD700',
                    }}
                  >
                    {theme === 'dark' ? 'Dark (Night)' : 'Light (Day)'}
                  </button>
                </div>

                <div className="flex items-center justify-between py-3.5 border-b" style={{ borderColor: isLight ? '#E2E8F0' : 'rgba(255,215,0,0.15)' }}>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-amber-600" />
                    <span className="text-xs" style={{ color: isLight ? '#475569' : 'rgba(255,255,255,0.7)' }}>Language:</span>
                  </div>
                  <button
                    onClick={toggleLanguage}
                    className="px-3 py-1 rounded text-xs font-bold"
                    style={{
                      background: isLight ? '#F1F5F9' : '#090E1D',
                      border: isLight ? '1px solid #CBD5E1' : '1px solid rgba(255,215,0,0.3)',
                      color: isLight ? '#0F172A' : '#FFD700',
                    }}
                  >
                    {language === 'si' ? 'සිංහල (Sinhala)' : 'English (EN)'}
                  </button>
                </div>

                <div className="flex flex-col gap-3 py-6">
                  {navLinks.map((link, idx) => (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                    >
                      <Link
                        href={link.href}
                        onClick={() => {
                          sound.playClick();
                          setIsMobileMenuOpen(false);
                        }}
                        className="text-sm font-semibold block py-1.5 transition-colors uppercase tracking-widest"
                        style={{
                          color: isLight ? '#1E293B' : 'rgba(235, 230, 220, 0.85)',
                          letterSpacing: '0.12em',
                        }}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => {
                        sound.playClick();
                        setIsMobileMenuOpen(false);
                      }}
                      className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-widest pt-4 font-bold border-t"
                      style={{
                        borderColor: isLight ? '#E2E8F0' : 'rgba(255,215,0,0.2)',
                        color: isLight ? '#996515' : '#FFD700',
                      }}
                    >
                      <ShieldAlert className="w-4 h-4 text-amber-600" />
                      <span>Admin Control Center</span>
                    </Link>
                  )}
                </div>
              </div>

              <div
                className="pt-5 space-y-1.5 border-t text-[11px]"
                style={{
                  borderColor: isLight ? '#E2E8F0' : 'rgba(255,215,0,0.15)',
                  color: isLight ? '#64748B' : 'rgba(235,230,220,0.45)',
                }}
              >
                <p>Authentic Sri Lankan Living Heritage</p>
                <p>© {new Date().getFullYear()} Ceylon Times · ceylon-times.lk</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
