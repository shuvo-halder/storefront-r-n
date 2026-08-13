'use client';

import React, { useState, useEffect } from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { useCart } from '../../hooks/useCart';
import { 
  X, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Truck, 
  Sparkles,
  ShieldCheck,
  Loader2,
  Trash2
} from 'lucide-react';
import { CartItem } from '../cart/CartItem';

export const CartDrawer: React.FC = () => {
  const { 
    isCartOpen, 
    setIsCartOpen, 
    navigateTo,
    publicSettings
  } = useStorefront();

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

  const [couponInput, setCouponInput] = useState('');
  const trackedDrawerKeyRef = React.useRef<string | null>(null);

  // GA4 Tracking when drawer opens
  useEffect(() => {
    if (isCartOpen && cart.items.length > 0) {
      const cartKey = `drawer_${cart.items.map(i => `${i.id}_${i.quantity}`).join(',')}_${cart.total}`;
      if (trackedDrawerKeyRef.current !== cartKey) {
        trackedDrawerKeyRef.current = cartKey;
        viewCartGA4();
      }
    } else if (!isCartOpen) {
      trackedDrawerKeyRef.current = null;
    }
  }, [isCartOpen, cart.items, cart.total]);

  if (!isCartOpen) return null;

  const freeShippingGoal = publicSettings?.shipping.freeShippingThreshold || 99;
  const currentSubtotal = cart.subtotal;
  const amountNeeded = Math.max(0, freeShippingGoal - currentSubtotal);
  const shippingPercent = Math.min(100, Math.round((currentSubtotal / freeShippingGoal) * 100));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    try {
      await applyCoupon(couponInput);
      setCouponInput('');
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-primary" size={20} />
            <h3 className="font-extrabold text-base text-slate-900">
              Shopping Cart ({totalItemCount})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {cart.items.length > 0 && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to clear your cart?')) {
                    clearCart();
                  }
                }}
                disabled={isClearingCart}
                className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-colors cursor-pointer"
                title="Clear Entire Cart"
              >
                {isClearingCart ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              </button>
            )}
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="p-3.5 bg-primary/5/80 border-b border-primary/10/80">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="flex items-center gap-1.5 text-primary">
              <Truck size={15} />
              {amountNeeded > 0 ? (
                <>Add <span className="font-extrabold text-rose-800">${amountNeeded.toFixed(2)}</span> more for FREE Shipping</>
              ) : (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <Sparkles size={14} /> You unlocked FREE Express Shipping!
                </span>
              )}
            </span>
            <span className="text-slate-500 text-[11px] font-mono">{shippingPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${amountNeeded === 0 ? 'bg-emerald-500' : 'bg-primary'}`}
              style={{ width: `${shippingPercent}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-slate-100">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center py-12 text-slate-400">
              <Loader2 size={32} className="animate-spin text-primary mb-2" />
              <p className="text-xs font-bold">Synchronizing cart...</p>
            </div>
          ) : cart.items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <ShoppingBag size={32} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 text-base">Your cart is empty</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Looks like you haven't added any flagship headphones or tech gear yet.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigateTo('shop');
                }}
                className="px-5 py-2.5 bg-primary hover:bg-primary text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            cart.items.map((item) => (
              <CartItem 
                key={item.id} 
                item={item} 
                onUpdateQuantity={updateCartQuantity}
                onRemove={removeCartItem}
                isUpdating={isUpdatingQuantity}
                isRemoving={isRemovingItem}
                onNavigateToProduct={(slug) => {
                  setIsCartOpen(false);
                  navigateTo('product-detail', { productSlug: slug });
                }}
              />
            ))
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {cart.items.length > 0 && (
          <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3.5">
            
            {/* Coupon Code input */}
            <form onSubmit={handleApplyCoupon} className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Coupon code (e.g. TECH20)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="w-full py-2 pl-8 pr-3 bg-white border border-slate-200 rounded-xl text-xs uppercase placeholder:normal-case font-semibold text-slate-800 focus:outline-none focus:border-primary"
                />
                <Tag size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              <button
                type="submit"
                disabled={isApplyingCoupon || !couponInput.trim()}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                {isApplyingCoupon ? <Loader2 size={14} className="animate-spin" /> : 'Apply'}
              </button>
            </form>
            {applyCouponError && (
              <p className="text-[11px] text-primary font-medium">{(applyCouponError as any).message || 'Invalid coupon'}</p>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-200/80">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">${cart.subtotal.toFixed(2)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-primary font-medium">
                  <span>Discount ({cart.appliedCoupon})</span>
                  <span>-${cart.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-slate-800">
                  {cart.shippingFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `$${cart.shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (8%)</span>
                <span className="font-semibold text-slate-800">${cart.estimatedTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Amount</span>
                <span className="text-primary font-mono">${cart.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigateTo('checkout');
                }}
                className="w-full py-3 px-4 bg-primary hover:bg-primary text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigateTo('cart');
                }}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer text-center"
              >
                View Full Cart Details
              </button>
            </div>

            <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
              <ShieldCheck size={13} className="text-emerald-500" />
              <span>Guaranteed safe & secure checkout</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
