import React from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch } from 'react-hook-form';
import { CheckoutFormData } from '../../types/checkout';
import { CreditCard, Truck, Wallet, ShieldCheck, Landmark } from 'lucide-react';

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
      <h3 className="text-lg font-bold text-slate-900">Payment Method</h3>
      <p className="text-xs text-slate-500 font-medium">Select your preferred way to pay securely.</p>
      
      <div className="space-y-3">
        {methods.map((method) => {
          const Icon = method.icon;
          const isActive = selectedPayment === method.id;

          return (
            <label 
              key={method.id}
              className={`
                flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer
                ${isActive ? 'border-primary bg-primary/5/30 ring-1 ring-primary' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}
              `}
            >
              <input
                type="radio"
                value={method.id}
                {...register('paymentMethod')}
                className="hidden"
              />
              <div className={`p-2.5 rounded-xl ${isActive ? 'bg-primary text-white' : 'bg-white text-slate-400'}`}>
                <Icon size={20} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-900">{method.name}</div>
                <div className="text-[10px] text-slate-500 font-medium">{method.description}</div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isActive ? 'border-primary' : 'border-slate-300'}`}>
                {isActive && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};
