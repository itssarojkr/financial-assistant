
import React from 'react';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ValidationMessageProps {
  type: 'success' | 'error' | 'info';
  message: string;
  className?: string;
}

export const ValidationMessage: React.FC<ValidationMessageProps> = ({
  type,
  message,
  className
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-destructive';
      case 'info':
        return 'text-blue-600';
    }
  };

  return (
    <div className={cn('flex items-center space-x-2 text-sm', getTextColor(), className)}>
      {getIcon()}
      <span>{message}</span>
    </div>
  );
};

interface PasswordStrengthProps {
  password: string;
  className?: string;
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password,
  className
}) => {
  const getStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getStrength(password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-green-500'
  ];

  if (!password) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex space-x-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-2 flex-1 rounded-full',
              i < strength ? strengthColors[strength - 1] : 'bg-muted'
            )}
          />
        ))}
      </div>
      <div className="text-xs text-muted-foreground">
        Password strength: {strengthLabels[strength - 1] || 'Very Weak'}
      </div>
      <div className="text-xs text-muted-foreground space-y-1">
        <div className={cn(password.length >= 8 ? 'text-green-600' : 'text-muted-foreground')}>
          ✓ At least 8 characters
        </div>
        <div className={cn(/[a-z]/.test(password) ? 'text-green-600' : 'text-muted-foreground')}>
          ✓ Lowercase letter
        </div>
        <div className={cn(/[A-Z]/.test(password) ? 'text-green-600' : 'text-muted-foreground')}>
          ✓ Uppercase letter
        </div>
        <div className={cn(/[0-9]/.test(password) ? 'text-green-600' : 'text-muted-foreground')}>
          ✓ Number
        </div>
        <div className={cn(/[^A-Za-z0-9]/.test(password) ? 'text-green-600' : 'text-muted-foreground')}>
          ✓ Special character
        </div>
      </div>
    </div>
  );
};
