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
    <div className="bg-slate-50 min-h-screen py-20 px-4">
      <div className="max-w-md mx-auto bg-white rounded-[40px] p-10 shadow-2xl shadow-primary/5 text-center border border-slate-100">
        
        {status === 'verifying' ? (
          <>
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500 border border-amber-100">
              <Loader2 size={40} className="animate-spin text-amber-600" />
            </div>
            
            <h1 className="text-2xl font-black text-slate-900 mb-2">Verifying Payment...</h1>
            <p className="text-slate-500 text-xs font-medium mb-8 leading-relaxed">
              We are connecting with the payment gateway to confirm your transaction for Order <span className="text-slate-900 font-black">#{orderId}</span>.
            </p>

            <div className="p-4 bg-slate-50 rounded-2xl flex items-center justify-center gap-3 text-slate-600 text-xs font-bold mb-6">
              <ShieldCheck size={16} className="text-emerald-500" />
              <span>Verifying with Payment Provider</span>
            </div>
          </>
        ) : status === 'pending' ? (
          <>
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-600">
              <AlertCircle size={40} />
            </div>

            <h1 className="text-2xl font-black text-slate-900 mb-2">Payment Awaiting Confirmation</h1>
            <p className="text-slate-500 text-xs font-medium mb-8 leading-relaxed">
              Your transaction is being processed by the provider. You can check back shortly or view your order history.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => navigateTo('checkout-success', { orderId })}
                className="w-full py-3.5 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                View Order Status
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 text-rose-600">
              <AlertCircle size={40} />
            </div>

            <h1 className="text-2xl font-black text-slate-900 mb-2">Verification Error</h1>
            <p className="text-slate-500 text-xs font-medium mb-8 leading-relaxed">
              {errorMessage || 'Unable to verify payment status.'}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setStatus('verifying');
                  window.location.reload();
                }}
                className="w-full py-3.5 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-primary-hover transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} />
                <span>Retry Verification</span>
              </button>
            </div>
          </>
        )}

        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
          <Lock size={12} />
          <span>PCI-DSS Compliant Gateway</span>
        </div>
      </div>
    </div>
  );
};
