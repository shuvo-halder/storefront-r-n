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
      current: 'text-sm font-bold text-[#111827]',
      original: 'text-xs text-[#6B7280] line-through',
      badge: 'text-[10px] px-1.5 py-0.5 bg-[#FDF0F3] text-[#DC2B53] border border-[#DC2B53]/20 rounded font-semibold',
    },
    md: {
      current: 'text-base font-bold text-[#111827]',
      original: 'text-xs text-[#6B7280] line-through',
      badge: 'text-[10px] px-2 py-0.5 bg-[#FDF0F3] text-[#DC2B53] border border-[#DC2B53]/20 rounded font-semibold',
    },
    lg: {
      current: 'text-xl sm:text-2xl font-bold text-[#111827]',
      original: 'text-sm text-[#6B7280] line-through',
      badge: 'text-xs px-2.5 py-0.5 bg-[#FDF0F3] text-[#DC2B53] border border-[#DC2B53]/20 rounded font-semibold',
    },
    xl: {
      current: 'text-3xl sm:text-4xl font-bold text-[#111827] tracking-tight',
      original: 'text-lg text-[#6B7280] line-through',
      badge: 'text-xs px-3 py-1 bg-[#FDF0F3] text-[#DC2B53] border border-[#DC2B53]/20 rounded font-semibold',
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
