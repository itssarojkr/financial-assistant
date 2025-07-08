import { TaxCalculationStrategy } from '../TaxCalculationStrategy';
import { TaxData } from '@/shared/types/domain.types';

/**
 * Germany Tax Calculation Strategy
 * 
 * Implements tax calculation for Germany including
 * income tax, solidarity surcharge, and church tax.
 */
export class GermanyTaxStrategy implements TaxCalculationStrategy {
  private readonly taxBrackets = [
    { minIncome: 0, maxIncome: 10908, rate: 0, description: 'Tax-free threshold' },
    { minIncome: 10909, maxIncome: 62809, rate: 0.42, description: 'Progressive rate up to 42%' },
    { minIncome: 62810, maxIncome: 277825, rate: 0.42, description: '42%' },
    { minIncome: 277826, maxIncome: Infinity, rate: 0.45, description: '45%' },
  ];

  private readonly solidaritySurchargeRate = 0.055; // 5.5%
  private readonly churchTaxRate = 0.09; // 9% (varies by state)

  async calculateTax(
    salary: number,
    currency: string,
    additionalParams?: Record<string, unknown>
  ): Promise<TaxData> {
    const churchTaxRate = additionalParams?.churchTaxRate || this.churchTaxRate;
    const isChurchMember = additionalParams?.isChurchMember || false;
    const age = additionalParams?.age || 30;

    // Calculate income tax (simplified progressive calculation)
    const incomeTax = this.calculateIncomeTax(salary, age);

    // Calculate solidarity surcharge
    const solidaritySurcharge = incomeTax * this.solidaritySurchargeRate;

    // Calculate church tax
    const churchTax = isChurchMember ? incomeTax * churchTaxRate : 0;

    // Calculate social security contributions
    const socialSecurity = this.calculateSocialSecurity(salary);

    const totalTax = incomeTax + solidaritySurcharge + churchTax + socialSecurity;
    const marginalRate = this.getMarginalRate(salary);

    return {
      federalTax: incomeTax,
      stateTax: solidaritySurcharge + churchTax, // Using stateTax for solidarity and church tax
      localTax: 0,
      socialSecurity,
      medicare: 0,
      otherDeductions: 0,
      totalTax,
      marginalRate,
      effectiveRate: totalTax / salary,
      additionalInfo: `Calculated for age ${age}${isChurchMember ? ' with church tax' : ' without church tax'}`,
    };
  }

  getCountryCode(): string {
    return 'DE';
  }

  getCountryName(): string {
    return 'Germany';
  }

  validateInput(
    salary: number,
    currency: string,
    additionalParams?: Record<string, unknown>
  ): boolean {
    return salary > 0 && currency === 'EUR';
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
        name: 'Riester Pension',
        description: 'Riester pension contributions',
        maxAmount: 2100,
        type: 'fixed',
      },
      {
        name: 'Rürup Pension',
        description: 'Rürup pension contributions',
        maxAmount: 25000,
        type: 'fixed',
      },
      {
        name: 'Health Insurance',
        description: 'Private health insurance premiums',
        maxAmount: 0,
        type: 'percentage',
      },
    ];
  }

  private calculateIncomeTax(salary: number, age: number): number {
    // Simplified German tax calculation
    // In reality, German tax calculation is very complex with many factors
    
    if (salary <= 10908) {
      return 0;
    }

    // Progressive tax calculation (simplified)
    let tax = 0;
    const remainingIncome = salary;

    if (remainingIncome <= 62809) {
      // Progressive calculation for lower brackets
      const taxableIncome = remainingIncome - 10908;
      tax = this.calculateProgressiveTax(taxableIncome);
    } else {
      // Higher brackets
      const lowerBracketTax = this.calculateProgressiveTax(62809 - 10908);
      const higherBracketIncome = remainingIncome - 62809;
      
      if (remainingIncome <= 277825) {
        tax = lowerBracketTax + (higherBracketIncome * 0.42);
      } else {
        const middleBracketTax = lowerBracketTax + ((277825 - 62809) * 0.42);
        const topBracketIncome = remainingIncome - 277825;
        tax = middleBracketTax + (topBracketIncome * 0.45);
      }
    }

    return tax;
  }

  private calculateProgressiveTax(taxableIncome: number): number {
    // Simplified progressive calculation
    // This is a rough approximation of the German tax formula
    const x = taxableIncome / 10000;
    const tax = (0.42 * x - 0.42 * Math.pow(x, 0.8)) * 10000;
    return Math.max(0, tax);
  }

  private calculateSocialSecurity(salary: number): number {
    // German social security contributions (simplified)
    const pensionInsurance = salary * 0.093; // 9.3% (employee share)
    const healthInsurance = salary * 0.073; // 7.3% (employee share)
    const unemploymentInsurance = salary * 0.012; // 1.2% (employee share)
    const longTermCareInsurance = salary * 0.0175; // 1.75% (employee share)

    return pensionInsurance + healthInsurance + unemploymentInsurance + longTermCareInsurance;
  }

  private getMarginalRate(salary: number): number {
    if (salary <= 10908) {
      return 0;
    } else if (salary <= 62809) {
      return 0.42; // Simplified - actual rate varies progressively
    } else if (salary <= 277825) {
      return 0.42;
    } else {
      return 0.45;
    }
  }
} 