'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

export default function SriLankanAmbientBackground() {
  // Generate random drifting petals with deterministic values
  const petals = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => ({
      id: i,
      left: `${(i * 7 + 5) % 95}%`,
      delay: i * 1.8,
      duration: 18 + (i % 5) * 4,
      size: 10 + (i % 3) * 6,
      rotateStart: (i * 45) % 360,
      opacity: 0.25 + (i % 3) * 0.15,
    }));
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* 1. Base luminous rich twilight gradient (slightly brightened for clarity) */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #090D1A 0%, #0D1322 40%, #0A0E1A 100%)',
        }}
      />

      {/* 2. Watermarked Sri Lankan Cultural Heritage Artwork in Background */}
      <div
        className="absolute inset-0 opacity-[0.16] mix-blend-screen transition-opacity duration-1000"
        style={{
          backgroundImage: 'url(/sri-lanka-heritage.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 15%',
          backgroundRepeat: 'no-repeat',
          filter: 'contrast(1.15) saturate(1.2)',
        }}
      />

      {/* 3. Soft ambient radial spotlights for product prominence */}
      <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-[radial-gradient(circle,rgba(255,215,0,0.08)_0%,transparent_70%)]" />
      <div className="absolute top-1/3 right-10 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(0,255,255,0.06)_0%,transparent_70%)]" />
      <div className="absolute bottom-1/4 left-10 w-[600px] h-[600px] bg-[radial-gradient(circle,rgba(255,140,0,0.05)_0%,transparent_70%)]" />

      {/* 4. Traditional Sri Lankan Liya-wela / Lotus decorative filigree line at edges */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#FFD700]/40 to-transparent" />

      {/* 5. Smooth drifting golden lotus petals (non-distracting, serene) */}
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          className="absolute top-[-40px]"
          style={{
            left: petal.left,
            width: petal.size,
            height: petal.size * 1.3,
            opacity: petal.opacity,
          }}
          animate={{
            y: ['0vh', '110vh'],
            x: [0, (petal.id % 2 === 0 ? 30 : -30), 0],
            rotate: [petal.rotateStart, petal.rotateStart + 360],
          }}
          transition={{
            duration: petal.duration,
            repeat: Infinity,
            delay: petal.delay,
            ease: 'linear',
          }}
        >
          {/* Stylized Lotus/Araliya Petal SVG */}
          <svg viewBox="0 0 24 32" className="w-full h-full fill-current text-[#FFD700]/70 filter drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]">
            <path d="M12 0 C18 10, 24 20, 12 32 C0 20, 6 10, 12 0 Z" />
          </svg>
        </motion.div>
      ))}

      {/* 6. Soft vertical cyber-heritage scan glow */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 215, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.08) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }}
      />
    </div>
  );
}
