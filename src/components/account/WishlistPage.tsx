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
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Wishlist</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Keep track of the hardware products you love.</p>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-4 bg-white rounded-[40px] border border-slate-100">
            <Loader2 size={36} className="animate-spin text-primary" />
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Wishlist...</p>
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-200 rounded-[32px] p-8 text-center space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm">Unable to load wishlist</h3>
            <p className="text-xs text-slate-600">{error}</p>
            <button 
              onClick={loadWishlist}
              className="px-6 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl"
            >
              Retry
            </button>
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-[40px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between">
                <div>
                  <div className="relative aspect-square bg-slate-50">
                    <SmartImage 
                      src={item.images[0]} 
                      alt={item.name} 
                      fill
                      fallbackType="product"
                      fallbackLabel={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                    />
                    <button 
                      onClick={() => handleRemove(item.id)}
                      className="absolute top-4 right-4 p-2.5 bg-white/80 backdrop-blur-md rounded-xl text-primary hover:bg-primary hover:text-white transition-all shadow-sm cursor-pointer"
                      title="Remove from Wishlist"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-sm font-black text-slate-900 truncate pr-2">{item.name}</h3>
                      <span className="text-[9px] font-black text-primary uppercase tracking-widest">{item.stock > 0 ? 'In Stock' : 'Out of Stock'}</span>
                    </div>
                    <div className="text-lg font-black text-slate-900 font-mono mb-4">${item.price.toFixed(2)}</div>
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <button 
                    onClick={() => handleAddToCart(item)}
                    disabled={item.stock <= 0}
                    className="w-full py-3 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <ShoppingBag size={14} />
                    <span>Add To Cart</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[40px] p-20 text-center border border-slate-100">
            <Heart size={48} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-lg font-black text-slate-900">Your wishlist is empty</h3>
            <p className="text-slate-500 text-sm font-medium mt-1 mb-8">Start adding items you'd like to save for later.</p>
            <button 
              onClick={() => navigateTo('shop')}
              className="px-10 py-4 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary transition-all cursor-pointer"
            >
              Start Shopping
            </button>
          </div>
        )}
      </div>
    </AccountLayout>
  );
};
