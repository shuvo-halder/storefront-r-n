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
import { OrderReview } from '../checkout/OrderReview';
import { 
  trackGA4BeginCheckout, 
  trackGA4AddShippingInfo,
  trackGA4AddPaymentInfo
} from '../../utils/analytics';
import { 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Loader2, 
  ShieldCheck, 
  ShoppingBag,
  User,
  MapPin,
  Truck,
  CreditCard,
  ClipboardCheck,
  Tag,
  Lock
} from 'lucide-react';

const STEPS = [
  { id: 'customer', title: 'Account', icon: User },
  { id: 'shipping', title: 'Shipping', icon: MapPin },
  { id: 'method', title: 'Delivery', icon: Truck },
  { id: 'payment', title: 'Payment', icon: CreditCard },
  { id: 'review', title: 'Review', icon: ClipboardCheck },
];

export const CheckoutPage: React.FC = () => {
  const { navigateTo } = useStorefront();
  const { user } = useAuth();
  let currency = 'BDT';
  try {
    const { settings } = useSettings();
    currency = settings?.general?.currency || 'BDT';
  } catch {
    // Fallback if rendered outside SettingsProvider
  }

  const { cart, isLoading: isCartLoading, totalItemCount } = useCart();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const trackedBeginCheckoutKeyRef = React.useRef<string | null>(null);
  const trackedShippingKeyRef = React.useRef<string | null>(null);
  const trackedPaymentKeyRef = React.useRef<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
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
        country: 'United States',
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
        country: 'United States',
      },
      shippingMethod: 'standard',
      paymentMethod: 'stripe',
      couponCode: cart.appliedCoupon || '',
    },
  });

  const sameAsShipping = watch('billingAddress.sameAsShipping');
  const shippingAddress = watch('shippingAddress');

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

  const handleNextStep = async () => {
    const fieldsToValidate: any = {
      0: ['customer'],
      1: sameAsShipping ? ['shippingAddress'] : ['shippingAddress', 'billingAddress'],
      2: ['shippingMethod'],
      3: ['paymentMethod'],
    }[currentStep];

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      const couponCode = cart.appliedCoupon || watch('couponCode');

      if (currentStep === 2) {
        // Step 2 = Delivery / Shipping Method
        const methodId = watch('shippingMethod');
        const methodTierMap: Record<string, string> = {
          standard: 'Standard Shipping',
          express: 'Express Shipping',
          overnight: 'Overnight Priority',
        };
        const shippingTier = methodTierMap[methodId] || methodId || 'Standard Shipping';
        const shippingKey = `shipping_${methodId}_${cart.total}_${couponCode || ''}`;

        if (trackedShippingKeyRef.current !== shippingKey) {
          trackedShippingKeyRef.current = shippingKey;
          trackGA4AddShippingInfo(cart.items, cart.total, shippingTier, currency, couponCode);
        }
      } else if (currentStep === 3) {
        // Step 3 = Payment Method
        const paymentType = watch('paymentMethod') || 'stripe';
        const paymentKey = `payment_${paymentType}_${cart.total}_${couponCode || ''}`;

        if (trackedPaymentKeyRef.current !== paymentKey) {
          trackedPaymentKeyRef.current = paymentKey;
          trackGA4AddPaymentInfo(cart.items, cart.total, paymentType, currency, couponCode);
        }
      }

      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
      window.scrollTo(0, 0);
    }
  };

  const handleBack = () => {
    if (currentStep === 0) {
      navigateTo('cart');
    } else {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const onPlaceOrder: SubmitHandler<CheckoutFormData> = async (data) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
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
        // Navigate to order-confirmation where the authoritative purchase event is tracked
        navigateTo('order-confirmation', { confirmedOrder: createdOrder, orderId: createdOrder.id });
      } else {
        // Online payments (bKash, Nagad, SSLCommerz, Stripe):
        // DO NOT fire purchase here. Route to Gateway Simulation for payment authorization.
        navigateTo('checkout-gateway', { orderId: createdOrder.id, method: data.paymentMethod });
      }
    } catch (err: any) {
      setServerError(err.message || 'An error occurred while placing your order. Please try again.');
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
    <div className="bg-[#F9FAFB] min-h-screen py-8 sm:py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#E5E7EB]">
          <button 
            onClick={handleBack} 
            className="flex items-center gap-1.5 text-xs font-semibold text-[#6B7280] hover:text-[#111827] transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1.5 mb-0.5">
              <ShieldCheck className="text-emerald-600" size={16} />
              <span className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider">256-bit Secure Checkout</span>
            </div>
            <h1 className="text-lg font-bold text-[#111827]">Checkout</h1>
          </div>
          <div className="w-12"></div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 relative max-w-xl mx-auto">
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-[#E5E7EB] -translate-y-1/2 -z-0"></div>
          <div className="flex justify-between relative z-10">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = currentStep > idx;
              const isActive = currentStep === idx;

              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center transition-all text-xs font-bold
                    ${isCompleted ? 'bg-emerald-600 text-white' : 
                      isActive ? 'bg-[#DC2B53] text-white ring-4 ring-[#FDF0F3]' : 
                      'bg-white border border-[#E5E7EB] text-[#6B7280]'}
                  `}>
                    {isCompleted ? <CheckCircle2 size={16} /> : <Icon size={14} />}
                  </div>
                  <span className={`text-[11px] font-semibold mt-1.5 ${isActive ? 'text-[#DC2B53]' : isCompleted ? 'text-[#111827]' : 'text-[#6B7280]'}`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Form Area */}
          <div className="lg:col-span-8 bg-white border border-[#E5E7EB] rounded-xl p-5 sm:p-7 shadow-xs">
            <form onSubmit={handleSubmit(onPlaceOrder)}>
              
              {/* Step 0: Customer Info */}
              {currentStep === 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#E5E7EB]">
                    <User size={18} className="text-[#DC2B53]" />
                    <h2 className="text-base font-bold text-[#111827]">Customer Information</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#111827] mb-1">Email Address</label>
                      <input
                        {...register('customer.email')}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] focus:outline-none focus:border-[#DC2B53]"
                        placeholder="your@email.com"
                      />
                      {errors.customer?.email && <p className="text-[#DC2626] text-[11px] mt-1 font-medium">{errors.customer.email.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#111827] mb-1">First Name</label>
                      <input
                        {...register('customer.firstName')}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] focus:outline-none focus:border-[#DC2B53]"
                        placeholder="First name"
                      />
                      {errors.customer?.firstName && <p className="text-[#DC2626] text-[11px] mt-1 font-medium">{errors.customer.firstName.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#111827] mb-1">Last Name</label>
                      <input
                        {...register('customer.lastName')}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] focus:outline-none focus:border-[#DC2B53]"
                        placeholder="Last name"
                      />
                      {errors.customer?.lastName && <p className="text-[#DC2626] text-[11px] mt-1 font-medium">{errors.customer.lastName.message}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#111827] mb-1">Phone Number</label>
                      <input
                        {...register('customer.phone')}
                        className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] focus:outline-none focus:border-[#DC2B53]"
                        placeholder="+1 (555) 000-0000"
                      />
                      {errors.customer?.phone && <p className="text-[#DC2626] text-[11px] mt-1 font-medium">{errors.customer.phone.message}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Shipping & Billing */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <AddressForm 
                    register={register} 
                    errors={errors} 
                    prefix="shippingAddress" 
                    title="Shipping Address" 
                  />
                  
                  <div className="pt-4 border-t border-[#E5E7EB]">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        {...register('billingAddress.sameAsShipping')}
                        className="w-4 h-4 rounded text-[#DC2B53] border-[#E5E7EB] focus:ring-[#DC2B53] accent-[#DC2B53]"
                      />
                      <span className="text-xs font-medium text-[#111827]">
                        Billing address is the same as shipping
                      </span>
                    </label>

                    {!sameAsShipping && (
                      <div className="mt-6 pt-6 border-t border-dashed border-[#E5E7EB]">
                        <AddressForm 
                          register={register} 
                          errors={errors} 
                          prefix="billingAddress" 
                          title="Billing Address" 
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Shipping Method */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#E5E7EB]">
                    <Truck size={18} className="text-[#DC2B53]" />
                    <h2 className="text-base font-bold text-[#111827]">Delivery Options</h2>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { id: 'standard', name: 'Standard Shipping', time: '3-5 business days', price: 0 },
                      { id: 'express', name: 'Express Shipping', time: '1-2 business days', price: 12.00 },
                      { id: 'overnight', name: 'Overnight Priority', time: 'Next day delivery', price: 25.00 },
                    ].map((method) => {
                      const isSelected = watch('shippingMethod') === method.id;
                      return (
                        <label 
                          key={method.id}
                          className={`
                            flex items-center justify-between p-3.5 rounded-lg border transition-colors cursor-pointer
                            ${isSelected ? 'border-[#DC2B53] bg-[#FDF0F3] ring-1 ring-[#DC2B53]' : 'border-[#E5E7EB] bg-white hover:border-[#111827]'}
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <input type="radio" value={method.id} {...register('shippingMethod')} className="hidden" />
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#DC2B53]' : 'border-[#E5E7EB]'}`}>
                              {isSelected && <div className="w-2 h-2 rounded-full bg-[#DC2B53]" />}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-[#111827]">{method.name}</div>
                              <div className="text-[11px] text-[#6B7280]">{method.time}</div>
                            </div>
                          </div>
                          <div className="text-xs font-bold text-[#111827]">
                            {method.price === 0 ? 'FREE' : `${method.price.toFixed(2)}`}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Payment Method */}
              {currentStep === 3 && (
                <PaymentStep register={register} errors={errors} watch={watch} />
              )}

              {/* Step 4: Final Review */}
              {currentStep === 4 && (
                <OrderReview cart={cart} formData={watch()} />
              )}

              {/* Server Error Message */}
              {serverError && (
                <div className="mt-5 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2.5 text-[#DC2626]">
                  <CheckCircle2 size={16} className="rotate-45 flex-shrink-0" />
                  <p className="text-xs font-medium">{serverError}</p>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-8 pt-5 border-t border-[#E5E7EB] flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-2.5 text-xs font-semibold text-[#6B7280] hover:text-[#111827] transition-colors"
                >
                  Back
                </button>
                
                {currentStep < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-2.5 bg-[#111827] hover:bg-[#1F2937] text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-2"
                  >
                    <span>Continue</span>
                    <ArrowRight size={14} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-7 py-3 bg-[#DC2B53] hover:bg-[#C52247] disabled:bg-gray-300 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
                  >
                    {isSubmitting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <ShieldCheck size={16} />
                    )}
                    <span>{isSubmitting ? 'Processing Order...' : 'Complete Purchase'}</span>
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Sidebar / Summary Mini */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 shadow-xs sticky top-24">
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider mb-4 pb-3 border-b border-[#E5E7EB]">Summary</h3>
              <div className="space-y-3 mb-5">
                {cart.items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-md overflow-hidden bg-[#F9FAFB] border border-[#E5E7EB] relative flex-shrink-0">
                      <SmartImage 
                        src={item.selectedVariant?.image || item.product.images[0]} 
                        alt={item.product.name} 
                        fill
                        fallbackType="product"
                        fallbackLabel={item.product.name}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-[#111827] truncate">{item.product.name}</div>
                      <div className="text-[11px] text-[#6B7280]">Qty: {item.quantity} • ${item.unitPrice.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
                {cart.items.length > 3 && (
                  <div className="text-[11px] text-[#6B7280] text-center font-medium pt-1">
                    + {cart.items.length - 3} more items
                  </div>
                )}
              </div>

              <div className="space-y-2 pb-4 border-b border-[#E5E7EB] mb-4">
                <div className="flex justify-between text-xs text-[#6B7280]">
                  <span>Subtotal ({totalItemCount} items)</span>
                  <span className="font-semibold text-[#111827]">${cart.subtotal.toFixed(2)}</span>
                </div>
                {cart.discount > 0 ? (
                  <div className="flex justify-between text-xs text-emerald-600">
                    <span className="flex items-center gap-1"><Tag size={12}/> Discount ({cart.appliedCoupon})</span>
                    <span className="font-semibold">-${cart.discount.toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="pt-1">
                    <button 
                      type="button"
                      onClick={() => {
                        const code = prompt('Enter coupon code:');
                        if (code) {
                          // Pre-fill or handle code
                        }
                      }}
                      className="text-[11px] font-semibold text-[#DC2B53] hover:text-[#C52247] flex items-center gap-1"
                    >
                      <Tag size={12} />
                      <span>Have a coupon?</span>
                    </button>
                  </div>
                )}
                <div className="flex justify-between text-xs text-[#6B7280]">
                  <span>Shipping</span>
                  <span className="font-semibold text-[#111827]">
                    {cart.shippingFee === 0 ? 'FREE' : `${cart.shippingFee.toFixed(2)}`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <span className="text-xs font-bold text-[#111827]">Total</span>
                <span className="text-base font-bold text-[#DC2B53]">${cart.total.toFixed(2)}</span>
              </div>

              <div className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg flex items-center gap-2.5">
                <Lock size={14} className="text-emerald-600 flex-shrink-0" />
                <div className="text-[11px] text-[#6B7280] leading-snug">
                  Encrypted and compliant checkout transaction.
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
