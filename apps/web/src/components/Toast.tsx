'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const toastColors: Record<ToastType, { bg: string; border: string; text: string }> = {
  success: {
    bg: 'bg-pareto-green/20',
    border: 'border-pareto-green',
    text: 'text-pareto-green',
  },
  error: {
    bg: 'bg-pareto-orange/20',
    border: 'border-pareto-orange',
    text: 'text-pareto-orange',
  },
  info: {
    bg: 'bg-pareto-blue/20',
    border: 'border-pareto-blue',
    text: 'text-pareto-blue',
  },
  warning: {
    bg: 'bg-pareto-yellow/20',
    border: 'border-pareto-yellow',
    text: 'text-pareto-yellow',
  },
};

const toastIcons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => {
          const colors = toastColors[toast.type];
          return (
            <div
              key={toast.id}
              className={`
                ${colors.bg} ${colors.border} border-2 rounded-xl p-4
                shadow-lg min-w-[300px] max-w-[400px]
                animate-slide-in pointer-events-auto
                flex items-start gap-3
              `}
              role="alert"
            >
              <span className={`${colors.text} font-display text-xl flex-shrink-0`}>
                {toastIcons[toast.type]}
              </span>
              <p className="chalk-text text-pareto-light text-sm flex-1">
                {toast.message}
              </p>
              <button
                onClick={() => dismissToast(toast.id)}
                className="text-pareto-light/60 hover:text-pareto-light transition-colors flex-shrink-0"
                aria-label="Dismiss"
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
