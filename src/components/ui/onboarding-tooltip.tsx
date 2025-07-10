import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector for the target element
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingTooltipProps {
  steps: OnboardingStep[];
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export const OnboardingTooltip: React.FC<OnboardingTooltipProps> = ({
  steps,
  isVisible,
  onComplete,
  onSkip
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetPosition, setTargetPosition] = useState({ top: 0, left: 0 });

  const currentStep = steps[currentStepIndex];

  useEffect(() => {
    if (!isVisible || !currentStep) return;

    const updatePosition = () => {
      const targetElement = document.querySelector(currentStep.target);
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        setTargetPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [currentStep, isVisible]);

  if (!isVisible || !currentStep) return null;

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onSkip} />
      
      {/* Tooltip */}
      <Card 
        className="fixed z-50 w-80 shadow-lg"
        style={{
          top: targetPosition.top - 120,
          left: targetPosition.left + 20,
        }}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="font-semibold text-sm">
                {currentStep.title}
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                {currentStep.description}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 ml-2"
              onClick={onSkip}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    'w-2 h-2 rounded-full',
                    index === currentStepIndex ? 'bg-primary' : 'bg-muted'
                  )}
                />
              ))}
            </div>

            <div className="flex space-x-2">
              {!isFirstStep && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  className="h-7 px-2"
                >
                  <ArrowLeft className="h-3 w-3" />
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleNext}
                className="h-7 px-3"
              >
                {isLastStep ? 'Finish' : 'Next'}
                {!isLastStep && <ArrowRight className="h-3 w-3 ml-1" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

// Hook for managing onboarding state
export const useOnboarding = (key: string) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem(`onboarding-${key}`);
    if (!hasSeenOnboarding) {
      setIsVisible(true);
    }
  }, [key]);

  const complete = () => {
    localStorage.setItem(`onboarding-${key}`, 'true');
    setIsVisible(false);
  };

  const skip = () => {
    localStorage.setItem(`onboarding-${key}`, 'true');
    setIsVisible(false);
  };

  const reset = () => {
    localStorage.removeItem(`onboarding-${key}`);
    setIsVisible(true);
  };

  return {
    isVisible,
    complete,
    skip,
    reset
  };
};