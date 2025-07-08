import React from 'react';
import { useTaxCalculator } from '@/presentation/hooks/business/useTaxCalculator';
import { TaxCalculatorForm } from './TaxCalculatorForm';
import { TaxCalculatorResults } from './TaxCalculatorResults';
import { TaxCalculatorComparison } from './TaxCalculatorComparison';
import { TaxOptimizationPanel } from './TaxOptimizationPanel';

/**
 * Tax Calculator Container Component
 * 
 * This component orchestrates the tax calculator feature using the new architecture.
 * It manages the state and coordinates between different tax calculator components.
 */
export const TaxCalculatorContainer: React.FC = () => {
  const {
    salaryData,
    taxData,
    setSalaryData,
    setTaxData,
    calculateTax,
    isLoading,
    error,
    clearError,
    saveCalculation,
    loadCalculation,
    compareScenarios,
    optimizeTax,
  } = useTaxCalculator();

  const handleNext = () => {
    if (salaryData.country && salaryData.salary) {
      calculateTax();
    }
  };

  const handleSave = async () => {
    try {
      await saveCalculation();
    } catch (err) {
      console.error('Failed to save calculation:', err);
    }
  };

  const handleLoad = async () => {
    try {
      await loadCalculation();
    } catch (err) {
      console.error('Failed to load calculation:', err);
    }
  };

  const handleCompare = async () => {
    try {
      await compareScenarios();
    } catch (err) {
      console.error('Failed to compare scenarios:', err);
    }
  };

  const handleOptimize = async () => {
    try {
      await optimizeTax();
    } catch (err) {
      console.error('Failed to optimize tax:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tax Calculator
        </h1>
        <p className="text-gray-600">
          Calculate your tax liability and optimize your financial planning
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error
              </h3>
              <div className="mt-2 text-sm text-red-700">
                {error}
              </div>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={clearError}
                className="inline-flex text-red-400 hover:text-red-500"
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Calculating taxes...</span>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Form and Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tax Calculator Form */}
          <TaxCalculatorForm
            salaryData={salaryData}
            setSalaryData={setSalaryData}
            onCalculate={handleNext}
            isLoading={isLoading}
          />

          {/* Tax Calculator Results */}
          {taxData && (
            <TaxCalculatorResults
              taxData={taxData}
              salaryData={salaryData}
              onSave={handleSave}
            />
          )}

          {/* Tax Calculator Comparison */}
          {taxData && (
            <TaxCalculatorComparison
              taxData={taxData}
              salaryData={salaryData}
              onCompare={handleCompare}
            />
          )}
        </div>

        {/* Right Column - Optimization Panel */}
        <div className="lg:col-span-1">
          <TaxOptimizationPanel
            salaryData={salaryData}
            taxData={taxData}
            onOptimize={handleOptimize}
            onLoad={handleLoad}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}; 
