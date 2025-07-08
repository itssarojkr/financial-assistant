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
import { convertCurrency } from '@/lib/utils';

interface TaxCalculatorAustraliaProps {
  salaryData: SalaryData;
  taxData: TaxData;
  setTaxData: (data: TaxData) => void;
  onNext: () => void;
  userCurrency?: string;
  countryCurrency?: string;
}

const AU_BRACKETS = [
  { min: 0, max: 18200, rate: 0 },
  { min: 18200, max: 45000, rate: 0.19 },
  { min: 45000, max: 120000, rate: 0.325 },
  { min: 120000, max: 180000, rate: 0.37 },
  { min: 180000, max: null, rate: 0.45 },
];
const TAX_FREE_THRESHOLD = 18200;
const MEDICARE_LEVY_RATE = 0.02;
const MAX_SUPER_CONTRIB = 27500;

const TaxCalculatorAustralia: React.FC<TaxCalculatorAustraliaProps> = ({ salaryData, taxData, setTaxData, onNext, userCurrency, countryCurrency }) => {
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

  const { whatIfTaxData, setWhatIfTaxData } = useWhatIfTaxData(taxData);
  const { effectiveTaxRate, userBracketIdx, userBracket } = useTaxMetrics(taxData, salaryData.grossSalary);

  const deductionFields: DeductionField[] = [
    {
      key: 'dedSuper',
      label: 'Superannuation Contributions',
      maxValue: MAX_SUPER_CONTRIB,
      tooltip: 'Concessional (pre-tax) super contributions, max $27,500',
    },
    {
      key: 'dedOther',
      label: 'Other Deductions',
      tooltip: 'Other eligible deductions',
    }
  ];

  const calculateAUTax = useCallback(({ grossSalary, deductions }) => {
    const totalDeductions = Math.max(0, deductions.dedSuper || 0) + Math.max(0, deductions.dedOther || 0);
    const grossAfterDeductions = Math.max(0, grossSalary - totalDeductions);

    // Apply tax-free threshold
    const totalDeductionsWithThreshold = totalDeductions + TAX_FREE_THRESHOLD;
    const taxableIncome = Math.max(0, grossAfterDeductions - TAX_FREE_THRESHOLD);

    const brackets = AU_BRACKETS.map(bracket => {
      if (taxableIncome <= bracket.min) return { ...bracket, taxPaid: 0 };
      const upper = bracket.max === null ? taxableIncome : Math.min(taxableIncome, bracket.max);
      const band = Math.max(0, upper - bracket.min);
      const tax = band * bracket.rate;
      return { ...bracket, taxPaid: tax };
    });
    const incomeTax = brackets.reduce((sum, b) => sum + b.taxPaid, 0);
    const medicare = taxableIncome * MEDICARE_LEVY_RATE;
    const totalTax = incomeTax + medicare;
    const takeHomeSalary = grossSalary - totalTax;
    return {
      brackets,
      totalTax,
      takeHomeSalary,
      taxableIncome,
      additionalTaxes: { medicare },
      breakdown: { 
        incomeTax, 
        medicare,
        taxFreeThreshold: TAX_FREE_THRESHOLD,
        totalDeductions: totalDeductionsWithThreshold
      }
    };
  }, []);

  const mainTaxCalculation = useMemo(() => {
    if (salaryData.grossSalary <= 0) return null;
    return calculateAUTax({ grossSalary: salaryData.grossSalary, deductions });
  }, [salaryData.grossSalary, deductions, calculateAUTax]);

  const whatIfTaxCalculation = useMemo(() => {
    if (whatIfSalary <= 0 || !showWhatIf) return null;
    return calculateAUTax({ grossSalary: whatIfSalary, deductions });
  }, [whatIfSalary, deductions, showWhatIf, calculateAUTax]);

  React.useEffect(() => {
    if (mainTaxCalculation) {
      setTaxData({
        brackets: mainTaxCalculation.brackets,
        totalTax: mainTaxCalculation.totalTax,
        takeHomeSalary: mainTaxCalculation.takeHomeSalary,
        federalTax: mainTaxCalculation.breakdown.incomeTax,
        stateTax: 0,
        socialSecurity: 0,
        medicare: mainTaxCalculation.breakdown.medicare,
        taxableIncome: mainTaxCalculation.taxableIncome,
      });
    }
  }, [mainTaxCalculation, setTaxData]);

  React.useEffect(() => {
    if (whatIfTaxCalculation) {
      setWhatIfTaxData({
        brackets: whatIfTaxCalculation.brackets,
        totalTax: whatIfTaxCalculation.totalTax,
        takeHomeSalary: whatIfTaxCalculation.takeHomeSalary,
        federalTax: whatIfTaxCalculation.breakdown.incomeTax,
        stateTax: 0,
        socialSecurity: 0,
        medicare: whatIfTaxCalculation.breakdown.medicare,
        taxableIncome: whatIfTaxCalculation.taxableIncome,
      });
    }
  }, [whatIfTaxCalculation, setWhatIfTaxData]);

  const showSecondaryCurrency = userCurrency && countryCurrency && userCurrency !== countryCurrency;
  const takeHomeUserCurrency = showSecondaryCurrency ? convertCurrency(taxData.takeHomeSalary || 0, countryCurrency!, userCurrency!) : null;

  return (
    <div>
      <WhatIfCalculator
        isVisible={showWhatIf}
        onToggle={toggleWhatIf}
        whatIfSalary={whatIfSalary}
        onSalaryChange={setWhatIfSalary}
        currentTaxData={taxData}
        whatIfTaxData={whatIfTaxData}
        currentSalary={salaryData.grossSalary}
        currencySymbol={countryCurrency || '$'}
        showCalculationModal={showCalculationModal}
        onToggleCalculationModal={() => setShowCalculationModal(!showCalculationModal)}
        countryName="Australia"
        getValue={getValue}
      />
      <AdvancedOptions
        isVisible={showAdvanced}
        onToggle={toggleAdvanced}
        deductions={deductions}
        onUpdateDeduction={updateDeduction}
        fields={deductionFields}
        description="Deductions reduce your taxable income before tax calculation."
      />
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
          <span className="font-semibold">{countryCurrency || '$'}{((taxData.takeHomeSalary || 0) / 12).toLocaleString()}</span>
        </div>
        {/* Display deductions if any */}
        <div className="space-y-1">
          {/* Tax-Free Threshold - Always shown */}
          <div className="flex justify-between text-sm text-blue-700">
            <span>Tax-Free Threshold</span>
            <span className="font-medium">-{countryCurrency || '$'}{TAX_FREE_THRESHOLD.toLocaleString()}</span>
          </div>
          
          {/* Additional Deductions */}
          {totalDeductions > 0 && (
            <div className="flex justify-between text-sm text-blue-700">
              <span>Additional Deductions</span>
              <span className="font-medium">-{countryCurrency || '$'}{totalDeductions.toLocaleString()}</span>
            </div>
          )}
          
          {/* Total Deductions */}
          <div className="flex justify-between text-sm text-blue-700 font-medium border-t pt-1">
            <span>Total Deductions</span>
            <span>-{countryCurrency || '$'}{(TAX_FREE_THRESHOLD + totalDeductions).toLocaleString()}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Income Tax</span>
            <span className="font-medium">{countryCurrency || '$'}{getValue(taxData.federalTax).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Medicare Levy</span>
            <Tooltip>
              <TooltipTrigger>
                <span className="inline-flex items-center">
                  <Info className="w-3 h-3 mr-1" />
                  2% of taxable income
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Medicare levy is 2% of taxable income</p>
              </TooltipContent>
            </Tooltip>
            <span className="font-medium">{countryCurrency || '$'}{getValue(taxData.medicare).toLocaleString()}</span>
          </div>
        </div>
      </div>
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

export default TaxCalculatorAustralia; 