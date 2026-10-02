'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, RefreshCw, Mail, Phone, MapPin } from 'lucide-react';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import { defaultSiteSettings } from '@/lib/seed-data';

export default function ReturnsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <Header siteName={defaultSiteSettings.site_name} announcementText={defaultSiteSettings.announcement_bar_text} />
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 lg:px-16 py-12">
        <nav className="flex items-center gap-2 text-xs text-primary-muted uppercase tracking-tracked mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 opacity-40" />
          <span className="text-primary font-medium">Complimentary Exchanges</span>
        </nav>

        <div className="border border-black/10 bg-white p-8 md:p-12 mb-10 shadow-2xs max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <RefreshCw className="w-6 h-6 text-[#C9A96E]" />
            <h1 className="font-serif text-3xl sm:text-4xl text-primary font-normal">Complimentary Returns &amp; Exchanges</h1>
          </div>
          <p className="text-xs text-primary-muted font-sans mb-8">We offer a 30-day inspection period for unworn artifacts in original archival packaging.</p>

          <div className="space-y-6 text-xs text-primary leading-relaxed font-sans">
            <div>
              <h3 className="font-serif text-base text-primary font-medium mb-1">Return Protocol</h3>
              <p className="text-primary-muted">To initiate a return or exchange, contact our concierge at <span className="text-primary font-semibold">concierge@ateliernoir.com</span> with your archival order number. We will dispatch an insured courier pickup directly to your sanctuary.</p>
            </div>
            <div>
              <h3 className="font-serif text-base text-primary font-medium mb-1">Condition Criteria</h3>
              <p className="text-primary-muted">Horological pieces must retain original protective film and untouched caseback security seals. Leather goods must exhibit zero creasing or patina from personal use.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer siteName={defaultSiteSettings.site_name} />
    </div>
  );
}
