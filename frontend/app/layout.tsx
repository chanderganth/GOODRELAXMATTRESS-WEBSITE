import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CartDrawer from '@/components/cart/CartDrawer';

export const metadata: Metadata = {
  metadataBase: new URL('https://goodrelaxmattress.in'),
  title: 'GoodRelax Mattress — Sleep Better, Live Better',
  description: 'Premium custom mattresses crafted to your exact specifications. Choose from 28D Rare, 32D Epic, and 40D Legendary densities with custom layers, fabrics, and sizes.',
  keywords: 'mattress, custom mattress, memory foam, latex mattress, spring mattress, coir mattress, buy mattress online',
  authors: [{ name: 'GoodRelax Mattress' }],
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'GoodRelax' },
  openGraph: {
    title: 'GoodRelax Mattress — Premium Custom Mattresses',
    description: 'Build your perfect mattress with our custom configurator.',
    type: 'website',
    locale: 'en_IN',
    url: 'https://goodrelaxmattress.in',
  },
};

export const viewport: Viewport = {
  themeColor: '#1a1a2e',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="min-h-screen flex flex-col bg-gray-50">
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { background: '#1a1a2e', color: '#fff', borderRadius: '12px' },
              success: { iconTheme: { primary: '#e8b85d', secondary: '#1a1a2e' } },
            }}
          />
        </CartProvider>
      </body>
    </html>
  );
}
