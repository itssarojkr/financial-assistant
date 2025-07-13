import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { validateSalaryInput, sanitizeStringInput } from '@/lib/security-utils';
import { useAsyncError } from '@/hooks/use-error-boundary';
import { Loader2, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { convertCurrency } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { SalaryData } from '@/shared/types/common.types';

const SUPPORTED_CURRENCIES = [
  { code: 'USD', label: 'USD - US Dollar', symbol: '$' },
  { code: 'EUR', label: 'EUR - Euro', symbol: '€' },
  { code: 'INR', label: 'INR - Indian Rupee', symbol: '₹' },
  { code: 'GBP', label: 'GBP - British Pound', symbol: '£' },
  { code: 'CAD', label: 'CAD - Canadian Dollar', symbol: 'C$' },
  { code: 'AUD', label: 'AUD - Australian Dollar', symbol: 'A$' },
  { code: 'BRL', label: 'BRL - Brazilian Real', symbol: 'R$' },
  { code: 'ZAR', label: 'ZAR - South African Rand', symbol: 'R' },
  { code: 'JPY', label: 'JPY - Japanese Yen', symbol: '¥' },
  { code: 'CNY', label: 'CNY - Chinese Yuan', symbol: '¥' },
  { code: 'FRF', label: 'FRF - French Franc', symbol: '₣' },
];

interface SalaryInputProps {
  salaryData: SalaryData;
  setSalaryData: (data: SalaryData) => void;
  onNext?: () => void;
  onLoadCalculation?: () => void;
  showLoadButton?: boolean;
  disabled?: boolean;
}

export const SalaryInput: React.FC<SalaryInputProps> = ({
  salaryData,
  setSalaryData,
  onLoadCalculation,
  showLoadButton = false,
  disabled = false,
}) => {
  const [localValue, setLocalValue] = useState((salaryData.grossSalary || 0).toString());
  const [validationError, setValidationError] = useState<string | null>(null);
  const { handleAsyncError } = useAsyncError();

  // Add success state when validation passes
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const sanitizedValue = sanitizeStringInput(rawValue, 1000); // Limit salary input length
    setLocalValue(sanitizedValue);

    // Clear previous validation error
    setValidationError(null);

    // Allow empty input for better UX
    if (sanitizedValue === '') {
      setSalaryData({
        ...salaryData,
        grossSalary: 0
      });
      return;
    }

    // Parse and validate the number
    const numericValue = parseFloat(sanitizedValue.replace(/,/g, ''));
    
    if (isNaN(numericValue)) {
      setValidationError('Please enter a valid number');
      return;
    }

    const validation = validateSalaryInput(numericValue);
    if (validation.isValid) {
      setIsValid(true);
      setValidationError(null);
    } else {
      setIsValid(false);
      setValidationError(validation.error || 'Invalid salary amount');
    }

    try {
      setSalaryData({
        ...salaryData,
        grossSalary: numericValue
      });
    } catch (error) {
      handleAsyncError(error as Error, 'salary input change');
    }
  };

  const handleCurrencyChange = (currencyCode: string) => {
    setSalaryData({
      ...salaryData,
      currency: currencyCode
    });
  };

  const handleBlur = () => {
    // Format the number on blur for better UX
    if (salaryData.grossSalary > 0) {
      setLocalValue(salaryData.grossSalary.toLocaleString());
    }
  };

  const handleFocus = () => {
    // Remove formatting on focus for easier editing
    setLocalValue(salaryData.grossSalary.toString());
  };

  const selectedCurrency = SUPPORTED_CURRENCIES.find(c => c.code === salaryData.currency) || SUPPORTED_CURRENCIES[0];
  const currencySymbol = selectedCurrency.symbol || '';

  // Helper to get the default currency for a country
  const getDefaultCurrencyForCountry = (countryCode: string): string => {
    // Map country codes to default currencies (expand as needed)
    const countryCurrencyMap: Record<string, string> = {
      IN: 'INR',
      US: 'USD',
      CA: 'CAD',
      AU: 'AUD',
      BR: 'BRL',
      ZA: 'ZAR',
      GB: 'GBP',
      FR: 'EUR',
      DE: 'EUR',
      CN: 'CNY',
      JP: 'JPY',
    };
    return countryCurrencyMap[countryCode] || 'USD';
  };

  // Determine if a secondary currency is present
  const isSecondaryCurrency = (salaryCurrency: string, countryCode: string): boolean => {
    return salaryCurrency !== getDefaultCurrencyForCountry(countryCode);
  };

  const countryDefaultCurrency = getDefaultCurrencyForCountry(salaryData.countryCode);
  const secondaryCurrency = isSecondaryCurrency(salaryData.currency, salaryData.countryCode)
    ? salaryData.currency
    : null;

  const formatCurrency = (amount: number, code: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const salaryInCountryCurrency = convertCurrency(salaryData.grossSalary, salaryData.currency, countryDefaultCurrency);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="salary-input" className="text-sm font-medium">
          Annual Gross Salary
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="ml-1 cursor-help text-muted-foreground">?</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Enter your annual gross salary before any deductions or taxes.</p>
            </TooltipContent>
          </Tooltip>
        </Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground select-none pointer-events-none">
            {currencySymbol}
          </span>
          <Input
            id="salary-input"
            type="text"
            value={salaryData.grossSalary === 0 ? '' : salaryData.grossSalary}
            onChange={e => {
              const value = parseFloat(e.target.value) || 0;
              setSalaryData({ ...salaryData, grossSalary: value });
            }}
            onBlur={handleBlur}
            onFocus={handleFocus}
            placeholder="Enter your annual salary"
            disabled={disabled}
            className={`pl-8 max-w-md ${
              isValid === true ? 'border-green-500 focus:border-green-500' : 
              isValid === false ? 'border-red-500 focus:border-red-500' : 
              'border-gray-300'
            }`}
            aria-describedby={validationError ? 'salary-error' : undefined}
          />
          {isValid === true && (
            <CheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />
          )}
          {isValid === false && (
            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500" />
          )}
        </div>
        {validationError && (
          <Alert variant="destructive" id="salary-error">
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency-select" className="text-sm font-medium">
          Currency
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="ml-1 cursor-help text-muted-foreground">?</span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Select the currency for your salary. This affects tax calculations.</p>
            </TooltipContent>
          </Tooltip>
        </Label>
        <Select
          value={salaryData.currency}
          onValueChange={handleCurrencyChange}
          disabled={disabled}
        >
          <SelectTrigger id="currency-select" className="w-full max-w-md">
            <SelectValue placeholder="Select currency" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_CURRENCIES.map((currency) => (
              <SelectItem key={currency.code} value={currency.code}>
                {currency.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Early Insights Box */}
      {salaryData.country && salaryData.grossSalary > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-green-700" />
            <h4 className="text-sm font-medium text-green-800">Early Insights</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-700">Annual Gross Salary:</span>
              <span className="text-sm font-medium text-green-800">
                {formatCurrency(salaryData.grossSalary, salaryData.currency)}
                {countryDefaultCurrency !== salaryData.currency && (
                  <span className="ml-2 text-green-600">
                    ({formatCurrency(salaryInCountryCurrency, countryDefaultCurrency)})
                  </span>
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-700">Monthly Gross Salary:</span>
              <span className="text-sm font-medium text-green-800">
                {formatCurrency(salaryData.grossSalary / 12, salaryData.currency)}
                {countryDefaultCurrency !== salaryData.currency && (
                  <span className="ml-2 text-green-600">
                    ({formatCurrency(salaryInCountryCurrency / 12, countryDefaultCurrency)})
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm text-blue-800">
        <b>Tip:</b> Enter your gross salary before any deductions. We'll calculate your take-home pay after taxes and other deductions.
      </div>

      {showLoadButton && onLoadCalculation && (
        <div className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onLoadCalculation}
            className="w-full"
            disabled={disabled}
          >
            <Loader2 className="w-4 h-4 mr-2" />
            Load Saved Calculation
          </Button>
        </div>
      )}
    </div>
  );
};
