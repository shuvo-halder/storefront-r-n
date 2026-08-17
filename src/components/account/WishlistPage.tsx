'use client';

import React, { useState, useEffect } from 'react';
import { SmartImage } from '../common/SmartImage';
import { AccountLayout } from './AccountLayout';
import { Heart, ShoppingBag, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import { useStorefront } from '../../context/StorefrontContext';
import { storefrontApi } from '../../services/storefrontApi';
import { useCart } from '../../hooks/useCart';
import { Product } from '../../types/storefront';

export const WishlistPage: React.FC = () => {
  const { navigateTo, addToast } = useStorefront();
  const { addToCart } = useCart();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await storefrontApi.getWishlist();
      setItems(data);
    } catch (err: any) {
      setError(err?.message || 'Failed to load wishlist items.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = async (productId: string) => {
    try {
      await storefrontApi.removeFromWishlist(productId);
      setItems(prev => prev.filter(item => item.id !== productId));
      addToast({
        title: 'Item Removed',
        description: 'Product removed from your wishlist.',
        type: 'info'
      });
    } catch {
      addToast({
        title: 'Error',
        description: 'Failed to remove product from wishlist.',
        type: 'error'
      });
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart(product.id, 1);
      addToast({
        title: 'Added to Cart',
        description: `${product.name} added to your shopping cart.`,
        type: 'success'
      });
    } catch {
      addToast({
        title: 'Error',
        description: 'Failed to add item to cart.',
        type: 'error'
      });
    }
  };

  return (
    <AccountLayout activeTab="wishlist">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Wishlist</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Keep track of the products you love and want to buy later.</p>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white rounded-xl border border-gray-200">
            <Loader2 size={32} className="animate-spin text-primary" />
            <p className="text-gray-400 font-semibold text-xs uppercase tracking-wider">Loading Wishlist...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center space-y-3">
            <h3 className="font-bold text-gray-900 text-sm">Unable to load wishlist</h3>
            <p className="text-xs text-gray-600">{error}</p>
            <button 
              onClick={loadWishlist}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-xs hover:border-gray-300 transition-colors group flex flex-col justify-between">
                <div>
                  <div className="relative aspect-square bg-gray-50">
                    <SmartImage 
                      src={item.images[0]} 
                      alt={item.name} 
                      fill
                      fallbackType="product"
                      fallbackLabel={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <button 
                      onClick={() => handleRemove(item.id)}
                      className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-xs rounded-lg text-gray-500 hover:text-primary hover:bg-white transition-colors shadow-xs cursor-pointer border border-gray-100"
                      title="Remove from Wishlist"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate pr-2">{item.name}</h3>
                      <span className="text-[11px] font-semibold text-primary">{item.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                    </div>
                    <div className="text-base font-bold text-gray-900 mb-2">${item.price.toFixed(2)}</div>
                  </div>
                </div>
                <div className="p-4 pt-0">
                  <button 
                    onClick={() => handleAddToCart(item)}
                    disabled={item.stock <= 0}
                    className="w-full py-2.5 bg-gray-900 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                  >
                    <ShoppingBag size={14} />
                    <span>Add To Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-16 text-center border border-gray-200 shadow-xs">
            <Heart size={44} className="mx-auto text-gray-300 mb-3" />
            <h3 className="text-base font-bold text-gray-900">Your wishlist is empty</h3>
            <p className="text-gray-500 text-sm font-medium mt-1 mb-6">Start adding items you'd like to save for later.</p>
            <button 
              onClick={() => navigateTo('shop')}
              className="btn-primary text-sm"
            >
              Start Shopping
            </button>
          </div>
        )}
      </div>
    </AccountLayout>
  );
};
