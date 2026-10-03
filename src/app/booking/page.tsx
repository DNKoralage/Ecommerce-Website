'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BookingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/products');
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0F172A',
      color: '#fff',
      fontFamily: 'Outfit, sans-serif',
      gap: 12,
    }}>
      <div style={{
        width: 38,
        height: 38,
        borderRadius: 10,
        background: 'linear-gradient(135deg, #2563EB, #3B82F6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontWeight: 800,
      }}>
        CT
      </div>
      <p style={{ fontSize: 14, color: '#94A3B8' }}>Redirecting to Ceylon Times Marketplace…</p>
    </div>
  );
}
