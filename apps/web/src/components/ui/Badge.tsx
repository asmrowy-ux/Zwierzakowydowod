import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export type BadgeVariant = 'home' | 'walking' | 'lost' | 'default' | 'success' | 'warning' | 'danger' | 'info';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

export function Badge({ variant = 'default', children, className, ...props }: BadgeProps) {
  const baseStyles = 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide transition-all duration-300 shadow-sm';
  
  const variants = {
    home: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800/50 status-pulse-home',
    walking: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800/50',
    lost: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800/50 status-pulse-lost font-bold uppercase tracking-wider',
    default: 'bg-pet-warm-100 text-pet-warm-800 dark:bg-slate-800 dark:text-slate-300 border border-pet-warm-200 dark:border-slate-700',
    success: 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border border-green-200/60 dark:border-green-900/30',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/30',
    danger: 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border border-red-200/60 dark:border-red-900/30',
    info: 'bg-pet-teal-50 text-pet-teal-700 dark:bg-teal-950/20 dark:text-teal-400 border border-pet-teal-200/60 dark:border-teal-900/30',
  };

  return (
    <span
      className={twMerge(clsx(baseStyles, variants[variant], className))}
      {...props}
    >
      {variant === 'home' && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
      {variant === 'lost' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />}
      {children}
    </span>
  );
}
