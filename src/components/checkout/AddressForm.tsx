import React from 'react';
import { UseFormRegister, FieldErrors } from 'react-hook-form';
import { CheckoutFormData } from '../../types/checkout';

interface AddressFormProps {
  register: UseFormRegister<CheckoutFormData>;
  errors: FieldErrors<CheckoutFormData>;
  prefix: 'shippingAddress' | 'billingAddress';
  title: string;
}

export const AddressForm: React.FC<AddressFormProps> = ({ register, errors, prefix, title }) => {
  const fieldErrors = errors[prefix] as any;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
          <input
            {...register(`${prefix}.fullName`)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="John Doe"
          />
          {fieldErrors?.fullName && <p className="text-primary text-[10px] mt-1 font-bold">{fieldErrors.fullName.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
          <input
            {...register(`${prefix}.email`)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            placeholder="john@example.com"
          />
          {fieldErrors?.email && <p className="text-primary text-[10px] mt-1 font-bold">{fieldErrors.email.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
          <input
            {...register(`${prefix}.phone`)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            placeholder="+1 234 567 890"
          />
          {fieldErrors?.phone && <p className="text-primary text-[10px] mt-1 font-bold">{fieldErrors.phone.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-slate-700 mb-1">Street Address</label>
          <input
            {...register(`${prefix}.addressLine1`)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            placeholder="123 Main St"
          />
          {fieldErrors?.addressLine1 && <p className="text-primary text-[10px] mt-1 font-bold">{fieldErrors.addressLine1.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
          <input
            {...register(`${prefix}.city`)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          />
          {fieldErrors?.city && <p className="text-primary text-[10px] mt-1 font-bold">{fieldErrors.city.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">State / Province</label>
          <input
            {...register(`${prefix}.state`)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          />
          {fieldErrors?.state && <p className="text-primary text-[10px] mt-1 font-bold">{fieldErrors.state.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Postal Code</label>
          <input
            {...register(`${prefix}.postalCode`)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
          />
          {fieldErrors?.postalCode && <p className="text-primary text-[10px] mt-1 font-bold">{fieldErrors.postalCode.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Country</label>
          <input
            {...register(`${prefix}.country`)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            placeholder="United States"
          />
          {fieldErrors?.country && <p className="text-primary text-[10px] mt-1 font-bold">{fieldErrors.country.message}</p>}
        </div>
      </div>
    </div>
  );
};
