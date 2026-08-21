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
import { formatPrice } from '../../utils/formatters';

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

  const currencyCode = publicSettings?.general?.currency || 'BDT';
  const currencySymbol = publicSettings?.general?.currencySymbol || (currencyCode === 'BDT' ? '৳' : '৳');
  const freeShippingGoal = publicSettings?.shipping?.freeShippingThreshold ?? 150;
  const flatRateFee = publicSettings?.shipping?.flatRateShippingFee ?? 15;
  const estimatedShippingFee = cart.shippingFee > 0 ? cart.shippingFee : (cart.subtotal >= freeShippingGoal || cart.subtotal === 0 ? 0 : flatRateFee);
  const estimatedTotal = Math.max(0, cart.subtotal - cart.discount + estimatedShippingFee + cart.estimatedTax);

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
      <div className="py-20 bg-[#F9FAFB] min-h-screen flex flex-col items-center justify-center">
        <Loader2 size={36} className="animate-spin text-[#DC2B53] mb-3" />
        <h2 className="text-lg font-bold text-[#111827]">Loading your shopping cart...</h2>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="py-16 bg-[#F9FAFB] min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full bg-white border border-[#E5E7EB] rounded-xl p-8 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-[#F9FAFB] border border-[#E5E7EB] rounded-full flex items-center justify-center text-[#6B7280] mx-auto">
            <ShoppingBag size={28} />
          </div>
          <h2 className="text-xl font-bold text-[#111827]">Your Cart is Empty</h2>
          <p className="text-xs text-[#6B7280]">
            Browse our catalog to discover premium audio equipment and accessories.
          </p>
          <button
            onClick={() => navigateTo('shop')}
            className="px-5 py-2.5 bg-[#DC2B53] hover:bg-[#C52247] text-white font-semibold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            Explore Catalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#111827] tracking-tight">
              Shopping Cart ({totalItemCount} Items)
            </h1>
            <p className="text-xs text-[#6B7280] mt-1">
              Review items, apply promo codes, and proceed to checkout.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                if (confirm('Clear entire shopping cart?')) {
                  clearCart();
                }
              }}
              disabled={isClearingCart}
              className="px-3.5 py-2 text-[#6B7280] hover:text-[#DC2B53] border border-[#E5E7EB] hover:border-[#DC2B53]/30 bg-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isClearingCart ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
              <span>Clear Cart</span>
            </button>
            <button
              onClick={() => navigateTo('shop')}
              className="px-3.5 py-2 bg-white border border-[#E5E7EB] text-[#111827] hover:text-[#DC2B53] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Continue Shopping</span>
            </button>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Item Table (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs divide-y divide-[#E5E7EB]">
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
          <div className="lg:col-span-4 bg-[#F9FAFB] border border-[#E5E7EB] rounded-xl p-5 shadow-xs space-y-5 sticky top-24">
            <h3 className="font-bold text-base text-[#111827] pb-3 border-b border-[#E5E7EB]">
              Order Summary
            </h3>

            {/* Coupon Box */}
            <form onSubmit={handleApplyCoupon} className="space-y-1.5">
              <label className="text-xs font-semibold text-[#111827]">Promo Code</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="e.g. SAVE10"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full py-2 px-3 pl-8 bg-white border border-[#E5E7EB] rounded-lg text-xs uppercase font-medium text-[#111827] focus:outline-none focus:border-[#DC2B53] focus:ring-1 focus:ring-[#DC2B53]"
                  />
                  <Tag size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                </div>
                <button
                  type="submit"
                  disabled={isApplyingCoupon || !couponCode.trim()}
                  className="px-3.5 py-2 bg-[#111827] hover:bg-black text-white font-semibold text-xs rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isApplyingCoupon ? <Loader2 size={13} className="animate-spin" /> : 'Apply'}
                </button>
              </div>
              {applyCouponError && (
                <p className="text-[11px] text-[#DC2626] font-medium">
                  {(applyCouponError as any).message || 'Invalid coupon code'}
                </p>
              )}
            </form>

            <div className="space-y-2 text-xs text-[#6B7280] border-t border-[#E5E7EB] pt-3.5">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-[#111827]">{formatPrice(cart.subtotal, currencyCode, currencySymbol)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-[#DC2B53] font-medium bg-[#FDF0F3] px-2 py-1.5 rounded-md border border-[#DC2B53]/20">
                  <span className="flex items-center gap-1">
                    <Tag size={12} />
                    Coupon Discount ({cart.appliedCoupon})
                  </span>
                  <span>-{formatPrice(cart.discount, currencyCode, currencySymbol)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-semibold text-[#111827]">
                  {estimatedShippingFee === 0 ? <span className="text-[#16A34A] font-semibold">FREE</span> : formatPrice(estimatedShippingFee, currencyCode, currencySymbol)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax</span>
                <span className="font-semibold text-[#111827]">{formatPrice(cart.estimatedTax, currencyCode, currencySymbol)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#111827] pt-2.5 border-t border-[#E5E7EB]">
                <span>Total Amount</span>
                <span className="text-[#DC2B53] font-bold">{formatPrice(estimatedTotal, currencyCode, currencySymbol)}</span>
              </div>
            </div>

            <button
              onClick={() => navigateTo('checkout')}
              className="w-full py-3 bg-[#DC2B53] hover:bg-[#C52247] text-white font-semibold text-xs uppercase tracking-wider rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={15} />
            </button>

            <div className="text-[11px] text-[#6B7280] text-center flex items-center justify-center gap-1">
              <ShieldCheck size={13} className="text-[#16A34A]" />
              <span>Guaranteed safe & secure checkout</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
