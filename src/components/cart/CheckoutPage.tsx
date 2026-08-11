import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useStorefront } from '../../context/StorefrontContext';
import { useCart } from '../../hooks/useCart';
import { storefrontApi } from '../../services/storefrontApi';
import { checkoutSchema, CheckoutFormData } from '../../types/checkout';
import { AddressForm } from '../checkout/AddressForm';
import { PaymentStep } from '../checkout/PaymentStep';
import { OrderReview } from '../checkout/OrderReview';
import { 
  trackGA4BeginCheckout, 
  trackGA4Purchase 
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
  Tag
} from 'lucide-react';

const STEPS = [
  { id: 'customer', title: 'Account', icon: User },
  { id: 'shipping', title: 'Shipping', icon: MapPin },
  { id: 'method', title: 'Delivery', icon: Truck },
  { id: 'payment', title: 'Payment', icon: CreditCard },
  { id: 'review', title: 'Review', icon: ClipboardCheck },
];

export const CheckoutPage: React.FC = () => {
  const { user, navigateTo } = useStorefront();
  const { cart, isLoading: isCartLoading, totalItemCount } = useCart();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

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

  useEffect(() => {
    if (cart.items.length > 0) {
      trackGA4BeginCheckout(cart.items, cart.total);
    }
  }, [cart.items.length]);

  const handleNextStep = async () => {
    const fieldsToValidate: any = {
      0: ['customer'],
      1: ['shippingAddress', 'billingAddress'],
      2: ['shippingMethod'],
      3: ['paymentMethod'],
    }[currentStep];

    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
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

      const result = await storefrontApi.checkoutComplete(orderPayload);
      
      trackGA4Purchase(result.order);

      if (result.paymentUrl) {
        // Production redirect
        window.location.href = result.paymentUrl;
      } else {
        navigateTo('order-confirmation', { orderId: result.order.id });
      }
    } catch (err: any) {
      setServerError(err.message || 'An error occurred while placing your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isCartLoading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-4">
        <Loader2 size={40} className="animate-spin text-primary" />
        <p className="text-slate-500 font-bold">Synchronizing secure checkout...</p>
      </div>
    );
  }

  if (cart.items.length === 0 && !isSubmitting) {
    return (
      <div className="py-20 text-center">
        <ShoppingBag size={48} className="mx-auto text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Your cart is empty</h2>
        <button 
          onClick={() => navigateTo('shop')}
          className="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-bold"
        >
          Go to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={handleBack} className="p-2 -ml-2 text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="text-emerald-500" size={18} />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secure 256-bit Checkout</span>
            </div>
            <h1 className="text-xl font-black text-slate-900">Secure Checkout</h1>
          </div>
          <div className="w-10"></div>
        </div>

        {/* Progress Bar */}
        <div className="mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 -translate-y-1/2 -z-0"></div>
          <div className="flex justify-between relative z-10">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = currentStep > idx;
              const isActive = currentStep === idx;

              return (
                <div key={step.id} className="flex flex-col items-center group">
                  <div className={`
                    w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-300
                    ${isCompleted ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 
                      isActive ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 
                      'bg-white border-2 border-slate-200 text-slate-400'}
                  `}>
                    {isCompleted ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                  </div>
                  <span className={`text-[10px] font-bold mt-2 uppercase tracking-tight ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Form Area */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
            <form onSubmit={handleSubmit(onPlaceOrder)}>
              
              {/* Step 0: Customer Info */}
              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                      <User size={16} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Customer Information</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                      <input
                        {...register('customer.email')}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                        placeholder="your@email.com"
                      />
                      {errors.customer?.email && <p className="text-primary text-[10px] mt-1 font-bold">{errors.customer.email.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">First Name</label>
                      <input
                        {...register('customer.firstName')}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                      />
                      {errors.customer?.firstName && <p className="text-primary text-[10px] mt-1 font-bold">{errors.customer.firstName.message}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Last Name</label>
                      <input
                        {...register('customer.lastName')}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                      />
                      {errors.customer?.lastName && <p className="text-primary text-[10px] mt-1 font-bold">{errors.customer.lastName.message}</p>}
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                      <input
                        {...register('customer.phone')}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                        placeholder="+8801..."
                      />
                      {errors.customer?.phone && <p className="text-primary text-[10px] mt-1 font-bold">{errors.customer.phone.message}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 1: Shipping & Billing */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <AddressForm 
                    register={register} 
                    errors={errors} 
                    prefix="shippingAddress" 
                    title="Shipping Address" 
                  />
                  
                  <div className="pt-6 border-t border-slate-100">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          {...register('billingAddress.sameAsShipping')}
                          className="peer hidden"
                        />
                        <div className="w-5 h-5 rounded border-2 border-slate-300 peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                          <CheckCircle2 size={12} className="text-white" />
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
                        Billing address is the same as shipping
                      </span>
                    </label>

                    {!sameAsShipping && (
                      <div className="mt-8 pt-8 border-t border-dashed border-slate-200">
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
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                      <Truck size={16} />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900">Delivery Information</h2>
                  </div>
                  <div className="space-y-4">
                    {[
                      { id: 'standard', name: 'Standard Shipping', time: '3-5 business days', price: 0 },
                      { id: 'express', name: 'Express Shipping', time: '1-2 business days', price: 12.00 },
                      { id: 'overnight', name: 'Overnight Priority', time: 'Next day delivery', price: 25.00 },
                    ].map((method) => (
                      <label 
                        key={method.id}
                        className={`
                          flex items-center justify-between p-4 rounded-2xl border-2 transition-all cursor-pointer
                          ${watch('shippingMethod') === method.id ? 'border-primary bg-primary/5/30' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}
                        `}
                      >
                        <div className="flex items-center gap-4">
                          <input type="radio" value={method.id} {...register('shippingMethod')} className="hidden" />
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${watch('shippingMethod') === method.id ? 'border-primary' : 'border-slate-300'}`}>
                            {watch('shippingMethod') === method.id && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900">{method.name}</div>
                            <div className="text-[10px] text-slate-500 font-medium">{method.time}</div>
                          </div>
                        </div>
                        <div className="text-sm font-black text-slate-900">
                          {method.price === 0 ? 'FREE' : `$${method.price.toFixed(2)}`}
                        </div>
                      </label>
                    ))}
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
                <div className="mt-6 p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-center gap-3 text-primary">
                  <CheckCircle2 size={18} className="rotate-45" />
                  <p className="text-xs font-bold">{serverError}</p>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-12 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Back
                </button>
                
                {currentStep < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1 sm:flex-none px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 group shadow-lg"
                  >
                    <span>Continue</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none px-12 py-4 bg-primary hover:bg-primary disabled:bg-slate-300 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <ShieldCheck size={18} />
                    )}
                    <span>{isSubmitting ? 'Processing Order...' : 'Complete Purchase'}</span>
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Sidebar / Summary Mini */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs sticky top-24">
              <h3 className="text-sm font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">Checkout Summary</h3>
              <div className="space-y-4 mb-6">
                {cart.items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img src={item.product.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-50 border border-slate-100" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] font-bold text-slate-900 line-clamp-1">{item.product.name}</div>
                      <div className="text-[9px] text-slate-400 font-medium">Qty: {item.quantity} • ${item.unitPrice.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
                {cart.items.length > 3 && (
                  <div className="text-[10px] text-slate-400 text-center font-bold">
                    + {cart.items.length - 3} more items
                  </div>
                )}
              </div>

              <div className="space-y-2 pb-4 border-b border-slate-100 mb-4">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Subtotal ({totalItemCount} items)</span>
                  <span className="font-bold text-slate-700">${cart.subtotal.toFixed(2)}</span>
                </div>
                {cart.discount > 0 ? (
                  <div className="flex justify-between text-xs text-emerald-600">
                    <span className="flex items-center gap-1"><Tag size={12}/> Discount ({cart.appliedCoupon})</span>
                    <span className="font-bold">-${cart.discount.toFixed(2)}</span>
                  </div>
                ) : (
                  <div className="pt-2">
                    <button 
                      type="button"
                      onClick={() => {
                        const code = prompt('Enter coupon code:');
                        if (code) {
                          // We'd ideally use a mutation here, but for now we can just show it pre-filled
                          // In a real app, this would trigger an API call to recalculate totals
                        }
                      }}
                      className="text-[10px] font-bold text-primary hover:text-primary flex items-center gap-1"
                    >
                      <Tag size={12} />
                      <span>Have a promo code?</span>
                    </button>
                  </div>
                )}
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Shipping</span>
                  <span className="font-bold text-slate-700">
                    {cart.shippingFee === 0 ? 'FREE' : `$${cart.shippingFee.toFixed(2)}`}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">Grand Total</span>
                <span className="text-lg font-black text-primary font-mono">${cart.total.toFixed(2)}</span>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl flex items-center gap-3">
                <Lock size={16} className="text-emerald-600" />
                <div className="text-[10px] text-emerald-800 font-bold leading-tight">
                  End-to-end encrypted and fully compliant payment processing.
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
