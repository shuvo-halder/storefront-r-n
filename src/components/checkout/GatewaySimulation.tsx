'use client';

import React, { useEffect, useState } from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { storefrontApi } from '../../services/storefrontApi';
import { Loader2, ShieldCheck, Lock, Landmark, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

export const GatewaySimulation: React.FC = () => {
  const { viewParams, navigateTo } = useStorefront();
  const { orderId, method } = viewParams;
  const [status, setStatus] = useState<'initiating' | 'verifying' | 'failed'>('initiating');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const methodNames: Record<string, string> = {
    stripe: 'Stripe Secure Checkout',
    bkash: 'bKash Payment Gateway',
    nagad: 'Nagad Payment Gateway',
    sslcommerz: 'SSLCommerz Secure Pay',
  };

  useEffect(() => {
    let isMounted = true;

    const processGateway = async () => {
      if (!orderId) {
        if (isMounted) {
          setErrorMessage('Missing order reference. Unable to initiate payment.');
          setStatus('failed');
        }
        return;
      }

      try {
        setStatus('initiating');
        const initResult = await storefrontApi.initiatePayment(orderId, (method as string) || 'sslcommerz');

        if (!isMounted) return;

        if (initResult?.paymentUrl) {
          // If payment gateway provides external hosted checkout URL, redirect
          window.location.href = initResult.paymentUrl;
          return;
        }

        // If direct verification is needed
        setStatus('verifying');
        const transactionId = initResult?.transactionId || orderId;
        const verifyResult = await storefrontApi.verifyPayment(transactionId);

        if (!isMounted) return;

        if (verifyResult?.verified) {
          navigateTo('checkout-success', { orderId: verifyResult.orderId || orderId });
        } else {
          navigateTo('checkout-failed', { orderId });
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error('[GatewaySimulation error]', err);
        setErrorMessage(err?.message || 'Unable to connect with the payment gateway.');
        setStatus('failed');
      }
    };

    processGateway();

    return () => {
      isMounted = false;
    };
  }, [orderId, method, navigateTo]);

  return (
    <div className="fixed inset-0 bg-[#F9FAFB] z-[9999] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-sm w-full bg-white border border-[#E5E7EB] rounded-xl p-8 shadow-xs space-y-6">
        
        {status !== 'failed' ? (
          <>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-[#FDF0F3] rounded-full flex items-center justify-center mb-3 border border-[#DC2B53]/20">
                <Landmark className="text-[#DC2B53]" size={26} />
              </div>
              <h1 className="text-base font-bold text-[#111827] mb-1">
                {methodNames[method as string] || 'Secure Payment Gateway'}
              </h1>
              <p className="text-xs text-[#6B7280]">
                {status === 'initiating' ? `Initiating session for Order #${orderId}...` : `Verifying payment with provider...`}
              </p>
            </div>

            <div className="space-y-3 py-2 flex flex-col items-center justify-center">
              <Loader2 size={28} className="animate-spin text-[#DC2B53]" />
              <p className="text-xs font-semibold text-[#111827]">
                {status === 'initiating' ? 'Connecting to payment provider' : 'Authorizing transaction'}
              </p>
            </div>

            <div className="pt-5 space-y-2.5 border-t border-[#E5E7EB]">
              <div className="flex items-center justify-center gap-1.5 text-[#16A34A]">
                <ShieldCheck size={16} />
                <span className="text-xs font-semibold">256-Bit Bank-Grade Encryption</span>
              </div>
              <p className="text-[11px] text-[#6B7280] leading-relaxed max-w-[260px] mx-auto">
                Please do not close this window or navigate back while your transaction is being processed.
              </p>
              <div className="flex items-center justify-center gap-2 pt-1 text-[#6B7280] text-[10px] font-medium">
                <Lock size={12} />
                <span>PCI-DSS Compliant</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mb-3 border border-red-200 text-[#DC2626]">
                <AlertCircle size={26} />
              </div>
              <h1 className="text-base font-bold text-[#111827] mb-1">Payment Initialization Failed</h1>
              <p className="text-xs text-[#6B7280] mt-1">
                {errorMessage || 'Unable to establish connection with payment provider.'}
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setStatus('initiating');
                  setErrorMessage(null);
                  window.location.reload();
                }}
                className="w-full py-2.5 bg-[#DC2B53] hover:bg-[#C52247] text-white font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <RefreshCw size={14} />
                <span>Retry Payment</span>
              </button>
              
              <button
                type="button"
                onClick={() => navigateTo('checkout')}
                className="w-full py-2 bg-white hover:bg-gray-50 text-[#111827] border border-[#E5E7EB] font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Return to Checkout</span>
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
