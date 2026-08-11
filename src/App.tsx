import React from 'react';
import { StorefrontProvider, useStorefront } from './context/StorefrontContext';
import { Header } from './components/common/Header';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/common/CartDrawer';
import { QuickViewModal } from './components/common/QuickViewModal';
import { ToastContainer } from './components/common/ToastContainer';
import { AuthModal } from './components/account/AuthModal';

// Views
import { HeroSlider } from './components/home/HeroSlider';
import { CategoryGrid } from './components/home/CategoryGrid';
import { PromoBanners } from './components/home/PromoBanners';
import { FeaturedProductsSection } from './components/home/FeaturedProductsSection';
import { FlashSaleSection } from './components/home/FlashSaleSection';
import { BrandCarousel } from './components/home/BrandCarousel';
import { BlogArticlesSection } from './components/home/BlogArticlesSection';

import { ShopCatalogView } from './components/shop/ShopCatalogView';
import { ProductDetailPage } from './components/product/ProductDetailPage';
import { CartPage } from './components/cart/CartPage';
import { CheckoutPage } from './components/cart/CheckoutPage';
import { OrderConfirmationPage } from './components/cart/OrderConfirmationPage';
import { OrdersPage } from './components/account/OrdersPage';
import { AccountPage } from './components/account/AccountPage';
import { WishlistPage } from './components/home/WishlistPage';
import { DealsPage } from './components/home/DealsPage';
import { BlogPage } from './components/content/BlogPage';
import { ArticleDetailPage } from './components/content/ArticleDetailPage';
import { CMSPolicyPage } from './components/content/CMSPolicyPage';

const StorefrontContent: React.FC = () => {
  const { currentView } = useStorefront();

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return (
          <main className="space-y-0">
            <HeroSlider />
            <CategoryGrid />
            <PromoBanners />
            <FeaturedProductsSection />
            <FlashSaleSection />
            <BrandCarousel />
            <BlogArticlesSection />
          </main>
        );

      case 'shop':
        return <ShopCatalogView />;

      case 'product-detail':
        return <ProductDetailPage />;

      case 'cart':
        return <CartPage />;

      case 'checkout':
        return <CheckoutPage />;

      case 'order-confirmation':
        return <OrderConfirmationPage />;

      case 'orders':
        return <OrdersPage />;

      case 'account':
        return <AccountPage />;

      case 'wishlist':
        return <WishlistPage />;

      case 'deals':
        return <DealsPage />;

      case 'blog':
        return <BlogPage />;

      case 'article-detail':
        return <ArticleDetailPage />;

      case 'cms':
        return <CMSPolicyPage />;

      default:
        return <ShopCatalogView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between selection:bg-rose-500 selection:text-white">
      <div>
        <Header />
        <Navbar />
        {renderView()}
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
    <StorefrontProvider>
      <StorefrontContent />
    </StorefrontProvider>
  );
}
