import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { CurrencyProvider } from '@/context/CurrencyContext';
import { SiteCustomizationProvider } from '@/context/SiteCustomizationContext';
import CartDrawer from '@/components/storefront/CartDrawer';
import FloatingCartBar from '@/components/storefront/FloatingCartBar';
import AppShell from '@/components/storefront/AppShell';

export const metadata: Metadata = {
  title: 'Ceylon Times | Multi-Vendor Marketplace — Premium Products & Artisan Crafts',
  description:
    'Ceylon Times — Discover thousands of curated products from verified vendors across Sri Lanka. Cash on delivery, fast shipping, and trusted sellers.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'Ceylon Times | Multi-Vendor Marketplace',
    description: 'Shop from hundreds of verified Sri Lankan vendors. COD available. Wide selection of artisan crafts, jewellery, textiles, and more.',
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
    <html lang="en" className="scroll-smooth">
      <head />
      <body className="antialiased min-h-screen">
        <ThemeProvider>
          <LanguageProvider>
            <CurrencyProvider>
              <AuthProvider>
                <CartProvider>
                  <ToastProvider>
                    <SiteCustomizationProvider>
                      <AppShell>
                        <div className="relative flex flex-col min-h-screen">
                          {children}
                        </div>
                        <CartDrawer />
                        <FloatingCartBar />
                      </AppShell>
                    </SiteCustomizationProvider>
                  </ToastProvider>
                </CartProvider>
              </AuthProvider>
            </CurrencyProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
