'use client';

import React, { useEffect } from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { useCart } from '../../hooks/useCart';
import { 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  ShieldCheck, 
  ArrowLeft,
  Loader2,
  Trash2
} from 'lucide-react';
import { CartItem } from './CartItem';

export const CartPage: React.FC = () => {
  const { navigateTo, publicSettings } = useStorefront();
  const {
    cart,
    isLoading,
    totalItemCount,
    updateCartQuantity,
    removeCartItem,
    clearCart,
    applyCoupon,
    isApplyingCoupon,
    applyCouponError,
    viewCartGA4,
    isUpdatingQuantity,
    isRemovingItem,
    isClearingCart
  } = useCart();

  const [couponCode, setCouponCode] = React.useState('');
  const trackedPageKeyRef = React.useRef<string | null>(null);

  // GA4 Tracking
  useEffect(() => {
    if (cart.items.length > 0) {
      const pageKey = `page_${cart.items.map(i => `${i.id}_${i.quantity}`).join(',')}_${cart.total}`;
      if (trackedPageKeyRef.current !== pageKey) {
        trackedPageKeyRef.current = pageKey;
        viewCartGA4();
      }
    }
  }, [cart.items, cart.total]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    try {
      await applyCoupon(couponCode);
      setCouponCode('');
    } catch (err) {
      // Error handled by hook
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 bg-slate-50 min-h-screen flex flex-col items-center justify-center">
        <Loader2 size={40} className="animate-spin text-primary mb-4" />
        <h2 className="text-xl font-black text-slate-900">Loading your shopping cart...</h2>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="py-16 bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto">
            <ShoppingBag size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-900">Your Cart is Empty</h2>
          <p className="text-xs text-slate-500">
            Browse our flagship audio gear, titanium smartwatches, and GaN chargers to fill your cart.
          </p>
          <button
            onClick={() => navigateTo('shop')}
            className="px-6 py-3 bg-primary hover:bg-primary text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
          >
            Explore Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Shopping Cart ({totalItemCount} Items)
            </h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Review items, apply promo codes, and proceed to secure checkout.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (confirm('Clear entire shopping cart?')) {
                  clearCart();
                }
              }}
              disabled={isClearingCart}
              className="px-4 py-2 text-slate-500 hover:text-primary border border-slate-200 hover:border-primary/20 bg-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isClearingCart ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              <span>Clear Cart</span>
            </button>
            <button
              onClick={() => navigateTo('shop')}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:text-primary rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Continue Shopping</span>
            </button>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Item Table (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs divide-y divide-slate-100 space-y-2">
            {cart.items.map((item) => (
              <CartItem 
                key={item.id} 
                item={item} 
                onUpdateQuantity={updateCartQuantity}
                onRemove={removeCartItem}
                isUpdating={isUpdatingQuantity}
                isRemoving={isRemovingItem}
                onNavigateToProduct={(slug) => navigateTo('product-detail', { productSlug: slug })}
              />
            ))}
          </div>

          {/* Order Summary (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6 sticky top-24">
            <h3 className="font-extrabold text-base text-slate-900 pb-3 border-b border-slate-100">
              Order Summary
            </h3>

            {/* Coupon Box */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Promo Code</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="e.g. TECH20"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full py-2.5 px-3 pl-8 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase font-bold text-slate-800 focus:outline-none focus:border-primary"
                  />
                  <Tag size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
                <button
                  type="submit"
                  disabled={isApplyingCoupon || !couponCode.trim()}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
                >
                  {isApplyingCoupon ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
                </button>
              </div>
              {applyCouponError && (
                <p className="text-[11px] text-primary font-medium">
                  {(applyCouponError as any).message || 'Invalid coupon code'}
                </p>
              )}
            </form>

            <div className="space-y-2.5 text-xs text-slate-600 border-t border-slate-100 pt-4">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900">${cart.subtotal.toFixed(2)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-primary font-medium bg-primary/5 px-2 py-1.5 rounded-lg border border-primary/10">
                  <span className="flex items-center gap-1">
                    <Tag size={12} />
                    Coupon Discount ({cart.appliedCoupon})
                  </span>
                  <span>-${cart.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-bold text-slate-900">
                  {cart.shippingFee === 0 ? <span className="text-emerald-600 font-black">FREE</span> : `$${cart.shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Sales Tax (8%)</span>
                <span className="font-bold text-slate-900">${cart.estimatedTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-200">
                <span>Estimated Total</span>
                <span className="text-primary font-mono">${cart.total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigateTo('checkout')}
              className="w-full py-4 bg-primary hover:bg-primary text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={18} />
            </button>

            <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1 font-medium">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>256-bit AES SSL Secure Checkout</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
