import React from 'react';
import { Check, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Step {
  label: string;
  value: string;
}

interface StepperProps {
  currentStep: string;
  steps: Step[];
}

export const Stepper: React.FC<StepperProps> = ({ currentStep, steps }) => {
  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.value === currentStep);
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <ol className="flex items-center justify-center gap-4 lg:gap-8" aria-label="Progress">
      {steps.map((step, idx) => {
        const isCompleted = idx < currentStepIndex;
        const isCurrent = currentStep === step.value;
        const isUpcoming = idx > currentStepIndex;

        return (
          <li key={step.value} className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className={`rounded-full w-8 h-8 flex items-center justify-center border-2 transition-all duration-200 ${
                    isCompleted 
                      ? 'border-green-500 bg-green-500 text-white' 
                      : isCurrent 
                        ? 'border-primary bg-primary text-white' 
                        : 'border-gray-300 bg-white text-gray-500'
                  }`}
                  aria-current={isCurrent ? 'step' : undefined}
                  tabIndex={0}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    idx + 1
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{step.label}</p>
                {isCompleted && <p className="text-xs text-green-600">Completed</p>}
                {isCurrent && <p className="text-xs text-blue-600">Current</p>}
                {isUpcoming && <p className="text-xs text-gray-500">Upcoming</p>}
              </TooltipContent>
            </Tooltip>
            <span className={`text-xs lg:text-sm font-medium ${
              isCompleted ? 'text-green-600' : isCurrent ? 'text-primary' : 'text-gray-500'
            }`}>
              {step.label}
            </span>
            {idx < steps.length - 1 && (
              <ChevronRight className={`w-4 h-4 ${
                isCompleted ? 'text-green-500' : 'text-gray-300'
              }`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}; 