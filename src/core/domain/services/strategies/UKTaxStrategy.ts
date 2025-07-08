import { TaxCalculationStrategy } from '../TaxCalculationStrategy';
import { TaxData } from '@/shared/types/domain.types';

/**
 * UK Tax Calculation Strategy
 * 
 * Implements tax calculation for the United Kingdom including
 * income tax, national insurance, and student loan repayments.
 */
export class UKTaxStrategy implements TaxCalculationStrategy {
  private readonly taxBrackets = [
    { minIncome: 0, maxIncome: 12570, rate: 0, description: 'Personal Allowance' },
    { minIncome: 12571, maxIncome: 50270, rate: 0.20, description: 'Basic Rate (20%)' },
    { minIncome: 50271, maxIncome: 125140, rate: 0.40, description: 'Higher Rate (40%)' },
    { minIncome: 125141, maxIncome: Infinity, rate: 0.45, description: 'Additional Rate (45%)' },
  ];

  private readonly niBrackets = [
    { minIncome: 0, maxIncome: 12570, rate: 0, description: 'No NI' },
    { minIncome: 12571, maxIncome: 50270, rate: 0.12, description: 'NI Rate (12%)' },
    { minIncome: 50271, maxIncome: Infinity, rate: 0.02, description: 'NI Rate (2%)' },
  ];

  async calculateTax(
    salary: number,
    currency: string,
    additionalParams?: Record<string, unknown>
  ): Promise<TaxData> {
    const studentLoanPlan = additionalParams?.studentLoanPlan || 'none';
    const isScotland = additionalParams?.isScotland || false;

    // Calculate income tax
    const incomeTax = this.calculateIncomeTax(salary, isScotland);

    // Calculate national insurance
    const nationalInsurance = this.calculateNationalInsurance(salary);

    // Calculate student loan repayment
    const studentLoanRepayment = this.calculateStudentLoanRepayment(salary, studentLoanPlan);

    const totalTax = incomeTax + nationalInsurance + studentLoanRepayment;
    const marginalRate = this.getMarginalRate(salary, isScotland);

    return {
      federalTax: incomeTax, // Using federalTax for income tax
      stateTax: nationalInsurance, // Using stateTax for NI
      localTax: 0,
      socialSecurity: 0,
      medicare: studentLoanRepayment, // Using medicare for student loan
      otherDeductions: 0,
      totalTax,
      marginalRate,
      effectiveRate: totalTax / salary,
      additionalInfo: `Calculated for ${isScotland ? 'Scotland' : 'England/Wales/NI'} with ${studentLoanPlan} student loan plan`,
    };
  }

  getCountryCode(): string {
    return 'UK';
  }

  getCountryName(): string {
    return 'United Kingdom';
  }

  validateInput(
    salary: number,
    currency: string,
    additionalParams?: Record<string, unknown>
  ): boolean {
    return salary > 0 && currency === 'GBP';
  }

  getTaxBrackets(): Array<{
    minIncome: number;
    maxIncome: number;
    rate: number;
    description: string;
  }> {
    return this.taxBrackets;
  }

  getAvailableDeductions(): Array<{
    name: string;
    description: string;
    maxAmount: number;
    type: 'percentage' | 'fixed';
  }> {
    return [
      {
        name: 'Pension Contributions',
        description: 'Workplace or personal pension contributions',
        maxAmount: 40000,
        type: 'fixed',
      },
      {
        name: 'ISA',
        description: 'Individual Savings Account',
        maxAmount: 20000,
        type: 'fixed',
      },
      {
        name: 'Charitable Donations',
        description: 'Gift Aid donations',
        maxAmount: 0,
        type: 'percentage',
      },
    ];
  }

  private calculateIncomeTax(salary: number, isScotland: boolean): number {
    if (isScotland) {
      // Scotland has different tax rates
      return this.calculateScottishIncomeTax(salary);
    }

    let tax = 0;
    let remainingIncome = salary;

    for (const bracket of this.taxBrackets) {
      if (remainingIncome <= 0) break;

      const taxableInBracket = Math.min(
        remainingIncome,
        bracket.maxIncome - bracket.minIncome + 1
      );

      tax += taxableInBracket * bracket.rate;
      remainingIncome -= taxableInBracket;
    }

    return tax;
  }

  private calculateScottishIncomeTax(salary: number): number {
    // Scottish tax rates (2024/25)
    const scottishBrackets = [
      { minIncome: 0, maxIncome: 12570, rate: 0, description: 'Personal Allowance' },
      { minIncome: 12571, maxIncome: 14732, rate: 0.19, description: 'Starter Rate (19%)' },
      { minIncome: 14733, maxIncome: 25688, rate: 0.20, description: 'Basic Rate (20%)' },
      { minIncome: 25689, maxIncome: 43662, rate: 0.21, description: 'Intermediate Rate (21%)' },
      { minIncome: 43663, maxIncome: 125140, rate: 0.42, description: 'Higher Rate (42%)' },
      { minIncome: 125141, maxIncome: Infinity, rate: 0.47, description: 'Top Rate (47%)' },
    ];

    let tax = 0;
    let remainingIncome = salary;

    for (const bracket of scottishBrackets) {
      if (remainingIncome <= 0) break;

      const taxableInBracket = Math.min(
        remainingIncome,
        bracket.maxIncome - bracket.minIncome + 1
      );

      tax += taxableInBracket * bracket.rate;
      remainingIncome -= taxableInBracket;
    }

    return tax;
  }

  private calculateNationalInsurance(salary: number): number {
    let ni = 0;
    let remainingIncome = salary;

    for (const bracket of this.niBrackets) {
      if (remainingIncome <= 0) break;

      const taxableInBracket = Math.min(
        remainingIncome,
        bracket.maxIncome - bracket.minIncome + 1
      );

      ni += taxableInBracket * bracket.rate;
      remainingIncome -= taxableInBracket;
    }

    return ni;
  }

  private calculateStudentLoanRepayment(salary: number, plan: string): number {
    const thresholds = {
      'plan1': 22015,
      'plan2': 27295,
      'plan4': 27660,
      'plan5': 25000,
      'none': Infinity,
    };

    const rates = {
      'plan1': 0.09,
      'plan2': 0.09,
      'plan4': 0.09,
      'plan5': 0.09,
      'none': 0,
    };

    const threshold = thresholds[plan as keyof typeof thresholds] || Infinity;
    const rate = rates[plan as keyof typeof rates] || 0;

    if (salary <= threshold) {
      return 0;
    }

    return (salary - threshold) * rate;
  }

  private getMarginalRate(salary: number, isScotland: boolean): number {
    if (isScotland) {
      const scottishBrackets = [
        { maxIncome: 12570, rate: 0 },
        { maxIncome: 14732, rate: 0.19 },
        { maxIncome: 25688, rate: 0.20 },
        { maxIncome: 43662, rate: 0.21 },
        { maxIncome: 125140, rate: 0.42 },
        { maxIncome: Infinity, rate: 0.47 },
      ];

      for (const bracket of scottishBrackets) {
        if (salary <= bracket.maxIncome) {
          return bracket.rate;
        }
      }
      return scottishBrackets[scottishBrackets.length - 1].rate;
    }

    for (const bracket of this.taxBrackets) {
      if (salary <= bracket.maxIncome) {
        return bracket.rate;
      }
    }
    return this.taxBrackets[this.taxBrackets.length - 1].rate;
  }
} 