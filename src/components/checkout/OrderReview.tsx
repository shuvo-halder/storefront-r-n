import React from 'react';
import { Cart } from '../../types/storefront';
import { CheckoutFormData } from '../../types/checkout';
import { ShoppingBag, MapPin, Truck, Wallet } from 'lucide-react';

interface OrderReviewProps {
  cart: Cart;
  formData: CheckoutFormData;
}

export const OrderReview: React.FC<OrderReviewProps> = ({ cart, formData }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-slate-900">Order Summary</h3>
      
      {/* Items */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200">
          <ShoppingBag size={16} className="text-primary" />
          <span className="text-xs font-bold text-slate-700">Products ({cart.items.length})</span>
        </div>
        <div className="space-y-3">
          {cart.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-xs">
              <span className="text-slate-600 font-medium truncate max-w-[200px]">
                {item.product.name} <span className="text-slate-400">x{item.quantity}</span>
              </span>
              <span className="font-bold text-slate-900">${item.totalPrice.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Shipping Info */}
        <div className="bg-white border border-slate-100 p-4 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={14} className="text-primary" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-tight">Delivery Address</span>
          </div>
          <div className="text-[11px] text-slate-500 leading-relaxed font-medium">
            <div className="text-slate-800 font-bold mb-1">{formData.shippingAddress.fullName}</div>
            <div>{formData.shippingAddress.addressLine1}</div>
            <div>{formData.shippingAddress.city}, {formData.shippingAddress.state} {formData.shippingAddress.postalCode}</div>
            <div>{formData.shippingAddress.country}</div>
          </div>
        </div>

        {/* Payment & Method */}
        <div className="bg-white border border-slate-100 p-4 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={14} className="text-primary" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-tight">Payment & Shipping</span>
          </div>
          <div className="text-[11px] text-slate-500 space-y-1 font-medium">
            <div className="flex justify-between">
              <span>Method:</span>
              <span className="text-slate-800 font-bold uppercase">{formData.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span className="text-slate-800 font-bold uppercase">{formData.shippingMethod}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="bg-slate-900 text-white p-5 rounded-3xl space-y-3">
        <div className="flex justify-between text-xs opacity-70">
          <span>Subtotal</span>
          <span className="font-bold">${cart.subtotal.toFixed(2)}</span>
        </div>
        {cart.discount > 0 && (
          <div className="flex justify-between text-xs text-emerald-400">
            <span>Discount ({cart.appliedCoupon})</span>
            <span className="font-bold">-${cart.discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-xs opacity-70">
          <span>Shipping</span>
          <span className="font-bold">${cart.shippingFee.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs opacity-70">
          <span>Tax</span>
          <span className="font-bold">${cart.estimatedTax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-black pt-3 border-t border-white/10">
          <span>Total</span>
          <span className="text-primary font-mono">${cart.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
