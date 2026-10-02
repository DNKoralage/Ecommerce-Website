'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import { defaultSiteSettings } from '@/lib/seed-data';
import { useAuth } from '@/context/AuthContext';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/account';

  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        // Determine redirect by checking persisted role after auth state settles
        setTimeout(() => {
          try {
            const stored = localStorage.getItem('ceylon_user') || localStorage.getItem('luxe_user');
            const parsed = stored ? JSON.parse(stored) : null;
            if (parsed?.role === 'admin') {
              router.push(redirectPath.startsWith('/admin') ? redirectPath : '/admin');
            } else {
              router.push(redirectPath === '/admin' ? '/account' : redirectPath);
            }
          } catch {
            router.push('/account');
          }
        }, 60);
      } else {
        setError(res.message || 'Authentication failed. Please check your credentials.');
      }
    } catch {
      setError('An error occurred during authentication. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0F] text-[#E8E6E1]">
      <Header
        siteName={defaultSiteSettings.site_name}
        announcementText={defaultSiteSettings.announcement_bar_text}
      />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-6 py-16 flex items-center justify-center">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-[#111118] border border-[rgba(255,255,255,0.08)] p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            {/* Top Gold Accent Bar */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A96E] to-transparent opacity-90" />

            {/* Header */}
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[rgba(255,215,0,0.08)] text-[#FFD700] border border-[rgba(255,215,0,0.25)] text-[10px] font-semibold uppercase tracking-wider mb-4">
                <Lock className="w-3 h-3 text-[#C9A96E]" />
                Ceylon Times · Secure Portal
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-light text-[#E8E6E1] tracking-wide">
                Sign In
              </h1>
              <p className="text-xs text-[#9A9490] mt-2 leading-relaxed">
                Enter your credentials to access your account or the admin workspace.
              </p>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="p-3 mb-6 bg-[rgba(248,113,113,0.08)] border border-[rgba(248,113,113,0.3)] text-[#F87171] text-xs flex items-start gap-2">
                <span className="mt-0.5 shrink-0">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5 text-xs font-sans">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9A9490] mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6760]" />
                  <input
                    id="login-email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-3 py-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-[#E8E6E1] placeholder-[#4B4A48] focus:outline-none focus:border-[rgba(201,169,110,0.6)] transition-colors text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#9A9490] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B6760]" />
                  <input
                    id="login-password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-3 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.1)] text-[#E8E6E1] placeholder-[#4B4A48] focus:outline-none focus:border-[rgba(201,169,110,0.6)] transition-colors text-sm"
                  />
                </div>
              </div>

              <button
                id="login-submit"
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-1 py-3.5 px-6 bg-gradient-to-r from-[#C9A96E] to-[#A0784A] hover:from-[#D4B47B] hover:to-[#B08855] text-[#0A0A0F] font-bold text-[11px] tracking-[0.2em] uppercase transition-all shadow-[0_0_20px_rgba(201,169,110,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Authenticating…</span>
                ) : (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.07)] text-center text-[11px] text-[#6B6760] space-y-2">
              <p>
                Need help?{' '}
                <Link href="/contact" className="text-[#C9A96E] hover:text-[#FFD700] transition-colors">
                  Contact Ceylon Concierge
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer siteName={defaultSiteSettings.site_name} />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0F]" />}>
      <LoginFormContent />
    </Suspense>
  );
}
