import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FinancialDashboard } from '@/components/dashboard/FinancialDashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3 } from 'lucide-react';
import { Header } from '@/components/layout/Header';

/**
 * Dashboard Page
 * 
 * This page provides a comprehensive overview of the user's financial data
 * including expenses, budgets, alerts, and tax calculations.
 */
export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <Header />
        <div className="p-4">
          <div className="max-w-6xl mx-auto">
            <Card className="w-full max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-center">Financial Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Sign in to access Financial Dashboard</h3>
                  <p className="text-gray-600 mb-4">
                    Track your expenses, manage budgets, and get insights into your spending patterns.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <Button onClick={() => navigate('/login')}>
                      Sign In
                    </Button>
                    <Button variant="outline" onClick={() => navigate('/tax-calculator')}>
                      Try Calculator
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header />
      <div className="p-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Financial Dashboard</h1>
            <p className="text-gray-600 mt-2">
              Track your expenses, manage budgets, and get insights into your spending patterns.
            </p>
          </div>
          <FinancialDashboard userId={user.id} />
        </div>
      </div>
    </div>
  );
}; 
