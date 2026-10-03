'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useCurrency } from '@/context/CurrencyContext';
import { sound } from '@/lib/sound';

/**
 * FloatingCartBar — fixed pill at the bottom of the screen when cart has items.
 * Inspired by the mobile app design reference.
 */
export default function FloatingCartBar() {
  const { openCart, itemCount, total } = useCart();
  const { formatPrice } = useCurrency();

  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.button
          key="floating-cart"
          initial={{ opacity: 0, y: 40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0,  scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          onClick={() => { sound.playClick(); openCart(); }}
          className="floating-cart-bar"
          aria-label={`View cart – ${itemCount} items`}
        >
          {/* Icon + Count Badge */}
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            <span
              className="absolute -top-2.5 -right-2.5 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold"
              style={{ background: '#FFFFFF', color: '#2563EB' }}
            >
              {itemCount}
            </span>
          </div>

          {/* Label */}
          <span className="flex-1 text-center">View your cart</span>

          {/* Price */}
          <span
            className="px-3 py-1 rounded-full text-sm font-bold"
            style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}
          >
            {formatPrice(total)}
          </span>

          <ArrowRight className="w-4 h-4 flex-shrink-0" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
