'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type CurrencyCode = 'LKR' | 'USD';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  toggleCurrency: () => void;
  formatPrice: (amountInLkr: number) => string;
  convertFromLkr: (amountInLkr: number) => number;
  exchangeRate: number; // 1 USD in LKR
  isUSD: boolean;
}

const EXCHANGE_RATE_USD_TO_LKR = 300; // 1 USD ≈ 300 LKR

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CURRENCY_STORAGE_KEY = 'ceylon_currency_pref';

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  // Default to LKR as site base currency, or auto-detect international user
  const [currency, setCurrencyState] = useState<CurrencyCode>('LKR');
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    try {
      const saved = localStorage.getItem(CURRENCY_STORAGE_KEY) as CurrencyCode | null;
      if (saved === 'LKR' || saved === 'USD') {
        setCurrencyState(saved);
        return;
      }

      // Dynamic international user detection based on timezone & locale
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
      const isSriLanka = userTimeZone.includes('Colombo') || userTimeZone.includes('Sri_Lanka');
      
      if (!isSriLanka && userTimeZone !== '') {
        // Automatically default international users to USD
        setCurrencyState('USD');
        localStorage.setItem(CURRENCY_STORAGE_KEY, 'USD');
      } else {
        setCurrencyState('LKR');
        localStorage.setItem(CURRENCY_STORAGE_KEY, 'LKR');
      }
    } catch {
      // Fallback silently if localStorage or Intl unavailable
    }
  }, []);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, c);
      window.dispatchEvent(new CustomEvent('currency_changed', { detail: c }));
    } catch {}
  };

  const toggleCurrency = () => {
    setCurrency(currency === 'LKR' ? 'USD' : 'LKR');
  };

  const convertFromLkr = (amountInLkr: number): number => {
    if (currency === 'USD') {
      return Number((amountInLkr / EXCHANGE_RATE_USD_TO_LKR).toFixed(2));
    }
    return amountInLkr;
  };

  const formatPrice = (amountInLkr: number): string => {
    if (typeof amountInLkr !== 'number' || isNaN(amountInLkr)) {
      return currency === 'USD' ? '$0.00' : 'Rs. 0';
    }

    if (currency === 'USD') {
      const usdVal = amountInLkr / EXCHANGE_RATE_USD_TO_LKR;
      return `$${usdVal.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    }

    return `Rs. ${amountInLkr.toLocaleString('en-LK')}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency: hasMounted ? currency : 'LKR',
        setCurrency,
        toggleCurrency,
        formatPrice,
        convertFromLkr,
        exchangeRate: EXCHANGE_RATE_USD_TO_LKR,
        isUSD: currency === 'USD',
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    // Graceful fallback for non-context callers
    return {
      currency: 'LKR' as CurrencyCode,
      setCurrency: () => {},
      toggleCurrency: () => {},
      formatPrice: (amount: number) => `Rs. ${Number(amount || 0).toLocaleString('en-LK')}`,
      convertFromLkr: (amount: number) => amount,
      exchangeRate: 300,
      isUSD: false,
    };
  }
  return context;
}
