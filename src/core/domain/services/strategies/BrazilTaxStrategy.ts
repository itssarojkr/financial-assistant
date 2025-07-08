import { TaxCalculationStrategy } from '../TaxCalculationStrategy';
import { TaxData } from '@/shared/types/domain.types';

/**
 * Brazil Tax Calculation Strategy
 * 
 * Implements tax calculation for Brazil including
 * income tax (IRPF) and social security contributions.
 */
export class BrazilTaxStrategy implements TaxCalculationStrategy {
  private readonly taxBrackets = [
    { minIncome: 0, maxIncome: 2259.20, rate: 0, description: 'Isento' },
    { minIncome: 2259.21, maxIncome: 2826.65, rate: 0.075, description: '7.5%' },
    { minIncome: 2826.66, maxIncome: 3751.05, rate: 0.15, description: '15%' },
    { minIncome: 3751.06, maxIncome: 4664.68, rate: 0.225, description: '22.5%' },
    { minIncome: 4664.69, maxIncome: Infinity, rate: 0.275, description: '27.5%' },
  ];

  private readonly inssRate = 0.11; // 11% (INSS - social security)
  private readonly inssLimit = 7507.49; // 2024 limit

  async calculateTax(
    salary: number,
    currency: string,
    additionalParams?: Record<string, unknown>
  ): Promise<TaxData> {
    const dependents = additionalParams?.dependents || 0;
    const hasHealthPlan = additionalParams?.hasHealthPlan || false;

    // Calculate INSS (social security)
    const inss = this.calculateINSS(salary);

    // Calculate IRPF (income tax)
    const irpf = this.calculateIRPF(salary, inss, dependents);

    // Calculate health plan contribution (if applicable)
    const healthPlanContribution = hasHealthPlan ? salary * 0.05 : 0; // 5% for health plan

    const totalTax = irpf + inss + healthPlanContribution;
    const marginalRate = this.getMarginalRate(salary);

    return {
      federalTax: irpf,
      stateTax: 0, // No state income tax in Brazil
      localTax: 0,
      socialSecurity: inss,
      medicare: healthPlanContribution, // Using medicare for health plan
      otherDeductions: 0,
      totalTax,
      marginalRate,
      effectiveRate: totalTax / salary,
      additionalInfo: `Calculated with ${dependents} dependents${hasHealthPlan ? ' and health plan' : ''}`,
    };
  }

  getCountryCode(): string {
    return 'BR';
  }

  getCountryName(): string {
    return 'Brazil';
  }

  validateInput(
    salary: number,
    currency: string,
    additionalParams?: Record<string, unknown>
  ): boolean {
    return salary > 0 && currency === 'BRL';
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
        name: 'Previdência Privada',
        description: 'Private pension contributions',
        maxAmount: 12000,
        type: 'fixed',
      },
      {
        name: 'Educação',
        description: 'Education expenses',
        maxAmount: 3561.50,
        type: 'fixed',
      },
      {
        name: 'Saúde',
        description: 'Health expenses',
        maxAmount: 0,
        type: 'percentage',
      },
    ];
  }

  private calculateINSS(salary: number): number {
    // INSS calculation with progressive rates
    const inssBrackets = [
      { minIncome: 0, maxIncome: 1412.00, rate: 0.075 },
      { minIncome: 1412.01, maxIncome: 2666.68, rate: 0.09 },
      { minIncome: 2666.69, maxIncome: 4000.03, rate: 0.12 },
      { minIncome: 4000.04, maxIncome: 7507.49, rate: 0.14 },
    ];

    let inss = 0;
    let remainingIncome = Math.min(salary, this.inssLimit);

    for (const bracket of inssBrackets) {
      if (remainingIncome <= 0) break;

      const taxableInBracket = Math.min(
        remainingIncome,
        bracket.maxIncome - bracket.minIncome + 1
      );

      inss += taxableInBracket * bracket.rate;
      remainingIncome -= taxableInBracket;
    }

    return inss;
  }

  private calculateIRPF(salary: number, inss: number, dependents: number): number {
    // Calculate taxable income
    const dependentDeduction = dependents * 189.59; // Per dependent deduction
    const taxableIncome = salary - inss - dependentDeduction;

    if (taxableIncome <= 0) {
      return 0;
    }

    // Calculate tax with progressive rates
    let tax = 0;
    let remainingIncome = taxableIncome;

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

  private getMarginalRate(salary: number): number {
    for (const bracket of this.taxBrackets) {
      if (salary <= bracket.maxIncome) {
        return bracket.rate;
      }
    }
    return this.taxBrackets[this.taxBrackets.length - 1].rate;
  }
} 