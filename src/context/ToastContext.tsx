'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 3500) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      setToasts((prev) => [...prev, { id, type, message, duration }]);
      setTimeout(() => {
        removeToast(id);
      }, duration);
    },
    [removeToast]
  );

  const success = useCallback((msg: string) => toast(msg, 'success'), [toast]);
  const error = useCallback((msg: string) => toast(msg, 'error'), [toast]);
  const info = useCallback((msg: string) => toast(msg, 'info'), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      <div className="fixed top-20 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="pointer-events-auto relative overflow-hidden bg-white text-primary border border-black/10 shadow-elevated p-4 flex items-start gap-3"
            >
              <div className="mt-0.5">
                {t.type === 'success' && <CheckCircle2 className="w-5 h-5 text-success" />}
                {t.type === 'error' && <AlertCircle className="w-5 h-5 text-destructive" />}
                {t.type === 'info' && <Info className="w-5 h-5 text-accent" />}
              </div>
              <div className="flex-1 pr-2">
                <p className="text-xs tracking-wide leading-relaxed font-medium">{t.message}</p>
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-primary-muted hover:text-primary transition-colors p-1"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
              {/* Shrinking progress bar */}
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: (t.duration || 3500) / 1000, ease: 'linear' }}
                className={`absolute bottom-0 left-0 h-0.5 ${
                  t.type === 'success'
                    ? 'bg-success'
                    : t.type === 'error'
                    ? 'bg-destructive'
                    : 'bg-accent'
                }`}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
