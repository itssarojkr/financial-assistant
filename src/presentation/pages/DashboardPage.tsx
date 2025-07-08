import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FinancialDashboard } from '@/components/dashboard/FinancialDashboard';
import { PageHeader } from '@/presentation/components/PageHeader';

/**
 * Dashboard Page
 * 
 * This page provides a comprehensive overview of the user's financial data
 * including expenses, budgets, alerts, and tax calculations.
 */
export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">Please sign in to access your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title="Financial Dashboard"
        description={`Welcome back, ${user?.user_metadata?.first_name || 'User'}! Here's your comprehensive financial overview.`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
        ]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FinancialDashboard userId={user.id} />
      </div>
    </div>
  );
}; 
