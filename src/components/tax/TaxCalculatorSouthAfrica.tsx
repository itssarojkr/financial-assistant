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

interface TaxCalculatorSouthAfricaProps {
  salaryData: SalaryData;
  taxData: TaxData;
  setTaxData: (data: TaxData) => void;
  onNext: () => void;
}

const SA_BRACKETS = [
  { min: 0, max: 237100, rate: 0.18 },
  { min: 237100, max: 370500, rate: 0.26 },
  { min: 370500, max: 512800, rate: 0.31 },
  { min: 512800, max: 673000, rate: 0.36 },
  { min: 673000, max: 857900, rate: 0.39 },
  { min: 857900, max: 1817000, rate: 0.41 },
  { min: 1817000, max: null, rate: 0.45 },
];
const PRIMARY_REBATE = 17235; // 2024/25 primary rebate
const SECONDARY_REBATE = 9444; // 2024/25 secondary rebate (65+ years)
const TERTIARY_REBATE = 3144; // 2024/25 tertiary rebate (75+ years)
const UIF_RATE = 0.01;
const MAX_UIF = 177.12 * 12;

const TaxCalculatorSouthAfrica: React.FC<TaxCalculatorSouthAfricaProps> = ({ salaryData, taxData, setTaxData, onNext }) => {
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
      key: 'dedRetirement',
      label: 'Retirement Contributions',
      tooltip: 'Retirement annuity fund contributions',
    },
    {
      key: 'dedOther',
      label: 'Other Deductions',
      tooltip: 'Other eligible deductions',
    }
  ];

  const calculateSATax = useCallback(({ grossSalary, deductions }) => {
    const totalDeductions = Math.max(0, deductions.dedRetirement || 0) + Math.max(0, deductions.dedOther || 0);
    const grossAfterDeductions = Math.max(0, grossSalary - totalDeductions);
    const brackets = SA_BRACKETS.map(bracket => {
      if (grossAfterDeductions <= bracket.min) return { ...bracket, taxPaid: 0 };
      const upper = bracket.max === null ? grossAfterDeductions : Math.min(grossAfterDeductions, bracket.max);
      const band = Math.max(0, upper - bracket.min);
      const tax = band * bracket.rate;
      return { ...bracket, taxPaid: tax };
    });
    const incomeTax = brackets.reduce((sum, b) => sum + b.taxPaid, 0);
    
    // Apply primary rebate
    const rebateAmount = Math.min(incomeTax, PRIMARY_REBATE);
    const finalIncomeTax = Math.max(0, incomeTax - rebateAmount);
    
    const uif = Math.min(grossAfterDeductions * UIF_RATE, MAX_UIF);
    const totalTax = finalIncomeTax + uif;
    const takeHomeSalary = grossSalary - totalTax;
    return {
      brackets,
      totalTax,
      takeHomeSalary,
      taxableIncome: grossAfterDeductions,
      additionalTaxes: { uif },
      breakdown: { 
        incomeTax: finalIncomeTax, 
        uif,
        primaryRebate: rebateAmount,
        totalDeductions: totalDeductions
      }
    };
  }, []);

  const mainTaxCalculation = useMemo(() => {
    if (salaryData.grossSalary <= 0) return null;
    return calculateSATax({ grossSalary: salaryData.grossSalary, deductions });
  }, [salaryData.grossSalary, deductions, calculateSATax]);

  const whatIfTaxCalculation = useMemo(() => {
    if (whatIfSalary <= 0 || !showWhatIf) return null;
    return calculateSATax({ grossSalary: whatIfSalary, deductions });
  }, [whatIfSalary, deductions, showWhatIf, calculateSATax]);

  React.useEffect(() => {
    if (mainTaxCalculation) {
      setTaxData({
        brackets: mainTaxCalculation.brackets,
        totalTax: mainTaxCalculation.totalTax,
        takeHomeSalary: mainTaxCalculation.takeHomeSalary,
        federalTax: mainTaxCalculation.breakdown.incomeTax,
        stateTax: 0,
        socialSecurity: mainTaxCalculation.breakdown.uif,
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
        socialSecurity: whatIfTaxCalculation.breakdown.uif,
        medicare: 0,
        taxableIncome: whatIfTaxCalculation.taxableIncome,
      });
    }
  }, [whatIfTaxCalculation, setWhatIfTaxData]);

  const currencySymbol = 'R';

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
        countryName="South Africa"
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
        takeHome={getValue(taxData.takeHomeSalary)}
        effectiveTaxRate={effectiveTaxRate}
        userBracket={userBracket ? userBracket.rate * 100 : undefined}
        viewMode={viewMode}
        onToggleView={setViewMode}
      />
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
        {totalDeductions > 0 && (
          <div className="flex justify-between text-sm text-blue-700">
            <span>Total Deductions</span>
            <span className="font-medium">-{currencySymbol}{totalDeductions.toLocaleString()}</span>
          </div>
        )}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Income Tax (Before Rebate)</span>
            <span className="font-medium">{currencySymbol}{(getValue(taxData.federalTax) + PRIMARY_REBATE).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-green-700">
            <span>Primary Rebate</span>
            <span className="font-medium">-{currencySymbol}{PRIMARY_REBATE.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm font-medium border-t pt-1">
            <span>Income Tax (After Rebate)</span>
            <span>{currencySymbol}{getValue(taxData.federalTax).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>UIF (Unemployment Insurance Fund)</span>
            <Tooltip>
              <TooltipTrigger>
                <span className="inline-flex items-center">
                  <Info className="w-3 h-3 mr-1" />
                  1% up to max R2,125.44
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>UIF is 1% of salary up to a maximum of R2,125.44 per year</p>
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
        currencySymbol={currencySymbol}
        userBracketIdx={userBracketIdx}
        getValue={getValue}
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

export default TaxCalculatorSouthAfrica; 