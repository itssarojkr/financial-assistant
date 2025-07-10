import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  description?: string;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: string;
  completedSteps: string[];
  className?: string;
  onStepClick?: (stepId: string) => void;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  completedSteps,
  className,
  onStepClick
}) => {
  const currentIndex = steps.findIndex(step => step.id === currentStep);
  
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          const isClickable = onStepClick && (isCompleted || index <= currentIndex);
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <button
                  onClick={() => isClickable && onStepClick?.(step.id)}
                  disabled={!isClickable}
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200',
                    {
                      'bg-primary text-primary-foreground': isCurrent,
                      'bg-green-500 text-white': isCompleted,
                      'bg-muted text-muted-foreground': !isCurrent && !isCompleted,
                      'hover:bg-primary/80 cursor-pointer': isClickable,
                      'cursor-not-allowed': !isClickable
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </button>
                <div className="mt-2 text-center">
                  <div className={cn(
                    'text-sm font-medium',
                    {
                      'text-primary': isCurrent,
                      'text-foreground': isCompleted,
                      'text-muted-foreground': !isCurrent && !isCompleted
                    }
                  )}>
                    {step.label}
                  </div>
                  {step.description && (
                    <div className="text-xs text-muted-foreground mt-1 max-w-[100px]">
                      {step.description}
                    </div>
                  )}
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={cn(
                  'flex-1 h-0.5 mx-4 transition-colors duration-200',
                  {
                    'bg-green-500': index < currentIndex,
                    'bg-primary': index === currentIndex - 1,
                    'bg-muted': index >= currentIndex
                  }
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};