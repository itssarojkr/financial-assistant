import { TaxCalculationStrategy } from '../TaxCalculationStrategy';
import { TaxData } from '@/shared/types/domain.types';

/**
 * India Tax Calculation Strategy
 * 
 * Implements tax calculation for India including
 * both old and new tax regimes.
 */
export class IndiaTaxStrategy implements TaxCalculationStrategy {
  // Old Tax Regime (2024-25)
  private readonly oldTaxBrackets = [
    { minIncome: 0, maxIncome: 300000, rate: 0, description: '0%' },
    { minIncome: 300001, maxIncome: 600000, rate: 0.05, description: '5%' },
    { minIncome: 600001, maxIncome: 900000, rate: 0.10, description: '10%' },
    { minIncome: 900001, maxIncome: 1200000, rate: 0.15, description: '15%' },
    { minIncome: 1200001, maxIncome: 1500000, rate: 0.20, description: '20%' },
    { minIncome: 1500001, maxIncome: Infinity, rate: 0.30, description: '30%' },
  ];

  // New Tax Regime (2024-25)
  private readonly newTaxBrackets = [
    { minIncome: 0, maxIncome: 300000, rate: 0, description: '0%' },
    { minIncome: 300001, maxIncome: 600000, rate: 0.05, description: '5%' },
    { minIncome: 600001, maxIncome: 900000, rate: 0.10, description: '10%' },
    { minIncome: 900001, maxIncome: 1200000, rate: 0.15, description: '15%' },
    { minIncome: 1200001, maxIncome: 1500000, rate: 0.20, description: '20%' },
    { minIncome: 1500001, maxIncome: Infinity, rate: 0.30, description: '30%' },
  ];

  private readonly cessRate = 0.04; // 4% health and education cess

  async calculateTax(
    salary: number,
    currency: string,
    additionalParams?: Record<string, unknown>
  ): Promise<TaxData> {
    const regime = additionalParams?.regime || 'new'; // 'old' or 'new'
    const age = additionalParams?.age || 30;
    const hasHRA = additionalParams?.hasHRA || false;
    const hasLTA = additionalParams?.hasLTA || false;

    // Calculate basic tax
    const basicTax = this.calculateBasicTax(salary, regime);

    // Calculate cess
    const cess = basicTax * this.cessRate;

    // Calculate surcharge (if applicable)
    const surcharge = this.calculateSurcharge(salary, basicTax);

    // Calculate total tax
    const totalTax = basicTax + cess + surcharge;

    // Calculate deductions (only for old regime)
    const deductions = regime === 'old' ? this.calculateDeductions(salary, hasHRA, hasLTA) : 0;

    const finalTax = Math.max(0, totalTax - deductions);
    const marginalRate = this.getMarginalRate(salary, regime);

    return {
      federalTax: finalTax,
      stateTax: 0, // No state income tax in India
      localTax: 0,
      socialSecurity: 0,
      medicare: 0,
      otherDeductions: deductions,
      totalTax: finalTax,
      marginalRate,
      effectiveRate: finalTax / salary,
      additionalInfo: `Calculated using ${regime} tax regime for age ${age}`,
    };
  }

  getCountryCode(): string {
    return 'IN';
  }

  getCountryName(): string {
    return 'India';
  }

  validateInput(
    salary: number,
    currency: string,
    additionalParams?: Record<string, unknown>
  ): boolean {
    return salary > 0 && currency === 'INR';
  }

  getTaxBrackets(): Array<{
    minIncome: number;
    maxIncome: number;
    rate: number;
    description: string;
  }> {
    return this.newTaxBrackets; // Default to new regime
  }

  getAvailableDeductions(): Array<{
    name: string;
    description: string;
    maxAmount: number;
    type: 'percentage' | 'fixed';
  }> {
    return [
      {
        name: 'Section 80C',
        description: 'ELSS, PPF, EPF, etc.',
        maxAmount: 150000,
        type: 'fixed',
      },
      {
        name: 'Section 80D',
        description: 'Health insurance premium',
        maxAmount: 25000,
        type: 'fixed',
      },
      {
        name: 'Section 80TTA',
        description: 'Interest on savings account',
        maxAmount: 10000,
        type: 'fixed',
      },
    ];
  }

  private calculateBasicTax(salary: number, regime: string): number {
    const brackets = regime === 'old' ? this.oldTaxBrackets : this.newTaxBrackets;
    
    let tax = 0;
    let remainingIncome = salary;

    for (const bracket of brackets) {
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

  private calculateSurcharge(salary: number, basicTax: number): number {
    if (salary <= 5000000) {
      return 0;
    } else if (salary <= 10000000) {
      return basicTax * 0.10; // 10% surcharge
    } else if (salary <= 20000000) {
      return basicTax * 0.15; // 15% surcharge
    } else if (salary <= 50000000) {
      return basicTax * 0.25; // 25% surcharge
    } else {
      return basicTax * 0.37; // 37% surcharge
    }
  }

  private calculateDeductions(salary: number, hasHRA: boolean, hasLTA: boolean): number {
    let totalDeductions = 0;

    // Standard deduction
    totalDeductions += 50000;

    // HRA (if applicable)
    if (hasHRA) {
      totalDeductions += Math.min(salary * 0.4, 120000); // 40% of basic salary, max 1.2L
    }

    // LTA (if applicable)
    if (hasLTA) {
      totalDeductions += 20000; // LTA exemption
    }

    // Section 80C (simplified)
    totalDeductions += Math.min(salary * 0.3, 150000); // 30% of salary, max 1.5L

    return totalDeductions;
  }

  private getMarginalRate(salary: number, regime: string): number {
    const brackets = regime === 'old' ? this.oldTaxBrackets : this.newTaxBrackets;
    
    for (const bracket of brackets) {
      if (salary <= bracket.maxIncome) {
        return bracket.rate;
      }
    }
    return brackets[brackets.length - 1].rate;
  }
} 