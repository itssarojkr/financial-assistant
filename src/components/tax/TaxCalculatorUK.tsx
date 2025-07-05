import React, { useState, useCallback, useMemo } from 'react';
import { SalaryData, TaxData } from '@/pages/Index';
import TaxSummaryCard from './TaxSummaryCard';
import TaxBracketTable from './TaxBracketTable';
import { Info } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import AdvancedOptions from './AdvancedOptions';
import WhatIfCalculator from './WhatIfCalculator';
import { useTaxCalculator, useWhatIfTaxData, useTaxMetrics } from '@/hooks/use-tax-calculator';
import { DeductionField } from './AdvancedOptions';

const UK_COUNTRIES = [
  { name: 'England', code: 'ENG' },
  { name: 'Scotland', code: 'SCT' },
  { name: 'Wales', code: 'WLS' },
  { name: 'Northern Ireland', code: 'NIR' },
];

const PERSONAL_ALLOWANCE = 12570;
const ENGLAND_BRACKETS = [
  { min: 0, max: 12570, rate: 0 },
  { min: 12570, max: 50270, rate: 0.20 },
  { min: 50270, max: 125140, rate: 0.40 },
  { min: 125140, max: null, rate: 0.45 },
];
const SCOTLAND_BRACKETS = [
  { min: 0, max: 12570, rate: 0 },
  { min: 12570, max: 14632, rate: 0.19 },
  { min: 14632, max: 25688, rate: 0.20 },
  { min: 25688, max: 43662, rate: 0.21 },
  { min: 43662, max: 75000, rate: 0.42 },
  { min: 75000, max: 125140, rate: 0.45 },
  { min: 125140, max: null, rate: 0.48 },
];

const NI_RATE = 0.08; // Simplified
const NI_THRESHOLD = 12570;

const STUDENT_LOAN_PLANS = [
  { name: 'Plan 1', threshold: 22015, rate: 0.09 },
  { name: 'Plan 2', threshold: 27295, rate: 0.09 },
  { name: 'Plan 4', threshold: 27660, rate: 0.09 },
];

type UKTaxData = TaxData & {
  incomeTax: number;
  ni: number;
  studentLoan: number;
  taxable: number;
};

interface TaxCalculatorUKProps {
  salaryData: SalaryData;
  taxData: UKTaxData;
  setTaxData: (data: UKTaxData) => void;
  onNext: () => void;
  ukCountry: string;
  setUkCountry: (country: string) => void;
  ukStudentLoanPlan: string;
  setUkStudentLoanPlan: (plan: string) => void;
}

const UK_BRACKETS = [
  { min: 0, max: 12570, rate: 0 },
  { min: 12570, max: 50270, rate: 0.20 },
  { min: 50270, max: 125140, rate: 0.40 },
  { min: 125140, max: null, rate: 0.45 },
];

const NI_BRACKETS = [
  { min: 0, max: 12570, rate: 0 },
  { min: 12570, max: 50270, rate: 0.12 },
  { min: 50270, max: null, rate: 0.02 },
];

const MAX_PENSION_CONTRIBUTION = 40000;

const TaxCalculatorUK: React.FC<TaxCalculatorUKProps> = ({ salaryData, taxData, setTaxData, onNext, ukCountry, setUkCountry, ukStudentLoanPlan, setUkStudentLoanPlan }) => {
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

  // UK-specific deduction fields
  const deductionFields: DeductionField[] = [
    {
      key: 'dedPension',
      label: 'Pension Contributions',
      maxValue: 40000,
      tooltip: 'Maximum pension contribution of £40,000 per year',
    },
    {
      key: 'dedOther',
      label: 'Other Deductions',
      tooltip: 'Other eligible deductions',
    }
  ];

  // UK-specific tax calculation function
  const calculateUKTax = useCallback((params: {
    grossSalary: number;
    deductions: Record<string, number>;
    additionalParams?: Record<string, any>;
  }) => {
    const { grossSalary, deductions } = params;

    const totalDeductions = Math.max(0, deductions.dedPension || 0) + Math.max(0, deductions.dedOther || 0);
    const grossAfterDeductions = Math.max(0, grossSalary - totalDeductions);

    // Apply personal allowance
    const totalDeductionsWithPersonalAllowance = totalDeductions + PERSONAL_ALLOWANCE;
    const taxableIncome = Math.max(0, grossAfterDeductions - PERSONAL_ALLOWANCE);

    // Calculate income tax
    const incomeTaxBrackets = UK_BRACKETS.map(bracket => {
      if (taxableIncome <= bracket.min) return { ...bracket, taxPaid: 0 };
      const upper = bracket.max === null ? taxableIncome : Math.min(taxableIncome, bracket.max);
      const band = Math.max(0, upper - bracket.min);
      const tax = band * bracket.rate;
      return { ...bracket, taxPaid: tax };
    });

    const incomeTax = incomeTaxBrackets.reduce((sum, b) => sum + b.taxPaid, 0);

    // Calculate National Insurance
    const niBrackets = NI_BRACKETS.map(bracket => {
      if (grossAfterDeductions <= bracket.min) return { ...bracket, taxPaid: 0 };
      const upper = bracket.max === null ? grossAfterDeductions : Math.min(grossAfterDeductions, bracket.max);
      const band = Math.max(0, upper - bracket.min);
      const tax = band * bracket.rate;
      return { ...bracket, taxPaid: tax };
    });

    const nationalInsurance = niBrackets.reduce((sum, b) => sum + b.taxPaid, 0);

    const totalTax = incomeTax + nationalInsurance;
    const takeHomeSalary = grossSalary - totalTax;

    return {
      brackets: incomeTaxBrackets,
      totalTax,
      takeHomeSalary,
      taxableIncome,
      additionalTaxes: { nationalInsurance },
      breakdown: {
        incomeTax,
        nationalInsurance,
        personalAllowance: PERSONAL_ALLOWANCE,
        totalDeductions: totalDeductionsWithPersonalAllowance
      }
    };
  }, []);

  // Memoized tax calculation for main scenario
  const mainTaxCalculation = useMemo(() => {
    if (salaryData.grossSalary <= 0) return null;
    
    return calculateUKTax({
      grossSalary: salaryData.grossSalary,
      deductions
    });
  }, [salaryData.grossSalary, deductions, calculateUKTax]);

  // Memoized tax calculation for what-if scenario
  const whatIfTaxCalculation = useMemo(() => {
    if (whatIfSalary <= 0 || !showWhatIf) return null;
    
    return calculateUKTax({
      grossSalary: whatIfSalary,
      deductions
    });
  }, [whatIfSalary, deductions, showWhatIf, calculateUKTax]);

  // Update main tax data when calculation changes
  React.useEffect(() => {
    if (mainTaxCalculation) {
      setTaxData({
        brackets: mainTaxCalculation.brackets,
        totalTax: mainTaxCalculation.totalTax,
        takeHomeSalary: mainTaxCalculation.takeHomeSalary,
        federalTax: mainTaxCalculation.breakdown.incomeTax,
        stateTax: 0,
        socialSecurity: mainTaxCalculation.breakdown.nationalInsurance,
        medicare: 0,
        taxableIncome: mainTaxCalculation.taxableIncome,
        incomeTax: mainTaxCalculation.breakdown.incomeTax,
        ni: mainTaxCalculation.breakdown.nationalInsurance,
        studentLoan: 0,
        taxable: mainTaxCalculation.taxableIncome,
      } as any);
    }
  }, [mainTaxCalculation, setTaxData]);

  // Update what-if tax data when calculation changes
  React.useEffect(() => {
    if (whatIfTaxCalculation) {
      setWhatIfTaxData({
        brackets: whatIfTaxCalculation.brackets,
        totalTax: whatIfTaxCalculation.totalTax,
        takeHomeSalary: whatIfTaxCalculation.takeHomeSalary,
        federalTax: whatIfTaxCalculation.breakdown.incomeTax,
        stateTax: 0,
        socialSecurity: whatIfTaxCalculation.breakdown.nationalInsurance,
        medicare: 0,
        taxableIncome: whatIfTaxCalculation.taxableIncome,
        incomeTax: whatIfTaxCalculation.breakdown.incomeTax,
        ni: whatIfTaxCalculation.breakdown.nationalInsurance,
        studentLoan: 0,
        taxable: whatIfTaxCalculation.taxableIncome,
      } as any);
    }
  }, [whatIfTaxCalculation, setWhatIfTaxData]);

  const currencySymbol = '£';

  return (
    <div>
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
        countryName="United Kingdom"
        getValue={getValue}
      />

      {/* Advanced Options - Reusable component */}
      <AdvancedOptions
        isVisible={showAdvanced}
        onToggle={toggleAdvanced}
        deductions={deductions}
        onUpdateDeduction={updateDeduction}
        fields={deductionFields}
        description="Deductions reduce your taxable income before tax calculation."
      />

      {/* Tax Summary Card - Reusable component */}
      <TaxSummaryCard
        takeHome={getValue(taxData.takeHomeSalary)}
        effectiveTaxRate={effectiveTaxRate}
        userBracket={userBracket ? userBracket.rate * 100 : undefined}
        viewMode={viewMode}
        onToggleView={setViewMode}
      />

      {/* Tax Breakdown - Country-specific display */}
      <div className="space-y-3 mt-6">
        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
          <span className="font-medium text-green-800">Take-Home Salary</span>
          <span className="text-xl font-bold text-green-600">
            {currencySymbol}{getValue(taxData.takeHomeSalary).toLocaleString()}
          </span>
        </div>
        
        <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg text-green-700 text-sm">
          <span>Monthly Take-Home</span>
          <span className="font-semibold">{currencySymbol}{(taxData.takeHomeSalary / 12).toLocaleString()}</span>
        </div>

        {/* Display deductions if any */}
        <div className="space-y-1">
          {/* Personal Allowance - Always shown */}
          <div className="flex justify-between text-sm text-blue-700">
            <span>Personal Allowance</span>
            <span className="font-medium">-{currencySymbol}{PERSONAL_ALLOWANCE.toLocaleString()}</span>
          </div>
          
          {/* Additional Deductions */}
          {totalDeductions > 0 && (
            <div className="flex justify-between text-sm text-blue-700">
              <span>Additional Deductions</span>
              <span className="font-medium">-{currencySymbol}{totalDeductions.toLocaleString()}</span>
            </div>
          )}
          
          {/* Total Deductions */}
          <div className="flex justify-between text-sm text-blue-700 font-medium border-t pt-1">
            <span>Total Deductions</span>
            <span>-{currencySymbol}{(PERSONAL_ALLOWANCE + totalDeductions).toLocaleString()}</span>
          </div>
        </div>

        {/* Display tax breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Income Tax</span>
            <span className="font-medium">{currencySymbol}{getValue(taxData.federalTax).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>National Insurance</span>
            <Tooltip>
              <TooltipTrigger>
                <span className="inline-flex items-center">
                  <Info className="w-3 h-3 mr-1" />
                  Progressive rates up to 12%
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>National Insurance contributions with progressive rates</p>
              </TooltipContent>
            </Tooltip>
            <span className="font-medium">{currencySymbol}{getValue(taxData.socialSecurity).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Tax Bracket Table - Reusable component */}
      <TaxBracketTable
        brackets={taxData.brackets || []}
        taxableIncome={taxData.taxableIncome}
        viewMode={viewMode}
        currencySymbol={currencySymbol}
        userBracketIdx={userBracketIdx}
        getValue={getValue}
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

export default TaxCalculatorUK; 