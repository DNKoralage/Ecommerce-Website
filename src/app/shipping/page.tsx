'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Truck, ShieldCheck } from 'lucide-react';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import { defaultSiteSettings } from '@/lib/seed-data';

export default function ShippingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <Header siteName={defaultSiteSettings.site_name} announcementText={defaultSiteSettings.announcement_bar_text} />
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 lg:px-16 py-12">
        <nav className="flex items-center gap-2 text-xs text-primary-muted uppercase tracking-tracked mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 opacity-40" />
          <span className="text-primary font-medium">Insured Delivery</span>
        </nav>

        <div className="border border-black/10 bg-white p-8 md:p-12 mb-10 shadow-2xs max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <Truck className="w-6 h-6 text-[#C9A96E]" />
            <h1 className="font-serif text-3xl sm:text-4xl text-primary font-normal">Insured Delivery Charter</h1>
          </div>
          <p className="text-xs text-primary-muted font-sans mb-8">Every parcel dispatched from Atelier Noir travels under full Lloyd's syndicate marine transit insurance.</p>

          <div className="space-y-6 text-xs text-primary leading-relaxed font-sans">
            <div>
              <h3 className="font-serif text-base text-primary font-medium mb-1">Domestic Expedited Transit</h3>
              <p className="text-primary-muted">Complimentary on orders above ₹2,500. Standard 2-4 business day transit via BlueDart Apex priority courier with signature release verification.</p>
            </div>
            <div>
              <h3 className="font-serif text-base text-primary font-medium mb-1">International Air Express</h3>
              <p className="text-primary-muted">DHL Express Worldwide delivery across 120+ territories within 4-7 business days, including complete customs handling and prepaid duty brokerage.</p>
            </div>
            <div className="p-4 bg-[#F5F5F0] border border-black/10 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0" />
              <p className="text-[11px] text-primary-muted">All fragile and horological artifacts are sealed in tamper-evident security containers with dual signature validation upon arrival.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer siteName={defaultSiteSettings.site_name} />
    </div>
  );
}
