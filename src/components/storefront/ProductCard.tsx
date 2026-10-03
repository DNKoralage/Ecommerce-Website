'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, Star, ShoppingCart, Eye, Package, Zap } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { useCurrency } from '@/context/CurrencyContext';
import { calculateDiscountPercentage } from '@/lib/utils';
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
  const { formatPrice } = useCurrency();
  const [isHovered, setIsHovered] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const isLight = theme === 'light';

  const primaryImage   = product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80';
  const secondaryImage = product.images?.[1]?.image_url || primaryImage;

  const isSale       = product.sale_price !== null && product.sale_price < product.price;
  const discountPct  = isSale ? calculateDiscountPercentage(product.price, product.sale_price!) : 0;
  const isNew        = product.tags?.includes('new-arrival');
  const stockQty     = product.stock_quantity ?? 0;
  const isLowStock   = stockQty > 0 && stockQty <= 10;
  const isOutOfStock = stockQty === 0;

  const rating      = product.rating ?? 4.5;
  const reviewCount = product.review_count ?? 0;

  /* colour tokens */
  const bg      = isLight ? '#FFFFFF' : '#1E293B';
  const border  = isLight ? '#E2E8F0' : 'rgba(51,65,85,0.7)';
  const txtMain = isLight ? '#0F172A' : '#F1F5F9';
  const txtMute = isLight ? '#64748B' : '#94A3B8';

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    sound.playSuccess();
    setIsAdding(true);
    addItem(product, 1, {}, e);
    success(`"${product.title}" added to cart`);
    setTimeout(() => setIsAdding(false), 1000);
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
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
      onMouseEnter={() => { setIsHovered(true); sound.playChime(); }}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col product-card-modern cursor-pointer"
    >
      {/* Product Image */}
      <div className="relative overflow-hidden" style={{ borderRadius: '20px 20px 0 0', aspectRatio: '1/1', background: isLight ? '#F8FAFC' : '#162032' }}>
        <Link href={`/products/${product.slug}`} onClick={() => sound.playClick()} className="block w-full h-full">
          {/* Primary Image */}
          <img
            src={primaryImage}
            alt={product.title}
            className="w-full h-full object-cover object-center absolute inset-0 transition-all duration-500"
            style={{
              transform: isHovered ? 'scale(1.06)' : 'scale(1)',
              opacity: (isHovered && secondaryImage !== primaryImage) ? 0 : 1,
            }}
          />

          {/* Secondary Image */}
          {secondaryImage !== primaryImage && (
            <img
              src={secondaryImage}
              alt={`${product.title} view 2`}
              className="w-full h-full object-cover object-center absolute inset-0 transition-all duration-500"
              style={{
                transform: isHovered ? 'scale(1.06)' : 'scale(1)',
                opacity: isHovered ? 1 : 0,
              }}
            />
          )}
        </Link>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none z-10">
          {isNew && (
            <span
              className="px-2.5 py-0.5 text-[10px] font-bold rounded-full text-white"
              style={{ background: '#2563EB' }}
            >
              NEW
            </span>
          )}
          {isSale && (
            <span
              className="px-2.5 py-0.5 text-[10px] font-bold rounded-full text-white"
              style={{ background: '#EF4444' }}
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
          className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all z-20"
          style={{
            background: isWishlisted ? '#FFF1F2' : (isLight ? 'rgba(255,255,255,0.95)' : 'rgba(30,41,59,0.9)'),
            border: `1px solid ${isWishlisted ? '#FECDD3' : border}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}
        >
          <Heart
            className="w-4 h-4 transition-colors"
            style={{
              color: isWishlisted ? '#EF4444' : txtMute,
              fill: isWishlisted ? '#EF4444' : 'none',
            }}
          />
        </motion.button>

        {/* Quick View — visible on hover */}
        {onQuickView && (
          <motion.button
            onClick={handleQuickViewClick}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 6 }}
            transition={{ duration: 0.2 }}
            className="absolute top-14 right-3 w-9 h-9 rounded-full flex items-center justify-center z-20"
            style={{
              background: isLight ? 'rgba(255,255,255,0.95)' : 'rgba(30,41,59,0.9)',
              border: `1px solid ${border}`,
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            }}
            title="Quick View"
          >
            <Eye className="w-4 h-4" style={{ color: '#2563EB' }} />
          </motion.button>
        )}

        {/* Add to Cart Slide-up */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: isHovered && !isOutOfStock ? 0 : 20, opacity: isHovered && !isOutOfStock ? 1 : 0 }}
          transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
          className="absolute bottom-3 inset-x-3 z-20"
        >
          <button
            onClick={handleQuickAdd}
            disabled={isAdding}
            className="w-full py-2.5 flex items-center justify-center gap-2 font-semibold text-sm text-white rounded-xl transition-all"
            style={{
              background: isAdding ? '#1D4ED8' : '#2563EB',
              boxShadow: '0 4px 14px rgba(37,99,235,0.45)',
            }}
          >
            <ShoppingCart className="w-4 h-4" />
            {isAdding ? 'Added!' : 'Add to Cart'}
          </button>
        </motion.div>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(2px)' }}
          >
            <span className="px-3 py-1.5 text-xs font-semibold rounded-full bg-white text-gray-500 border border-gray-200 shadow-sm">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div
        className="p-4 flex flex-col flex-1"
        style={{
          background: bg,
          borderTop: `1px solid ${border}`,
        }}
      >
        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-2">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className="w-3 h-3"
                style={{
                  fill: i < Math.floor(rating) ? '#F59E0B' : 'none',
                  color: i < Math.floor(rating) ? '#F59E0B' : '#CBD5E1',
                }}
              />
            ))}
          </div>
          <span className="text-[11px] font-medium" style={{ color: txtMute }}>
            {rating.toFixed(1)}
            {reviewCount > 0 && (
              <span style={{ color: txtMute }}> ({reviewCount})</span>
            )}
          </span>
        </div>

        {/* Vendor badge if available */}
        {(product as any).vendor_name && (
          <span className="vendor-badge mb-1.5">{(product as any).vendor_name}</span>
        )}

        {/* Title */}
        <Link href={`/products/${product.slug}`} onClick={() => sound.playClick()}>
          <h3
            className="text-sm font-semibold leading-snug mb-2 line-clamp-2 transition-colors"
            style={{ color: txtMain, fontFamily: 'var(--font-inter)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#2563EB'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = txtMain; }}
          >
            {t(product.title)}
          </h3>
        </Link>

        {/* Stock indicator */}
        <div className={`stock-pill mb-3 ${isLowStock ? 'low' : isOutOfStock ? 'out' : ''}`}>
          <span
            className="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0"
            style={{
              background: isOutOfStock ? '#EF4444' : isLowStock ? '#F59E0B' : '#10B981',
            }}
          />
          {isOutOfStock
            ? 'Out of stock'
            : isLowStock
            ? `${stockQty} left`
            : 'In stock'}
        </div>

        {/* Price Row */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-baseline gap-2">
            <span
              className="text-base font-bold"
              style={{ color: isSale ? '#EF4444' : (isLight ? '#0F172A' : '#F1F5F9') }}
            >
              {formatPrice(product.sale_price ?? product.price)}
            </span>
            {isSale && (
              <span
                className="text-xs line-through"
                style={{ color: txtMute }}
              >
                {formatPrice(product.price)}
              </span>
            )}
          </div>
          {/* COD pill */}
          <span
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{
              background: isLight ? '#F0FDF4' : 'rgba(16,185,129,0.12)',
              color: '#059669',
            }}
          >
            COD
          </span>
        </div>
      </div>
    </motion.div>
  );
};
