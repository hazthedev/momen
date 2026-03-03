/**
 * Momen Modal / Dialog Components
 * Fully interactive, animated, and accessible modals
 */

'use client';

import * as React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

/* ============================================
   MODAL VARIANTS
   ============================================ */
const modalVariants = cva(
  [
    'bg-card',
    'rounded-lg',
    'shadow-xl',
    'border',
    'border-default',
  ],
  {
    variants: {
      size: {
        sm: ['max-w-sm', 'w-full'],
        md: ['max-w-md', 'w-full'],
        lg: ['max-w-lg', 'w-full'],
        xl: ['max-w-xl', 'w-full'],
        '2xl': ['max-w-2xl', 'w-full'],
        fullscreen: ['w-screen', 'h-screen', 'rounded-none', 'max-w-none'],
      },
      position: {
        center: '',
        top: ['my-8', 'mx-auto'],
      },
    },
    defaultVariants: {
      size: 'md',
      position: 'center',
    },
  }
);

/* ============================================
   MODAL CONTEXT
   ============================================ */
interface ModalContextValue {
  isOpen: boolean;
  close: () => void;
}

const ModalContext = React.createContext<ModalContextValue | null>(null);

const useModalContext = () => {
  const context = React.useContext(ModalContext);
  if (!context) {
    throw new Error('Modal components must be used within a Modal');
  }
  return context;
};

/* ============================================
   MODAL ROOT COMPONENT
   ============================================ */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'fullscreen';
  position?: 'center' | 'top';
  className?: string;
}

const Modal = ({
  isOpen,
  onClose,
  children,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  size = 'md',
  position = 'center',
  className,
}: ModalProps) => {
  const modalRef = React.useRef<HTMLDivElement>(null);
  const previousActiveElement = React.useRef<HTMLElement | null>(null);

  // Focus trap
  React.useEffect(() => {
    if (!isOpen) return;

    // Store previously focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus modal
    modalRef.current?.focus();

    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';

      // Restore focus
      previousActiveElement.current?.focus();
    };
  }, [isOpen, closeOnEscape, onClose]);

  // Focus trap within modal
  const handleTabKey = (e: KeyboardEvent) => {
    if (!isOpen || e.key !== 'Tab') return;

    const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (!focusableElements?.length) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement?.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement?.focus();
    }
  };

  React.useEffect(() => {
    const modal = modalRef.current;
    modal?.addEventListener('keydown', handleTabKey as any);
    return () => modal?.removeEventListener('keydown', handleTabKey as any);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <ModalContext.Provider value={{ isOpen, close: onClose }}>
      {/* Portal to render at document root */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-overlay transition-opacity duration-300 animate-in fade-in"
          onClick={closeOnBackdropClick ? onClose : undefined}
          aria-hidden="true"
        />

        {/* Modal */}
        <div
          ref={modalRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          className={cn(
            modalVariants({ size, position }),
            'relative',
            'z-10',
            'transition-all',
            'duration-300',
            'animate-in',
            'zoom-in-95',
            'slide-in-from-bottom-4',
            className
          )}
        >
          {children}
        </div>
      </div>
    </ModalContext.Provider>
  );
};

Modal.displayName = 'Modal';

/* ============================================
   MODAL HEADER
   ============================================ */
export interface ModalHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  showCloseButton?: boolean;
}

const ModalHeader = React.forwardRef<HTMLDivElement, ModalHeaderProps>(
  (
    {
      className,
      title,
      description,
      showCloseButton = true,
      children,
      ...props
    },
    ref
  ) => {
    const { close } = useModalContext();

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-start justify-between gap-4 p-6 border-b border-default',
          className
        )}
        {...props}
      >
        <div className="space-y-1 flex-1">
          {title && (
            <h2 className="text-lg font-semibold text-slate">{title}</h2>
          )}
          {description && (
            <p className="text-sm text-sky">{description}</p>
          )}
          {children}
        </div>

        {showCloseButton && (
          <button
            onClick={close}
            className={cn(
              'flex-shrink-0',
              'rounded-md',
              'p-1',
              'text-sky',
              'hover:text-slate',
              'hover:bg-cream',
              'transition-colors',
              'duration-150',
              'focus:outline-none',
              'focus:ring-2',
              'focus:ring-ice/50'
            )}
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  }
);

ModalHeader.displayName = 'ModalHeader';

/* ============================================
   MODAL BODY
   ============================================ */
export interface ModalBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  scrollable?: boolean;
}

const ModalBody = React.forwardRef<HTMLDivElement, ModalBodyProps>(
  ({ className, scrollable = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'p-6',
          scrollable && 'overflow-y-auto max-h-[60vh]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ModalBody.displayName = 'ModalBody';

/* ============================================
   MODAL FOOTER
   ============================================ */
export interface ModalFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'left' | 'center' | 'right' | 'space-between';
}

const ModalFooter = React.forwardRef<HTMLDivElement, ModalFooterProps>(
  ({ className, align = 'right', children, ...props }, ref) => {
    const alignmentClasses = {
      left: 'justify-start',
      center: 'justify-center',
      right: 'justify-end',
      'space-between': 'justify-between',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center gap-2 p-6 border-t border-default',
          alignmentClasses[align],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ModalFooter.displayName = 'ModalFooter';

/* ============================================
   ALERT MODAL (Confirmation)
   ============================================ */
export interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  isConfirming?: boolean;
}

const AlertModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isConfirming = false,
}: AlertModalProps) => {
  const variantIcons = {
    danger: (
      <div className="w-12 h-12 rounded-full bg-error-light flex items-center justify-center">
        <svg className="w-6 h-6 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
    ),
    warning: (
      <div className="w-12 h-12 rounded-full bg-warning-light flex items-center justify-center">
        <svg className="w-6 h-6 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
    ),
    info: (
      <div className="w-12 h-12 rounded-full bg-info-light flex items-center justify-center">
        <svg className="w-6 h-6 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    ),
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalBody className="flex flex-col items-center text-center">
        {variantIcons[variant]}
        <div className="mt-4 space-y-2">
          <h3 className="text-lg font-semibold text-slate">{title}</h3>
          <p className="text-sm text-sky max-w-sm">{description}</p>
        </div>
      </ModalBody>
      <ModalFooter align="center">
        <button
          onClick={onClose}
          disabled={isConfirming}
          className="px-4 py-2 text-sm font-medium text-slate hover:bg-cream rounded-md transition-colors disabled:opacity-50"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={isConfirming}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-md',
            variant === 'danger'
              ? 'bg-error text-white hover:bg-error-dark'
              : 'bg-slate text-white hover:bg-slate-900',
            'disabled:opacity-50',
            'flex',
            'items-center',
            'gap-2'
          )}
        >
          {isConfirming && (
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {confirmText}
        </button>
      </ModalFooter>
    </Modal>
  );
};

AlertModal.displayName = 'AlertModal';

/* ============================================
   DRAWER / SHEET COMPONENT
   ============================================ */
export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  side?: 'left' | 'right' | 'top' | 'bottom';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Drawer = ({
  isOpen,
  onClose,
  children,
  side = 'right',
  size = 'md',
}: DrawerProps) => {
  const sizeClasses = {
    sm: side === 'left' || side === 'right' ? 'max-w-sm' : 'max-h-48',
    md: side === 'left' || side === 'right' ? 'max-w-md' : 'max-h-64',
    lg: side === 'left' || side === 'right' ? 'max-w-lg' : 'max-h-80',
    xl: side === 'left' || side === 'right' ? 'max-w-xl' : 'max-h-96',
  };

  const transformClasses = {
    left: isOpen ? 'translate-x-0' : '-translate-x-full',
    right: isOpen ? 'translate-x-0' : 'translate-x-full',
    top: isOpen ? 'translate-y-0' : '-translate-y-full',
    bottom: isOpen ? 'translate-y-0' : 'translate-y-full',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-overlay transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed z-50 bg-card shadow-xl border-default',
          side === 'left' && 'left-0 top-0 h-full w-full',
          side === 'right' && 'right-0 top-0 h-full w-full',
          side === 'top' && 'top-0 left-0 w-full h-full',
          side === 'bottom' && 'bottom-0 left-0 w-full h-full',
          sizeClasses[size],
          'transition-transform duration-300 ease-out',
          transformClasses[side]
        )}
      >
        {children}
      </div>
    </>
  );
};

Drawer.displayName = 'Drawer';

/* ============================================
   EXPORTS
   ============================================ */
export {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  AlertModal,
  Drawer,
  useModalContext,
};
