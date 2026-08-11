import React from 'react';
import { AccountLayout } from './AccountLayout';
import { Heart, ShoppingBag, Trash2, ArrowRight } from 'lucide-react';
import { useStorefront } from '../../context/StorefrontContext';

export const WishlistPage: React.FC = () => {
  const { navigateTo } = useStorefront();
  
  const wishlistItems = [
    { id: 1, name: 'AuraBook Pro M3', price: 1899.00, image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=200&h=200&fit=crop', stock: 'In Stock' },
    { id: 2, name: 'AuraPod Max', price: 549.00, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200&h=200&fit=crop', stock: 'Low Stock' },
  ];

  return (
    <AccountLayout activeTab="wishlist">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">My Wishlist</h1>
          <p className="text-slate-500 text-sm font-medium mt-1">Keep track of the products you love.</p>
        </div>

        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-[40px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="relative aspect-square bg-slate-50">
                  <img src={item.image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <button className="absolute top-4 right-4 p-2.5 bg-white/80 backdrop-blur-md rounded-xl text-primary hover:bg-primary hover:text-white transition-all shadow-sm">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-black text-slate-900 truncate pr-2">{item.name}</h3>
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">{item.stock}</span>
                  </div>
                  <div className="text-lg font-black text-slate-900 font-mono mb-4">${item.price.toFixed(2)}</div>
                  <button className="w-full py-3 bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-all">
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
              className="px-10 py-4 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary transition-all"
            >
              Start Shopping
            </button>
          </div>
        )}
      </div>
    </AccountLayout>
  );
};
