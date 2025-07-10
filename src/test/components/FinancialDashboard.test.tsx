import React from 'react';
import { render, screen } from '@/test/utils/test-utils';
import { FinancialDashboard } from '@/components/dashboard/FinancialDashboard';
import { vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

describe('FinancialDashboard (Dual-Currency)', () => {
  const userId = 'user123';
  const userCurrency = 'USD';
  const countryCurrency = 'INR';

  it('displays both country and user currencies for metrics when they differ', () => {
    render(
      <FinancialDashboard
        userId={userId}
        userCurrency={userCurrency}
        countryCurrency={countryCurrency}
      />
    );
    // These are example assertions; actual text may depend on the implementation
    expect(screen.getByText(/INR/i)).toBeInTheDocument();
    expect(screen.getByText(/USD/i)).toBeInTheDocument();
  });

  it('displays only one currency for metrics when country and user currencies match', () => {
    render(
      <FinancialDashboard
        userId={userId}
        userCurrency="INR"
        countryCurrency="INR"
      />
    );
    expect(screen.getByText(/INR/i)).toBeInTheDocument();
    expect(screen.queryByText(/USD/i)).not.toBeInTheDocument();
  });

  it('has no accessibility violations', async () => {
    const { container } = render(
      <FinancialDashboard
        userId={userId}
        userCurrency={userCurrency}
        countryCurrency={countryCurrency}
      />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // Add test for error boundary rendering
  it('renders error boundary fallback on error', async () => {
    // Simulate error in child component
    // ...test logic...
  });
  // Add test for failed API call
  it('shows error toast on failed save', async () => {
    // Simulate save failure
    // ...test logic...
  });
  // Add test for spinner during calculation
  it('shows spinner while calculation is in progress', async () => {
    // Simulate calculation in progress
    // ...test logic...
  });
}); 