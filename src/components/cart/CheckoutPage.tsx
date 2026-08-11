import React, { useState } from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { ShippingAddress, OrderItem } from '../../types/storefront';
import { 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  CheckCircle2, 
  ArrowLeft, 
  Lock,
  Sparkles
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { cart, user, createCheckoutOrder, navigateTo } = useStorefront();

  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: user?.fullName || 'Alex Vance',
    email: user?.email || 'alex@example.com',
    phone: user?.phone || '+1 (555) 234-5678',
    addressLine1: '742 Evergreen Terrace',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94107',
    country: 'United States',
  });

  const [shippingMethod, setShippingMethod] = useState<'express' | 'overnight'>('express');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple' | 'cod'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shippingFee = shippingMethod === 'overnight' ? 18.00 : cart.shippingFee;
  const finalTotal = cart.subtotal - cart.discount + cart.estimatedTax + shippingFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.fullName || !shippingAddress.email || !shippingAddress.addressLine1) {
      alert('Please complete all required shipping address fields.');
      return;
    }

    setIsSubmitting(true);

    const orderItems: OrderItem[] = cart.items.map(item => ({
      productId: item.productId,
      productName: item.product.name,
      productImage: item.product.images[0],
      variantName: item.selectedVariant?.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
    }));

    try {
      await createCheckoutOrder({
        items: orderItems,
        shippingAddress,
        shippingMethod: shippingMethod === 'overnight' ? 'Priority Overnight (1 Business Day)' : 'Standard Express (2-3 Days)',
        paymentMethod: paymentMethod === 'card' ? 'Credit / Debit Card (**** 4242)' : paymentMethod === 'apple' ? 'Apple Pay' : 'Cash on Delivery',
        subtotal: cart.subtotal,
        discount: cart.discount,
        shippingFee,
        tax: cart.estimatedTax,
        totalAmount: finalTotal,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-lg font-bold text-slate-800">Your cart is empty</h2>
        <button onClick={() => navigateTo('shop')} className="mt-4 px-5 py-2.5 bg-rose-600 text-white font-bold text-xs rounded-xl">
          Return to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Secure Checkout
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter shipping address and complete your order.
            </p>
          </div>

          <button
            onClick={() => navigateTo('cart')}
            className="text-xs font-bold text-slate-700 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Cart</span>
          </button>
        </div>

        {/* Form & Summary */}
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Form Fields (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Shipping Address */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-rose-600 font-extrabold text-sm uppercase tracking-wider">
                <Truck size={18} />
                <span>1. Shipping Information</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.fullName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={shippingAddress.email}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, email: e.target.value })}
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">Country *</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.country}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, country: e.target.value })}
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700">Street Address *</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.addressLine1}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">City *</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700">State & ZIP Code *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      required
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      className="mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                      placeholder="CA"
                    />
                    <input
                      type="text"
                      required
                      value={shippingAddress.postalCode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                      className="mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                      placeholder="94107"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Method */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
              <div className="text-rose-600 font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <Truck size={18} />
                <span>2. Delivery Speed</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label 
                  onClick={() => setShippingMethod('express')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    shippingMethod === 'express' ? 'border-rose-600 bg-rose-50/50 ring-2 ring-rose-500/20' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <input type="radio" checked={shippingMethod === 'express'} onChange={() => {}} className="mt-1 text-rose-600" />
                  <div>
                    <div className="font-bold text-slate-900">Standard Express (2-3 Days)</div>
                    <div className="text-slate-500 mt-0.5">
                      {cart.shippingFee === 0 ? <span className="text-emerald-600 font-bold">FREE</span> : `$${cart.shippingFee.toFixed(2)}`}
                    </div>
                  </div>
                </label>

                <label 
                  onClick={() => setShippingMethod('overnight')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    shippingMethod === 'overnight' ? 'border-rose-600 bg-rose-50/50 ring-2 ring-rose-500/20' : 'border-slate-200 bg-slate-50'
                  }`}
                >
                  <input type="radio" checked={shippingMethod === 'overnight'} onChange={() => {}} className="mt-1 text-rose-600" />
                  <div>
                    <div className="font-bold text-slate-900">Priority Overnight</div>
                    <div className="text-slate-500 mt-0.5">$18.00 • Guaranteed next morning</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
              <div className="text-rose-600 font-extrabold text-sm uppercase tracking-wider flex items-center gap-2">
                <CreditCard size={18} />
                <span>3. Payment Option</span>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { id: 'card', label: 'Credit or Debit Card', desc: 'Encrypted via Stripe 256-bit SSL' },
                  { id: 'apple', label: 'Apple Pay / Google Pay', desc: 'Instant 1-Tap Checkout' },
                  { id: 'cod', label: 'Cash on Delivery', desc: 'Pay when delivered to doorstep' },
                ].map((pm) => (
                  <label
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id as any)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      paymentMethod === pm.id ? 'border-rose-600 bg-rose-50/50 ring-2 ring-rose-500/20' : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-slate-900">{pm.label}</div>
                      <div className="text-[11px] text-slate-500">{pm.desc}</div>
                    </div>
                    {paymentMethod === pm.id && <CheckCircle2 size={18} className="text-rose-600" />}
                  </label>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column Order Breakdown (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6 sticky top-28">
            <h3 className="font-extrabold text-base text-slate-900 pb-3 border-b border-slate-100">
              Items in Order ({cart.items.reduce((s, i) => s + i.quantity, 0)})
            </h3>

            {/* Thumbnails */}
            <div className="space-y-3 max-h-56 overflow-y-auto divide-y divide-slate-100 pr-1">
              {cart.items.map((item) => (
                <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <img src={item.product.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover border border-slate-200" />
                    <div>
                      <div className="font-bold text-slate-900 line-clamp-1">{item.product.name}</div>
                      <div className="text-[11px] text-slate-400">Qty: {item.quantity}</div>
                    </div>
                  </div>
                  <span className="font-bold text-slate-900">${item.totalPrice.toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-900">${cart.subtotal.toFixed(2)}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-rose-600 font-medium">
                  <span>Discount</span>
                  <span>-${cart.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-bold text-slate-900">
                  {shippingFee === 0 ? <span className="text-emerald-600">FREE</span> : `$${shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax</span>
                <span className="font-bold text-slate-900">${cart.estimatedTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-3 border-t border-slate-200">
                <span>Total Due</span>
                <span className="text-rose-600">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Complete Purchase CTA */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Lock size={16} />
              <span>{isSubmitting ? 'Processing Order...' : `Complete Purchase ($${finalTotal.toFixed(2)})`}</span>
            </button>

            <div className="text-[11px] text-slate-400 text-center flex items-center justify-center gap-1">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>30-Day Money Back Guarantee Included</span>
            </div>

          </div>

        </form>

      </div>
    </div>
  );
};
