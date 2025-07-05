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

interface TaxCalculatorCanadaProps {
  salaryData: SalaryData;
  taxData: TaxData;
  setTaxData: (data: TaxData) => void;
  onNext: () => void;
  canadaProvince: string;
  setCanadaProvince: (province: string) => void;
}

const CANADA_PROVINCES = [
  { name: 'Ontario', code: 'ON', rate: 0.1316 },
  { name: 'Quebec', code: 'QC', rate: 0.1477 },
  { name: 'British Columbia', code: 'BC', rate: 0.1206 },
  { name: 'Alberta', code: 'AB', rate: 0.10 },
  { name: 'Manitoba', code: 'MB', rate: 0.1275 },
  { name: 'Saskatchewan', code: 'SK', rate: 0.115 },
  { name: 'Nova Scotia', code: 'NS', rate: 0.1475 },
  { name: 'New Brunswick', code: 'NB', rate: 0.1455 },
  { name: 'Newfoundland and Labrador', code: 'NL', rate: 0.138 },
  { name: 'Prince Edward Island', code: 'PE', rate: 0.1375 },
];

const FEDERAL_BRACKETS = [
  { min: 0, max: 53359, rate: 0.15 },
  { min: 53359, max: 106717, rate: 0.205 },
  { min: 106717, max: 165430, rate: 0.26 },
  { min: 165430, max: 235675, rate: 0.29 },
  { min: 235675, max: null, rate: 0.33 },
];

const CPP_RATE = 0.0595;
const CPP_MAX = 66600;
const EI_RATE = 0.0163;
const EI_MAX = 61500;
const BASIC_PERSONAL_AMOUNT = 15000; // 2024 basic personal amount

const TaxCalculatorCanada: React.FC<TaxCalculatorCanadaProps> = ({ 
  salaryData, 
  taxData, 
  setTaxData, 
  onNext, 
  canadaProvince, 
  setCanadaProvince 
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

  // Canada-specific deduction fields
  const deductionFields: DeductionField[] = [
    {
      key: 'dedRRSP',
      label: 'RRSP Contributions',
      tooltip: 'Registered Retirement Savings Plan contributions',
    },
    {
      key: 'dedOther',
      label: 'Other Deductions',
      tooltip: 'Other eligible deductions',
    }
  ];

  // Canada-specific tax calculation function
  const calculateCanadaTax = useCallback((params: {
    grossSalary: number;
    deductions: Record<string, number>;
    additionalParams?: Record<string, any>;
  }) => {
    const { grossSalary, deductions, additionalParams = {} } = params;
    const province = additionalParams.province || canadaProvince;

    const provinceObj = CANADA_PROVINCES.find(p => p.name === province);
    const provinceRate = provinceObj ? provinceObj.rate : 0.1316;

    const totalDeductions = Math.max(0, deductions.dedRRSP || 0) + Math.max(0, deductions.dedOther || 0);
    const grossAfterDeductions = Math.max(0, grossSalary - totalDeductions);

    // Add basic personal amount
    const totalDeductionsWithBasic = totalDeductions + BASIC_PERSONAL_AMOUNT;
    const taxableIncome = Math.max(0, grossAfterDeductions - BASIC_PERSONAL_AMOUNT);

    // Calculate federal tax
    const federalBrackets = FEDERAL_BRACKETS.map(bracket => {
      if (taxableIncome <= bracket.min) return { ...bracket, taxPaid: 0 };
      const upper = bracket.max === null ? taxableIncome : Math.min(taxableIncome, bracket.max);
      const band = Math.max(0, upper - bracket.min);
      const tax = band * bracket.rate;
      return { ...bracket, taxPaid: tax };
    });

    const federalTax = federalBrackets.reduce((sum, b) => sum + b.taxPaid, 0);

    // Calculate additional taxes
    const provincialTax = taxableIncome * provinceRate;
    const cpp = Math.min(grossAfterDeductions, CPP_MAX) * CPP_RATE;
    const ei = Math.min(grossAfterDeductions, EI_MAX) * EI_RATE;

    const totalTax = federalTax + provincialTax + cpp + ei;
    const takeHomeSalary = grossSalary - totalTax;

    return {
      brackets: federalBrackets,
      totalTax,
      takeHomeSalary,
      taxableIncome,
      additionalTaxes: { provincialTax, cpp, ei },
      breakdown: {
        federalTax,
        provincialTax,
        cpp,
        ei,
        basicPersonalAmount: BASIC_PERSONAL_AMOUNT,
        totalDeductions: totalDeductionsWithBasic
      }
    };
  }, [canadaProvince]);

  // Memoized tax calculation for main scenario
  const mainTaxCalculation = useMemo(() => {
    if (salaryData.grossSalary <= 0) return null;
    
    return calculateCanadaTax({
      grossSalary: salaryData.grossSalary,
      deductions,
      additionalParams: { province: canadaProvince }
    });
  }, [salaryData.grossSalary, deductions, canadaProvince, calculateCanadaTax]);

  // Memoized tax calculation for what-if scenario
  const whatIfTaxCalculation = useMemo(() => {
    if (whatIfSalary <= 0 || !showWhatIf) return null;
    
    return calculateCanadaTax({
      grossSalary: whatIfSalary,
      deductions,
      additionalParams: { province: canadaProvince }
    });
  }, [whatIfSalary, deductions, canadaProvince, showWhatIf, calculateCanadaTax]);

  // Update main tax data when calculation changes
  React.useEffect(() => {
    if (mainTaxCalculation) {
      setTaxData({
        brackets: mainTaxCalculation.brackets,
        totalTax: mainTaxCalculation.totalTax,
        takeHomeSalary: mainTaxCalculation.takeHomeSalary,
        federalTax: mainTaxCalculation.breakdown.federalTax,
        stateTax: mainTaxCalculation.breakdown.provincialTax,
        socialSecurity: mainTaxCalculation.breakdown.cpp,
        medicare: mainTaxCalculation.breakdown.ei,
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
        stateTax: whatIfTaxCalculation.breakdown.provincialTax,
        socialSecurity: whatIfTaxCalculation.breakdown.cpp,
        medicare: whatIfTaxCalculation.breakdown.ei,
        taxableIncome: whatIfTaxCalculation.taxableIncome,
      });
    }
  }, [whatIfTaxCalculation, setWhatIfTaxData]);

  const currencySymbol = 'C$';

  return (
    <div>
      {/* Canada-specific province selector */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-blue-900 mb-2">Province/Territory</label>
          <Select value={canadaProvince} onValueChange={setCanadaProvince}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CANADA_PROVINCES.map(province => (
                <SelectItem key={province.code} value={province.name}>
                  {province.name} ({(province.rate * 100).toFixed(2)}%)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
        countryName="Canada"
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
          {/* Basic Personal Amount - Always shown */}
          <div className="flex justify-between text-sm text-blue-700">
            <span>Basic Personal Amount</span>
            <span className="font-medium">-{currencySymbol}{BASIC_PERSONAL_AMOUNT.toLocaleString()}</span>
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
            <span>-{currencySymbol}{(BASIC_PERSONAL_AMOUNT + totalDeductions).toLocaleString()}</span>
          </div>
        </div>

        {/* Display tax breakdown */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Federal Tax</span>
            <span className="font-medium">{currencySymbol}{getValue(taxData.federalTax).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Provincial Tax</span>
            <span className="font-medium">{currencySymbol}{getValue(taxData.stateTax).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>CPP Contributions</span>
            <Tooltip>
              <TooltipTrigger>
                <span className="inline-flex items-center">
                  <Info className="w-3 h-3 mr-1" />
                  5.95% up to maximum
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Canada Pension Plan contributions, 5.95% up to maximum of C$66,600</p>
              </TooltipContent>
            </Tooltip>
            <span className="font-medium">{currencySymbol}{getValue(taxData.socialSecurity).toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>EI Premiums</span>
            <Tooltip>
              <TooltipTrigger>
                <span className="inline-flex items-center">
                  <Info className="w-3 h-3 mr-1" />
                  1.63% up to maximum
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Employment Insurance premiums, 1.63% up to maximum of C$61,500</p>
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

export default TaxCalculatorCanada; 