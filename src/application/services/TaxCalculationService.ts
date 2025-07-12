
import { UserService } from './UserService';
import { UserPreferences } from '@/core/domain/entities/UserPreferences';

export interface TaxRates {
  federal: TaxBracket[];
  state: TaxBracket[];
  local: TaxBracket[];
}

export interface TaxThresholds {
  socialSecurityWageBase: number;
  additionalMedicareTaxThreshold: number;
}

export interface DeductionLimits {
  standardDeduction: number;
  retirementContributionLimit: number;
  hsaContributionLimit: number;
  studentLoanInterestDeductionLimit: number;
}

export interface CreditAmounts {
  childTaxCredit: number;
  earnedIncomeCredit: number;
  educationCredit: number;
  retirementSavingsCredit: number;
}

export interface TaxCalculationParams {
  grossIncome: number;
  country: string;
  state?: string;
  city?: string;
  filingStatus?: 'single' | 'married' | 'head_of_household' | 'married_separate';
  age?: number;
  dependents?: number;
  deductions?: {
    standardDeduction?: number;
    itemizedDeductions?: number;
    retirementContributions?: number;
    healthSavingsAccount?: number;
    studentLoanInterest?: number;
    charitableContributions?: number;
  };
  credits?: {
    childTaxCredit?: number;
    earnedIncomeCredit?: number;
    educationCredits?: number;
    retirementSaverCredit?: number;
  };
  year?: number;
}

export interface TaxCalculationResult {
  grossIncome: number;
  taxableIncome: number;
  federalTax: number;
  stateTax: number;
  localTax: number;
  socialSecurityTax: number;
  medicareTax: number;
  totalTax: number;
  takeHomePay: number;
  effectiveTaxRate: number;
  marginalTaxRate: number;
  breakdown: {
    federal: TaxBracket[];
    state: TaxBracket[];
    local: TaxBracket[];
  };
  deductions: {
    total: number;
    breakdown: Record<string, number>;
  };
  credits: {
    total: number;
    breakdown: Record<string, number>;
  };
}

export interface TaxBracket {
  rate: number;
  min: number;
  max: number;
  taxAmount: number;
}

/**
 * Tax calculation service for computing tax obligations
 */
export class TaxCalculationService {
  private readonly userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  /**
   * Calculates taxes for a given set of parameters
   */
  async calculateTaxes(params: TaxCalculationParams): Promise<TaxCalculationResult> {
    try {
      // Validate input parameters
      this.validateTaxCalculationParams(params);

      // Calculate deductions
      const deductions = this.calculateDeductions(params);

      // Calculate taxable income
      const taxableIncome = Math.max(0, params.grossIncome - deductions.total);

      // Calculate federal taxes
      const federalTax = this.calculateFederalTax(taxableIncome);

      // Calculate state taxes
      const stateTax = this.calculateStateTax(taxableIncome, params.state);

      // Calculate local taxes
      const localTax = this.calculateLocalTax(taxableIncome);

      // Calculate payroll taxes
      const socialSecurityTax = this.calculateSocialSecurityTax(params.grossIncome);
      const medicareTax = this.calculateMedicareTax(params.grossIncome);

      // Calculate credits
      const credits = this.calculateCredits(params);

      // Calculate total tax
      const totalTax = Math.max(0, federalTax + stateTax + localTax + socialSecurityTax + medicareTax - credits.total);

      // Calculate take-home pay
      const takeHomePay = params.grossIncome - totalTax;

      // Calculate effective and marginal tax rates
      const effectiveTaxRate = params.grossIncome > 0 ? (totalTax / params.grossIncome) * 100 : 0;
      const marginalTaxRate = this.calculateMarginalTaxRate();

      return {
        grossIncome: params.grossIncome,
        taxableIncome,
        federalTax,
        stateTax,
        localTax,
        socialSecurityTax,
        medicareTax,
        totalTax,
        takeHomePay,
        effectiveTaxRate,
        marginalTaxRate,
        breakdown: {
          federal: this.getFederalTaxBrackets(taxableIncome),
          state: this.getStateTaxBrackets(taxableIncome),
          local: this.getLocalTaxBrackets(taxableIncome),
        },
        deductions,
        credits,
      };
    } catch (error) {
      throw new Error(`Tax calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets tax calculation for a specific user
   */
  async calculateUserTaxes(userId: string, params: Omit<TaxCalculationParams, 'filingStatus' | 'dependents'>): Promise<TaxCalculationResult> {
    try {
      const user = await this.userService.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Enhance params with user-specific data
      const enhancedParams: TaxCalculationParams = {
        ...params,
        filingStatus: 'single', // Default, could be from user profile
        dependents: 0, // Default, could be from user profile
        state: params.state || '',
        city: params.city || '',
      };

      return await this.calculateTaxes(enhancedParams);
    } catch (error) {
      throw new Error(`User tax calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validates tax calculation parameters
   */
  private validateTaxCalculationParams(params: TaxCalculationParams): void {
    if (!params.grossIncome || params.grossIncome < 0) {
      throw new Error('Gross income is required and must be positive');
    }

    if (!params.country) {
      throw new Error('Country is required');
    }

    if (params.age !== undefined && (params.age < 0 || params.age > 150)) {
      throw new Error('Age must be between 0 and 150');
    }

    if (params.dependents !== undefined && params.dependents < 0) {
      throw new Error('Dependents cannot be negative');
    }
  }

  /**
   * Calculates total deductions
   */
  private calculateDeductions(params: TaxCalculationParams): { total: number; breakdown: Record<string, number> } {
    const breakdown: Record<string, number> = {};
    let total = 0;

    if (params.deductions) {
      if (params.deductions.standardDeduction) {
        breakdown['Standard Deduction'] = params.deductions.standardDeduction;
        total += params.deductions.standardDeduction;
      }

      if (params.deductions.itemizedDeductions) {
        breakdown['Itemized Deductions'] = params.deductions.itemizedDeductions;
        total += params.deductions.itemizedDeductions;
      }

      if (params.deductions.retirementContributions) {
        breakdown['Retirement Contributions'] = params.deductions.retirementContributions;
        total += params.deductions.retirementContributions;
      }

      if (params.deductions.healthSavingsAccount) {
        breakdown['Health Savings Account'] = params.deductions.healthSavingsAccount;
        total += params.deductions.healthSavingsAccount;
      }

      if (params.deductions.studentLoanInterest) {
        breakdown['Student Loan Interest'] = params.deductions.studentLoanInterest;
        total += params.deductions.studentLoanInterest;
      }

      if (params.deductions.charitableContributions) {
        breakdown['Charitable Contributions'] = params.deductions.charitableContributions;
        total += params.deductions.charitableContributions;
      }
    }

    return { total, breakdown };
  }

  /**
   * Calculates federal tax
   */
  private calculateFederalTax(taxableIncome: number): number {
    // This would use actual federal tax brackets
    // For now, return a simple calculation
    return taxableIncome * 0.22; // Simplified 22% rate
  }

  /**
   * Calculates state tax
   */
  private calculateStateTax(taxableIncome: number, state?: string): number {
    // This would use actual state tax brackets
    // For now, return a simple calculation based on state
    const stateRates: Record<string, number> = {
      'CA': 0.09,
      'NY': 0.08,
      'TX': 0,
      'FL': 0,
    };

    const rate = stateRates[state || ''] || 0.05;
    return taxableIncome * rate;
  }

  /**
   * Calculates local tax
   */
  private calculateLocalTax(taxableIncome: number): number {
    // This would use actual local tax rates
    // For now, return a simple calculation
    return taxableIncome * 0.01; // Simplified 1% rate
  }

  /**
   * Calculates Social Security tax
   */
  private calculateSocialSecurityTax(grossIncome: number): number {
    const socialSecurityWageBase = 160200; // 2023 limit
    const socialSecurityRate = 0.062;
    
    return Math.min(grossIncome, socialSecurityWageBase) * socialSecurityRate;
  }

  /**
   * Calculates Medicare tax
   */
  private calculateMedicareTax(grossIncome: number): number {
    const medicareTaxRate = 0.0145;
    const additionalMedicareThreshold = 200000;
    const additionalMedicareRate = 0.009;

    let medicareTax = grossIncome * medicareTaxRate;

    if (grossIncome > additionalMedicareThreshold) {
      medicareTax += (grossIncome - additionalMedicareThreshold) * additionalMedicareRate;
    }

    return medicareTax;
  }

  /**
   * Calculates tax credits
   */
  private calculateCredits(params: TaxCalculationParams): { total: number; breakdown: Record<string, number> } {
    const breakdown: Record<string, number> = {};
    let total = 0;

    if (params.credits) {
      if (params.credits.childTaxCredit) {
        breakdown['Child Tax Credit'] = params.credits.childTaxCredit;
        total += params.credits.childTaxCredit;
      }

      if (params.credits.earnedIncomeCredit) {
        breakdown['Earned Income Credit'] = params.credits.earnedIncomeCredit;
        total += params.credits.earnedIncomeCredit;
      }

      if (params.credits.educationCredits) {
        breakdown['Education Credits'] = params.credits.educationCredits;
        total += params.credits.educationCredits;
      }

      if (params.credits.retirementSaverCredit) {
        breakdown['Retirement Saver Credit'] = params.credits.retirementSaverCredit;
        total += params.credits.retirementSaverCredit;
      }
    }

    return { total, breakdown };
  }

  /**
   * Calculates marginal tax rate
   */
  private calculateMarginalTaxRate(): number {
    // This would calculate the actual marginal rate
    // For now, return a simplified rate
    return 22; // Simplified 22% marginal rate
  }

  /**
   * Gets federal tax brackets
   */
  private getFederalTaxBrackets(taxableIncome: number): TaxBracket[] {
    // This would return actual federal tax brackets
    // For now, return mock data
    return [
      { rate: 10, min: 0, max: 10275, taxAmount: Math.min(taxableIncome, 10275) * 0.10 },
      { rate: 12, min: 10275, max: 41775, taxAmount: Math.max(0, Math.min(taxableIncome - 10275, 31500)) * 0.12 },
      { rate: 22, min: 41775, max: 89450, taxAmount: Math.max(0, Math.min(taxableIncome - 41775, 47675)) * 0.22 },
    ];
  }

  /**
   * Gets state tax brackets
   */
  private getStateTaxBrackets(taxableIncome: number): TaxBracket[] {
    // This would return actual state tax brackets
    // For now, return mock data
    return [];
  }

  /**
   * Gets local tax brackets
   */
  private getLocalTaxBrackets(taxableIncome: number): TaxBracket[] {
    // This would return actual local tax brackets
    // For now, return mock data
    return [];
  }

  /**
   * Estimates quarterly tax payments
   */
  async estimateQuarterlyPayments(userId: string, annualIncome: number): Promise<number> {
    try {
      const taxResult = await this.calculateUserTaxes(userId, {
        grossIncome: annualIncome,
        country: 'US', // Default to US
      });

      // Quarterly payment is typically 25% of annual tax
      return taxResult.totalTax / 4;
    } catch (error) {
      throw new Error(`Quarterly payment estimation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Compares tax scenarios
   */
  async compareTaxScenarios(scenarios: TaxCalculationParams[]): Promise<TaxCalculationResult[]> {
    try {
      const results = await Promise.all(
        scenarios.map(scenario => this.calculateTaxes(scenario))
      );

      return results;
    } catch (error) {
      throw new Error(`Tax scenario comparison failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets tax optimization suggestions
   */
  async getTaxOptimizationSuggestions(params: TaxCalculationParams): Promise<string[]> {
    const suggestions: string[] = [];

    try {
      // Analyze current situation and provide suggestions
      if (params.grossIncome > 100000 && (!params.deductions?.retirementContributions || params.deductions.retirementContributions < 22500)) {
        suggestions.push('Consider maximizing your 401(k) contributions to reduce taxable income');
      }

      if (params.deductions?.itemizedDeductions && params.deductions.itemizedDeductions < 12950) {
        suggestions.push('Consider taking the standard deduction instead of itemizing');
      }

      if (params.grossIncome > 200000 && !params.deductions?.healthSavingsAccount) {
        suggestions.push('Consider contributing to a Health Savings Account (HSA) for tax savings');
      }

      return suggestions;
    } catch (error) {
      throw new Error(`Tax optimization analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
