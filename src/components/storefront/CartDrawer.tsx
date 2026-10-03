'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  ArrowRight,
  Tag,
  ShieldCheck,
  Truck,
  Package,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
import { useCurrency } from '@/context/CurrencyContext';

export default function CartDrawer() {
  const { theme } = useTheme();
  const { language, t } = useLanguage();
  const { formatPrice } = useCurrency();
  const isLight = theme === 'light';

  const {
    isOpen,
    closeCart,
    items,
    removeItem,
    updateQuantity,
    subtotal,
    discountAmount,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    total,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplying(true);
    setCouponError('');
    const res = await applyCoupon(couponInput.trim());
    setIsApplying(false);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setCouponInput('');
    }
  };

  const freeThreshold   = 7500;
  const estimatedShipping = subtotal >= freeThreshold || subtotal === 0 ? 0 : 350;
  const grandTotal      = total + estimatedShipping;
  const freeShipProgress = Math.min((subtotal / freeThreshold) * 100, 100);
  const totalQty = items.reduce((acc, i) => acc + i.quantity, 0);

  /* colour tokens */
  const bg      = isLight ? '#FFFFFF' : '#1E293B';
  const bgMuted = isLight ? '#F8FAFC' : '#0F172A';
  const border  = isLight ? '#E2E8F0' : 'rgba(51,65,85,0.7)';
  const txtMain = isLight ? '#0F172A' : '#F1F5F9';
  const txtMute = isLight ? '#64748B' : '#94A3B8';

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 w-full sm:max-w-md shadow-2xl flex flex-col z-10"
            style={{
              background: bg,
              borderLeft: `1px solid ${border}`,
              color: txtMain,
            }}
          >
            {/* ── Header ── */}
            <div
              className="px-5 py-4 flex items-center justify-between border-b"
              style={{ borderColor: border }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(37,99,235,0.1)' }}
                >
                  <ShoppingCart className="w-4.5 h-4.5" style={{ color: '#2563EB' }} />
                </div>
                <div>
                  <h2 className="text-base font-bold" style={{ color: txtMain, fontFamily: 'var(--font-outfit)' }}>
                    Your Cart
                  </h2>
                  <span className="text-xs" style={{ color: txtMute }}>
                    {totalQty} {totalQty === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>
              <button
                onClick={closeCart}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{ background: bgMuted, color: txtMute, border: `1px solid ${border}` }}
                aria-label="Close cart"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ── Free Shipping Progress ── */}
            <div
              className="px-5 py-3 border-b"
              style={{ background: isLight ? '#EFF6FF' : 'rgba(37,99,235,0.06)', borderColor: border }}
            >
              {subtotal >= freeThreshold ? (
                <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: '#059669' }}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  🎉 You've unlocked free delivery!
                </div>
              ) : (
                <div>
                  <div className="flex justify-between text-xs mb-1.5" style={{ color: txtMute }}>
                    <span className="flex items-center gap-1">
                      <Truck className="w-3 h-3" />
                      Add {formatPrice(freeThreshold - subtotal)} for free delivery
                    </span>
                    <span style={{ color: '#2563EB', fontWeight: 600 }}>{Math.round(freeShipProgress)}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: border }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #2563EB, #60A5FA)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${freeShipProgress}%` }}
                      transition={{ duration: 0.5 }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ── Items ── */}
            <div className="flex-1 overflow-y-auto px-5 py-3">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <div
                    className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-5"
                    style={{ background: isLight ? '#F1F5F9' : 'rgba(30,41,59,0.8)' }}
                  >
                    🛒
                  </div>
                  <h3 className="text-lg font-bold mb-2" style={{ color: txtMain, fontFamily: 'var(--font-outfit)' }}>
                    Your cart is empty
                  </h3>
                  <p className="text-sm mb-6 max-w-xs leading-relaxed" style={{ color: txtMute }}>
                    Browse our collection of curated products from verified vendors.
                  </p>
                  <button
                    onClick={closeCart}
                    className="btn-primary text-sm"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: 10 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden"
                    >
                      <div className="py-4 flex gap-3.5 border-b" style={{ borderColor: border }}>
                        {/* Thumbnail */}
                        <div
                          className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0"
                          style={{ background: bgMuted, border: `1px solid ${border}` }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 flex flex-col justify-between min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-semibold leading-snug line-clamp-2" style={{ color: txtMain }}>
                              {t(item.title)}
                            </h4>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-1 rounded-lg flex-shrink-0 transition-all"
                              style={{ color: '#94A3B8' }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#EF4444'; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#94A3B8'; }}
                              aria-label="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Variant */}
                          {item.variant_info && Object.keys(item.variant_info).length > 0 && (
                            <p className="text-[11px] mt-0.5" style={{ color: txtMute }}>
                              {Object.entries(item.variant_info).map(([k, v]) => `${k}: ${v}`).join(' / ')}
                            </p>
                          )}

                          <div className="flex items-center justify-between mt-2">
                            {/* Qty Controls */}
                            <div
                              className="flex items-center rounded-xl overflow-hidden"
                              style={{ border: `1px solid ${border}`, background: bgMuted }}
                            >
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="w-7 h-7 flex items-center justify-center transition-all hover:bg-blue-50"
                                aria-label="Decrease"
                              >
                                <Minus className="w-3 h-3" style={{ color: txtMute }} />
                              </button>
                              <span className="w-8 text-center text-xs font-bold" style={{ color: txtMain }}>
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="w-7 h-7 flex items-center justify-center transition-all hover:bg-blue-50"
                                aria-label="Increase"
                              >
                                <Plus className="w-3 h-3" style={{ color: '#2563EB' }} />
                              </button>
                            </div>

                            {/* Line total */}
                            <span className="text-sm font-bold" style={{ color: '#2563EB' }}>
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* ── Footer ── */}
            {items.length > 0 && (
              <div
                className="p-5 border-t space-y-4"
                style={{ borderColor: border, background: bgMuted }}
              >
                {/* Coupon */}
                {appliedCoupon ? (
                  <div
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold"
                    style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', color: '#059669' }}
                  >
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      {appliedCoupon.code} (−{formatPrice(discountAmount)})
                    </div>
                    <button onClick={removeCoupon} className="text-xs underline" style={{ color: '#DC2626' }}>
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className="flex-1 input-field text-xs py-2.5 uppercase"
                    />
                    <button
                      type="submit"
                      disabled={isApplying || !couponInput.trim()}
                      className="btn-outline text-xs px-4 py-2.5 disabled:opacity-50"
                    >
                      {isApplying ? '…' : 'Apply'}
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-xs" style={{ color: '#EF4444' }}>{couponError}</p>
                )}

                {/* Totals */}
                <div className="space-y-2 text-sm" style={{ color: txtMute }}>
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span style={{ color: txtMain, fontWeight: 600 }}>{formatPrice(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between" style={{ color: '#059669', fontWeight: 600 }}>
                      <span>Discount</span>
                      <span>−{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span style={{ color: estimatedShipping === 0 ? '#059669' : txtMain, fontWeight: 600 }}>
                      {estimatedShipping === 0 ? 'Free' : formatPrice(estimatedShipping)}
                    </span>
                  </div>
                  <div
                    className="flex justify-between text-base font-bold pt-2.5 border-t"
                    style={{ borderColor: border, color: txtMain }}
                  >
                    <span>Total</span>
                    <span style={{ color: '#2563EB' }}>{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                {/* COD Notice */}
                <div
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                  style={{ background: '#F0FDF4', color: '#059669' }}
                >
                  <Package className="w-3.5 h-3.5 flex-shrink-0" />
                  Cash on Delivery available — pay when you receive your order
                </div>

                {/* Checkout Button */}
                <Link href="/checkout" onClick={closeCart} className="block">
                  <button className="w-full btn-primary py-3.5 text-sm flex items-center justify-center gap-2 rounded-2xl">
                    Proceed to Checkout
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>

                <p className="text-[11px] text-center" style={{ color: txtMute }}>
                  🔒 Secure checkout · Free returns · COD supported
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
