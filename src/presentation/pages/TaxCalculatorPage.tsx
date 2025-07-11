
import React from 'react';
import { PageHeader } from '@/presentation/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, ArrowRight, BookOpen, TrendingUp, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BreadcrumbNavigation } from '@/components/ui/breadcrumb-navigation';
import { EmptyState } from '@/components/ui/empty-state';

/**
 * Tax Calculator Page
 * 
 * This page provides the main interface for tax calculations
 * and financial planning tools.
 */
export const TaxCalculatorPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calculator,
      title: 'Advanced Tax Calculator',
      description: 'Multi-country tax calculations with real-time updates',
      action: () => navigate('/calculator'),
      available: true
    },
    {
      icon: TrendingUp,
      title: 'Tax Optimization',
      description: 'AI-powered suggestions to minimize your tax liability',
      action: () => navigate('/help'),
      available: false
    },
    {
      icon: FileText,
      title: 'Tax Reports',
      description: 'Generate comprehensive tax reports and summaries',
      action: () => navigate('/help'),
      available: false
    },
    {
      icon: BookOpen,
      title: 'Tax Education',
      description: 'Learn about tax regulations and best practices',
      action: () => navigate('/help'),
      available: true
    }
  ];

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
      
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        <BreadcrumbNavigation />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    {!feature.available && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                        Coming Soon
                      </span>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
                <Button 
                  onClick={feature.action}
                  variant={feature.available ? "default" : "outline"}
                  className="w-full"
                  disabled={!feature.available}
                >
                  {feature.available ? 'Get Started' : 'Learn More'}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Why Use Our Tax Calculator?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                  <Calculator className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="font-semibold">Accurate Calculations</h3>
                <p className="text-sm text-muted-foreground">
                  Based on latest tax regulations and rates
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold">Multi-Country Support</h3>
                <p className="text-sm text-muted-foreground">
                  Calculate taxes for multiple countries and regions
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="font-semibold">Detailed Breakdown</h3>
                <p className="text-sm text-muted-foreground">
                  See exactly how your taxes are calculated
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <EmptyState
            icon={Calculator}
            title="Ready to Calculate Your Taxes?"
            description="Get started with our comprehensive tax calculator to understand your tax liability and optimize your financial planning."
            action={{
              label: "Start Calculator",
              onClick: () => navigate('/calculator')
            }}
            secondaryAction={{
              label: "Learn More",
              onClick: () => navigate('/help')
            }}
          />
        </div>
      </div>
    </div>
  );
}; 
