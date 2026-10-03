'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

export default function LandingAnimation() {
  const [visible, setVisible] = useState(false);
  const [done, setDone] = useState(false);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    // Only show once per browser session
    const shown = sessionStorage.getItem('ct_landing_shown');
    if (shown) {
      setDone(true);
      return;
    }
    setVisible(true);

    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => {
        setDone(true);
        sessionStorage.setItem('ct_landing_shown', '1');
      }, 700);
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  if (done) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="traditional-landing"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.65, ease: [0.33, 1, 0.68, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: isLight
              ? 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 50%, #F8FAFC 100%)'
              : 'linear-gradient(135deg, #090D16 0%, #0F172A 50%, #090D16 100%)',
            overflow: 'hidden',
          }}
        >
          {/* Subtle Ambient Radial Backlight */}
          <div
            style={{
              position: 'absolute',
              width: 600,
              height: 600,
              borderRadius: '50%',
              background: isLight
                ? 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, rgba(217,119,6,0.05) 50%, transparent 70%)'
                : 'radial-gradient(circle, rgba(37,99,235,0.2) 0%, rgba(217,119,6,0.08) 50%, transparent 70%)',
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }}
          />

          {/* Sri Lankan Traditional Lotus (Nelum Mala) Geometric Mandala Animation */}
          <motion.div
            initial={{ scale: 0.6, rotate: -45, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
            style={{
              position: 'relative',
              width: 220,
              height: 220,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}
          >
            {/* Outer Rotating Sacred Geometry Ring */}
            <motion.svg
              width="220"
              height="220"
              viewBox="0 0 200 200"
              animate={{ rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
              style={{ position: 'absolute', pointerEvents: 'none' }}
            >
              {/* Outer decorative ring */}
              <circle
                cx="100"
                cy="100"
                r="92"
                fill="none"
                stroke={isLight ? 'rgba(37,99,235,0.25)' : 'rgba(217,119,6,0.3)'}
                strokeWidth="1.5"
                strokeDasharray="4 6"
              />
              <circle
                cx="100"
                cy="100"
                r="84"
                fill="none"
                stroke={isLight ? 'rgba(217,119,6,0.3)' : 'rgba(255,215,0,0.2)'}
                strokeWidth="1"
              />

              {/* 12 Traditional Sri Lankan Lotus Petals */}
              {Array.from({ length: 12 }).map((_, index) => {
                const angle = (index * 360) / 12;
                return (
                  <g key={index} transform={`rotate(${angle} 100 100)`}>
                    <path
                      d="M 100 22 C 105 45, 114 62, 100 78 C 86 62, 95 45, 100 22 Z"
                      fill={isLight ? 'rgba(37,99,235,0.06)' : 'rgba(217,119,6,0.08)'}
                      stroke={isLight ? 'rgba(37,99,235,0.35)' : 'rgba(251,191,36,0.45)'}
                      strokeWidth="1.2"
                    />
                    <circle
                      cx="100"
                      cy="18"
                      r="2.5"
                      fill={isLight ? '#2563EB' : '#F59E0B'}
                    />
                  </g>
                );
              })}
            </motion.svg>

            {/* Inner Counter-Rotating Sandakada Pahana Accent Ring */}
            <motion.svg
              width="140"
              height="140"
              viewBox="0 0 140 140"
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              style={{ position: 'absolute', pointerEvents: 'none' }}
            >
              {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i * 360) / 8;
                return (
                  <g key={i} transform={`rotate(${angle} 70 70)`}>
                    <path
                      d="M 70 18 Q 78 35 70 48 Q 62 35 70 18 Z"
                      fill={isLight ? 'rgba(217,119,6,0.1)' : 'rgba(37,99,235,0.15)'}
                      stroke={isLight ? '#D97706' : '#60A5FA'}
                      strokeWidth="1"
                    />
                  </g>
                );
              })}
            </motion.svg>

            {/* Central Ceylon Times Logo Badge */}
            <motion.div
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.25, ease: [0.34, 1.56, 0.64, 1] }}
              style={{
                width: 120,
                height: 92,
                borderRadius: 22,
                background: isLight
                  ? 'rgba(255,255,255,0.95)'
                  : 'rgba(15,23,42,0.9)',
                border: `2px solid ${isLight ? 'rgba(37,99,235,0.2)' : 'rgba(251,191,36,0.4)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isLight
                  ? '0 16px 36px rgba(37,99,235,0.25), 0 0 0 6px rgba(37,99,235,0.08)'
                  : '0 16px 36px rgba(0,0,0,0.6), 0 0 0 6px rgba(37,99,235,0.15)',
                position: 'relative',
                zIndex: 2,
                padding: '10px 14px',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={isLight ? '/logo-black.png' : '/logo-white.png'}
                alt="Ceylon Times"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />

              {/* Shimmer sweep line */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 20,
                  background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.25) 50%, transparent 60%)',
                  pointerEvents: 'none',
                }}
              />
            </motion.div>
          </motion.div>

          {/* Ceylon Times Brand Name */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45 }}
            style={{ textAlign: 'center', zIndex: 2 }}
          >
            <h1
              style={{
                fontSize: 28,
                fontWeight: 800,
                color: isLight ? '#0F172A' : '#F8FAFC',
                fontFamily: 'Outfit, sans-serif',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              Ceylon Times
            </h1>
          </motion.div>

          {/* Traditional Sinhala Heritage Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.65 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginTop: 6,
              zIndex: 2,
            }}
          >
            <span style={{ height: 1, width: 24, background: '#D97706', opacity: 0.6 }} />
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                color: isLight ? '#2563EB' : '#93C5FD',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              ශ්‍රී ලංකා · Multi-Vendor Marketplace
            </span>
            <span style={{ height: 1, width: 24, background: '#D97706', opacity: 0.6 }} />
          </motion.div>

          {/* Authentic Island Quality Tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.85 }}
            style={{
              fontSize: 12,
              color: isLight ? '#64748B' : '#94A3B8',
              marginTop: 8,
              fontWeight: 500,
              zIndex: 2,
            }}
          >
            Curated Artisan Crafts · Gems · Textiles · Island Delivery
          </motion.div>

          {/* Traditional Gold & Sapphire Progress Loader Bar */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 3.5,
              background: isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)',
            }}
          >
            <motion.div
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, #2563EB 0%, #D97706 50%, #3B82F6 100%)',
                boxShadow: '0 0 12px rgba(37,99,235,0.5)',
              }}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2.6, ease: 'easeInOut' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
