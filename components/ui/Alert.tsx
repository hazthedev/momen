/**
 * Momen Alert Components
 * Interactive alerts with animations and actions
 */

'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

/* ============================================
   ALERT VARIANTS
   ============================================ */
const alertVariants = cva(
  [
    'relative',
    'w-full',
    'rounded-md',
    'border',
    'p-4',
    'transition-all',
    'duration-200',
  ],
  {
    variants: {
      variant: {
        default: ['bg-info-light', 'border-info', 'text-info-dark'],
        success: ['bg-success-light', 'border-success', 'text-success-dark'],
        warning: ['bg-warning-light', 'border-warning', 'text-warning-dark'],
        error: ['bg-error-light', 'border-error', 'text-error-dark'],
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

/* ============================================
   ALERT CONTEXT
   ============================================ */
interface AlertContextValue {
  dismiss: () => void;
}

const AlertContext = React.createContext<AlertContextValue | null>(null);

const useAlertContext = () => {
  const context = React.useContext(AlertContext);
  if (!context) {
    throw new Error('Alert components must be used within an Alert');
  }
  return context;
};

/* ============================================
   ALERT COMPONENT
   ============================================ */
export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  autoDismiss?: boolean;
  autoDismissDelay?: number;
  showIcon?: boolean;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      className,
      variant,
      title,
      dismissible = false,
      onDismiss,
      autoDismiss = false,
      autoDismissDelay = 5000,
      showIcon = true,
      children,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = React.useState(true);
    const [isExiting, setIsExiting] = React.useState(false);

    const dismiss = React.useCallback(() => {
      setIsExiting(true);
      setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, 200);
    }, [onDismiss]);

    // Auto dismiss
    React.useEffect(() => {
      if (autoDismiss) {
        const timer = setTimeout(dismiss, autoDismissDelay);
        return () => clearTimeout(timer);
      }
    }, [autoDismiss, autoDismissDelay, dismiss]);

    if (!isVisible) return null;

    const variantIcons = {
      default: <Info className="w-5 h-5" />,
      success: <CheckCircle className="w-5 h-5" />,
      warning: <AlertTriangle className="w-5 h-5" />,
      error: <AlertCircle className="w-5 h-5" />,
    };

    return (
      <AlertContext.Provider value={{ dismiss }}>
        <div
          ref={ref}
          className={cn(
            alertVariants({ variant }),
            isExiting && 'animate-out fade-out slide-out-to-right',
            dismissible && 'pr-10',
            className
          )}
          role="alert"
          {...props}
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            {showIcon && <div className="flex-shrink-0 mt-0.5">{variantIcons[variant || 'default']}</div>}

            {/* Content */}
            <div className="flex-1 space-y-1">
              {title && (
                <p className="font-medium leading-tight">{title}</p>
              )}
              {children && (
                <div className="text-sm leading-relaxed opacity-90">
                  {children}
                </div>
              )}
            </div>

            {/* Dismiss Button */}
            {dismissible && (
              <button
                onClick={dismiss}
                className={cn(
                  'flex-shrink-0',
                  'rounded-md',
                  'p-0.5',
                  'transition-colors',
                  'duration-150',
                  'hover:bg-black/5',
                  'focus:outline-none',
                  'focus:ring-2',
                  'focus:ring-ice/50'
                )}
                aria-label="Dismiss alert"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </AlertContext.Provider>
    );
  }
);

Alert.displayName = 'Alert';

/* ============================================
   ALERT TITLE
   ============================================ */
const AlertTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn('font-medium leading-tight', className)}
    {...props}
  />
));

AlertTitle.displayName = 'AlertTitle';

/* ============================================
   ALERT DESCRIPTION
   ============================================ */
const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('text-sm leading-relaxed opacity-90', className)}
    {...props}
  />
));

AlertDescription.displayName = 'AlertDescription';

/* ============================================
   ALERT ACTIONS
   ============================================ */
interface AlertActionsProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'right';
}

const AlertActions = React.forwardRef<HTMLDivElement, AlertActionsProps>(
  ({ className, align = 'right', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-2 mt-3 pt-3 border-t border-current opacity-75',
          align === 'right' && 'justify-end',
          align === 'left' && 'justify-start',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AlertActions.displayName = 'AlertActions';

/* ============================================
   ALERT PROVIDER / TOAST MANAGER
   ============================================ */
interface Toast {
  id: string;
  title?: string;
  message: string;
  variant?: 'default' | 'success' | 'warning' | 'error';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface AlertContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

const ToastContext = React.createContext<AlertContextValue | null>(null);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback(
    (toast: Omit<Toast, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast = { ...toast, id };

      setToasts((prev) => [...prev, newToast]);

      if (toast.duration !== 0) {
        setTimeout(() => {
          removeToast(id);
        }, toast.duration || 5000);
      }

      return id;
    },
    []
  );

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = React.useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

/* ============================================
   TOAST CONTAINER
   ============================================ */
const ToastContainer = () => {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

/* ============================================
   INDIVIDUAL TOAST
   ============================================ */
const Toast = ({ toast }: { toast: Toast }) => {
  const { removeToast } = useToast();
  const [isExiting, setIsExiting] = React.useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => removeToast(toast.id), 200);
  };

  return (
    <Alert
      variant={toast.variant}
      dismissible
      onDismiss={handleDismiss}
      className={cn(
        'shadow-lg',
        isExiting && 'animate-out slide-out-to-right'
      )}
    >
      {toast.title && <AlertTitle>{toast.title}</AlertTitle>}
      <AlertDescription>{toast.message}</AlertDescription>

      {toast.action && (
        <AlertActions>
          <button
            onClick={() => {
              toast.action!.onClick();
              handleDismiss();
            }}
            className={cn(
              'text-sm font-medium underline',
              'hover:opacity-75',
              'transition-opacity'
            )}
          >
            {toast.action.label}
          </button>
        </AlertActions>
      )}
    </Alert>
  );
};

/* ============================================
   CONVENIENCE HOOKS
   ============================================ */
export const useToastHelpers = () => {
  const { addToast } = useToast();

  return {
    success: (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'variant'>>) =>
      addToast({ ...options, message, variant: 'success' }),

    error: (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'variant'>>) =>
      addToast({ ...options, message, variant: 'error' }),

    warning: (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'variant'>>) =>
      addToast({ ...options, message, variant: 'warning' }),

    info: (message: string, options?: Partial<Omit<Toast, 'id' | 'message' | 'variant'>>) =>
      addToast({ ...options, message, variant: 'default' }),

    promise: <T,>(
      promise: Promise<T>,
      options: {
        loading: string;
        success: string;
        error: string;
      }
    ) => {
      const loadingId = addToast({
        message: options.loading,
        variant: 'default',
        duration: 0,
      });

      return promise
        .then((result) => {
          removeToast(loadingId);
          addToast({
            message: options.success,
            variant: 'success',
          });
          return result;
        })
        .catch((error) => {
          removeToast(loadingId);
          addToast({
            message: options.error,
            variant: 'error',
          });
          throw error;
        });
    },
  };
};

/* ============================================
   EXPORTS
   ============================================ */
export {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertActions,
  alertVariants,
};
