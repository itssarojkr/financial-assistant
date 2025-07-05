import { BaseTaxStrategy, TaxCalculationParams, TaxCalculationResult, TaxBracketConfig, DeductionConfig, AdditionalTaxConfig, ValidationResult } from '../tax-strategy';

export class AustraliaTaxStrategy extends BaseTaxStrategy {
  readonly name = 'Australia';
  readonly currency = 'A$';
  readonly countryCode = 'AU';

  // Tax brackets for 2024/25
  private readonly AU_BRACKETS: TaxBracketConfig[] = [
    { min: 0, max: 18200, rate: 0, label: 'Tax-Free Threshold' },
    { min: 18200, max: 45000, rate: 0.19, label: '19%' },
    { min: 45000, max: 120000, rate: 0.325, label: '32.5%' },
    { min: 120000, max: 180000, rate: 0.37, label: '37%' },
    { min: 180000, max: null, rate: 0.45, label: '45%' },
  ];

  // Constants
  private readonly TAX_FREE_THRESHOLD = 18200;
  private readonly MEDICARE_LEVY_RATE = 0.02;
  private readonly MAX_SUPER_CONTRIBUTION = 27500; // 2024/25 concessional contribution cap

  getBrackets(regime?: string): TaxBracketConfig[] {
    return this.AU_BRACKETS;
  }

  getDeductions(regime?: string): DeductionConfig[] {
    return [
      {
        key: 'dedSuper',
        label: 'Superannuation Contributions',
        maxValue: this.MAX_SUPER_CONTRIBUTION,
        tooltip: 'Concessional (pre-tax) super contributions, max A$27,500',
        applicableRegimes: ['default'],
        validationFn: (value: number) => value >= 0 && value <= this.MAX_SUPER_CONTRIBUTION
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
        key: 'medicare',
        label: 'Medicare Levy',
        calculationFn: ({ taxableIncome }) => {
          return taxableIncome * this.MEDICARE_LEVY_RATE;
        },
        tooltip: 'Medicare levy is 2% of taxable income'
      }
    ];
  }

  calculateTax(params: TaxCalculationParams): TaxCalculationResult {
    const { grossSalary, deductions } = params;
    
    // Get brackets
    const brackets = this.getBrackets();
    
    // Calculate total deductions
    const totalDeductions = this.calculateTotalDeductions(deductions);
    
    // Apply tax-free threshold
    const totalDeductionsWithThreshold = totalDeductions + this.TAX_FREE_THRESHOLD;
    const taxableIncome = Math.max(0, grossSalary - totalDeductionsWithThreshold);

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
        taxFreeThreshold: this.TAX_FREE_THRESHOLD,
        totalDeductions: totalDeductionsWithThreshold
      },
      effectiveTaxRate,
      marginalTaxRate
    };
  }

  protected calculateTotalDeductions(deductions: Record<string, number>): number {
    const superDeduction = Math.min(deductions.dedSuper || 0, this.MAX_SUPER_CONTRIBUTION);
    const otherDeductions = Math.max(0, deductions.dedOther || 0);
    return superDeduction + otherDeductions;
  }

  // Override validation for Australia-specific rules
  validateParams(params: TaxCalculationParams): ValidationResult {
    const baseValidation = super.validateParams(params);
    
    // Australia-specific validations
    if (params.regime && params.regime !== 'default') {
      baseValidation.errors.push('Invalid regime. Australia uses a single tax system');
    }

    return {
      isValid: baseValidation.errors.length === 0,
      errors: baseValidation.errors,
      warnings: baseValidation.warnings
    };
  }
} 