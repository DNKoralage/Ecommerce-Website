'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  Users,
  Sparkles,
  Gem,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Compass,
  FileText,
  User,
  LogIn,
  UserPlus,
} from 'lucide-react';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import { defaultSiteSettings } from '@/lib/seed-data';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/store';
import { BookingRequest } from '@/types';

interface ServiceOption {
  id: string;
  title: string;
  category: string;
  duration: string;
  description: string;
  icon: React.ElementType;
}

const SERVICES: ServiceOption[] = [
  {
    id: 'sapphire_consultation',
    title: 'Royal Ceylon Sapphire & Gem Consultation',
    category: 'Gemology & Fine Jewellery',
    duration: '90 Minutes',
    description: 'Private salon consultation with certified gemologists for unheated Ratnapura sapphires, custom jewelry settings, and certified investment gems.',
    icon: Gem,
  },
  {
    id: 'bespoke_handloom',
    title: 'Bespoke Kandyan Silk & Handloom Weave',
    category: 'Heritage Textiles',
    duration: '60 Minutes',
    description: 'Direct collaboration with master weavers from traditional Kandyan artisan lineages to design bespoke ceremonial handlooms, sarees, and wall tapestries.',
    icon: Sparkles,
  },
  {
    id: 'brass_sculpture',
    title: 'Sacred Temple Brass & Bronze Commission',
    category: 'Sacred Living Arts',
    duration: '60 Minutes',
    description: 'Commission bespoke lost-wax cast temple lamps, sacred oil vessels, or protective traditional Sri Lankan architectural sculptures.',
    icon: Compass,
  },
  {
    id: 'private_tea_tasting',
    title: 'Single-Estate Nuwara Eliya Tea Tasting Masterclass',
    category: 'Botanical Reserves',
    duration: '75 Minutes',
    description: 'Exclusive sommelier tasting of rare single-estate silver tips, high-elevation seasonal flushes, and artisanal spice infusions.',
    icon: Clock,
  },
  {
    id: 'custom_commission',
    title: 'Custom Sovereign Heritage Atelier Project',
    category: 'Private Atelier',
    duration: 'Custom Duration',
    description: 'Comprehensive multi-disciplinary commission encompassing rare materials, custom woodcarving, or custom ceremonial ensembles.',
    icon: FileText,
  },
];

const TIME_SLOTS = [
  'Morning Atelier (10:00 AM - 11:30 AM)',
  'Midday Salon (12:30 PM - 02:00 PM)',
  'Afternoon Session (02:30 PM - 04:00 PM)',
  'Twilight Private Salon (05:00 PM - 06:30 PM)',
];

export default function BookingPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [selectedService, setSelectedService] = useState<string>(SERVICES[0].id);
  const [preferredDate, setPreferredDate] = useState<string>('');
  const [preferredTime, setPreferredTime] = useState<string>(TIME_SLOTS[0]);
  const [guestCount, setGuestCount] = useState<number>(2);
  const [specialNotes, setSpecialNotes] = useState<string>('');

  const [submitting, setSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<BookingRequest | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Minimum date: tomorrow
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateString = tomorrow.toISOString().split('T')[0];

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user) {
      router.push('/login?redirect=/booking');
      return;
    }

    if (!preferredDate) {
      setErrorMsg('Please select a preferred date for your private appointment.');
      return;
    }

    setSubmitting(true);
    try {
      const service = SERVICES.find((s) => s.id === selectedService) || SERVICES[0];
      const created = await api.createBookingRequest({
        user_id: user.id,
        user_name: user.full_name || 'Valued Patron',
        user_email: user.email,
        user_phone: user.phone || '',
        service_type: service.id,
        service_title: service.title,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        guests_count: guestCount,
        special_requirements: specialNotes.trim() || undefined,
      });

      setBookingSuccess(created);
    } catch {
      setErrorMsg('Could not submit your booking request. Please try again or contact concierge.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0F] text-[#E8E6E1]">
      <Header
        siteName={defaultSiteSettings.site_name}
        announcementText={defaultSiteSettings.announcement_bar_text}
      />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 lg:px-16 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#9A9490] uppercase tracking-[0.18em] mb-8 font-sans">
          <Link href="/" className="hover:text-[#FFD700] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 opacity-40 text-[#FFD700]" />
          <span className="text-[#FFD700] font-bold">Atelier Booking</span>
        </nav>

        {/* Page Title Header */}
        <div className="max-w-3xl mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[rgba(255,215,0,0.08)] text-[#FFD700] border border-[rgba(255,215,0,0.25)] text-[10px] font-semibold uppercase tracking-wider mb-4">
            <Sparkles className="w-3 h-3 text-[#C9A96E]" />
            Sovereign Bespoke Commissions & Consultations
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-light text-[#E8E6E1] tracking-wide leading-tight">
            Reserve Your Private Atelier Experience
          </h1>
          <p className="text-sm text-[#9A9490] mt-3 leading-relaxed">
            Schedule an exclusive private consultation with Ceylon Times master gemologists, heritage textile weavers, and sacred artisans. All appointments are hosted in our private Colombo salon or via encrypted digital concierge.
          </p>
        </div>

        {bookingSuccess ? (
          /* Confirmation Receipt Card */
          <div
            className="max-w-2xl mx-auto my-8 p-8 sm:p-12 text-center space-y-6 relative overflow-hidden"
            style={{
              background: 'linear-gradient(180deg, #111118 0%, #0D0D14 100%)',
              border: '1px solid rgba(201,169,110,0.3)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.8), 0 0 30px rgba(201,169,110,0.1)',
            }}
          >
            <div className="w-16 h-16 rounded-full bg-[rgba(74,222,128,0.1)] border border-[rgba(74,222,128,0.3)] flex items-center justify-center mx-auto text-[#4ADE80]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C9A96E]">
                Booking Reference: {bookingSuccess.id.toUpperCase()}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-white mt-1">
                Booking Request Preserved
              </h2>
              <p className="text-xs text-[#9A9490] mt-2 max-w-md mx-auto leading-relaxed">
                Thank you, {bookingSuccess.user_name}. Your reservation request for{' '}
                <strong className="text-[#E8E6E1]">{bookingSuccess.service_title}</strong> on{' '}
                <strong className="text-[#E8E6E1]">{bookingSuccess.preferred_date}</strong> has been received by the Ceylon Concierge team.
              </p>
            </div>

            <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] p-6 text-left rounded-xl space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[rgba(255,255,255,0.04)]">
                <span className="text-[#6B6760]">Service</span>
                <span className="text-[#E8E6E1] font-semibold">{bookingSuccess.service_title}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[rgba(255,255,255,0.04)]">
                <span className="text-[#6B6760]">Preferred Date</span>
                <span className="text-[#C9A96E] font-semibold">{bookingSuccess.preferred_date}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[rgba(255,255,255,0.04)]">
                <span className="text-[#6B6760]">Time Slot</span>
                <span className="text-[#E8E6E1]">{bookingSuccess.preferred_time}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[rgba(255,255,255,0.04)]">
                <span className="text-[#6B6760]">Guest Count</span>
                <span className="text-[#E8E6E1]">{bookingSuccess.guests_count} Patrons</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#6B6760]">Status</span>
                <span className="px-2 py-0.5 rounded bg-[rgba(251,191,36,0.15)] text-[#FCD34D] font-bold uppercase text-[10px]">
                  Pending Review
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link
                href="/account"
                className="py-3 px-6 bg-gradient-to-r from-[#C9A96E] to-[#8B6914] text-[#0A0A0F] font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <span>View in Patron Sanctuary</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={() => setBookingSuccess(null)}
                className="py-3 px-6 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[#E8E6E1] text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-all"
              >
                Book Another Experience
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Form Column */}
            <div className="lg:col-span-8">
              {/* Not Logged In Auth Banner */}
              {!user && (
                <div
                  className="mb-8 p-6 rounded-xl border border-[rgba(201,169,110,0.3)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  style={{
                    background: 'linear-gradient(90deg, rgba(201,169,110,0.1) 0%, rgba(17,17,24,0.9) 100%)',
                  }}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#FFD700] flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#C9A96E]" />
                      Patron Authentication Required
                    </span>
                    <h3 className="font-serif text-lg text-[#E8E6E1]">
                      Sign In or Create an Account to Reserve
                    </h3>
                    <p className="text-xs text-[#9A9490]">
                      Normal users can register in seconds to place booking requests and track private atelier commissions.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Link
                      href="/login?redirect=/booking"
                      className="px-4 py-2.5 bg-gradient-to-r from-[#C9A96E] to-[#8B6914] text-[#0A0A0F] font-bold text-xs uppercase tracking-wider rounded-lg shadow flex items-center gap-1.5"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Sign In</span>
                    </Link>
                    <Link
                      href="/login?mode=signup&redirect=/booking"
                      className="px-4 py-2.5 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.15)] text-[#E8E6E1] text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-[rgba(255,255,255,0.1)] flex items-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-[#C9A96E]" />
                      <span>Sign Up</span>
                    </Link>
                  </div>
                </div>
              )}

              <form onSubmit={handleBookingSubmit} className="space-y-8">
                {/* 1. Choose Service Experience */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#C9A96E] mb-3">
                    1. Select Bespoke Experience
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {SERVICES.map((srv) => {
                      const Icon = srv.icon;
                      const isSelected = selectedService === srv.id;
                      return (
                        <div
                          key={srv.id}
                          onClick={() => setSelectedService(srv.id)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 relative ${
                            isSelected
                              ? 'bg-[rgba(201,169,110,0.12)] border-[#C9A96E] shadow-[0_0_15px_rgba(201,169,110,0.2)]'
                              : 'bg-[#111118] border-[rgba(255,255,255,0.06)] hover:border-[rgba(255,255,255,0.15)]'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                                isSelected
                                  ? 'bg-[#C9A96E] text-[#0A0A0F]'
                                  : 'bg-[rgba(255,255,255,0.04)] text-[#9A9490]'
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <span className="text-[10px] uppercase font-bold tracking-wider text-[#6B6760] block">
                                {srv.category} &bull; {srv.duration}
                              </span>
                              <h3 className="font-serif text-sm text-[#E8E6E1] font-medium mt-0.5">
                                {srv.title}
                              </h3>
                              <p className="text-xs text-[#9A9490] mt-1.5 line-clamp-2 leading-relaxed">
                                {srv.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Schedule Coordinates */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#C9A96E] mb-3">
                    2. Date, Time & Patrons
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Date */}
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9A9490] mb-1.5">
                        Preferred Date
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6760]" />
                        <input
                          type="date"
                          required
                          min={minDateString}
                          value={preferredDate}
                          onChange={(e) => setPreferredDate(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 bg-[#111118] border border-[rgba(255,255,255,0.1)] rounded-lg text-[#E8E6E1] text-xs focus:outline-none focus:border-[#C9A96E] color-scheme-dark"
                          style={{ colorScheme: 'dark' }}
                        />
                      </div>
                    </div>

                    {/* Time Slot */}
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9A9490] mb-1.5">
                        Time Slot
                      </label>
                      <div className="relative">
                        <Clock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6760]" />
                        <select
                          value={preferredTime}
                          onChange={(e) => setPreferredTime(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 bg-[#111118] border border-[rgba(255,255,255,0.1)] rounded-lg text-[#E8E6E1] text-xs focus:outline-none focus:border-[#C9A96E] cursor-pointer"
                        >
                          {TIME_SLOTS.map((t) => (
                            <option key={t} value={t} style={{ background: '#111118' }}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Guests Count */}
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9A9490] mb-1.5">
                        Guests / Patrons
                      </label>
                      <div className="relative">
                        <Users className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6760]" />
                        <select
                          value={guestCount}
                          onChange={(e) => setGuestCount(parseInt(e.target.value))}
                          className="w-full pl-10 pr-3 py-2.5 bg-[#111118] border border-[rgba(255,255,255,0.1)] rounded-lg text-[#E8E6E1] text-xs focus:outline-none focus:border-[#C9A96E] cursor-pointer"
                        >
                          {[1, 2, 3, 4, 5, 6].map((n) => (
                            <option key={n} value={n} style={{ background: '#111118' }}>
                              {n} {n === 1 ? 'Patron (Private)' : 'Patrons'}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Special Requirements */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#C9A96E] mb-1.5">
                    3. Bespoke Specifications & Notes
                  </label>
                  <p className="text-xs text-[#9A9490] mb-3">
                    Mention specific gemstones of interest, heirloom items to incorporate, customized dimensions, or dietary preferences for tea tastings.
                  </p>
                  <textarea
                    rows={4}
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    placeholder="e.g. Inquiring about a certified unheated 3.5 carat royal blue sapphire from Ratnapura with platinum ring design..."
                    className="w-full p-3.5 bg-[#111118] border border-[rgba(255,255,255,0.1)] rounded-xl text-[#E8E6E1] text-xs placeholder-[#4B4A48] focus:outline-none focus:border-[#C9A96E] transition-colors leading-relaxed"
                  />
                </div>

                {/* Error Banner */}
                {errorMsg && (
                  <div className="p-3.5 bg-[rgba(248,113,113,0.1)] border border-[rgba(248,113,113,0.3)] text-[#F87171] text-xs rounded-lg flex items-center gap-2">
                    <span>⚠</span>
                    <span>{errorMsg}</span>
                  </div>
                )}

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#C9A96E] to-[#8B6914] text-[#0A0A0F] font-bold text-xs uppercase tracking-[0.2em] rounded-xl shadow-[0_0_25px_rgba(201,169,110,0.3)] hover:brightness-110 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <span>Submitting Request…</span>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>{user ? 'Submit Booking Request' : 'Sign In to Submit Booking'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-[#6B6760] mt-2.5">
                    Appointments are complimentary for registered Ceylon Times patrons. Your booking will be reviewed within 24 hours.
                  </p>
                </div>
              </form>
            </div>

            {/* Sidebar / Info Column */}
            <div className="lg:col-span-4 space-y-6">
              <div
                className="p-6 rounded-2xl border border-[rgba(255,255,255,0.06)] relative overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, #111118 0%, #0D0D14 100%)',
                }}
              >
                <div className="w-10 h-10 rounded-xl bg-[rgba(201,169,110,0.1)] border border-[rgba(201,169,110,0.25)] flex items-center justify-center text-[#C9A96E] mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg text-white font-normal">
                  The Ceylon Atelier Guarantee
                </h3>
                <ul className="mt-4 space-y-3 text-xs text-[#9A9490]">
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A96E] mt-0.5">✦</span>
                    <span>Direct access to certified master artisans and gemologists.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A96E] mt-0.5">✦</span>
                    <span>Certified authenticity certificates with sovereign provenance.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#C9A96E] mt-0.5">✦</span>
                    <span>Private discreet lounge with complimentary artisanal Ceylon tea.</span>
                  </li>
                </ul>
              </div>

              {/* Patron Sanctuary Shortcut */}
              {user && (
                <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] space-y-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#00FFFF]">
                    Logged in as
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[rgba(201,169,110,0.2)] text-[#C9A96E] font-bold flex items-center justify-center text-xs">
                      {user.full_name ? user.full_name[0] : 'P'}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#E8E6E1]">
                        {user.full_name || 'Ceylon Patron'}
                      </div>
                      <div className="text-[11px] text-[#6B6760]">{user.email}</div>
                    </div>
                  </div>
                  <div className="pt-2">
                    <Link
                      href="/account"
                      className="text-xs text-[#C9A96E] hover:text-[#FFD700] transition-colors flex items-center gap-1.5"
                    >
                      <span>View existing booking requests</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer siteName={defaultSiteSettings.site_name} />
    </div>
  );
}
