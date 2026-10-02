'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface TrailPoint {
  x: number;
  y: number;
  id: number;
  alpha: number;
}

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [trail, setTrail] = useState<TrailPoint[]>([]);
  const trailIdRef = useRef(0);
  const lastPosRef = useRef({ x: -100, y: -100 });
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    // Only enable on non-touch devices with precision pointer
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    if (isTouch) return;

    const onMouseMove = (e: MouseEvent) => {
      const { clientX: x, clientY: y } = e;
      setMousePosition({ x, y });
      if (!isVisible) setIsVisible(true);

      // Check distance from last point before spawning trail particle
      const dx = x - lastPosRef.current.x;
      const dy = y - lastPosRef.current.y;
      const dist = Math.hypot(dx, dy);

      if (dist > 8) {
        lastPosRef.current = { x, y };
        trailIdRef.current += 1;
        setTrail((prev) => [
          ...prev.slice(-6),
          { x, y, id: trailIdRef.current, alpha: 1 },
        ]);
      }

      // Check if hovering over clickable/interactive element
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = target.closest(
          'a, button, input, select, textarea, [role="button"], .product-card, .btn-neon-gold, .btn-neon-cyan, .btn-neon-outline, [data-interactive="true"]'
        );
        setIsHovered(!!isInteractive);
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);
    document.addEventListener('mouseenter', onMouseEnter);

    // Fade out trail points smoothly
    const fadeTrail = () => {
      setTrail((prev) => {
        if (prev.length === 0) return prev;
        const updated = prev
          .map((p) => ({ ...p, alpha: p.alpha - 0.08 }))
          .filter((p) => p.alpha > 0.05);
        return updated;
      });
      animFrameRef.current = requestAnimationFrame(fadeTrail);
    };

    animFrameRef.current = requestAnimationFrame(fadeTrail);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      document.removeEventListener('mouseenter', onMouseEnter);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="hidden lg:block pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* 1. Reactive Stardust Trail Behind Cursor */}
      {trail.map((point, index) => {
        const size = Math.max(2, 6 - index * 0.6);
        return (
          <div
            key={point.id}
            className="fixed top-0 left-0 rounded-full pointer-events-none will-change-transform"
            style={{
              transform: `translate3d(${point.x - size / 2}px, ${point.y - size / 2}px, 0)`,
              width: size,
              height: size,
              opacity: point.alpha * 0.6,
              background: index % 2 === 0 ? '#00FFFF' : '#FFD700',
              boxShadow:
                index % 2 === 0
                  ? '0 0 8px rgba(0,255,255,0.8)'
                  : '0 0 8px rgba(255,215,0,0.8)',
              transition: 'opacity 0.15s ease-out',
            }}
          />
        );
      })}

      {/* 2. Outer Trailing Neon Halo */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none will-change-transform"
        animate={{
          x: mousePosition.x - (isHovered ? 26 : isClicking ? 14 : 18),
          y: mousePosition.y - (isHovered ? 26 : isClicking ? 14 : 18),
          width: isHovered ? 52 : isClicking ? 28 : 36,
          height: isHovered ? 52 : isClicking ? 28 : 36,
          borderColor: isHovered
            ? 'rgba(0, 255, 255, 0.9)'
            : 'rgba(255, 215, 0, 0.65)',
          backgroundColor: isHovered
            ? 'rgba(0, 255, 255, 0.1)'
            : 'rgba(255, 215, 0, 0.04)',
          boxShadow: isHovered
            ? '0 0 24px rgba(0, 255, 255, 0.6), inset 0 0 12px rgba(0, 255, 255, 0.25)'
            : '0 0 14px rgba(255, 215, 0, 0.4)',
        }}
        transition={{
          type: 'spring',
          damping: 26,
          stiffness: 380,
          mass: 0.35,
        }}
        style={{
          borderWidth: 1.5,
          borderStyle: 'solid',
        }}
      />

      {/* 3. Center Sharp Neon Cursor Dot */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none will-change-transform"
        animate={{
          x: mousePosition.x - (isClicking ? 2 : 3),
          y: mousePosition.y - (isClicking ? 2 : 3),
          scale: isClicking ? 0.75 : isHovered ? 1.6 : 1,
          backgroundColor: isHovered ? '#00FFFF' : '#FFD700',
          boxShadow: isHovered
            ? '0 0 12px #00FFFF, 0 0 24px #00FFFF'
            : '0 0 10px #FFD700, 0 0 18px #FF8C00',
        }}
        transition={{
          type: 'spring',
          damping: 32,
          stiffness: 850,
        }}
        style={{
          width: 6,
          height: 6,
        }}
      />
    </div>
  );
}
