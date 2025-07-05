import { useState, useCallback, useMemo } from 'react';
import { TaxData } from '@/pages/Index';

export interface TaxCalculatorState {
  viewMode: 'annual' | 'monthly';
  showAdvanced: boolean;
  showWhatIf: boolean;
  whatIfSalary: number;
  showCalculationModal: boolean;
}

export interface DeductionState {
  [key: string]: number;
}

export const useTaxCalculator = (initialSalary: number = 0) => {
  // View and UI state
  const [viewMode, setViewMode] = useState<'annual' | 'monthly'>('annual');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showWhatIf, setShowWhatIf] = useState(false);
  const [whatIfSalary, setWhatIfSalary] = useState(initialSalary);
  const [showCalculationModal, setShowCalculationModal] = useState(false);

  // Deductions state
  const [deductions, setDeductions] = useState<DeductionState>({});

  // Memoized getValue function
  const getValue = useCallback((val: number) => {
    return viewMode === 'monthly' ? val / 12 : val;
  }, [viewMode]);

  // Memoized view label
  const viewLabel = useMemo(() => {
    return viewMode === 'monthly' ? 'Monthly' : 'Annual';
  }, [viewMode]);

  // Update what-if salary when main salary changes
  const updateWhatIfSalary = useCallback((newSalary: number) => {
    setWhatIfSalary(newSalary);
  }, []);

  // Toggle advanced options
  const toggleAdvanced = useCallback(() => {
    setShowAdvanced(prev => !prev);
  }, []);

  // Toggle what-if scenario
  const toggleWhatIf = useCallback(() => {
    setShowWhatIf(prev => !prev);
  }, []);

  // Update deduction value
  const updateDeduction = useCallback((key: string, value: number) => {
    setDeductions(prev => ({
      ...prev,
      [key]: value
    }));
  }, []);

  // Calculate total deductions
  const totalDeductions = useMemo(() => {
    return Object.values(deductions).reduce((sum, value) => sum + Math.max(0, value), 0);
  }, [deductions]);

  // Reset all state
  const resetState = useCallback(() => {
    setViewMode('annual');
    setShowAdvanced(false);
    setShowWhatIf(false);
    setWhatIfSalary(initialSalary);
    setShowCalculationModal(false);
    setDeductions({});
  }, [initialSalary]);

  return {
    // State
    viewMode,
    showAdvanced,
    showWhatIf,
    whatIfSalary,
    showCalculationModal,
    deductions,
    totalDeductions,
    
    // Computed values
    getValue,
    viewLabel,
    
    // Actions
    setViewMode,
    setShowAdvanced,
    setShowWhatIf,
    setWhatIfSalary,
    setShowCalculationModal,
    updateWhatIfSalary,
    toggleAdvanced,
    toggleWhatIf,
    updateDeduction,
    resetState
  };
};

/**
 * Hook for managing what-if tax data
 */
export const useWhatIfTaxData = (initialTaxData: TaxData) => {
  const [whatIfTaxData, setWhatIfTaxData] = useState<TaxData>(initialTaxData);

  const updateWhatIfTaxData = useCallback((newData: TaxData) => {
    setWhatIfTaxData(newData);
  }, []);

  const resetWhatIfTaxData = useCallback(() => {
    setWhatIfTaxData(initialTaxData);
  }, [initialTaxData]);

  return {
    whatIfTaxData,
    setWhatIfTaxData,
    updateWhatIfTaxData,
    resetWhatIfTaxData
  };
};

/**
 * Hook for calculating effective tax rate and user bracket
 */
export const useTaxMetrics = (taxData: TaxData, grossSalary: number) => {
  const effectiveTaxRate = useMemo(() => {
    return grossSalary > 0 ? (taxData.totalTax / grossSalary) * 100 : 0;
  }, [taxData.totalTax, grossSalary]);

  const userBracketIdx = useMemo(() => {
    if (!taxData.brackets || taxData.brackets.length === 0) return -1;
    return taxData.brackets.map(b => b.taxPaid > 0).lastIndexOf(true);
  }, [taxData.brackets]);

  const userBracket = useMemo(() => {
    return userBracketIdx >= 0 && taxData.brackets ? taxData.brackets[userBracketIdx] : null;
  }, [userBracketIdx, taxData.brackets]);

  return {
    effectiveTaxRate,
    userBracketIdx,
    userBracket
  };
}; 