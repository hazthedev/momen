/**
 * Momen Input Components
 * Interactive, validated, and accessible form inputs
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

/* ============================================
   BASE INPUT COMPONENT
   ============================================ */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      onRightIconClick,
      containerClassName,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [showPassword, setShowPassword] = React.useState(false);

    const inputType = type === 'password' && showPassword ? 'text' : type;

    return (
      <div className={cn('space-y-1.5', containerClassName)}>
        {label && (
          <label
            className={cn(
              'text-sm font-medium transition-colors',
              error ? 'text-error' : 'text-slate',
              disabled && 'opacity-50'
            )}
          >
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sky pointer-events-none">
              {leftIcon}
            </div>
          )}

          {/* Input Field */}
          <input
            ref={ref}
            type={inputType}
            className={cn(
              // Base
              'flex',
              'h-10',
              'w-full',
              'rounded-md',
              'border',
              'px-3',
              'py-2',
              'text-sm',
              'transition-all',
              'duration-200',
              'placeholder:text-sky/50',
              // Colors
              'bg-card',
              error
                ? 'border-error focus:border-error focus:ring-error/20'
                : 'border-input focus:border-ice focus:ring-ice/20',
              // States
              'focus:outline-none',
              'focus:ring-2',
              'focus:ring-offset-0',
              disabled && 'bg-disabled-bg cursor-not-allowed opacity-50',
              // Icon padding
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            disabled={disabled}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <button
              type="button"
              onClick={() => {
                if (type === 'password') {
                  setShowPassword(!showPassword);
                }
                onRightIconClick?.();
              }}
              className={cn(
                'absolute right-3 top-1/2 -translate-y-1/2 transition-colors',
                error ? 'text-error' : 'text-sky',
                'hover:text-slate',
                onRightIconClick && 'cursor-pointer',
                type === 'password' && 'cursor-pointer'
              )}
              tabIndex={-1}
            >
              {rightIcon}
            </button>
          )}

          {/* Focus Indicator */}
          <div
            className={cn(
              'absolute bottom-0 left-0 h-0.5 bg-ice transition-all duration-200',
              isFocused ? 'w-full' : 'w-0'
            )}
          />
        </div>

        {/* Helper Text / Error */}
        {(helperText || error) && (
          <p
            className={cn(
              'text-xs transition-colors',
              error ? 'text-error' : 'text-sky'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/* ============================================
   TEXTAREA COMPONENT
   ============================================ */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  maxLength?: number;
  showCount?: boolean;
  containerClassName?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      maxLength,
      showCount = false,
      containerClassName,
      disabled,
      value,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const charCount = typeof value === 'string' ? value.length : 0;

    return (
      <div className={cn('space-y-1.5', containerClassName)}>
        {label && (
          <div className="flex items-center justify-between">
            <label
              className={cn(
                'text-sm font-medium transition-colors',
                error ? 'text-error' : 'text-slate',
                disabled && 'opacity-50'
              )}
            >
              {label}
              {props.required && <span className="text-error ml-1">*</span>}
            </label>
            {showCount && maxLength && (
              <span
                className={cn(
                  'text-xs',
                  charCount > maxLength ? 'text-error' : 'text-sky'
                )}
              >
                {charCount}/{maxLength}
              </span>
            )}
          </div>
        )}

        <div className="relative">
          <textarea
            ref={ref}
            value={value}
            maxLength={maxLength}
            className={cn(
              // Base
              'flex',
              'min-h-[80px]',
              'w-full',
              'rounded-md',
              'border',
              'px-3',
              'py-2',
              'text-sm',
              'transition-all',
              'duration-200',
              'placeholder:text-sky/50',
              'resize-none',
              // Colors
              'bg-card',
              error
                ? 'border-error focus:border-error focus:ring-error/20'
                : 'border-input focus:border-ice focus:ring-ice/20',
              // States
              'focus:outline-none',
              'focus:ring-2',
              disabled && 'bg-disabled-bg cursor-not-allowed opacity-50',
              className
            )}
            disabled={disabled}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          />

          {/* Focus Indicator */}
          <div
            className={cn(
              'absolute bottom-0 left-0 h-0.5 bg-ice transition-all duration-200',
              isFocused ? 'w-full' : 'w-0'
            )}
          />
        </div>

        {/* Helper Text / Error */}
        {(helperText || error) && (
          <p
            className={cn(
              'text-xs transition-colors',
              error ? 'text-error' : 'text-sky'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

/* ============================================
   SELECT COMPONENT
   ============================================ */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  containerClassName?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder,
      value,
      onChange,
      disabled,
      required,
      containerClassName,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);

    return (
      <div className={cn('space-y-1.5', containerClassName)}>
        {label && (
          <label
            className={cn(
              'text-sm font-medium transition-colors',
              error ? 'text-error' : 'text-slate',
              disabled && 'opacity-50'
            )}
          >
            {label}
            {required && <span className="text-error ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className={cn(
              // Base
              'flex',
              'h-10',
              'w-full',
              'rounded-md',
              'border',
              'px-3',
              'py-2',
              'text-sm',
              'transition-all',
              'duration-200',
              'appearance-none',
              'cursor-pointer',
              // Colors
              'bg-card',
              error
                ? 'border-error focus:border-error focus:ring-error/20'
                : 'border-input focus:border-ice focus:ring-ice/20',
              // States
              'focus:outline-none',
              'focus:ring-2',
              disabled && 'bg-disabled-bg cursor-not-allowed opacity-50'
            )}
            disabled={disabled}
            onFocus={(e) => {
              setIsFocused(true);
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              setIsFocused(false);
              props.onBlur?.(e);
            }}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Chevron Icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-sky">
            <svg
              className="w-4 h-4 transition-transform duration-200"
              style={{ transform: isFocused ? 'rotate(180deg)' : 'rotate(0)' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {/* Focus Indicator */}
          <div
            className={cn(
              'absolute bottom-0 left-0 h-0.5 bg-ice transition-all duration-200',
              isFocused ? 'w-full' : 'w-0'
            )}
          />
        </div>

        {/* Helper Text / Error */}
        {(helperText || error) && (
          <p
            className={cn(
              'text-xs transition-colors',
              error ? 'text-error' : 'text-sky'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

/* ============================================
   CHECKBOX COMPONENT
   ============================================ */
export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  indeterminate?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, indeterminate, disabled, className, ...props }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null);
    const [checked, setChecked] = React.useState(false);

    // Handle indeterminate state
    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate ?? false;
      }
    }, [indeterminate]);

    // Sync controlled state
    React.useEffect(() => {
      if (props.checked !== undefined) {
        setChecked(props.checked);
      }
    }, [props.checked]);

    return (
      <div className="flex items-start gap-3">
        <div className="relative flex items-center">
          <input
            ref={(node) => {
              // Handle both refs
              if (typeof ref === 'function') ref(node);
              else if (ref) ref.current = node;
              inputRef.current = node;
            }}
            type="checkbox"
            checked={checked}
            onChange={(e) => {
              setChecked(e.target.checked);
              props.onChange?.(e);
            }}
            className={cn(
              'peer',
              'h-4',
              'w-4',
              'rounded',
              'border',
              'transition-all',
              'duration-200',
              'cursor-pointer',
              // Colors
              error
                ? 'border-error checked:bg-error checked:border-error'
                : 'border-sky/40 checked:bg-slate checked:border-slate',
              // States
              'focus:outline-none',
              'focus:ring-2',
              'focus:ring-ice/50',
              'focus:ring-offset-0',
              'disabled:cursor-not-allowed',
              'disabled:opacity-50',
              className
            )}
            disabled={disabled}
            {...props}
          />

          {/* Custom Checkmark Icon */}
          <svg
            className={cn(
              'absolute',
              'left-1/2',
              'top-1/2',
              '-translate-x-1/2',
              '-translate-y-1/2',
              'w-3',
              'h-3',
              'text-white',
              'pointer-events-none',
              'transition-opacity',
              'duration-150',
              checked ? 'opacity-100' : 'opacity-0'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        {label && (
          <label
            className={cn(
              'text-sm',
              'font-medium',
              'cursor-pointer',
              'select-none',
              'transition-colors',
              error ? 'text-error' : 'text-slate',
              disabled && 'opacity-50'
            )}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

/* ============================================
   RADIO GROUP COMPONENT
   ============================================ */
export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  name: string;
  label?: string;
  error?: string;
  options: RadioOption[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  orientation?: 'horizontal' | 'vertical';
  containerClassName?: string;
}

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (
    {
      name,
      label,
      error,
      options,
      value,
      onChange,
      disabled,
      orientation = 'vertical',
      containerClassName,
    },
    ref
  ) => {
    return (
      <div ref={ref} className={cn('space-y-1.5', containerClassName)}>
        {label && (
          <label
            className={cn(
              'text-sm font-medium',
              error ? 'text-error' : 'text-slate',
              disabled && 'opacity-50'
            )}
          >
            {label}
          </label>
        )}

        <div
          className={cn(
            'flex',
            'gap-4',
            orientation === 'vertical' ? 'flex-col' : 'flex-row'
          )}
        >
          {options.map((option) => (
            <label
              key={option.value}
              className={cn(
                'flex',
                'items-center',
                'gap-2',
                'cursor-pointer',
                'select-none',
                'transition-colors',
                disabled || option.disabled ? 'opacity-50 cursor-not-allowed' : ''
              )}
            >
              <div className="relative">
                <input
                  type="radio"
                  name={name}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => onChange?.(e.target.value)}
                  disabled={disabled || option.disabled}
                  className={cn(
                    'peer',
                    'h-4',
                    'w-4',
                    'rounded-full',
                    'border',
                    'transition-all',
                    'duration-200',
                    'appearance-none',
                    'cursor-pointer',
                    // Colors
                    error
                      ? 'border-error checked:border-error'
                      : 'border-sky/40 checked:border-slate',
                    // States
                    'focus:outline-none',
                    'focus:ring-2',
                    'focus:ring-ice/50',
                    'focus:ring-offset-0',
                    'disabled:cursor-not-allowed'
                  )}
                />

                {/* Radio Dot */}
                <div
                  className={cn(
                    'absolute',
                    'left-1/2',
                    'top-1/2',
                    '-translate-x-1/2',
                    '-translate-y-1/2',
                    'w-2',
                    'h-2',
                    'rounded-full',
                    'transition-all',
                    'duration-150',
                    value === option.value
                      ? error
                        ? 'bg-error'
                        : 'bg-slate'
                      : 'bg-transparent'
                  )}
                />
              </div>

              <span
                className={cn(
                  'text-sm',
                  error ? 'text-error' : 'text-slate',
                  value === option.value && 'font-medium'
                )}
              >
                {option.label}
              </span>
            </label>
          ))}
        </div>

        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    );
  }
);

RadioGroup.displayName = 'RadioGroup';

/* ============================================
   SEARCH INPUT COMPONENT
   ============================================ */
export interface SearchInputProps
  extends Omit<InputProps, 'leftIcon' | 'rightIcon'> {
  onSearch?: (value: string) => void;
  debounceMs?: number;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, debounceMs = 300, ...props }, ref) => {
    const [localValue, setLocalValue] = React.useState(props.value || '');

    const searchIcon = (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    );

    // Debounced search
    React.useEffect(() => {
      const timer = setTimeout(() => {
        onSearch?.(String(localValue));
      }, debounceMs);

      return () => clearTimeout(timer);
    }, [localValue, debounceMs, onSearch]);

    return (
      <Input
        ref={ref}
        {...props}
        leftIcon={searchIcon}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';

export { Input, Textarea, Select, Checkbox, RadioGroup, SearchInput };
