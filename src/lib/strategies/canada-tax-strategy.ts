import { BaseTaxStrategy, TaxCalculationParams, TaxCalculationResult, TaxBracketConfig, DeductionConfig, AdditionalTaxConfig, ValidationResult } from '../tax-strategy';

export class CanadaTaxStrategy extends BaseTaxStrategy {
  readonly name = 'Canada';
  readonly currency = 'C$';
  readonly countryCode = 'CA';

  // Federal tax brackets for 2024
  private readonly FEDERAL_BRACKETS: TaxBracketConfig[] = [
    { min: 0, max: 55867, rate: 0.15, label: '15%' },
    { min: 55867, max: 111733, rate: 0.205, label: '20.5%' },
    { min: 111733, max: 173205, rate: 0.26, label: '26%' },
    { min: 173205, max: 246752, rate: 0.29, label: '29%' },
    { min: 246752, max: null, rate: 0.33, label: '33%' },
  ];

  // Ontario provincial brackets for 2024
  private readonly ONTARIO_BRACKETS: TaxBracketConfig[] = [
    { min: 0, max: 51446, rate: 0.0505, label: '5.05%' },
    { min: 51446, max: 102894, rate: 0.0915, label: '9.15%' },
    { min: 102894, max: 150000, rate: 0.1116, label: '11.16%' },
    { min: 150000, max: 220000, rate: 0.1216, label: '12.16%' },
    { min: 220000, max: null, rate: 0.1316, label: '13.16%' },
  ];

  // Constants
  private readonly BASIC_PERSONAL_AMOUNT = 15000;
  private readonly CPP_RATE = 0.0595;
  private readonly CPP_MAX = 66600;
  private readonly EI_RATE = 0.0163;
  private readonly EI_MAX = 61500;
  private readonly MAX_RRSP_CONTRIBUTION = 31560; // 2024 limit

  getBrackets(regime?: string): TaxBracketConfig[] {
    // For Canada, regime could be 'federal', 'ontario', 'quebec', etc.
    // Default to federal if not specified
    return regime === 'ontario' ? this.ONTARIO_BRACKETS : this.FEDERAL_BRACKETS;
  }

  getDeductions(regime?: string): DeductionConfig[] {
    return [
      {
        key: 'dedRRSP',
        label: 'RRSP Contributions',
        maxValue: this.MAX_RRSP_CONTRIBUTION,
        tooltip: 'Registered Retirement Savings Plan contributions, max C$31,560',
        applicableRegimes: ['federal', 'ontario', 'quebec'],
        validationFn: (value: number) => value >= 0 && value <= this.MAX_RRSP_CONTRIBUTION
      },
      {
        key: 'dedOther',
        label: 'Other Deductions',
        tooltip: 'Other eligible deductions',
        applicableRegimes: ['federal', 'ontario', 'quebec'],
        validationFn: (value: number) => value >= 0
      }
    ];
  }

  getAdditionalTaxes(): AdditionalTaxConfig[] {
    return [
      {
        key: 'cpp',
        label: 'CPP Contributions',
        calculationFn: ({ grossSalary }) => {
          return Math.min(grossSalary * this.CPP_RATE, this.CPP_MAX * this.CPP_RATE);
        },
        tooltip: 'Canada Pension Plan contributions, 5.95% up to C$66,600'
      },
      {
        key: 'ei',
        label: 'EI Premiums',
        calculationFn: ({ grossSalary }) => {
          return Math.min(grossSalary * this.EI_RATE, this.EI_MAX * this.EI_RATE);
        },
        tooltip: 'Employment Insurance premiums, 1.63% up to C$61,500'
      }
    ];
  }

  calculateTax(params: TaxCalculationParams): TaxCalculationResult {
    const { grossSalary, deductions, regime = 'federal' } = params;
    
    // Get appropriate brackets
    const brackets = this.getBrackets(regime);
    
    // Calculate total deductions
    const totalDeductions = this.calculateTotalDeductions(deductions, regime);
    
    // Apply basic personal amount
    const totalDeductionsWithBasic = totalDeductions + this.BASIC_PERSONAL_AMOUNT;
    const taxableIncome = Math.max(0, grossSalary - totalDeductionsWithBasic);

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
        basicPersonalAmount: this.BASIC_PERSONAL_AMOUNT,
        totalDeductions: totalDeductionsWithBasic
      },
      effectiveTaxRate,
      marginalTaxRate
    };
  }

  protected calculateTotalDeductions(deductions: Record<string, number>, regime: string): number {
    const rrspDeduction = Math.min(deductions.dedRRSP || 0, this.MAX_RRSP_CONTRIBUTION);
    const otherDeductions = Math.max(0, deductions.dedOther || 0);
    return rrspDeduction + otherDeductions;
  }

  // Override validation for Canada-specific rules
  validateParams(params: TaxCalculationParams): ValidationResult {
    const baseValidation = super.validateParams(params);
    
    // Canada-specific validations
    if (params.regime && !['federal', 'ontario', 'quebec', 'bc', 'alberta', 'manitoba', 'saskatchewan', 'nova-scotia', 'new-brunswick', 'pei', 'newfoundland'].includes(params.regime)) {
      baseValidation.errors.push('Invalid regime. Must be a valid Canadian province/territory');
    }

    return {
      isValid: baseValidation.errors.length === 0,
      errors: baseValidation.errors,
      warnings: baseValidation.warnings
    };
  }
} 