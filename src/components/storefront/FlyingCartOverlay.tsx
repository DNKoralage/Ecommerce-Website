'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';

export default function FlyingCartOverlay() {
  const { flyingItem, clearFlyingItem, cartIconRef } = useCart();
  const [targetPos, setTargetPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (flyingItem && cartIconRef?.current) {
      const rect = cartIconRef.current.getBoundingClientRect();
      setTargetPos({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      });
    } else if (flyingItem) {
      // Default to top right if ref not yet attached
      setTargetPos({
        x: typeof window !== 'undefined' ? window.innerWidth - 60 : 1200,
        y: 40,
      });
    }

    if (flyingItem) {
      const timer = setTimeout(() => {
        clearFlyingItem();
      }, 900);
      return () => clearTimeout(timer);
    }
  }, [flyingItem, cartIconRef, clearFlyingItem]);

  return (
    <AnimatePresence>
      {flyingItem && (
        <motion.div
          key="flying-cart-ghost"
          initial={{
            position: 'fixed',
            left: flyingItem.x - 36,
            top: flyingItem.y - 36,
            width: 72,
            height: 72,
            borderRadius: 16,
            scale: 1,
            opacity: 1,
            zIndex: 9999,
            pointerEvents: 'none',
          }}
          animate={{
            left: targetPos.x - 16,
            top: targetPos.y - 16,
            width: 32,
            height: 32,
            scale: 0.3,
            rotate: 15,
            opacity: 0,
          }}
          transition={{
            duration: 0.75,
            ease: [0.2, 0.8, 0.2, 1],
          }}
          onAnimationComplete={clearFlyingItem}
          className="shadow-2xl overflow-hidden border border-black/10 bg-white"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={flyingItem.imageUrl}
            alt="Product preview"
            className="w-full h-full object-cover"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
