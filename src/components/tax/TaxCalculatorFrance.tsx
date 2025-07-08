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

interface TaxCalculatorFranceProps {
  salaryData: SalaryData;
  taxData: TaxData;
  setTaxData: (data: TaxData) => void;
  onNext: () => void;
  userCurrency?: string;
  countryCurrency?: string;
}

const FRANCE_BRACKETS = [
  { min: 0, max: 10777, rate: 0 },
  { min: 10777, max: 27478, rate: 0.11 },
  { min: 27478, max: 78570, rate: 0.30 },
  { min: 78570, max: 168994, rate: 0.41 },
  { min: 168994, max: null, rate: 0.45 },
];
const SOCIAL_CONTRIB_RATE = 0.092;

const TaxCalculatorFrance: React.FC<TaxCalculatorFranceProps> = ({ salaryData, taxData, setTaxData, onNext, userCurrency, countryCurrency }) => {
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
      key: 'dedSocial',
      label: 'Social Contributions',
      tooltip: 'Mandatory social security contributions',
    },
    {
      key: 'dedOther',
      label: 'Other Deductions',
      tooltip: 'Other eligible deductions',
    }
  ];

  const calculateFranceTax = useCallback(({ grossSalary, deductions }) => {
    const totalDeductions = Math.max(0, deductions.dedSocial || 0) + Math.max(0, deductions.dedOther || 0);
    const grossAfterDeductions = Math.max(0, grossSalary - totalDeductions);
    const brackets = FRANCE_BRACKETS.map(bracket => {
      if (grossAfterDeductions <= bracket.min) return { ...bracket, taxPaid: 0 };
      const upper = bracket.max === null ? grossAfterDeductions : Math.min(grossAfterDeductions, bracket.max);
      const band = Math.max(0, upper - bracket.min);
      const tax = band * bracket.rate;
      return { ...bracket, taxPaid: tax };
    });
    const incomeTax = brackets.reduce((sum, b) => sum + b.taxPaid, 0);
    const socialContrib = grossAfterDeductions * SOCIAL_CONTRIB_RATE;
    const totalTax = incomeTax + socialContrib;
    const takeHomeSalary = grossSalary - totalTax;
    return {
      brackets,
      totalTax,
      takeHomeSalary,
      taxableIncome: grossAfterDeductions,
      additionalTaxes: { socialContrib },
      breakdown: { incomeTax, socialContrib }
    };
  }, []);

  const mainTaxCalculation = useMemo(() => {
    if (salaryData.grossSalary <= 0) return null;
    return calculateFranceTax({ grossSalary: salaryData.grossSalary, deductions });
  }, [salaryData.grossSalary, deductions, calculateFranceTax]);

  const whatIfTaxCalculation = useMemo(() => {
    if (whatIfSalary <= 0 || !showWhatIf) return null;
    return calculateFranceTax({ grossSalary: whatIfSalary, deductions });
  }, [whatIfSalary, deductions, showWhatIf, calculateFranceTax]);

  React.useEffect(() => {
    if (mainTaxCalculation) {
      setTaxData({
        brackets: mainTaxCalculation.brackets,
        totalTax: mainTaxCalculation.totalTax,
        takeHomeSalary: mainTaxCalculation.takeHomeSalary,
        federalTax: mainTaxCalculation.breakdown.incomeTax,
        stateTax: 0,
        socialSecurity: mainTaxCalculation.breakdown.socialContrib,
        medicare: 0,
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
        socialSecurity: whatIfTaxCalculation.breakdown.socialContrib,
        medicare: 0,
        taxableIncome: whatIfTaxCalculation.taxableIncome,
      });
    }
  }, [whatIfTaxCalculation, setWhatIfTaxData]);

  const showSecondaryCurrency = userCurrency && countryCurrency && userCurrency !== countryCurrency;
  const takeHomeUserCurrency = showSecondaryCurrency ? convertCurrency(taxData.takeHomeSalary || 0, countryCurrency!, userCurrency!) : null;

  const currencySymbol = countryCurrency || '€';

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
        currencySymbol={currencySymbol}
        showCalculationModal={showCalculationModal}
        onToggleCalculationModal={() => setShowCalculationModal(!showCalculationModal)}
        countryName="France"
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
        primaryCurrency={countryCurrency || '€'}
        secondaryCurrency={showSecondaryCurrency ? userCurrency : undefined}
      />
      <div className="space-y-3 mt-6">
        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
          <span className="font-medium text-green-800">Take-Home Salary</span>
          <span className="text-xl font-bold text-green-600">
            {countryCurrency || '€'}{(getValue(taxData.takeHomeSalary || 0)).toLocaleString()}
            {showSecondaryCurrency && takeHomeUserCurrency !== null && (
              <span className="ml-2 text-green-700">({userCurrency}{getValue(takeHomeUserCurrency).toLocaleString()})</span>
            )}
          </span>
        </div>
        <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg text-green-700 text-sm">
          <span>Monthly Take-Home</span>
          <span className="font-semibold">{currencySymbol}{((taxData.takeHomeSalary || 0) / 12).toLocaleString()}</span>
        </div>
        {totalDeductions > 0 && (
          <div className="flex justify-between text-sm text-blue-700">
            <span>Total Deductions</span>
            <span className="font-medium">-{currencySymbol}{totalDeductions.toLocaleString()}</span>
          </div>
        )}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Income Tax</span>
            <span className="font-medium">{currencySymbol}{getValue(taxData.federalTax).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Social Contributions</span>
            <Tooltip>
              <TooltipTrigger>
                <span className="inline-flex items-center">
                  <Info className="w-3 h-3 mr-1" />
                  9.2% of taxable income
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Social contributions are 9.2% of taxable income</p>
              </TooltipContent>
            </Tooltip>
            <span className="font-medium">{currencySymbol}{getValue(taxData.socialSecurity).toLocaleString()}</span>
          </div>
        </div>
      </div>
      <TaxBracketTable
        brackets={taxData.brackets || []}
        taxableIncome={taxData.taxableIncome}
        viewMode={viewMode}
        currencySymbol={countryCurrency || '€'}
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

export default TaxCalculatorFrance; 