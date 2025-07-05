import { BaseTaxStrategy, TaxCalculationParams, TaxCalculationResult, TaxBracketConfig, DeductionConfig, AdditionalTaxConfig, ValidationResult } from '../tax-strategy';

export class UKTaxStrategy extends BaseTaxStrategy {
  readonly name = 'United Kingdom';
  readonly currency = '£';
  readonly countryCode = 'UK';

  // Tax brackets for 2024/25
  private readonly ENGLAND_BRACKETS: TaxBracketConfig[] = [
    { min: 0, max: 12570, rate: 0, label: 'Personal Allowance' },
    { min: 12570, max: 50270, rate: 0.20, label: 'Basic Rate' },
    { min: 50270, max: 125140, rate: 0.40, label: 'Higher Rate' },
    { min: 125140, max: null, rate: 0.45, label: 'Additional Rate' },
  ];

  private readonly SCOTLAND_BRACKETS: TaxBracketConfig[] = [
    { min: 0, max: 12570, rate: 0, label: 'Personal Allowance' },
    { min: 12570, max: 14632, rate: 0.19, label: 'Starter Rate' },
    { min: 14632, max: 25688, rate: 0.20, label: 'Basic Rate' },
    { min: 25688, max: 43662, rate: 0.21, label: 'Intermediate Rate' },
    { min: 43662, max: 75000, rate: 0.42, label: 'Higher Rate' },
    { min: 75000, max: 125140, rate: 0.45, label: 'Advanced Rate' },
    { min: 125140, max: null, rate: 0.48, label: 'Top Rate' },
  ];

  // National Insurance brackets
  private readonly NI_BRACKETS: TaxBracketConfig[] = [
    { min: 0, max: 12570, rate: 0, label: 'NI Free Allowance' },
    { min: 12570, max: 50270, rate: 0.12, label: 'NI Basic Rate' },
    { min: 50270, max: null, rate: 0.02, label: 'NI Higher Rate' },
  ];

  // Constants
  private readonly PERSONAL_ALLOWANCE = 12570;
  private readonly MAX_PENSION_CONTRIBUTION = 40000;

  // Student loan plans
  private readonly STUDENT_LOAN_PLANS = {
    plan1: { threshold: 22015, rate: 0.09 },
    plan2: { threshold: 27295, rate: 0.09 },
    plan4: { threshold: 27660, rate: 0.09 },
  };

  getBrackets(regime?: string): TaxBracketConfig[] {
    // For UK, regime could be 'england', 'scotland', 'wales', 'northern-ireland'
    // Default to England if not specified
    return regime === 'scotland' ? this.SCOTLAND_BRACKETS : this.ENGLAND_BRACKETS;
  }

  getDeductions(regime?: string): DeductionConfig[] {
    return [
      {
        key: 'dedPension',
        label: 'Pension Contributions',
        maxValue: this.MAX_PENSION_CONTRIBUTION,
        tooltip: 'Maximum pension contribution of £40,000 per year',
        applicableRegimes: ['england', 'scotland', 'wales', 'northern-ireland'],
        validationFn: (value: number) => value >= 0 && value <= this.MAX_PENSION_CONTRIBUTION
      },
      {
        key: 'dedOther',
        label: 'Other Deductions',
        tooltip: 'Other eligible deductions',
        applicableRegimes: ['england', 'scotland', 'wales', 'northern-ireland'],
        validationFn: (value: number) => value >= 0
      }
    ];
  }

  getAdditionalTaxes(): AdditionalTaxConfig[] {
    return [
      {
        key: 'nationalInsurance',
        label: 'National Insurance',
        calculationFn: ({ grossSalary, taxableIncome, baseTax }) => {
          const niBrackets = this.calculateBracketTax(grossSalary, this.NI_BRACKETS);
          return niBrackets.reduce((sum, b) => sum + b.taxPaid, 0);
        },
        tooltip: 'National Insurance contributions with progressive rates'
      },
      {
        key: 'studentLoan',
        label: 'Student Loan Repayment',
        calculationFn: ({ grossSalary, regime = 'england' }) => {
          const studentLoanPlan = regime === 'scotland' ? 'plan4' : 'plan2';
          const threshold = this.STUDENT_LOAN_PLANS[studentLoanPlan as keyof typeof this.STUDENT_LOAN_PLANS]?.threshold || 27295;
          const rate = this.STUDENT_LOAN_PLANS[studentLoanPlan as keyof typeof this.STUDENT_LOAN_PLANS]?.rate || 0.09;
          return Math.max(0, (grossSalary - threshold) * rate);
        },
        tooltip: 'Student loan repayment based on income threshold'
      }
    ];
  }

  calculateTax(params: TaxCalculationParams): TaxCalculationResult {
    const { grossSalary, deductions, regime = 'england' } = params;
    
    // Get appropriate brackets
    const brackets = this.getBrackets(regime);
    
    // Calculate total deductions
    const totalDeductions = this.calculateTotalDeductions(deductions, regime);
    
    // Apply personal allowance
    const totalDeductionsWithPersonalAllowance = totalDeductions + this.PERSONAL_ALLOWANCE;
    const taxableIncome = Math.max(0, grossSalary - totalDeductionsWithPersonalAllowance);

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
        personalAllowance: this.PERSONAL_ALLOWANCE,
        totalDeductions: totalDeductionsWithPersonalAllowance
      },
      effectiveTaxRate,
      marginalTaxRate
    };
  }

  protected calculateTotalDeductions(deductions: Record<string, number>, regime: string): number {
    const pensionDeduction = Math.min(deductions.dedPension || 0, this.MAX_PENSION_CONTRIBUTION);
    const otherDeductions = Math.max(0, deductions.dedOther || 0);
    return pensionDeduction + otherDeductions;
  }

  // Override validation for UK-specific rules
  validateParams(params: TaxCalculationParams): ValidationResult {
    const baseValidation = super.validateParams(params);
    
    // UK-specific validations
    if (params.regime && !['england', 'scotland', 'wales', 'northern-ireland'].includes(params.regime)) {
      baseValidation.errors.push('Invalid regime. Must be "england", "scotland", "wales", or "northern-ireland"');
    }

    return {
      isValid: baseValidation.errors.length === 0,
      errors: baseValidation.errors,
      warnings: baseValidation.warnings
    };
  }
} 