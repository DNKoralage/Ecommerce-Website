'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  CreditCard,
  ArrowRight,
  ChevronRight,
  Gem,
  Truck,
  Sparkles,
} from 'lucide-react';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import { useCart } from '@/context/CartContext';
import { api } from '@/lib/store';
import { formatPrice } from '@/lib/utils';
import { defaultSiteSettings } from '@/lib/seed-data';
import { useToast } from '@/context/ToastContext';

export default function CheckoutPage() {
  const { items, subtotal, discountAmount, total, clearCart } = useCart();
  const { success, error: toastError } = useToast();

  const [step, setStep] = useState<'shipping' | 'payment' | 'confirmed'>('shipping');
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);

  // Form states - Authentic Sri Lankan identity
  const [formData, setFormData] = useState({
    name: 'Anushka Bandara',
    email: 'patron@ceylontimes.lk',
    phone: '+94 77 123 4567',
    address1: '42 Galle Face Court, Colombo 03',
    address2: 'Apartment 7B',
    city: 'Colombo',
    state: 'Western Province',
    zip: '00300',
    country: 'Sri Lanka',
  });

  const freeThreshold = 7500;
  const shippingCost = shippingMethod === 'express' ? 750 : subtotal >= freeThreshold ? 0 : 350;
  const grandTotal = total + shippingCost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toastError('Your archival bag is currently empty');
      return;
    }

    setIsProcessing(true);
    try {
      // Simulate quick secure gateway handoff
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const order = await api.createOrder({
        user_id: `usr_${Date.now()}`,
        email: formData.email,
        shipping_address: {
          id: `addr_${Date.now()}`,
          user_id: 'guest',
          full_name: formData.name,
          phone: formData.phone,
          address_line1: formData.address1,
          address_line2: formData.address2,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: formData.country,
          is_default: true,
          created_at: new Date().toISOString(),
        },
        billing_address: {
          id: `addr_b_${Date.now()}`,
          user_id: 'guest',
          full_name: formData.name,
          phone: formData.phone,
          address_line1: formData.address1,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          country: formData.country,
          is_default: false,
          created_at: new Date().toISOString(),
        },
        shipping_method: shippingMethod === 'express' ? 'Island Express Courier' : 'Island Standard Registered Post',
        shipping_cost: shippingCost,
        subtotal,
        discount_amount: discountAmount,
        tax_amount: Math.round(subtotal * 0.12),
        total: grandTotal,
        coupon_code: null,
        payment_status: 'paid',
        fulfillment_status: 'processing',
        tracking_number: `LK-${Math.floor(100000 + Math.random() * 900000)}`,
        tracking_carrier: 'Ceylon Times Priority Courier',
        notes: 'Handle with extreme care. Hand-sealed Sri Lankan heirloom packaging.',
      });

      setConfirmedOrderId(order.order_number);
      setStep('confirmed');
      clearCart();
      success('Order confirmed. Your Ceylon archival edition is being prepared.');
    } catch (_err) {
      toastError('Failed to process payment. Please verify transaction details.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#02030A] text-[#E8E3D8] selection:bg-[#FFD700]/30 selection:text-[#FFD700]">
      <Header
        siteName={defaultSiteSettings.site_name}
        announcementText={defaultSiteSettings.announcement_bar_text}
      />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 lg:px-16 py-12 relative">
        {/* Subtle ambient neon glow */}
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[radial-gradient(circle,rgba(0,255,255,0.04)_0%,transparent_70%)] pointer-events-none -z-10" />

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#E8E3D8]/60 uppercase tracking-[0.18em] mb-8" style={{ fontFamily: 'var(--font-rajdhani)' }}>
          <Link href="/" className="hover:text-[#FFD700] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 opacity-40 text-[#FFD700]" />
          <Link href="/cart" className="hover:text-[#FFD700] transition-colors">
            Bag
          </Link>
          <ChevronRight className="w-3.5 h-3.5 opacity-40 text-[#FFD700]" />
          <span className="text-[#FFD700] font-bold">Checkout Ledger</span>
        </nav>

        {step === 'confirmed' ? (
          /* Confirmation Screen */
          <div
            className="p-12 lg:p-16 max-w-2xl mx-auto text-center my-8"
            style={{
              background: 'rgba(8, 12, 28, 0.9)',
              border: '1px solid rgba(255, 215, 0, 0.35)',
              boxShadow: '0 0 50px rgba(0, 0, 0, 0.9), 0 0 30px rgba(255, 215, 0, 0.15)',
              backdropFilter: 'blur(20px)',
              clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))',
            }}
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{
                background: 'rgba(0, 255, 136, 0.12)',
                border: '1px solid rgba(0, 255, 136, 0.4)',
                boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)',
              }}
            >
              <CheckCircle2 className="w-8 h-8 text-[#00FF88]" />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#FFD700] block mb-2" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              Ceylon Acquisition Secured
            </span>
            <h1 className="font-serif text-3xl text-white font-normal mb-3">
              Order {confirmedOrderId}
            </h1>
            <p className="text-xs text-[#E8E3D8]/70 leading-relaxed font-sans max-w-md mx-auto mb-6">
              Your Sri Lankan handcrafted archival pieces have been reserved. A confirmation receipt and courier manifest tracking notice have been dispatched to <span className="font-bold text-[#FFD700]">{formData.email}</span>.
            </p>

            <div
              className="p-5 text-xs text-left max-w-sm mx-auto mb-8 space-y-2 font-sans"
              style={{
                background: 'rgba(4, 6, 16, 0.8)',
                border: '1px solid rgba(255, 215, 0, 0.2)',
              }}
            >
              <div className="flex justify-between">
                <span className="text-[#E8E3D8]/50">Destination:</span>
                <span className="text-white font-bold">{formData.city}, {formData.state}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#E8E3D8]/50">Courier:</span>
                <span className="text-[#00FFFF] font-bold">{shippingMethod === 'express' ? 'Island Express (24-48h)' : 'Island Standard'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#E8E3D8]/50">Total Settled:</span>
                <span className="text-[#FFD700] font-bold">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <Link href="/products" className="btn-neon-gold text-xs inline-flex">
              <span>Continue Exploring Ceylon Treasury</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        ) : (
          /* Two Column Checkout Form */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Form Details (7 Cols) */}
            <div className="lg:col-span-7 space-y-8">
              {/* Stepper Header */}
              <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-[0.2em] border-b border-yellow-500/15 pb-4" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                <button
                  type="button"
                  onClick={() => setStep('shipping')}
                  className={`flex items-center gap-2 cursor-pointer ${
                    step === 'shipping' ? 'text-[#FFD700]' : 'text-[#E8E3D8]/50'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                    style={{
                      background: step === 'shipping' ? '#FFD700' : 'rgba(255,215,0,0.1)',
                      color: step === 'shipping' ? '#02030A' : '#E8E3D8',
                    }}
                  >
                    1
                  </span>
                  <span>Consignee &amp; Island Address</span>
                </button>
                <ChevronRight className="w-3.5 h-3.5 opacity-30 text-[#FFD700]" />
                <button
                  type="button"
                  onClick={() => setStep('payment')}
                  className={`flex items-center gap-2 cursor-pointer ${
                    step === 'payment' ? 'text-[#00FFFF]' : 'text-[#E8E3D8]/50'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                    style={{
                      background: step === 'payment' ? '#00FFFF' : 'rgba(0,255,255,0.1)',
                      color: step === 'payment' ? '#02030A' : '#E8E3D8',
                    }}
                  >
                    2
                  </span>
                  <span>Secure Settlement</span>
                </button>
              </div>

              {step === 'shipping' ? (
                <div
                  className="p-8 space-y-6"
                  style={{
                    background: 'rgba(8, 12, 28, 0.85)',
                    border: '1px solid rgba(255, 215, 0, 0.25)',
                    boxShadow: '0 0 30px rgba(0, 0, 0, 0.7)',
                  }}
                >
                  <h2 className="font-serif text-2xl text-white font-medium">
                    Consignee Coordinates
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[#FFD700] mb-1.5" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                        Full Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full p-3 text-[#E8E3D8] focus:outline-none"
                        style={{
                          background: 'rgba(4, 6, 16, 0.8)',
                          border: '1px solid rgba(255, 215, 0, 0.25)',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[#00FFFF] mb-1.5" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                        Email Address
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full p-3 text-[#E8E3D8] focus:outline-none"
                        style={{
                          background: 'rgba(4, 6, 16, 0.8)',
                          border: '1px solid rgba(255, 215, 0, 0.25)',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[#00FFFF] mb-1.5" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                        Contact Phone (Sri Lanka)
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full p-3 text-[#E8E3D8] focus:outline-none"
                        style={{
                          background: 'rgba(4, 6, 16, 0.8)',
                          border: '1px solid rgba(255, 215, 0, 0.25)',
                        }}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[#FFD700] mb-1.5" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                        Street Address
                      </label>
                      <input
                        type="text"
                        name="address1"
                        required
                        value={formData.address1}
                        onChange={handleInputChange}
                        className="w-full p-3 text-[#E8E3D8] focus:outline-none"
                        style={{
                          background: 'rgba(4, 6, 16, 0.8)',
                          border: '1px solid rgba(255, 215, 0, 0.25)',
                        }}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[#E8E3D8]/60 mb-1.5" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                        Apartment / Suite / Landmark (Optional)
                      </label>
                      <input
                        type="text"
                        name="address2"
                        value={formData.address2}
                        onChange={handleInputChange}
                        className="w-full p-3 text-[#E8E3D8] focus:outline-none"
                        style={{
                          background: 'rgba(4, 6, 16, 0.8)',
                          border: '1px solid rgba(255, 215, 0, 0.25)',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[#00FFFF] mb-1.5" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                        City
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full p-3 text-[#E8E3D8] focus:outline-none"
                        style={{
                          background: 'rgba(4, 6, 16, 0.8)',
                          border: '1px solid rgba(255, 215, 0, 0.25)',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[#00FFFF] mb-1.5" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                        Province
                      </label>
                      <input
                        type="text"
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full p-3 text-[#E8E3D8] focus:outline-none"
                        style={{
                          background: 'rgba(4, 6, 16, 0.8)',
                          border: '1px solid rgba(255, 215, 0, 0.25)',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[#FFD700] mb-1.5" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="zip"
                        required
                        value={formData.zip}
                        onChange={handleInputChange}
                        className="w-full p-3 text-[#E8E3D8] focus:outline-none"
                        style={{
                          background: 'rgba(4, 6, 16, 0.8)',
                          border: '1px solid rgba(255, 215, 0, 0.25)',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[#FFD700] mb-1.5" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        disabled
                        value="Sri Lanka"
                        className="w-full p-3 text-[#FFD700] font-bold"
                        style={{
                          background: 'rgba(255, 215, 0, 0.05)',
                          border: '1px solid rgba(255, 215, 0, 0.3)',
                          fontFamily: 'var(--font-rajdhani)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Delivery Options */}
                  <div className="pt-6 border-t border-yellow-500/15 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#00FFFF]" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                      Ceylon Delivery Method
                    </h3>
                    <div className="space-y-2 text-xs font-sans">
                      <label
                        className={`flex items-center justify-between p-4 cursor-pointer transition-all ${
                          shippingMethod === 'standard'
                            ? 'border border-[#FFD700] bg-yellow-500/10'
                            : 'border border-yellow-500/20 bg-black/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            checked={shippingMethod === 'standard'}
                            onChange={() => setShippingMethod('standard')}
                            className="text-[#FFD700] accent-[#FFD700]"
                          />
                          <div>
                            <span className="font-bold text-white block">
                              Island Standard Registered Courier
                            </span>
                            <span className="text-[#E8E3D8]/60 text-[11px]">
                              3–5 Business Days island-wide via Kapruka / Registered Post
                            </span>
                          </div>
                        </div>
                        <span className="font-bold text-[#FFD700]" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                          {subtotal >= freeThreshold ? 'Complimentary' : formatPrice(350)}
                        </span>
                      </label>

                      <label
                        className={`flex items-center justify-between p-4 cursor-pointer transition-all ${
                          shippingMethod === 'express'
                            ? 'border border-[#00FFFF] bg-cyan-500/10'
                            : 'border border-yellow-500/20 bg-black/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            checked={shippingMethod === 'express'}
                            onChange={() => setShippingMethod('express')}
                            className="text-[#00FFFF] accent-[#00FFFF]"
                          />
                          <div>
                            <span className="font-bold text-white block">
                              Priority Island Courier Express (DHL / Kapruka VIP)
                            </span>
                            <span className="text-[#E8E3D8]/60 text-[11px]">
                              24–48h priority door-to-door transit with verification
                            </span>
                          </div>
                        </div>
                        <span className="font-bold text-[#00FFFF]" style={{ fontFamily: 'var(--font-rajdhani)' }}>{formatPrice(750)}</span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep('payment')}
                    className="w-full btn-neon-gold py-4 text-xs flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Secure Settlement</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Payment Step */
                <div
                  className="p-8 space-y-6"
                  style={{
                    background: 'rgba(8, 12, 28, 0.85)',
                    border: '1px solid rgba(255, 215, 0, 0.25)',
                    boxShadow: '0 0 30px rgba(0, 0, 0, 0.7)',
                  }}
                >
                  <h2 className="font-serif text-2xl text-white font-medium">
                    Sri Lanka Secure Settlement
                  </h2>

                  <div
                    className="p-4 text-xs flex items-center gap-3"
                    style={{
                      background: 'rgba(0, 255, 136, 0.08)',
                      border: '1px solid rgba(0, 255, 136, 0.3)',
                      color: '#00FF88',
                    }}
                  >
                    <ShieldCheck className="w-5 h-5 shrink-0" />
                    <span>
                      256-bit encrypted test transaction via Sri Lanka Central Bank approved gateway (PayHere / Card).
                    </span>
                  </div>

                  <div className="space-y-4 text-xs font-sans">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[#FFD700] mb-1.5" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                        Card Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          defaultValue="•••• •••• •••• 4242"
                          className="w-full p-3 text-white pr-10 focus:outline-none font-mono"
                          style={{
                            background: 'rgba(4, 6, 16, 0.8)',
                            border: '1px solid rgba(255, 215, 0, 0.25)',
                          }}
                        />
                        <CreditCard className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#FFD700]" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[#00FFFF] mb-1.5" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                          Expiration Date
                        </label>
                        <input
                          type="text"
                          defaultValue="12 / 28"
                          className="w-full p-3 text-white focus:outline-none font-mono"
                          style={{
                            background: 'rgba(4, 6, 16, 0.8)',
                            border: '1px solid rgba(0, 255, 255, 0.25)',
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[#00FFFF] mb-1.5" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                          Security CVV
                        </label>
                        <input
                          type="password"
                          defaultValue="•••"
                          className="w-full p-3 text-white focus:outline-none font-mono"
                          style={{
                            background: 'rgba(4, 6, 16, 0.8)',
                            border: '1px solid rgba(0, 255, 255, 0.25)',
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-yellow-500/15">
                    <button
                      type="button"
                      onClick={() => setStep('shipping')}
                      className="btn-neon-outline text-xs px-6 py-4"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                      className="flex-1 btn-neon-gold py-4 text-xs flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{isProcessing ? 'Securing Transaction...' : `Finalize Order — ${formatPrice(grandTotal)}`}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Order Ledger Breakdown (5 Cols) */}
            <div
              className="lg:col-span-5 p-8 space-y-6"
              style={{
                background: 'rgba(8, 12, 28, 0.85)',
                border: '1px solid rgba(255, 215, 0, 0.25)',
                boxShadow: '0 0 35px rgba(0, 0, 0, 0.8)',
              }}
            >
              <div className="flex items-center justify-between pb-4 border-b border-yellow-500/15">
                <h3 className="font-serif text-xl text-white font-medium">
                  Reserved Artifacts
                </h3>
                <span className="text-xs text-[#E8E3D8]/50" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                  {items.length} {items.length === 1 ? 'Creation' : 'Creations'}
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-yellow-500/10 max-h-72 overflow-y-auto no-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center gap-4 text-xs font-sans">
                    <div
                      className="w-12 h-14 overflow-hidden shrink-0"
                      style={{
                        background: '#04060E',
                        border: '1px solid rgba(255, 215, 0, 0.2)',
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate">{item.title}</p>
                      <p className="text-[11px] text-[#00FFFF]/70" style={{ fontFamily: 'var(--font-rajdhani)' }}>Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right font-bold text-[#FFD700]" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals in LKR */}
              <div className="space-y-2.5 text-xs text-[#E8E3D8]/70 pt-4 border-t border-yellow-500/15" style={{ fontFamily: 'var(--font-rajdhani)' }}>
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
                  <span>Island Courier &amp; Transit Insurance</span>
                  <span className="text-white">
                    {shippingCost === 0 ? (
                      <span className="text-[#00FF88] font-bold">Complimentary</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-white pt-3 border-t border-yellow-500/15">
                  <span className="text-[#FFD700]">Settlement Due (LKR)</span>
                  <span
                    className="font-serif text-2xl text-[#FFD700]"
                    style={{ textShadow: '0 0 10px rgba(255,215,0,0.5)' }}
                  >
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>

              <div
                className="p-3.5 text-[11px] text-[#E8E3D8]/60 space-y-1 font-sans"
                style={{
                  background: 'rgba(4, 6, 16, 0.7)',
                  border: '1px solid rgba(255, 215, 0, 0.15)',
                }}
              >
                <div className="font-bold text-[#FFD700] flex items-center gap-1.5" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00FF88]" />
                  Ceylon Times Provenance Seal
                </div>
                <div>All pieces are dispatched with tracking numbers and tamper-evident archival wax stamps from Colombo 03.</div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer siteName={defaultSiteSettings.site_name} />
    </div>
  );
}
