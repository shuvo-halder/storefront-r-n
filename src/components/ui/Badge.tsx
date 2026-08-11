import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'error'
    | 'info'
    | 'outline'
    | 'deal'
    | 'new';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  leftIcon,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider',
    md: 'text-[10px] px-2.5 py-1 rounded-full font-extrabold uppercase tracking-wide',
    lg: 'text-xs px-3 py-1.5 rounded-full font-extrabold tracking-wide',
  };

  const variantClasses = {
    primary: 'bg-rose-600 text-white shadow-xs',
    secondary: 'bg-slate-900 text-white shadow-xs',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-bold',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200/80 font-bold',
    error: 'bg-red-50 text-red-700 border border-red-200/80 font-bold',
    info: 'bg-sky-50 text-sky-700 border border-sky-200/80 font-bold',
    outline: 'bg-white text-slate-700 border border-slate-200 font-bold',
    deal: 'bg-amber-500 text-slate-950 font-black shadow-xs',
    new: 'bg-slate-900 text-white font-black shadow-xs',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 leading-none ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {leftIcon}
      <span>{children}</span>
    </span>
  );
};
