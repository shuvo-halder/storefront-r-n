'use client';

import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { SmartImage } from '../../common/SmartImage';

export interface ReviewImageLightboxProps {
  isOpen: boolean;
  images: string[];
  initialIndex?: number;
  onClose: () => void;
  reviewAuthor?: string;
  author?: string;
}

export const ReviewImageLightbox: React.FC<ReviewImageLightboxProps> = ({
  isOpen,
  images,
  initialIndex = 0,
  onClose,
  reviewAuthor,
  author,
}) => {
  const displayAuthor = reviewAuthor || author;
  const [currentIndex, setCurrentIndex] = React.useState<number>(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev >= images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Keyboard navigation & body scroll locking
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'ArrowRight') {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || images.length === 0) return null;

  const currentImage = images[currentIndex] || images[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 select-none">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity"
        />

        {/* Header Bar */}
        <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between p-4 sm:p-6 text-white">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-semibold text-gray-200">
              {displayAuthor ? `Review Photo by ${displayAuthor}` : 'Customer Review Photo'}
            </span>
            <span className="text-[11px] text-gray-400 font-medium">
              {currentIndex + 1} of {images.length}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Lightbox"
            className="p-2 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Image Container */}
        <div className="relative z-10 w-full max-w-4xl h-[70vh] sm:h-[75vh] flex items-center justify-center">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="relative w-full h-full"
          >
            <SmartImage
              src={currentImage}
              alt={`Review photo ${currentIndex + 1} of ${images.length}`}
              fill
              fallbackType="product"
              fallbackLabel="Review Photo"
              objectFit="contain"
              priority
              className="rounded-lg drop-shadow-2xl"
            />
          </motion.div>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                aria-label="Previous image"
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-[#DC2B53] text-white border border-white/20 transition-all cursor-pointer shadow-lg focus:outline-none focus:ring-2 focus:ring-[#DC2B53]"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                aria-label="Next image"
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-[#DC2B53] text-white border border-white/20 transition-all cursor-pointer shadow-lg focus:outline-none focus:ring-2 focus:ring-[#DC2B53]"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>

        {/* Bottom Thumbnail Strip for Multi-Image Reviews */}
        {images.length > 1 && (
          <div className="absolute bottom-4 sm:bottom-6 inset-x-0 z-10 flex items-center justify-center gap-2 px-4 overflow-x-auto py-2">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`View photo ${idx + 1}`}
                className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-md overflow-hidden border-2 transition-all cursor-pointer flex-shrink-0 ${
                  currentIndex === idx
                    ? 'border-[#DC2B53] scale-105 shadow-md'
                    : 'border-white/30 opacity-60 hover:opacity-100'
                }`}
              >
                <SmartImage
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  fill
                  fallbackType="product"
                  objectFit="cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};
