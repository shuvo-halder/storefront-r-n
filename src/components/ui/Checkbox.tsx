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
          <div className="w-4 h-4 rounded-md border border-slate-300 bg-white peer-checked:bg-rose-600 peer-checked:border-rose-600 group-hover:border-slate-400 transition-all flex items-center justify-center peer-focus-visible:ring-2 peer-focus-visible:ring-rose-500/30">
            <Check size={12} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
          </div>
        </div>

        {(label || description) && (
          <div className="text-xs select-none">
            {label && (
              <label
                htmlFor={generatedId}
                className="font-semibold text-slate-800 group-hover:text-slate-900 cursor-pointer"
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-slate-500 mt-0.5">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
