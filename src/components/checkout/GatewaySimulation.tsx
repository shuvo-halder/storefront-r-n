'use client';
import React, { useEffect, useState } from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { Loader2, ShieldCheck, Lock, Landmark } from 'lucide-react';

export const GatewaySimulation: React.FC = () => {
  const { viewParams, navigateTo } = useStorefront();
  const { orderId, method } = viewParams;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            // Randomly succeed or fail for simulation
            const success = Math.random() > 0.1;
            if (success) {
              navigateTo('checkout-success', { orderId });
            } else {
              navigateTo('checkout-failed', { orderId });
            }
          }, 1000);
          return 100;
        }
        return prev + 2;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [orderId, navigateTo]);

  const methodNames: Record<string, string> = {
    stripe: 'Stripe Secure Checkout',
    bkash: 'bKash Payment Gateway',
    nagad: 'Nagad Payment Gateway',
    sslcommerz: 'SSLCommerz Secure Pay',
  };

  return (
    <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-sm w-full space-y-8">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-4 border border-slate-100 shadow-sm relative overflow-hidden">
             <Landmark className="text-slate-900" size={32} />
             <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent"></div>
          </div>
          <h1 className="text-xl font-black text-slate-900 mb-1">{methodNames[method as string] || 'Secure Payment Gateway'}</h1>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Processing Transaction #{orderId}</p>
        </div>

        <div className="space-y-4">
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div 
              className="h-full bg-primary transition-all duration-300 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <span>Verifying Details</span>
            <span>{progress}%</span>
          </div>
        </div>

        <div className="pt-8 space-y-4 border-t border-slate-100">
          <div className="flex items-center justify-center gap-2 text-emerald-600">
            <ShieldCheck size={18} />
            <span className="text-xs font-bold">Bank-Grade Encryption Active</span>
          </div>
          <p className="text-[10px] text-slate-400 font-medium max-w-[250px] mx-auto">
            Please do not close this window or press the back button while your payment is being processed.
          </p>
          <div className="flex items-center justify-center gap-4 opacity-30">
            <Lock size={16} />
            <div className="w-px h-4 bg-slate-300"></div>
            <span className="text-[10px] font-black uppercase tracking-widest">PCI DSS Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
};
