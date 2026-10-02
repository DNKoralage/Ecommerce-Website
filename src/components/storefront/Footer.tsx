'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, ShieldCheck, RefreshCw, Truck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useSiteCustomization } from '@/context/SiteCustomizationContext';
import { sound } from '@/lib/sound';

interface FooterProps {
  siteName?: string;
  tagline?: string;
}

export default function Footer({
  siteName = 'Ceylon Times',
  tagline = 'Challenging Ideology · Authentic Sri Lankan Living Heritage',
}: FooterProps) {
  const { isAdmin } = useAuth();
  const { language, t } = useLanguage();
  const { theme } = useTheme();
  const { customization } = useSiteCustomization();
  const isLight = theme === 'light';

  const linkColor = isLight ? '#334155' : 'rgba(235, 230, 220, 0.7)';
  const hoverColor = isLight ? '#B8860B' : '#FFD700';

  return (
    <footer
      style={{
        background: isLight
          ? 'linear-gradient(180deg, #FFFFFF 0%, #FAF8F5 100%)'
          : 'linear-gradient(180deg, rgba(8, 12, 24, 0.96) 0%, rgba(5, 8, 18, 0.99) 100%)',
        borderTop: isLight
          ? '1px solid rgba(212, 175, 55, 0.3)'
          : '1px solid rgba(255, 215, 0, 0.2)',
        boxShadow: isLight
          ? '0 -10px 40px rgba(0, 0, 0, 0.04)'
          : '0 -20px 60px rgba(0, 0, 0, 0.6)',
      }}
      className="pt-16 pb-12 relative z-20 transition-colors"
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        {/* Upper Grid */}
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b"
          style={{
            borderColor: isLight ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 215, 0, 0.12)',
          }}
        >
          {/* Brand Info with Official Logo */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              onClick={() => sound.playClick()}
              className="inline-block"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={isLight ? '/logo-black.png' : '/logo-white.png'}
                alt={siteName}
                className="h-11 sm:h-12 w-auto object-contain transition-transform hover:scale-105"
              />
            </Link>

            <p
              className={`text-xs leading-relaxed max-w-sm ${
                language === 'si' ? 'font-sinhala text-[13px]' : ''
              }`}
              style={{ color: isLight ? '#475569' : 'rgba(232, 227, 216, 0.75)' }}
            >
              {customization?.footer_tagline ||
                (language === 'si'
                  ? 'සිලෝන් ටයිම්ස් (ceylon-times.lk) යනු සැබෑ ශ්‍රී ලාංකීය උරුමය, සහතිකලත් රත්නපුර නිල් මැණික්, උඩරට අත්යන්ත්‍ර රෙදිපිළි සහ පූජනීය පිත්තල කලාව ලොවට ගෙන යන ඩිජිටල් නිර්මාණ කේන්ද්‍රස්ථානයයි.'
                  : 'Ceylon Times (ceylon-times.lk) is the sovereign digital atelier celebrating timeless Sri Lankan craftsmanship, certified Ratnapura sapphires, Kandyan handlooms, and sacred temple living arts.')}
            </p>

            {/* Social Links */}
            <div
              className="flex items-center gap-3.5 pt-2"
              style={{ color: isLight ? '#996515' : '#FFD700' }}
            >
              {/* Render dynamic social links from customization */}
              {(customization?.footer_social_links ?? [
                { id: 's1', platform: 'Instagram', url: 'https://instagram.com', enabled: true },
                { id: 's2', platform: 'Twitter/X', url: 'https://twitter.com', enabled: true },
                { id: 's3', platform: 'Facebook', url: 'https://facebook.com', enabled: true },
              ]).filter(s => s.enabled).map(social => (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => sound.playClick()}
                  className="transition-colors hover:text-amber-600"
                  aria-label={social.platform}
                >
                  {social.platform.toLowerCase().includes('instagram') && (
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  )}
                  {(social.platform.toLowerCase().includes('twitter') || social.platform.toLowerCase().includes('x')) && (
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  )}
                  {social.platform.toLowerCase().includes('facebook') && (
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.595 0 9 1.583 9 4.615V8z"/></svg>
                  )}
                  {social.platform.toLowerCase().includes('youtube') && (
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.495 6.205a3.007 3.007 0 0 0-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 0 0 .527 6.205a31.247 31.247 0 0 0-.522 5.805 31.247 31.247 0 0 0 .522 5.783 3.007 3.007 0 0 0 2.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 0 0 2.088-2.088 31.247 31.247 0 0 0 .5-5.783 31.247 31.247 0 0 0-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/></svg>
                  )}
                  {!['instagram','twitter','x','facebook','youtube'].some(p => social.platform.toLowerCase().includes(p)) && (
                    <span className="text-xs font-bold">{social.platform.slice(0,2).toUpperCase()}</span>
                  )}
                </a>
              ))}
            </div>
          </div>

          {/* Dynamic Footer Columns from customization */}
          {(customization?.footer_columns ?? [
            {
              id: 'col-1',
              heading: 'Collections',
              links: [
                { id: 'fc-1', label: t('jewellery'), href: '/products?category=jewellery', enabled: true },
                { id: 'fc-2', label: t('textiles'), href: '/products?category=textiles', enabled: true },
                { id: 'fc-3', label: t('sacredLiving'), href: '/products?category=sacred-living', enabled: true },
                { id: 'fc-4', label: t('ayurveda'), href: '/products?category=ayurveda', enabled: true },
                { id: 'fc-5', label: t('tea'), href: '/products?category=tea', enabled: true },
              ],
            },
            {
              id: 'col-2',
              heading: 'Island Support',
              links: [
                { id: 'fs-1', label: 'Our Heritage', href: '/about', enabled: true },
                { id: 'fs-2', label: 'Artisan Care Guide', href: '/faq', enabled: true },
                { id: 'fs-3', label: 'Island Delivery', href: '/shipping', enabled: true },
                { id: 'fs-4', label: 'Easy Exchanges', href: '/returns', enabled: true },
                { id: 'fs-5', label: 'Bespoke Inquiries', href: '/contact', enabled: true },
              ],
            },
            {
              id: 'col-3',
              heading: 'Platform',
              links: [
                { id: 'fp-1', label: t('account'), href: '/account', enabled: true },
                { id: 'fp-2', label: t('cart'), href: '/cart', enabled: true },
                { id: 'fp-3', label: 'Privacy Policy', href: '/privacy', enabled: true },
                { id: 'fp-4', label: 'Terms of Service', href: '/terms', enabled: true },
              ],
            },
          ]).map((col) => (
            <div key={col.id}>
              <h4
                className="text-[10px] uppercase tracking-[0.2em] font-bold mb-4"
                style={{
                  fontFamily: 'var(--font-rajdhani)',
                  color: isLight ? '#996515' : '#FFD700',
                }}
              >
                {col.heading}
              </h4>
              <ul className="space-y-2.5">
                {col.id === 'col-3' && isAdmin && (
                  <li>
                    <Link
                      href="/admin"
                      onClick={() => sound.playClick()}
                      className="flex items-center gap-1 font-bold text-xs"
                      style={{ color: isLight ? '#996515' : '#FFD700' }}
                    >
                      <span>Admin Dashboard</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </li>
                )}
                {col.links.filter(l => l.enabled).map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={() => sound.playClick()}
                      className="text-xs transition-colors hover:text-amber-600"
                      style={{ color: linkColor }}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Lower Row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p style={{ color: isLight ? '#64748B' : 'rgba(232,227,216,0.5)' }}>
            {customization?.footer_copyright ||
              `© ${new Date().getFullYear()} Ceylon Times (ceylon-times.lk). All rights reserved. Proudly Sri Lankan.`}
          </p>
          <div
            className="flex flex-wrap items-center gap-4 text-[11px]"
            style={{ color: isLight ? '#996515' : 'rgba(255,215,0,0.8)' }}
          >
            {(customization?.footer_badges ?? [
              { id: 'b1', icon: '', text: 'Island-wide Courier', enabled: true },
              { id: 'b2', icon: '', text: 'Authenticity Seal', enabled: true },
              { id: 'b3', icon: '', text: 'Provenance Guarantee', enabled: true },
            ]).filter(b => b.enabled).map((badge, i) => (
              <span key={badge.id} className="flex items-center gap-1">
                {i === 0 && <Truck className="w-3.5 h-3.5" />}
                {i === 1 && <ShieldCheck className="w-3.5 h-3.5" />}
                {i === 2 && <RefreshCw className="w-3.5 h-3.5" />}
                {badge.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
