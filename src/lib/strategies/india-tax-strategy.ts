import { BaseTaxStrategy, TaxCalculationParams, TaxCalculationResult, TaxBracketConfig, DeductionConfig, AdditionalTaxConfig, ValidationResult } from '../tax-strategy';

export class IndiaTaxStrategy extends BaseTaxStrategy {
  readonly name = 'India';
  readonly currency = '₹';
  readonly countryCode = 'IN';

  // Tax brackets for different regimes (FY 2025-2026)
  private readonly OLD_REGIME_BRACKETS: TaxBracketConfig[] = [
    { min: 0, max: 250000, rate: 0, label: 'Up to ₹2.5 lakhs' },
    { min: 250000, max: 500000, rate: 0.05, label: '₹2.5 lakhs - ₹5 lakhs' },
    { min: 500000, max: 1000000, rate: 0.20, label: '₹5 lakhs - ₹10 lakhs' },
    { min: 1000000, max: null, rate: 0.30, label: 'Above ₹10 lakhs' },
  ];

  private readonly NEW_REGIME_BRACKETS: TaxBracketConfig[] = [
    { min: 0, max: 400000, rate: 0, label: 'Up to ₹4 lakhs' },
    { min: 400000, max: 800000, rate: 0.05, label: '₹4 lakhs - ₹8 lakhs' },
    { min: 800000, max: 1200000, rate: 0.10, label: '₹8 lakhs - ₹12 lakhs' },
    { min: 1200000, max: 1600000, rate: 0.15, label: '₹12 lakhs - ₹16 lakhs' },
    { min: 1600000, max: 2000000, rate: 0.20, label: '₹16 lakhs - ₹20 lakhs' },
    { min: 2000000, max: 2400000, rate: 0.25, label: '₹20 lakhs - ₹24 lakhs' },
    { min: 2400000, max: null, rate: 0.30, label: 'Above ₹24 lakhs' },
  ];

  // Section 87A rebate limits (FY 2025-2026)
  private readonly SECTION_87A_OLD = { limit: 500000, rebate: 12500 };
  private readonly SECTION_87A_NEW = { limit: 1200000, rebate: 60000 };

  // Standard deduction (FY 2025-2026)
  private readonly STANDARD_DEDUCTION_OLD = 50000; // Old regime
  private readonly STANDARD_DEDUCTION_NEW = 75000; // New regime

  getBrackets(regime?: string): TaxBracketConfig[] {
    return regime === 'new' ? this.NEW_REGIME_BRACKETS : this.OLD_REGIME_BRACKETS;
  }

  getDeductions(regime?: string): DeductionConfig[] {
    // Deductions only apply to old regime
    if (regime === 'new') {
      return [];
    }

    return [
      {
        key: 'ded80C',
        label: 'Section 80C (EPF, ELSS, etc.)',
        maxValue: 150000,
        tooltip: 'Maximum deduction of ₹1.5 lakhs under Section 80C',
        applicableRegimes: ['old'],
        validationFn: (value: number) => value >= 0 && value <= 150000
      },
      {
        key: 'ded80D',
        label: 'Section 80D (Health Insurance)',
        maxValue: 50000,
        tooltip: 'Maximum deduction of ₹50,000 for health insurance',
        applicableRegimes: ['old'],
        validationFn: (value: number) => value >= 0 && value <= 50000
      },
      {
        key: 'dedOther',
        label: 'Other Deductions',
        tooltip: 'Other eligible deductions',
        applicableRegimes: ['old'],
        validationFn: (value: number) => value >= 0
      }
    ];
  }

  getAdditionalTaxes(): AdditionalTaxConfig[] {
    return [
      {
        key: 'surcharge',
        label: 'Surcharge',
        calculationFn: ({ baseTax }) => {
          if (baseTax > 10000000) return baseTax * 0.15;
          if (baseTax > 5000000) return baseTax * 0.10;
          if (baseTax > 1000000) return baseTax * 0.05;
          return 0;
        },
        tooltip: 'Surcharge for high earners based on tax amount'
      },
      {
        key: 'cess',
        label: 'Health & Education Cess',
        calculationFn: ({ baseTax }) => baseTax * 0.04,
        tooltip: '4% of income tax after rebate'
      }
    ];
  }

  calculateTax(params: TaxCalculationParams): TaxCalculationResult {
    const { grossSalary, deductions, regime = 'new' } = params;
    
    // Get appropriate brackets
    const brackets = this.getBrackets(regime);
    
    // Calculate total deductions (only for old regime)
    const totalDeductions = regime === 'old' 
      ? this.calculateTotalDeductions(deductions, regime)
      : 0;

    // Add standard deduction
    const standardDeduction = regime === 'old' ? this.STANDARD_DEDUCTION_OLD : this.STANDARD_DEDUCTION_NEW;
    const totalDeductionsWithStandard = totalDeductions + standardDeduction;

    const taxableIncome = Math.max(0, grossSalary - totalDeductionsWithStandard);
    
    // Calculate bracket tax
    const calculatedBrackets = this.calculateBracketTax(taxableIncome, brackets);
    const baseTax = calculatedBrackets.reduce((sum, b) => sum + b.taxPaid, 0);

    // Apply Section 87A rebate
    const section87a = regime === 'old' ? this.SECTION_87A_OLD : this.SECTION_87A_NEW;
    let finalTax = baseTax;
    
    if (taxableIncome <= section87a.limit) {
      const rebateAmount = Math.min(baseTax, section87a.rebate);
      finalTax = Math.max(0, baseTax - rebateAmount);
    }

    // Calculate additional taxes
    const additionalTaxes = this.calculateAdditionalTaxes(params, taxableIncome, finalTax);
    const totalTax = finalTax + Object.values(additionalTaxes).reduce((sum, val) => sum + val, 0);
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
        incomeTax: finalTax,
        ...additionalTaxes,
        rebate: baseTax - finalTax,
        standardDeduction,
        totalDeductions: totalDeductionsWithStandard
      },
      effectiveTaxRate,
      marginalTaxRate
    };
  }

  // Override validation for India-specific rules
  validateParams(params: TaxCalculationParams): ValidationResult {
    const baseValidation = super.validateParams(params);
    
    // India-specific validations
    if (params.regime && !['new', 'old'].includes(params.regime)) {
      baseValidation.errors.push('Invalid regime. Must be "new" or "old"');
    }

    // Validate deductions for old regime
    if (params.regime === 'old') {
      const deductions = this.getDeductions('old');
      deductions.forEach(deduction => {
        const value = params.deductions[deduction.key] || 0;
        if (deduction.validationFn && !deduction.validationFn(value, params.grossSalary)) {
          baseValidation.errors.push(`Invalid value for ${deduction.label}`);
        }
      });
    }

    return {
      isValid: baseValidation.errors.length === 0,
      errors: baseValidation.errors,
      warnings: baseValidation.warnings
    };
  }
} 