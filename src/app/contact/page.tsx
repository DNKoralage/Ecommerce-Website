'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import { defaultSiteSettings } from '@/lib/seed-data';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <Header siteName={defaultSiteSettings.site_name} announcementText={defaultSiteSettings.announcement_bar_text} />
      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 lg:px-16 py-12">
        <nav className="flex items-center gap-2 text-xs text-primary-muted uppercase tracking-tracked mb-8">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 opacity-40" />
          <span className="text-primary font-medium">Bespoke Inquiries</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-black/10 bg-white p-8 shadow-2xs">
              <h1 className="font-serif text-3xl sm:text-4xl text-primary font-normal mb-3">Atelier Concierge</h1>
              <p className="text-xs text-primary-muted font-sans leading-relaxed mb-8">
                Our private client advisors are available for bespoke commissions, private viewings, and collection consultations.
              </p>

              <div className="space-y-4 text-xs font-sans">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#C9A96E] mt-0.5" />
                  <div>
                    <span className="font-semibold block text-primary">Direct Inquiries</span>
                    <span className="text-primary-muted">concierge@ateliernoir.com</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#C9A96E] mt-0.5" />
                  <div>
                    <span className="font-semibold block text-primary">Private Line</span>
                    <span className="text-primary-muted">+91 (0) 22 8492 0184</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-[#C9A96E] mt-0.5" />
                  <div>
                    <span className="font-semibold block text-primary">Salon &amp; Workshop</span>
                    <span className="text-primary-muted">Heritage Precinct, Nariman Point, Mumbai 400021</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="bg-white border border-black/10 p-8 shadow-2xs">
              <h2 className="font-serif text-2xl text-primary font-medium mb-6 pb-4 border-b border-black/10">Dispatch a Transmission</h2>
              {submitted ? (
                <div className="py-12 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h3 className="font-serif text-xl text-primary">Inquiry Cataloged</h3>
                  <p className="text-xs text-primary-muted max-w-sm mx-auto">A senior concierge advisor will respond to your transmission within 4 business hours.</p>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSubmitted(true);
                  }}
                  className="space-y-4 text-xs font-sans"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-tracked text-primary mb-1.5">Honorific &amp; Name</label>
                      <input required type="text" placeholder="Julian Sterling" className="w-full p-3 bg-white border border-black/15 text-primary focus:outline-none focus:border-primary" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold uppercase tracking-tracked text-primary mb-1.5">Email Destination</label>
                      <input required type="email" placeholder="julian@example.com" className="w-full p-3 bg-white border border-black/15 text-primary focus:outline-none focus:border-primary" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-tracked text-primary mb-1.5">Inquiry Classification</label>
                    <select className="w-full p-3 bg-white border border-black/15 text-primary focus:outline-none focus:border-primary">
                      <option>Horological Commission &amp; Allocation</option>
                      <option>Custom Leather Guild Order</option>
                      <option>Care, Servicing &amp; Verification</option>
                      <option>Corporate &amp; Architectural Gifting</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-tracked text-primary mb-1.5">Transmission Narrative</label>
                    <textarea required rows={4} placeholder="Detail your specifications or inquiry..." className="w-full p-3 bg-white border border-black/15 text-primary focus:outline-none focus:border-primary" />
                  </div>
                  <button type="submit" className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-white text-xs font-semibold uppercase tracking-tracked hover:bg-[#C9A96E] transition-colors">
                    <span>Submit Transmission</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer siteName={defaultSiteSettings.site_name} />
    </div>
  );
}
