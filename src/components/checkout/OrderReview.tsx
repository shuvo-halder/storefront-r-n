import React from 'react';
import { Cart } from '../../types/storefront';
import { CheckoutFormData } from '../../types/checkout';
import { ShoppingBag, MapPin, Wallet } from 'lucide-react';

interface OrderReviewProps {
  cart: Cart;
  formData: CheckoutFormData;
}

export const OrderReview: React.FC<OrderReviewProps> = ({ cart, formData }) => {
  return (
    <div className="space-y-5">
      <h3 className="text-base font-bold text-[#111827]">Review Your Order</h3>
      
      {/* Items */}
      <div className="bg-[#F9FAFB] rounded-lg p-4 border border-[#E5E7EB]">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#E5E7EB]">
          <ShoppingBag size={15} className="text-[#DC2B53]" />
          <span className="text-xs font-bold text-[#111827]">Order Items ({cart.items.length})</span>
        </div>
        <div className="space-y-2.5">
          {cart.items.map((item) => (
            <div key={item.id} className="flex justify-between items-center text-xs">
              <span className="text-[#6B7280] font-medium truncate max-w-[240px]">
                {item.product.name} <span className="text-[#111827] font-semibold">× {item.quantity}</span>
              </span>
              <span className="font-semibold text-[#111827]">${item.totalPrice.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Shipping Info */}
        <div className="bg-white border border-[#E5E7EB] p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <MapPin size={14} className="text-[#DC2B53]" />
            <span className="text-xs font-bold text-[#111827]">Delivery Address</span>
          </div>
          <div className="text-xs text-[#6B7280] leading-relaxed">
            <div className="text-[#111827] font-semibold mb-0.5">{formData.shippingAddress.fullName}</div>
            <div>{formData.shippingAddress.addressLine1}</div>
            <div>{formData.shippingAddress.city}, {formData.shippingAddress.state} {formData.shippingAddress.postalCode}</div>
            <div>{formData.shippingAddress.country}</div>
          </div>
        </div>

        {/* Payment & Method */}
        <div className="bg-white border border-[#E5E7EB] p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Wallet size={14} className="text-[#DC2B53]" />
            <span className="text-xs font-bold text-[#111827]">Payment & Method</span>
          </div>
          <div className="text-xs text-[#6B7280] space-y-1">
            <div className="flex justify-between">
              <span>Payment:</span>
              <span className="text-[#111827] font-semibold uppercase">{formData.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span className="text-[#111827] font-semibold uppercase">{formData.shippingMethod}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="bg-[#111827] text-white p-5 rounded-lg space-y-2.5">
        <div className="flex justify-between text-xs text-gray-300">
          <span>Subtotal</span>
          <span className="font-semibold text-white">${cart.subtotal.toFixed(2)}</span>
        </div>
        {cart.discount > 0 && (
          <div className="flex justify-between text-xs text-emerald-400">
            <span>Discount ({cart.appliedCoupon})</span>
            <span className="font-semibold">-${cart.discount.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-xs text-gray-300">
          <span>Shipping</span>
          <span className="font-semibold text-white">
            {cart.shippingFee === 0 ? 'FREE' : `${cart.shippingFee.toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between text-xs text-gray-300">
          <span>Tax</span>
          <span className="font-semibold text-white">${cart.estimatedTax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-base font-bold pt-3 border-t border-gray-700">
          <span>Total</span>
          <span className="text-[#DC2B53]">${cart.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
