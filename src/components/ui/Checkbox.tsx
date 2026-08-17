import React from 'react';
import { Check } from 'lucide-react';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: React.ReactNode;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className = '', id, checked, ...props }, ref) => {
    const generatedId = id || (typeof label === 'string' ? `checkbox-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className="flex items-start gap-2.5 cursor-pointer group">
        <div className="relative flex items-center pt-0.5">
          <input
            ref={ref}
            id={generatedId}
            type="checkbox"
            checked={checked}
            className="peer sr-only"
            {...props}
          />
          <div className="w-4 h-4 rounded border border-[#E5E7EB] bg-white peer-checked:bg-[#DC2B53] peer-checked:border-[#DC2B53] group-hover:border-gray-400 transition-colors flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-[#DC2B53]/20">
            <Check size={12} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity stroke-[3]" />
          </div>
        </div>

        {(label || description) && (
          <div className="text-xs select-none">
            {label && (
              <label
                htmlFor={generatedId}
                className="font-medium text-[#111827] group-hover:text-black cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-[#6B7280] mt-0.5">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
