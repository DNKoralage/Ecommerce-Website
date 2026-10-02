'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { Star, ShoppingBag, ArrowRight } from 'lucide-react';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addItem } = useCart();
  const { success } = useToast();
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});

  if (!product) return null;

  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }));
  };

  const handleAdd = (e: React.MouseEvent) => {
    addItem(product, 1, selectedOptions, e);
    success(`Added "${product.title}" to bag`);
    onClose();
  };

  return (
    <Modal isOpen={!!product} onClose={onClose} maxWidth="max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Product Image */}
        <div
          className="aspect-[3/4] overflow-hidden relative"
          style={{
            background: '#04060E',
            border: '1px solid rgba(255, 215, 0, 0.2)',
            clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images[0]?.image_url}
            alt={product.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center gap-1.5 mb-2 text-[#FFD700]">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-xs font-bold text-white tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                {product.rating || 5.0}
              </span>
              <span className="text-xs text-[#E8E3D8]/50" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                ({product.review_count || 14} patron reviews)
              </span>
            </div>

            <h3 className="font-serif text-2xl text-white mb-2 tracking-wide">
              {product.title}
            </h3>

            <div className="flex items-baseline gap-3 mb-4">
              <span
                className="text-xl font-bold text-[#FFD700]"
                style={{
                  fontFamily: 'var(--font-rajdhani)',
                  textShadow: '0 0 10px rgba(255,215,0,0.5)',
                }}
              >
                {formatPrice(product.sale_price ?? product.price)}
              </span>
              {product.sale_price && (
                <span className="text-sm text-[#E8E3D8]/40 line-through" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                  {formatPrice(product.price)}
                </span>
              )}
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#00FFFF]" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                LKR · Island Tax Included
              </span>
            </div>

            <p className="text-xs text-[#E8E3D8]/70 leading-relaxed mb-6 line-clamp-3">
              {product.description.replace(/<[^>]*>?/gm, '')}
            </p>

            {/* Options */}
            {product.options && product.options.length > 0 && (
              <div className="space-y-4 mb-6">
                {product.options.map((opt) => (
                  <div key={opt.id}>
                    <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#FFD700] block mb-2" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                      {opt.name}: <span className="font-normal text-white">{selectedOptions[opt.name] || 'Select'}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {opt.values?.map((val) => {
                        const isSelected = selectedOptions[opt.name] === val.value;
                        return (
                          <button
                            key={val.id}
                            type="button"
                            onClick={() => handleOptionSelect(opt.name, val.value)}
                            className="px-3 py-1.5 text-xs transition-all font-semibold cursor-pointer"
                            style={{
                              background: isSelected ? 'rgba(255, 215, 0, 0.25)' : 'rgba(8, 12, 28, 0.8)',
                              border: `1px solid ${isSelected ? '#FFD700' : 'rgba(255, 215, 0, 0.2)'}`,
                              color: isSelected ? '#FFFFFF' : '#E8E3D8',
                              boxShadow: isSelected ? '0 0 10px rgba(255, 215, 0, 0.4)' : 'none',
                              fontFamily: 'var(--font-rajdhani)',
                            }}
                          >
                            {val.value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3 pt-4 border-t border-yellow-500/15">
            <button
              onClick={handleAdd}
              className="w-full btn-neon-gold py-3.5 text-xs flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Acquire Creation • {formatPrice(product.sale_price ?? product.price)}</span>
            </button>

            <Link
              href={`/products/${product.slug}`}
              onClick={onClose}
              className="block text-center text-xs uppercase tracking-[0.15em] text-[#00FFFF] hover:text-white transition-colors py-1 flex items-center justify-center gap-1.5"
              style={{ fontFamily: 'var(--font-rajdhani)' }}
            >
              <span>Examine Full Atelier Dossier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
}
