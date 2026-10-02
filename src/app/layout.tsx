import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { SiteCustomizationProvider } from '@/context/SiteCustomizationContext';
import CartDrawer from '@/components/storefront/CartDrawer';
import FlyingCartOverlay from '@/components/storefront/FlyingCartOverlay';
import CustomCursor from '@/components/ui/CustomCursor';
import ScrollVideoBackground from '@/components/storefront/ScrollVideoBackground';

export const metadata: Metadata = {
  title: 'Ceylon Times | Sovereign Sri Lankan Living Heritage & Cyberpunk Atelier (ceylon-times.lk)',
  description:
    'Ceylon Times (ceylon-times.lk) — Authentic Sri Lankan living heritage and craftsmanship. Certified Ceylon sapphires, royal Kandyan handlooms, sacred temple brass arts, and single-estate Nuwara Eliya tea reserves.',
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'Ceylon Times | Authentic Sri Lankan Living Heritage (ceylon-times.lk)',
    description:
      'Curated collection of certified Ceylon sapphires, Kandyan silk handlooms, and sacred temple living artifacts.',
    url: 'https://ceylontimes.lk',
    siteName: 'Ceylon Times',
    locale: 'en_LK',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth dark">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
      </head>
      <body className="antialiased min-h-screen relative selection:bg-[#FFD700]/30 selection:text-[#FFD700]">
        <ThemeProvider>
          <LanguageProvider>
            <AuthProvider>
              <CartProvider>
                <ToastProvider>
                  <SiteCustomizationProvider>
                    <ScrollVideoBackground />
                    <div className="relative z-10 flex flex-col min-h-screen">
                      {children}
                    </div>
                    <CartDrawer />
                    <FlyingCartOverlay />
                    <CustomCursor />
                  </SiteCustomizationProvider>
                </ToastProvider>
              </CartProvider>
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
