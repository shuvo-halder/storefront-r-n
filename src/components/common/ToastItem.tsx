'use client';

import React, { useEffect, useState, useRef } from 'react';
import { ToastMessage } from '../../types/feedback';
import { SmartImage } from './SmartImage';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X, ExternalLink, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

export const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const duration = toast.duration ?? 4500;
  const [isPaused, setIsPaused] = useState(false);
  const [remainingTime, setRemainingTime] = useState(duration);
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const type = toast.type || 'info';

  useEffect(() => {
    if (duration <= 0) return; // Persistent toast

    if (isPaused) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    startTimeRef.current = Date.now();

    timerRef.current = setTimeout(() => {
      onDismiss(toast.id);
      if (toast.onClose) {
        try {
          toast.onClose();
        } catch {}
      }
    }, remainingTime);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPaused, remainingTime, toast.id, onDismiss, duration, toast]);

  const handleMouseEnter = () => {
    if (duration <= 0) return;
    const elapsed = Date.now() - startTimeRef.current;
    setRemainingTime((prev) => Math.max(prev - elapsed, 500));
    setIsPaused(true);
  };

  const handleMouseLeave = () => {
    if (duration <= 0) return;
    setIsPaused(false);
  };

  const renderIcon = () => {
    if (toast.icon) {
      return <div className="flex-shrink-0 text-slate-700">{toast.icon}</div>;
    }

    switch (type) {
      case 'success':
        return (
          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center flex-shrink-0 shadow-xs">
            <CheckCircle2 size={18} strokeWidth={2.5} />
          </div>
        );
      case 'error':
        return (
          <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center flex-shrink-0 shadow-xs">
            <AlertCircle size={18} strokeWidth={2.5} />
          </div>
        );
      case 'warning':
        return (
          <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center flex-shrink-0 shadow-xs">
            <AlertTriangle size={18} strokeWidth={2.5} />
          </div>
        );
      case 'info':
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-[#FDF0F3] text-[#DC2B53] border border-[#DC2B53]/20 flex items-center justify-center flex-shrink-0 shadow-xs">
            <Info size={18} strokeWidth={2.5} />
          </div>
        );
    }
  };

  const borderColor = 
    type === 'success' ? 'border-emerald-100' :
    type === 'error' ? 'border-rose-100' :
    type === 'warning' ? 'border-amber-100' :
    'border-[#E5E7EB]';

  const progressBg =
    type === 'success' ? 'bg-emerald-500' :
    type === 'error' ? 'bg-rose-500' :
    type === 'warning' ? 'bg-amber-500' :
    'bg-[#DC2B53]';

  const messageText = toast.message || toast.description;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94, transition: { duration: 0.18 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      role="status"
      aria-live="polite"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`pointer-events-auto w-full bg-white rounded-xl shadow-lg border ${borderColor} overflow-hidden transition-shadow duration-200 hover:shadow-xl relative flex flex-col group`}
    >
      <div className="p-4 flex items-start gap-3.5">
        {/* Product Image if available, else variant icon */}
        {toast.image ? (
          <div className="w-12 h-12 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] flex-shrink-0 relative overflow-hidden shadow-2xs">
            <SmartImage
              src={toast.image}
              alt={toast.title}
              fill
              fallbackType="product"
              fallbackLabel={toast.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          renderIcon()
        )}

        {/* Content Body */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-2 mb-0.5">
            <h4 className="text-xs sm:text-sm font-bold text-[#111827] leading-snug truncate">
              {toast.title}
            </h4>
            {toast.badge && (
              <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.2 rounded bg-gray-100 text-gray-700 border border-gray-200">
                {toast.badge}
              </span>
            )}
          </div>

          {messageText && (
            <p className="text-xs text-[#6B7280] font-normal leading-relaxed line-clamp-2">
              {messageText}
            </p>
          )}

          {/* Action Button */}
          {toast.action && (
            <div className="mt-2.5 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick();
                  onDismiss(toast.id);
                }}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer shadow-2xs
                  ${toast.action.variant === 'secondary'
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200'
                    : toast.action.variant === 'outline'
                    ? 'bg-white hover:bg-gray-50 text-[#111827] border border-[#E5E7EB]'
                    : 'bg-[#111827] hover:bg-[#1F2937] text-white'
                  }
                `}
              >
                <span>{toast.action.label}</span>
                <ArrowRight size={12} />
              </button>
            </div>
          )}
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          aria-label="Dismiss notification"
          onClick={() => onDismiss(toast.id)}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer flex-shrink-0"
        >
          <X size={15} />
        </button>
      </div>

      {/* Animated Depleting Progress Bar */}
      {duration > 0 && (
        <div className="w-full h-1 bg-gray-100 overflow-hidden">
          <motion.div
            className={`h-full ${progressBg}`}
            initial={{ width: '100%' }}
            animate={{ width: isPaused ? undefined : '0%' }}
            transition={{
              duration: remainingTime / 1000,
              ease: 'linear',
            }}
          />
        </div>
      )}
    </motion.div>
  );
};
