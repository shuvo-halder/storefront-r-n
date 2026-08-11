import React from 'react';
import { useStorefront } from '../../../context/StorefrontContext';
import { XCircle, RefreshCw, ShoppingBag, ArrowLeft } from 'lucide-react';

export const PaymentFailed: React.FC = () => {
  const { viewParams, navigateTo } = useStorefront();
  const orderId = viewParams.orderId;

  return (
    <div className="bg-slate-50 min-h-screen py-20 px-4">
      <div className="max-w-md mx-auto bg-white rounded-[40px] p-10 shadow-2xl shadow-primary/5 text-center border border-slate-100">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
          <XCircle size={40} />
        </div>
        
        <h1 className="text-3xl font-black text-slate-900 mb-2">Payment Failed</h1>
        <p className="text-slate-500 text-sm font-medium mb-8">
          We couldn't process your payment for order <span className="text-primary font-black">#{orderId}</span>. No funds were captured.
        </p>

        <div className="bg-primary/5 rounded-3xl p-6 mb-8 text-left">
          <h4 className="text-xs font-black text-slate-900 mb-2 uppercase tracking-tight">Possible Reasons:</h4>
          <ul className="text-[11px] text-slate-600 space-y-1 font-medium list-disc pl-4">
            <li>Insufficient balance in your account</li>
            <li>Incorrect card details or expired card</li>
            <li>Transaction was declined by your bank</li>
            <li>Connection lost during processing</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigateTo('checkout')}
            className="w-full py-4 bg-primary text-white font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-hover transition-colors cursor-pointer shadow-lg shadow-primary/20"
          >
            <RefreshCw size={16} />
            <span>Retry Payment</span>
          </button>
          <button
            onClick={() => navigateTo('cart')}
            className="w-full py-4 bg-white border border-slate-200 text-slate-600 font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Return to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
};
