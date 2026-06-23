'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  asChild?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-pet-amber-500 to-pet-orange-500 text-white shadow-pet hover:shadow-pet-lg hover:from-pet-amber-400 hover:to-pet-orange-400 active:from-pet-amber-600 active:to-pet-orange-600 border-none',
  secondary:
    'bg-gradient-to-r from-pet-teal-500 to-pet-teal-600 text-white shadow-pet-teal hover:from-pet-teal-400 hover:to-pet-teal-500 active:from-pet-teal-600 active:to-pet-teal-700 border-none',
  outline:
    'bg-transparent border-2 border-pet-amber-400 text-pet-amber-600 hover:bg-pet-amber-50 dark:text-pet-amber-400 dark:hover:bg-pet-amber-900/20',
  ghost:
    'bg-transparent text-pet-warm-600 hover:bg-pet-warm-100 dark:text-pet-warm-300 dark:hover:bg-slate-800 border-none',
  danger:
    'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg hover:from-red-400 hover:to-rose-500 active:from-red-600 active:to-rose-700 border-none',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-base rounded-xl gap-2',
  lg: 'px-7 py-3.5 text-lg rounded-2xl gap-2.5',
};

import React from 'react';

const Button = forwardRef<any, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      icon,
      iconPosition = 'left',
      fullWidth = false,
      asChild = false,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const combinedClassName = cn(
      'inline-flex items-center justify-center font-display font-semibold',
      'transition-all duration-200 ease-out',
      'hover:scale-[1.02] active:scale-[0.98]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pet-amber-400 focus-visible:ring-offset-2',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
      variantStyles[variant],
      sizeStyles[size],
      fullWidth && 'w-full',
      className
    );

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        className: cn(combinedClassName, (children.props as any).className),
        ref: ref,
        ...props,
      });
    }

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={combinedClassName}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={size === 'sm' ? 14 : size === 'lg' ? 22 : 18} />
            <span>{children}</span>
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
            <span>{children}</span>
            {icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
