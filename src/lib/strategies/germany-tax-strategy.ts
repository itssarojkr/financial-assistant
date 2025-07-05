import { BaseTaxStrategy, TaxCalculationParams, TaxCalculationResult, TaxBracketConfig, DeductionConfig, AdditionalTaxConfig, ValidationResult } from '../tax-strategy';

export class GermanyTaxStrategy extends BaseTaxStrategy {
  readonly name = 'Germany';
  readonly currency = '€';
  readonly countryCode = 'DE';

  // Tax brackets for 2024
  private readonly GERMANY_BRACKETS: TaxBracketConfig[] = [
    { min: 0, max: 10908, rate: 0, label: 'Tax-Free Threshold' },
    { min: 10908, max: 15999, rate: 0.14, label: '14%' },
    { min: 15999, max: 62809, rate: 0.23942, label: '23.942%' },
    { min: 62809, max: 277825, rate: 0.42, label: '42%' },
    { min: 277825, max: null, rate: 0.45, label: '45%' },
  ];

  // Constants
  private readonly SOLI_RATE = 0.055;
  private readonly CHURCH_TAX_RATE = 0.09;
  private readonly MAX_INSURANCE_DEDUCTION = 5000;

  getBrackets(regime?: string): TaxBracketConfig[] {
    return this.GERMANY_BRACKETS;
  }

  getDeductions(regime?: string): DeductionConfig[] {
    return [
      {
        key: 'dedInsurance',
        label: 'Insurance Premiums',
        maxValue: this.MAX_INSURANCE_DEDUCTION,
        tooltip: 'Health, pension, unemployment insurance',
        applicableRegimes: ['default'],
        validationFn: (value: number) => value >= 0 && value <= this.MAX_INSURANCE_DEDUCTION
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
        key: 'soli',
        label: 'Solidarity Surcharge',
        calculationFn: ({ baseTax }) => {
          return baseTax * this.SOLI_RATE;
        },
        tooltip: 'Solidarity surcharge (Soli) is 5.5% of income tax'
      },
      {
        key: 'churchTax',
        label: 'Church Tax',
        calculationFn: ({ baseTax }) => {
          return baseTax * this.CHURCH_TAX_RATE;
        },
        tooltip: 'Church tax is 9% of income tax (varies by region)'
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

    // Calculate additional taxes
    const additionalTaxes = this.calculateAdditionalTaxes(params, taxableIncome, incomeTax);
    const totalTax = incomeTax + Object.values(additionalTaxes).reduce((sum, val) => sum + val, 0);
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
        incomeTax,
        ...additionalTaxes,
        totalDeductions
      },
      effectiveTaxRate,
      marginalTaxRate
    };
  }

  protected calculateTotalDeductions(deductions: Record<string, number>): number {
    const insuranceDeduction = Math.min(deductions.dedInsurance || 0, this.MAX_INSURANCE_DEDUCTION);
    const otherDeductions = Math.max(0, deductions.dedOther || 0);
    return insuranceDeduction + otherDeductions;
  }

  // Override validation for Germany-specific rules
  validateParams(params: TaxCalculationParams): ValidationResult {
    const baseValidation = super.validateParams(params);
    
    // Germany-specific validations
    if (params.regime && params.regime !== 'default') {
      baseValidation.errors.push('Invalid regime. Germany uses a single tax system');
    }

    return {
      isValid: baseValidation.errors.length === 0,
      errors: baseValidation.errors,
      warnings: baseValidation.warnings
    };
  }
} 