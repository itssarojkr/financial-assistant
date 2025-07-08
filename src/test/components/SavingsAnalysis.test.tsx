import React from 'react';
import { render, screen } from '@/test/utils/test-utils';
import SavingsAnalysis from '@/components/SavingsAnalysis';
import { vi } from 'vitest';

describe('SavingsAnalysis (Dual-Currency)', () => {
  const salaryData = {
    country: 'India',
    countryCode: 'IN',
    state: 'Maharashtra',
    stateId: 'MH',
    city: 'Mumbai',
    cityId: 'MUM',
    locality: 'Bandra',
    localityId: 'BND',
    isNative: true,
    grossSalary: 1200000,
    currency: 'INR',
  };
  const taxData = {
    takeHomeSalary: 900000,
    totalTax: 300000,
    federalTax: 250000,
    stateTax: 50000,
    socialSecurity: 0,
    medicare: 0,
    taxableIncome: 1000000,
    brackets: []
  };
  const expenseData = {
    rent: 15000,
    utilities: 2000,
    food: 6000,
    transport: 2000,
    healthcare: 1000,
    other: 3000,
    total: 29000,
  };

  it('displays both country and user currencies when they differ', () => {
    render(
      <SavingsAnalysis
        salaryData={salaryData}
        taxData={taxData}
        expenseData={expenseData}
        countryCurrency="INR"
        userCurrency="USD"
      />
    );
    // Should show INR and USD values for savings and projections
    expect(screen.getByText(/INR75,000/i)).toBeInTheDocument(); // monthly take-home
    expect(screen.getByText(/USD900/i)).toBeInTheDocument();
    expect(screen.getByText(/INR29,000/i)).toBeInTheDocument(); // monthly expenses
    expect(screen.getByText(/USD348/i)).toBeInTheDocument();
    expect(screen.getByText(/INR46,000/i)).toBeInTheDocument(); // monthly savings
    expect(screen.getByText(/USD552/i)).toBeInTheDocument();
    expect(screen.getByText(/INR552,000/i)).toBeInTheDocument(); // annual savings
    expect(screen.getByText(/USD6,624/i)).toBeInTheDocument();
  });

  it('displays only one currency when country and user currencies match', () => {
    render(
      <SavingsAnalysis
        salaryData={salaryData}
        taxData={taxData}
        expenseData={expenseData}
        countryCurrency="INR"
        userCurrency="INR"
      />
    );
    expect(screen.getByText(/INR75,000/i)).toBeInTheDocument();
    expect(screen.queryByText(/USD900/i)).not.toBeInTheDocument();
    expect(screen.getByText(/INR29,000/i)).toBeInTheDocument();
    expect(screen.queryByText(/USD348/i)).not.toBeInTheDocument();
    expect(screen.getByText(/INR46,000/i)).toBeInTheDocument();
    expect(screen.queryByText(/USD552/i)).not.toBeInTheDocument();
    expect(screen.getByText(/INR552,000/i)).toBeInTheDocument();
    expect(screen.queryByText(/USD6,624/i)).not.toBeInTheDocument();
  });
}); 