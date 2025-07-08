import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { TaxData, SalaryData } from '@/shared/types/domain.types';
import { formatCurrency } from '@/shared/utils/formatting/currencyFormatter';

/**
 * Tax calculator comparison props interface
 */
interface TaxCalculatorComparisonProps {
  taxData: TaxData;
  salaryData: SalaryData;
  onCompare: () => void;
}

/**
 * Tax calculator comparison component
 * 
 * This component displays scenario comparison results with visual
 * indicators for differences and recommendations.
 */
export const TaxCalculatorComparison: React.FC<TaxCalculatorComparisonProps> = ({
  taxData,
  salaryData,
  onCompare,
}) => {
  const formatAmount = (amount: number) => formatCurrency(amount, salaryData.currency);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Scenario Comparison
          </h2>
          <p className="text-muted-foreground">
            Compare different tax scenarios and their impact
          </p>
        </div>
        <Button variant="outline" onClick={onCompare} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Compare Scenarios
        </Button>
      </div>

      {/* Base Scenario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Base Scenario
          </CardTitle>
          <CardDescription>
            Your current tax situation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {formatAmount(salaryData.salary)}
              </div>
              <div className="text-sm text-muted-foreground">Gross Salary</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {formatAmount(taxData.totalTax)}
              </div>
              <div className="text-sm text-muted-foreground">Total Tax</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {formatAmount(salaryData.salary - taxData.totalTax)}
              </div>
              <div className="text-sm text-muted-foreground">Take Home</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenario Comparisons */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Comparison Scenarios</h3>
        
        {/* Higher Salary Scenario */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium">Higher Salary (+10%)</h4>
            <span className="text-sm text-gray-500">Hypothetical</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Gross:</span>
              <span className="ml-2 font-medium">
                {formatAmount(salaryData.salary * 1.1)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Tax:</span>
              <span className="ml-2 font-medium">
                {formatAmount(taxData.totalTax * 1.15)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Take Home:</span>
              <span className="ml-2 font-medium">
                {formatAmount((salaryData.salary * 1.1) - (taxData.totalTax * 1.15))}
              </span>
            </div>
          </div>
        </div>

        {/* Lower Salary Scenario */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium">Lower Salary (-10%)</h4>
            <span className="text-sm text-gray-500">Hypothetical</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Gross:</span>
              <span className="ml-2 font-medium">
                {formatAmount(salaryData.salary * 0.9)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Tax:</span>
              <span className="ml-2 font-medium">
                {formatAmount(taxData.totalTax * 0.85)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Take Home:</span>
              <span className="ml-2 font-medium">
                {formatAmount((salaryData.salary * 0.9) - (taxData.totalTax * 0.85))}
              </span>
            </div>
          </div>
        </div>

        {/* Different Country Scenario */}
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium">Different Country</h4>
            <span className="text-sm text-gray-500">Hypothetical</span>
          </div>
          <div className="text-sm text-gray-600">
            Use the comparison tool to see how your tax would differ in other countries.
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Key Insights</h3>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <div className="text-sm">
              <span className="font-medium">Effective Tax Rate:</span>
              <span className="ml-1">
                {((taxData.totalTax / salaryData.salary) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div className="text-sm">
              <span className="font-medium">Take Home Percentage:</span>
              <span className="ml-1">
                {(((salaryData.salary - taxData.totalTax) / salaryData.salary) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
            <div className="text-sm">
              <span className="font-medium">Marginal Tax Rate:</span>
              <span className="ml-1">
                {(taxData.marginalRate * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <Button onClick={onCompare} className="flex-1">
          Run Detailed Comparison
        </Button>
        <Button variant="outline" className="flex-1">
          Export Results
        </Button>
      </div>
    </div>
  );
}; 
