import React from 'react';

export interface PriceTagProps {
  price: number;
  compareAtPrice?: number;
  discountPercent?: number;
  currencySymbol?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showBadge?: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

export const PriceTag: React.FC<PriceTagProps> = ({
  price,
  compareAtPrice,
  discountPercent,
  currencySymbol = '$',
  size = 'md',
  showBadge = true,
  align = 'left',
  className = '',
}) => {
  const sizeMap = {
    sm: {
      current: 'text-sm font-extrabold text-slate-900',
      original: 'text-xs text-slate-400 line-through',
      badge: 'text-[9px] px-1.5 py-0.5 bg-rose-600 text-white rounded font-bold',
    },
    md: {
      current: 'text-base font-extrabold text-slate-900',
      original: 'text-xs text-slate-400 line-through',
      badge: 'text-[10px] px-2 py-0.5 bg-rose-600 text-white rounded-md font-bold',
    },
    lg: {
      current: 'text-xl sm:text-2xl font-black text-slate-900',
      original: 'text-sm text-slate-400 line-through',
      badge: 'text-xs px-2.5 py-1 bg-rose-600 text-white rounded-lg font-black',
    },
    xl: {
      current: 'text-3xl sm:text-4xl font-black text-slate-900 tracking-tight',
      original: 'text-lg text-slate-400 line-through',
      badge: 'text-xs px-3 py-1 bg-rose-600 text-white rounded-lg font-black',
    },
  };

  const currentStyles = sizeMap[size];
  const alignClasses = {
    left: 'items-baseline justify-start',
    center: 'items-baseline justify-center',
    right: 'items-baseline justify-end',
  };

  const computedDiscount =
    discountPercent ||
    (compareAtPrice && compareAtPrice > price
      ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
      : undefined);

  return (
    <div className={`flex flex-wrap gap-2 ${alignClasses[align]} ${className}`}>
      <span className={currentStyles.current}>
        {currencySymbol}
        {price.toFixed(2)}
      </span>

      {compareAtPrice && compareAtPrice > price && (
        <span className={currentStyles.original}>
          {currencySymbol}
          {compareAtPrice.toFixed(2)}
        </span>
      )}

      {showBadge && computedDiscount && computedDiscount > 0 && (
        <span className={currentStyles.badge}>
          -{computedDiscount}%
        </span>
      )}
    </div>
  );
};
