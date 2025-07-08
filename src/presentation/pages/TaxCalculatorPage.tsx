import React from 'react';
import { PageHeader } from '@/presentation/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * Tax Calculator Page
 * 
 * This page provides the main interface for tax calculations
 * and financial planning tools.
 */
export const TaxCalculatorPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Tax Calculator"
        description="Calculate your tax liability and optimize your financial planning"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Tax Calculator', href: '/tax-calculator' },
        ]}
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-6 h-6" />
              Tax Calculator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold mb-4">
                Tax Calculator Coming Soon
              </h3>
              <p className="text-gray-600 mb-6">
                We're working on integrating the tax calculator with the new architecture. 
                The calculator will be available soon with enhanced features and better performance.
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate('/')} variant="outline">
                  Back to Home
                </Button>
                <Button onClick={() => navigate('/help')}>
                  Learn More
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}; 
