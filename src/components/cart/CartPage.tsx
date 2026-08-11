import React from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  Tag, 
  Truck, 
  ShieldCheck, 
  ArrowLeft 
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const { cart, updateCartQuantity, removeCartItem, applyCoupon, navigateTo, publicSettings } = useStorefront();

  const [couponCode, setCouponCode] = React.useState('');
  const [couponError, setCouponError] = React.useState('');

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await applyCoupon(couponCode);
      setCouponCode('');
      setCouponError('');
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon');
    }
  };

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
            className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Shopping Cart Overview
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Review items, apply promo codes, and proceed to secure checkout.
            </p>
          </div>

          <button
            onClick={() => navigateTo('shop')}
            className="text-xs font-bold text-slate-700 hover:text-rose-600 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Continue Shopping</span>
          </button>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Item Table (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs divide-y divide-slate-100 space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="pt-4 first:pt-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={item.product.images[0]} 
                    alt={item.product.name} 
                    className="w-20 h-20 object-cover rounded-xl border border-slate-200 bg-slate-50 flex-shrink-0" 
                  />
                  <div>
                    <h3 
                      onClick={() => navigateTo('product-detail', { productSlug: item.product.slug })}
                      className="font-bold text-sm text-slate-900 hover:text-rose-600 cursor-pointer transition-colors"
                    >
                      {item.product.name}
                    </h3>
                    <div className="text-xs text-slate-400 mt-0.5">Brand: {item.product.brand}</div>
                    {item.selectedVariant && (
                      <div className="text-xs text-rose-600 font-semibold mt-0.5">
                        {item.selectedVariant.name}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between w-full sm:w-auto gap-6">
                  {/* Quantity controls */}
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50">
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                      className="p-2 text-slate-600 hover:bg-slate-200 rounded-l-xl transition-colors font-bold"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="px-3 text-xs font-bold text-slate-800">{item.quantity}</span>
                    <button
                      onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                      className="p-2 text-slate-600 hover:bg-slate-200 rounded-r-xl transition-colors font-bold"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <div className="text-sm font-black text-slate-900">
                      ${item.totalPrice.toFixed(2)}
                    </div>
                  </div>

                  {/* Trash */}
                  <button
                    onClick={() => removeCartItem(item.id)}
                    className="text-slate-400 hover:text-rose-600 p-2 transition-colors cursor-pointer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
            <h3 className="font-extrabold text-base text-slate-900 pb-3 border-b border-slate-100">
              Order Summary
            </h3>

            {/* Coupon Box */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label className="text-xs font-bold text-slate-700">Promo Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. TECH20"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase font-semibold text-slate-800"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl"
                >
                  Apply
                </button>
              </div>
              {couponError && <p className="text-[11px] text-rose-600 font-medium">{couponError}</p>}
            </form>

            <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">${cart.subtotal.toFixed(2)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-rose-600 font-medium">
                  <span>Coupon Discount ({cart.appliedCoupon})</span>
                  <span>-${cart.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span className="font-bold text-slate-900">
                  {cart.shippingFee === 0 ? <span className="text-emerald-600">FREE</span> : `$${cart.shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (8%)</span>
                <span className="font-bold text-slate-900">${cart.estimatedTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-200">
                <span>Total</span>
                <span className="text-rose-600">${cart.total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigateTo('checkout')}
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>

            <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>256-bit Encrypted Checkout</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
