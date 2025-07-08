import React from 'react';
import { render, screen } from '@/test/utils/test-utils';
import LivingExpenses from '@/components/LivingExpenses';
import { vi } from 'vitest';

describe('LivingExpenses (Dual-Currency)', () => {
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
  const expenseData = {
    rent: 15000,
    utilities: 2000,
    food: 6000,
    transport: 2000,
    healthcare: 1000,
    other: 3000,
    total: 29000,
  };
  const setExpenseData = vi.fn();

  it('displays both country and user currencies when they differ', () => {
    render(
      <LivingExpenses
        salaryData={salaryData}
        expenseData={expenseData}
        setExpenseData={setExpenseData}
        countryCurrency="INR"
        userCurrency="USD"
      />
    );
    // Should show INR and USD values for each expense
    expect(screen.getByText(/INR15,000/i)).toBeInTheDocument();
    expect(screen.getByText(/USD180/i)).toBeInTheDocument();
    expect(screen.getByText(/INR2,000/i)).toBeInTheDocument();
    expect(screen.getByText(/USD24/i)).toBeInTheDocument();
    expect(screen.getByText(/INR6,000/i)).toBeInTheDocument();
    expect(screen.getByText(/USD72/i)).toBeInTheDocument();
    expect(screen.getByText(/INR29,000/i)).toBeInTheDocument();
    expect(screen.getByText(/USD348/i)).toBeInTheDocument();
  });

  it('displays only one currency when country and user currencies match', () => {
    render(
      <LivingExpenses
        salaryData={salaryData}
        expenseData={expenseData}
        setExpenseData={setExpenseData}
        countryCurrency="INR"
        userCurrency="INR"
      />
    );
    expect(screen.getByText(/INR15,000/i)).toBeInTheDocument();
    expect(screen.queryByText(/USD180/i)).not.toBeInTheDocument();
    expect(screen.getByText(/INR2,000/i)).toBeInTheDocument();
    expect(screen.queryByText(/USD24/i)).not.toBeInTheDocument();
    expect(screen.getByText(/INR6,000/i)).toBeInTheDocument();
    expect(screen.queryByText(/USD72/i)).not.toBeInTheDocument();
    expect(screen.getByText(/INR29,000/i)).toBeInTheDocument();
    expect(screen.queryByText(/USD348/i)).not.toBeInTheDocument();
  });
}); 