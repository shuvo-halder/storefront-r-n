import React from 'react';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
}

export interface ToastMessage {
  id: string;
  type?: ToastVariant;
  title: string;
  message?: string;
  description?: string; // backwards compatibility
  duration?: number; // duration in ms (default 4500ms for success/info, 6000ms for errors)
  image?: string;
  badge?: string;
  action?: ToastAction;
  icon?: React.ReactNode;
  onClose?: () => void;
  timestamp: number;
}

export type ToastOptions = Omit<Partial<ToastMessage>, 'id' | 'timestamp'>;

export interface NormalizedFeedback {
  type: ToastVariant;
  title: string;
  message: string;
  badge?: string;
  details?: string[];
}
