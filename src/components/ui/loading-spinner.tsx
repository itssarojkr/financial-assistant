import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  className,
  text = 'Loading...'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {text && (
        <span className="text-sm text-muted-foreground">{text}</span>
      )}
    </div>
  );
};

interface CalculationLoadingProps {
  className?: string;
}

export const CalculationLoading: React.FC<CalculationLoadingProps> = ({ className }) => {
  return (
    <div className={cn('p-8 text-center', className)}>
      <LoadingSpinner size="lg" text="Calculating your taxes..." />
      <p className="text-sm text-muted-foreground mt-2">
        This may take a few seconds
      </p>
    </div>
  );
};

interface TableLoadingProps {
  rows?: number;
  className?: string;
}

export const TableLoading: React.FC<TableLoadingProps> = ({ rows = 3, className }) => {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4">
          <div className="h-4 bg-muted rounded animate-pulse flex-1" />
          <div className="h-4 bg-muted rounded animate-pulse w-20" />
        </div>
      ))}
    </div>
  );
};