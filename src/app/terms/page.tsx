'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, FileText } from 'lucide-react';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import { defaultSiteSettings } from '@/lib/seed-data';

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <Header siteName={defaultSiteSettings.site_name} announcementText={defaultSiteSettings.announcement_bar_text} />
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 lg:px-16 py-12">
        <nav className="flex items-center gap-2 text-xs text-primary-muted uppercase tracking-tracked mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 opacity-40" />
          <span className="text-primary font-medium">Terms of Patronage</span>
        </nav>
        <div className="border border-black/10 bg-white p-8 md:p-12 mb-10 shadow-2xs max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-6 h-6 text-[#C9A96E]" />
            <h1 className="font-serif text-3xl sm:text-4xl text-primary font-normal">Terms of Patronage</h1>
          </div>
          <p className="text-xs text-primary-muted font-sans mb-8">By placing an order with Atelier Noir, you agree to these terms governing numbered editions, warranty, and insured courier dispatch.</p>
          <div className="space-y-4 text-xs text-primary-muted font-sans leading-relaxed">
            <p>1. Limited Allocations: Numbered editions are strictly capped to the indicated production run. Orders are processed on a verified first-received chronological basis.</p>
            <p>2. Warranty &amp; Servicing: Every horological artifact carries a complimentary 5-year mechanical movement warranty covering caliber regulation and parts defect.</p>
            <p>3. Title &amp; Risk: Risk of loss passes to patron upon validated signature delivery by our accredited courier partners.</p>
          </div>
        </div>
      </main>
      <Footer siteName={defaultSiteSettings.site_name} />
    </div>
  );
}
