import React from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import { CheckoutFormData } from '../../types/checkout';
import { CreditCard, Truck, Wallet, ShieldCheck } from 'lucide-react';

interface PaymentStepProps {
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
  watch: UseFormWatch<CheckoutFormData>;
}

export const PaymentStep: React.FC<PaymentStepProps> = ({ register, watch }) => {
  const selectedPayment = watch('paymentMethod');

  const methods = [
    { id: 'cod', name: 'Cash on Delivery', icon: Truck, description: 'Pay when you receive the package' },
    { id: 'bkash', name: 'bKash', icon: Wallet, description: 'Pay securely using your bKash wallet' },
    { id: 'nagad', name: 'Nagad', icon: Wallet, description: 'Fast and secure Nagad payment' },
    { id: 'sslcommerz', name: 'SSLCommerz', icon: ShieldCheck, description: 'Cards, Netbanking & Mobile Wallets' },
    { id: 'stripe', name: 'Credit / Debit Card', icon: CreditCard, description: 'International Credit or Debit Cards' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-bold text-[#111827]">Payment Method</h3>
        <p className="text-xs text-[#6B7280]">Select your preferred way to pay securely.</p>
      </div>
      
      <div className="space-y-2.5">
        {methods.map((method) => {
          const Icon = method.icon;
          const isActive = selectedPayment === method.id;

          return (
            <label 
              key={method.id}
              className={`
                flex items-center gap-3.5 p-3.5 rounded-lg border transition-colors cursor-pointer
                ${isActive ? 'border-[#DC2B53] bg-[#FDF0F3] ring-1 ring-[#DC2B53]' : 'border-[#E5E7EB] bg-white hover:border-[#111827]'}
              `}
            >
              <input
                type="radio"
                value={method.id}
                {...register('paymentMethod')}
                className="hidden"
              />
              <div className={`p-2 rounded-md ${isActive ? 'bg-[#DC2B53] text-white' : 'bg-[#F9FAFB] text-[#6B7280] border border-[#E5E7EB]'}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-[#111827]">{method.name}</div>
                <div className="text-[11px] text-[#6B7280]">{method.description}</div>
              </div>
              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isActive ? 'border-[#DC2B53]' : 'border-[#E5E7EB]'}`}>
                {isActive && <div className="w-2 h-2 rounded-full bg-[#DC2B53]" />}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};
