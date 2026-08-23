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
import { getHomepageMetadata } from '../src/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return await getHomepageMetadata();
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className="min-h-screen bg-white text-[#111827] font-sans flex flex-col justify-between selection:bg-primary selection:text-white antialiased overflow-x-hidden">
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

