'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShoppingBag,
  ArrowRight,
  Plus,
  Minus,
  Trash2,
  Tag,
  ShieldCheck,
  ChevronRight,
  RotateCcw,
  Gem,
} from 'lucide-react';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { defaultSiteSettings } from '@/lib/seed-data';

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    discountAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    total,
    clearCart,
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsApplying(true);
    setCouponError('');
    const res = await applyCoupon(couponCode.trim());
    setIsApplying(false);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponCode('');
    }
  };

  const freeShippingThreshold = 7500;
  const estimatedShipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 350;
  const grandTotal = total + estimatedShipping;

  return (
    <div className="min-h-screen flex flex-col bg-[#02030A] text-[#E8E3D8] selection:bg-[#FFD700]/30 selection:text-[#FFD700]">
      <Header
        siteName={defaultSiteSettings.site_name}
        announcementText={defaultSiteSettings.announcement_bar_text}
      />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 lg:px-16 py-12 relative">
        {/* Subtle ambient neon glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[radial-gradient(circle,rgba(255,215,0,0.05)_0%,transparent_70%)] pointer-events-none -z-10" />

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#E8E3D8]/60 uppercase tracking-[0.18em] mb-8" style={{ fontFamily: 'var(--font-rajdhani)' }}>
          <Link href="/" className="hover:text-[#FFD700] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 opacity-40 text-[#FFD700]" />
          <span className="text-[#FFD700] font-bold">Your Archival Bag</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-6 border-b border-yellow-500/15 gap-4 mb-10">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#00FFFF] block mb-1" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              Colombo Concierge Ledger
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-white font-normal tracking-wide">
              Your Curated Bag
            </h1>
            <p className="text-xs text-[#E8E3D8]/70 mt-2 font-sans">
              Review your reserved Ceylon masterworks prior to secure island dispatch.
            </p>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-xs text-[#FF2D55] hover:text-white transition-colors flex items-center gap-1.5 cursor-pointer font-bold"
              style={{ fontFamily: 'var(--font-rajdhani)' }}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Empty Bag</span>
            </button>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty Bag State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-16 text-center max-w-lg mx-auto my-12"
            style={{
              background: 'rgba(8, 12, 28, 0.85)',
              border: '1px solid rgba(255, 215, 0, 0.25)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 0 30px rgba(0, 0, 0, 0.8)',
            }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{
                background: 'rgba(255, 215, 0, 0.1)',
                border: '1px solid rgba(255, 215, 0, 0.3)',
              }}
            >
              <ShoppingBag className="w-7 h-7 text-[#FFD700]" />
            </div>
            <h2 className="font-serif text-2xl text-white mb-2">Your Bag is Empty</h2>
            <p className="text-xs text-[#E8E3D8]/65 leading-relaxed mb-8 max-w-sm mx-auto font-sans">
              You have not yet reserved any pieces from the Ceylon Times treasury.
            </p>
            <Link href="/products" className="btn-neon-gold text-xs inline-flex">
              <span>Explore Treasury</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </motion.div>
        ) : (
          /* Cart Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Items Table (8 Cols) */}
            <div
              className="lg:col-span-8 divide-y divide-yellow-500/10"
              style={{
                background: 'rgba(8, 12, 28, 0.8)',
                border: '1px solid rgba(255, 215, 0, 0.2)',
                boxShadow: '0 0 30px rgba(0, 0, 0, 0.5)',
              }}
            >
              {items.map((item) => (
                <div key={item.id} className="p-6 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                  <div
                    className="w-24 h-28 overflow-hidden shrink-0"
                    style={{
                      background: '#04060E',
                      border: '1px solid rgba(255, 215, 0, 0.25)',
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-1">
                    <Link
                      href={`/products/${item.slug}`}
                      className="font-serif text-lg text-white hover:text-[#FFD700] transition-colors block leading-snug"
                    >
                      {item.title}
                    </Link>
                    {item.variant_info && Object.keys(item.variant_info).length > 0 && (
                      <p className="text-xs text-[#00FFFF]/70" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                        {Object.entries(item.variant_info)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(' • ')}
                      </p>
                    )}
                    <p className="text-xs font-bold text-[#FFD700] pt-1" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  {/* Quantity Stepper */}
                  <div
                    className="flex items-center"
                    style={{
                      background: 'rgba(4, 6, 16, 0.9)',
                      border: '1px solid rgba(255, 215, 0, 0.3)',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-2 text-[#E8E3D8] hover:text-[#FFD700] transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-4 text-xs font-bold text-white font-sans">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, 1)}
                      disabled={item.quantity >= item.max_stock}
                      className="p-2 text-[#E8E3D8] hover:text-[#FFD700] disabled:opacity-30 transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Line Total */}
                  <div className="text-right sm:w-32">
                    <div
                      className="text-sm font-bold text-[#FFD700]"
                      style={{
                        fontFamily: 'var(--font-rajdhani)',
                        textShadow: '0 0 10px rgba(255,215,0,0.4)',
                      }}
                    >
                      {formatPrice(item.price * item.quantity)}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="text-[11px] text-[#FF2D55] hover:underline mt-1 inline-flex items-center gap-1 cursor-pointer font-bold"
                      style={{ fontFamily: 'var(--font-rajdhani)' }}
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary (4 Cols) */}
            <div
              className="lg:col-span-4 p-8 space-y-6"
              style={{
                background: 'rgba(8, 12, 28, 0.85)',
                border: '1px solid rgba(255, 215, 0, 0.25)',
                boxShadow: '0 0 35px rgba(0, 0, 0, 0.8)',
              }}
            >
              <h2 className="font-serif text-xl text-white font-medium pb-4 border-b border-yellow-500/15">
                Ceylon Order Ledger
              </h2>

              {/* Promo Code Input */}
              <div>
                {appliedCoupon ? (
                  <div
                    className="flex items-center justify-between p-3 text-xs font-bold"
                    style={{
                      background: 'rgba(0, 255, 136, 0.08)',
                      border: '1px solid rgba(0, 255, 136, 0.3)',
                      color: '#00FF88',
                      fontFamily: 'var(--font-rajdhani)',
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5" />
                      <span className="font-bold">{appliedCoupon.code}</span>
                      <span>(-{formatPrice(discountAmount)})</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-[#FF2D55] text-[11px] underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="PROMO CODE (e.g. CEYLON22)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 p-2.5 text-xs text-[#E8E3D8] placeholder:text-[#E8E3D8]/30 uppercase focus:outline-none"
                      style={{
                        background: 'rgba(4, 6, 16, 0.8)',
                        border: '1px solid rgba(255, 215, 0, 0.25)',
                      }}
                    />
                    <button
                      type="submit"
                      disabled={isApplying || !couponCode.trim()}
                      className="btn-neon-outline text-xs px-4 py-2.5 disabled:opacity-50"
                    >
                      {isApplying ? '...' : 'Apply'}
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-[11px] text-[#FF2D55] mt-1.5 font-bold" style={{ fontFamily: 'var(--font-rajdhani)' }}>{couponError}</p>
                )}
              </div>

              {/* Totals Breakdown in LKR */}
              <div className="space-y-3 text-xs text-[#E8E3D8]/70 pt-2 border-t border-yellow-500/15" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white font-bold">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-[#00FF88]">
                    <span>Privilege Benefit</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Island Courier Shipping</span>
                  <span>
                    {estimatedShipping === 0 ? (
                      <span className="text-[#00FF88] font-bold">Complimentary</span>
                    ) : (
                      formatPrice(estimatedShipping)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-4 border-t border-yellow-500/15">
                  <span className="text-[#FFD700]">Total (LKR)</span>
                  <span
                    className="font-serif text-2xl text-[#FFD700]"
                    style={{ textShadow: '0 0 10px rgba(255,215,0,0.5)' }}
                  >
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Checkout CTA 3D Neon */}
              <Link href="/checkout" className="block w-full">
                <button className="w-full btn-neon-gold py-4 text-xs flex items-center justify-center gap-2">
                  <Gem className="w-4 h-4" />
                  <span>Proceed to Secure Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>

              <div className="pt-2 text-[11px] text-[#E8E3D8]/50 space-y-1.5" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00FF88]" />
                  <span>Sri Lanka Central Bank Approved &amp; 256-bit Encrypted Checkout</span>
                </div>
                <div>30-day effortless returns on all unworn Ceylon artifacts</div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer siteName={defaultSiteSettings.site_name} />
    </div>
  );
}
