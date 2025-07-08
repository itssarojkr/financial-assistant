import { TaxCalculationStrategy } from '../TaxCalculationStrategy';
import { TaxData } from '@/shared/types/domain.types';

/**
 * France Tax Calculation Strategy
 * 
 * Implements tax calculation for France including
 * income tax, social security, and other contributions.
 */
export class FranceTaxStrategy implements TaxCalculationStrategy {
  private readonly taxBrackets = [
    { minIncome: 0, maxIncome: 10777, rate: 0, description: '0%' },
    { minIncome: 10778, maxIncome: 27478, rate: 0.11, description: '11%' },
    { minIncome: 27479, maxIncome: 78570, rate: 0.30, description: '30%' },
    { minIncome: 78571, maxIncome: 168994, rate: 0.41, description: '41%' },
    { minIncome: 168995, maxIncome: Infinity, rate: 0.45, description: '45%' },
  ];

  private readonly socialSecurityRate = 0.15; // 15% (simplified)
  private readonly csgRate = 0.092; // 9.2% (Contribution Sociale Généralisée)
  private readonly crdsRate = 0.005; // 0.5% (Contribution au Remboursement de la Dette Sociale)

  async calculateTax(
    salary: number,
    currency: string,
    additionalParams?: Record<string, unknown>
  ): Promise<TaxData> {
    const familySize = additionalParams?.familySize || 1;
    const hasChildren = additionalParams?.hasChildren || false;

    // Calculate income tax
    const incomeTax = this.calculateIncomeTax(salary, familySize);

    // Calculate social security contributions
    const socialSecurity = salary * this.socialSecurityRate;

    // Calculate CSG and CRDS
    const csg = salary * this.csgRate;
    const crds = salary * this.crdsRate;

    // Calculate other contributions
    const otherContributions = this.calculateOtherContributions(salary);

    const totalTax = incomeTax + socialSecurity + csg + crds + otherContributions;
    const marginalRate = this.getMarginalRate(salary);

    return {
      federalTax: incomeTax,
      stateTax: csg + crds, // Using stateTax for CSG and CRDS
      localTax: 0,
      socialSecurity,
      medicare: otherContributions, // Using medicare for other contributions
      otherDeductions: 0,
      totalTax,
      marginalRate,
      effectiveRate: totalTax / salary,
      additionalInfo: `Calculated for family size ${familySize}${hasChildren ? ' with children' : ''}`,
    };
  }

  getCountryCode(): string {
    return 'FR';
  }

  getCountryName(): string {
    return 'France';
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
        name: 'Retirement Savings',
        description: 'PER (Plan d\'Épargne Retraite) contributions',
        maxAmount: 10000,
        type: 'fixed',
      },
      {
        name: 'Life Insurance',
        description: 'Life insurance premiums',
        maxAmount: 4600,
        type: 'fixed',
      },
      {
        name: 'Donations',
        description: 'Charitable donations',
        maxAmount: 1000,
        type: 'fixed',
      },
    ];
  }

  private calculateIncomeTax(salary: number, familySize: number): number {
    // French tax is calculated on household income with family quotient
    const familyQuotient = Math.max(1, familySize);
    const taxableIncomePerShare = salary / familyQuotient;

    let taxPerShare = 0;
    let remainingIncome = taxableIncomePerShare;

    for (const bracket of this.taxBrackets) {
      if (remainingIncome <= 0) break;

      const taxableInBracket = Math.min(
        remainingIncome,
        bracket.maxIncome - bracket.minIncome + 1
      );

      taxPerShare += taxableInBracket * bracket.rate;
      remainingIncome -= taxableInBracket;
    }

    // Apply family quotient
    return taxPerShare * familyQuotient;
  }

  private calculateOtherContributions(salary: number): number {
    // Additional French contributions
    const unemploymentInsurance = salary * 0.024; // 2.4%
    const healthInsurance = salary * 0.07; // 7%
    const familyAllowance = salary * 0.051; // 5.1%
    const accidentInsurance = salary * 0.013; // 1.3%

    return unemploymentInsurance + healthInsurance + familyAllowance + accidentInsurance;
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