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
          <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <CheckCircle2 size={14} strokeWidth={2.5} />
          </div>
        );
      case 'error':
        return (
          <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 border border-rose-200/60 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <AlertCircle size={14} strokeWidth={2.5} />
          </div>
        );
      case 'warning':
        return (
          <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-600 border border-amber-200/60 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <AlertTriangle size={14} strokeWidth={2.5} />
          </div>
        );
      case 'info':
      default:
        return (
          <div className="w-6 h-6 rounded-full bg-[#FDF0F3] text-[#DC2B53] border border-[#DC2B53]/20 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <Info size={14} strokeWidth={2.5} />
          </div>
        );
    }
  };

  const borderColor = 
    type === 'success' ? 'border-emerald-200/80' :
    type === 'error' ? 'border-rose-200/80' :
    type === 'warning' ? 'border-amber-200/80' :
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
      initial={{ opacity: 0, y: -12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.94, y: -8, transition: { duration: 0.16 } }}
      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
      role="status"
      aria-live="polite"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`pointer-events-auto w-full bg-white rounded-xl shadow-md border ${borderColor} overflow-hidden transition-shadow duration-200 hover:shadow-lg relative flex flex-col group`}
    >
      <div className="p-3 flex items-start gap-2.5">
        {/* Product Image if available, else variant icon */}
        {toast.image ? (
          <div className="w-9 h-9 rounded-md border border-[#E5E7EB] bg-[#F9FAFB] flex-shrink-0 relative overflow-hidden shadow-2xs">
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
          <div className="flex items-center gap-1.5 mb-0.5">
            <h4 className="text-xs font-bold text-[#111827] leading-snug truncate">
              {toast.title}
            </h4>
            {toast.badge && (
              <span className="text-[9px] font-semibold tracking-wide uppercase px-1.5 py-0.2 rounded bg-gray-100 text-gray-700 border border-gray-200">
                {toast.badge}
              </span>
            )}
          </div>

          {messageText && (
            <p className="text-[11px] text-[#4B5563] font-normal leading-snug line-clamp-2">
              {messageText}
            </p>
          )}

          {/* Action Button */}
          {toast.action && (
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  toast.action?.onClick();
                  onDismiss(toast.id);
                }}
                className={`
                  inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer shadow-2xs
                  ${toast.action.variant === 'secondary'
                    ? 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200'
                    : toast.action.variant === 'outline'
                    ? 'bg-white hover:bg-gray-50 text-[#111827] border border-[#E5E7EB]'
                    : 'bg-[#111827] hover:bg-[#1F2937] text-white'
                  }
                `}
              >
                <span>{toast.action.label}</span>
                <ArrowRight size={11} />
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
