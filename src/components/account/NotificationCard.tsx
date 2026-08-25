'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CustomerNotification } from '../../types/customer';
import { getNotificationMeta, formatNotificationTime } from '../../utils/notification';
import { Check, ExternalLink, ArrowRight, Loader2 } from 'lucide-react';

interface NotificationCardProps {
  notification: CustomerNotification;
  onMarkAsRead: (id: string) => Promise<void> | void;
  isMarkingRead?: boolean;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkAsRead,
  isMarkingRead = false,
}) => {
  const router = useRouter();
  const [isLocalNavigating, setIsLocalNavigating] = useState(false);
  const meta = getNotificationMeta(notification.type);
  const Icon = meta.icon;
  const isUnread = !notification.isRead;
  const timeFormatted = formatNotificationTime(notification.createdAt);

  const handleCardClick = async () => {
    if (isUnread) {
      try {
        await onMarkAsRead(notification.id);
      } catch (err) {
        // Non-blocking
      }
    }

    if (notification.orderId) {
      setIsLocalNavigating(true);
      router.push(`/account/orders/${encodeURIComponent(notification.orderId)}`);
    }
  };

  const handleMarkReadClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUnread && !isMarkingRead) {
      await onMarkAsRead(notification.id);
    }
  };

  const handleOrderLinkClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUnread) {
      try {
        await onMarkAsRead(notification.id);
      } catch (err) {
        // Non-blocking
      }
    }
    if (notification.orderId) {
      router.push(`/account/orders/${encodeURIComponent(notification.orderId)}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`
        relative rounded-xl p-4 sm:p-5 border transition-all duration-200
        ${notification.orderId ? 'cursor-pointer' : isUnread ? 'cursor-pointer' : 'cursor-default'}
        ${isUnread 
          ? 'bg-[#FFF9FA] border-rose-200/80 shadow-2xs hover:border-[#DC2B53]/40' 
          : 'bg-white border-gray-200/80 hover:border-gray-300'}
      `}
    >
      <div className="flex items-start gap-3.5 sm:gap-4">
        
        {/* Type Icon */}
        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${meta.iconBgClass} ${meta.iconColorClass} border-black/5`}>
          <Icon size={20} />
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${meta.badgeClass}`}>
                {meta.categoryLabel}
              </span>
              {isUnread && (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#DC2B53] bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#DC2B53] animate-pulse"></span>
                  <span>Unread</span>
                </span>
              )}
            </div>

            <span className="text-[11px] font-medium text-gray-500 shrink-0">
              {timeFormatted}
            </span>
          </div>

          <h3 className={`text-sm ${isUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'} tracking-tight leading-snug`}>
            {notification.title}
          </h3>

          <p className="text-xs text-gray-600 font-normal leading-relaxed mt-1 whitespace-pre-line">
            {notification.message}
          </p>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 mt-3 pt-2.5 border-t border-gray-100/80">
            {notification.orderId ? (
              <button
                type="button"
                onClick={handleOrderLinkClick}
                disabled={isLocalNavigating}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#DC2B53] hover:text-[#C52247] hover:underline cursor-pointer group"
              >
                <span>View Order Details</span>
                {isLocalNavigating ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                )}
              </button>
            ) : (
              <div />
            )}

            {/* Mark as read button if unread */}
            {isUnread && (
              <button
                type="button"
                onClick={handleMarkReadClick}
                disabled={isMarkingRead}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-gray-900 bg-white hover:bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200 transition-colors cursor-pointer shadow-2xs ml-auto"
                title="Mark as read"
                aria-label="Mark notification as read"
              >
                {isMarkingRead ? (
                  <Loader2 size={12} className="animate-spin text-gray-400" />
                ) : (
                  <Check size={12} className="text-emerald-600" />
                )}
                <span>Mark as read</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
