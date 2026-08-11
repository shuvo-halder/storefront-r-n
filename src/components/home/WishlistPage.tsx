import React from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { MOCK_PRODUCTS } from '../../data/mockProducts';
import { ProductCard } from '../common/ProductCard';
import { Heart, ShoppingBag } from 'lucide-react';

export const WishlistPage: React.FC = () => {
  const { wishlistIds, navigateTo } = useStorefront();

  const savedProducts = MOCK_PRODUCTS.filter(p => wishlistIds.includes(p.id));

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Heart size={24} className="text-rose-600 fill-rose-600" />
            <span>My Saved Wishlist ({savedProducts.length})</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Items saved for future purchases or price drop alerts.
          </p>
        </div>

        {savedProducts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4">
            <Heart size={36} className="text-slate-300 mx-auto" />
            <h3 className="font-extrabold text-base text-slate-800">Your wishlist is empty</h3>
            <p className="text-xs text-slate-500">
              Tap the heart icon on any electronics item in our catalog to save it here.
            </p>
            <button
              onClick={() => navigateTo('shop')}
              className="px-5 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl"
            >
              Explore Shop
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {savedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
