import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TaxData, SalaryData } from '@/shared/types/domain.types';
import { formatCurrency } from '@/shared/utils/formatting/currencyFormatter';

interface TaxCalculatorResultsProps {
  taxData: TaxData;
  salaryData: SalaryData;
  onSave: () => void;
}

/**
 * Tax Calculator Results Component
 * 
 * This component displays the results of tax calculations
 * including breakdowns, effective rates, and take-home pay.
 */
export const TaxCalculatorResults: React.FC<TaxCalculatorResultsProps> = ({
  taxData,
  salaryData,
  onSave,
}) => {
  const formatAmount = (amount: number) => formatCurrency(amount, salaryData.currency);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          Tax Calculation Results
          <Button onClick={onSave} variant="outline" size="sm">
            Save Calculation
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Gross Salary</div>
            <div className="text-2xl font-bold text-blue-900">
              {formatAmount(salaryData.salary)}
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-sm text-red-600 font-medium">Total Tax</div>
            <div className="text-2xl font-bold text-red-900">
              {formatAmount(taxData.totalTax)}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Take Home</div>
            <div className="text-2xl font-bold text-green-900">
              {formatAmount(salaryData.salary - taxData.totalTax)}
            </div>
          </div>
        </div>

        {/* Tax Breakdown */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Tax Breakdown</h3>
          <div className="space-y-3">
            {taxData.federalTax > 0 && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Federal Tax</span>
                <span className="font-medium">{formatAmount(taxData.federalTax)}</span>
              </div>
            )}
            {taxData.stateTax > 0 && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">State/Provincial Tax</span>
                <span className="font-medium">{formatAmount(taxData.stateTax)}</span>
              </div>
            )}
            {taxData.localTax > 0 && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Local Tax</span>
                <span className="font-medium">{formatAmount(taxData.localTax)}</span>
              </div>
            )}
            {taxData.socialSecurity > 0 && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Social Security</span>
                <span className="font-medium">{formatAmount(taxData.socialSecurity)}</span>
              </div>
            )}
            {taxData.medicare > 0 && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Medicare</span>
                <span className="font-medium">{formatAmount(taxData.medicare)}</span>
              </div>
            )}
            {taxData.otherDeductions > 0 && (
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-gray-600">Other Deductions</span>
                <span className="font-medium">{formatAmount(taxData.otherDeductions)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tax Rates */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Tax Rates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Effective Tax Rate</div>
              <div className="text-xl font-bold">
                {((taxData.totalTax / salaryData.salary) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600">Marginal Tax Rate</div>
              <div className="text-xl font-bold">
                {(taxData.marginalRate * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Breakdown */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Monthly Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Monthly Gross</div>
              <div className="text-lg font-bold">
                {formatAmount(salaryData.salary / 12)}
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Monthly Tax</div>
              <div className="text-lg font-bold">
                {formatAmount(taxData.totalTax / 12)}
              </div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Monthly Take Home</div>
              <div className="text-lg font-bold">
                {formatAmount((salaryData.salary - taxData.totalTax) / 12)}
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information */}
        {taxData.additionalInfo && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Additional Information</h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-800">
                {taxData.additionalInfo}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 
