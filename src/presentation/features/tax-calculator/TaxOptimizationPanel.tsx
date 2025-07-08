import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, TrendingUp, Lightbulb, Target, DollarSign, AlertCircle } from 'lucide-react';
import { TaxData, SalaryData } from '@/shared/types/domain.types';
import { formatCurrency } from '@/shared/utils/formatting/currencyFormatter';

/**
 * Tax optimization panel props interface
 */
interface TaxOptimizationPanelProps {
  salaryData: SalaryData;
  taxData: TaxData | null;
  onOptimize: () => void;
  onLoad: () => void;
  isLoading: boolean;
}

/**
 * Tax optimization panel component
 * 
 * This component displays tax optimization suggestions with
 * priority levels and potential savings.
 */
export const TaxOptimizationPanel: React.FC<TaxOptimizationPanelProps> = ({
  salaryData,
  taxData,
  onOptimize,
  onLoad,
  isLoading,
}) => {
  const formatAmount = (amount: number) => formatCurrency(amount, salaryData.currency);

  const getOptimizationSuggestions = () => {
    if (!taxData) return [];

    const suggestions = [];

    // Retirement contributions
    if (salaryData.country === 'United States') {
      suggestions.push({
        title: '401(k) Contributions',
        description: 'Contribute to your 401(k) to reduce taxable income',
        potentialSavings: taxData.totalTax * 0.22,
        priority: 'high',
      });
    }

    // HSA contributions
    if (salaryData.country === 'United States') {
      suggestions.push({
        title: 'HSA Contributions',
        description: 'Health Savings Account contributions are tax-deductible',
        potentialSavings: taxData.totalTax * 0.15,
        priority: 'medium',
      });
    }

    // Tax-loss harvesting
    suggestions.push({
      title: 'Tax-Loss Harvesting',
      description: 'Offset capital gains with capital losses',
      potentialSavings: taxData.totalTax * 0.10,
      priority: 'medium',
    });

    // Charitable donations
    suggestions.push({
      title: 'Charitable Donations',
      description: 'Donate to qualified charities for tax deductions',
      potentialSavings: taxData.totalTax * 0.08,
      priority: 'low',
    });

    return suggestions;
  };

  const suggestions = getOptimizationSuggestions();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Lightbulb className="h-6 w-6" />
            Tax Optimization Suggestions
          </h2>
          <p className="text-muted-foreground">
            Personalized recommendations to minimize your tax liability
          </p>
        </div>
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Calculator
        </Button>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            onClick={onOptimize}
            disabled={isLoading || !taxData}
            className="w-full"
          >
            {isLoading ? 'Optimizing...' : 'Optimize Tax Strategy'}
          </Button>
          <Button
            onClick={onLoad}
            variant="outline"
            className="w-full"
          >
            Load Saved Calculations
          </Button>
        </CardContent>
      </Card>

      {/* Tax Optimization Suggestions */}
      {taxData && (
        <Card>
          <CardHeader>
            <CardTitle>Optimization Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm">{suggestion.title}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    suggestion.priority === 'high' ? 'bg-red-100 text-red-800' :
                    suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {suggestion.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {suggestion.description}
                </p>
                <div className="text-sm font-medium text-green-600">
                  Potential Savings: {formatAmount(suggestion.potentialSavings)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Tax Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <div className="text-sm">
              <span className="font-medium">Maximize Deductions:</span>
              <span className="ml-1 text-gray-600">
                Keep track of all eligible expenses and deductions
              </span>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
            <div className="text-sm">
              <span className="font-medium">Retirement Planning:</span>
              <span className="ml-1 text-gray-600">
                Contribute to tax-advantaged retirement accounts
              </span>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
            <div className="text-sm">
              <span className="font-medium">Timing:</span>
              <span className="ml-1 text-gray-600">
                Consider the timing of income and deductions
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>Important Tax Dates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span>Tax Filing Deadline</span>
            <span className="font-medium">April 15</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>Estimated Tax Payments</span>
            <span className="font-medium">Quarterly</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span>Retirement Contributions</span>
            <span className="font-medium">Dec 31</span>
          </div>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="link" className="p-0 h-auto text-left">
            IRS Tax Forms
          </Button>
          <Button variant="link" className="p-0 h-auto text-left">
            Tax Calculator Guide
          </Button>
          <Button variant="link" className="p-0 h-auto text-left">
            Deduction Checklist
          </Button>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <div className="font-medium mb-1">Important Disclaimer:</div>
              <p>
                These suggestions are for informational purposes only and should not be considered as tax advice. 
                Please consult with a qualified tax professional before implementing any tax strategies. 
                Tax laws and regulations may change, and individual circumstances vary.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Calculator
        </Button>
        <Button>
          <Lightbulb className="h-4 w-4 mr-2" />
          Save Action Plan
        </Button>
      </div>
    </div>
  );
} 
