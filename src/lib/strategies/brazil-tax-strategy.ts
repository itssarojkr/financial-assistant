import { BaseTaxStrategy, TaxCalculationParams, TaxCalculationResult, TaxBracketConfig, DeductionConfig, AdditionalTaxConfig, ValidationResult } from '../tax-strategy';

export class BrazilTaxStrategy extends BaseTaxStrategy {
  readonly name = 'Brazil';
  readonly currency = 'R$';
  readonly countryCode = 'BR';

  // Tax brackets for 2024
  private readonly BRAZIL_BRACKETS: TaxBracketConfig[] = [
    { min: 0, max: 2112, rate: 0, label: 'Tax-Free Threshold' },
    { min: 2112, max: 2826.65, rate: 0.075, label: '7.5%' },
    { min: 2826.65, max: 3751.05, rate: 0.15, label: '15%' },
    { min: 3751.05, max: 4664.68, rate: 0.225, label: '22.5%' },
    { min: 4664.68, max: null, rate: 0.275, label: '27.5%' },
  ];

  // Constants
  private readonly INSS_RATE = 0.11;
  private readonly MAX_INSS = 713.10;
  private readonly MAX_INSS_DEDUCTION = 5000;

  getBrackets(regime?: string): TaxBracketConfig[] {
    return this.BRAZIL_BRACKETS;
  }

  getDeductions(regime?: string): DeductionConfig[] {
    return [
      {
        key: 'dedINSS',
        label: 'INSS Contributions',
        maxValue: this.MAX_INSS_DEDUCTION,
        tooltip: 'Social security contributions (INSS)',
        applicableRegimes: ['default'],
        validationFn: (value: number) => value >= 0 && value <= this.MAX_INSS_DEDUCTION
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
        key: 'inss',
        label: 'INSS (Social Security)',
        calculationFn: ({ grossSalary }) => {
          return Math.min(grossSalary * this.INSS_RATE, this.MAX_INSS);
        },
        tooltip: 'INSS is 11% of salary up to a maximum of R$713.10'
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
    const inssDeduction = Math.min(deductions.dedINSS || 0, this.MAX_INSS_DEDUCTION);
    const otherDeductions = Math.max(0, deductions.dedOther || 0);
    return inssDeduction + otherDeductions;
  }

  // Override validation for Brazil-specific rules
  validateParams(params: TaxCalculationParams): ValidationResult {
    const baseValidation = super.validateParams(params);
    
    // Brazil-specific validations
    if (params.regime && params.regime !== 'default') {
      baseValidation.errors.push('Invalid regime. Brazil uses a single tax system');
    }

    return {
      isValid: baseValidation.errors.length === 0,
      errors: baseValidation.errors,
      warnings: baseValidation.warnings
    };
  }
} 