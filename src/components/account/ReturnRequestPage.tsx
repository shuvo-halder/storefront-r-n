'use client';

import React, { useEffect, useState } from 'react';
import { SmartImage } from '../common/SmartImage';
import { AccountLayout } from './AccountLayout';
import { useStorefront } from '../../context/StorefrontContext';
import { storefrontApi } from '../../services/storefrontApi';
import { Order } from '../../types/storefront';
import { useForm, useFieldArray } from 'react-hook-form';
import { 
  ArrowLeft, 
  Package, 
  RefreshCcw, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  HelpCircle,
  FileText,
  ShieldCheck
} from 'lucide-react';

export const ReturnRequestPage: React.FC = () => {
  const { viewParams, navigateTo } = useStorefront();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const orderId = viewParams.id;

  const {
    register,
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm({
    defaultValues: {
      items: order?.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        selected: false,
        quantity: item.quantity,
        reason: '',
        condition: 'New'
      })) || []
    }
  });

  const { fields, replace } = useFieldArray({
    control,
    name: "items"
  });

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      setIsLoading(true);
      try {
        const data = await storefrontApi.getOrderById(orderId);
        setOrder(data);
        if (data) {
          replace(data.items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            selected: false,
            quantity: item.quantity,
            reason: '',
            condition: 'New'
          })));
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, replace]);

  const onSubmit = async (data: any) => {
    const selectedItems = data.items.filter((item: any) => item.selected);
    
    if (selectedItems.length === 0) {
      setSubmitError('Please select at least one item to return.');
      return;
    }

    setSubmitError(null);
    try {
      await storefrontApi.requestReturn(orderId!, {
        items: selectedItems.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          reason: item.reason,
          condition: item.condition
        }))
      });
      setIsSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit return request. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <AccountLayout activeTab="orders">
        <div className="min-h-[400px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </AccountLayout>
    );
  }

  if (!order) {
    return (
      <AccountLayout activeTab="orders">
        <div className="bg-white rounded-xl p-12 text-center border border-gray-200 shadow-xs">
          <AlertCircle size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900">Order Not Found</h3>
          <button onClick={() => navigateTo('orders')} className="mt-6 btn-primary text-xs">
            Back to Orders
          </button>
        </div>
      </AccountLayout>
    );
  }

  if (isSubmitted) {
    return (
      <AccountLayout activeTab="orders">
        <div className="max-w-xl mx-auto bg-white rounded-xl p-8 sm:p-12 text-center border border-gray-200 shadow-xs">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-100">
            <CheckCircle2 size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-3">Return Requested</h2>
          <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8">
            Your return request for order <span className="text-gray-900 font-semibold">#{order.id}</span> has been submitted successfully. 
            Our team will review your request and send you the shipping label within 24-48 hours.
          </p>
          <button 
            onClick={() => navigateTo('orders')}
            className="w-full py-2.5 bg-gray-900 text-white font-semibold text-xs rounded-lg hover:bg-gray-800 transition-colors shadow-xs cursor-pointer"
          >
            Back to Order History
          </button>
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout activeTab="orders">
      <div className="space-y-6">
        
        {/* Header */}
        <div>
          <button 
            onClick={() => navigateTo('order-details', { id: order.id })}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-primary transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Order Details</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Request Return</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">Select the items you wish to return and provide a reason.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-xs">
            <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2.5">
              <Package size={18} className="text-primary" />
              <span>Select Items</span>
            </h3>
            
            <div className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="flex items-start gap-4">
                    <div className="pt-1">
                       <input 
                         type="checkbox"
                         {...register(`items.${index}.selected`)}
                         className="w-4 h-4 rounded-sm text-primary focus:ring-primary border-gray-300 cursor-pointer"
                       />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 relative">
                          <SmartImage 
                            src={order.items[index].productImage} 
                            alt={field.productName} 
                            fill
                            fallbackType="product"
                            fallbackLabel={field.productName}
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-gray-900">{field.productName}</h4>
                          <p className="text-xs text-gray-500 font-medium mt-0.5">
                            {order.items[index].variantName || 'Standard Edition'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Quantity</label>
                          <select 
                            {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                            className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-primary"
                          >
                            {[...Array(order.items[index].quantity)].map((_, i) => (
                              <option key={i+1} value={i+1}>{i+1}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Condition</label>
                          <select 
                            {...register(`items.${index}.condition`)}
                            className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-primary"
                          >
                            <option value="New">Unopened / New</option>
                            <option value="Open">Opened / Like New</option>
                            <option value="Used">Lightly Used</option>
                            <option value="Defective">Defective / Damaged</option>
                          </select>
                        </div>
                        <div className="sm:col-span-1">
                          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Reason</label>
                          <select 
                            {...register(`items.${index}.reason`)}
                            className="block w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-primary"
                          >
                            <option value="">Select Reason</option>
                            <option value="wrong_item">Received wrong item</option>
                            <option value="defective">Item is defective</option>
                            <option value="better_price">Found better price elsewhere</option>
                            <option value="no_longer_needed">No longer needed</option>
                            <option value="performance">Poor performance</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 sm:p-8 border border-gray-200 shadow-xs">
             <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2.5">
               <FileText size={18} className="text-primary" />
               <span>Additional Details</span>
             </h3>
             <textarea 
               placeholder="Tell us more about the reason for your return (optional)..."
               className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-primary focus:border-primary transition-colors min-h-[120px]"
             />
             <div className="mt-6 flex items-center gap-3 p-4 bg-primary-light rounded-lg border border-primary/10">
                <HelpCircle size={18} className="text-primary flex-shrink-0" />
                <p className="text-xs text-gray-600 font-normal leading-relaxed">
                  By submitting this request, you agree to our <span className="text-primary font-semibold">Return Policy</span>. Items must be shipped back within 14 days of approval.
                </p>
             </div>
          </div>

          {submitError && (
             <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2.5 text-rose-700 text-xs font-semibold">
               <AlertCircle size={16} />
               <span>{submitError}</span>
             </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2 text-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
              <span>{isSubmitting ? 'Submitting...' : 'Submit Return Request'}</span>
            </button>
          </div>

        </form>

        <div className="text-center py-4">
           <div className="inline-flex items-center gap-1.5 text-xs text-gray-400 font-medium">
             <ShieldCheck size={14} className="text-primary" />
             <span>Vyzobd Purchase Protection Guaranteed</span>
           </div>
        </div>

      </div>
    </AccountLayout>
  );
};
