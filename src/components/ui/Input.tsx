import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightElement,
      fullWidth = true,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

    return (
      <div className={`${fullWidth ? 'w-full' : ''} space-y-1.5`}>
        {label && (
          <label
            htmlFor={generatedId}
            className="block text-xs font-semibold text-[#111827] tracking-wide"
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3.5 pointer-events-none text-[#6B7280]">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={generatedId}
            className={`w-full bg-white text-[#111827] text-sm rounded-lg border transition-colors placeholder:text-gray-400 focus:outline-none ${
              leftIcon ? 'pl-10' : 'pl-3.5'
            } ${rightElement ? 'pr-10' : 'pr-3.5'} py-2.5 ${
              error
                ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-2 focus:ring-red-100'
                : 'border-[#E5E7EB] hover:border-gray-300 focus:border-[#DC2B53] focus:ring-2 focus:ring-[#DC2B53]/15'
            } ${className}`}
            {...props}
          />

          {rightElement && (
            <div className="absolute right-3.5 flex items-center">
              {rightElement}
            </div>
          )}
        </div>

        {error && (
          <p className="text-xs font-medium text-[#DC2626] flex items-center gap-1">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p className="text-xs text-[#6B7280]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
