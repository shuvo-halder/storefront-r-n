import React from 'react';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'normal' | 'wide' | 'narrow';
  padded?: boolean;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'normal',
  padded = true,
  className = '',
  ...props
}) => {
  const sizeMap = {
    normal: 'max-w-7xl',
    wide: 'max-w-screen-2xl',
    narrow: 'max-w-4xl',
  };

  const paddingClass = padded ? 'px-4 sm:px-6 lg:px-8' : '';

  return (
    <div
      className={`${sizeMap[size]} mx-auto w-full ${paddingClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
