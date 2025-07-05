import React, { useMemo } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { TaxData } from '@/pages/Index';
import { useChartData, useDifferenceCalculations } from '@/lib/tax-utils';

interface WhatIfCalculatorProps {
  isVisible: boolean;
  onToggle: () => void;
  whatIfSalary: number;
  onSalaryChange: (salary: number) => void;
  currentTaxData: TaxData;
  whatIfTaxData: TaxData;
  currentSalary: number;
  currencySymbol: string;
  showCalculationModal: boolean;
  onToggleCalculationModal: () => void;
  countryName: string;
  getValue: (val: number) => number;
}

const WhatIfCalculator: React.FC<WhatIfCalculatorProps> = ({
  isVisible,
  onToggle,
  whatIfSalary,
  onSalaryChange,
  currentTaxData,
  whatIfTaxData,
  currentSalary,
  currencySymbol,
  showCalculationModal,
  onToggleCalculationModal,
  countryName,
  getValue
}) => {
  // Memoized chart data
  const chartData = useChartData(
    currentTaxData,
    whatIfTaxData,
    ['federalTax', 'stateTax', 'socialSecurity', 'medicare']
  );

  // Memoized difference calculations
  const differences = useDifferenceCalculations(
    currentSalary,
    whatIfSalary,
    currentTaxData.totalTax,
    whatIfTaxData.totalTax,
    currentTaxData.takeHomeSalary,
    whatIfTaxData.takeHomeSalary
  );

  // Check if salaries are the same
  const isSameSalary = useMemo(() => {
    return Math.abs(whatIfSalary - currentSalary) < 1;
  }, [whatIfSalary, currentSalary]);

  // Check if what-if data is valid
  const hasValidWhatIfData = useMemo(() => {
    return whatIfTaxData.totalTax >= 0 && whatIfSalary > 0;
  }, [whatIfTaxData.totalTax, whatIfSalary]);

  if (!isVisible) {
    return (
      <div className="mb-6">
        <Button onClick={onToggle} variant="outline">
          Show What if? Scenario
        </Button>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <Button onClick={onToggle} variant="outline">
        Hide What if? Scenario
      </Button>
      
      <Card className="mt-4 p-4 space-y-4">
        <h3 className="text-lg font-semibold mb-2">What if? Scenario</h3>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Gross Salary</label>
            <input
              type="number"
              min={0}
              value={whatIfSalary}
              onChange={(e) => onSalaryChange(Number(e.target.value))}
              className="w-full border rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        {/* Side-by-side comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {/* Current Scenario */}
          <div className="border rounded-lg p-3 bg-blue-50">
            <h4 className="font-semibold text-blue-800 mb-2">Current Scenario</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Salary:</span>
                <span className="font-medium">{currencySymbol}{currentSalary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Tax:</span>
                <span className="font-medium">{currencySymbol}{getValue(currentTaxData.totalTax).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Take-Home:</span>
                <span className="font-medium">{currencySymbol}{getValue(currentTaxData.takeHomeSalary).toLocaleString()}</span>
              </div>
            </div>
          </div>
          
          {/* What-if Scenario */}
          <div className="border rounded-lg p-3 bg-green-50">
            <h4 className="font-semibold text-green-800 mb-2">What-if Scenario</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Salary:</span>
                <span className="font-medium">{currencySymbol}{whatIfSalary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Tax:</span>
                <span className="font-medium">{currencySymbol}{getValue(whatIfTaxData.totalTax).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Take-Home:</span>
                <span className="font-medium">{currencySymbol}{getValue(whatIfTaxData.takeHomeSalary).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Difference boxes */}
        {!isSameSalary && hasValidWhatIfData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
            <div className={`p-3 rounded-lg text-center ${
              differences.salaryDifference >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className="text-xs">Salary Difference</div>
              <div className="font-semibold">
                {differences.salaryDifference >= 0 ? '+' : ''}{currencySymbol}{differences.salaryDifference.toLocaleString()}
              </div>
            </div>
            
            <div className={`p-3 rounded-lg text-center ${
              differences.taxDifference <= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className="text-xs">Tax Difference</div>
              <div className="font-semibold">
                {differences.taxDifference <= 0 ? '+' : ''}{currencySymbol}{Math.abs(differences.taxDifference).toLocaleString()}
              </div>
            </div>
            
            <div className={`p-3 rounded-lg text-center ${
              differences.takeHomeDifference >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              <div className="text-xs">Take-Home Difference</div>
              <div className="font-semibold">
                {differences.takeHomeDifference >= 0 ? '+' : ''}{currencySymbol}{differences.takeHomeDifference.toLocaleString()}
              </div>
            </div>
          </div>
        )}
        
        {/* Warning for same salary */}
        {isSameSalary && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-800 text-sm">
            ⚠️ The what-if salary is the same as your current salary. Change the salary to see differences.
          </div>
        )}
        
        {/* Action buttons */}
        <div className="flex gap-2 mt-4">
          <Dialog open={showCalculationModal} onOpenChange={onToggleCalculationModal}>
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                disabled={isSameSalary || !hasValidWhatIfData}
              >
                Show Calculation Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Calculation Details: Salary Comparison ({countryName})</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Original Scenario Details */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 text-blue-700">Original Scenario</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Gross Salary:</strong> {currencySymbol}{currentSalary?.toLocaleString() || 0}</div>
                    <div><strong>Federal Tax:</strong> {currencySymbol}{currentTaxData.federalTax?.toLocaleString() || 0}</div>
                    <div><strong>State Tax:</strong> {currencySymbol}{currentTaxData.stateTax?.toLocaleString() || 0}</div>
                    <div><strong>Social Security:</strong> {currencySymbol}{currentTaxData.socialSecurity?.toLocaleString() || 0}</div>
                    <div><strong>Medicare:</strong> {currencySymbol}{currentTaxData.medicare?.toLocaleString() || 0}</div>
                    <div><strong>Total Tax:</strong> {currencySymbol}{currentTaxData.totalTax?.toLocaleString() || 0}</div>
                    <div><strong>Take-Home:</strong> {currencySymbol}{currentTaxData.takeHomeSalary?.toLocaleString() || 0}</div>
                    <div><strong>Effective Tax Rate:</strong> {currentSalary > 0 ? ((currentTaxData.totalTax / currentSalary) * 100).toFixed(2) : 0}%</div>
                  </div>
                </div>
                
                {/* What-if Scenario Details */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-3 text-green-700">What-if Scenario</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Gross Salary:</strong> {currencySymbol}{whatIfSalary?.toLocaleString() || 0}</div>
                    <div><strong>Federal Tax:</strong> {currencySymbol}{whatIfTaxData.federalTax?.toLocaleString() || 0}</div>
                    <div><strong>State Tax:</strong> {currencySymbol}{whatIfTaxData.stateTax?.toLocaleString() || 0}</div>
                    <div><strong>Social Security:</strong> {currencySymbol}{whatIfTaxData.socialSecurity?.toLocaleString() || 0}</div>
                    <div><strong>Medicare:</strong> {currencySymbol}{whatIfTaxData.medicare?.toLocaleString() || 0}</div>
                    <div><strong>Total Tax:</strong> {currencySymbol}{whatIfTaxData.totalTax?.toLocaleString() || 0}</div>
                    <div><strong>Take-Home:</strong> {currencySymbol}{whatIfTaxData.takeHomeSalary?.toLocaleString() || 0}</div>
                    <div><strong>Effective Tax Rate:</strong> {whatIfSalary > 0 ? ((whatIfTaxData.totalTax / whatIfSalary) * 100).toFixed(2) : 0}%</div>
                  </div>
                </div>
                
                {/* Chart */}
                {hasValidWhatIfData && (
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3">Tax Comparison Chart</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Bar dataKey="Current" fill="#3b82f6" />
                          <Bar dataKey="What-if" fill="#10b981" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>
    </div>
  );
};

export default WhatIfCalculator; 