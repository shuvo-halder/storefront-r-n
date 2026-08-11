import React, { lazy, Suspense } from 'react';
import { StorefrontProvider, useStorefront } from './context/StorefrontContext';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { Header } from './components/common/Header';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/common/CartDrawer';
import { QuickViewModal } from './components/common/QuickViewModal';
import { ToastContainer } from './components/common/ToastContainer';
import { AuthModal } from './components/account/AuthModal';
import { ViewSkeleton } from './components/common/ViewSkeleton';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { SEO } from './components/common/SEO';
import { useSettings } from './context/SettingsContext';
import { getOrganizationSchema, getWebsiteSchema } from './utils/seo';

// Lazy load views for better performance (code splitting)
const HomePage = lazy(() => import('./components/home/HomePage').then(m => ({ default: m.HomePage })));
const ShopCatalogView = lazy(() => import('./components/shop/ShopCatalogView').then(m => ({ default: m.ShopCatalogView })));
const ProductDetailPage = lazy(() => import('./components/product/ProductDetailPage').then(m => ({ default: m.ProductDetailPage })));
const CartPage = lazy(() => import('./components/cart/CartPage').then(m => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('./components/cart/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const OrderConfirmationPage = lazy(() => import('./components/cart/OrderConfirmationPage').then(m => ({ default: m.OrderConfirmationPage })));
const OrdersPage = lazy(() => import('./components/account/OrdersPage').then(m => ({ default: m.OrdersPage })));
const AccountDashboard = lazy(() => import('./components/account/AccountDashboard').then(m => ({ default: m.AccountDashboard })));
const ProfilePage = lazy(() => import('./components/account/ProfilePage').then(m => ({ default: m.ProfilePage })));
const AddressesPage = lazy(() => import('./components/account/AddressesPage').then(m => ({ default: m.AddressesPage })));
const WishlistPage = lazy(() => import('./components/account/WishlistPage').then(m => ({ default: m.WishlistPage })));
const NotificationsPage = lazy(() => import('./components/account/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const ActivityPage = lazy(() => import('./components/account/ActivityPage').then(m => ({ default: m.ActivityPage })));
const OrderDetailsPage = lazy(() => import('./components/account/OrderDetailsPage').then(m => ({ default: m.OrderDetailsPage })));
const ReturnRequestPage = lazy(() => import('./components/account/ReturnRequestPage').then(m => ({ default: m.ReturnRequestPage })));
const LoginPage = lazy(() => import('./components/auth/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./components/auth/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./components/auth/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const DealsPage = lazy(() => import('./components/home/DealsPage').then(m => ({ default: m.DealsPage })));
const BlogPage = lazy(() => import('./components/content/BlogPage').then(m => ({ default: m.BlogPage })));
const ArticleDetailPage = lazy(() => import('./components/content/ArticleDetailPage').then(m => ({ default: m.ArticleDetailPage })));
const CMSPage = lazy(() => import('./components/content/CMSPage').then(m => ({ default: m.CMSPage })));
const FAQPage = lazy(() => import('./components/content/FAQPage').then(m => ({ default: m.FAQPage })));
const SearchPageView = lazy(() => import('./components/search/SearchPageView').then(m => ({ default: m.SearchPageView })));
const PaymentSuccess = lazy(() => import('./components/checkout/results/PaymentSuccess').then(m => ({ default: m.PaymentSuccess })));
const PaymentFailed = lazy(() => import('./components/checkout/results/PaymentFailed').then(m => ({ default: m.PaymentFailed })));
const GatewaySimulation = lazy(() => import('./components/checkout/GatewaySimulation').then(m => ({ default: m.GatewaySimulation })));

const StorefrontContent: React.FC = () => {
  const { currentView } = useStorefront();
  const { general } = useSettings();

  const isPrivatePage = [
    'cart', 'checkout', 'order-confirmation', 'checkout-success', 
    'checkout-failed', 'checkout-gateway', 'orders', 'order-details', 
    'return-request', 'account', 'profile', 'addresses', 'notifications', 
    'activity', 'login', 'register', 'forgot-password'
  ].includes(currentView);

  const renderView = () => {
    // ... switcher logic
    switch (currentView) {
      case 'home':
        return <HomePage />;

      case 'shop':
        return <ShopCatalogView />;

      case 'search':
        return <SearchPageView />;

      case 'product-detail':
        return <ProductDetailPage />;

      case 'cart':
        return <CartPage />;

      case 'checkout':
        return <CheckoutPage />;

      case 'order-confirmation':
        return <OrderConfirmationPage />;

      case 'checkout-success':
        return <PaymentSuccess />;

      case 'checkout-failed':
        return <PaymentFailed />;

      case 'checkout-gateway':
        return <GatewaySimulation />;

      case 'orders':
        return <ProtectedRoute><OrdersPage /></ProtectedRoute>;

      case 'order-details':
        return <ProtectedRoute><OrderDetailsPage /></ProtectedRoute>;

      case 'return-request':
        return <ProtectedRoute><ReturnRequestPage /></ProtectedRoute>;

      case 'account':
        return <ProtectedRoute><AccountDashboard /></ProtectedRoute>;

      case 'profile':
        return <ProtectedRoute><ProfilePage /></ProtectedRoute>;

      case 'addresses':
        return <ProtectedRoute><AddressesPage /></ProtectedRoute>;

      case 'notifications':
        return <ProtectedRoute><NotificationsPage /></ProtectedRoute>;

      case 'activity':
        return <ProtectedRoute><ActivityPage /></ProtectedRoute>;

      case 'wishlist':
        return <WishlistPage />;

      case 'login':
        return <LoginPage />;

      case 'register':
        return <RegisterPage />;

      case 'forgot-password':
        return <ForgotPasswordPage />;

      case 'deals':
        return <DealsPage />;

      case 'blog':
        return <BlogPage />;

      case 'article-detail':
        return <ArticleDetailPage />;

      case 'cms-page':
        return <CMSPage />;

      case 'faq':
        return <FAQPage />;

      default:
        return <ShopCatalogView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between selection:bg-primary selection:text-white">
      <SEO 
        noindex={isPrivatePage}
        structuredData={currentView === 'home' ? [getOrganizationSchema(general), getWebsiteSchema(general)] : undefined}
      />
      <div>
        <Header />
        <Navbar />
        <Suspense fallback={<ViewSkeleton />}>
          {renderView()}
        </Suspense>
      </div>

      <Footer />

      {/* Global Modals & Notifications */}
      <CartDrawer />
      <QuickViewModal />
      <AuthModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <SettingsProvider>
      <StorefrontProvider>
        <AuthProvider>
          <StorefrontContent />
        </AuthProvider>
      </StorefrontProvider>
    </SettingsProvider>
  );
}
