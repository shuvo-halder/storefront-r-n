'use client';
import React, { useEffect, useState, useRef } from 'react';
import { useStorefront } from '../../../context/StorefrontContext';
import { useSettings } from '../../../context/SettingsContext';
import { storefrontApi } from '../../../services/storefrontApi';
import { trackGA4Purchase } from '../../../utils/analytics';
import { formatPrice } from '../../../utils/formatters';
import { CheckCircle2, ShoppingBag, ArrowRight, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const PaymentSuccess: React.FC = () => {
  const { viewParams, navigateTo } = useStorefront();
  const orderId = viewParams.orderId;
  const [isVerifying, setIsVerifying] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const hasTrackedPurchaseRef = useRef<boolean>(false);

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

        // Only track purchase if payment is verified and confirmed
        if (result?.verified) {
          try {
            confetti({
              particleCount: 150,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#101A25', '#DC2B53', '#fb7185']
            });
          } catch {}

          if (fetchedOrder && !hasTrackedPurchaseRef.current) {
            hasTrackedPurchaseRef.current = true;
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
      <div className="py-24 flex flex-col items-center justify-center space-y-3 bg-[#F9FAFB] min-h-screen">
        <Loader2 size={32} className="animate-spin text-[#DC2B53]" />
        <p className="text-xs text-[#6B7280] font-semibold">Verifying payment with gateway...</p>
      </div>
    );
  }

  const displayOrderIdentifier = order?.orderNumber || order?.id || orderId;

  return (
    <div className="bg-[#F9FAFB] min-h-screen py-16 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl p-8 shadow-xs text-center border border-[#E5E7EB]">
        <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-600 border border-emerald-200">
          <CheckCircle2 size={28} />
        </div>
        
        <h1 className="text-xl font-bold text-[#111827] mb-1.5">Payment Successful</h1>
        <p className="text-[#6B7280] text-xs font-normal mb-6">
          Thank you for your purchase. Your order <span className="text-[#111827] font-semibold">#{displayOrderIdentifier}</span> has been confirmed.
        </p>

        <div className="bg-[#F9FAFB] rounded-lg p-4 mb-6 text-left space-y-2.5 border border-[#E5E7EB]">
          <div className="flex justify-between text-xs">
            <span className="text-[#6B7280]">Order Reference</span>
            <span className="text-[#111827] font-mono font-medium">{displayOrderIdentifier}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-[#6B7280]">Total Amount</span>
            <span className="text-[#111827] font-bold">{formatPrice(order?.totalAmount || order?.total || 0, currency)}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#6B7280]">Status</span>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md font-semibold text-[10px] uppercase">
              CONFIRMED
            </span>
          </div>
        </div>

        <div className="space-y-2.5">
          <button
            onClick={() => navigateTo('orders')}
            className="w-full py-3 bg-[#111827] text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 hover:bg-[#1F2937] transition-colors cursor-pointer"
          >
            <span>View My Orders</span>
            <ArrowRight size={14} />
          </button>
          <button
            onClick={() => navigateTo('shop')}
            className="w-full py-3 bg-white border border-[#E5E7EB] text-[#111827] font-semibold text-xs rounded-lg flex items-center justify-center gap-2 hover:bg-[#F9FAFB] transition-colors cursor-pointer"
          >
            <ShoppingBag size={14} />
            <span>Continue Shopping</span>
          </button>
        </div>
      </div>
    </div>
  );
};
