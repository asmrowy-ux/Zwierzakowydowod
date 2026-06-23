'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  gradientBorder?: boolean;
  hover?: boolean;
  glass?: boolean;
  padding?: CardPadding;
}

const paddingStyles: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-7',
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      gradientBorder = false,
      hover = true,
      glass = false,
      padding = 'md',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const cardContent = (
      <div
        ref={gradientBorder ? undefined : ref}
        className={cn(
          'rounded-pet-lg',
          glass
            ? 'glass'
            : 'bg-white dark:bg-slate-800/90',
          'shadow-glass',
          hover && 'transition-all duration-300 hover:-translate-y-1 hover:shadow-pet-lg',
          paddingStyles[padding],
          !gradientBorder && className
        )}
        {...(gradientBorder ? {} : props)}
      >
        {children}
      </div>
    );

    if (gradientBorder) {
      return (
        <div
          ref={ref}
          className={cn('gradient-border', className)}
          {...props}
        >
          {cardContent}
        </div>
      );
    }

    return cardContent;
  }
);

Card.displayName = 'Card';

export default Card;

export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        'font-display font-bold text-lg text-pet-warm-800 dark:text-white',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        'text-sm text-pet-warm-500 dark:text-slate-400 mt-1',
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}
