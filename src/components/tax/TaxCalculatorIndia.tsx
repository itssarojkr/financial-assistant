import React, { useState, useCallback, useMemo } from 'react';
import { SalaryData, TaxData } from '@/pages/Index';
import TaxSummaryCard from './TaxSummaryCard';
import TaxBracketTable from './TaxBracketTable';
import { Switch } from '@/components/ui/switch';
import { Info } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import AdvancedOptions from './AdvancedOptions';
import WhatIfCalculator from './WhatIfCalculator';
import { useTaxCalculator, useWhatIfTaxData, useTaxMetrics } from '@/hooks/use-tax-calculator';
import { DeductionField } from './AdvancedOptions';
import { convertCurrency } from '@/lib/utils';

interface IndiaAdditionalParams {
  regime?: 'new' | 'old';
}

interface TaxCalculatorIndiaProps {
  salaryData: SalaryData;
  taxData: TaxData;
  setTaxData: (data: TaxData) => void;
  onNext: () => void;
  indiaRegime: 'new' | 'old';
  setIndiaRegime: (regime: 'new' | 'old') => void;
  userCurrency?: string;
  countryCurrency?: string;
}

const OLD_REGIME_BRACKETS = [
  { min: 0, max: 250000, rate: 0 },
  { min: 250000, max: 500000, rate: 0.05 },
  { min: 500000, max: 1000000, rate: 0.20 },
  { min: 1000000, max: null, rate: 0.30 },
];

const NEW_REGIME_BRACKETS = [
  { min: 0, max: 400000, rate: 0 },
  { min: 400000, max: 800000, rate: 0.05 },
  { min: 800000, max: 1200000, rate: 0.10 },
  { min: 1200000, max: 1600000, rate: 0.15 },
  { min: 1600000, max: 2000000, rate: 0.20 },
  { min: 2000000, max: 2400000, rate: 0.25 },
  { min: 2400000, max: null, rate: 0.30 },
];

const SECTION_87A_LIMIT = 500000;
const SECTION_87A_REBATE = 12500;
const SECTION_87A_NEW_LIMIT = 1200000;
const SECTION_87A_NEW_REBATE = 60000;
const STANDARD_DEDUCTION_OLD = 50000;
const STANDARD_DEDUCTION_NEW = 75000;
const CESS_RATE = 0.04;
const MAX_80C = 150000;
const MAX_80D = 50000;

const TaxCalculatorIndia: React.FC<TaxCalculatorIndiaProps> = ({ 
  salaryData, 
  taxData, 
  setTaxData, 
  onNext, 
  indiaRegime, 
  setIndiaRegime,
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

  // India-specific deduction fields
  const deductionFields: DeductionField[] = [
    {
      key: 'ded80C',
      label: 'Section 80C (EPF, ELSS, etc.)',
      maxValue: 150000,
      tooltip: 'Maximum deduction of ₹1.5 lakhs under Section 80C',
    },
    {
      key: 'ded80D',
      label: 'Section 80D (Health Insurance)',
      maxValue: 50000,
      tooltip: 'Maximum deduction of ₹50,000 for health insurance',
    },
    {
      key: 'dedOther',
      label: 'Other Deductions',
      tooltip: 'Other eligible deductions',
    }
  ];

  // India-specific tax calculation function
  const calculateIndiaTax = useCallback((params: {
    grossSalary: number;
    deductions: Record<string, number>;
    additionalParams?: IndiaAdditionalParams;
  }) => {
    const { grossSalary, deductions, additionalParams = {} } = params;
    const regime = additionalParams.regime || indiaRegime;

    const brackets = regime === 'new' ? NEW_REGIME_BRACKETS : OLD_REGIME_BRACKETS;

    // Calculate total deductions (only for old regime)
    const totalDeductions = regime === 'old' 
      ? Math.min(deductions.ded80C || 0, MAX_80C) + 
        Math.min(deductions.ded80D || 0, MAX_80D) + 
        Math.max(0, deductions.dedOther || 0)
      : 0;

    // Add standard deduction
    const standardDeduction = regime === 'old' ? STANDARD_DEDUCTION_OLD : STANDARD_DEDUCTION_NEW;
    const totalDeductionsWithStandard = totalDeductions + standardDeduction;

    const taxableIncome = Math.max(0, grossSalary - totalDeductionsWithStandard);

    // Calculate bracket tax
    const calculatedBrackets = brackets.map(bracket => {
      if (taxableIncome <= bracket.min) return { ...bracket, taxPaid: 0 };
      const upper = bracket.max === null ? taxableIncome : Math.min(taxableIncome, bracket.max);
      const band = Math.max(0, upper - bracket.min);
      const tax = band * bracket.rate;
      return { ...bracket, taxPaid: tax };
    });

    const baseTax = calculatedBrackets.reduce((sum, b) => sum + b.taxPaid, 0);

    // Apply Section 87A rebate
    const section87aLimit = regime === 'old' ? SECTION_87A_LIMIT : SECTION_87A_NEW_LIMIT;
    const section87aRebate = regime === 'old' ? SECTION_87A_REBATE : SECTION_87A_NEW_REBATE;
    let finalTax = baseTax;

    if (taxableIncome <= section87aLimit) {
      finalTax = Math.max(0, baseTax - Math.min(baseTax, section87aRebate));
    }

    // Calculate additional taxes
    const surcharge = (() => {
      if (finalTax > 10000000) return finalTax * 0.15;
      if (finalTax > 5000000) return finalTax * 0.10;
      if (finalTax > 1000000) return finalTax * 0.05;
      return 0;
    })();

    const cess = (finalTax + surcharge) * CESS_RATE;

    const totalTax = finalTax + surcharge + cess;
    const takeHomeSalary = grossSalary - totalTax;

    return {
      brackets: calculatedBrackets,
      totalTax,
      takeHomeSalary,
      taxableIncome,
      additionalTaxes: { surcharge, cess },
      breakdown: {
        incomeTax: finalTax,
        surcharge,
        cess,
        rebate: baseTax - finalTax,
        standardDeduction,
        totalDeductions: totalDeductionsWithStandard
      }
    };
  }, [indiaRegime]);

  // Memoized tax calculation for main scenario
  const mainTaxCalculation = useMemo(() => {
    if (salaryData.grossSalary <= 0) return null;
    
    return calculateIndiaTax({
      grossSalary: salaryData.grossSalary,
      deductions,
      additionalParams: { regime: indiaRegime }
    });
  }, [salaryData.grossSalary, deductions, indiaRegime, calculateIndiaTax]);

  // Memoized tax calculation for what-if scenario
  const whatIfTaxCalculation = useMemo(() => {
    if (whatIfSalary <= 0 || !showWhatIf) return null;
    
    return calculateIndiaTax({
      grossSalary: whatIfSalary,
      deductions,
      additionalParams: { regime: indiaRegime }
    });
  }, [whatIfSalary, deductions, indiaRegime, showWhatIf, calculateIndiaTax]);

  // Update main tax data when calculation changes
  React.useEffect(() => {
    if (mainTaxCalculation) {
      console.log('India TaxCalculator calling setTaxData with:', mainTaxCalculation);
      setTaxData({
        brackets: mainTaxCalculation.brackets,
        totalTax: mainTaxCalculation.totalTax,
        takeHomeSalary: mainTaxCalculation.takeHomeSalary,
        federalTax: mainTaxCalculation.breakdown.incomeTax,
        stateTax: 0,
        socialSecurity: 0,
        medicare: 0,
        taxableIncome: mainTaxCalculation.taxableIncome,
        ...mainTaxCalculation.additionalTaxes
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
        federalTax: whatIfTaxCalculation.breakdown.incomeTax,
        stateTax: 0,
        socialSecurity: 0,
        medicare: 0,
        taxableIncome: whatIfTaxCalculation.taxableIncome,
        ...whatIfTaxCalculation.additionalTaxes
      });
    }
  }, [whatIfTaxCalculation, setWhatIfTaxData]);

  const showSecondaryCurrency = userCurrency && countryCurrency && userCurrency !== countryCurrency;

  const takeHomeUserCurrency = showSecondaryCurrency ? convertCurrency(taxData.takeHomeSalary || 0, countryCurrency!, userCurrency!) : null;
  const federalTaxUserCurrency = showSecondaryCurrency ? convertCurrency(taxData.federalTax || 0, countryCurrency!, userCurrency!) : null;
  const cessUserCurrency = showSecondaryCurrency ? convertCurrency(taxData.cess || 0, countryCurrency!, userCurrency!) : null;
  const surchargeUserCurrency = showSecondaryCurrency ? convertCurrency(taxData.surcharge || 0, countryCurrency!, userCurrency!) : null;

  const currencySymbol = countryCurrency || '₹';

  return (
    <div>
      {/* India-specific regime selector */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-blue-900">Tax Regime</h3>
            <p className="text-sm text-blue-700">
              Choose between old regime (with deductions) or new regime (lower rates)
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Old Regime</span>
            <Switch
              checked={indiaRegime === 'new'}
              onCheckedChange={(checked) => setIndiaRegime(checked ? 'new' : 'old')}
            />
            <span className="text-sm font-medium">New Regime</span>
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
        countryName="India"
        getValue={getValue}
      />

      {/* Advanced Options - Reusable component */}
      <AdvancedOptions
        isVisible={showAdvanced}
        onToggle={toggleAdvanced}
        deductions={deductions}
        onUpdateDeduction={updateDeduction}
        fields={deductionFields}
        description={
          indiaRegime === 'old' 
            ? "Deductions are available under the old regime only."
            : "Deductions are not available under the new regime."
        }
      />

      {/* Tax Summary Card - Reusable component */}
      <TaxSummaryCard
        takeHome={getValue(taxData.takeHomeSalary || 0)}
        takeHomeSecondary={takeHomeUserCurrency ? getValue(takeHomeUserCurrency) : undefined}
        effectiveTaxRate={effectiveTaxRate}
        userBracket={userBracket ? userBracket.rate * 100 : 0}
        viewMode={viewMode}
        onToggleView={setViewMode}
        primaryCurrency={countryCurrency || 'INR'}
        secondaryCurrency={showSecondaryCurrency ? userCurrency : undefined}
      />

      {/* Tax Breakdown - Country-specific display */}
      <div className="space-y-3 mt-6">
        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
          <span className="font-medium text-green-800">Take-Home Salary</span>
          <span className="text-xl font-bold text-green-600">
            {currencySymbol}{(getValue(taxData.takeHomeSalary || 0)).toLocaleString()}
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
        <div className="space-y-1">
          {/* Standard Deduction - Always shown */}
          <div className="flex justify-between text-sm text-blue-700">
            <span>Standard Deduction</span>
            <span className="font-medium">-{currencySymbol}{(indiaRegime === 'old' ? STANDARD_DEDUCTION_OLD : STANDARD_DEDUCTION_NEW).toLocaleString()}</span>
          </div>
          
          {/* Additional Deductions - Only for old regime */}
          {indiaRegime === 'old' && totalDeductions > 0 && (
            <div className="flex justify-between text-sm text-blue-700">
              <span>Additional Deductions</span>
              <span className="font-medium">-{currencySymbol}{totalDeductions.toLocaleString()}</span>
            </div>
          )}
          
          {/* Total Deductions */}
          <div className="flex justify-between text-sm text-blue-700 font-medium border-t pt-1">
            <span>Total Deductions</span>
            <span>-{currencySymbol}{((indiaRegime === 'old' ? STANDARD_DEDUCTION_OLD : STANDARD_DEDUCTION_NEW) + (indiaRegime === 'old' ? totalDeductions : 0)).toLocaleString()}</span>
          </div>
        </div>

        {/* Display tax breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Income Tax</span>
            <span className="font-medium">{currencySymbol}{(getValue(taxData.federalTax || 0)).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Health & Education Cess</span>
            <Tooltip>
              <TooltipTrigger>
                <span className="inline-flex items-center">
                  <Info className="w-3 h-3 mr-1" />
                  4% of income tax after rebate
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>4% of income tax after rebate</p>
              </TooltipContent>
            </Tooltip>
            <span className="font-medium">{currencySymbol}{(getValue(taxData.cess || 0)).toLocaleString()}</span>
          </div>
          {taxData.surcharge ? (
            <div className="flex justify-between text-sm">
              <span>Surcharge</span>
              <span className="font-medium">{currencySymbol}{(getValue(taxData.surcharge || 0)).toLocaleString()}</span>
            </div>
          ) : null}
          {(taxData.taxableIncome <= (indiaRegime === 'old' ? SECTION_87A_LIMIT : SECTION_87A_NEW_LIMIT)) && ((taxData.federalTax || 0) > 0) && (
            <div className="flex justify-between text-sm text-green-700">
              <span>Section 87A Rebate</span>
              <span className="font-medium">-{currencySymbol}{Math.min((taxData.federalTax || 0), (indiaRegime === 'old' ? SECTION_87A_REBATE : SECTION_87A_NEW_REBATE)).toLocaleString()}</span>
            </div>
          )}
        </div>
      </div>

      {/* Tax Bracket Table - Reusable component */}
      <TaxBracketTable
        brackets={taxData.brackets || []}
        taxableIncome={taxData.taxableIncome}
        viewMode={viewMode}
        currencySymbol={currencySymbol}
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

export default TaxCalculatorIndia; 