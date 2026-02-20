import * as React from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'loading' | 'blank';

export interface ToastOptions {
  duration?: number;
  id?: string;
  className?: string;
  style?: Record<string, string | number>;
  variant?: string; // For A/B testing support
}

export interface Toast {
  type: ToastType;
  message: string | React.ReactNode;
  id: string;
  duration?: number;
  pauseDuration: number;
  createdAt: number;
  visible: boolean;
  className?: string;
  style?: Record<string, string | number>;
  variant?: string;
}

export interface ToastStoreState {
  toasts: Toast[];
}
