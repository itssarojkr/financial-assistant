import { BaseTaxStrategy, TaxCalculationParams, TaxCalculationResult, TaxBracketConfig, DeductionConfig, AdditionalTaxConfig, ValidationResult } from '../tax-strategy';

export class SouthAfricaTaxStrategy extends BaseTaxStrategy {
  readonly name = 'South Africa';
  readonly currency = 'R';
  readonly countryCode = 'ZA';

  // Tax brackets for 2024/25
  private readonly SA_BRACKETS: TaxBracketConfig[] = [
    { min: 0, max: 237100, rate: 0.18, label: '18%' },
    { min: 237100, max: 370500, rate: 0.26, label: '26%' },
    { min: 370500, max: 512800, rate: 0.31, label: '31%' },
    { min: 512800, max: 673000, rate: 0.36, label: '36%' },
    { min: 673000, max: 857900, rate: 0.39, label: '39%' },
    { min: 857900, max: 1817000, rate: 0.41, label: '41%' },
    { min: 1817000, max: null, rate: 0.45, label: '45%' },
  ];

  // Constants
  private readonly PRIMARY_REBATE = 17235; // 2024/25 primary rebate
  private readonly UIF_RATE = 0.01;
  private readonly MAX_UIF = 177.12 * 12;
  private readonly MAX_RETIREMENT_DEDUCTION = 50000;

  getBrackets(regime?: string): TaxBracketConfig[] {
    return this.SA_BRACKETS;
  }

  getDeductions(regime?: string): DeductionConfig[] {
    return [
      {
        key: 'dedRetirement',
        label: 'Retirement Contributions',
        maxValue: this.MAX_RETIREMENT_DEDUCTION,
        tooltip: 'Retirement annuity fund contributions',
        applicableRegimes: ['default'],
        validationFn: (value: number) => value >= 0 && value <= this.MAX_RETIREMENT_DEDUCTION
      },
      {
        key: 'dedOther',
        label: 'Other Deductions',
        tooltip: 'Other eligible deductions',
        applicableRegimes: ['default'],
        validationFn: (value: number) => value >= 0
      }
    ];
  }

  getAdditionalTaxes(): AdditionalTaxConfig[] {
    return [
      {
        key: 'uif',
        label: 'UIF (Unemployment Insurance Fund)',
        calculationFn: ({ grossSalary }) => {
          return Math.min(grossSalary * this.UIF_RATE, this.MAX_UIF);
        },
        tooltip: 'UIF is 1% of salary up to a maximum of R2,125.44 per year'
      }
    ];
  }

  calculateTax(params: TaxCalculationParams): TaxCalculationResult {
    const { grossSalary, deductions } = params;
    
    // Get brackets
    const brackets = this.getBrackets();
    
    // Calculate total deductions
    const totalDeductions = this.calculateTotalDeductions(deductions);
    const taxableIncome = Math.max(0, grossSalary - totalDeductions);

    // Calculate income tax
    const calculatedBrackets = this.calculateBracketTax(taxableIncome, brackets);
    const incomeTax = calculatedBrackets.reduce((sum, b) => sum + b.taxPaid, 0);
    
    // Apply primary rebate
    const rebateAmount = Math.min(incomeTax, this.PRIMARY_REBATE);
    const finalIncomeTax = Math.max(0, incomeTax - rebateAmount);

    // Calculate additional taxes
    const additionalTaxes = this.calculateAdditionalTaxes(params, taxableIncome, finalIncomeTax);
    const totalTax = finalIncomeTax + Object.values(additionalTaxes).reduce((sum, val) => sum + val, 0);
    const takeHomeSalary = grossSalary - totalTax;

    // Calculate rates
    const effectiveTaxRate = this.calculateEffectiveTaxRate(totalTax, grossSalary);
    const marginalTaxRate = this.calculateMarginalTaxRate(taxableIncome, brackets);

    return {
      brackets: calculatedBrackets,
      totalTax,
      takeHomeSalary,
      taxableIncome,
      additionalTaxes,
      breakdown: {
        incomeTax: finalIncomeTax,
        ...additionalTaxes,
        primaryRebate: rebateAmount,
        totalDeductions
      },
      effectiveTaxRate,
      marginalTaxRate
    };
  }

  protected calculateTotalDeductions(deductions: Record<string, number>): number {
    const retirementDeduction = Math.min(deductions.dedRetirement || 0, this.MAX_RETIREMENT_DEDUCTION);
    const otherDeductions = Math.max(0, deductions.dedOther || 0);
    return retirementDeduction + otherDeductions;
  }

  // Override validation for South Africa-specific rules
  validateParams(params: TaxCalculationParams): ValidationResult {
    const baseValidation = super.validateParams(params);
    
    // South Africa-specific validations
    if (params.regime && params.regime !== 'default') {
      baseValidation.errors.push('Invalid regime. South Africa uses a single tax system');
    }

    return {
      isValid: baseValidation.errors.length === 0,
      errors: baseValidation.errors,
      warnings: baseValidation.warnings
    };
  }
} 