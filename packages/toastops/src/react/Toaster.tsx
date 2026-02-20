import * as React from 'react';
import { store } from '../core/store';
import type { Toast } from '../core/types';

/**
 * A tiny custom hook to strictly subscribe to the pure TypeScript store.
 * Since we don't use React Context (to prevent massive re-renders), 
 * this hook is only ever called by the root <Toaster /> component.
 */
function useStore() {
  const [state, setState] = React.useState(store['toasts']); // Internal access workaround to grab initial state

  React.useEffect(() => {
    return store.subscribe((newState) => {
      setState(newState.toasts);
    });
  }, []);

  return state;
}

export interface ToasterProps {
  position?: 'top-center' | 'bottom-right' | 'top-right' | 'bottom-center' | 'bottom-left' | 'top-left';
  className?: string;
  style?: React.CSSProperties;
}

export function Toaster({ position = 'bottom-right', className = '', style }: ToasterProps) {
  const toasts = useStore();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className={`toastops-toaster toastops-${position} ${className}`}
      style={{
        position: 'fixed',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none', // Letting clicks click through the wrapper
        ...getPositionStyle(position),
        ...style,
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  // We use `data-state` to control CSS entrance/exit animations without JS overhead
  const state = toast.visible ? 'open' : 'closed';

  return (
    <div
      data-toast-id={toast.id}
      data-state={state}
      data-type={toast.type}
      className={`toastops-toast ${toast.className || ''}`}
      style={{
        pointerEvents: 'auto', // Catch clicks inside the toast
        transition: 'all 0.4s cubic-bezier(0.21, 1.02, 0.73, 1)',
        opacity: toast.visible ? 1 : 0,
        transform: toast.visible ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.95)',
        ...(toast.style as React.CSSProperties),
      }}
    >
      {/* 
        This is where the magic happens. 
        If the AI generates a completely custom raw HTML structure via `toastops-plugin`, 
        it gets injected here.
      */}
      {toast.message}
    </div>
  );
}

function getPositionStyle(position: string): React.CSSProperties {
  switch (position) {
    case 'top-center':
      return { top: '16px', left: '50%', transform: 'translateX(-50%)', alignItems: 'center' };
    case 'top-right':
      return { top: '16px', right: '16px', alignItems: 'flex-end' };
    case 'top-left':
      return { top: '16px', left: '16px', alignItems: 'flex-start' };
    case 'bottom-center':
      return { bottom: '16px', left: '50%', transform: 'translateX(-50%)', alignItems: 'center', flexDirection: 'column-reverse' };
    case 'bottom-left':
      return { bottom: '16px', left: '16px', alignItems: 'flex-start', flexDirection: 'column-reverse' };
    case 'bottom-right':
    default:
      return { bottom: '16px', right: '16px', alignItems: 'flex-end', flexDirection: 'column-reverse' };
  }
}
