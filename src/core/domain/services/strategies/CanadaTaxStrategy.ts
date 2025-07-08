import { TaxCalculationStrategy } from '../TaxCalculationStrategy';
import { TaxData } from '@/shared/types/domain.types';

/**
 * Canada Tax Calculation Strategy
 * 
 * Implements tax calculation for Canada including
 * federal and provincial income tax.
 */
export class CanadaTaxStrategy implements TaxCalculationStrategy {
  private readonly federalTaxBrackets = [
    { minIncome: 0, maxIncome: 53359, rate: 0.15, description: '15%' },
    { minIncome: 53360, maxIncome: 106717, rate: 0.205, description: '20.5%' },
    { minIncome: 106718, maxIncome: 165430, rate: 0.26, description: '26%' },
    { minIncome: 165431, maxIncome: 235675, rate: 0.29, description: '29%' },
    { minIncome: 235676, maxIncome: Infinity, rate: 0.33, description: '33%' },
  ];

  private readonly cppRate = 0.0595; // 5.95% for employee
  private readonly cppLimit = 66800; // 2024 limit
  private readonly eiRate = 0.0163; // 1.63% for employee
  private readonly eiLimit = 63100; // 2024 limit

  async calculateTax(
    salary: number,
    currency: string,
    additionalParams?: Record<string, unknown>
  ): Promise<TaxData> {
    const province = additionalParams?.province || 'ON';
    const provincialTaxRate = this.getProvincialTaxRate(province);

    // Calculate federal tax
    const federalTax = this.calculateFederalTax(salary);

    // Calculate provincial tax
    const provincialTax = salary * provincialTaxRate;

    // Calculate CPP
    const cpp = Math.min(salary, this.cppLimit) * this.cppRate;

    // Calculate EI
    const ei = Math.min(salary, this.eiLimit) * this.eiRate;

    const totalTax = federalTax + provincialTax + cpp + ei;
    const marginalRate = this.getMarginalRate(salary);

    return {
      federalTax,
      stateTax: provincialTax, // Using stateTax field for provincial tax
      localTax: 0,
      socialSecurity: cpp + ei, // Combining CPP and EI
      medicare: 0,
      otherDeductions: 0,
      totalTax,
      marginalRate,
      effectiveRate: totalTax / salary,
      additionalInfo: `Calculated for province: ${province}`,
    };
  }

  getCountryCode(): string {
    return 'CA';
  }

  getCountryName(): string {
    return 'Canada';
  }

  validateInput(
    salary: number,
    currency: string,
    additionalParams?: Record<string, unknown>
  ): boolean {
    return salary > 0 && currency === 'CAD';
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
        name: 'RRSP',
        description: 'Registered Retirement Savings Plan',
        maxAmount: 29210,
        type: 'fixed',
      },
      {
        name: 'TFSA',
        description: 'Tax-Free Savings Account',
        maxAmount: 7000,
        type: 'fixed',
      },
      {
        name: 'CPP',
        description: 'Canada Pension Plan',
        maxAmount: 66800,
        type: 'fixed',
      },
    ];
  }

  private calculateFederalTax(salary: number): number {
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

  private getProvincialTaxRate(province: string): number {
    const provincialRates: Record<string, number> = {
      'ON': 0.1197, // Ontario
      'BC': 0.1205, // British Columbia
      'AB': 0.10,   // Alberta
      'QC': 0.1475, // Quebec
      'NS': 0.14,   // Nova Scotia
      'NB': 0.14,   // New Brunswick
      'MB': 0.108,  // Manitoba
      'SK': 0.105,  // Saskatchewan
      'PE': 0.1375, // Prince Edward Island
      'NL': 0.13,   // Newfoundland and Labrador
      'NT': 0.119,  // Northwest Territories
      'NU': 0.04,   // Nunavut
      'YT': 0.064,  // Yukon
    };

    return provincialRates[province] || 0.10; // Default 10%
  }

  private getMarginalRate(salary: number): number {
    for (const bracket of this.federalTaxBrackets) {
      if (salary <= bracket.maxIncome) {
        return bracket.rate;
      }
    }
    return this.federalTaxBrackets[this.federalTaxBrackets.length - 1].rate;
  }
} 