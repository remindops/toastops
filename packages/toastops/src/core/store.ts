import * as React from 'react';
import type { Toast, ToastOptions, ToastType, ToastStoreState } from './types';

const TOAST_LIMIT = 5;
const DEFAULT_DURATION = 4000;

let toastsCounter = 0;
const genId = () => {
  toastsCounter += 1;
  return toastsCounter.toString();
};

type Listener = (state: ToastStoreState) => void;

export class ToastStore {
  private toasts: Toast[] = [];
  private listeners: Set<Listener> = new Set();
  
  // Timeout references to handle auto-dismissals cleanly
  private timeouts: Map<string, ReturnType<typeof setTimeout>> = new Map();

  subscribe = (listener: Listener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private notify() {
    const state: ToastStoreState = { toasts: [...this.toasts] };
    this.listeners.forEach((listener) => listener(state));
  }

  addToast(toast: Toast) {
    this.toasts = [toast, ...this.toasts].slice(0, TOAST_LIMIT);
    this.notify();

    if (toast.duration !== Infinity && toast.type !== 'loading') {
      const timeoutId = setTimeout(() => {
        this.dismissToast(toast.id);
      }, toast.duration || DEFAULT_DURATION);
      this.timeouts.set(toast.id, timeoutId);
    }
  }

  dismissToast(toastId?: string) {
    if (toastId) {
      // Find the specific toast and mark visible=false to allow exit animations
      this.toasts = this.toasts.map((t) =>
        t.id === toastId ? { ...t, visible: false } : t
      );
      if (this.timeouts.has(toastId)) {
        clearTimeout(this.timeouts.get(toastId)!);
        this.timeouts.delete(toastId);
      }
    } else {
      // Dismiss all
      this.toasts = this.toasts.map((t) => ({ ...t, visible: false }));
      this.timeouts.forEach(clearTimeout);
      this.timeouts.clear();
    }
    
    this.notify();

    // After a brief delay for exit animations, fully remove from queue
    setTimeout(() => {
      this.removeToast(toastId);
    }, 400); // 400ms is standard timeout for CSS animations
  }

  private removeToast(toastId?: string) {
    if (toastId) {
      this.toasts = this.toasts.filter((t) => t.id !== toastId);
    } else {
      this.toasts = [];
    }
    this.notify();
  }

  create(message: string | React.ReactNode, type: ToastType = 'blank', opts?: ToastOptions) {
    const defaultToast: Toast = {
      id: opts?.id || genId(),
      createdAt: Date.now(),
      visible: true,
      type,
      message,
      pauseDuration: 0,
      duration: opts?.duration || DEFAULT_DURATION,
      className: opts?.className,
      style: opts?.style,
      variant: opts?.variant,
    };
    
    this.addToast(defaultToast);
    return defaultToast.id;
  }
}

// Singleton Pattern (One observer per client)
export const store = new ToastStore();

// Expose intuitive API
export const toast = (message: string | React.ReactNode, opts?: ToastOptions) => store.create(message, 'blank', opts);
toast.success = (message: string | React.ReactNode, opts?: ToastOptions) => store.create(message, 'success', opts);
toast.error = (message: string | React.ReactNode, opts?: ToastOptions) => store.create(message, 'error', opts);
toast.loading = (message: string | React.ReactNode, opts?: ToastOptions) => store.create(message, 'loading', opts);
toast.info = (message: string | React.ReactNode, opts?: ToastOptions) => store.create(message, 'info', opts);
toast.dismiss = (toastId?: string) => store.dismissToast(toastId);
