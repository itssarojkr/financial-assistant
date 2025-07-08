import { useMemo, useCallback } from 'react';

export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
  taxPaid: number;
}

export interface TaxCalculationParams {
  grossSalary: number;
  deductions: number;
  brackets: TaxBracket[];
  additionalTaxes?: {
    surcharge?: number;
    cess?: number;
    rebate?: number;
    [key: string]: number | undefined;
  };
}

export interface TaxCalculationResult {
  brackets: TaxBracket[];
  totalTax: number;
  takeHomeSalary: number;
  taxableIncome: number;
  additionalTaxes: Record<string, number>;
}

/**
 * Calculate tax based on brackets
 */
export const calculateBracketTax = (
  taxableIncome: number,
  brackets: Omit<TaxBracket, 'taxPaid'>[]
): TaxBracket[] => {
  return brackets.map(bracket => {
    if (taxableIncome <= bracket.min) {
      return { ...bracket, taxPaid: 0 };
    }
    const upper = bracket.max === null ? taxableIncome : Math.min(taxableIncome, bracket.max);
    const band = Math.max(0, upper - bracket.min);
    const tax = band * bracket.rate;
    return { ...bracket, taxPaid: tax };
  });
};

/**
 * Calculate total tax from brackets
 */
export const calculateTotalBracketTax = (brackets: TaxBracket[]): number => {
  return brackets.reduce((sum, bracket) => sum + bracket.taxPaid, 0);
};

/**
 * Calculate effective tax rate
 */
export const calculateEffectiveTaxRate = (
  totalTax: number,
  grossSalary: number
): number => {
  return grossSalary > 0 ? (totalTax / grossSalary) * 100 : 0;
};

/**
 * Calculate surcharge based on income tax
 */
export const calculateSurcharge = (incomeTax: number): number => {
  if (incomeTax > 10000000) return incomeTax * 0.15;
  if (incomeTax > 5000000) return incomeTax * 0.10;
  if (incomeTax > 1000000) return incomeTax * 0.05;
  return 0;
};

/**
 * Find user's tax bracket index
 */
export const findUserBracketIndex = (brackets: TaxBracket[]): number => {
  if (!brackets || brackets.length === 0) return -1;
  return brackets.map(b => b.taxPaid > 0).lastIndexOf(true);
};

/**
 * Format currency values
 */
export const formatCurrency = (
  value: number,
  currency: string,
  locale: string = 'en-US'
): string => {
  return `${currency}${value.toLocaleString(locale)}`;
};

/**
 * Calculate monthly value from annual
 */
export const calculateMonthlyValue = (annualValue: number): number => {
  return annualValue / 12;
};

/**
 * Memoized tax calculation hook
 */
export const useTaxCalculation = (
  params: TaxCalculationParams,
  dependencies: unknown[]
) => {
  return useMemo(() => {
    const { grossSalary, deductions, brackets, additionalTaxes = {} } = params;
    
    if (grossSalary <= 0) {
      return {
        brackets: [],
        totalTax: 0,
        takeHomeSalary: 0,
        taxableIncome: 0,
        additionalTaxes: {}
      };
    }

    const grossAfterDeductions = Math.max(0, grossSalary - deductions);
    const calculatedBrackets = calculateBracketTax(grossAfterDeductions, brackets);
    const bracketTax = calculateTotalBracketTax(calculatedBrackets);
    
    // Apply additional taxes
    let totalTax = bracketTax;
    const finalAdditionalTaxes: Record<string, number> = {};
    
    Object.entries(additionalTaxes).forEach(([key, value]) => {
      if (typeof value === 'number') {
        finalAdditionalTaxes[key] = value;
        totalTax += value;
      }
    });

    const takeHomeSalary = grossSalary - totalTax;

    return {
      brackets: calculatedBrackets,
      totalTax,
      takeHomeSalary,
      taxableIncome: grossAfterDeductions,
      additionalTaxes: finalAdditionalTaxes
    };
  }, dependencies);
};

/**
 * Memoized chart data preparation
 */
export const useChartData = (
  currentData: unknown,
  whatIfData: unknown,
  dataKeys: string[]
) => {
  return useMemo(() => {
    return dataKeys.map(key => ({
      name: key,
      Current: Number(Math.max(0, currentData[key] || 0)),
      'What-if': Number(Math.max(0, whatIfData[key] || 0))
    }));
  }, [currentData, whatIfData, dataKeys]);
};

/**
 * Memoized difference calculations
 */
export const useDifferenceCalculations = (
  currentSalary: number,
  whatIfSalary: number,
  currentTax: number,
  whatIfTax: number,
  currentTakeHome: number,
  whatIfTakeHome: number
) => {
  return useMemo(() => ({
    salaryDifference: whatIfSalary - currentSalary,
    taxDifference: whatIfTax - currentTax,
    takeHomeDifference: whatIfTakeHome - currentTakeHome
  }), [currentSalary, whatIfSalary, currentTax, whatIfTax, currentTakeHome, whatIfTakeHome]);
}; 