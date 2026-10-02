'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Tag, ShieldCheck, Gem } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

export default function CartDrawer() {
  const { theme } = useTheme();
  const { language, t } = useLanguage();
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

  const freeThreshold = 7500;
  const estimatedShipping = subtotal >= freeThreshold || subtotal === 0 ? 0 : 350;
  const grandTotal = total + estimatedShipping;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className={`fixed inset-y-0 right-0 max-w-full w-full sm:max-w-md shadow-2xl flex flex-col z-10 ${isLight ? 'text-slate-900' : 'text-[#E8E3D8]'}`}
            style={{
              background: isLight ? 'rgba(255, 255, 255, 0.98)' : 'rgba(5, 7, 18, 0.98)',
              borderLeft: isLight ? '1px solid rgba(184, 134, 11, 0.3)' : '1px solid rgba(255, 215, 0, 0.3)',
              boxShadow: isLight
                ? '-10px 0 40px rgba(0, 0, 0, 0.1), 0 0 20px rgba(184, 134, 11, 0.08)'
                : '-10px 0 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(255, 215, 0, 0.1)',
              backdropFilter: 'blur(25px)',
            }}
          >
            {/* Drawer Header */}
            <div className={`px-6 py-5 border-b ${isLight ? 'border-amber-900/10' : 'border-yellow-500/15'} flex items-center justify-between`}>
              <div className="flex items-center gap-2.5">
                <div
                  style={{
                    background: isLight ? 'rgba(184, 134, 11, 0.1)' : 'rgba(255,215,0,0.12)',
                    border: isLight ? '1px solid rgba(184, 134, 11, 0.3)' : '1px solid rgba(255,215,0,0.3)',
                    padding: '6px',
                  }}
                >
                  <ShoppingBag className={`w-4 h-4 ${isLight ? 'text-amber-800' : 'text-[#FFD700]'}`} />
                </div>
                <div>
                  <h2 className={`font-serif text-lg tracking-wide ${isLight ? 'text-slate-900 font-bold' : 'text-white'}`}>
                    {language === 'si' ? 'මිලදී ගැනුම් බෑගය' : 'Archival Bag'} ({items.reduce((acc, i) => acc + i.quantity, 0)})
                  </h2>
                  <span className={`text-[9px] uppercase tracking-[0.2em] ${isLight ? 'text-amber-800' : 'text-[#FFD700]/60'} block`} style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    Ceylon Times Concierge
                  </span>
                </div>
              </div>
              <button
                onClick={closeCart}
                className={`p-2 ${isLight ? 'text-slate-500 hover:text-slate-900' : 'text-[#E8E3D8]/60 hover:text-[#FFD700]'} transition-colors cursor-pointer`}
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Bar */}
            <div
              className={`px-6 py-2.5 text-xs border-b ${isLight ? 'border-amber-900/10' : 'border-yellow-500/15'}`}
              style={{
                background: subtotal >= freeThreshold
                  ? (isLight ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0, 255, 136, 0.08)')
                  : (isLight ? 'rgba(184, 134, 11, 0.06)' : 'rgba(255, 215, 0, 0.05)'),
              }}
            >
              {subtotal >= freeThreshold ? (
                <span className={`${isLight ? 'text-emerald-700' : 'text-[#00FF88]'} font-bold flex items-center gap-1.5`} style={{ fontFamily: 'var(--font-rajdhani)' }}>
                  <ShieldCheck className="w-4 h-4" /> {language === 'si' ? 'නොමිලේ දිවයින පුරා බෙදාහැරීම සක්‍රීයයි' : 'COMPLIMENTARY ISLAND-WIDE COURIER UNLOCKED'}
                </span>
              ) : (
                <span className={`${isLight ? 'text-slate-600' : 'text-[#E8E3D8]/70'} text-[11px]`} style={{ fontFamily: 'var(--font-rajdhani)' }}>
                  {language === 'si' ? (
                    <>නොමිලේ බෙදාහැරීම සඳහා තවත් <strong className={isLight ? 'text-amber-800 font-bold' : 'text-[#FFD700]'}>{formatPrice(freeThreshold - subtotal)}</strong> ක නිර්මාණ එක්කරන්න.</>
                  ) : (
                    <>Acquire <strong className={isLight ? 'text-amber-800 font-bold' : 'text-[#FFD700]'}>{formatPrice(freeThreshold - subtotal)}</strong> more for complimentary delivery.</>
                  )}
                </span>
              )}
            </div>

            {/* Cart Items List */}
            <div className={`flex-1 overflow-y-auto px-6 py-4 divide-y ${isLight ? 'divide-amber-900/10' : 'divide-yellow-500/10'}`}>
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                    style={{
                      background: isLight ? 'rgba(184, 134, 11, 0.08)' : 'rgba(255, 215, 0, 0.06)',
                      border: isLight ? '1px solid rgba(184, 134, 11, 0.25)' : '1px solid rgba(255, 215, 0, 0.2)',
                    }}
                  >
                    <ShoppingBag className={`w-8 h-8 ${isLight ? 'text-amber-800' : 'text-[#FFD700]/50'}`} />
                  </div>
                  <h3 className={`font-serif text-lg ${isLight ? 'text-slate-900 font-bold' : 'text-white'} mb-2`}>
                    {language === 'si' ? 'ඔබගේ බෑගය හිස්ය' : 'Your Bag is Empty'}
                  </h3>
                  <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-[#E8E3D8]/60'} max-w-xs mb-6 leading-relaxed`}>
                    {language === 'si'
                      ? 'අපගේ සිලෝන් නිල් මැණික්, අත්යන්ත්‍ර සේද, සහ සාම්ප්‍රදායික කලා නිර්මාණ එකතුව ගවේෂණය කරන්න.'
                      : 'Explore our curated collection of Ceylon sapphires, handloom silks, and sacred living artifacts.'}
                  </p>
                  <button
                    onClick={closeCart}
                    className="btn-neon-gold text-xs"
                  >
                    {language === 'si' ? 'නිර්මාණ ගවේෂණය කරන්න' : 'Explore Treasury'}
                  </button>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, height: 0, x: 20 }}
                      animate={{ opacity: 1, height: 'auto', x: 0 }}
                      exit={{ opacity: 0, height: 0, x: 50 }}
                      transition={{ duration: 0.25 }}
                      className="py-4 flex gap-4 overflow-hidden"
                    >
                      {/* Product Thumbnail */}
                      <div
                        className="w-20 h-24 relative overflow-hidden flex-shrink-0"
                        style={{
                          background: isLight ? '#F1F5F9' : '#04060E',
                          border: isLight ? '1px solid rgba(184, 134, 11, 0.25)' : '1px solid rgba(255, 215, 0, 0.2)',
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className={`font-serif text-sm ${isLight ? 'text-slate-900 font-bold' : 'text-white'} line-clamp-1`}>
                              {t(item.title)}
                            </h4>
                            <button
                              onClick={() => removeItem(item.id)}
                              className={`${isLight ? 'text-slate-400 hover:text-red-600' : 'text-[#E8E3D8]/40 hover:text-[#FF2D55]'} transition-colors p-1`}
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Variant Options */}
                          {item.variant_info && Object.keys(item.variant_info).length > 0 && (
                            <p className={`text-[11px] ${isLight ? 'text-amber-800' : 'text-[#00FFFF]/70'} mt-0.5 tracking-wide`} style={{ fontFamily: 'var(--font-rajdhani)' }}>
                              {Object.entries(item.variant_info)
                                .map(([key, val]) => `${key}: ${val}`)
                                .join(' / ')}
                            </p>
                          )}

                          <p className={`text-xs font-bold ${isLight ? 'text-amber-800' : 'text-[#FFD700]'} mt-1`} style={{ fontFamily: 'var(--font-rajdhani)' }}>
                            {formatPrice(item.price)}
                          </p>
                        </div>

                        {/* Quantity Adjuster */}
                        <div className={`flex items-center justify-between mt-2 pt-2 border-t ${isLight ? 'border-amber-900/10' : 'border-yellow-500/10'}`}>
                          <div
                            className="flex items-center"
                            style={{
                              background: isLight ? '#F8FAFC' : 'rgba(8, 12, 28, 0.8)',
                              border: isLight ? '1px solid rgba(184, 134, 11, 0.3)' : '1px solid rgba(255, 215, 0, 0.2)',
                            }}
                          >
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className={`p-1.5 ${isLight ? 'hover:bg-amber-100 text-slate-800' : 'hover:bg-[#FFD700]/20 text-[#E8E3D8]'} transition-colors`}
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className={`w-8 text-center text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`} style={{ fontFamily: 'var(--font-rajdhani)' }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className={`p-1.5 ${isLight ? 'hover:bg-amber-100 text-slate-800' : 'hover:bg-[#FFD700]/20 text-[#E8E3D8]'} transition-colors`}
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <span className={`text-xs font-bold ${isLight ? 'text-amber-800' : 'text-[#FFD700]'}`} style={{ fontFamily: 'var(--font-rajdhani)' }}>
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Drawer Footer / Summary */}
            {items.length > 0 && (
              <div
                className={`p-6 border-t ${isLight ? 'border-amber-900/15' : 'border-yellow-500/15'} space-y-4`}
                style={{ background: isLight ? '#FAF8F5' : 'rgba(4, 6, 16, 0.95)' }}
              >
                {/* Coupon Code Input */}
                {appliedCoupon ? (
                  <div
                    className="flex items-center justify-between p-2.5 text-xs font-bold"
                    style={{
                      background: isLight ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0, 255, 136, 0.08)',
                      border: isLight ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(0, 255, 136, 0.3)',
                      fontFamily: 'var(--font-rajdhani)',
                    }}
                  >
                    <div className={`flex items-center gap-2 ${isLight ? 'text-emerald-700' : 'text-[#00FF88]'}`}>
                      <Tag className="w-3.5 h-3.5" />
                      <span>
                        {appliedCoupon.code} {language === 'si' ? 'වට්ටම' : 'privilege'} (-{formatPrice(discountAmount)})
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-[#FF2D55] text-[11px] underline cursor-pointer"
                    >
                      {language === 'si' ? 'ඉවත් කරන්න' : 'Remove'}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={language === 'si' ? 'ප්‍රවර්ධන කේතය (උදා. CEYLON22)' : 'PROMO CODE (e.g. CEYLON22)'}
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      className={`flex-1 px-3 py-2 text-xs uppercase tracking-wider ${isLight ? 'text-slate-900 placeholder:text-slate-400 bg-white' : 'text-[#E8E3D8] placeholder:text-[#E8E3D8]/30 bg-[rgba(8,12,28,0.9)]'} focus:outline-none`}
                      style={{
                        border: isLight ? '1px solid rgba(184, 134, 11, 0.3)' : '1px solid rgba(255, 215, 0, 0.25)',
                      }}
                    />
                    <button
                      type="submit"
                      disabled={isApplying || !couponInput.trim()}
                      className="btn-neon-outline text-[11px] px-4 py-2 disabled:opacity-50"
                    >
                      {isApplying ? '...' : language === 'si' ? 'යොදන්න' : 'Apply'}
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="text-[11px] text-[#FF2D55] tracking-wide">{couponError}</p>
                )}

                {/* Totals Breakdown */}
                <div className={`space-y-1.5 text-xs ${isLight ? 'text-slate-600' : 'text-[#E8E3D8]/70'} pt-2`} style={{ fontFamily: 'var(--font-rajdhani)' }}>
                  <div className="flex justify-between">
                    <span>{language === 'si' ? 'උප එකතුව' : 'Subtotal'}</span>
                    <span className={`${isLight ? 'text-slate-900 font-bold' : 'text-white font-bold'}`}>{formatPrice(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className={`flex justify-between ${isLight ? 'text-emerald-700 font-bold' : 'text-[#00FF88]'}`}>
                      <span>{language === 'si' ? 'විශේෂ වට්ටම' : 'Privilege Discount'}</span>
                      <span>-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>{language === 'si' ? 'දිවයින පුරා බෙදාහැරීම' : 'Island Courier Delivery'}</span>
                    <span>
                      {estimatedShipping === 0 ? (
                        <span className={`${isLight ? 'text-emerald-700 font-bold' : 'text-[#00FF88] font-bold'}`}>
                          {language === 'si' ? 'නොමිලේ' : 'Complimentary'}
                        </span>
                      ) : (
                        formatPrice(estimatedShipping)
                      )}
                    </span>
                  </div>
                  <div className={`flex justify-between text-base font-bold ${isLight ? 'text-slate-900 border-amber-900/15' : 'text-white border-yellow-500/15'} pt-2 border-t`}>
                    <span className={isLight ? 'text-amber-900 font-bold' : 'text-[#FFD700]'}>{language === 'si' ? 'මුළු එකතුව (LKR)' : 'Total (LKR)'}</span>
                    <span
                      className={isLight ? 'text-amber-900 font-bold' : 'text-[#FFD700]'}
                      style={{ textShadow: isLight ? 'none' : '0 0 10px rgba(255,215,0,0.5)' }}
                    >
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link href="/checkout" onClick={closeCart} className="block w-full">
                  <button className="w-full btn-neon-gold py-3.5 text-xs flex items-center justify-center gap-2">
                    <Gem className="w-4 h-4" />
                    <span>{language === 'si' ? 'සුරක්ෂිතව ඇණවුම් කරන්න' : 'Proceed to Secure Checkout'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>

                <p className={`text-[10px] text-center ${isLight ? 'text-slate-500' : 'text-[#E8E3D8]/40'} tracking-wider uppercase`} style={{ fontFamily: 'var(--font-rajdhani)' }}>
                  {language === 'si'
                    ? 'දිවයින පුරා ලුහුබැඳිය හැකි බෙදාහැරීම · ගාලු කොටුව සහ කොළඹ සත්‍යතා සහතිකය'
                    : 'Island-wide tracked transit · Galle Fort & Colombo provenance guarantee'}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
