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
      <h3 className="text-base font-bold text-[#111827]">{title}</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-[#111827] mb-1">Full Name</label>
          <input
            {...register(`${prefix}.fullName`)}
            className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] focus:outline-none focus:border-[#DC2B53]"
            placeholder="John Doe"
          />
          {fieldErrors?.fullName && <p className="text-[#DC2626] text-[11px] mt-1 font-medium">{fieldErrors.fullName.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#111827] mb-1">Email Address</label>
          <input
            {...register(`${prefix}.email`)}
            className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] focus:outline-none focus:border-[#DC2B53]"
            placeholder="john@example.com"
          />
          {fieldErrors?.email && <p className="text-[#DC2626] text-[11px] mt-1 font-medium">{fieldErrors.email.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#111827] mb-1">Phone Number</label>
          <input
            {...register(`${prefix}.phone`)}
            className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] focus:outline-none focus:border-[#DC2B53]"
            placeholder="+1 234 567 890"
          />
          {fieldErrors?.phone && <p className="text-[#DC2626] text-[11px] mt-1 font-medium">{fieldErrors.phone.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-[#111827] mb-1">Street Address</label>
          <input
            {...register(`${prefix}.addressLine1`)}
            className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] focus:outline-none focus:border-[#DC2B53]"
            placeholder="123 Main St, Apt 4B"
          />
          {fieldErrors?.addressLine1 && <p className="text-[#DC2626] text-[11px] mt-1 font-medium">{fieldErrors.addressLine1.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#111827] mb-1">City</label>
          <input
            {...register(`${prefix}.city`)}
            className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] focus:outline-none focus:border-[#DC2B53]"
            placeholder="New York"
          />
          {fieldErrors?.city && <p className="text-[#DC2626] text-[11px] mt-1 font-medium">{fieldErrors.city.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#111827] mb-1">State / Province</label>
          <input
            {...register(`${prefix}.state`)}
            className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] focus:outline-none focus:border-[#DC2B53]"
            placeholder="NY"
          />
          {fieldErrors?.state && <p className="text-[#DC2626] text-[11px] mt-1 font-medium">{fieldErrors.state.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#111827] mb-1">Postal Code</label>
          <input
            {...register(`${prefix}.postalCode`)}
            className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] focus:outline-none focus:border-[#DC2B53]"
            placeholder="10001"
          />
          {fieldErrors?.postalCode && <p className="text-[#DC2626] text-[11px] mt-1 font-medium">{fieldErrors.postalCode.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#111827] mb-1">Country</label>
          <input
            {...register(`${prefix}.country`)}
            className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] focus:outline-none focus:border-[#DC2B53]"
            placeholder="United States"
          />
          {fieldErrors?.country && <p className="text-[#DC2626] text-[11px] mt-1 font-medium">{fieldErrors.country.message}</p>}
        </div>
      </div>
    </div>
  );
};
