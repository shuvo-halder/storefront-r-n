import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent' | 'subtle';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className = '',
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    // Base classes
    const baseClasses =
      'inline-flex items-center justify-center font-bold transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed select-none active:scale-[0.98]';

    // Size variants
    const sizeClasses = {
      sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
      md: 'text-xs sm:text-sm px-4 py-2.5 rounded-xl gap-2',
      lg: 'text-sm sm:text-base px-6 py-3.5 rounded-xl gap-2.5',
      icon: 'p-2.5 rounded-xl justify-center',
    };

    // Style variants
    const variantClasses = {
      primary:
        'bg-rose-600 hover:bg-rose-700 text-white shadow-xs hover:shadow-md focus:ring-2 focus:ring-rose-500/30',
      secondary:
        'bg-slate-900 hover:bg-slate-800 text-white shadow-xs hover:shadow-md focus:ring-2 focus:ring-slate-900/30',
      outline:
        'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 focus:ring-2 focus:ring-slate-200',
      ghost:
        'bg-transparent hover:bg-slate-100 text-slate-700 hover:text-slate-900 focus:ring-2 focus:ring-slate-100',
      danger:
        'bg-red-600 hover:bg-red-700 text-white shadow-xs focus:ring-2 focus:ring-red-500/30',
      accent:
        'bg-sky-600 hover:bg-sky-700 text-white shadow-xs hover:shadow-md focus:ring-2 focus:ring-sky-500/30',
      subtle:
        'bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold focus:ring-2 focus:ring-rose-200',
    };

    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
        ) : (
          leftIcon
        )}
        {children && <span>{children}</span>}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
