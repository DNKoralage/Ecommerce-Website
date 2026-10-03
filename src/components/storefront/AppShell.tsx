'use client';

import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { sound } from '@/lib/sound';
import { sendBrowserNotification } from '@/components/storefront/NotificationPrompt';

// Lazy-load to keep initial bundle small
const LandingAnimation    = dynamic(() => import('@/components/storefront/LandingAnimation'),    { ssr: false });
const NotificationPrompt  = dynamic(() => import('@/components/storefront/NotificationPrompt'),   { ssr: false });
const ChatBot             = dynamic(() => import('@/components/storefront/ChatBot'),              { ssr: false });

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const lastMoveRef = useRef<number>(0);

  // ── Cursor movement beep (throttled) ──────────────────────────────────────
  useEffect(() => {
    const MOVE_INTERVAL = 120; // ms between cursor beeps
    const handleMove = () => {
      const now = Date.now();
      if (now - lastMoveRef.current > MOVE_INTERVAL) {
        lastMoveRef.current = now;
        sound.playCursorBeep();
      }
    };
    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  // ── Dashboard update auto-notifications ────────────────────────────────────
  useEffect(() => {
    const handleAdminAlert = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.email_subject) {
        sendBrowserNotification(
          '🛒 New Order — Ceylon Times',
          `Booking #${detail.booking_id?.slice(0, 8).toUpperCase() ?? ''} received. Check your dashboard.`,
          '/favicon.ico'
        );
      }
    };

    const handleOrdersUpdated = () => {
      sendBrowserNotification(
        '📦 Orders Updated',
        'A new customer order has been placed. Open Admin Dashboard to review.',
        '/favicon.ico'
      );
    };

    window.addEventListener('ceylon_admin_alert', handleAdminAlert);
    window.addEventListener('orders_updated', handleOrdersUpdated);
    return () => {
      window.removeEventListener('ceylon_admin_alert', handleAdminAlert);
      window.removeEventListener('orders_updated', handleOrdersUpdated);
    };
  }, []);

  return (
    <>
      {/* Landing screen overlay */}
      <LandingAnimation />

      {/* Notification permission prompt */}
      <NotificationPrompt />

      {/* Chatbot FAB */}
      <ChatBot />

      {/* Page content */}
      {children}
    </>
  );
}
