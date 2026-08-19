'use client';

import React, { useState, useEffect } from 'react';
import { SmartImage } from '../common/SmartImage';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useStorefront } from '../../context/StorefrontContext';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useCart } from '../../hooks/useCart';
import { storefrontApi } from '../../services/storefrontApi';
import { checkoutSchema, CheckoutFormData } from '../../types/checkout';
import { AddressForm } from '../checkout/AddressForm';
import { PaymentStep } from '../checkout/PaymentStep';
import { 
  trackGA4BeginCheckout, 
  trackGA4AddShippingInfo,
  trackGA4AddPaymentInfo
} from '../../utils/analytics';
import { 
  ArrowLeft, 
  Loader2, 
  ShieldCheck, 
  ShoppingBag,
  Trash2,
  Tag
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { navigateTo, notifyError, notifySuccess } = useStorefront();
  const { user } = useAuth();
  let currency = 'BDT';
  try {
    const { settings } = useSettings();
    currency = settings?.general?.currency || 'BDT';
  } catch {
    // Fallback if rendered outside SettingsProvider
  }

  const { 
    cart, 
    isLoading: isCartLoading, 
    updateQuantity,
    removeCartItem,
    applyCoupon
  } = useCart();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const [localCoupon, setLocalCoupon] = useState('');
  const [isCouponExpanded, setIsCouponExpanded] = useState(false);

  const trackedBeginCheckoutKeyRef = React.useRef<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customer: {
        email: user?.email || '',
        firstName: user?.fullName?.split(' ')[0] || '',
        lastName: user?.fullName?.split(' ')[1] || '',
        phone: user?.phone || '',
      },
      shippingAddress: {
        fullName: user?.fullName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        addressLine1: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Bangladesh',
      },
      billingAddress: {
        sameAsShipping: true,
        fullName: user?.fullName || '',
        email: user?.email || '',
        phone: user?.phone || '',
        addressLine1: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Bangladesh',
      },
      shippingMethod: 'standard',
      paymentMethod: 'cod',
      couponCode: cart.appliedCoupon || '',
    },
  });

  const sameAsShipping = watch('billingAddress.sameAsShipping');
  const shippingAddress = watch('shippingAddress');

  // Auto-fill saved default address for authenticated users
  useEffect(() => {
    if (user) {
      storefrontApi.getAddresses().then((addresses) => {
        if (addresses && addresses.length > 0) {
          const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
          if (defaultAddr) {
            setValue('shippingAddress.fullName', defaultAddr.fullName || user.fullName || '');
            if (defaultAddr.email || user.email) setValue('shippingAddress.email', defaultAddr.email || user.email || '');
            if (defaultAddr.phone || user.phone) setValue('shippingAddress.phone', defaultAddr.phone || user.phone || '');
            if (defaultAddr.address1) setValue('shippingAddress.addressLine1', defaultAddr.address1);
            if (defaultAddr.city) setValue('shippingAddress.city', defaultAddr.city);
            if (defaultAddr.state) setValue('shippingAddress.state', defaultAddr.state);
            if (defaultAddr.postalCode) setValue('shippingAddress.postalCode', defaultAddr.postalCode);
            setValue('shippingAddress.country', defaultAddr.country || 'Bangladesh');
          }
        }
      }).catch(() => {
        // Silent error handling
      });
    }
  }, [user, setValue]);

  useEffect(() => {
    if (sameAsShipping) {
      setValue('billingAddress.fullName', shippingAddress.fullName);
      setValue('billingAddress.email', shippingAddress.email);
      setValue('billingAddress.phone', shippingAddress.phone);
      setValue('billingAddress.addressLine1', shippingAddress.addressLine1);
      setValue('billingAddress.city', shippingAddress.city);
      setValue('billingAddress.state', shippingAddress.state);
      setValue('billingAddress.postalCode', shippingAddress.postalCode);
      setValue('billingAddress.country', shippingAddress.country);
    }
  }, [sameAsShipping, shippingAddress, setValue]);

  // Sync applied coupon to form
  useEffect(() => {
    if (cart.appliedCoupon) {
      setValue('couponCode', cart.appliedCoupon);
    }
  }, [cart.appliedCoupon, setValue]);

  // GA4 begin_checkout
  useEffect(() => {
    if (cart.items.length > 0) {
      const couponCode = cart.appliedCoupon || watch('couponCode');
      const beginCheckoutKey = `begin_checkout_${cart.items.map(i => `${i.id}_${i.quantity}`).join(',')}_${cart.total}_${couponCode || ''}`;
      
      if (trackedBeginCheckoutKeyRef.current !== beginCheckoutKey) {
        trackedBeginCheckoutKeyRef.current = beginCheckoutKey;
        trackGA4BeginCheckout(cart.items, cart.total, currency, couponCode);
      }
    }
  }, [cart.items, cart.total, cart.appliedCoupon, currency]);

  const handleApplyCoupon = async () => {
    if (!localCoupon.trim()) {
      notifyError(new Error('Please enter a coupon code'), 'Empty Coupon');
      return;
    }
    await applyCoupon(localCoupon);
  };

  const handleRemoveCoupon = async () => {
    // If no backend removal, just clear local form state
    setLocalCoupon('');
    setValue('couponCode', '');
    notifySuccess('Coupon Removed', 'The coupon has been removed from your order.');
  };

  const onPlaceOrder: SubmitHandler<CheckoutFormData> = async (data) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      // Sync shipping contact info to customer if missing
      if (!data.customer.email) data.customer.email = data.shippingAddress.email || '';
      if (!data.customer.phone) data.customer.phone = data.shippingAddress.phone || '';
      if (!data.customer.firstName) {
        const parts = data.shippingAddress.fullName.trim().split(' ');
        data.customer.firstName = parts[0] || '';
        data.customer.lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
      }

      // Track Shipping & Payment info right before submission, since we skip wizard steps
      const couponCode = cart.appliedCoupon || data.couponCode;
      
      const methodTierMap: Record<string, string> = {
        standard: 'Standard Shipping',
        express: 'Express Shipping',
        overnight: 'Overnight Priority',
      };
      const shippingTier = methodTierMap[data.shippingMethod] || data.shippingMethod || 'Standard Shipping';
      trackGA4AddShippingInfo(cart.items, cart.total, shippingTier, currency, couponCode);

      const paymentType = data.paymentMethod || 'cod';
      trackGA4AddPaymentInfo(cart.items, cart.total, paymentType, currency, couponCode);

      const orderPayload = {
        ...data,
        items: cart.items.map(item => ({
          productId: item.productId,
          productName: item.product.name,
          productImage: item.product.images[0],
          variantName: item.selectedVariant?.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
        subtotal: cart.subtotal,
        discount: cart.discount,
        shippingFee: cart.shippingFee,
        tax: cart.estimatedTax,
        totalAmount: cart.total,
        status: 'Pending',
      };

      const createdOrder = await storefrontApi.checkoutComplete(orderPayload);
      
      const isCod = data.paymentMethod === 'cod';

      if (isCod) {
        navigateTo('order-confirmation', { confirmedOrder: createdOrder, orderId: createdOrder.id });
      } else {
        navigateTo('checkout-gateway', { orderId: createdOrder.id, method: data.paymentMethod });
      }
    } catch (err: any) {
      setServerError(err.message || 'An error occurred while placing your order. Please try again.');
      window.scrollTo(0, 0);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCartLoading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <Loader2 size={32} className="animate-spin text-[#DC2B53]" />
        <p className="text-xs text-[#6B7280] font-semibold">Synchronizing secure checkout...</p>
      </div>
    );
  }

  if (cart.items.length === 0 && !isSubmitting) {
    return (
      <div className="py-20 text-center max-w-md mx-auto px-4">
        <div className="w-14 h-14 bg-[#F9FAFB] rounded-full flex items-center justify-center mx-auto text-[#6B7280] mb-4 border border-[#E5E7EB]">
          <ShoppingBag size={24} />
        </div>
        <h2 className="text-lg font-bold text-[#111827]">Your cart is empty</h2>
        <p className="text-xs text-[#6B7280] mt-1 mb-5">Add items to your cart before proceeding to checkout.</p>
        <button 
          onClick={() => navigateTo('shop')}
          className="px-6 py-2.5 bg-[#DC2B53] hover:bg-[#C52247] text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
        >
          Explore Shop
        </button>
      </div>
    );
  }

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-12">
      {/* Simple Header */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigateTo('cart')} 
            className="flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#111827] transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to Cart</span>
          </button>
          
          <div className="flex flex-col items-center">
            <h1 className="text-base sm:text-lg font-bold text-[#111827]">Secure Checkout</h1>
          </div>
          
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="text-emerald-600 hidden sm:block" size={16} />
            <span className="text-[10px] sm:text-xs font-semibold text-[#6B7280] uppercase tracking-wider">
              <span className="hidden sm:inline">SSL </span>Secure
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        
        {serverError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm font-medium">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onPlaceOrder)} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Main Left Column */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Order Review (Compact) */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <h2 className="text-base font-bold text-[#111827]">Order Review ({cart.items.length})</h2>
              </div>
              <div className="p-5 space-y-4">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <div className="w-16 h-16 shrink-0 bg-[#F9FAFB] border border-[#E5E7EB] rounded-md overflow-hidden relative">
                      {item.product.images[0] ? (
                        <SmartImage src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#9CA3AF]">
                          <ShoppingBag size={18} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#111827] truncate">{item.product.name}</h4>
                      {item.selectedVariant && (
                        <p className="text-[11px] text-[#6B7280] mt-0.5">{item.selectedVariant.name}</p>
                      )}
                      
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-[#E5E7EB] rounded-md overflow-hidden bg-white">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-2 py-1 text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-semibold w-8 text-center">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-2 py-1 text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]"
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCartItem(item.id)}
                          className="text-[#6B7280] hover:text-[#DC2B53]"
                          title="Remove item"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-[#111827]">
                        {currency === 'BDT' ? '৳' : '$'}{item.totalPrice.toFixed(2)}
                      </div>
                      {item.quantity > 1 && (
                        <div className="text-[10px] text-[#6B7280] mt-1">
                          {currency === 'BDT' ? '৳' : '$'}{item.unitPrice.toFixed(2)} each
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Shipping Information */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <h2 className="text-base font-bold text-[#111827]">Shipping Information</h2>
              </div>
              <div className="p-5">
                <AddressForm 
                  register={register} 
                  errors={errors} 
                  prefix="shippingAddress" 
                  title="" 
                />
              </div>
            </div>

            {/* 3. Billing Information */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <h2 className="text-base font-bold text-[#111827]">Billing Information</h2>
              </div>
              <div className="p-5">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('billingAddress.sameAsShipping')}
                    className="w-4 h-4 rounded text-[#DC2B53] border-[#E5E7EB] focus:ring-[#DC2B53] accent-[#DC2B53]"
                  />
                  <span className="text-sm text-[#111827] font-medium">Billing address is the same as shipping address</span>
                </label>
                
                {!sameAsShipping && (
                  <div className="mt-5 pt-5 border-t border-[#E5E7EB]">
                    <AddressForm 
                      register={register} 
                      errors={errors} 
                      prefix="billingAddress" 
                      title="" 
                    />
                  </div>
                )}
              </div>
            </div>

            {/* 4. Payment Method */}
            <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-xs overflow-hidden">
              <div className="px-5 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <h2 className="text-base font-bold text-[#111827]">Payment Method</h2>
              </div>
              <div className="p-5">
                <PaymentStep 
                  register={register} 
                  errors={errors} 
                  watch={watch} 
                />
              </div>
            </div>

          </div>

          {/* Right Sidebar / Order Summary */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
            <div className="bg-white border border-[#E5E7EB] rounded-xl shadow-xs overflow-hidden flex flex-col">
              
              <div className="px-5 py-4 border-b border-[#E5E7EB] bg-[#F9FAFB]">
                <h2 className="text-base font-bold text-[#111827]">Order Summary</h2>
              </div>
              
              <div className="p-5 space-y-4">
                
                {/* Breakdown */}
                <div className="space-y-3 pb-4 border-b border-[#E5E7EB] text-sm">
                  <div className="flex justify-between text-[#6B7280]">
                    <span>Subtotal</span>
                    <span className="font-semibold text-[#111827]">{currency === 'BDT' ? '৳' : '$'}{cart.subtotal.toFixed(2)}</span>
                  </div>
                  
                  {cart.discount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span>
                      <span className="font-semibold">-{currency === 'BDT' ? '৳' : '$'}{cart.discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-[#6B7280]">
                    <span>Shipping</span>
                    <span className="font-semibold text-[#111827]">
                      {cart.shippingFee === 0 ? 'FREE' : `${currency === 'BDT' ? '৳' : '$'}${cart.shippingFee.toFixed(2)}`}
                    </span>
                  </div>
                  
                  {cart.estimatedTax > 0 && (
                    <div className="flex justify-between text-[#6B7280]">
                      <span>Tax</span>
                      <span className="font-semibold text-[#111827]">{currency === 'BDT' ? '৳' : '$'}{cart.estimatedTax.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {/* Final Total */}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-base font-bold text-[#111827]">Total</span>
                  <span className="text-xl font-bold text-[#DC2B53]">{currency === 'BDT' ? '৳' : '$'}{cart.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Coupon Section */}
              <div className="bg-[#F9FAFB] border-t border-[#E5E7EB] p-5">
                <button
                  type="button"
                  onClick={() => setIsCouponExpanded(!isCouponExpanded)}
                  className="flex items-center gap-2 text-sm font-semibold text-[#111827] hover:text-[#DC2B53] transition-colors w-full text-left"
                >
                  <Tag size={16} className="text-[#6B7280]" />
                  Have a coupon or gift voucher?
                </button>
                
                {isCouponExpanded && (
                  <div className="mt-4">
                    {cart.appliedCoupon ? (
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-emerald-700 text-sm font-bold">
                          <Tag size={14} />
                          {cart.appliedCoupon}
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={localCoupon}
                          onChange={(e) => setLocalCoupon(e.target.value)}
                          placeholder="Enter code"
                          className="flex-1 px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] focus:outline-none focus:border-[#DC2B53]"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          className="px-4 py-2 bg-[#111827] hover:bg-[#374151] text-white rounded-lg text-sm font-bold transition-colors shrink-0"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Customer Note */}
              <div className="bg-[#F9FAFB] border-t border-[#E5E7EB] p-5">
                <label className="block text-sm font-semibold text-[#111827] mb-2">Order Notes (Optional)</label>
                <textarea
                  className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-sm text-[#111827] focus:outline-none focus:border-[#DC2B53] resize-none"
                  rows={3}
                  placeholder="Notes about your order, e.g. special notes for delivery."
                />
              </div>

              {/* Terms and Submit */}
              <div className="p-5 border-t border-[#E5E7EB] space-y-4">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 w-4 h-4 rounded text-[#DC2B53] border-[#E5E7EB] focus:ring-[#DC2B53] accent-[#DC2B53]"
                  />
                  <span className="text-xs text-[#6B7280] leading-tight">
                    I agree to the <a href="/terms" className="text-[#DC2B53] hover:underline" target="_blank">Terms & Conditions</a>, <a href="/privacy" className="text-[#DC2B53] hover:underline" target="_blank">Privacy Policy</a>, and <a href="/refund-policy" className="text-[#DC2B53] hover:underline" target="_blank">Return & Refund Policy</a>.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={isSubmitting || cart.items.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#DC2B53] hover:bg-[#C52247] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-colors shadow-xs"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={18} />
                      <span>PLACE ORDER</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
