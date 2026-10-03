'use client';

import React, { useState, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  User,
  Phone,
  Sparkles,
  CheckCircle2,
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';
import Header from '@/components/storefront/Header';
import Footer from '@/components/storefront/Footer';
import { defaultSiteSettings } from '@/lib/seed-data';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { sendOtp } from '@/lib/otp';
import { sound } from '@/lib/sound';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/account';
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';

  const { login, signUp, verifyOtpCode } = useAuth();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otpChannel, setOtpChannel] = useState<'phone' | 'email'>('phone');

  // OTP Verification Step State
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpTarget, setOtpTarget] = useState('');
  const [demoCodeHint, setDemoCodeHint] = useState<string | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Listen for OTP dispatched event
  useEffect(() => {
    const handleOtpDispatched = (e: Event) => {
      const customEvent = e as CustomEvent<{ target: string; code: string }>;
      if (customEvent.detail?.code) {
        setDemoCodeHint(customEvent.detail.code);
      }
    };
    window.addEventListener('ceylon_otp_dispatched', handleOtpDispatched);
    return () => window.removeEventListener('ceylon_otp_dispatched', handleOtpDispatched);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setIsSubmitting(true);
    sound.playClick();

    try {
      if (mode === 'signup') {
        if (!fullName.trim()) {
          setError('Please enter your full name.');
          setIsSubmitting(false);
          return;
        }
        if (!email.trim() || !email.includes('@')) {
          setError('Please enter a valid email address.');
          setIsSubmitting(false);
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.');
          setIsSubmitting(false);
          return;
        }
        if (password !== confirmPassword) {
          setError('Passwords do not match. Please ensure both passwords match.');
          setIsSubmitting(false);
          return;
        }

        const res = await signUp({
          full_name: fullName,
          email,
          phone,
          password,
        });

        if (res.success) {
          const target = otpChannel === 'phone' && phone ? phone : email;
          setOtpTarget(target);
          setOtpStep(true);
          setSuccessMsg(`Verification code sent to ${target}. Please enter the 6-digit OTP code to activate your account.`);
          sound.playNotification();
        } else {
          setError(res.message || 'Registration failed. Please try again.');
        }
      } else {
        const res = await login(email, password);
        if (res.success) {
          sound.playSuccess();
          setTimeout(() => {
            try {
              const stored = localStorage.getItem('ceylon_user') || localStorage.getItem('luxe_user');
              const parsed = stored ? JSON.parse(stored) : null;
              if (parsed?.role === 'admin') {
                router.push(redirectPath.startsWith('/admin') ? redirectPath : '/admin');
              } else {
                router.push(redirectPath.startsWith('/admin') ? '/account' : redirectPath);
              }
            } catch {
              router.push('/account');
            }
          }, 60);
        } else {
          setError(res.message || 'Authentication failed. Please check your credentials.');
        }
      }
    } catch {
      setError('An error occurred during authentication. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setError('Please enter the 6-digit OTP verification code.');
      return;
    }
    setIsVerifyingOtp(true);
    setError('');
    sound.playClick();

    try {
      const res = await verifyOtpCode(otpCode.trim());
      if (res.success) {
        sound.playSuccess();
        setSuccessMsg('Account verified successfully! Redirecting...');
        setTimeout(() => {
          router.push(redirectPath === '/admin' ? '/account' : redirectPath);
        }, 500);
      } else {
        setError(res.message || 'Invalid verification code. Please check and try again.');
      }
    } catch {
      setError('Verification check failed. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    sound.playClick();
    const target = otpTarget || phone || email;
    const channel = target.includes('@') ? 'email' : 'phone';
    const res = await sendOtp(target, channel);
    if (res.success) {
      setDemoCodeHint(res.otp);
      setSuccessMsg(`New OTP sent to ${target}. (Code: ${res.otp})`);
      sound.playNotification();
    } else {
      setError(res.message);
    }
  };

  const fillQuickDemo = (demoType: 'admin' | 'customer') => {
    sound.playClick();
    if (demoType === 'admin') {
      setEmail('admin@ceylontimes.lk');
      setPassword('admin123');
    } else {
      setEmail('patron@ceylontimes.lk');
      setPassword('patron123');
    }
  };

  // Color Tokens
  const pageBg = isLight ? '#F8FAFC' : '#0F172A';
  const cardBg = isLight ? '#FFFFFF' : '#1E293B';
  const borderColor = isLight ? '#E2E8F0' : '#334155';
  const textPrimary = isLight ? '#0F172A' : '#F8FAFC';
  const textMuted = isLight ? '#64748B' : '#94A3B8';
  const inputBg = isLight ? '#F8FAFC' : 'rgba(15,23,42,0.6)';

  return (
    <div style={{ background: pageBg, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        siteName={defaultSiteSettings.site_name}
        announcementText={defaultSiteSettings.announcement_bar_text}
      />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          {/* Card Container */}
          <div style={{
            background: cardBg,
            border: `1px solid ${borderColor}`,
            borderRadius: 24,
            padding: '36px 32px',
            boxShadow: isLight
              ? '0 20px 40px -15px rgba(0,0,0,0.06), 0 0 1px 1px rgba(0,0,0,0.02)'
              : '0 20px 40px -15px rgba(0,0,0,0.5)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Top Accent Strip */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 4,
              background: 'linear-gradient(90deg, #2563EB, #3B82F6, #60A5FA)',
            }} />

            {/* Brand Header */}
            <div style={{ textAlign: 'center', marginBottom: 26 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={isLight ? '/logo-black.png' : '/logo-white.png'}
                alt="Ceylon Times"
                style={{ height: 52, width: 'auto', maxWidth: 180, objectFit: 'contain', margin: '0 auto 14px', display: 'block' }}
              />
              <h1 style={{
                fontSize: 22, fontWeight: 700, color: textPrimary,
                fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em', margin: 0,
              }}>
                {otpStep
                  ? 'Verify Your Account'
                  : mode === 'signin'
                  ? 'Sign in to Ceylon Times'
                  : 'Create Your Account'}
              </h1>
              <p style={{ fontSize: 13, color: textMuted, marginTop: 6, lineHeight: 1.4 }}>
                {otpStep
                  ? `Enter the 6-digit verification code sent to ${otpTarget}.`
                  : mode === 'signin'
                  ? 'Access your customer account, order history, and support.'
                  : 'Register for island-wide delivery and secure verified shopping.'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            {!otpStep && (
              <div style={{
                display: 'flex',
                background: isLight ? '#F1F5F9' : '#0F172A',
                padding: 4,
                borderRadius: 12,
                marginBottom: 24,
                border: `1px solid ${borderColor}`,
              }}>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setMode('signin');
                    setError('');
                    setSuccessMsg('');
                  }}
                  style={{
                    flex: 1, padding: '8px 12px', fontSize: 13, fontWeight: 600,
                    borderRadius: 9, border: 'none', cursor: 'pointer',
                    background: mode === 'signin' ? cardBg : 'transparent',
                    color: mode === 'signin' ? '#2563EB' : textMuted,
                    boxShadow: mode === 'signin' ? (isLight ? '0 2px 6px rgba(0,0,0,0.06)' : '0 2px 6px rgba(0,0,0,0.4)') : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    setMode('signup');
                    setError('');
                    setSuccessMsg('');
                  }}
                  style={{
                    flex: 1, padding: '8px 12px', fontSize: 13, fontWeight: 600,
                    borderRadius: 9, border: 'none', cursor: 'pointer',
                    background: mode === 'signup' ? cardBg : 'transparent',
                    color: mode === 'signup' ? '#2563EB' : textMuted,
                    boxShadow: mode === 'signup' ? (isLight ? '0 2px 6px rgba(0,0,0,0.06)' : '0 2px 6px rgba(0,0,0,0.4)') : 'none',
                    transition: 'all 0.15s ease',
                  }}
                >
                  Create Account
                </button>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div style={{
                padding: '10px 14px', borderRadius: 10,
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                color: '#EF4444', fontSize: 12, marginBottom: 18,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontWeight: 'bold' }}>!</span>
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {successMsg && (
              <div style={{
                padding: '10px 14px', borderRadius: 10,
                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)',
                color: '#16A34A', fontSize: 12, marginBottom: 18,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
                <span>{successMsg}</span>
              </div>
            )}

            {otpStep ? (
              /* OTP Verification Form */
              <form onSubmit={handleOtpVerifySubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {demoCodeHint && (
                  <div style={{
                    padding: '10px 14px', borderRadius: 10,
                    background: isLight ? '#EFF6FF' : 'rgba(37,99,235,0.15)',
                    border: '1px solid rgba(37,99,235,0.25)',
                    fontSize: 12, color: '#2563EB',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  }}>
                    <span>Demo OTP Code: <strong style={{ fontFamily: 'monospace', fontSize: 14 }}>{demoCodeHint}</strong></span>
                    <button
                      type="button"
                      onClick={() => setOtpCode(demoCodeHint)}
                      style={{
                        background: '#2563EB', color: '#fff', border: 'none',
                        padding: '4px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Auto-Fill
                    </button>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: textPrimary, marginBottom: 6 }}>
                    6-Digit Verification Code
                  </label>
                  <div style={{ position: 'relative' }}>
                    <KeyRound size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: textMuted }} />
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="123456"
                      style={{
                        width: '100%', padding: '12px 14px 12px 42px',
                        fontSize: 18, fontFamily: 'monospace', letterSpacing: '0.25em',
                        textAlign: 'center', borderRadius: 12,
                        border: `1px solid ${borderColor}`,
                        background: inputBg, color: textPrimary, outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isVerifyingOtp || !otpCode.trim()}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 12,
                    background: '#2563EB', color: '#fff', border: 'none',
                    fontWeight: 600, fontSize: 14, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    opacity: isVerifyingOtp || !otpCode.trim() ? 0.7 : 1,
                    transition: 'all 0.15s ease',
                  }}
                >
                  {isVerifyingOtp ? <RefreshCw size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                  <span>{isVerifyingOtp ? 'Verifying Code…' : 'Activate Account'}</span>
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12 }}>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    style={{ background: 'none', border: 'none', color: '#2563EB', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                  >
                    Resend Code
                  </button>
                  <button
                    type="button"
                    onClick={() => { setOtpStep(false); setError(''); }}
                    style={{ background: 'none', border: 'none', color: textMuted, cursor: 'pointer', padding: 0 }}
                  >
                    Change Details
                  </button>
                </div>
              </form>
            ) : (
              /* Sign In / Sign Up Form */
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {mode === 'signup' && (
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: textPrimary, marginBottom: 6 }}>
                      Full Name
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: textMuted }} />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Sunil Perera"
                        style={{
                          width: '100%', padding: '10px 14px 10px 40px',
                          fontSize: 13, borderRadius: 12,
                          border: `1px solid ${borderColor}`,
                          background: inputBg, color: textPrimary, outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: textPrimary, marginBottom: 6 }}>
                    Email Address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: textMuted }} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      style={{
                        width: '100%', padding: '10px 14px 10px 40px',
                        fontSize: 13, borderRadius: 12,
                        border: `1px solid ${borderColor}`,
                        background: inputBg, color: textPrimary, outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {mode === 'signup' && (
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: textPrimary, marginBottom: 6 }}>
                      Phone Number (for COD &amp; Delivery Updates)
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: textMuted }} />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+94 77 123 4567"
                        style={{
                          width: '100%', padding: '10px 14px 10px 40px',
                          fontSize: 13, borderRadius: 12,
                          border: `1px solid ${borderColor}`,
                          background: inputBg, color: textPrimary, outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: textPrimary, marginBottom: 6 }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: textMuted }} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{
                        width: '100%', padding: '10px 40px 10px 40px',
                        fontSize: 13, borderRadius: 12,
                        border: `1px solid ${borderColor}`,
                        background: inputBg, color: textPrimary, outline: 'none',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', color: textMuted, cursor: 'pointer', padding: 2,
                      }}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {mode === 'signup' && (
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: textPrimary, marginBottom: 6 }}>
                      Confirm Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: textMuted }} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        style={{
                          width: '100%', padding: '10px 14px 10px 40px',
                          fontSize: 13, borderRadius: 12,
                          border: `1px solid ${borderColor}`,
                          background: inputBg, color: textPrimary, outline: 'none',
                        }}
                      />
                    </div>
                  </div>
                )}

                {mode === 'signup' && (
                  <div style={{ fontSize: 12, color: textMuted, padding: '4px 0' }}>
                    <span>Send verification code via: </span>
                    <label style={{ marginLeft: 8, cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="otpChannel"
                        checked={otpChannel === 'phone'}
                        onChange={() => setOtpChannel('phone')}
                        style={{ marginRight: 4 }}
                      />
                      Phone (SMS)
                    </label>
                    <label style={{ marginLeft: 14, cursor: 'pointer' }}>
                      <input
                        type="radio"
                        name="otpChannel"
                        checked={otpChannel === 'email'}
                        onChange={() => setOtpChannel('email')}
                        style={{ marginRight: 4 }}
                      />
                      Email
                    </label>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    width: '100%', padding: '12px 16px', borderRadius: 12,
                    background: '#2563EB', color: '#fff', border: 'none',
                    fontWeight: 600, fontSize: 14, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    marginTop: 6,
                    boxShadow: '0 4px 14px rgba(37,99,235,0.3)',
                    opacity: isSubmitting ? 0.7 : 1,
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{isSubmitting ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Proceed to Verification'}</span>
                  <ArrowRight size={15} />
                </button>
              </form>
            )}

            {/* Quick Demo Access Bar */}
            {!otpStep && mode === 'signin' && (
              <div style={{ marginTop: 22, paddingTop: 18, borderTop: `1px solid ${borderColor}` }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8, textAlign: 'center' }}>
                  Quick Demo Access
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => fillQuickDemo('customer')}
                    style={{
                      padding: '8px 10px', borderRadius: 9, fontSize: 11.5, fontWeight: 600,
                      border: `1px solid ${borderColor}`, background: isLight ? '#F8FAFC' : '#0F172A',
                      color: textPrimary, cursor: 'pointer', textAlign: 'center',
                    }}
                  >
                    Customer Demo
                  </button>
                  <button
                    type="button"
                    onClick={() => fillQuickDemo('admin')}
                    style={{
                      padding: '8px 10px', borderRadius: 9, fontSize: 11.5, fontWeight: 600,
                      border: `1px solid ${borderColor}`, background: isLight ? '#F8FAFC' : '#0F172A',
                      color: '#2563EB', cursor: 'pointer', textAlign: 'center',
                    }}
                  >
                    Admin Portal
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer siteName={defaultSiteSettings.site_name} />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #E2E8F0', borderTopColor: '#2563EB', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
