'use client';
import React from 'react';
import { useStorefront } from '../../../context/StorefrontContext';
import { XCircle, RefreshCw, ShoppingBag, ArrowLeft } from 'lucide-react';

export const PaymentFailed: React.FC = () => {
  const { viewParams, navigateTo } = useStorefront();
  const orderId = viewParams.orderId;

  return (
    <div className="bg-[#F9FAFB] min-h-screen py-16 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl p-8 shadow-xs text-center border border-[#E5E7EB]">
        <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-[#DC2626] border border-red-200">
          <XCircle size={28} />
        </div>
        
        <h1 className="text-xl font-bold text-[#111827] mb-1.5">Payment Failed</h1>
        <p className="text-[#6B7280] text-xs font-normal mb-6">
          We couldn't process your payment for order <span className="text-[#111827] font-semibold">#{orderId}</span>. No funds were captured.
        </p>

        <div className="bg-[#F9FAFB] rounded-lg p-4 mb-6 text-left border border-[#E5E7EB]">
          <h4 className="text-xs font-bold text-[#111827] mb-2">Possible Reasons</h4>
          <ul className="text-xs text-[#6B7280] space-y-1.5 list-disc pl-4">
            <li>Insufficient balance in your account</li>
            <li>Incorrect card details or expired card</li>
            <li>Transaction was declined by your bank</li>
            <li>Connection interrupted during processing</li>
          </ul>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={() => navigateTo('checkout')}
            className="w-full py-3 bg-[#DC2B53] text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 hover:bg-[#C52247] transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw size={14} />
            <span>Retry Payment</span>
          </button>
          <button
            onClick={() => navigateTo('cart')}
            className="w-full py-3 bg-white border border-[#E5E7EB] text-[#111827] font-semibold text-xs rounded-lg flex items-center justify-center gap-2 hover:bg-[#F9FAFB] transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Return to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
