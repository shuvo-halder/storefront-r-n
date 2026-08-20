import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'product' | 'badge';
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
  const baseClasses = 'animate-pulse bg-slate-200/80 rounded-lg relative overflow-hidden';

  const variantClasses = {
    text: 'h-4 w-full rounded-md',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
    card: 'h-48 w-full rounded-2xl',
    product: 'w-full rounded-2xl aspect-square',
    badge: 'h-5 w-16 rounded-full',
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
    <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 space-y-3.5 shadow-xs">
      <Skeleton variant="product" className="h-44 sm:h-52 bg-slate-100" />
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Skeleton variant="text" className="w-1/3 h-3.5 bg-slate-200" />
          <Skeleton variant="badge" className="w-12 h-4 bg-slate-100" />
        </div>
        <Skeleton variant="text" className="w-full h-4 bg-slate-200" />
        <Skeleton variant="text" className="w-2/3 h-4 bg-slate-200" />
      </div>
      <div className="pt-2 flex items-center justify-between border-t border-slate-100">
        <div className="space-y-1">
          <Skeleton variant="text" className="w-16 h-5 bg-slate-200" />
          <Skeleton variant="text" className="w-12 h-3 bg-slate-100" />
        </div>
        <Skeleton variant="circular" className="w-9 h-9 bg-slate-200" />
      </div>
    </div>
  );
};

export const ProductGridSkeleton: React.FC<{ count?: number; columns?: string }> = ({
  count = 8,
  columns = 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4',
}) => {
  return (
    <div className={`grid ${columns} gap-4 sm:gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
};

export const CategorySkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center flex flex-col items-center gap-3">
      <Skeleton variant="circular" className="w-16 h-16 bg-slate-100" />
      <Skeleton variant="text" className="w-20 h-4 bg-slate-200" />
      <Skeleton variant="text" className="w-12 h-3 bg-slate-100" />
    </div>
  );
};

export const CategoryGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <CategorySkeleton key={i} />
      ))}
    </div>
  );
};

export const BrandCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 text-center flex flex-col items-center gap-3">
      <Skeleton variant="rectangular" className="h-12 w-28 bg-slate-100" />
      <Skeleton variant="text" className="w-24 h-4 bg-slate-200" />
    </div>
  );
};

export const HeroSkeleton: React.FC = () => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
      <div className="w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 p-6 sm:p-8 lg:p-10 min-h-[260px] sm:min-h-[340px] lg:min-h-[400px] flex flex-col justify-between">
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-32 rounded-full bg-slate-200" />
          <Skeleton className="h-8 w-20 rounded-full bg-slate-200" />
        </div>
        <div className="space-y-3 max-w-xl">
          <Skeleton className="h-8 sm:h-10 w-3/4 rounded-xl bg-slate-200" />
          <Skeleton className="h-4 w-full rounded-lg bg-slate-200" />
          <Skeleton className="h-4 w-2/3 rounded-lg bg-slate-200" />
        </div>
        <div className="flex items-center justify-between pt-4 border-t border-slate-200/60">
          <Skeleton className="h-3 w-24 rounded-full bg-slate-200" />
          <Skeleton className="h-3 w-40 rounded-full bg-slate-200" />
        </div>
      </div>
    </section>
  );
};

export const BlogCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden p-4 space-y-3">
      <Skeleton className="w-full aspect-video rounded-xl bg-slate-100" />
      <Skeleton variant="text" className="w-1/4 h-3 bg-slate-200" />
      <Skeleton variant="text" className="w-full h-5 bg-slate-200" />
      <Skeleton variant="text" className="w-2/3 h-4 bg-slate-100" />
    </div>
  );
};

export const PageSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Breadcrumb Skeleton */}
      <div className="space-y-3 border-b border-slate-200 pb-6">
        <Skeleton className="h-4 w-48 rounded-md bg-slate-200" />
        <Skeleton className="h-8 w-72 rounded-xl bg-slate-200" />
        <Skeleton className="h-4 w-96 rounded-md bg-slate-100" />
      </div>

      {/* Main Content & Sidebar Layout Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="hidden lg:block lg:col-span-3 space-y-6">
          <Skeleton className="h-64 w-full rounded-2xl bg-slate-100 border border-slate-200" />
          <Skeleton className="h-48 w-full rounded-2xl bg-slate-100 border border-slate-200" />
        </div>
        <div className="lg:col-span-9 space-y-6">
          <ProductGridSkeleton count={6} columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" />
        </div>
      </div>
    </div>
  );
};
