import React, { useState, useCallback } from 'react';
import { SalaryData, TaxData } from '@/pages/Index';
import GenericTaxCalculator from './GenericTaxCalculator';
import { DeductionField } from './AdvancedOptions';
import { Switch } from '../ui/switch';

interface IndiaAdditionalParams {
  regime?: 'new' | 'old';
}

interface IndiaTaxCalculatorExampleProps {
  salaryData: SalaryData;
  taxData: TaxData;
  setTaxData: (data: TaxData) => void;
  onNext: () => void;
}

const IndiaTaxCalculatorExample: React.FC<IndiaTaxCalculatorExampleProps> = ({
  salaryData,
  taxData,
  setTaxData,
  onNext
}) => {
  const [indiaRegime, setIndiaRegime] = useState<'new' | 'old'>('new');

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
    const regime = additionalParams.regime || 'new';

    // Define brackets based on regime
    const oldRegimeBrackets = [
      { min: 0, max: 250000, rate: 0 },
      { min: 250000, max: 500000, rate: 0.05 },
      { min: 500000, max: 1000000, rate: 0.20 },
      { min: 1000000, max: null, rate: 0.30 },
    ];

    const newRegimeBrackets = [
      { min: 0, max: 300000, rate: 0 },
      { min: 300000, max: 600000, rate: 0.05 },
      { min: 600000, max: 900000, rate: 0.10 },
      { min: 900000, max: 1200000, rate: 0.15 },
      { min: 1200000, max: 1500000, rate: 0.20 },
      { min: 1500000, max: null, rate: 0.30 },
    ];

    const brackets = regime === 'new' ? newRegimeBrackets : oldRegimeBrackets;

    // Calculate total deductions (only for old regime)
    const totalDeductions = regime === 'old' 
      ? Object.values(deductions).reduce((sum, val) => sum + Math.max(0, val), 0)
      : 0;

    const taxableIncome = Math.max(0, grossSalary - totalDeductions);

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
    const section87aLimit = regime === 'old' ? 500000 : 700000;
    const section87aRebate = regime === 'old' ? 12500 : 25000;
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

    const cess = (finalTax + surcharge) * 0.04;

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
        rebate: baseTax - finalTax
      }
    };
  }, []);

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

      {/* Use the generic tax calculator with India-specific configuration */}
      <GenericTaxCalculator
        salaryData={salaryData}
        taxData={taxData}
        setTaxData={setTaxData}
        onNext={onNext}
        countryName="India"
        currencySymbol="₹"
        deductionFields={deductionFields}
        advancedOptionsDescription={
          indiaRegime === 'old' 
            ? "Deductions are available under the old regime only."
            : "Deductions are not available under the new regime."
        }
        calculateTax={calculateIndiaTax}
        additionalParams={{ regime: indiaRegime }}
      />
    </div>
  );
};

export default IndiaTaxCalculatorExample; 