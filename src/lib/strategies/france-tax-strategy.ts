import { BaseTaxStrategy, TaxCalculationParams, TaxCalculationResult, TaxBracketConfig, DeductionConfig, AdditionalTaxConfig, ValidationResult } from '../tax-strategy';

export class FranceTaxStrategy extends BaseTaxStrategy {
  readonly name = 'France';
  readonly currency = '€';
  readonly countryCode = 'FR';

  // Tax brackets for 2024
  private readonly FRANCE_BRACKETS: TaxBracketConfig[] = [
    { min: 0, max: 10777, rate: 0, label: 'Tax-Free Threshold' },
    { min: 10777, max: 27478, rate: 0.11, label: '11%' },
    { min: 27478, max: 78570, rate: 0.30, label: '30%' },
    { min: 78570, max: 168994, rate: 0.41, label: '41%' },
    { min: 168994, max: null, rate: 0.45, label: '45%' },
  ];

  // Constants
  private readonly SOCIAL_CONTRIB_RATE = 0.092;
  private readonly MAX_SOCIAL_DEDUCTION = 10000;

  getBrackets(regime?: string): TaxBracketConfig[] {
    return this.FRANCE_BRACKETS;
  }

  getDeductions(regime?: string): DeductionConfig[] {
    return [
      {
        key: 'dedSocial',
        label: 'Social Contributions',
        maxValue: this.MAX_SOCIAL_DEDUCTION,
        tooltip: 'Mandatory social security contributions',
        applicableRegimes: ['default'],
        validationFn: (value: number) => value >= 0 && value <= this.MAX_SOCIAL_DEDUCTION
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
        key: 'socialContrib',
        label: 'Social Contributions',
        calculationFn: ({ taxableIncome }) => {
          return taxableIncome * this.SOCIAL_CONTRIB_RATE;
        },
        tooltip: 'Social contributions are 9.2% of taxable income'
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
    const socialDeduction = Math.min(deductions.dedSocial || 0, this.MAX_SOCIAL_DEDUCTION);
    const otherDeductions = Math.max(0, deductions.dedOther || 0);
    return socialDeduction + otherDeductions;
  }

  // Override validation for France-specific rules
  validateParams(params: TaxCalculationParams): ValidationResult {
    const baseValidation = super.validateParams(params);
    
    // France-specific validations
    if (params.regime && params.regime !== 'default') {
      baseValidation.errors.push('Invalid regime. France uses a single tax system');
    }

    return {
      isValid: baseValidation.errors.length === 0,
      errors: baseValidation.errors,
      warnings: baseValidation.warnings
    };
  }
} 