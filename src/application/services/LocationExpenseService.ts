import { supabase } from '../../integrations/supabase/client';
import type { Database } from '../../integrations/supabase/types';
import { SpendingHabit, CalculatedExpense, ExpenseBreakdown, SpendingHabitResult } from '../../shared/types/expense.types';

type LocationExpense = Database['public']['Tables']['location_expenses']['Row'];

export class LocationExpenseService {
  private static instance: LocationExpenseService;

  private constructor() {}

  static getInstance(): LocationExpenseService {
    if (!LocationExpenseService.instance) {
      LocationExpenseService.instance = new LocationExpenseService();
    }
    return LocationExpenseService.instance;
  }

  /**
   * Get location expenses for a specific location
   * Falls back to country-level if state/city not found
   */
  async getLocationExpenses(
    countryCode: string,
    stateCode?: string,
    cityCode?: string
  ): Promise<LocationExpense[]> {
    try {
      console.log('Fetching location expenses:', { countryCode, stateCode, cityCode });

      // First try to get city-level expenses
      if (cityCode && stateCode) {
        const { data: cityData, error: cityError } = await supabase
          .from('location_expenses')
          .select('*')
          .eq('country_code', countryCode)
          .eq('state_code', stateCode)
          .eq('city_code', cityCode);

        if (!cityError && cityData && cityData.length > 0) {
          console.log('Found city-level expenses:', cityData.length);
          return cityData;
        }
      }

      // Try state-level expenses
      if (stateCode) {
        const { data: stateData, error: stateError } = await supabase
          .from('location_expenses')
          .select('*')
          .eq('country_code', countryCode)
          .eq('state_code', stateCode)
          .is('city_code', null);

        if (!stateError && stateData && stateData.length > 0) {
          console.log('Found state-level expenses:', stateData.length);
          return stateData;
        }
      }

      // Fall back to country-level expenses
      const { data: countryData, error: countryError } = await supabase
        .from('location_expenses')
        .select('*')
        .eq('country_code', countryCode)
        .is('state_code', null)
        .is('city_code', null);

      if (countryError) {
        console.error('Error fetching country expenses:', countryError);
        throw new Error('Failed to fetch location expenses');
      }

      console.log('Found country-level expenses:', countryData?.length || 0);
      return countryData || [];
    } catch (error) {
      console.error('Error in getLocationExpenses:', error);
      throw error;
    }
  }

  /**
   * Get default spending habits
   */
  getDefaultSpendingHabits(): SpendingHabit[] {
    return [
      {
        name: 'Conservative',
        type: 'conservative',
        fixed_expense_reduction: 0.10, // 10% reduction on fixed expenses
        flexible_expense_reduction: 0.50, // 50% reduction on flexible expenses
        flexible_expense_increase: 0.0,
        description: 'Minimal spending, maximum savings'
      },
      {
        name: 'Moderate',
        type: 'moderate',
        fixed_expense_reduction: 0.05, // 5% reduction on fixed expenses
        flexible_expense_reduction: 0.25, // 25% reduction on flexible expenses
        flexible_expense_increase: 0.0,
        description: 'Balanced spending and savings'
      },
      {
        name: 'Liberal',
        type: 'liberal',
        fixed_expense_reduction: 0.0, // No reduction on fixed expenses
        flexible_expense_reduction: 0.0, // No reduction on flexible expenses
        flexible_expense_increase: 0.20, // 20% increase on flexible expenses
        description: 'Comfortable lifestyle, moderate savings'
      }
    ];
  }

  /**
   * Calculate expenses based on location and spending habit
   */
  calculateExpenses(
    locationExpenses: LocationExpense[],
    habit: SpendingHabit,
    grossSalary: number
  ): SpendingHabitResult {
    const breakdown: CalculatedExpense[] = [];
    let totalExpenses = 0;
    let totalSavingsPotential = 0;

    // Process each expense type
    for (const expense of locationExpenses) {
      let adjustedAmount = expense.estimated_amount;
      let savingsPotential = 0;

      if (expense.is_flexible) {
        // Apply flexible expense adjustments
        if (habit.flexible_expense_reduction > 0) {
          const reduction = expense.estimated_amount * habit.flexible_expense_reduction;
          adjustedAmount -= reduction;
          savingsPotential += reduction;
        } else if (habit.flexible_expense_increase > 0) {
          const increase = expense.estimated_amount * habit.flexible_expense_increase;
          adjustedAmount += increase;
          savingsPotential -= increase; // Negative savings
        }
      } else {
        // Apply fixed expense adjustments
        if (habit.fixed_expense_reduction > 0) {
          const reduction = expense.estimated_amount * habit.fixed_expense_reduction;
          adjustedAmount -= reduction;
          savingsPotential += reduction;
        }
      }

      // Ensure adjusted amount doesn't go below reduction potential
      const minAmount = expense.estimated_amount * (1 - expense.reduction_potential);
      adjustedAmount = Math.max(adjustedAmount, minAmount);

      breakdown.push({
        type: expense.expense_type,
        base_amount: expense.estimated_amount,
        adjusted_amount: adjustedAmount,
        currency: expense.currency,
        is_flexible: expense.is_flexible,
        reduction_potential: expense.reduction_potential,
        savings_potential: savingsPotential,
        description: expense.description || ''
      });

      totalExpenses += adjustedAmount;
      totalSavingsPotential += savingsPotential;
    }

    // Create expense breakdown object
    const expenses: ExpenseBreakdown = {
      housing: breakdown.find(e => e.type === 'housing')?.adjusted_amount || 0,
      food: breakdown.find(e => e.type === 'food')?.adjusted_amount || 0,
      transport: breakdown.find(e => e.type === 'transport')?.adjusted_amount || 0,
      utilities: breakdown.find(e => e.type === 'utilities')?.adjusted_amount || 0,
      healthcare: breakdown.find(e => e.type === 'healthcare')?.adjusted_amount || 0,
      entertainment: breakdown.find(e => e.type === 'entertainment')?.adjusted_amount || 0,
      other: breakdown.find(e => e.type === 'other')?.adjusted_amount || 0,
      total: totalExpenses,
      currency: locationExpenses[0]?.currency || 'USD',
      savings_potential: totalSavingsPotential,
      breakdown
    };

    const monthlySavings = grossSalary - totalExpenses;
    const annualSavings = monthlySavings * 12;
    const savingsRate = grossSalary > 0 ? (monthlySavings / grossSalary) * 100 : 0;

    return {
      habit,
      expenses,
      total_savings: totalSavingsPotential,
      monthly_savings: monthlySavings,
      annual_savings: annualSavings,
      savings_rate: savingsRate
    };
  }

  /**
   * Get currency symbol for a currency code
   */
  getCurrencySymbol(currencyCode: string): string {
    const symbols: Record<string, string> = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'INR': '₹',
      'CAD': 'C$',
      'AUD': 'A$',
      'JPY': '¥',
      'CHF': 'CHF',
      'CNY': '¥',
      'KRW': '₩'
    };
    return symbols[currencyCode] || currencyCode;
  }

  /**
   * Format currency amount
   */
  formatCurrency(amount: number, currency: string): string {
    const symbol = this.getCurrencySymbol(currency);
    return `${symbol}${amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    })}`;
  }
} 