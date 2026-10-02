'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Star, ShoppingBag, Eye, Sparkles } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { formatPrice, calculateDiscountPercentage } from '@/lib/utils';
import { api } from '@/lib/store';
import { sound } from '@/lib/sound';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addItem } = useCart();
  const { success } = useToast();
  const { language, t } = useLanguage();
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // 3D Perspective Tilt State
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });

  const primaryImage = product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80';
  const secondaryImage = product.images?.[1]?.image_url || primaryImage;

  const isSale = product.sale_price !== null && product.sale_price < product.price;
  const discountPct = isSale ? calculateDiscountPercentage(product.price, product.sale_price!) : 0;
  const isNew = product.tags?.includes('new-arrival');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // Natural subtle 3D tilt: max 6 degrees
    const rX = -((y - centerY) / centerY) * 6;
    const rY = ((x - centerX) / centerX) * 6;
    setRotateX(rX);
    setRotateY(rY);
    setGlarePos({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    sound.playChime();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    sound.playSuccess();
    addItem(product, 1, {}, e);
    const msg = language === 'si'
      ? `"${product.title}" මල්ලට එක් කරන ලදී`
      : `Added "${product.title}" to bag`;
    success(msg);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    sound.playClick();
    api.toggleWishlist(product.id);
    setIsWishlisted(!isWishlisted);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    sound.playClick();
    if (onQuickView) onQuickView(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      className="group relative flex flex-col will-change-transform product-card-root"
      style={{
        background:
          theme === 'light'
            ? 'linear-gradient(170deg, #FFFFFF 0%, #FAF8F2 100%)'
            : 'linear-gradient(170deg, rgba(14, 20, 38, 0.94) 0%, rgba(8, 12, 24, 0.98) 100%)',
        border:
          theme === 'light'
            ? isHovered
              ? '1px solid rgba(184, 134, 11, 0.85)'
              : '1px solid rgba(212, 175, 55, 0.4)'
            : isHovered
            ? '1px solid rgba(255, 215, 0, 0.5)'
            : '1px solid rgba(255, 215, 0, 0.2)',
        boxShadow:
          theme === 'light'
            ? isHovered
              ? '0 20px 40px rgba(0, 0, 0, 0.12), 0 0 25px rgba(212, 175, 55, 0.35)'
              : '0 8px 24px rgba(0, 0, 0, 0.08)'
            : isHovered
            ? '0 20px 40px rgba(0, 0, 0, 0.85), 0 0 30px rgba(255, 215, 0, 0.22), 0 0 10px rgba(0, 255, 255, 0.15)'
            : '0 6px 24px rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
        transform: isHovered
          ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)',
        transition: isHovered ? 'transform 0.1s ease-out, box-shadow 0.3s ease, border-color 0.3s ease' : 'transform 0.4s ease-out, box-shadow 0.4s ease, border-color 0.4s ease',
      }}
    >
      {/* Dynamic 3D Specular Glare / Sheen Overlay */}
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 280px at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.16) 0%, rgba(0, 255, 255, 0.04) 40%, transparent 80%)`,
          }}
        />
      )}

      {/* Cyber-Heritage Corner Accents */}
      <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l border-[#FFD700]/70 pointer-events-none z-20" />
      <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r border-[#00FFFF]/70 pointer-events-none z-20" />

      {/* Product Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#070B16]">
        <Link
          href={`/products/${product.slug}`}
          onClick={() => sound.playClick()}
          className="block w-full h-full"
        >
          {/* Primary Product Photo */}
          <motion.img
            src={primaryImage}
            alt={product.title}
            className="w-full h-full object-cover object-center absolute inset-0"
            animate={{
              scale: isHovered ? 1.07 : 1,
              opacity: isHovered && secondaryImage !== primaryImage ? 0 : 1,
            }}
            transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          />

          {/* Secondary Lifestyle Photo */}
          {secondaryImage !== primaryImage && (
            <motion.img
              src={secondaryImage}
              alt={`${product.title} alternative view`}
              className="w-full h-full object-cover object-center absolute inset-0"
              animate={{
                scale: isHovered ? 1.07 : 1,
                opacity: isHovered ? 1 : 0,
              }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            />
          )}

          {/* Luminous Contrast Vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#080C1A] via-transparent to-black/25 opacity-75 group-hover:opacity-40 transition-opacity pointer-events-none" />
        </Link>

        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
          {isNew && (
            <span
              className="px-2.5 py-0.5 text-[9px] font-bold tracking-[0.16em] uppercase text-[#060A16] flex items-center gap-1"
              style={{
                background: 'linear-gradient(135deg, #00FFFF, #00B4D8)',
                boxShadow: '0 0 12px rgba(0,255,255,0.7)',
                fontFamily: 'var(--font-rajdhani)',
              }}
            >
              <Sparkles className="w-2.5 h-2.5 text-[#060A16]" />
              <span>{t('ceylonNew')}</span>
            </span>
          )}
          {isSale && (
            <span
              className="px-2.5 py-0.5 text-[9px] font-bold tracking-[0.16em] uppercase text-white"
              style={{
                background: 'linear-gradient(135deg, #FF2D55, #E60039)',
                boxShadow: '0 0 12px rgba(255,45,85,0.7)',
                fontFamily: 'var(--font-rajdhani)',
              }}
            >
              -{discountPct}%
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <motion.button
          whileTap={{ scale: 0.82 }}
          onClick={handleWishlistToggle}
          aria-label="Wishlist"
          className="absolute top-3 right-3 p-2 rounded-sm backdrop-blur-md transition-all z-20 cursor-pointer"
          style={{
            background: 'rgba(6,10,22,0.85)',
            border: '1px solid rgba(255,215,0,0.35)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.6)',
          }}
        >
          <Heart
            className={`w-3.5 h-3.5 transition-colors ${
              isWishlisted ? 'fill-[#FF2D55] text-[#FF2D55]' : 'text-[#E8E3D8]/80 hover:text-[#FFD700]'
            }`}
          />
        </motion.button>

        {/* Quick View Button */}
        {onQuickView && (
          <motion.button
            onClick={handleQuickViewClick}
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-11 right-3 p-2 rounded-sm backdrop-blur-md transition-all z-20 cursor-pointer"
            style={{
              background: 'rgba(6,10,22,0.85)',
              border: '1px solid rgba(0,255,255,0.4)',
              boxShadow: '0 0 10px rgba(0,255,255,0.3)',
            }}
            title="Quick View"
          >
            <Eye className="w-3.5 h-3.5 text-[#00FFFF]" />
          </motion.button>
        )}

        {/* Quick Add Slide-up Neon Button */}
        <motion.div
          initial={{ y: 25, opacity: 0 }}
          animate={{ y: isHovered ? 0 : 25, opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute bottom-3 inset-x-3 z-20"
        >
          <button
            onClick={handleQuickAdd}
            className="w-full py-2.5 px-3 flex items-center justify-center gap-2 cursor-pointer transition-all duration-300 font-bold uppercase tracking-[0.15em] text-[11px]"
            style={{
              background: 'linear-gradient(135deg, rgba(255,215,0,0.3) 0%, rgba(255,140,0,0.2) 100%)',
              border: '1px solid #FFD700',
              color: '#FFD700',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 0 20px rgba(255,215,0,0.45), inset 0 0 10px rgba(255,215,0,0.15)',
              fontFamily: 'var(--font-rajdhani)',
              clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,215,0,0.6) 0%, rgba(255,140,0,0.4) 100%)';
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.boxShadow = '0 0 30px rgba(255,215,0,0.8)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,215,0,0.3) 0%, rgba(255,140,0,0.2) 100%)';
              e.currentTarget.style.color = '#FFD700';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(255,215,0,0.45), inset 0 0 10px rgba(255,215,0,0.15)';
            }}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className={language === 'si' ? 'font-sinhala text-xs' : ''}>
              {t('acquirePiece')}
            </span>
          </button>
        </motion.div>
      </div>

      {/* Product Details Section */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <div className="flex items-center text-[#FFD700]">
              <Star className="w-3 h-3 fill-current" />
            </div>
            <span className="text-[10px] font-bold text-[#FFD700]/80 tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>
              {product.rating || 5.0} ({product.review_count || 14})
            </span>
          </div>

          {/* Title */}
          <Link
            href={`/products/${product.slug}`}
            onClick={() => sound.playClick()}
          >
            <h3
              className={`text-sm transition-colors line-clamp-1 leading-snug tracking-wide ${
                language === 'si' ? 'font-sinhala font-bold' : 'font-serif'
              }`}
              style={{
                color: theme === 'light' ? (isHovered ? '#B8860B' : '#0F172A') : (isHovered ? '#FFD700' : '#E8E3D8'),
              }}
            >
              {t(product.title)}
            </h3>
          </Link>
        </div>

        {/* Pricing in Sri Lankan Rupees (LKR) */}
        <div
          className="mt-3 pt-2.5 border-t flex items-baseline justify-between"
          style={{
            borderColor: theme === 'light' ? 'rgba(212, 175, 55, 0.25)' : 'rgba(255, 215, 0, 0.15)',
          }}
        >
          <div className="flex items-baseline gap-2">
            <span
              className="text-sm font-bold tracking-tight"
              style={{
                fontFamily: 'var(--font-rajdhani)',
                color: theme === 'light' ? '#B8860B' : '#FFD700',
                textShadow: theme === 'light' ? 'none' : '0 0 10px rgba(255,215,0,0.4)',
              }}
            >
              {formatPrice(product.sale_price ?? product.price)}
            </span>
            {isSale && (
              <span
                className="text-xs line-through"
                style={{
                  fontFamily: 'var(--font-rajdhani)',
                  color: theme === 'light' ? '#94A3B8' : 'rgba(232, 227, 216, 0.45)',
                }}
              >
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          <span
            className="text-[9px] uppercase tracking-[0.16em] font-bold"
            style={{
              fontFamily: 'var(--font-rajdhani)',
              color: theme === 'light' ? '#0284C7' : 'rgba(0, 255, 255, 0.85)',
            }}
          >
            LKR
          </span>
        </div>
      </div>
    </motion.div>
  );
};
