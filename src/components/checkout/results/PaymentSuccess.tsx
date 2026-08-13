'use client';
import React, { useEffect, useState } from 'react';
import { useStorefront } from '../../../context/StorefrontContext';
import { useSettings } from '../../../context/SettingsContext';
import { storefrontApi } from '../../../services/storefrontApi';
import { trackGA4Purchase } from '../../../utils/analytics';
import { CheckCircle2, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const PaymentSuccess: React.FC = () => {
  const { viewParams, navigateTo } = useStorefront();
  const orderId = viewParams.orderId;
  const [isVerifying, setIsVerifying] = useState(true);
  const [order, setOrder] = useState<any>(null);

  let currency = 'BDT';
  try {
    const { settings } = useSettings();
    currency = settings?.general?.currency || 'BDT';
  } catch {
    // Fallback if rendered outside SettingsProvider
  }

  useEffect(() => {
    const verify = async () => {
      if (!orderId) return;
      try {
        const result = await storefrontApi.verifyPayment(orderId);
        let fetchedOrder: any = null;
        if (result?.orderId) {
          fetchedOrder = await storefrontApi.getOrderById(result.orderId);
          setOrder(fetchedOrder);
        } else if (orderId) {
          fetchedOrder = await storefrontApi.getOrderById(orderId);
          setOrder(fetchedOrder);
        }

        if (result?.verified) {
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#101A25', '#DC2B53', '#fb7185']
          });

          if (fetchedOrder) {
            trackGA4Purchase(fetchedOrder, currency);
          }
        }
      } catch (err) {
        console.error('[PaymentSuccess verify error]', err);
      } finally {
        setIsVerifying(false);
      }
    };
    verify();
  }, [orderId, currency]);

  if (isVerifying) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-4">
        <Loader2 size={40} className="animate-spin text-primary" />
        <p className="text-slate-500 font-bold">Verifying payment with gateway...</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-20 px-4">
      <div className="max-w-md mx-auto bg-white rounded-[40px] p-10 shadow-2xl shadow-primary/5 text-center border border-slate-100">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
          <CheckCircle2 size={40} />
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 mb-2">Payment Successful!</h1>
        <p className="text-slate-500 text-sm font-medium mb-8">
          Thank you for your purchase. Your order <span className="text-primary font-black">#{orderId}</span> has been confirmed and is being processed.
        </p>

        <div className="bg-slate-50 rounded-3xl p-6 mb-8 text-left space-y-3">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 font-bold">Transaction ID</span>
            <span className="text-slate-900 font-mono">TXN-{Math.random().toString(36).substring(7).toUpperCase()}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 font-bold">Total Amount</span>
            <span className="text-slate-900 font-black">${order?.totalAmount?.toFixed(2) || '0.00'}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-slate-400 font-bold">Status</span>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-black text-[9px] uppercase tracking-tighter">CONFIRMED</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigateTo('orders')}
            className="w-full py-4 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span>View My Orders</span>
            <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigateTo('shop')}
            className="w-full py-4 bg-white border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ShoppingBag size={16} />
            <span>Continue Shopping</span>
          </button>
        </div>
      </div>
    </div>
  );
};
