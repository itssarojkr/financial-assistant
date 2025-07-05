import { BaseTaxStrategy, TaxCalculationParams, TaxCalculationResult, TaxBracketConfig, DeductionConfig, AdditionalTaxConfig, ValidationResult } from '../tax-strategy';

export class USTaxStrategy extends BaseTaxStrategy {
  readonly name = 'United States';
  readonly currency = '$';
  readonly countryCode = 'US';

  // Tax brackets for different filing statuses (2024)
  private readonly BRACKETS: Record<string, TaxBracketConfig[]> = {
    single: [
      { min: 0, max: 11600, rate: 0.10, label: 'Up to $11,600' },
      { min: 11600, max: 47150, rate: 0.12, label: '$11,600 - $47,150' },
      { min: 47150, max: 100525, rate: 0.22, label: '$47,150 - $100,525' },
      { min: 100525, max: 191950, rate: 0.24, label: '$100,525 - $191,950' },
      { min: 191950, max: 243725, rate: 0.32, label: '$191,950 - $243,725' },
      { min: 243725, max: 609350, rate: 0.35, label: '$243,725 - $609,350' },
      { min: 609350, max: null, rate: 0.37, label: 'Above $609,350' },
    ],
    married: [
      { min: 0, max: 23200, rate: 0.10, label: 'Up to $23,200' },
      { min: 23200, max: 94300, rate: 0.12, label: '$23,200 - $94,300' },
      { min: 94300, max: 201050, rate: 0.22, label: '$94,300 - $201,050' },
      { min: 201050, max: 383900, rate: 0.24, label: '$201,050 - $383,900' },
      { min: 383900, max: 487450, rate: 0.32, label: '$383,900 - $487,450' },
      { min: 487450, max: 731200, rate: 0.35, label: '$487,450 - $731,200' },
      { min: 731200, max: null, rate: 0.37, label: 'Above $731,200' },
    ],
    head: [
      { min: 0, max: 16550, rate: 0.10, label: 'Up to $16,550' },
      { min: 16550, max: 63100, rate: 0.12, label: '$16,550 - $63,100' },
      { min: 63100, max: 100500, rate: 0.22, label: '$63,100 - $100,500' },
      { min: 100500, max: 191950, rate: 0.24, label: '$100,500 - $191,950' },
      { min: 191950, max: 243700, rate: 0.32, label: '$191,950 - $243,700' },
      { min: 243700, max: 609350, rate: 0.35, label: '$243,700 - $609,350' },
      { min: 609350, max: null, rate: 0.37, label: 'Above $609,350' },
    ]
  };

  // Standard deductions (2024)
  private readonly STANDARD_DEDUCTIONS: Record<string, number> = {
    single: 14600,
    married: 29200,
    head: 21900
  };

  // Social Security and Medicare limits
  private readonly SOCIAL_SECURITY_WAGE_CAP = 168600;
  private readonly SOCIAL_SECURITY_RATE = 0.062;
  private readonly MEDICARE_RATE = 0.0145;
  private readonly MEDICARE_ADDITIONAL_RATE = 0.009; // For income > $200,000

  getBrackets(regime?: string): TaxBracketConfig[] {
    const filingStatus = regime || 'single';
    return this.BRACKETS[filingStatus] || this.BRACKETS.single;
  }

  getDeductions(regime?: string): DeductionConfig[] {
    return [
      {
        key: 'ded401k',
        label: '401(k)/IRA Contributions',
        tooltip: 'Pre-tax retirement contributions (2024 limit: $23,000)',
        maxValue: 23000,
        validationFn: (value: number) => value >= 0 && value <= 23000
      },
      {
        key: 'dedHSA',
        label: 'HSA Contributions',
        tooltip: 'Health Savings Account contributions',
        maxValue: 4150,
        validationFn: (value: number) => value >= 0 && value <= 4150
      },
      {
        key: 'dedOther',
        label: 'Other Deductions',
        tooltip: 'Other eligible deductions',
        validationFn: (value: number) => value >= 0
      }
    ];
  }

  getAdditionalTaxes(): AdditionalTaxConfig[] {
    return [
      {
        key: 'socialSecurity',
        label: 'Social Security',
        calculationFn: ({ grossSalary }) => {
          return Math.min(grossSalary, this.SOCIAL_SECURITY_WAGE_CAP) * this.SOCIAL_SECURITY_RATE;
        },
        tooltip: `6.2% up to wage cap of $${this.SOCIAL_SECURITY_WAGE_CAP.toLocaleString()}`
      },
      {
        key: 'medicare',
        label: 'Medicare',
        calculationFn: ({ grossSalary }) => {
          const baseMedicare = grossSalary * this.MEDICARE_RATE;
          const additionalMedicare = grossSalary > 200000 
            ? (grossSalary - 200000) * this.MEDICARE_ADDITIONAL_RATE 
            : 0;
          return baseMedicare + additionalMedicare;
        },
        tooltip: '1.45% base rate + 0.9% for income over $200,000'
      }
    ];
  }

  calculateTax(params: TaxCalculationParams): TaxCalculationResult {
    const { grossSalary, deductions, regime = 'single' } = params;
    
    // Get appropriate brackets
    const brackets = this.getBrackets(regime);
    
    // Calculate total deductions
    const totalDeductions = this.calculateTotalDeductions(deductions, regime);
    
    // Add standard deduction
    const standardDeduction = this.STANDARD_DEDUCTIONS[regime] || this.STANDARD_DEDUCTIONS.single;
    const totalDeductionsWithStandard = totalDeductions + standardDeduction;

    const taxableIncome = Math.max(0, grossSalary - totalDeductionsWithStandard);
    
    // Calculate bracket tax
    const calculatedBrackets = this.calculateBracketTax(taxableIncome, brackets);
    const baseTax = calculatedBrackets.reduce((sum, b) => sum + b.taxPaid, 0);

    // Calculate additional taxes
    const additionalTaxes = this.calculateAdditionalTaxes(params, taxableIncome, baseTax);
    const totalTax = baseTax + Object.values(additionalTaxes).reduce((sum, val) => sum + val, 0);
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
        incomeTax: baseTax,
        ...additionalTaxes,
        standardDeduction,
        totalDeductions: totalDeductionsWithStandard
      },
      effectiveTaxRate,
      marginalTaxRate
    };
  }

  // Override validation for US-specific rules
  validateParams(params: TaxCalculationParams): ValidationResult {
    const baseValidation = super.validateParams(params);
    
    // US-specific validations
    if (params.regime && !['single', 'married', 'head'].includes(params.regime)) {
      baseValidation.errors.push('Invalid filing status. Must be "single", "married", or "head"');
    }

    // Validate deductions
    const deductions = this.getDeductions(params.regime);
    deductions.forEach(deduction => {
      const value = params.deductions[deduction.key] || 0;
      if (deduction.validationFn && !deduction.validationFn(value, params.grossSalary)) {
        baseValidation.errors.push(`Invalid value for ${deduction.label}`);
      }
    });

    return {
      isValid: baseValidation.errors.length === 0,
      errors: baseValidation.errors,
      warnings: baseValidation.warnings
    };
  }
} 