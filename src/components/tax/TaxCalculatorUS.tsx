import React, { useState, useCallback, useMemo } from 'react';
import { SalaryData, TaxData } from '@/pages/Index';
import TaxSummaryCard from './TaxSummaryCard';
import TaxBracketTable from './TaxBracketTable';
import { Info } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import AdvancedOptions from './AdvancedOptions';
import WhatIfCalculator from './WhatIfCalculator';
import { useTaxCalculator, useWhatIfTaxData, useTaxMetrics } from '@/hooks/use-tax-calculator';
import { DeductionField } from './AdvancedOptions';
import { convertCurrency } from '@/lib/utils';

interface USAdditionalParams {
  filingStatus?: 'single' | 'married' | 'head';
  state?: string;
}

interface TaxCalculatorUSProps {
  salaryData: SalaryData;
  taxData: TaxData;
  setTaxData: (data: TaxData) => void;
  onNext: () => void;
  usFilingStatus: 'single' | 'married' | 'head';
  setUsFilingStatus: (status: 'single' | 'married' | 'head') => void;
  usState: string;
  setUsState: (state: string) => void;
  userCurrency?: string;
  countryCurrency?: string;
}

const US_STATES = [
  { name: 'California', code: 'CA', rate: 0.05 },
  { name: 'New York', code: 'NY', rate: 0.06 },
  { name: 'Texas', code: 'TX', rate: 0 },
  { name: 'Florida', code: 'FL', rate: 0 },
  { name: 'Illinois', code: 'IL', rate: 0.0495 },
];

const FILING_STATUSES = {
  single: {
    label: 'Single',
    stdDeduction: 13850,
    brackets: [
      { min: 0, max: 11000, rate: 0.10 },
      { min: 11000, max: 44725, rate: 0.12 },
      { min: 44725, max: 95375, rate: 0.22 },
      { min: 95375, max: 182100, rate: 0.24 },
      { min: 182100, max: 231250, rate: 0.32 },
      { min: 231250, max: 578125, rate: 0.35 },
      { min: 578125, max: null, rate: 0.37 },
    ],
  },
  married: {
    label: 'Married Filing Jointly',
    stdDeduction: 27700,
    brackets: [
      { min: 0, max: 22000, rate: 0.10 },
      { min: 22000, max: 89450, rate: 0.12 },
      { min: 89450, max: 190750, rate: 0.22 },
      { min: 190750, max: 364200, rate: 0.24 },
      { min: 364200, max: 462500, rate: 0.32 },
      { min: 462500, max: 693750, rate: 0.35 },
      { min: 693750, max: null, rate: 0.37 },
    ],
  },
  head: {
    label: 'Head of Household',
    stdDeduction: 20800,
    brackets: [
      { min: 0, max: 15700, rate: 0.10 },
      { min: 15700, max: 59850, rate: 0.12 },
      { min: 59850, max: 95350, rate: 0.22 },
      { min: 95350, max: 182100, rate: 0.24 },
      { min: 182100, max: 231250, rate: 0.32 },
      { min: 231250, max: 578100, rate: 0.35 },
      { min: 578100, max: null, rate: 0.37 },
    ],
  },
};

const SS_WAGE_CAP = 160200; // 2023 cap
const SS_RATE = 0.062;
const MEDICARE_RATE = 0.0145;

const TaxCalculatorUS: React.FC<TaxCalculatorUSProps> = ({ 
  salaryData, 
  taxData, 
  setTaxData, 
  onNext, 
  usFilingStatus, 
  setUsFilingStatus, 
  usState, 
  setUsState,
  userCurrency,
  countryCurrency
}) => {
  // Use the reusable tax calculator hook
  const {
    viewMode,
    showAdvanced,
    showWhatIf,
    whatIfSalary,
    showCalculationModal,
    deductions,
    totalDeductions,
    getValue,
    setViewMode,
    toggleAdvanced,
    toggleWhatIf,
    setWhatIfSalary,
    setShowCalculationModal,
    updateDeduction
  } = useTaxCalculator(salaryData.grossSalary);

  // Use the reusable what-if tax data hook
  const { whatIfTaxData, setWhatIfTaxData } = useWhatIfTaxData(taxData);

  // Use the reusable tax metrics hook
  const { effectiveTaxRate, userBracketIdx, userBracket } = useTaxMetrics(taxData, salaryData.grossSalary);

  // US-specific deduction fields
  const deductionFields: DeductionField[] = [
    {
      key: 'ded401k',
      label: '401(k)/IRA Contributions',
      tooltip: 'Pre-tax retirement contributions',
    },
    {
      key: 'dedOther',
      label: 'Other Deductions',
      tooltip: 'Other eligible deductions',
    }
  ];

  // US-specific tax calculation function
  const calculateUSTax = useCallback((params: {
    grossSalary: number;
    deductions: Record<string, number>;
    additionalParams?: USAdditionalParams;
  }) => {
    const { grossSalary, deductions, additionalParams = {} } = params;
    const filingStatus = additionalParams.filingStatus || usFilingStatus;
    const state = additionalParams.state || usState;

    const filing = FILING_STATUSES[filingStatus];
    const stateObj = US_STATES.find(s => s.name === state);
    const stateRate = stateObj ? stateObj.rate : 0.05;
    const stdDeduction = filing.stdDeduction;

    const totalDeductions = Math.max(0, deductions.ded401k || 0) + Math.max(0, deductions.dedOther || 0);
    const grossAfterDeductions = Math.max(0, grossSalary - totalDeductions);
    const taxableIncome = Math.max(0, grossAfterDeductions - stdDeduction);

    // Calculate bracket tax
    const calculatedBrackets = filing.brackets.map(bracket => {
      if (taxableIncome <= bracket.min) return { ...bracket, taxPaid: 0 };
      const upper = bracket.max === null ? taxableIncome : Math.min(taxableIncome, bracket.max);
      const band = Math.max(0, upper - bracket.min);
      const tax = band * bracket.rate;
      return { ...bracket, taxPaid: tax };
    });

    const federalTax = calculatedBrackets.reduce((sum, b) => sum + b.taxPaid, 0);

    // Calculate additional taxes
    const stateTax = grossAfterDeductions * stateRate;
    const socialSecurity = Math.min(grossAfterDeductions, SS_WAGE_CAP) * SS_RATE;
    const medicare = grossAfterDeductions * MEDICARE_RATE;

    const totalTax = federalTax + stateTax + socialSecurity + medicare;
    const takeHomeSalary = grossSalary - totalTax;

    return {
      brackets: calculatedBrackets,
      totalTax,
      takeHomeSalary,
      taxableIncome,
      additionalTaxes: { stateTax, socialSecurity, medicare },
      breakdown: {
        federalTax,
        stateTax,
        socialSecurity,
        medicare
      }
    };
  }, [usFilingStatus, usState]);

  // Memoized tax calculation for main scenario
  const mainTaxCalculation = useMemo(() => {
    if (salaryData.grossSalary <= 0) return null;
    
    return calculateUSTax({
      grossSalary: salaryData.grossSalary,
      deductions,
      additionalParams: { filingStatus: usFilingStatus, state: usState }
    });
  }, [salaryData.grossSalary, deductions, usFilingStatus, usState, calculateUSTax]);

  // Memoized tax calculation for what-if scenario
  const whatIfTaxCalculation = useMemo(() => {
    if (whatIfSalary <= 0 || !showWhatIf) return null;
    
    return calculateUSTax({
      grossSalary: whatIfSalary,
      deductions,
      additionalParams: { filingStatus: usFilingStatus, state: usState }
    });
  }, [whatIfSalary, deductions, usFilingStatus, usState, showWhatIf, calculateUSTax]);

  // Update main tax data when calculation changes
  React.useEffect(() => {
    if (mainTaxCalculation) {
      setTaxData({
        brackets: mainTaxCalculation.brackets,
        totalTax: mainTaxCalculation.totalTax,
        takeHomeSalary: mainTaxCalculation.takeHomeSalary,
        federalTax: mainTaxCalculation.breakdown.federalTax,
        stateTax: mainTaxCalculation.breakdown.stateTax,
        socialSecurity: mainTaxCalculation.breakdown.socialSecurity,
        medicare: mainTaxCalculation.breakdown.medicare,
        taxableIncome: mainTaxCalculation.taxableIncome,
      });
    }
  }, [mainTaxCalculation, setTaxData]);

  // Update what-if tax data when calculation changes
  React.useEffect(() => {
    if (whatIfTaxCalculation) {
      setWhatIfTaxData({
        brackets: whatIfTaxCalculation.brackets,
        totalTax: whatIfTaxCalculation.totalTax,
        takeHomeSalary: whatIfTaxCalculation.takeHomeSalary,
        federalTax: whatIfTaxCalculation.breakdown.federalTax,
        stateTax: whatIfTaxCalculation.breakdown.stateTax,
        socialSecurity: whatIfTaxCalculation.breakdown.socialSecurity,
        medicare: whatIfTaxCalculation.breakdown.medicare,
        taxableIncome: whatIfTaxCalculation.taxableIncome,
      });
    }
  }, [whatIfTaxCalculation, setWhatIfTaxData]);

  const showSecondaryCurrency = userCurrency && countryCurrency && userCurrency !== countryCurrency;
  const takeHomeUserCurrency = showSecondaryCurrency ? convertCurrency(taxData.takeHomeSalary || 0, countryCurrency!, userCurrency!) : null;

  const currencySymbol = countryCurrency || '$';

  return (
    <div>
      {/* US-specific filing status and state selectors */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-2">Filing Status</label>
            <Select value={usFilingStatus} onValueChange={(value: 'single' | 'married' | 'head') => setUsFilingStatus(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married Filing Jointly</SelectItem>
                <SelectItem value="head">Head of Household</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-900 mb-2">State</label>
            <Select value={usState} onValueChange={setUsState}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map(state => (
                  <SelectItem key={state.code} value={state.name}>
                    {state.name} ({state.rate * 100}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* What-if Calculator - Reusable component */}
      <WhatIfCalculator
        isVisible={showWhatIf}
        onToggle={toggleWhatIf}
        whatIfSalary={whatIfSalary}
        onSalaryChange={setWhatIfSalary}
        currentTaxData={taxData}
        whatIfTaxData={whatIfTaxData}
        currentSalary={salaryData.grossSalary}
        currencySymbol={currencySymbol}
        showCalculationModal={showCalculationModal}
        onToggleCalculationModal={() => setShowCalculationModal(!showCalculationModal)}
        countryName="United States"
        getValue={getValue}
      />

      {/* Advanced Options - Reusable component */}
      <AdvancedOptions
        isVisible={showAdvanced}
        onToggle={toggleAdvanced}
        deductions={deductions}
        onUpdateDeduction={updateDeduction}
        fields={deductionFields}
        description="Deductions reduce your taxable income before standard deduction."
      />

      {/* Tax Summary Card - Reusable component */}
      <TaxSummaryCard
        takeHome={getValue(taxData.takeHomeSalary || 0)}
        takeHomeSecondary={takeHomeUserCurrency ? getValue(takeHomeUserCurrency) : undefined}
        effectiveTaxRate={effectiveTaxRate}
        userBracket={userBracket ? userBracket.rate * 100 : 0}
        viewMode={viewMode}
        onToggleView={setViewMode}
        primaryCurrency={countryCurrency || '$'}
        secondaryCurrency={showSecondaryCurrency ? userCurrency : undefined}
      />

      {/* Tax Breakdown - Country-specific display */}
      <div className="space-y-3 mt-6">
        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
          <span className="font-medium text-green-800">Take-Home Salary</span>
          <span className="text-xl font-bold text-green-600">
            {countryCurrency || '$'}{(getValue(taxData.takeHomeSalary || 0)).toLocaleString()}
            {showSecondaryCurrency && takeHomeUserCurrency !== null && (
              <span className="ml-2 text-green-700">({userCurrency}{getValue(takeHomeUserCurrency).toLocaleString()})</span>
            )}
          </span>
        </div>
        
        <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg text-green-700 text-sm">
          <span>Monthly Take-Home</span>
          <span className="font-semibold">{currencySymbol}{((taxData.takeHomeSalary || 0) / 12).toLocaleString()}</span>
        </div>

        {/* Display deductions if any */}
        {totalDeductions > 0 && (
          <div className="flex justify-between text-sm text-blue-700">
            <span>Total Deductions</span>
            <span className="font-medium">-{currencySymbol}{totalDeductions.toLocaleString()}</span>
          </div>
        )}

        {/* Display tax breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Federal Tax</span>
            <span className="font-medium">{currencySymbol}{getValue(taxData.federalTax).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>State Tax</span>
            <span className="font-medium">{currencySymbol}{getValue(taxData.stateTax).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Social Security</span>
            <Tooltip>
              <TooltipTrigger>
                <span className="inline-flex items-center">
                  <Info className="w-3 h-3 mr-1" />
                  6.2% up to wage cap
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>6.2% up to wage cap of $160,200</p>
              </TooltipContent>
            </Tooltip>
            <span className="font-medium">{currencySymbol}{getValue(taxData.socialSecurity).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Medicare</span>
            <Tooltip>
              <TooltipTrigger>
                <span className="inline-flex items-center">
                  <Info className="w-3 h-3 mr-1" />
                  1.45% of gross income
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>1.45% of gross income</p>
              </TooltipContent>
            </Tooltip>
            <span className="font-medium">{currencySymbol}{getValue(taxData.medicare).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Tax Bracket Table - Reusable component */}
      <TaxBracketTable
        brackets={taxData.brackets || []}
        taxableIncome={taxData.taxableIncome}
        viewMode={viewMode}
        currencySymbol={countryCurrency || '$'}
        secondaryCurrency={showSecondaryCurrency ? userCurrency : undefined}
        userBracketIdx={userBracketIdx}
        getValue={getValue}
        getValueSecondary={showSecondaryCurrency ? (val) => getValue(convertCurrency(val, countryCurrency!, userCurrency!)) : undefined}
      />

      {/* Continue Button */}
      <div className="mt-6 flex justify-end">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={onNext}
        >
          Continue to Living Expenses
        </button>
      </div>
    </div>
  );
};

export default TaxCalculatorUS; 