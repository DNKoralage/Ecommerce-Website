'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Shield } from 'lucide-react';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import { defaultSiteSettings } from '@/lib/seed-data';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <Header siteName={defaultSiteSettings.site_name} announcementText={defaultSiteSettings.announcement_bar_text} />
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 lg:px-16 py-12">
        <nav className="flex items-center gap-2 text-xs text-primary-muted uppercase tracking-tracked mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 opacity-40" />
          <span className="text-primary font-medium">Privacy Charter</span>
        </nav>
        <div className="border border-black/10 bg-white p-8 md:p-12 mb-10 shadow-2xs max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-6 h-6 text-[#C9A96E]" />
            <h1 className="font-serif text-3xl sm:text-4xl text-primary font-normal">Patron Privacy Charter</h1>
          </div>
          <p className="text-xs text-primary-muted font-sans mb-8">Atelier Noir adheres to the strictest cryptographic and data seclusion standards for our global clientele.</p>
          <div className="space-y-4 text-xs text-primary-muted font-sans leading-relaxed">
            <p>1. Data Minimization: We collect only the information strictly necessary to authenticate ownership, coordinate insured transit, and provide lifetime restoration services.</p>
            <p>2. Zero Third-Party Monetization: Under no circumstances is patron telemetry, transaction history, or contact credentials shared or licensed to marketing networks.</p>
            <p>3. Encryption: All checkout communications and storage vaults are encrypted using 256-bit AES protocols with continuous security auditing.</p>
          </div>
        </div>
      </main>
      <Footer siteName={defaultSiteSettings.site_name} />
    </div>
  );
}
