import React from 'react';

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  className?: string;
  children: React.ReactNode;
}

export const DisplayHeading: React.FC<TypographyProps> = ({
  as: Component = 'h1',
  className = '',
  children,
  ...props
}) => (
  <Component
    className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none ${className}`}
    {...props}
  >
    {children}
  </Component>
);

export const H1: React.FC<TypographyProps> = ({
  as: Component = 'h1',
  className = '',
  children,
  ...props
}) => (
  <Component
    className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight ${className}`}
    {...props}
  >
    {children}
  </Component>
);

export const H2: React.FC<TypographyProps> = ({
  as: Component = 'h2',
  className = '',
  children,
  ...props
}) => (
  <Component
    className={`text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight leading-snug ${className}`}
    {...props}
  >
    {children}
  </Component>
);

export const H3: React.FC<TypographyProps> = ({
  as: Component = 'h3',
  className = '',
  children,
  ...props
}) => (
  <Component
    className={`text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug ${className}`}
    {...props}
  >
    {children}
  </Component>
);

export const H4: React.FC<TypographyProps> = ({
  as: Component = 'h4',
  className = '',
  children,
  ...props
}) => (
  <Component
    className={`text-base font-bold text-slate-900 tracking-tight leading-snug ${className}`}
    {...props}
  >
    {children}
  </Component>
);

export const TextBody: React.FC<TypographyProps> = ({
  as: Component = 'p',
  className = '',
  children,
  ...props
}) => (
  <Component
    className={`text-sm sm:text-base text-slate-600 leading-relaxed ${className}`}
    {...props}
  >
    {children}
  </Component>
);

export const TextSmall: React.FC<TypographyProps> = ({
  as: Component = 'p',
  className = '',
  children,
  ...props
}) => (
  <Component
    className={`text-xs sm:text-sm text-slate-600 font-medium leading-normal ${className}`}
    {...props}
  >
    {children}
  </Component>
);

export const TextCaption: React.FC<TypographyProps> = ({
  as: Component = 'span',
  className = '',
  children,
  ...props
}) => (
  <Component
    className={`text-xs text-slate-400 font-normal leading-tight ${className}`}
    {...props}
  >
    {children}
  </Component>
);
