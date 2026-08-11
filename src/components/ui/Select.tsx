import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  fullWidth?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      error,
      fullWidth = true,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = id || (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className={`${fullWidth ? 'w-full' : ''} space-y-1.5`}>
        {label && (
          <label
            htmlFor={generatedId}
            className="block text-xs font-bold text-slate-700 tracking-wide"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            ref={ref}
            id={generatedId}
            className={`w-full appearance-none bg-white text-slate-900 text-sm rounded-xl border transition-all duration-200 pl-3.5 pr-10 py-2.5 focus:outline-none cursor-pointer ${
              error
                ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-100'
                : 'border-slate-200 hover:border-slate-300 focus:border-rose-600 focus:ring-2 focus:ring-rose-100'
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3.5 pointer-events-none text-slate-400">
            <ChevronDown size={16} />
          </div>
        </div>

        {error && (
          <p className="text-xs font-semibold text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
