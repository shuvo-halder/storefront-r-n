'use client';
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  position?: 'right' | 'left';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  bodyClassName?: string;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  position = 'right',
  size = 'md',
  bodyClassName,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle Escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const sizeClasses = {
    sm: 'w-[80vw] max-w-xs',
    md: 'w-[85vw] max-w-[360px] sm:max-w-md',
    lg: 'w-[88vw] max-w-md sm:max-w-lg',
    xl: 'w-[90vw] max-w-lg sm:max-w-xl',
  };

  const slideVariants = {
    hidden: { x: position === 'right' ? '100%' : '-100%' },
    visible: { x: '0%' },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] overflow-hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#111827]/50 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer Container */}
          <div className={`fixed inset-y-0 ${position === 'right' ? 'right-0' : 'left-0'} flex max-w-full z-[101]`}>
            <motion.div
              variants={slideVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className={`${sizeClasses[size]} bg-white shadow-xl flex flex-col justify-between z-10 ${position === 'right' ? 'border-l' : 'border-r'} border-[#E5E7EB] h-full max-h-screen overflow-hidden`}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-[#E5E7EB] shrink-0">
                <div className="font-bold text-base sm:text-lg text-[#111827] min-w-0 flex-1 pr-2">
                  {title}
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 sm:p-2 text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB] rounded-lg transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                  aria-label="Close drawer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Content Body */}
              <div className={`flex-1 overflow-y-auto p-4 sm:p-6 ${bodyClassName || ''}`}>{children}</div>

              {/* Footer */}
              {footer && (
                <div className="p-3.5 sm:p-5 border-t border-[#E5E7EB] bg-[#F9FAFB] shrink-0">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
