import { TaxCalculationStrategy } from '../TaxCalculationStrategy';
import { TaxData } from '@/shared/types/domain.types';

/**
 * USA Tax Calculation Strategy
 * 
 * Implements tax calculation for the United States including
 * federal income tax, state tax, and social security.
 */
export class USATaxStrategy implements TaxCalculationStrategy {
  private readonly federalTaxBrackets = [
    { minIncome: 0, maxIncome: 11600, rate: 0.10, description: '10%' },
    { minIncome: 11601, maxIncome: 47150, rate: 0.12, description: '12%' },
    { minIncome: 47151, maxIncome: 100525, rate: 0.22, description: '22%' },
    { minIncome: 100526, maxIncome: 191950, rate: 0.24, description: '24%' },
    { minIncome: 191951, maxIncome: 243725, rate: 0.32, description: '32%' },
    { minIncome: 243726, maxIncome: 609350, rate: 0.35, description: '35%' },
    { minIncome: 609351, maxIncome: Infinity, rate: 0.37, description: '37%' },
  ];

  private readonly socialSecurityRate = 0.062; // 6.2% for employee
  private readonly socialSecurityLimit = 168600; // 2024 limit
  private readonly medicareRate = 0.0145; // 1.45% for employee

  async calculateTax(
    salary: number,
    currency: string,
    additionalParams?: Record<string, unknown>
  ): Promise<TaxData> {
    const filingStatus = additionalParams?.filingStatus || 'single';
    const state = additionalParams?.state || 'CA';
    const stateTaxRate = this.getStateTaxRate(state);

    // Calculate federal tax
    const federalTax = this.calculateFederalTax(salary, filingStatus);

    // Calculate state tax
    const stateTax = salary * stateTaxRate;

    // Calculate social security
    const socialSecurity = Math.min(salary, this.socialSecurityLimit) * this.socialSecurityRate;

    // Calculate medicare
    const medicare = salary * this.medicareRate;

    // Calculate additional medicare tax for high earners
    const additionalMedicare = this.calculateAdditionalMedicare(salary, filingStatus);

    const totalTax = federalTax + stateTax + socialSecurity + medicare + additionalMedicare;
    const marginalRate = this.getMarginalRate(salary, filingStatus);

    return {
      federalTax,
      stateTax,
      localTax: 0,
      socialSecurity,
      medicare: medicare + additionalMedicare,
      otherDeductions: 0,
      totalTax,
      marginalRate,
      effectiveRate: totalTax / salary,
      additionalInfo: `Calculated for ${filingStatus} filing status in ${state}`,
    };
  }

  getCountryCode(): string {
    return 'US';
  }

  getCountryName(): string {
    return 'United States';
  }

  validateInput(
    salary: number,
    currency: string,
    additionalParams?: Record<string, unknown>
  ): boolean {
    return salary > 0 && currency === 'USD';
  }

  getTaxBrackets(): Array<{
    minIncome: number;
    maxIncome: number;
    rate: number;
    description: string;
  }> {
    return this.federalTaxBrackets;
  }

  getAvailableDeductions(): Array<{
    name: string;
    description: string;
    maxAmount: number;
    type: 'percentage' | 'fixed';
  }> {
    return [
      {
        name: '401(k)',
        description: 'Traditional 401(k) contribution',
        maxAmount: 22500,
        type: 'fixed',
      },
      {
        name: 'IRA',
        description: 'Traditional IRA contribution',
        maxAmount: 6500,
        type: 'fixed',
      },
      {
        name: 'HSA',
        description: 'Health Savings Account',
        maxAmount: 3850,
        type: 'fixed',
      },
    ];
  }

  private calculateFederalTax(salary: number, filingStatus: string): number {
    // Simplified calculation - in production, this would be more complex
    let tax = 0;
    let remainingIncome = salary;

    for (const bracket of this.federalTaxBrackets) {
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

  private getStateTaxRate(state: string): number {
    const stateRates: Record<string, number> = {
      'CA': 0.075,
      'NY': 0.0685,
      'TX': 0,
      'FL': 0,
      'WA': 0,
      'IL': 0.0495,
      'PA': 0.0307,
      'OH': 0.0399,
      'GA': 0.0575,
      'NC': 0.0499,
    };

    return stateRates[state] || 0.05; // Default 5%
  }

  private calculateAdditionalMedicare(salary: number, filingStatus: string): number {
    const threshold = filingStatus === 'married' ? 250000 : 200000;
    const additionalRate = 0.009; // 0.9%

    if (salary > threshold) {
      return (salary - threshold) * additionalRate;
    }

    return 0;
  }

  private getMarginalRate(salary: number, filingStatus: string): number {
    for (const bracket of this.federalTaxBrackets) {
      if (salary <= bracket.maxIncome) {
        return bracket.rate;
      }
    }
    return this.federalTaxBrackets[this.federalTaxBrackets.length - 1].rate;
  }
} 