import React, { useState } from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Tag, 
  Truck, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    updateCartQuantity, 
    removeCartItem, 
    applyCoupon, 
    navigateTo,
    publicSettings
  } = useStorefront();

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  if (!isCartOpen) return null;

  const freeShippingGoal = publicSettings?.freeShippingThreshold || 99;
  const currentSubtotal = cart.subtotal;
  const amountNeeded = Math.max(0, freeShippingGoal - currentSubtotal);
  const shippingPercent = Math.min(100, Math.round((currentSubtotal / freeShippingGoal) * 100));

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setIsApplying(true);
    setCouponError('');
    try {
      await applyCoupon(couponInput);
      setCouponInput('');
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon');
    } finally {
      setIsApplying(false);
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
            <ShoppingBag className="text-rose-600" size={20} />
            <h3 className="font-extrabold text-base text-slate-900">
              Shopping Cart ({cart.items.reduce((s, i) => s + i.quantity, 0)})
            </h3>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="p-3.5 bg-rose-50/80 border-b border-rose-100/80">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="flex items-center gap-1.5 text-rose-700">
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
              className={`h-full transition-all duration-500 ${amountNeeded === 0 ? 'bg-emerald-500' : 'bg-rose-600'}`}
              style={{ width: `${shippingPercent}%` }}
            />
          </div>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 divide-y divide-slate-100">
          {cart.items.length === 0 ? (
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
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            cart.items.map((item) => (
              <div key={item.id} className="pt-4 first:pt-0 flex items-start gap-3.5">
                <img 
                  src={item.product.images[0]} 
                  alt="" 
                  className="w-16 h-16 object-cover rounded-xl border border-slate-200 bg-slate-50 flex-shrink-0" 
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h5 
                      onClick={() => {
                        setIsCartOpen(false);
                        navigateTo('product-detail', { productSlug: item.product.slug });
                      }}
                      className="text-xs font-bold text-slate-900 hover:text-rose-600 transition-colors line-clamp-1 cursor-pointer"
                    >
                      {item.product.name}
                    </h5>
                    <button
                      onClick={() => removeCartItem(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-0.5 transition-colors"
                      title="Remove Item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {item.selectedVariant && (
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {item.selectedVariant.name}
                    </div>
                  )}

                  <div className="mt-2.5 flex items-center justify-between">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        className="p-1 text-slate-600 hover:bg-slate-200 rounded-l-lg transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-2.5 text-xs font-bold text-slate-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-slate-600 hover:bg-slate-200 rounded-r-lg transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900">
                        ${item.totalPrice.toFixed(2)}
                      </span>
                      {item.quantity > 1 && (
                        <div className="text-[10px] text-slate-400">
                          ${item.unitPrice.toFixed(2)} each
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
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
                  className="w-full py-2 pl-8 pr-3 bg-white border border-slate-200 rounded-xl text-xs uppercase placeholder:normal-case font-semibold text-slate-800 focus:outline-none focus:border-rose-500"
                />
                <Tag size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              <button
                type="submit"
                disabled={isApplying}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50"
              >
                Apply
              </button>
            </form>
            {couponError && (
              <p className="text-[11px] text-rose-600 font-medium">{couponError}</p>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600 pt-1 border-t border-slate-200/80">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">${cart.subtotal.toFixed(2)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-rose-600 font-medium">
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
                <span className="text-rose-600">${cart.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigateTo('checkout');
                }}
                className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
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
