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

interface TaxCalculatorBrazilProps {
  salaryData: SalaryData;
  taxData: TaxData;
  setTaxData: (data: TaxData) => void;
  onNext: () => void;
}

const BRAZIL_BRACKETS = [
  { min: 0, max: 2112, rate: 0 },
  { min: 2112, max: 2826.65, rate: 0.075 },
  { min: 2826.65, max: 3751.05, rate: 0.15 },
  { min: 3751.05, max: 4664.68, rate: 0.225 },
  { min: 4664.68, max: null, rate: 0.275 },
];
const INSS_RATE = 0.11;
const MAX_INSS = 713.10;

const TaxCalculatorBrazil: React.FC<TaxCalculatorBrazilProps> = ({ salaryData, taxData, setTaxData, onNext }) => {
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
      key: 'dedINSS',
      label: 'INSS Contributions',
      tooltip: 'Social security contributions (INSS)',
    },
    {
      key: 'dedOther',
      label: 'Other Deductions',
      tooltip: 'Other eligible deductions',
    }
  ];

  const calculateBrazilTax = useCallback(({ grossSalary, deductions }) => {
    const totalDeductions = Math.max(0, deductions.dedINSS || 0) + Math.max(0, deductions.dedOther || 0);
    const grossAfterDeductions = Math.max(0, grossSalary - totalDeductions);
    const brackets = BRAZIL_BRACKETS.map(bracket => {
      if (grossAfterDeductions <= bracket.min) return { ...bracket, taxPaid: 0 };
      const upper = bracket.max === null ? grossAfterDeductions : Math.min(grossAfterDeductions, bracket.max);
      const band = Math.max(0, upper - bracket.min);
      const tax = band * bracket.rate;
      return { ...bracket, taxPaid: tax };
    });
    const incomeTax = brackets.reduce((sum, b) => sum + b.taxPaid, 0);
    const inss = Math.min(grossAfterDeductions * INSS_RATE, MAX_INSS);
    const totalTax = incomeTax + inss;
    const takeHomeSalary = grossSalary - totalTax;
    return {
      brackets,
      totalTax,
      takeHomeSalary,
      taxableIncome: grossAfterDeductions,
      additionalTaxes: { inss },
      breakdown: { incomeTax, inss }
    };
  }, []);

  const mainTaxCalculation = useMemo(() => {
    if (salaryData.grossSalary <= 0) return null;
    return calculateBrazilTax({ grossSalary: salaryData.grossSalary, deductions });
  }, [salaryData.grossSalary, deductions, calculateBrazilTax]);

  const whatIfTaxCalculation = useMemo(() => {
    if (whatIfSalary <= 0 || !showWhatIf) return null;
    return calculateBrazilTax({ grossSalary: whatIfSalary, deductions });
  }, [whatIfSalary, deductions, showWhatIf, calculateBrazilTax]);

  React.useEffect(() => {
    if (mainTaxCalculation) {
      setTaxData({
        brackets: mainTaxCalculation.brackets,
        totalTax: mainTaxCalculation.totalTax,
        takeHomeSalary: mainTaxCalculation.takeHomeSalary,
        federalTax: mainTaxCalculation.breakdown.incomeTax,
        stateTax: 0,
        socialSecurity: mainTaxCalculation.breakdown.inss,
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
        socialSecurity: whatIfTaxCalculation.breakdown.inss,
        medicare: 0,
        taxableIncome: whatIfTaxCalculation.taxableIncome,
      });
    }
  }, [whatIfTaxCalculation, setWhatIfTaxData]);

  const currencySymbol = 'R$';

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
        countryName="Brazil"
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
            <span>Income Tax</span>
            <span className="font-medium">{currencySymbol}{getValue(taxData.federalTax).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>INSS (Social Security)</span>
            <Tooltip>
              <TooltipTrigger>
                <span className="inline-flex items-center">
                  <Info className="w-3 h-3 mr-1" />
                  11% up to max R$713.10
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>INSS is 11% of salary up to a maximum of R$713.10</p>
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

export default TaxCalculatorBrazil; 