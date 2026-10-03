'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useSiteCustomization } from '@/context/SiteCustomizationContext';
import { sound } from '@/lib/sound';

interface FooterProps {
  siteName?: string;
  tagline?: string;
  logoUrl?: string | null;
}

export default function Footer({
  siteName = 'Ceylon Times',
  tagline   = 'Sri Lanka\'s Favourite Multi-Vendor Marketplace',
  logoUrl,
}: FooterProps) {
  const { isAdmin }     = useAuth();
  const { theme }       = useTheme();
  const { customization } = useSiteCustomization();
  const isLight = theme === 'light';

  const bg      = isLight ? '#FFFFFF' : '#1E293B';
  const border  = isLight ? '#E2E8F0' : 'rgba(51,65,85,0.7)';
  const txtMain = isLight ? '#0F172A' : '#F1F5F9';
  const txtMute = isLight ? '#64748B' : '#94A3B8';

  const footerColumns = customization?.footer_columns ?? [
    {
      id: 'col-1',
      heading: 'Shop',
      links: [
        { id: 'fc-1', label: 'All Products',   href: '/products',                      enabled: true },
        { id: 'fc-2', label: 'Jewellery',       href: '/products?category=jewellery',   enabled: true },
        { id: 'fc-3', label: 'Textiles',        href: '/products?category=textiles',    enabled: true },
        { id: 'fc-4', label: 'Ayurveda',        href: '/products?category=ayurveda',    enabled: true },
        { id: 'fc-5', label: 'Tea',             href: '/products?category=tea',         enabled: true },
      ],
    },
    {
      id: 'col-2',
      heading: 'Support',
      links: [
        { id: 'fs-1', label: 'About Us',        href: '/about',     enabled: true },
        { id: 'fs-2', label: 'FAQ',             href: '/faq',       enabled: true },
        { id: 'fs-3', label: 'Shipping Info',   href: '/shipping',  enabled: true },
        { id: 'fs-4', label: 'Returns',         href: '/returns',   enabled: true },
        { id: 'fs-5', label: 'Contact',         href: '/contact',   enabled: true },
      ],
    },
    {
      id: 'col-3',
      heading: 'Account',
      links: [
        { id: 'fp-1', label: 'My Account',      href: '/account',   enabled: true },
        { id: 'fp-2', label: 'My Orders',       href: '/account',   enabled: true },
        { id: 'fp-3', label: 'Privacy Policy',  href: '/privacy',   enabled: true },
        { id: 'fp-4', label: 'Terms of Service',href: '/terms',     enabled: true },
      ],
    },
  ];

  return (
    <footer
      style={{
        background: bg,
        borderTop: `1px solid ${border}`,
        color: txtMain,
      }}
      className="pt-14 pb-8 transition-colors"
    >
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16">
        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-10 border-b" style={{ borderColor: border }}>

          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
              <Image
                src={logoUrl || (isLight ? '/logo-black.png' : '/logo-white.png')}
                alt={siteName || 'Ceylon Times'}
                width={120}
                height={46}
                className="object-contain flex-shrink-0"
                style={{ height: 40, width: 'auto', maxWidth: 140 }}
                unoptimized
                priority
              />

            <p className="text-sm leading-relaxed max-w-sm" style={{ color: txtMute }}>
              {customization?.footer_tagline || tagline}
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {[
                { icon: Truck,       label: 'Island-wide Delivery' },
                { icon: ShieldCheck, label: 'Secure Payments' },
                { icon: RefreshCw,   label: 'Easy Returns' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs" style={{ color: txtMute }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: '#2563EB' }} />
                  {label}
                </div>
              ))}
            </div>

            {/* Socials */}
            <div className="flex items-center gap-3 pt-1">
              {(customization?.footer_social_links ?? [
                { id: 's1', platform: 'Instagram', url: 'https://instagram.com', enabled: true },
                { id: 's2', platform: 'Twitter/X', url: 'https://twitter.com',   enabled: true },
                { id: 's3', platform: 'Facebook',  url: 'https://facebook.com',  enabled: true },
              ]).filter(s => s.enabled).map(social => (
                <a
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all"
                  style={{
                    background: isLight ? '#F1F5F9' : 'rgba(30,41,59,0.8)',
                    color: txtMute,
                    border: `1px solid ${border}`,
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(37,99,235,0.4)'; (e.currentTarget as HTMLElement).style.color = '#2563EB'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = border; (e.currentTarget as HTMLElement).style.color = txtMute; }}
                  aria-label={social.platform}
                >
                  {social.platform.slice(0, 2).toUpperCase()}
                </a>
              ))}
            </div>
          </div>

          {/* Nav Columns */}
          {footerColumns.map((col) => (
            <div key={col.id}>
              <h4 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#2563EB' }}>
                {col.heading}
              </h4>
              <ul className="space-y-2.5">
                {col.id === 'col-3' && isAdmin && (
                  <li>
                    <Link
                      href="/admin"
                      onClick={() => sound.playClick()}
                      className="flex items-center gap-1 text-sm font-semibold transition-colors"
                      style={{ color: '#2563EB' }}
                    >
                      Admin Dashboard <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </li>
                )}
                {col.links.filter(l => l.enabled).map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      onClick={() => sound.playClick()}
                      className="text-sm transition-colors"
                      style={{ color: txtMute }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#2563EB'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = txtMute; }}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs" style={{ color: txtMute }}>
          {/* Ceylon Times branding in bottom bar */}
          <div className="flex items-center gap-2.5">
            <Link href="/" onClick={() => sound.playClick()} className="inline-flex items-center gap-1.5 hover:opacity-90 transition-opacity">
              <Image
                src={logoUrl || (isLight ? '/logo-black.png' : '/logo-white.png')}
                alt="Ceylon Times"
                width={70}
                height={28}
                className="object-contain"
                style={{ height: 24, width: 'auto', maxWidth: 80 }}
                unoptimized
              />
            </Link>
            <span className="opacity-40">|</span>
            <p>
              {customization?.footer_copyright ||
                `© ${new Date().getFullYear()} Ceylon Times. All rights reserved.`}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
              style={{ background: isLight ? '#EFF6FF' : 'rgba(37,99,235,0.1)', color: '#2563EB' }}
            >
              COD Available
            </span>
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
              style={{ background: isLight ? '#F0FDF4' : 'rgba(16,185,129,0.1)', color: '#059669' }}
            >
              Verified Vendors
            </span>
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
              style={{ background: isLight ? '#FFF7ED' : 'rgba(245,158,11,0.1)', color: '#D97706' }}
            >
              Island-wide Shipping
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
