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
      {title && <h3 className="text-base font-bold text-[#111827]">{title}</h3>}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-[#111827] mb-1">Mobile Number <span className="text-[#DC2B53]">*</span></label>
          <input
            {...register(`${prefix}.phone`)}
            className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] focus:outline-none focus:border-[#DC2B53]"
            placeholder="01XXXXXXXXX"
          />
          {fieldErrors?.phone && <p className="text-[#DC2626] text-[11px] mt-1 font-medium">{fieldErrors.phone.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#111827] mb-1">Full Name <span className="text-[#DC2B53]">*</span></label>
          <input
            {...register(`${prefix}.fullName`)}
            className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] focus:outline-none focus:border-[#DC2B53]"
            placeholder="e.g. Rahim Uddin"
          />
          {fieldErrors?.fullName && <p className="text-[#DC2626] text-[11px] mt-1 font-medium">{fieldErrors.fullName.message}</p>}
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-[#111827] mb-1">Email (Optional)</label>
          <input
            {...register(`${prefix}.email`)}
            className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] focus:outline-none focus:border-[#DC2B53]"
            placeholder="you@example.com"
          />
          {fieldErrors?.email && <p className="text-[#DC2626] text-[11px] mt-1 font-medium">{fieldErrors.email.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-[#111827] mb-1">Address / House / Road / Area <span className="text-[#DC2B53]">*</span></label>
          <input
            {...register(`${prefix}.addressLine1`)}
            className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] focus:outline-none focus:border-[#DC2B53]"
            placeholder="e.g. House 12, Road 5, Block C, Banani"
          />
          {fieldErrors?.addressLine1 && <p className="text-[#DC2626] text-[11px] mt-1 font-medium">{fieldErrors.addressLine1.message}</p>}
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-[#111827] mb-1">District <span className="text-[#DC2B53]">*</span></label>
          <input
            {...register(`${prefix}.city`)}
            className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] focus:outline-none focus:border-[#DC2B53]"
            placeholder="e.g. Dhaka"
          />
          {fieldErrors?.city && <p className="text-[#DC2626] text-[11px] mt-1 font-medium">{fieldErrors.city.message}</p>}
        </div>
        
        <div>
          <label className="block text-xs font-semibold text-[#111827] mb-1">Thana / Upazila <span className="text-[#DC2B53]">*</span></label>
          <input
            {...register(`${prefix}.state`)}
            className="w-full px-3.5 py-2.5 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#111827] focus:outline-none focus:border-[#DC2B53]"
            placeholder="e.g. Banani"
          />
          {fieldErrors?.state && <p className="text-[#DC2626] text-[11px] mt-1 font-medium">{fieldErrors.state.message}</p>}
        </div>
        
        <input type="hidden" {...register(`${prefix}.country`)} value="Bangladesh" />
      </div>
    </div>
  );
};
