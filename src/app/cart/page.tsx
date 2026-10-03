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
  Truck,
  CheckCircle2,
} from 'lucide-react';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { defaultSiteSettings } from '@/lib/seed-data';
import { sound } from '@/lib/sound';

export default function CartPage() {
  const { formatPrice } = useCurrency();
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
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const estimatedShipping = subtotal >= freeShippingThreshold || subtotal === 0 ? 0 : 350;
  const grandTotal = total + estimatedShipping;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      <Header
        siteName={defaultSiteSettings.site_name}
        announcementText={defaultSiteSettings.announcement_bar_text}
      />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-6 font-medium">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          <span className="text-gray-900 dark:text-white font-semibold">Shopping Cart</span>
        </nav>

        {/* Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-800 gap-4 mb-8">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Shopping Cart
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {items.length === 0
                ? 'Your cart is currently empty'
                : `You have ${items.length} unique item${items.length > 1 ? 's' : ''} in your cart`}
            </p>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="text-xs text-red-500 hover:text-red-700 transition-colors flex items-center gap-1.5 cursor-pointer font-semibold self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Empty Cart</span>
            </button>
          )}
        </div>

        {items.length === 0 ? (
          /* Empty Bag State */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-12 text-center max-w-md mx-auto my-12 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm"
          >
            <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center mx-auto mb-5 text-blue-600 dark:text-blue-400">
              <ShoppingBag className="w-9 h-9" />
            </div>
            <h2 className="font-heading text-xl font-bold text-gray-900 dark:text-white mb-2">Your Cart is Empty</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">
              Looks like you haven&apos;t added anything to your cart yet. Explore our latest arrivals and top deals!
            </p>
            <Link href="/products" className="btn-primary">
              <span>Start Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          /* Cart Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Items Column (8 Cols) */}
            <div className="lg:col-span-8 space-y-4">
              {/* Free shipping bar */}
              <div className="p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="flex items-center justify-between text-xs font-medium mb-2">
                  <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold">
                    <Truck className="w-4 h-4" />
                    {subtotal >= freeShippingThreshold ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">You qualify for FREE island delivery!</span>
                    ) : (
                      <span>Add {formatPrice(freeShippingThreshold - subtotal)} more for FREE delivery</span>
                    )}
                  </span>
                  <span className="text-gray-500 font-semibold">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Items List */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
                {items.map((item) => (
                  <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image || '/placeholder.png'}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.slug}`}
                        className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 transition-colors line-clamp-1 text-base"
                      >
                        {item.title}
                      </Link>
                      {item.variant_info && Object.keys(item.variant_info).length > 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {Object.entries(item.variant_info)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(' • ')}
                        </p>
                      )}
                      <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-1">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800">
                        <button
                          type="button"
                          onClick={() => { sound.playClick(); updateQuantity(item.id, -1); }}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-gray-900 dark:text-white">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => { sound.playClick(); updateQuantity(item.id, 1); }}
                          disabled={item.quantity >= item.max_stock}
                          className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-blue-600 disabled:opacity-30 transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Line Total & Remove */}
                      <div className="text-right min-w-[80px]">
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                        <button
                          type="button"
                          onClick={() => { sound.playClick(); removeItem(item.id); }}
                          className="text-xs text-red-500 hover:text-red-700 mt-1 inline-flex items-center gap-1 font-medium transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary (4 Cols) */}
            <div className="lg:col-span-4 p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
              <h2 className="font-heading text-lg font-bold text-gray-900 dark:text-white pb-3 border-b border-gray-100 dark:border-gray-800">
                Order Summary
              </h2>

              {/* Promo Code Input */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5" />
                      <span>{appliedCoupon.code}</span>
                      <span>(-{formatPrice(discountAmount)})</span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-red-500 hover:text-red-700 text-[11px] underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApply} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 input-field text-xs py-2 uppercase"
                    />
                    <button
                      type="submit"
                      disabled={isApplying || !couponCode.trim()}
                      className="btn-outline text-xs px-4 py-2 disabled:opacity-50"
                    >
                      {isApplying ? '...' : 'Apply'}
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-xs text-red-500 mt-1.5 font-medium">{couponError}</p>
                )}
              </div>

              {/* Totals Breakdown */}
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 pt-2 border-t border-gray-100 dark:border-gray-800">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {estimatedShipping === 0 ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Free</span>
                    ) : (
                      formatPrice(estimatedShipping)
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-base font-bold text-gray-900 dark:text-white pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span>Total</span>
                  <span className="text-2xl text-blue-600 dark:text-blue-400">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link href="/checkout" className="block w-full">
                <button
                  onClick={() => sound.playClick()}
                  className="w-full btn-primary py-3.5 text-sm flex items-center justify-center gap-2 rounded-xl"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>

              {/* Trust Badges */}
              <div className="pt-2 text-xs text-gray-500 dark:text-gray-400 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Cash on Delivery (COD) Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-500 flex-shrink-0" />
                  <span>Fast island-wide delivery within 2-4 days</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span>Hassle-free 7-day returns &amp; exchanges</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer siteName={defaultSiteSettings.site_name} />
    </div>
  );
}
