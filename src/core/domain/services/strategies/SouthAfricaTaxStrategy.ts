import { TaxCalculationStrategy } from '../TaxCalculationStrategy';
import { TaxData } from '@/shared/types/domain.types';

/**
 * South Africa Tax Calculation Strategy
 * 
 * Implements tax calculation for South Africa including
 * income tax and other deductions.
 */
export class SouthAfricaTaxStrategy implements TaxCalculationStrategy {
  private readonly taxBrackets = [
    { minIncome: 0, maxIncome: 237100, rate: 0.18, description: '18%' },
    { minIncome: 237101, maxIncome: 370500, rate: 0.26, description: '26%' },
    { minIncome: 370501, maxIncome: 512800, rate: 0.31, description: '31%' },
    { minIncome: 512801, maxIncome: 673000, rate: 0.36, description: '36%' },
    { minIncome: 673001, maxIncome: 857900, rate: 0.39, description: '39%' },
    { minIncome: 857901, maxIncome: 1817000, rate: 0.41, description: '41%' },
    { minIncome: 1817001, maxIncome: Infinity, rate: 0.45, description: '45%' },
  ];

  private readonly uifRate = 0.01; // 1% (Unemployment Insurance Fund)
  private readonly uifLimit = 17712; // Monthly limit

  async calculateTax(
    salary: number,
    currency: string,
    additionalParams?: Record<string, unknown>
  ): Promise<TaxData> {
    const age = additionalParams?.age || 30;
    const hasMedicalAid = additionalParams?.hasMedicalAid || false;

    // Calculate income tax
    const incomeTax = this.calculateIncomeTax(salary, age);

    // Calculate UIF
    const uif = Math.min(salary, this.uifLimit) * this.uifRate;

    // Calculate medical aid tax credit (if applicable)
    const medicalAidCredit = hasMedicalAid ? this.calculateMedicalAidCredit() : 0;

    // Calculate other deductions
    const otherDeductions = this.calculateOtherDeductions(salary);

    const totalTax = incomeTax + uif - medicalAidCredit + otherDeductions;
    const marginalRate = this.getMarginalRate(salary);

    return {
      federalTax: incomeTax,
      stateTax: uif, // Using stateTax for UIF
      localTax: 0,
      socialSecurity: 0,
      medicare: medicalAidCredit, // Using medicare for medical aid credit
      otherDeductions,
      totalTax,
      marginalRate,
      effectiveRate: totalTax / salary,
      additionalInfo: `Calculated for age ${age}${hasMedicalAid ? ' with medical aid' : ''}`,
    };
  }

  getCountryCode(): string {
    return 'ZA';
  }

  getCountryName(): string {
    return 'South Africa';
  }

  validateInput(
    salary: number,
    currency: string,
    additionalParams?: Record<string, unknown>
  ): boolean {
    return salary > 0 && currency === 'ZAR';
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
        name: 'Retirement Annuity',
        description: 'Retirement annuity contributions',
        maxAmount: 350000,
        type: 'fixed',
      },
      {
        name: 'Tax-Free Savings',
        description: 'Tax-free savings account',
        maxAmount: 36000,
        type: 'fixed',
      },
      {
        name: 'Medical Expenses',
        description: 'Medical expense deductions',
        maxAmount: 0,
        type: 'percentage',
      },
    ];
  }

  private calculateIncomeTax(salary: number, age: number): number {
    // Calculate primary rebate based on age
    const primaryRebate = this.getPrimaryRebate(age);

    // Calculate tax with progressive rates
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

    // Apply primary rebate
    return Math.max(0, tax - primaryRebate);
  }

  private getPrimaryRebate(age: number): number {
    if (age < 65) {
      return 17235; // 2024/25 primary rebate
    } else if (age < 75) {
      return 9444; // Additional rebate for 65-74
    } else {
      return 3147; // Additional rebate for 75+
    }
  }

  private calculateMedicalAidCredit(): number {
    // Medical aid tax credit (2024/25)
    return 364; // Monthly credit for first member
  }

  private calculateOtherDeductions(salary: number): number {
    // Other potential deductions
    const travelAllowance = salary * 0.02; // 2% travel allowance
    return travelAllowance;
  }

  private getMarginalRate(salary: number): number {
    for (const bracket of this.taxBrackets) {
      if (salary <= bracket.maxIncome) {
        return bracket.rate;
      }
    }
    return this.taxBrackets[this.taxBrackets.length - 1].rate;
  }
} 