/**
 * Momen Card Components
 * Interactive and animated card components with hover effects
 */

'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/* ============================================
   CARD VARIANTS
   ============================================ */
const cardVariants = cva(
  [
    'rounded-lg',
    'border',
    'transition-all',
    'duration-300',
    'ease-out',
  ],
  {
    variants: {
      variant: {
        default: ['bg-card', 'border-default', 'shadow-sm'],
        elevated: ['bg-card', 'border-default', 'shadow-md', 'hover:shadow-lg'],
        flat: ['bg-card', 'border-transparent', 'shadow-none'],
        outlined: ['bg-transparent', 'border-default', 'shadow-none'],
        interactive: [
          'bg-card',
          'border-default',
          'shadow-sm',
          'hover:shadow-md',
          'hover:-translate-y-0.5',
          'cursor-pointer',
        ],
      },
      size: {
        sm: ['p-3'],
        md: ['p-4'],
        lg: ['p-6'],
        xl: ['p-8'],
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

/* ============================================
   CARD COMPONENT
   ============================================ */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, size, asChild = false, isLoading, children, ...props }, ref) => {
    // Skeleton loader for loading state
    if (isLoading) {
      return (
        <div
          ref={ref}
          className={cn(cardVariants({ variant, size, className }))}
          {...props}
        >
          <CardSkeleton size={size ?? undefined} />
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/* ============================================
   CARD HEADER
   ============================================ */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, description, action, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex flex-col space-y-1.5', className)}
        {...props}
      >
        {(title || description || action) && (
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              {title && (
                <h3 className="text-lg font-semibold leading-none tracking-tight text-slate">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-sm text-sky">{description}</p>
              )}
            </div>
            {action && <div className="flex-shrink-0">{action}</div>}
          </div>
        )}
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

/* ============================================
   CARD TITLE
   ============================================ */
const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('text-lg font-semibold leading-none tracking-tight text-slate', className)}
    {...props}
  >
    {children}
  </h3>
));

CardTitle.displayName = 'CardTitle';

/* ============================================
   CARD DESCRIPTION
   ============================================ */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-sky', className)}
    {...props}
  >
    {children}
  </p>
));

CardDescription.displayName = 'CardDescription';

/* ============================================
   CARD CONTENT
   ============================================ */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-0', className)} {...props} />
));

CardContent.displayName = 'CardContent';

/* ============================================
   CARD FOOTER
   ============================================ */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center gap-2 pt-4 mt-4 border-t border-default', className)}
    {...props}
  />
));

CardFooter.displayName = 'CardFooter';

/* ============================================
   EVENT CARD (Specialized)
   ============================================ */
export interface EventCardProps {
  id: string;
  title: string;
  date: string;
  photoCount: number;
  status: 'active' | 'ended' | 'upcoming';
  thumbnail?: string;
  onClick?: () => void;
  className?: string;
}

const EventCard = React.forwardRef<HTMLDivElement, EventCardProps>(
  ({ id: _id, title, date, photoCount, status, thumbnail, onClick, className }, ref) => {
    const [imageLoaded, setImageLoaded] = React.useState(false);
    const [imageError, setImageError] = React.useState(false);

    const statusColors = {
      active: 'bg-success-light text-success-dark',
      ended: 'bg-cream text-slate',
      upcoming: 'bg-info-light text-info-dark',
    };

    return (
      <Card
        ref={ref}
        variant="interactive"
        size="md"
        onClick={onClick}
        className={cn('overflow-hidden group', className)}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden bg-cream rounded-md -mt-4 -mx-4 mb-3">
          {thumbnail && !imageError ? (
            <>
              <img
                src={thumbnail}
                alt={title}
                className={cn(
                  'w-full h-full object-cover transition-transform duration-300',
                  'group-hover:scale-105',
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                )}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 animate-pulse bg-gradient-shimmer bg-[length:200%_100%]" />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sky/40">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}

          {/* Status Badge */}
          <div className={cn(
            'absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium',
            statusColors[status]
          )}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-2">
          <h3 className="font-semibold text-slate line-clamp-1">{title}</h3>
          <p className="text-sm text-sky">{date}</p>

          {/* Photo Count Badge */}
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-slate/5 text-slate">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs font-medium">{photoCount}</span>
            </div>
            <span className="text-xs text-sky">photos</span>
          </div>
        </div>
      </Card>
    );
  }
);

EventCard.displayName = 'EventCard';

/* ============================================
   STATS CARD
   ============================================ */
export interface StatsCardProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  onClick?: () => void;
  className?: string;
}

const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({ label, value, icon, trend, onClick, className }, ref) => {
    return (
      <Card
        ref={ref}
        variant="interactive"
        size="md"
        onClick={onClick}
        className={cn('relative overflow-hidden', className)}
      >
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
          <svg viewBox="0 0 100 100" fill="currentColor" className="text-slate">
            <circle cx="80" cy="20" r="60" />
          </svg>
        </div>

        <div className="relative">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <p className="text-sm text-sky">{label}</p>
              <p className="text-3xl font-bold text-slate">{value}</p>

              {trend && (
                <div className={cn(
                  'inline-flex items-center gap-1 text-xs font-medium',
                  trend.isPositive ? 'text-success' : 'text-error'
                )}>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={trend.isPositive ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'}
                    />
                  </svg>
                  <span>{Math.abs(trend.value)}%</span>
                </div>
              )}
            </div>

            {icon && (
              <div className="p-2 rounded-lg bg-slate/5 text-slate">
                {icon}
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }
);

StatsCard.displayName = 'StatsCard';

/* ============================================
   SKELETON LOADER
   ============================================ */
interface CardSkeletonProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const CardSkeleton = ({ size = 'md' }: CardSkeletonProps) => {
  const padding = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  }[size];

  return (
    <div className={cn('space-y-3', padding)}>
      {/* Title skeleton */}
      <div className="h-5 w-3/4 rounded bg-gradient-shimmer bg-[length:200%_100%] animate-shimmer" />

      {/* Description skeleton */}
      <div className="space-y-2">
        <div className="h-4 w-full rounded bg-gradient-shimmer bg-[length:200%_100%] animate-shimmer" />
        <div className="h-4 w-2/3 rounded bg-gradient-shimmer bg-[length:200%_100%] animate-shimmer" />
      </div>

      {/* Content skeleton */}
      <div className="space-y-2 pt-2">
        <div className="h-16 w-full rounded bg-gradient-shimmer bg-[length:200%_100%] animate-shimmer" />
      </div>
    </div>
  );
};

/* ============================================
   EXPORTS
   ============================================ */
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  EventCard,
  StatsCard,
  cardVariants,
};
