'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { useCurrency } from '@/context/CurrencyContext';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import { Star, ShoppingBag, ArrowRight, ShieldCheck, Check, Truck } from 'lucide-react';
import { sound } from '@/lib/sound';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: QuickViewModalProps) {
  const { addItem } = useCart();
  const { success } = useToast();
  const { formatPrice } = useCurrency();
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});

  if (!product) return null;

  const handleOptionSelect = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }));
  };

  const handleAdd = (e: React.MouseEvent) => {
    sound.playAdd();
    addItem(product, 1, selectedOptions, e);
    success(`Added "${product.title}" to cart`);
    onClose();
  };

  const discountPercent =
    product.sale_price && product.price > product.sale_price
      ? Math.round(((product.price - product.sale_price) / product.price) * 100)
      : null;

  return (
    <Modal isOpen={!!product} onClose={onClose} maxWidth="max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-7 items-start">
        {/* Product Image */}
        <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-800">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images[0]?.image_url || '/placeholder.png'}
            alt={product.title}
            className="w-full h-full object-cover object-center"
          />

          {discountPercent && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              -{discountPercent}% OFF
            </span>
          )}

          {/* COD indicator pill */}
          <span className="absolute bottom-3 left-3 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm border border-emerald-500/20">
            <Truck className="w-3.5 h-3.5" /> Cash on Delivery
          </span>
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-between h-full">
          <div>
            {/* Category / Rating */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                {typeof product.category === 'object' && product.category ? (product.category as { name: string }).name : typeof product.category === 'string' ? product.category : 'Featured'}
              </span>
              <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{product.rating || 5.0}</span>
                <span className="text-gray-400">({product.review_count || 12})</span>
              </div>
            </div>

            <h3 className="font-heading text-2xl font-bold text-gray-900 dark:text-white mb-2 leading-tight">
              {product.title}
            </h3>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatPrice(product.sale_price ?? product.price)}
              </span>
              {product.sale_price && (
                <span className="text-sm text-gray-400 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
              <span className="badge badge-green">In Stock</span>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-5 line-clamp-3">
              {product.description.replace(/<[^>]*>?/gm, '')}
            </p>

            {/* Options */}
            {product.options && product.options.length > 0 && (
              <div className="space-y-3 mb-6">
                {product.options.map((opt) => (
                  <div key={opt.id}>
                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-1.5">
                      {opt.name}: <span className="font-semibold text-blue-600">{selectedOptions[opt.name] || 'Select'}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {opt.values?.map((val) => {
                        const isSelected = selectedOptions[opt.name] === val.value;
                        return (
                          <button
                            key={val.id}
                            type="button"
                            onClick={() => handleOptionSelect(opt.name, val.value)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all border ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                : 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-blue-400'
                            }`}
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

          <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleAdd}
              className="w-full btn-primary py-3 text-sm flex items-center justify-center gap-2 rounded-xl"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add to Cart • {formatPrice(product.sale_price ?? product.price)}</span>
            </button>

            <Link
              href={`/products/${product.slug}`}
              onClick={onClose}
              className="w-full btn-outline py-2.5 text-xs flex items-center justify-center gap-1.5 rounded-xl text-center"
            >
              <span>View Full Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
}
