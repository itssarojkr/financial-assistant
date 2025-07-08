import { TaxCalculationStrategy } from '../TaxCalculationStrategy';
import { TaxData } from '@/shared/types/domain.types';

/**
 * Australia Tax Calculation Strategy
 * 
 * Implements tax calculation for Australia including
 * income tax, Medicare levy, and superannuation.
 */
export class AustraliaTaxStrategy implements TaxCalculationStrategy {
  private readonly taxBrackets = [
    { minIncome: 0, maxIncome: 18200, rate: 0, description: 'Tax-free threshold' },
    { minIncome: 18201, maxIncome: 45000, rate: 0.19, description: '19%' },
    { minIncome: 45001, maxIncome: 120000, rate: 0.325, description: '32.5%' },
    { minIncome: 120001, maxIncome: 180000, rate: 0.37, description: '37%' },
    { minIncome: 180001, maxIncome: Infinity, rate: 0.45, description: '45%' },
  ];

  private readonly medicareLevyRate = 0.02; // 2%
  private readonly medicareLevySurchargeRate = 0.015; // 1.5% for high earners without private health
  private readonly superannuationRate = 0.105; // 10.5% (2024/25)

  async calculateTax(
    salary: number,
    currency: string,
    additionalParams?: Record<string, unknown>
  ): Promise<TaxData> {
    const hasPrivateHealth = additionalParams?.hasPrivateHealth || false;
    const includeSuper = additionalParams?.includeSuper || false;

    // Calculate income tax
    const incomeTax = this.calculateIncomeTax(salary);

    // Calculate Medicare levy
    const medicareLevy = salary * this.medicareLevyRate;

    // Calculate Medicare levy surcharge (if applicable)
    const medicareLevySurcharge = this.calculateMedicareLevySurcharge(salary, hasPrivateHealth);

    // Calculate superannuation
    const superannuation = includeSuper ? salary * this.superannuationRate : 0;

    const totalTax = incomeTax + medicareLevy + medicareLevySurcharge;
    const marginalRate = this.getMarginalRate(salary);

    return {
      federalTax: incomeTax,
      stateTax: medicareLevy + medicareLevySurcharge, // Using stateTax for Medicare
      localTax: 0,
      socialSecurity: superannuation, // Using socialSecurity for superannuation
      medicare: 0,
      otherDeductions: 0,
      totalTax,
      marginalRate,
      effectiveRate: totalTax / salary,
      additionalInfo: `Calculated with ${hasPrivateHealth ? 'private health insurance' : 'no private health insurance'}${includeSuper ? ' including superannuation' : ''}`,
    };
  }

  getCountryCode(): string {
    return 'AU';
  }

  getCountryName(): string {
    return 'Australia';
  }

  validateInput(
    salary: number,
    currency: string,
    additionalParams?: Record<string, unknown>
  ): boolean {
    return salary > 0 && currency === 'AUD';
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
        name: 'Superannuation',
        description: 'Concessional contributions to super',
        maxAmount: 27500,
        type: 'fixed',
      },
      {
        name: 'Work-related Expenses',
        description: 'Deductible work-related expenses',
        maxAmount: 0,
        type: 'percentage',
      },
      {
        name: 'Charitable Donations',
        description: 'Tax-deductible donations',
        maxAmount: 0,
        type: 'percentage',
      },
    ];
  }

  private calculateIncomeTax(salary: number): number {
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

  private calculateMedicareLevySurcharge(salary: number, hasPrivateHealth: boolean): number {
    if (hasPrivateHealth) {
      return 0;
    }

    const thresholds = {
      single: 90000,
      family: 180000,
    };

    const rates = {
      tier1: 0.01, // 1% for $90,000 - $105,000 (single) or $180,000 - $210,000 (family)
      tier2: 0.0125, // 1.25% for $105,000 - $140,000 (single) or $210,000 - $280,000 (family)
      tier3: 0.015, // 1.5% for $140,000+ (single) or $280,000+ (family)
    };

    // Simplified calculation - assuming single taxpayer
    if (salary <= thresholds.single) {
      return 0;
    } else if (salary <= 105000) {
      return (salary - thresholds.single) * rates.tier1;
    } else if (salary <= 140000) {
      return (105000 - thresholds.single) * rates.tier1 + (salary - 105000) * rates.tier2;
    } else {
      return (105000 - thresholds.single) * rates.tier1 + (140000 - 105000) * rates.tier2 + (salary - 140000) * rates.tier3;
    }
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