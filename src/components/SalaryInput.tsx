
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { validateSalaryInput, sanitizeStringInput } from '@/lib/security-utils';
import { useAsyncError } from '@/hooks/use-error-boundary';

interface SalaryInputProps {
  salary: number;
  onSalaryChange: (salary: number) => void;
  currency: string;
  disabled?: boolean;
}

export const SalaryInput: React.FC<SalaryInputProps> = ({
  salary,
  onSalaryChange,
  currency,
  disabled = false,
}) => {
  const [localValue, setLocalValue] = useState(salary.toString());
  const [validationError, setValidationError] = useState<string | null>(null);
  const { handleAsyncError } = useAsyncError();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const sanitizedValue = sanitizeStringInput(rawValue, 20); // Limit salary input length
    setLocalValue(sanitizedValue);

    // Clear previous validation error
    setValidationError(null);

    // Allow empty input for better UX
    if (sanitizedValue === '') {
      onSalaryChange(0);
      return;
    }

    // Parse and validate the number
    const numericValue = parseFloat(sanitizedValue.replace(/,/g, ''));
    
    if (isNaN(numericValue)) {
      setValidationError('Please enter a valid number');
      return;
    }

    const validation = validateSalaryInput(numericValue);
    if (!validation.isValid) {
      setValidationError(validation.error || 'Invalid salary amount');
      return;
    }

    try {
      onSalaryChange(numericValue);
    } catch (error) {
      handleAsyncError(error as Error, 'salary input change');
    }
  };

  const handleBlur = () => {
    // Format the number on blur for better UX
    if (salary > 0) {
      setLocalValue(salary.toLocaleString());
    }
  };

  const handleFocus = () => {
    // Remove formatting on focus for easier editing
    setLocalValue(salary.toString());
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="salary-input" className="text-sm font-medium">
        Annual Salary ({currency})
      </Label>
      <Input
        id="salary-input"
        type="text"
        value={localValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        placeholder={`Enter your annual salary in ${currency}`}
        disabled={disabled}
        className={validationError ? 'border-red-500 focus:border-red-500' : ''}
        aria-describedby={validationError ? 'salary-error' : undefined}
      />
      {validationError && (
        <Alert variant="destructive" id="salary-error">
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}
      <p className="text-xs text-muted-foreground">
        Enter your gross annual salary (maximum: $10,000,000)
      </p>
    </div>
  );
};
