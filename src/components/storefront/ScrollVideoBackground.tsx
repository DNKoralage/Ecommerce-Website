'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';

export default function ScrollVideoBackground() {
  const { theme } = useTheme();
  const [scrollFraction, setScrollFraction] = useState(0);

  // Floating golden araliya / lotus petals
  const petals = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: i,
        left: `${(i * 8 + 5) % 94}%`,
        delay: i * 1.8,
        duration: 18 + (i % 4) * 4,
        size: 11 + (i % 3) * 5,
        rotateStart: (i * 45) % 360,
        opacity: 0.22 + (i % 3) * 0.1,
      })),
    []
  );

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const docHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
          const frac = Math.max(0, Math.min(1, scrollTop / docHeight));
          setScrollFraction(frac);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Smooth camera zoom: 1.0 at top to 1.30 at bottom of page
  const currentScale = 1.0 + scrollFraction * 0.30;
  // Subtle vertical parallax camera swoop
  const currentTranslateY = scrollFraction * -50;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {/* 1. Base Sky/Twilight Gradient Atmosphere */}
      <div
        className="absolute inset-0 transition-colors duration-700"
        style={{
          background:
            theme === 'light'
              ? 'linear-gradient(180deg, #F8F6F0 0%, #EDE7DC 50%, #F5F1E6 100%)'
              : 'linear-gradient(180deg, #040714 0%, #080E20 50%, #050816 100%)',
        }}
      />

      {/* 2. ONE Unified High-Resolution Sigiriya Aerial Fortress Animation */}
      <div
        className="absolute inset-0 will-change-transform transition-all duration-150 ease-out"
        style={{
          backgroundImage: 'url(/sigiriya.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 22%',
          backgroundRepeat: 'no-repeat',
          transform: `scale(${currentScale}) translateY(${currentTranslateY}px)`,
          transformOrigin: 'center 30%',
          opacity: theme === 'light' ? 0.22 : 0.42,
          filter:
            theme === 'light'
              ? 'contrast(1.08) brightness(1.08) saturate(1.1)'
              : 'contrast(1.22) brightness(0.72) saturate(1.25)',
          mixBlendMode: theme === 'light' ? 'multiply' : 'screen',
        }}
      />

      {/* 3. Subtle Animated Sunbeam / Cloud Sweep across Sigiriya */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 65% 50% at 50% 20%, rgba(255,215,0,0.18) 0%, transparent 70%)',
          transform: `translateY(${scrollFraction * 20}px)`,
          transition: 'transform 0.2s linear',
        }}
      />

      {/* 4. Cinematic Vignettes ensuring 100% Text & Product Contrast */}
      {theme === 'dark' ? (
        <>
          <div
            className="absolute inset-x-0 top-0 h-72 pointer-events-none"
            style={{
              background:
                'linear-gradient(to bottom, rgba(4,7,20,0.95) 0%, rgba(4,7,20,0.6) 60%, transparent 100%)',
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-96 pointer-events-none"
            style={{
              background:
                'linear-gradient(to top, rgba(4,7,20,0.98) 0%, rgba(4,7,20,0.65) 55%, transparent 100%)',
            }}
          />
          <div
            className="absolute inset-y-0 left-0 w-32 pointer-events-none"
            style={{
              background: 'linear-gradient(to right, rgba(4,7,20,0.45) 0%, transparent 100%)',
            }}
          />
          <div
            className="absolute inset-y-0 right-0 w-32 pointer-events-none"
            style={{
              background: 'linear-gradient(to left, rgba(4,7,20,0.45) 0%, transparent 100%)',
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(255,215,0,0.02) 0%, transparent 75%)',
            }}
          />
        </>
      ) : (
        <>
          <div
            className="absolute inset-x-0 top-0 h-56 pointer-events-none"
            style={{
              background:
                'linear-gradient(to bottom, rgba(248,246,240,0.96) 0%, rgba(248,246,240,0.65) 65%, transparent 100%)',
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-72 pointer-events-none"
            style={{
              background:
                'linear-gradient(to top, rgba(248,246,240,0.98) 0%, rgba(248,246,240,0.7) 60%, transparent 100%)',
            }}
          />
        </>
      )}

      {/* 5. Floating Golden Lotus & Araliya Petals */}
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          className="absolute top-[-50px]"
          style={{
            left: petal.left,
            width: petal.size,
            height: petal.size * 1.35,
            opacity: theme === 'light' ? petal.opacity * 0.7 : petal.opacity,
          }}
          animate={{
            y: ['0vh', '112vh'],
            x: [0, petal.id % 2 === 0 ? 25 : -25, 0],
            rotate: [petal.rotateStart, petal.rotateStart + 360],
          }}
          transition={{
            duration: petal.duration,
            repeat: Infinity,
            delay: petal.delay,
            ease: 'linear',
          }}
        >
          <svg
            viewBox="0 0 24 32"
            className="w-full h-full"
            style={{
              filter:
                theme === 'light'
                  ? 'drop-shadow(0 0 4px rgba(212,175,55,0.4))'
                  : 'drop-shadow(0 0 7px rgba(255,215,0,0.6))',
            }}
          >
            <path
              d="M12 0 C18 10, 24 20, 12 32 C0 20, 6 10, 12 0 Z"
              fill={theme === 'light' ? 'rgba(212,175,55,0.55)' : 'rgba(255,215,0,0.75)'}
            />
            <path d="M12 6 C14 12, 16 18, 12 28 C8 18, 10 12, 12 6 Z" fill="rgba(255,255,255,0.2)" />
          </svg>
        </motion.div>
      ))}

      {/* 6. Subtle Cyber-Heritage Ambient Grid Texture */}
      <div
        className="absolute inset-0 opacity-[0.018] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,215,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '90px 90px',
        }}
      />
    </div>
  );
}
