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
        <div className="bg-white rounded-[40px] p-12 text-center border border-slate-100 shadow-sm">
          <AlertCircle size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-black text-slate-900">Order Not Found</h3>
          <button onClick={() => navigateTo('orders')} className="mt-8 px-8 py-3.5 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl">
            Back to Orders
          </button>
        </div>
      </AccountLayout>
    );
  }

  if (isSubmitted) {
    return (
      <AccountLayout activeTab="orders">
        <div className="max-w-xl mx-auto bg-white rounded-[40px] p-12 text-center border border-slate-100 shadow-2xl shadow-slate-200/50">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Return Requested</h2>
          <p className="text-slate-500 font-medium leading-relaxed mb-10">
            Your return request for order <span className="text-slate-900 font-bold">#{order.id}</span> has been submitted successfully. 
            Our team will review your request and send you the shipping label within 24-48 hours.
          </p>
          <button 
            onClick={() => navigateTo('orders')}
            className="w-full py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-all shadow-lg"
          >
            Back to Order History
          </button>
        </div>
      </AccountLayout>
    );
  }

  return (
    <AccountLayout activeTab="orders">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header */}
        <div>
          <button 
            onClick={() => navigateTo('order-details', { id: order.id })}
            className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors mb-2"
          >
            <ArrowLeft size={14} />
            <span>Back to Order Details</span>
          </button>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Request Return</h1>
          <p className="text-slate-500 font-medium mt-1">Select the items you wish to return and provide a reason.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
          <div className="bg-white rounded-[40px] p-8 sm:p-10 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3">
              <Package size={20} className="text-primary" />
              <span>Select Items</span>
            </h3>
            
            <div className="space-y-8">
              {fields.map((field, index) => (
                <div key={field.id} className="pb-8 border-b border-slate-50 last:border-0 last:pb-0">
                  <div className="flex items-start gap-6">
                    <div className="pt-1">
                       <input 
                         type="checkbox"
                         {...register(`items.${index}.selected`)}
                         className="w-5 h-5 rounded-lg text-primary focus:ring-primary border-slate-300"
                       />
                    </div>
                    <div className="flex-1 space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex-shrink-0 relative">
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
                          <h4 className="text-sm font-black text-slate-900">{field.productName}</h4>
                          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight mt-1">
                            {order.items[index].variantName || 'Standard Edition'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-2 duration-300" 
                           style={{ display: register(`items.${index}.selected`).name ? 'grid' : 'none' }}>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Quantity</label>
                          <select 
                            {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                            className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                          >
                            {[...Array(order.items[index].quantity)].map((_, i) => (
                              <option key={i+1} value={i+1}>{i+1}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Condition</label>
                          <select 
                            {...register(`items.${index}.condition`)}
                            className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                          >
                            <option value="New">Unopened / New</option>
                            <option value="Open">Opened / Like New</option>
                            <option value="Used">Lightly Used</option>
                            <option value="Defective">Defective / Damaged</option>
                          </select>
                        </div>
                        <div className="sm:col-span-1">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reason</label>
                          <select 
                            {...register(`items.${index}.reason`)}
                            className="block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
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

          <div className="bg-white rounded-[40px] p-8 sm:p-10 border border-slate-100 shadow-sm">
             <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-3">
               <FileText size={20} className="text-primary" />
               <span>Additional Details</span>
             </h3>
             <textarea 
               placeholder="Tell us more about the reason for your return (optional)..."
               className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[32px] text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[160px]"
             />
             <div className="mt-8 flex items-center gap-4 p-5 bg-primary/5 rounded-2xl border border-primary/10">
                <HelpCircle size={20} className="text-primary" />
                <p className="text-[11px] text-slate-600 font-medium">
                  By submitting this request, you agree to our <span className="text-primary font-bold">Return Policy</span>. Items must be shipped back within 14 days of approval.
                </p>
             </div>
          </div>

          {submitError && (
             <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl flex items-center gap-3 text-primary text-xs font-bold">
               <AlertCircle size={18} />
               {submitError}
             </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto px-12 py-4 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary transition-all flex items-center justify-center gap-3 disabled:bg-slate-300"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <RefreshCcw size={18} />}
              <span>{isSubmitting ? 'Submitting...' : 'Submit Return Request'}</span>
            </button>
          </div>

        </form>

        <div className="text-center py-6">
           <div className="inline-flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
             <ShieldCheck size={14} />
             <span>Vyzobd Security Purchase Protection Enabled</span>
           </div>
        </div>

      </div>
    </AccountLayout>
  );
};
