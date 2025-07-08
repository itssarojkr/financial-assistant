import React, { useEffect, useMemo } from 'react';
import { SalaryData, TaxData } from '@/pages/Index';
import TaxSummaryCard from './TaxSummaryCard';
import TaxBracketTable from './TaxBracketTable';
import AdvancedOptions from './AdvancedOptions';
import WhatIfCalculator from './WhatIfCalculator';
import { useTaxCalculator, useWhatIfTaxData, useTaxMetrics } from '@/hooks/use-tax-calculator';
import { DeductionField } from './AdvancedOptions';

interface AdditionalParams {
  [key: string]: string | number | boolean;
}

interface GenericTaxCalculatorProps {
  salaryData: SalaryData;
  taxData: TaxData;
  setTaxData: (data: TaxData) => void;
  onNext: () => void;
  countryName: string;
  currencySymbol: string;
  // Country-specific configurations
  deductionFields: DeductionField[];
  advancedOptionsDescription?: string;
  // Country-specific calculation function
  calculateTax: (params: {
    grossSalary: number;
    deductions: Record<string, number>;
    additionalParams?: AdditionalParams;
  }) => TaxCalculationResult;
  // Additional country-specific props
  additionalParams?: AdditionalParams;
  onAdditionalParamsChange?: (params: AdditionalParams) => void;
}

interface TaxCalculationResult {
  brackets: Array<{
    min: number;
    max: number | null;
    rate: number;
    taxPaid: number;
  }>;
  totalTax: number;
  takeHomeSalary: number;
  taxableIncome: number;
  additionalTaxes: Record<string, number>;
  breakdown: Record<string, number>;
}

const GenericTaxCalculator: React.FC<GenericTaxCalculatorProps> = ({
  salaryData,
  taxData,
  setTaxData,
  onNext,
  countryName,
  currencySymbol,
  deductionFields,
  advancedOptionsDescription = "Deductions reduce your taxable income before tax calculation.",
  calculateTax,
  additionalParams = {},
  onAdditionalParamsChange
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

  // Memoized tax calculation for main scenario
  const mainTaxCalculation = useMemo(() => {
    if (salaryData.grossSalary <= 0) return null;
    
    return calculateTax({
      grossSalary: salaryData.grossSalary,
      deductions,
      additionalParams
    });
  }, [salaryData.grossSalary, deductions, additionalParams, calculateTax]);

  // Memoized tax calculation for what-if scenario
  const whatIfTaxCalculation = useMemo(() => {
    if (whatIfSalary <= 0 || !showWhatIf) return null;
    
    return calculateTax({
      grossSalary: whatIfSalary,
      deductions,
      additionalParams
    });
  }, [whatIfSalary, deductions, additionalParams, showWhatIf, calculateTax]);

  // Update main tax data when calculation changes
  useEffect(() => {
    if (mainTaxCalculation) {
      setTaxData({
        brackets: mainTaxCalculation.brackets,
        totalTax: mainTaxCalculation.totalTax,
        takeHomeSalary: mainTaxCalculation.takeHomeSalary,
        federalTax: mainTaxCalculation.breakdown.incomeTax || mainTaxCalculation.breakdown.federalTax || 0,
        stateTax: mainTaxCalculation.breakdown.stateTax || 0,
        socialSecurity: mainTaxCalculation.breakdown.socialSecurity || 0,
        medicare: mainTaxCalculation.breakdown.medicare || 0,
        taxableIncome: mainTaxCalculation.taxableIncome,
        ...mainTaxCalculation.additionalTaxes
      });
    }
  }, [mainTaxCalculation, setTaxData]);

  // Update what-if tax data when calculation changes
  useEffect(() => {
    if (whatIfTaxCalculation) {
      setWhatIfTaxData({
        brackets: whatIfTaxCalculation.brackets,
        totalTax: whatIfTaxCalculation.totalTax,
        takeHomeSalary: whatIfTaxCalculation.takeHomeSalary,
        federalTax: whatIfTaxCalculation.breakdown.incomeTax || whatIfTaxCalculation.breakdown.federalTax || 0,
        stateTax: whatIfTaxCalculation.breakdown.stateTax || 0,
        socialSecurity: whatIfTaxCalculation.breakdown.socialSecurity || 0,
        medicare: whatIfTaxCalculation.breakdown.medicare || 0,
        taxableIncome: whatIfTaxCalculation.taxableIncome,
        ...whatIfTaxCalculation.additionalTaxes
      });
    }
  }, [whatIfTaxCalculation, setWhatIfTaxData]);

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
        countryName={countryName}
        getValue={getValue}
      />

      {/* Advanced Options - Reusable component */}
      <AdvancedOptions
        isVisible={showAdvanced}
        onToggle={toggleAdvanced}
        deductions={deductions}
        onUpdateDeduction={updateDeduction}
        fields={deductionFields}
        description={advancedOptionsDescription}
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
          {Object.entries(mainTaxCalculation?.breakdown || {}).map(([key, value]) => (
            <div key={key} className="flex justify-between text-sm">
              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
              <span className="font-medium">{currencySymbol}{getValue(value).toLocaleString()}</span>
            </div>
          ))}
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

export default GenericTaxCalculator; 