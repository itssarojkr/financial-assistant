import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
import { TaxStrategyFactory, TaxCalculationParams } from '@/lib/tax-strategy';

// Import strategies to ensure they are registered
import '@/lib/strategies';

interface StrategyBasedTaxCalculatorProps {
  salaryData: SalaryData;
  taxData: TaxData;
  setTaxData: (data: TaxData) => void;
  onNext: () => void;
  // Country-specific props
  regime?: string;
  setRegime?: (regime: string) => void;
  additionalParams?: Record<string, any>;
  setAdditionalParams?: (params: Record<string, any>) => void;
}

const StrategyBasedTaxCalculator: React.FC<StrategyBasedTaxCalculatorProps> = ({
  salaryData,
  taxData,
  setTaxData,
  onNext,
  regime,
  setRegime,
  additionalParams = {},
  setAdditionalParams
}) => {
  console.log('StrategyBasedTaxCalculator rendered for country:', salaryData.country);
  
  // Get the appropriate strategy for the country
  const strategy = useMemo(() => {
    const foundStrategy = TaxStrategyFactory.createStrategyByName(salaryData.country);
    console.log('Strategy found:', foundStrategy?.name);
    return foundStrategy;
  }, [salaryData.country]);

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

  // Get country-specific deduction fields
  const deductionFields: DeductionField[] = useMemo(() => {
    if (!strategy) return [];
    
    return strategy.getDeductions(regime).map(deduction => ({
      key: deduction.key,
      label: deduction.label,
      maxValue: deduction.maxValue,
      tooltip: deduction.tooltip
    }));
  }, [strategy, regime]);

  // Memoized tax calculation for main scenario
  const mainTaxCalculation = useMemo(() => {
    if (!strategy || salaryData.grossSalary <= 0) return null;
    
    const params: TaxCalculationParams = {
      grossSalary: salaryData.grossSalary,
      deductions,
      regime,
      additionalParams
    };

    return strategy.calculateTax(params);
  }, [strategy, salaryData.grossSalary, deductions, regime, additionalParams]);

  // Memoized tax calculation for what-if scenario
  const whatIfTaxCalculation = useMemo(() => {
    if (!strategy || whatIfSalary <= 0 || !showWhatIf) return null;
    
    const params: TaxCalculationParams = {
      grossSalary: whatIfSalary,
      deductions,
      regime,
      additionalParams
    };

    return strategy.calculateTax(params);
  }, [strategy, whatIfSalary, deductions, regime, additionalParams, showWhatIf]);

  // Update main tax data when calculation changes
  useEffect(() => {
    if (mainTaxCalculation) {
      setTaxData({
        brackets: mainTaxCalculation.brackets,
        totalTax: mainTaxCalculation.totalTax,
        takeHomeSalary: mainTaxCalculation.takeHomeSalary,
        federalTax: mainTaxCalculation.breakdown.incomeTax || mainTaxCalculation.totalTax,
        stateTax: 0, // Will be handled by country-specific strategies if needed
        socialSecurity: mainTaxCalculation.additionalTaxes.socialSecurity || 0,
        medicare: mainTaxCalculation.additionalTaxes.medicare || 0,
        taxableIncome: mainTaxCalculation.taxableIncome,
        effectiveTaxRate: mainTaxCalculation.effectiveTaxRate,
        marginalTaxRate: mainTaxCalculation.marginalTaxRate,
        additionalTaxes: mainTaxCalculation.additionalTaxes,
        breakdown: mainTaxCalculation.breakdown
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
        federalTax: whatIfTaxCalculation.breakdown.incomeTax || whatIfTaxCalculation.totalTax,
        stateTax: 0,
        socialSecurity: whatIfTaxCalculation.additionalTaxes.socialSecurity || 0,
        medicare: whatIfTaxCalculation.additionalTaxes.medicare || 0,
        taxableIncome: whatIfTaxCalculation.taxableIncome,
        effectiveTaxRate: whatIfTaxCalculation.effectiveTaxRate,
        marginalTaxRate: whatIfTaxCalculation.marginalTaxRate,
        additionalTaxes: whatIfTaxCalculation.additionalTaxes,
        breakdown: whatIfTaxCalculation.breakdown
      });
    }
  }, [whatIfTaxCalculation, setWhatIfTaxData]);

  // Handle regime changes
  const handleRegimeChange = useCallback((newRegime: string) => {
    if (setRegime) {
      setRegime(newRegime);
    }
  }, [setRegime]);

  // Handle additional params changes
  const handleAdditionalParamsChange = useCallback((newParams: Record<string, any>) => {
    if (setAdditionalParams) {
      setAdditionalParams(newParams);
    }
  }, [setAdditionalParams]);

  // If no strategy is available for this country
  if (!strategy) {
    return (
      <div className="p-4 text-gray-500">
        Tax calculation for {salaryData.country} is not yet supported.
      </div>
    );
  }

  // Get additional tax configurations for tooltips
  const additionalTaxes = strategy.getAdditionalTaxes();

  return (
    <div className="space-y-6">
      {/* Regime Selection (if applicable) */}
      {strategy.getDeductions('new').length > 0 && (
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium">Tax Regime:</span>
          <div className="flex items-center space-x-2">
            <Switch
              checked={regime === 'new'}
              onCheckedChange={(checked) => handleRegimeChange(checked ? 'new' : 'old')}
            />
            <span className="text-sm">{regime === 'new' ? 'New Regime' : 'Old Regime'}</span>
          </div>
          <Tooltip>
            <TooltipTrigger>
              <Info className="h-4 w-4 text-gray-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Choose between old and new tax regimes</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Tax Summary Card */}
      <TaxSummaryCard
        takeHome={taxData.takeHomeSalary || 0}
        effectiveTaxRate={taxData.effectiveTaxRate || 0}
        userBracket={taxData.marginalTaxRate}
        viewMode={viewMode}
        onToggleView={setViewMode}
      />

      {/* Tax Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Tax Breakdown</h3>
        
        <div className="space-y-3">
          {/* Income Tax */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span>Income Tax</span>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-gray-500" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Tax calculated based on income brackets</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <span className="font-medium">
              {strategy.currency}{taxData.federalTax?.toLocaleString() || 0}
            </span>
          </div>

          {/* Rebate Display - Country-specific */}
          {taxData.breakdown?.rebate && taxData.breakdown.rebate > 0 && (
            <div className="flex justify-between items-center text-green-700">
              <div className="flex items-center space-x-2">
                <span>
                  {salaryData.country === 'India' ? 'Section 87A Rebate' : 'Tax Rebate'}
                </span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-green-600" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      {salaryData.country === 'India' 
                        ? 'Rebate under Section 87A for income up to ₹5 lakhs (old regime) or ₹12 lakhs (new regime)'
                        : 'Tax rebate applied to reduce total tax liability'
                      }
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="font-medium">
                -{strategy.currency}{taxData.breakdown.rebate.toLocaleString()}
              </span>
            </div>
          )}

          {/* Additional Taxes */}
          {additionalTaxes.map(tax => (
            <div key={tax.key} className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span>{tax.label}</span>
                {tax.tooltip && (
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-gray-500" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{tax.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              <span className="font-medium">
                {strategy.currency}{taxData.additionalTaxes?.[tax.key]?.toLocaleString() || 0}
              </span>
            </div>
          ))}

          {/* Deductions Display */}
          {taxData.breakdown?.totalDeductions && taxData.breakdown.totalDeductions > 0 && (
            <div className="flex justify-between items-center text-blue-700">
              <div className="flex items-center space-x-2">
                <span>Total Deductions</span>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-blue-600" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total deductions applied to reduce taxable income</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="font-medium">
                -{strategy.currency}{taxData.breakdown.totalDeductions.toLocaleString()}
              </span>
            </div>
          )}

          {/* Total Tax */}
          <div className="border-t pt-3 flex justify-between items-center font-semibold">
            <span>Total Tax</span>
            <span>{strategy.currency}{taxData.totalTax?.toLocaleString() || 0}</span>
          </div>

          {/* Take Home Salary */}
          <div className="border-t pt-3 flex justify-between items-center text-green-600 font-semibold">
            <span>Take Home Salary</span>
            <span>{strategy.currency}{taxData.takeHomeSalary?.toLocaleString() || 0}</span>
          </div>
        </div>
      </div>

      {/* Tax Bracket Table */}
      <TaxBracketTable
        brackets={taxData.brackets || []}
        userBracketIdx={userBracketIdx}
        currency={strategy.currency}
      />

      {/* Advanced Options */}
      <AdvancedOptions
        showAdvanced={showAdvanced}
        toggleAdvanced={toggleAdvanced}
        deductionFields={deductionFields}
        deductions={deductions}
        updateDeduction={updateDeduction}
        totalDeductions={totalDeductions}
        currency={strategy.currency}
      />

      {/* What If Calculator */}
      <WhatIfCalculator
        showWhatIf={showWhatIf}
        toggleWhatIf={toggleWhatIf}
        whatIfSalary={whatIfSalary}
        setWhatIfSalary={setWhatIfSalary}
        whatIfTaxData={whatIfTaxData}
        showCalculationModal={showCalculationModal}
        setShowCalculationModal={setShowCalculationModal}
        originalSalary={salaryData.grossSalary}
        currency={strategy.currency}
        countryName={salaryData.country}
      />

      {/* Next Button */}
      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StrategyBasedTaxCalculator; 