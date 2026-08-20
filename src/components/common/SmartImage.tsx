'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { isValidImageUrl, formatCloudinaryUrl, getFallbackSvgUri, FallbackType } from '../../utils/imageUtils';

export interface SmartImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'placeholder'> {
  src: string | null | undefined;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  className?: string;
  containerClassName?: string;
  fallbackType?: FallbackType;
  fallbackLabel?: string;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none';
  cloudinaryOptions?: {
    width?: number;
    height?: number;
    crop?: string;
  };
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  fill = false,
  width,
  height,
  priority = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  className = '',
  containerClassName = '',
  fallbackType = 'product',
  fallbackLabel,
  objectFit = 'cover',
  cloudinaryOptions,
  onLoad,
  onError,
  ...props
}) => {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const prevSrcRef = useRef<string | null | undefined>(src);

  const [imgSrc, setImgSrc] = useState<string>(() => {
    if (!isValidImageUrl(src)) {
      return getFallbackSvgUri(fallbackType, fallbackLabel || alt);
    }
    return formatCloudinaryUrl(src!, cloudinaryOptions);
  });

  const [isLoaded, setIsLoaded] = useState<boolean>(() => {
    // If invalid image URL or data URI, mark loaded immediately
    if (!isValidImageUrl(src) || (typeof src === 'string' && src.startsWith('data:'))) {
      return true;
    }
    return false;
  });

  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    const srcChanged = prevSrcRef.current !== src;
    prevSrcRef.current = src;

    if (!isValidImageUrl(src)) {
      setImgSrc(getFallbackSvgUri(fallbackType, fallbackLabel || alt));
      setIsError(true);
      setIsLoaded(true);
    } else {
      const formatted = formatCloudinaryUrl(src!, cloudinaryOptions);
      setImgSrc(formatted);
      setIsError(false);

      // Only reset isLoaded when src actually changed
      if (srcChanged) {
        setIsLoaded(false);
      }
    }
  }, [src, fallbackType, fallbackLabel, alt, cloudinaryOptions]);

  // Check if image is already completed in browser cache on mount or src change
  useEffect(() => {
    if (imgRef.current && imgRef.current.complete && imgRef.current.naturalWidth > 0) {
      setIsLoaded(true);
    }
  }, [imgSrc]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!isError) {
      setIsError(true);
      setImgSrc(getFallbackSvgUri(fallbackType, fallbackLabel || alt));
      setIsLoaded(true);
    }
    if (onError) onError(e);
  };

  const objectFitClass = {
    cover: 'object-cover',
    contain: 'object-contain',
    fill: 'object-fill',
    none: 'object-none',
  }[objectFit];

  const isSvgDataUri = imgSrc.startsWith('data:image/svg+xml');

  return (
    <div
      className={`relative overflow-hidden ${
        fill ? 'w-full h-full' : ''
      } ${!isLoaded ? 'bg-slate-100 animate-pulse' : ''} ${containerClassName}`}
    >
      {/* Native or Next Image rendering */}
      {fill ? (
        <Image
          ref={imgRef}
          src={imgSrc}
          alt={alt || 'Vyzobd Image'}
          fill
          priority={priority}
          sizes={sizes}
          referrerPolicy="no-referrer"
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`transition-opacity duration-300 ${objectFitClass} ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          unoptimized={isSvgDataUri}
          {...(props as any)}
        />
      ) : (
        <img
          ref={imgRef}
          src={imgSrc}
          alt={alt || 'Vyzobd Image'}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`transition-opacity duration-300 ${objectFitClass} ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          {...props}
        />
      )}
    </div>
  );
};
