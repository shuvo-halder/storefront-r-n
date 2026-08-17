'use client';

import React, { useEffect, useState } from 'react';
import { useStorefront } from '../../../context/StorefrontContext';
import { storefrontApi } from '../../../services/storefrontApi';
import { Loader2, ShieldCheck, Lock, AlertCircle, RefreshCw } from 'lucide-react';

export const PaymentPending: React.FC = () => {
  const { viewParams, navigateTo } = useStorefront();
  const orderId = viewParams.orderId;
  const transactionId = viewParams.id || orderId;

  const [status, setStatus] = useState<'verifying' | 'pending' | 'failed'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    let attempts = 0;

    const checkStatus = async () => {
      if (!transactionId) return;
      
      try {
        attempts++;
        const res = await storefrontApi.verifyPayment(transactionId);
        
        if (res.verified) {
          navigateTo('checkout-success', { orderId: res.orderId || orderId });
          return;
        }

        if (attempts > 5) {
          setStatus('pending');
        } else {
          timer = setTimeout(checkStatus, 3000);
        }
      } catch (err: any) {
        setErrorMessage(err?.message || 'Payment status verification failed.');
        setStatus('failed');
      }
    };

    checkStatus();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [transactionId, orderId, navigateTo]);

  return (
    <div className="bg-[#F9FAFB] min-h-screen py-16 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl p-8 shadow-xs text-center border border-[#E5E7EB]">
        
        {status === 'verifying' ? (
          <>
            <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-500 border border-amber-200">
              <Loader2 size={28} className="animate-spin text-amber-600" />
            </div>
            
            <h1 className="text-xl font-bold text-[#111827] mb-1.5">Verifying Payment...</h1>
            <p className="text-[#6B7280] text-xs font-normal mb-6 leading-relaxed">
              We are connecting with the payment gateway to confirm your transaction for Order <span className="text-[#111827] font-semibold">#{orderId}</span>.
            </p>

            <div className="p-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg flex items-center justify-center gap-2 text-[#6B7280] text-xs font-medium mb-6">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span>Verifying with Payment Provider</span>
            </div>
          </>
        ) : status === 'pending' ? (
          <>
            <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600 border border-amber-200">
              <AlertCircle size={28} />
            </div>

            <h1 className="text-xl font-bold text-[#111827] mb-1.5">Payment Awaiting Confirmation</h1>
            <p className="text-[#6B7280] text-xs font-normal mb-6 leading-relaxed">
              Your transaction is being processed by the provider. You can check back shortly or view your order history.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => navigateTo('checkout-success', { orderId })}
                className="w-full py-3 bg-[#111827] text-white font-bold text-xs rounded-lg hover:bg-[#1F2937] transition-colors cursor-pointer"
              >
                View Order Status
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#DC2626] border border-red-200">
              <AlertCircle size={28} />
            </div>

            <h1 className="text-xl font-bold text-[#111827] mb-1.5">Verification Error</h1>
            <p className="text-[#6B7280] text-xs font-normal mb-6 leading-relaxed">
              {errorMessage || 'Unable to verify payment status.'}
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setStatus('verifying');
                  window.location.reload();
                }}
                className="w-full py-3 bg-[#DC2B53] text-white font-bold text-xs rounded-lg hover:bg-[#C52247] transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <RefreshCw size={14} />
                <span>Retry Verification</span>
              </button>
            </div>
          </>
        )}

        <div className="mt-6 pt-5 border-t border-[#E5E7EB] flex items-center justify-center gap-1.5 text-[#6B7280] text-[11px] font-medium">
          <Lock size={12} />
          <span>PCI-DSS Compliant Gateway</span>
        </div>
      </div>
    </div>
  );
};
