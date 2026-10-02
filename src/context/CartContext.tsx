'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, Coupon } from '@/types';
import { api } from '@/lib/store';

interface FlyingItemState {
  x: number;
  y: number;
  imageUrl: string;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: Product, quantity?: number, selectedOptions?: { [key: string]: string }, clickEvent?: React.MouseEvent) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  subtotal: number;
  discountAmount: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  total: number;
  itemCount: number;
  flyingItem: FlyingItemState | null;
  clearFlyingItem: () => void;
  cartIconRef: React.RefObject<HTMLButtonElement> | null;
  setCartIconRef: (ref: React.RefObject<HTMLButtonElement>) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [flyingItem, setFlyingItem] = useState<FlyingItemState | null>(null);
  const [cartIconRef, setCartIconRefState] = useState<React.RefObject<HTMLButtonElement> | null>(null);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('luxe_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('luxe_cart', JSON.stringify(items));
    } catch (e) {
      console.error(e);
    }
  }, [items]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  const addItem = (
    product: Product,
    quantity: number = 1,
    selectedOptions: { [key: string]: string } = {},
    clickEvent?: React.MouseEvent
  ) => {
    const primaryImg = product.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80';
    
    // Trigger flying ghost image if event provided
    if (clickEvent) {
      const rect = (clickEvent.currentTarget as HTMLElement).getBoundingClientRect();
      setFlyingItem({
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
        imageUrl: primaryImg,
      });
    }

    const itemKey = `${product.id}-${JSON.stringify(selectedOptions)}`;
    const effectivePrice = product.sale_price ?? product.price;

    setItems((prev) => {
      const existing = prev.find((i) => i.id === itemKey);
      if (existing) {
        return prev.map((i) =>
          i.id === itemKey
            ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock_quantity || 99) }
            : i
        );
      }
      return [
        ...prev,
        {
          id: itemKey,
          product_id: product.id,
          title: product.title,
          slug: product.slug,
          price: effectivePrice,
          original_price: product.price,
          image: primaryImg,
          quantity: Math.min(quantity, product.stock_quantity || 99),
          variant_info: selectedOptions,
          max_stock: product.stock_quantity || 99,
        },
      ];
    });

    // Auto open drawer after brief moment
    setTimeout(() => {
      setIsOpen(true);
    }, 400);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.id === id) {
            const newQty = i.quantity + delta;
            if (newQty <= 0) return null;
            return { ...i, quantity: Math.min(newQty, i.max_stock) };
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
  };

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const discountAmount = appliedCoupon
    ? appliedCoupon.type === 'percentage'
      ? Math.round((subtotal * appliedCoupon.value) / 100)
      : Math.min(appliedCoupon.value, subtotal)
    : 0;

  const total = Math.max(0, subtotal - discountAmount);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  const applyCoupon = async (code: string) => {
    const res = await api.validateCoupon(code, subtotal);
    if (res.valid && res.coupon) {
      setAppliedCoupon(res.coupon);
      return { success: true, message: `Coupon ${res.coupon.code} applied!` };
    }
    return { success: false, message: res.message || 'Invalid coupon code' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const clearFlyingItem = () => setFlyingItem(null);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
        discountAmount,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        total,
        itemCount,
        flyingItem,
        clearFlyingItem,
        cartIconRef,
        setCartIconRef: setCartIconRefState,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
