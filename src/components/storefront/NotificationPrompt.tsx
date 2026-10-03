'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellOff, X } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { sound } from '@/lib/sound';

export default function NotificationPrompt() {
  const [show, setShow] = useState(false);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  useEffect(() => {
    // Only show if notifications are supported and not yet decided
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'default') return;

    const dismissed = sessionStorage.getItem('ct_notif_dismissed');
    if (dismissed) return;

    // Show prompt after 4 seconds
    const t = setTimeout(() => setShow(true), 4000);
    return () => clearTimeout(t);
  }, []);

  const handleAllow = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        sound.playNotification();
        new Notification('Ceylon Times', {
          body: 'You\'ll now receive order updates and dashboard alerts.',
          icon: '/favicon.ico',
        });
      }
    } catch (_e) {}
    dismiss();
  };

  const dismiss = () => {
    setShow(false);
    sessionStorage.setItem('ct_notif_dismissed', '1');
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          style={{
            position: 'fixed', bottom: 100, left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 8000, width: 'calc(100% - 32px)', maxWidth: 400,
            background: isLight ? '#FFFFFF' : '#1E293B',
            border: `1px solid ${isLight ? '#E2E8F0' : '#334155'}`,
            borderRadius: 18,
            boxShadow: isLight
              ? '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(37,99,235,0.08)'
              : '0 20px 60px rgba(0,0,0,0.5)',
            padding: '18px 20px',
          }}
        >
          <button
            onClick={dismiss}
            style={{
              position: 'absolute', top: 12, right: 12,
              background: 'none', border: 'none', cursor: 'pointer',
              color: isLight ? '#94A3B8' : '#64748B', padding: 4, borderRadius: 6,
            }}
          >
            <X size={15} />
          </button>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37,99,235,0.35)',
            }}>
              <Bell size={19} color="#fff" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 14, fontWeight: 700,
                color: isLight ? '#0F172A' : '#F1F5F9',
                marginBottom: 4, fontFamily: 'Outfit, sans-serif',
              }}>
                Enable Notifications
              </div>
              <div style={{ fontSize: 12, color: isLight ? '#64748B' : '#94A3B8', lineHeight: 1.5 }}>
                Get instant alerts for order updates and new dashboard activity from Ceylon Times.
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button
                  onClick={handleAllow}
                  style={{
                    flex: 1, padding: '8px 14px', borderRadius: 10,
                    background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
                    color: '#fff', border: 'none', cursor: 'pointer',
                    fontSize: 12, fontWeight: 700,
                    boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <Bell size={13} /> Allow Notifications
                </button>
                <button
                  onClick={dismiss}
                  style={{
                    padding: '8px 14px', borderRadius: 10,
                    background: isLight ? '#F1F5F9' : 'rgba(51,65,85,0.5)',
                    color: isLight ? '#64748B' : '#94A3B8',
                    border: `1px solid ${isLight ? '#E2E8F0' : '#334155'}`,
                    cursor: 'pointer', fontSize: 12, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <BellOff size={13} /> Not Now
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Programmatically send a browser push notification (after permission granted)
 */
export function sendBrowserNotification(title: string, body: string, icon = '/favicon.ico') {
  if (typeof window === 'undefined') return;
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body, icon });
    sound.playNotification();
  } catch (_e) {}
}
