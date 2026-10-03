'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ChevronRight,
  Truck,
  Phone,
  Mail,
  KeyRound,
  MessageCircle,
  AlertCircle,
  FileCheck2,
  Info,
  Calendar,
  Banknote,
  Store,
} from 'lucide-react';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useCurrency } from '@/context/CurrencyContext';
import { api } from '@/lib/store';
import { defaultSiteSettings } from '@/lib/seed-data';
import { useToast } from '@/context/ToastContext';
import { sendOtp, verifyOtp } from '@/lib/otp';
import { getWhatsAppActionUrl, buildWhatsAppMessage } from '@/lib/notifications';
import { sound } from '@/lib/sound';

export default function CheckoutPage() {
  const { items, subtotal, discountAmount, total, clearCart } = useCart();
  const { success, error: toastError } = useToast();
  const { user } = useAuth();
  const { formatPrice } = useCurrency();

  const [step, setStep] = useState<'shipping' | 'review' | 'confirmed'>('shipping');
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [orderMethod] = useState<'cod' | 'booking'>('cod');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);
  const [whatsAppUrl, setWhatsAppUrl] = useState<string | null>(null);

  // Form states — prefilled from authenticated user if available
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'Sri Lanka',
  });

  const [specialNotes, setSpecialNotes] = useState('');

  // OTP Verification States
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');
  const [demoCodeNotice, setDemoCodeNotice] = useState<string | null>(null);
  const [isAccountVerified, setIsAccountVerified] = useState(false);

  // Pre-fill from logged-in user on mount
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.full_name || '',
        email: user.email || '',
        phone: user.phone || '',
      }));
      if (user.is_verified || user.role === 'admin') {
        setIsAccountVerified(true);
      }
    }
  }, [user]);

  // Listen to global user verified event
  useEffect(() => {
    const handleGlobalVerified = () => {
      setIsAccountVerified(true);
    };
    window.addEventListener('ceylon_user_verified', handleGlobalVerified);
    return () => window.removeEventListener('ceylon_user_verified', handleGlobalVerified);
  }, []);

  const freeThreshold = 7500;
  const shippingCost = shippingMethod === 'express' ? 750 : subtotal >= freeThreshold ? 0 : 350;
  const grandTotal = total + (orderMethod === 'booking' ? 0 : shippingCost);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSendOtp = async (channel: 'phone' | 'email') => {
    const target = channel === 'phone' ? formData.phone.trim() : formData.email.trim();
    if (!target) {
      toastError(`Please enter a valid ${channel === 'phone' ? 'phone number' : 'email address'} first.`);
      return;
    }
    setOtpSending(true);
    setOtpMessage('');
    try {
      const res = await sendOtp(target, channel);
      if (res.success) {
        setOtpSent(true);
        setDemoCodeNotice(res.otp);
        success(res.message);
      } else {
        toastError(res.message);
      }
    } catch {
      toastError('Failed to dispatch verification code.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    const target = formData.phone.trim() || formData.email.trim();
    if (!otpCode.trim()) {
      toastError('Please enter the 6-digit OTP code.');
      return;
    }
    setOtpVerifying(true);
    try {
      const res = verifyOtp(target, otpCode.trim());
      if (res.success) {
        setIsAccountVerified(true);
        setOtpMessage('Verification confirmed!');
        success('Contact verified! You can now place your order.');
      } else {
        toastError(res.message);
      }
    } catch {
      toastError('Verification check failed.');
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toastError('Your cart is currently empty.');
      return;
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.address1.trim()) {
      toastError('Please complete your name, contact phone, and delivery address.');
      return;
    }

    if (!isAccountVerified) {
      toastError('Please verify your phone or email with an OTP code before completing checkout.');
      return;
    }

    setIsProcessing(true);
    try {
      const itemsDesc = items.map((i) => `${i.title} (x${i.quantity})`).join(', ');

      // 1. Create order record with 'unpaid' status (Cash on Delivery / Booking)
      const order = await api.createOrder({
        user_id: user?.id || `usr_${Date.now()}`,
        email: formData.email,
        shipping_address: {
          id: `addr_${Date.now()}`,
          user_id: user?.id || 'guest',
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
          user_id: user?.id || 'guest',
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
        shipping_method:
          orderMethod === 'booking'
            ? 'In-Store Pickup Reservation'
            : shippingMethod === 'express'
            ? 'Island Express Courier (24-48h)'
            : 'Island Standard Registered Post (3-5 days)',
        shipping_cost: orderMethod === 'booking' ? 0 : shippingCost,
        subtotal,
        discount_amount: discountAmount,
        tax_amount: Math.round(subtotal * 0.12),
        total: grandTotal,
        coupon_code: null,
        payment_status: 'unpaid', // Cash on Delivery or Booking
        fulfillment_status: 'pending',
        tracking_number: `LK-${Math.floor(100000 + Math.random() * 900000)}`,
        tracking_carrier: 'Island Priority Courier',
        notes: `Order Method: ${orderMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Booking / Reservation'}. Notes: ${specialNotes || 'Standard'}. Items: ${itemsDesc}`,
      });

      // 2. Create the corresponding BookingRequest record
      const booking = await api.createBookingRequest({
        user_id: user?.id || `usr_${Date.now()}`,
        user_name: formData.name,
        user_email: formData.email,
        user_phone: formData.phone,
        service_type: orderMethod === 'cod' ? 'cash_on_delivery' : 'store_booking',
        service_title: `${orderMethod === 'cod' ? 'Cash on Delivery Order' : 'Store Booking Reservation'} (${items.length} items)`,
        preferred_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        preferred_time: 'Standard Delivery Window (09:00 - 18:00)',
        guests_count: 1,
        special_requirements: specialNotes || `Delivery: ${shippingMethod === 'express' ? 'Priority Express' : 'Standard Delivery'}. Items: ${itemsDesc}`,
        order_id: order.id,
        items_summary: itemsDesc,
        total_amount: grandTotal,
      });

      // 3. Build WhatsApp action link for instant direct alert
      const waMsg = buildWhatsAppMessage({
        bookingId: booking.id,
        orderNumber: order.order_number,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        serviceTitle: `${orderMethod === 'cod' ? 'COD Order' : 'Booking Reservation'} (${items.length} items)`,
        totalAmount: grandTotal,
        shippingAddress: `${formData.address1}, ${formData.city}, ${formData.state}`,
        specialRequirements: specialNotes || undefined,
        timestamp: new Date().toISOString(),
      });
      const waUrl = getWhatsAppActionUrl('+94771234567', waMsg);

      setConfirmedOrderId(order.order_number);
      setConfirmedBookingId(booking.id);
      setWhatsAppUrl(waUrl);
      setStep('confirmed');
      clearCart();
      sound.playSuccess();
      // Fire browser push notification
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification('✅ Order Confirmed — Ceylon Times', {
            body: `Order #${order.order_number} placed successfully. We'll contact you shortly for COD delivery.`,
            icon: '/favicon.ico',
          });
        } catch (_e) {}
      }
      success('Order confirmed! We will contact you to arrange your COD delivery.');
    } catch (_err) {
      toastError('Failed to place order. Please check details and try again.');
    } finally {
      setIsProcessing(false);
    }
  };

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
          <Link href="/cart" className="hover:text-blue-600 transition-colors">
            Cart
          </Link>
          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
          <span className="text-gray-900 dark:text-white font-semibold">Checkout</span>
        </nav>

        {step === 'confirmed' ? (
          /* Confirmation Screen */
          <div className="p-8 sm:p-12 max-w-2xl mx-auto text-center my-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-4 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <span className="badge badge-green mb-3">Order Confirmed</span>

            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Thank You For Your Order!
            </h1>
            <p className="text-sm text-blue-600 dark:text-blue-400 font-mono font-semibold mb-3">
              Order #{confirmedOrderId || confirmedBookingId}
            </p>

            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed max-w-md mx-auto mb-6">
              Your order has been recorded successfully. Our customer support will contact you via WhatsApp / phone to verify and prepare your dispatch.
            </p>

            {/* Confirmation Box */}
            <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs text-left max-w-md mx-auto mb-6 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-900 dark:text-white">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Order Information
                </span>
                <span className="text-emerald-600 dark:text-emerald-400">Payment on Delivery</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Method:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {orderMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Booking Reservation'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery To:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{formData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Contact:</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{formData.phone}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-gray-200 dark:border-gray-700 text-sm font-bold text-gray-900 dark:text-white">
                <span>Amount Due:</span>
                <span className="text-blue-600 dark:text-blue-400">{formatPrice(grandTotal)}</span>
              </div>

              {whatsAppUrl && (
                <div className="pt-2">
                  <a
                    href={whatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Track / Message Us on WhatsApp</span>
                  </a>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/products" className="btn-primary w-full sm:w-auto">
                <span>Continue Shopping</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/account" className="btn-outline w-full sm:w-auto">
                <span>View Order Status</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Two Column Checkout Form */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Form Details (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Stepper Header */}
              <div className="flex items-center gap-3 text-xs font-semibold pb-4 border-b border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setStep('shipping')}
                  className={`flex items-center gap-2 ${
                    step === 'shipping' ? 'text-blue-600 font-bold' : 'text-gray-400'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      step === 'shipping'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    1
                  </span>
                  <span>Shipping &amp; Contact</span>
                </button>
                <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-700" />
                <button
                  type="button"
                  onClick={() => {
                    if (formData.name && formData.email && formData.phone && formData.address1) {
                      setStep('review');
                    }
                  }}
                  className={`flex items-center gap-2 ${
                    step === 'review' ? 'text-blue-600 font-bold' : 'text-gray-400'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      step === 'review'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    2
                  </span>
                  <span>Order Method &amp; Verification</span>
                </button>
              </div>

              {step === 'shipping' ? (
                /* Step 1: Shipping & Delivery Information */
                <div className="p-6 sm:p-7 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-5">
                  <div>
                    <h2 className="font-heading text-xl font-bold text-gray-900 dark:text-white">
                      Delivery &amp; Contact Information
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Enter your address and phone number for delivery dispatch.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        placeholder="e.g. John Silva"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="input-field w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        placeholder="e.g. john@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="input-field w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Contact Phone *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        placeholder="e.g. +94 77 123 4567"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="input-field w-full text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="address1"
                        required
                        placeholder="e.g. 42 Main Street, Colombo 03"
                        value={formData.address1}
                        onChange={handleInputChange}
                        className="input-field w-full text-sm"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Apartment, Landmark, etc. (Optional)
                      </label>
                      <input
                        type="text"
                        name="address2"
                        placeholder="e.g. Apartment 4B / Near Galle Face Court"
                        value={formData.address2}
                        onChange={handleInputChange}
                        className="input-field w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        required
                        placeholder="e.g. Colombo / Kandy / Galle"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="input-field w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        State / Province *
                      </label>
                      <input
                        type="text"
                        name="state"
                        required
                        placeholder="e.g. Western Province"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="input-field w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        name="zip"
                        placeholder="e.g. 00300"
                        value={formData.zip}
                        onChange={handleInputChange}
                        className="input-field w-full text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        disabled
                        value="Sri Lanka"
                        className="input-field w-full text-sm bg-gray-100 dark:bg-gray-800 text-gray-500 font-semibold"
                      />
                    </div>
                  </div>

                  {/* Delivery Speed Preference */}
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                    <h3 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
                      Delivery Option
                    </h3>
                    <div className="space-y-2 text-xs">
                      <label
                        className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all border ${
                          shippingMethod === 'standard'
                            ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20'
                            : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            checked={shippingMethod === 'standard'}
                            onChange={() => setShippingMethod('standard')}
                            className="text-blue-600 accent-blue-600"
                          />
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-white block">
                              Standard Courier Delivery
                            </span>
                            <span className="text-gray-500 text-[11px]">
                              3–5 business days island-wide
                            </span>
                          </div>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {subtotal >= freeThreshold ? (
                            <span className="text-emerald-600">Free</span>
                          ) : (
                            formatPrice(350)
                          )}
                        </span>
                      </label>

                      <label
                        className={`flex items-center justify-between p-3.5 rounded-xl cursor-pointer transition-all border ${
                          shippingMethod === 'express'
                            ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20'
                            : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="radio"
                            checked={shippingMethod === 'express'}
                            onChange={() => setShippingMethod('express')}
                            className="text-blue-600 accent-blue-600"
                          />
                          <div>
                            <span className="font-semibold text-gray-900 dark:text-white block">
                              Priority Express Delivery
                            </span>
                            <span className="text-gray-500 text-[11px]">
                              24–48h priority door-to-door delivery
                            </span>
                          </div>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {formatPrice(750)}
                        </span>
                      </label>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || !formData.address1.trim()) {
                        toastError('Please fill in your name, contact phone, email, and address first.');
                        return;
                      }
                      setStep('review');
                    }}
                    className="w-full btn-primary py-3.5 text-sm flex items-center justify-center gap-2 rounded-xl"
                  >
                    <span>Continue to Order Method</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Step 2: Order Method & OTP Verification */
                <div className="p-6 sm:p-7 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6">
                  <div>
                    <h2 className="font-heading text-xl font-bold text-gray-900 dark:text-white">
                      Select Order Method
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Choose Cash on Delivery (COD) or a booking reservation. No payment gateway needed.
                    </p>
                  </div>

                  {/* COD Only — no booking option */}
                  <div className="p-4 rounded-2xl border border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 ring-2 ring-blue-600/20">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600">
                        <Banknote className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm text-gray-900 dark:text-white">Cash on Delivery (COD)</span>
                      <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">Selected</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                      Pay with cash upon delivery to your doorstep. Our courier will contact you before arrival. Completely safe and risk-free.
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600 font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      No upfront payment required
                    </div>
                  </div>

                  {/* Special Notes / Instructions */}
                  <div className="space-y-1.5 text-xs">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Order Notes or Special Instructions (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={specialNotes}
                      onChange={(e) => setSpecialNotes(e.target.value)}
                      placeholder="e.g. Please call before arriving, deliver after 2 PM..."
                      className="input-field w-full text-xs resize-none"
                    />
                  </div>

                  {/* OTP Account Verification Gate */}
                  <div
                    className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
                      isAccountVerified
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800'
                        : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <KeyRound className={`w-4 h-4 ${isAccountVerified ? 'text-emerald-600' : 'text-blue-600'}`} />
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          Contact Verification
                        </span>
                      </div>
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                          isAccountVerified
                            ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {isAccountVerified ? 'Verified ✓' : 'Verification Required'}
                      </span>
                    </div>

                    {isAccountVerified ? (
                      <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Contact verified! You can proceed to submit your order.</span>
                      </div>
                    ) : (
                      <div className="space-y-3 text-xs">
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                          To protect against fraudulent orders, please verify your phone or email with a quick OTP code.
                        </p>

                        {!otpSent ? (
                          <div className="flex flex-wrap gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleSendOtp('phone')}
                              disabled={otpSending}
                              className="btn-outline text-xs py-2 px-3 flex items-center gap-1.5 rounded-xl"
                            >
                              <Phone className="w-3.5 h-3.5 text-blue-600" />
                              <span>{otpSending ? 'Sending...' : `Send OTP to Phone (${formData.phone || 'Phone'})`}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendOtp('email')}
                              disabled={otpSending}
                              className="btn-outline text-xs py-2 px-3 flex items-center gap-1.5 rounded-xl"
                            >
                              <Mail className="w-3.5 h-3.5 text-blue-600" />
                              <span>{otpSending ? 'Sending...' : `Send OTP to Email (${formData.email || 'Email'})`}</span>
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3 pt-1">
                            {demoCodeNotice && (
                              <div className="p-3 rounded-xl bg-blue-100/70 dark:bg-blue-900/30 text-xs flex items-center justify-between text-blue-800 dark:text-blue-300">
                                <span>Demo OTP: <strong className="font-mono text-sm">{demoCodeNotice}</strong></span>
                                <button
                                  type="button"
                                  onClick={() => setOtpCode(demoCodeNotice)}
                                  className="text-xs font-bold underline hover:text-blue-900"
                                >
                                  Auto-Fill
                                </button>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <input
                                type="text"
                                maxLength={6}
                                placeholder="Enter 6-digit OTP"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value)}
                                className="input-field flex-1 text-center font-mono text-base tracking-widest"
                              />
                              <button
                                type="button"
                                onClick={handleVerifyOtp}
                                disabled={otpVerifying}
                                className="btn-primary text-xs px-4 py-2 shrink-0 rounded-xl"
                              >
                                {otpVerifying ? 'Checking...' : 'Verify'}
                              </button>
                            </div>

                            <div className="flex justify-between items-center text-[11px] text-gray-500">
                              <span>Didn&apos;t receive code?</span>
                              <button
                                type="button"
                                onClick={() => handleSendOtp('phone')}
                                className="text-blue-600 hover:underline font-semibold"
                              >
                                Resend Code
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <button
                      type="button"
                      onClick={() => setStep('shipping')}
                      className="btn-outline text-xs px-5 py-3 rounded-xl"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitOrder}
                      disabled={isProcessing || !isAccountVerified}
                      className="flex-1 btn-primary py-3.5 text-sm flex items-center justify-center gap-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FileCheck2 className="w-4 h-4" />
                      <span>
                        {isProcessing
                          ? 'Placing Order...'
                          : !isAccountVerified
                          ? 'Verify OTP to Place Order'
                          : `Confirm ${orderMethod === 'cod' ? 'Cash on Delivery' : 'Booking'} — ${formatPrice(grandTotal)}`}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Order Ledger Breakdown (5 Cols) */}
            <div className="lg:col-span-5 p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-heading text-lg font-bold text-gray-900 dark:text-white">
                  Order Summary
                </h3>
                <span className="text-xs text-gray-500 font-semibold">
                  {items.length} {items.length === 1 ? 'Item' : 'Items'}
                </span>
              </div>

              {/* Items List */}
              <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-64 overflow-y-auto no-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center gap-3 text-xs">
                    <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image || '/placeholder.png'}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{item.title}</p>
                      <p className="text-[11px] text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right font-bold text-gray-900 dark:text-white">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2.5 text-xs text-gray-600 dark:text-gray-300 pt-3 border-t border-gray-100 dark:border-gray-800">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>
                    {orderMethod === 'booking' || shippingCost === 0 ? (
                      <span className="text-emerald-600 font-semibold">Free</span>
                    ) : (
                      formatPrice(shippingCost)
                    )}
                  </span>
                </div>
                <div className="flex justify-between items-baseline text-sm font-bold text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-800">
                  <span>Total Due</span>
                  <span className="text-xl text-blue-600 dark:text-blue-400">
                    {formatPrice(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Trust Badge Card */}
              <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/50 text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
                <div className="font-semibold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  No Card Required • Cash on Delivery
                </div>
                <p className="text-[11px] leading-relaxed">
                  You only pay once you inspect your items upon delivery. Our support team will confirm your order details via phone/WhatsApp.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer siteName={defaultSiteSettings.site_name} />
    </div>
  );
}
