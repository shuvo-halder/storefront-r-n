'use client';

import React from 'react';
import { useStorefront } from '../../context/StorefrontContext';
import { ToastItem } from './ToastItem';
import { AnimatePresence } from 'motion/react';
import { Trash2 } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast, clearAllToasts } = useStorefront();

  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full px-4 sm:px-0 pointer-events-none"
      aria-label="Notifications"
    >
      {toasts.length > 2 && (
        <div className="flex justify-end pointer-events-auto pr-1">
          <button
            type="button"
            onClick={clearAllToasts}
            className="text-[11px] font-semibold text-gray-500 hover:text-gray-900 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full border border-[#E5E7EB] shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Trash2 size={12} />
            <span>Clear all ({toasts.length})</span>
          </button>
        </div>
      )}

      <div className="flex flex-col-reverse gap-2.5 w-full">
        <AnimatePresence mode="popLayout">
          {toasts.slice(0, 4).map((toast) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              onDismiss={removeToast}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
