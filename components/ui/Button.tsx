/**
 * Momen Button Component
 * Fully interactive, accessible, and reactive button variants
 */

'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

/* ============================================
   BUTTON VARIANTS
   ============================================ */
const buttonVariants = cva(
  // Base styles - all buttons share these
  [
    'inline-flex',
    'items-center',
    'justify-center',
    'gap-2',
    'whitespace-nowrap',
    'rounded-md',
    'text-sm',
    'font-medium',
    'transition-all',
    'duration-200',
    'ease-out',
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-ice/50',
    'focus-visible:ring-offset-2',
    'disabled:pointer-events-none',
    'disabled:opacity-50',
    'active:scale-[0.98]',
  ],
  {
    variants: {
      variant: {
        // Primary - Slate background, white text
        primary: [
          'bg-slate',
          'text-white',
          'hover:bg-slate-900',
          'active:bg-slate-950',
          'shadow-md',
          'hover:shadow-lg',
        ],
        // Secondary - Sky background, white text
        secondary: [
          'bg-sky',
          'text-white',
          'hover:bg-sky-600',
          'active:bg-sky-700',
          'shadow-md',
          'hover:shadow-lg',
        ],
        // Outline - Transparent bg, slate border
        outline: [
          'border',
          'border-slate',
          'bg-transparent',
          'text-slate',
          'hover:bg-slate/5',
          'active:bg-slate/10',
        ],
        // Ghost - Transparent, subtle hover
        ghost: [
          'bg-transparent',
          'text-slate',
          'hover:bg-cream',
          'active:bg-slate/10',
        ],
        // Link - Text only, underline on hover
        link: [
          'text-slate',
          'underline-offset-4',
          'hover:underline',
          'hover:text-sky',
        ],
        // Destructive - Red for dangerous actions
        destructive: [
          'bg-error',
          'text-white',
          'hover:bg-error-dark',
          'active:bg-error/90',
          'shadow-md',
        ],
        // Success - Green for success states
        success: [
          'bg-success',
          'text-white',
          'hover:bg-success-dark',
          'active:bg-success/90',
          'shadow-md',
        ],
      },
      size: {
        sm: ['h-9', 'px-3', 'text-xs'],
        md: ['h-10', 'px-4', 'text-sm'],
        lg: ['h-11', 'px-6', 'text-base'],
        xl: ['h-14', 'px-8', 'text-lg'],
        icon: ['h-10', 'w-10', 'p-0'],
      },
      fullWidth: {
        true: ['w-full'],
        false: [],
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

/* ============================================
   BUTTON COMPONENT
   ============================================ */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      asChild = false,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';

    // Loading spinner component
    const Spinner = () => (
      <svg
        className="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    );

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, fullWidth, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner />
            {loadingText || children}
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

/* ============================================
   BUTTON GROUP COMPONENT
   ============================================ */
interface ButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

const ButtonGroup = React.forwardRef<HTMLDivElement, ButtonGroupProps>(
  ({ children, className, orientation = 'horizontal', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex',
          orientation === 'horizontal' ? 'flex-row' : 'flex-col',
          'rounded-md',
          'shadow-sm',
          'overflow-hidden',
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child, i) => {
          if (React.isValidElement(child)) {
            const childProps = child.props as React.HTMLAttributes<HTMLElement>;
            return React.cloneElement(child, {
              ...childProps,
              className: cn(
                childProps.className,
                'rounded-none',
                'shadow-none',
                i !== 0 && orientation === 'horizontal' && 'border-l border-slate/20',
                i !== 0 && orientation === 'vertical' && 'border-t border-slate/20',
                i === 0 && orientation === 'horizontal' && 'rounded-l-md',
                i === React.Children.count(children) - 1 &&
                  orientation === 'horizontal' &&
                  'rounded-r-md',
                i === 0 && orientation === 'vertical' && 'rounded-t-md',
                i === React.Children.count(children) - 1 &&
                  orientation === 'vertical' &&
                  'rounded-b-md'
              ),
            } as React.HTMLAttributes<HTMLElement>);
          }
          return child;
        })}
      </div>
    );
  }
);

ButtonGroup.displayName = 'ButtonGroup';

/* ============================================
   TOGGLE BUTTON COMPONENT
   ============================================ */
interface ToggleButtonProps extends Omit<ButtonProps, 'variant'> {
  pressed: boolean;
  onPressedChange?: (pressed: boolean) => void;
}

const ToggleButton = React.forwardRef<HTMLButtonElement, ToggleButtonProps>(
  ({ pressed, onPressedChange, className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={pressed ? 'primary' : 'outline'}
        className={cn(
          'data-[state=on]:bg-slate data-[state=on]:text-white',
          className
        )}
        aria-pressed={pressed}
        onClick={() => onPressedChange?.(!pressed)}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

ToggleButton.displayName = 'ToggleButton';

/* ============================================
   ICON BUTTON COMPONENT
   ============================================ */
interface IconButtonProps extends Omit<ButtonProps, 'size' | 'children'> {
  icon: React.ReactNode;
  label: string;
  tooltip?: string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, tooltip, className, ...props }, ref) => {
    const button = (
      <Button
        ref={ref}
        size="icon"
        className={className}
        aria-label={label}
        {...props}
      >
        {icon}
      </Button>
    );

    if (tooltip) {
      return (
        <div className="group relative inline-block">
          {button}
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-slate rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            {tooltip}
          </span>
        </div>
      );
    }

    return button;
  }
);

IconButton.displayName = 'IconButton';

export { Button, ButtonGroup, ToggleButton, IconButton, buttonVariants };
