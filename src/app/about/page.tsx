'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronRight, Award, Compass, Shield, Sparkles, Gem, Leaf, Flame, ArrowRight } from 'lucide-react';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import { defaultSiteSettings } from '@/lib/seed-data';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#02030A] text-[#E8E3D8] selection:bg-[#FFD700]/30 selection:text-[#FFD700]">
      <Header
        siteName={defaultSiteSettings.site_name}
        announcementText={defaultSiteSettings.announcement_bar_text}
      />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 lg:px-16 py-12 relative">
        {/* Subtle ambient neon glow */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(255,215,0,0.06)_0%,transparent_70%)] pointer-events-none -z-10" />
        <div className="absolute top-2/3 left-1/4 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(0,255,255,0.04)_0%,transparent_70%)] pointer-events-none -z-10" />

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#E8E3D8]/60 uppercase tracking-[0.18em] mb-8" style={{ fontFamily: 'var(--font-rajdhani)' }}>
          <Link href="/" className="hover:text-[#FFD700] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 opacity-40 text-[#FFD700]" />
          <span className="text-[#FFD700] font-bold">The Ceylon Heritage</span>
        </nav>

        {/* Hero Banner with Cyberpunk Sri Lankan aesthetic */}
        <div
          className="p-8 md:p-16 mb-16 text-center max-w-4xl mx-auto relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(8, 12, 28, 0.95) 0%, rgba(2, 3, 10, 0.98) 100%)',
            border: '1px solid rgba(255, 215, 0, 0.3)',
            boxShadow: '0 0 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(255, 215, 0, 0.1)',
            backdropFilter: 'blur(20px)',
            clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))',
          }}
        >
          {/* Cyber Corner Decors */}
          <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#FFD700]" />
          <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#00FFFF]" />
          <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#00FFFF]" />
          <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#FFD700]" />

          <span
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-[10px] font-bold tracking-[0.25em] uppercase text-[#FFD700] mb-4"
            style={{
              background: 'rgba(255, 215, 0, 0.1)',
              border: '1px solid rgba(255, 215, 0, 0.35)',
              fontFamily: 'var(--font-rajdhani)',
            }}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00FFFF]" />
            ceylontimes.lk ✦ The Island Chronicle
          </span>

          <h1
            className="font-serif text-3xl sm:text-5xl text-white font-normal leading-tight mb-6 tracking-wide"
            style={{ textShadow: '0 0 25px rgba(255,215,0,0.3)' }}
          >
            Ancient Sri Lankan Craftsmanship <br />
            <span className="text-[#FFD700]" style={{ textShadow: '0 0 20px rgba(255,215,0,0.6)' }}>
              Elevated by Cybernetic Precision
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[#E8E3D8]/75 font-sans leading-relaxed max-w-2xl mx-auto">
            Operating from the historic heart of Colombo 03 and the artisan bastions of Galle Fort and Kandy, <strong className="text-white">Ceylon Times</strong> preserves the sovereign heritage of our island nation. From certified Ratnapura cornflower sapphires to royal Kandyan loom handweaves, every artifact is cataloged with immutable provenance.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div
            className="p-8 relative transition-all duration-300 hover:-translate-y-1"
            style={{
              background: 'rgba(8, 12, 28, 0.8)',
              border: '1px solid rgba(255, 215, 0, 0.2)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
            }}
          >
            <div
              className="w-12 h-12 rounded-sm flex items-center justify-center mb-5"
              style={{
                background: 'rgba(255, 215, 0, 0.1)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
              }}
            >
              <Gem className="w-6 h-6 text-[#FFD700]" />
            </div>
            <h3 className="font-serif text-xl text-white font-medium mb-2">Ratnapura &amp; Galle Gem Guilds</h3>
            <p className="text-xs text-[#E8E3D8]/70 leading-relaxed font-sans">
              Our master lapidaries hand-cut unheated Ceylon sapphires, padparadscha gems, and alexandrites directly from the historic gravels of Ratnapura, set in Galle Fort artisanal silverwork.
            </p>
          </div>

          <div
            className="p-8 relative transition-all duration-300 hover:-translate-y-1"
            style={{
              background: 'rgba(8, 12, 28, 0.8)',
              border: '1px solid rgba(0, 255, 255, 0.2)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
            }}
          >
            <div
              className="w-12 h-12 rounded-sm flex items-center justify-center mb-5"
              style={{
                background: 'rgba(0, 255, 255, 0.1)',
                border: '1px solid rgba(0, 255, 255, 0.3)',
              }}
            >
              <Compass className="w-6 h-6 text-[#00FFFF]" />
            </div>
            <h3 className="font-serif text-xl text-white font-medium mb-2">Kandyan Royal Handlooms</h3>
            <p className="text-xs text-[#E8E3D8]/70 leading-relaxed font-sans">
              Woven on heavy wooden floor looms by generational village weavers in Dumbara and the central highlands. Hand-loomed silks and gold zari patterns inspired by the ancient Kingdom of Kandy.
            </p>
          </div>

          <div
            className="p-8 relative transition-all duration-300 hover:-translate-y-1"
            style={{
              background: 'rgba(8, 12, 28, 0.8)',
              border: '1px solid rgba(255, 215, 0, 0.2)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
              clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px))',
            }}
          >
            <div
              className="w-12 h-12 rounded-sm flex items-center justify-center mb-5"
              style={{
                background: 'rgba(255, 215, 0, 0.1)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
              }}
            >
              <Shield className="w-6 h-6 text-[#FFD700]" />
            </div>
            <h3 className="font-serif text-xl text-white font-medium mb-2">Sacred Temple Arts</h3>
            <p className="text-xs text-[#E8E3D8]/70 leading-relaxed font-sans">
              Ceremonial brass oil lamps cast using ancient lost-wax techniques by temple smiths, hand-carved ebony ceremonial art, and single-estate orthodox teas picked at dawn in Nuwara Eliya.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div
          className="p-10 md:p-14 text-center relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(6, 9, 24, 0.95) 0%, rgba(2, 3, 10, 0.98) 100%)',
            border: '1px solid rgba(255, 215, 0, 0.25)',
            boxShadow: '0 0 50px rgba(255, 215, 0, 0.08)',
          }}
        >
          <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#00FFFF] block mb-2" style={{ fontFamily: 'var(--font-rajdhani)' }}>
            Island Provenance Guarantee
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-light text-white mb-4">
            Experience the Living Ceylon Treasury
          </h2>
          <p className="text-xs sm:text-sm text-[#E8E3D8]/70 max-w-md mx-auto mb-8 font-sans leading-relaxed">
            Discover numbered Ceylon sapphire pieces, royal handlooms, and sacred temple decor priced in Sri Lankan Rupees (LKR).
          </p>
          <Link href="/products" className="btn-neon-gold text-xs inline-flex py-3.5 px-8">
            <Gem className="w-4 h-4" />
            <span>Explore Ceylon Editions</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </main>

      <Footer siteName={defaultSiteSettings.site_name} />
    </div>
  );
}
