import type { Metadata } from 'next';
import '../src/index.css';
import { StorefrontProviders } from '../src/providers/StorefrontProviders';
import { AnalyticsProvider } from '../src/providers/AnalyticsProvider';
import { Header } from '../src/components/common/Header';
import { Footer } from '../src/components/common/Footer';
import { CartDrawer } from '../src/components/common/CartDrawer';
import { QuickViewModal } from '../src/components/common/QuickViewModal';
import { ToastContainer } from '../src/components/common/ToastContainer';
import { AuthModal } from '../src/components/account/AuthModal';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Vyzobd — Next-Gen Audio Equipment & Tech Hardware',
  description: 'Engineers of next-generation audio equipment, GaN fast chargers, and high-performance workstation peripherals for the modern professional.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  openGraph: {
    title: 'Vyzobd — Next-Gen Audio Equipment & Tech Hardware',
    description: 'Engineers of next-generation audio equipment and high-performance workstation peripherals.',
    url: 'https://vyzobd.com',
    siteName: 'Vyzobd',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between selection:bg-accent selection:text-white antialiased overflow-x-hidden">
        <StorefrontProviders>
          <AnalyticsProvider />
          <div>
            <Header />
            <main>{children}</main>
          </div>
          <Footer />
          <CartDrawer />
          <QuickViewModal />
          <AuthModal />
          <ToastContainer />
        </StorefrontProviders>
      </body>
    </html>
  );
}

