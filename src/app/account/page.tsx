'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  Package,
  MapPin,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Clock,
  ArrowRight,
  ShieldAlert,
  LogIn,
  Gem,
  Sparkles,
  Calendar,
  KeyRound,
  Phone,
  Mail,
} from 'lucide-react';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import { defaultSiteSettings } from '@/lib/seed-data';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/store';
import { BookingRequest } from '@/types';
import { sendOtp, verifyOtp } from '@/lib/otp';

export default function AccountPage() {
  const { user, logout, loginDemo, isAdmin, verifyOtpCode } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'bookings' | 'profile' | 'addresses'>('orders');
  const [bookings, setBookings] = useState<BookingRequest[]>([]);

  // OTP Verification States
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [demoCodeHint, setDemoCodeHint] = useState<string | null>(null);
  const [otpStatusMsg, setOtpStatusMsg] = useState('');

  const handleSendOtp = async (channel: 'phone' | 'email') => {
    if (!user) return;
    const target = channel === 'phone' ? (user.phone || user.email) : user.email;
    setOtpSending(true);
    setOtpStatusMsg('');
    try {
      const res = await sendOtp(target, channel);
      if (res.success) {
        setOtpSent(true);
        setDemoCodeHint(res.otp);
        setOtpStatusMsg(`Code dispatched to ${target}. (Demo Code: ${res.otp})`);
      } else {
        setOtpStatusMsg(res.message);
      }
    } catch {
      setOtpStatusMsg('Failed to send code.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!user || !otpCode.trim()) return;
    setOtpVerifying(true);
    try {
      const res = await verifyOtpCode(otpCode.trim());
      if (res.success) {
        setOtpStatusMsg('Account successfully verified! Booking request privileges unlocked.');
      } else {
        setOtpStatusMsg(res.message);
      }
    } catch {
      setOtpStatusMsg('Verification check failed.');
    } finally {
      setOtpVerifying(false);
    }
  };

  React.useEffect(() => {
    if (user) {
      api.getUserBookingRequests(user.id, user.email).then(setBookings);
    }
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col bg-[#02030A] text-[#E8E3D8] selection:bg-[#FFD700]/30 selection:text-[#FFD700]">
      <Header
        siteName={defaultSiteSettings.site_name}
        announcementText={defaultSiteSettings.announcement_bar_text}
      />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 lg:px-16 py-12 relative">
        {/* Subtle ambient neon glow */}
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-[radial-gradient(circle,rgba(255,215,0,0.05)_0%,transparent_70%)] pointer-events-none -z-10" />

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#E8E3D8]/60 uppercase tracking-[0.18em] mb-8" style={{ fontFamily: 'var(--font-rajdhani)' }}>
          <Link href="/" className="hover:text-[#FFD700] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 opacity-40 text-[#FFD700]" />
          <span className="text-[#FFD700] font-bold">Patron Sanctuary</span>
        </nav>

        {!user ? (
          /* Not Logged In State */
          <div
            className="max-w-md mx-auto my-12 p-8 sm:p-10 text-center space-y-6"
            style={{
              background: 'rgba(8, 12, 28, 0.9)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              boxShadow: '0 0 40px rgba(0, 0, 0, 0.9), 0 0 20px rgba(255, 215, 0, 0.1)',
              backdropFilter: 'blur(20px)',
              clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 15px 100%, 0 calc(100% - 15px))',
            }}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto"
              style={{
                background: 'rgba(255, 215, 0, 0.1)',
                border: '1px solid rgba(255, 215, 0, 0.35)',
              }}
            >
              <User className="w-7 h-7 text-[#FFD700]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#FFD700] block mb-1" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                Ceylon Times Sanctuary
              </span>
              <h1 className="font-serif text-2xl text-white font-normal">
                Patron Sign In
              </h1>
              <p className="text-xs text-[#E8E3D8]/70 mt-2 font-sans leading-relaxed">
                Sign in to your private Ceylon Times portfolio to manage custom orders, delivery coordinates, and privileges.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href="/login"
                className="w-full btn-neon-gold text-xs py-3.5 flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In to Account</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Logged In State */
          <>
            <div className="pb-6 border-b border-yellow-500/15 mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#00FFFF] block mb-1" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                  Sri Lanka Guild Member
                </span>
                <h1 className="font-serif text-3xl sm:text-4xl text-white font-normal tracking-wide">
                  Patron Sanctuary
                </h1>
                <p className="text-xs text-[#E8E3D8]/70 mt-2 font-sans">
                  Manage your authenticated acquisitions, delivery preferences, and atelier profile.
                </p>
              </div>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="btn-neon-gold text-xs py-2.5 px-4 inline-flex items-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Open Admin Control Center</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Navigation Sidebar (3 Cols) */}
              <aside className="lg:col-span-3 space-y-2">
                <div
                  className="p-6 mb-6"
                  style={{
                    background: 'rgba(8, 12, 28, 0.85)',
                    border: '1px solid rgba(255, 215, 0, 0.25)',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-3"
                    style={{
                      background: 'rgba(255, 215, 0, 0.1)',
                      border: '1px solid rgba(255, 215, 0, 0.3)',
                    }}
                  >
                    <User className="w-6 h-6 text-[#FFD700]" />
                  </div>
                  <h3 className="font-serif text-lg text-white font-medium">
                    {user?.full_name || user?.email?.split('@')[0] || 'Ceylon Patron'}
                  </h3>
                  <p className="text-xs text-[#E8E3D8]/50 truncate">{user?.email}</p>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    {user?.is_verified || isAdmin ? (
                      <div
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase"
                        style={{
                          background: 'rgba(0, 255, 136, 0.1)',
                          border: '1px solid rgba(0, 255, 136, 0.3)',
                          color: '#00FF88',
                          fontFamily: 'var(--font-rajdhani)',
                        }}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        Verified Patron
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveTab('profile')}
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase cursor-pointer"
                        style={{
                          background: 'rgba(251, 191, 36, 0.15)',
                          border: '1px solid rgba(251, 191, 36, 0.35)',
                          color: '#FCD34D',
                          fontFamily: 'var(--font-rajdhani)',
                        }}
                      >
                        <KeyRound className="w-3 h-3" />
                        Verify via OTP
                      </button>
                    )}
                    {isAdmin && (
                      <div
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase"
                        style={{
                          background: 'rgba(255, 215, 0, 0.15)',
                          border: '1px solid rgba(255, 215, 0, 0.4)',
                          color: '#FFD700',
                          fontFamily: 'var(--font-rajdhani)',
                        }}
                      >
                        <ShieldAlert className="w-3 h-3" />
                        Director Access
                      </div>
                    )}
                  </div>

                  {isAdmin && (
                    <div className="mt-4 pt-4 border-t border-yellow-500/15">
                      <Link
                        href="/admin"
                        className="w-full btn-neon-gold text-[11px] py-2 px-3 flex items-center justify-center gap-2"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Admin Dashboard</span>
                      </Link>
                    </div>
                  )}
                </div>

                <div
                  className="divide-y divide-yellow-500/10 text-xs font-bold"
                  style={{
                    background: 'rgba(8, 12, 28, 0.8)',
                    border: '1px solid rgba(255, 215, 0, 0.2)',
                    fontFamily: 'var(--font-rajdhani)',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setActiveTab('orders')}
                    className={`w-full flex items-center gap-3 p-3.5 text-left transition-colors cursor-pointer ${
                      activeTab === 'orders' ? 'bg-[#FFD700]/20 text-[#FFD700] border-l-2 border-[#FFD700]' : 'text-[#E8E3D8]/70 hover:text-white'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    <span>Acquisition History</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('bookings')}
                    className={`w-full flex items-center gap-3 p-3.5 text-left transition-colors cursor-pointer ${
                      activeTab === 'bookings' ? 'bg-[#FFD700]/20 text-[#FFD700] border-l-2 border-[#FFD700]' : 'text-[#E8E3D8]/70 hover:text-white'
                    }`}
                  >
                    <Calendar className="w-4 h-4" />
                    <div className="flex-1 flex items-center justify-between">
                      <span>Atelier Bookings</span>
                      {bookings.length > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(201,169,110,0.2)] text-[#FFD700]">
                          {bookings.length}
                        </span>
                      )}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center gap-3 p-3.5 text-left transition-colors cursor-pointer ${
                      activeTab === 'profile' ? 'bg-[#FFD700]/20 text-[#FFD700] border-l-2 border-[#FFD700]' : 'text-[#E8E3D8]/70 hover:text-white'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    <span>Patron Credentials</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('addresses')}
                    className={`w-full flex items-center gap-3 p-3.5 text-left transition-colors cursor-pointer ${
                      activeTab === 'addresses' ? 'bg-[#FFD700]/20 text-[#FFD700] border-l-2 border-[#FFD700]' : 'text-[#E8E3D8]/70 hover:text-white'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                    <span>Delivery Coordinates</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="w-full flex items-center gap-3 p-3.5 text-left text-[#FF2D55] hover:bg-[#FF2D55]/10 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Conclude Session (Logout)</span>
                  </button>
                </div>
              </aside>

              {/* Content Area (9 Cols) */}
              <div
                className="lg:col-span-9 p-8 min-h-[400px]"
                style={{
                  background: 'rgba(8, 12, 28, 0.85)',
                  border: '1px solid rgba(255, 215, 0, 0.25)',
                  boxShadow: '0 0 35px rgba(0, 0, 0, 0.7)',
                }}
              >
                {activeTab === 'orders' && (
                  <div>
                    <h2 className="font-serif text-2xl text-white font-medium mb-6 pb-4 border-b border-yellow-500/15">
                      Archival Acquisitions
                    </h2>

                    <div
                      className="p-8 text-center space-y-4"
                      style={{
                        background: 'rgba(4, 6, 16, 0.7)',
                        border: '1px solid rgba(255, 215, 0, 0.15)',
                      }}
                    >
                      <Clock className="w-8 h-8 text-[#FFD700]/50 mx-auto" />
                      <h3 className="font-serif text-lg text-white">No Active Orders Pending</h3>
                      <p className="text-xs text-[#E8E3D8]/60 max-w-sm mx-auto font-sans leading-relaxed">
                        When you reserve numbered editions from our Sri Lankan workshops, detailed tracking manifests and fulfillment updates will be cataloged here.
                      </p>
                      <Link
                        href="/products"
                        className="btn-neon-gold text-xs inline-flex py-2.5 px-6"
                      >
                        <span>Browse Ceylon Catalog</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    </div>
                  </div>
                )}

                {activeTab === 'bookings' && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-yellow-500/15">
                      <div>
                        <h2 className="font-serif text-2xl text-white font-medium">
                          Bookings & Custom Orders
                        </h2>
                        <p className="text-xs text-[#E8E3D8]/60 mt-1">
                          Orders and custom requests placed with Ceylon Times vendors.
                        </p>
                      </div>
                      <Link
                        href="/products"
                        className="btn-neon-gold text-xs py-2 px-4 inline-flex items-center gap-2 self-start sm:self-auto"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Browse Catalog</span>
                      </Link>
                    </div>

                    {bookings.length === 0 ? (
                      <div
                        className="p-8 text-center space-y-4"
                        style={{
                          background: 'rgba(4, 6, 16, 0.7)',
                          border: '1px solid rgba(255, 215, 0, 0.15)',
                        }}
                      >
                        <Calendar className="w-8 h-8 text-[#FFD700]/50 mx-auto" />
                        <h3 className="font-serif text-lg text-white">No Booking Requests Placed</h3>
                        <p className="text-xs text-[#E8E3D8]/60 max-w-sm mx-auto font-sans leading-relaxed">
                          Your Cash on Delivery requests and custom order reservations will appear here.
                        </p>
                        <Link
                          href="/products"
                          className="btn-neon-gold text-xs inline-flex py-2.5 px-6"
                        >
                          <span>Explore Products</span>
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Link>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {bookings.map((bk) => (
                          <div
                            key={bk.id}
                            className="p-5 rounded-xl border border-yellow-500/20 space-y-3"
                            style={{
                              background: 'rgba(8, 12, 28, 0.85)',
                            }}
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
                              <div>
                                <span className="text-[10px] font-mono uppercase tracking-widest text-[#FFD700]">
                                  {bk.id.toUpperCase()}
                                </span>
                                <h3 className="font-serif text-base text-white font-medium mt-0.5">
                                  {bk.service_title}
                                </h3>
                              </div>
                              <span
                                className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full ${
                                  bk.status === 'confirmed'
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : bk.status === 'cancelled'
                                    ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                }`}
                              >
                                {bk.status === 'confirmed' ? 'Confirmed & Reserved' : bk.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-[#E8E3D8]/70">
                              <div>
                                <span className="text-[10px] uppercase tracking-wider text-white/40 block">Date</span>
                                <span className="text-[#FFD700] font-semibold">{bk.preferred_date}</span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase tracking-wider text-white/40 block">Time Slot</span>
                                <span className="text-white">{bk.preferred_time}</span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase tracking-wider text-white/40 block">Party</span>
                                <span className="text-white">{bk.guests_count} Patrons</span>
                              </div>
                            </div>

                            {bk.special_requirements && (
                              <div className="pt-2 text-xs text-[#E8E3D8]/60 bg-black/30 p-2.5 rounded border border-white/5">
                                <span className="font-semibold text-white/80">Special Brief: </span>
                                {bk.special_requirements}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'profile' && (
                  <div className="max-w-xl space-y-6">
                    <h2 className="font-serif text-2xl text-white font-medium pb-4 border-b border-yellow-500/15">
                      Patron Credentials
                    </h2>

                    <div className="space-y-4 text-xs font-sans">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[#FFD700] mb-1.5" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                          Full Name
                        </label>
                        <input
                          type="text"
                          defaultValue={user?.full_name || ''}
                          className="w-full p-3 text-white focus:outline-none"
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
                          disabled
                          defaultValue={user?.email || ''}
                          className="w-full p-3 text-[#E8E3D8]/50"
                          style={{
                            background: 'rgba(2, 3, 10, 0.5)',
                            border: '1px solid rgba(255, 215, 0, 0.15)',
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[#00FFFF] mb-1.5" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                          Contact Telephone (Sri Lanka)
                        </label>
                        <input
                          type="tel"
                          defaultValue={user?.phone || ''}
                          className="w-full p-3 text-white focus:outline-none"
                          style={{
                            background: 'rgba(4, 6, 16, 0.8)',
                            border: '1px solid rgba(255, 215, 0, 0.25)',
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-[#FFD700] mb-1.5" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                          Authorization Rank &amp; Status
                        </label>
                        <input
                          type="text"
                          disabled
                          defaultValue={
                            isAdmin
                              ? user?.is_primary_admin
                                ? 'Ceylon Times Primary Director (Root Admin)'
                                : 'Ceylon Times Secondary Administrator (Full Site Maintenance)'
                              : user?.is_verified
                              ? 'Verified Island Patron (Full Booking Privileges)'
                              : 'Unverified Patron (OTP Verification Required)'
                          }
                          className="w-full p-3 text-[#FFD700] font-bold"
                          style={{
                            background: 'rgba(255, 215, 0, 0.05)',
                            border: '1px solid rgba(255, 215, 0, 0.2)',
                            fontFamily: 'var(--font-rajdhani)',
                          }}
                        />
                      </div>
                    </div>

                    {!user?.is_verified && !isAdmin && (
                      <div
                        className="p-5 border space-y-3"
                        style={{
                          background: 'rgba(255, 215, 0, 0.05)',
                          borderColor: 'rgba(255, 215, 0, 0.3)',
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#FFD700] flex items-center gap-1.5" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                            <KeyRound className="w-4 h-4" />
                            Verify Patron Account via OTP
                          </span>
                          <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
                            Required for Bookings
                          </span>
                        </div>
                        <p className="text-xs text-[#E8E3D8]/70 leading-relaxed font-sans">
                          To protect the atelier reservation ledger, patrons must complete a one-time OTP verification before placing private appointment requests.
                        </p>

                        {!otpSent ? (
                          <div className="flex flex-wrap gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleSendOtp('phone')}
                              disabled={otpSending}
                              className="btn-neon-outline text-[11px] py-2 px-3 flex items-center gap-1.5"
                            >
                              <Phone className="w-3.5 h-3.5 text-[#00FFFF]" />
                              <span>{otpSending ? 'Dispatching...' : `Verify via Phone (${user?.phone || 'Phone'})`}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSendOtp('email')}
                              disabled={otpSending}
                              className="btn-neon-outline text-[11px] py-2 px-3 flex items-center gap-1.5"
                            >
                              <Mail className="w-3.5 h-3.5 text-[#FFD700]" />
                              <span>{otpSending ? 'Dispatching...' : `Verify via Email (${user?.email})`}</span>
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3 pt-2">
                            {demoCodeHint && (
                              <div
                                className="p-3 text-[11px] flex items-center justify-between font-sans"
                                style={{
                                  background: 'rgba(0, 255, 255, 0.08)',
                                  border: '1px solid rgba(0, 255, 255, 0.3)',
                                  color: '#00FFFF',
                                }}
                              >
                                <span>Demo OTP Code: <strong className="font-mono text-white text-sm">{demoCodeHint}</strong></span>
                                <button
                                  type="button"
                                  onClick={() => setOtpCode(demoCodeHint)}
                                  className="text-[10px] uppercase font-bold tracking-wider text-[#FFD700] hover:underline cursor-pointer"
                                >
                                  Auto-Fill Code
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
                                className="flex-1 p-2.5 text-center font-mono text-base tracking-widest text-white focus:outline-none"
                                style={{
                                  background: 'rgba(4, 6, 16, 0.8)',
                                  border: '1px solid rgba(255, 215, 0, 0.3)',
                                }}
                              />
                              <button
                                type="button"
                                onClick={handleVerifyOtp}
                                disabled={otpVerifying}
                                className="btn-neon-gold text-xs px-5 py-2.5 shrink-0"
                              >
                                {otpVerifying ? 'Checking...' : 'Verify OTP'}
                              </button>
                            </div>
                          </div>
                        )}

                        {otpStatusMsg && (
                          <div className="text-[11px] text-[#00FF88] font-sans pt-1">
                            {otpStatusMsg}
                          </div>
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      className="btn-neon-gold text-xs px-6 py-3"
                    >
                      Save Credentials
                    </button>
                  </div>
                )}

                {activeTab === 'addresses' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-yellow-500/15">
                      <h2 className="font-serif text-2xl text-white font-medium">
                        Delivery Coordinates
                      </h2>
                      <button
                        type="button"
                        className="btn-neon-outline text-xs px-4 py-2"
                      >
                        + Add Destination
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div
                        className="p-6 relative"
                        style={{
                          background: 'rgba(4, 6, 16, 0.8)',
                          border: '1px solid rgba(255, 215, 0, 0.35)',
                        }}
                      >
                        <span
                          className="absolute top-4 right-4 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#02030A] bg-[#FFD700]"
                          style={{ fontFamily: 'var(--font-rajdhani)' }}
                        >
                          Default
                        </span>
                        <h3 className="font-serif text-base text-white mb-1">{user?.full_name || 'Your Name'}</h3>
                        <p className="text-xs text-[#E8E3D8]/70 leading-relaxed font-sans">
                          {user?.phone ? `Phone: ${user.phone}` : 'No address saved yet.'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      <Footer siteName={defaultSiteSettings.site_name} />
    </div>
  );
}
