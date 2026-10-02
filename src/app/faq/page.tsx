'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, HelpCircle } from 'lucide-react';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import { defaultSiteSettings } from '@/lib/seed-data';

export default function FAQPage() {
  const faqs = [
    {
      q: 'How are Atelier Noir timepieces authenticated?',
      a: 'Each timepiece includes an individualized engraved archival serial and physical certification documented in our Geneva register.'
    },
    {
      q: 'What is the provenance of your leather goods?',
      a: 'We exclusively source A-grade vegetable-tanned hides from certified tanneries in Santa Croce sull\'Arno, Tuscany.'
    },
    {
      q: 'How long does insured white-glove transit take?',
      a: 'Domestic courier delivery takes 2–4 business days. International express shipping takes 4–7 business days with temperature-controlled transit.'
    },
    {
      q: 'Can I request bespoke personalization or engraving?',
      a: 'Yes, bespoke hand-engravings can be coordinated through our concierge after securing your numbered edition.'
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <Header siteName={defaultSiteSettings.site_name} announcementText={defaultSiteSettings.announcement_bar_text} />
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 lg:px-16 py-12">
        <nav className="flex items-center gap-2 text-xs text-primary-muted uppercase tracking-tracked mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 opacity-40" />
          <span className="text-primary font-medium">Care &amp; Restoration</span>
        </nav>

        <div className="border border-black/10 bg-white p-8 md:p-12 mb-10 shadow-2xs">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="w-6 h-6 text-[#C9A96E]" />
            <h1 className="font-serif text-3xl sm:text-4xl text-primary font-normal">Care &amp; Restoration FAQ</h1>
          </div>
          <p className="text-xs text-primary-muted font-sans">Everything you need to know about our horological servicing, leather preservation, and provenance.</p>
        </div>

        <div className="space-y-6 max-w-3xl mb-12">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white border border-black/10 p-6 shadow-2xs">
              <h3 className="font-serif text-lg text-primary font-medium mb-2">{faq.q}</h3>
              <p className="text-xs text-primary-muted leading-relaxed font-sans">{faq.a}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer siteName={defaultSiteSettings.site_name} />
    </div>
  );
}
