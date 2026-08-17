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
    <div className="fixed inset-0 bg-[#F9FAFB] z-[9999] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-sm w-full bg-white border border-[#E5E7EB] rounded-xl p-8 shadow-xs space-y-6">
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 bg-[#FDF0F3] rounded-full flex items-center justify-center mb-3 border border-[#DC2B53]/20">
             <Landmark className="text-[#DC2B53]" size={26} />
          </div>
          <h1 className="text-base font-bold text-[#111827] mb-1">{methodNames[method as string] || 'Secure Payment Gateway'}</h1>
          <p className="text-xs text-[#6B7280]">Processing Transaction #{orderId}</p>
        </div>

        <div className="space-y-2.5">
          <div className="w-full h-2 bg-[#F9FAFB] rounded-full overflow-hidden border border-[#E5E7EB]">
            <div 
              className="h-full bg-[#DC2B53] transition-all duration-300 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-[11px] font-medium text-[#6B7280]">
            <span>Verifying Details</span>
            <span className="font-semibold text-[#111827]">{progress}%</span>
          </div>
        </div>

        <div className="pt-6 space-y-3 border-t border-[#E5E7EB]">
          <div className="flex items-center justify-center gap-1.5 text-emerald-600">
            <ShieldCheck size={16} />
            <span className="text-xs font-semibold">Bank-Grade Encryption Active</span>
          </div>
          <p className="text-[11px] text-[#6B7280] leading-relaxed max-w-[260px] mx-auto">
            Please do not close this window or press the back button while your payment is being processed.
          </p>
          <div className="flex items-center justify-center gap-2 pt-2 text-[#6B7280] text-[10px] font-medium">
            <Lock size={12} />
            <span>PCI DSS Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
};
