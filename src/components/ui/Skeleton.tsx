import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'product';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rectangular',
  width,
  height,
  className = '',
  style,
  ...props
}) => {
  const baseClasses = 'animate-shimmer bg-slate-200 rounded-lg relative overflow-hidden';

  const variantClasses = {
    text: 'h-4 w-full rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
    card: 'h-48 w-full rounded-2xl',
    product: 'w-full rounded-2xl aspect-square',
  };

  const inlineStyles: React.CSSProperties = {
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    ...style,
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={inlineStyles}
      {...props}
    />
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 space-y-3">
      <Skeleton variant="product" className="h-44 sm:h-52" />
      <div className="space-y-2">
        <Skeleton variant="text" className="w-1/3 h-3" />
        <Skeleton variant="text" className="w-5/6 h-4" />
        <Skeleton variant="text" className="w-2/3 h-4" />
      </div>
      <div className="pt-2 flex items-center justify-between">
        <Skeleton variant="text" className="w-20 h-6" />
        <Skeleton variant="circular" className="w-9 h-9" />
      </div>
    </div>
  );
};

export const CategorySkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center flex flex-col items-center gap-3">
      <Skeleton variant="circular" className="w-16 h-16" />
      <Skeleton variant="text" className="w-20 h-4" />
    </div>
  );
};
