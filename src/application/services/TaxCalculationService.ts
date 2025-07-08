import { User } from '@/core/domain/entities/User';
import { UserService } from './UserService';

/**
 * Tax calculation result interface
 */
export interface TaxCalculationResult {
  grossIncome: number;
  netIncome: number;
  totalTax: number;
  effectiveTaxRate: number;
  taxBreakdown: {
    federalTax: number;
    stateTax: number;
    localTax: number;
    socialSecurity: number;
    medicare: number;
    otherTaxes: number;
  };
  deductions: {
    standardDeduction: number;
    itemizedDeductions: number;
    totalDeductions: number;
  };
  credits: {
    earnedIncomeCredit: number;
    childTaxCredit: number;
    otherCredits: number;
    totalCredits: number;
  };
  marginalTaxRate: number;
  taxBracket: {
    bracket: string;
    rate: number;
    range: {
      min: number;
      max: number;
    };
  };
}

/**
 * Tax calculation parameters
 */
export interface TaxCalculationParams {
  grossIncome: number;
  country: string;
  state?: string;
  city?: string;
  filingStatus: 'single' | 'married' | 'head_of_household' | 'married_separate';
  age: number;
  dependents: number;
  deductions: {
    standardDeduction: number;
    itemizedDeductions: number;
    retirementContributions: number;
    healthSavingsAccount: number;
    studentLoanInterest: number;
  };
  credits: {
    earnedIncomeCredit: number;
    childTaxCredit: number;
    educationCredits: number;
    otherCredits: number;
  };
  additionalIncome: {
    interest: number;
    dividends: number;
    capitalGains: number;
    rentalIncome: number;
    businessIncome: number;
  };
  year: number;
}

/**
 * Tax calculation service for orchestrating tax-related business logic
 * 
 * This service coordinates tax calculations and implements
 * application-level tax management operations.
 */
export class TaxCalculationService {
  private readonly userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  /**
   * Calculates tax for a given set of parameters
   */
  async calculateTax(params: TaxCalculationParams): Promise<TaxCalculationResult> {
    try {
      // Validate input parameters
      this.validateTaxCalculationParams(params);

      // Calculate adjusted gross income
      const adjustedGrossIncome = this.calculateAdjustedGrossIncome(params);

      // Calculate deductions
      const deductions = this.calculateDeductions(params);

      // Calculate taxable income
      const taxableIncome = Math.max(0, adjustedGrossIncome - deductions.totalDeductions);

      // Calculate federal tax
      const federalTax = this.calculateFederalTax(taxableIncome, params.filingStatus, params.year);

      // Calculate state tax
      const stateTax = params.state ? this.calculateStateTax(taxableIncome, params.state, params.year) : 0;

      // Calculate local tax
      const localTax = params.city ? this.calculateLocalTax(taxableIncome, params.city, params.year) : 0;

      // Calculate social security and medicare
      const socialSecurity = this.calculateSocialSecurity(params.grossIncome, params.year);
      const medicare = this.calculateMedicare(params.grossIncome, params.year);

      // Calculate other taxes
      const otherTaxes = this.calculateOtherTaxes(params);

      // Calculate total tax
      const totalTax = federalTax + stateTax + localTax + socialSecurity + medicare + otherTaxes;

      // Calculate credits
      const credits = this.calculateCredits(params, adjustedGrossIncome);

      // Calculate final tax
      const finalTax = Math.max(0, totalTax - credits.totalCredits);

      // Calculate net income
      const netIncome = params.grossIncome - finalTax;

      // Calculate effective tax rate
      const effectiveTaxRate = params.grossIncome > 0 ? (finalTax / params.grossIncome) * 100 : 0;

      // Get tax bracket information
      const taxBracket = this.getTaxBracket(taxableIncome, params.filingStatus, params.year);

      return {
        grossIncome: params.grossIncome,
        netIncome,
        totalTax: finalTax,
        effectiveTaxRate,
        taxBreakdown: {
          federalTax,
          stateTax,
          localTax,
          socialSecurity,
          medicare,
          otherTaxes,
        },
        deductions,
        credits,
        marginalTaxRate: taxBracket.rate,
        taxBracket,
      };
    } catch (error) {
      throw new Error(`Tax calculation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Calculates tax for a specific user
   */
  async calculateTaxForUser(userId: string, grossIncome: number, additionalParams?: Partial<TaxCalculationParams>): Promise<TaxCalculationResult> {
    try {
      const user = await this.userService.getUserById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get user's primary location
      const location = user.getPrimaryLocation();
      const [country, state, city] = this.parseLocation(location);

      // Get user's preferences
      const preferences = user.preferences;
      const filingStatus = preferences?.taxRegime === 'old' ? 'single' : 'single'; // Default, could be enhanced

      // Create tax calculation parameters
      const params: TaxCalculationParams = {
        grossIncome,
        country: country || 'US',
        state,
        city,
        filingStatus,
        age: 30, // Default, could be enhanced with user profile
        dependents: 0, // Default, could be enhanced with user profile
        deductions: {
          standardDeduction: 0,
          itemizedDeductions: 0,
          retirementContributions: 0,
          healthSavingsAccount: 0,
          studentLoanInterest: 0,
        },
        credits: {
          earnedIncomeCredit: 0,
          childTaxCredit: 0,
          educationCredits: 0,
          otherCredits: 0,
        },
        additionalIncome: {
          interest: 0,
          dividends: 0,
          capitalGains: 0,
          rentalIncome: 0,
          businessIncome: 0,
        },
        year: new Date().getFullYear(),
        ...additionalParams,
      };

      return await this.calculateTax(params);
    } catch (error) {
      throw new Error(`Failed to calculate tax for user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Compares tax scenarios
   */
  async compareTaxScenarios(
    baseParams: TaxCalculationParams,
    scenarios: Array<{
      name: string;
      params: Partial<TaxCalculationParams>;
    }>
  ): Promise<{
    baseScenario: TaxCalculationResult;
    scenarios: Array<{
      name: string;
      result: TaxCalculationResult;
      difference: {
        netIncome: number;
        totalTax: number;
        effectiveTaxRate: number;
      };
    }>;
  }> {
    try {
      const baseScenario = await this.calculateTax(baseParams);
      const scenarioResults = [];

      for (const scenario of scenarios) {
        const scenarioParams = { ...baseParams, ...scenario.params };
        const result = await this.calculateTax(scenarioParams);

        scenarioResults.push({
          name: scenario.name,
          result,
          difference: {
            netIncome: result.netIncome - baseScenario.netIncome,
            totalTax: result.totalTax - baseScenario.totalTax,
            effectiveTaxRate: result.effectiveTaxRate - baseScenario.effectiveTaxRate,
          },
        });
      }

      return {
        baseScenario,
        scenarios: scenarioResults,
      };
    } catch (error) {
      throw new Error(`Failed to compare tax scenarios: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets tax optimization suggestions
   */
  async getTaxOptimizationSuggestions(userId: string, grossIncome: number): Promise<Array<{
    category: string;
    suggestion: string;
    potentialSavings: number;
    priority: 'high' | 'medium' | 'low';
  }>> {
    try {
      const suggestions = [];

      // Analyze retirement contributions
      if (grossIncome > 50000) {
        suggestions.push({
          category: 'Retirement',
          suggestion: 'Consider increasing 401(k) contributions to reduce taxable income',
          potentialSavings: grossIncome * 0.22 * 0.01, // Rough estimate
          priority: 'high' as const,
        });
      }

      // Analyze health savings account
      if (grossIncome > 40000) {
        suggestions.push({
          category: 'Healthcare',
          suggestion: 'Consider contributing to an HSA for tax-free healthcare expenses',
          potentialSavings: 3500 * 0.22, // Rough estimate
          priority: 'medium' as const,
        });
      }

      // Analyze itemized deductions
      suggestions.push({
        category: 'Deductions',
        suggestion: 'Review if itemized deductions exceed standard deduction',
        potentialSavings: 0, // Would need more analysis
        priority: 'medium' as const,
      });

      return suggestions;
    } catch (error) {
      throw new Error(`Failed to get tax optimization suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validates tax calculation parameters
   */
  private validateTaxCalculationParams(params: TaxCalculationParams): void {
    if (params.grossIncome < 0) {
      throw new Error('Gross income cannot be negative');
    }

    if (!params.country) {
      throw new Error('Country is required');
    }

    if (params.age < 0 || params.age > 120) {
      throw new Error('Invalid age');
    }

    if (params.dependents < 0) {
      throw new Error('Number of dependents cannot be negative');
    }

    if (params.year < 2020 || params.year > new Date().getFullYear() + 1) {
      throw new Error('Invalid tax year');
    }
  }

  /**
   * Calculates adjusted gross income
   */
  private calculateAdjustedGrossIncome(params: TaxCalculationParams): number {
    let agi = params.grossIncome;

    // Add additional income
    agi += params.additionalIncome.interest;
    agi += params.additionalIncome.dividends;
    agi += params.additionalIncome.capitalGains;
    agi += params.additionalIncome.rentalIncome;
    agi += params.additionalIncome.businessIncome;

    // Subtract above-the-line deductions
    agi -= params.deductions.retirementContributions;
    agi -= params.deductions.healthSavingsAccount;
    agi -= params.deductions.studentLoanInterest;

    return Math.max(0, agi);
  }

  /**
   * Calculates deductions
   */
  private calculateDeductions(params: TaxCalculationParams): {
    standardDeduction: number;
    itemizedDeductions: number;
    totalDeductions: number;
  } {
    const standardDeduction = this.getStandardDeduction(params.filingStatus, params.year);
    const itemizedDeductions = params.deductions.itemizedDeductions;

    const totalDeductions = Math.max(standardDeduction, itemizedDeductions);

    return {
      standardDeduction,
      itemizedDeductions,
      totalDeductions,
    };
  }

  /**
   * Calculates federal tax (simplified)
   */
  private calculateFederalTax(taxableIncome: number, filingStatus: string, year: number): number {
    // This is a simplified calculation - in a real app, you'd use actual tax brackets
    const brackets = this.getFederalTaxBrackets(filingStatus, year);
    
    let tax = 0;
    let remainingIncome = taxableIncome;

    for (const bracket of brackets) {
      if (remainingIncome <= 0) break;

      const bracketAmount = Math.min(remainingIncome, bracket.max - bracket.min);
      tax += bracketAmount * bracket.rate;
      remainingIncome -= bracketAmount;
    }

    return tax;
  }

  /**
   * Calculates state tax (simplified)
   */
  private calculateStateTax(taxableIncome: number, state: string, year: number): number {
    // Simplified state tax calculation
    const stateTaxRates: Record<string, number> = {
      'CA': 0.075,
      'NY': 0.0685,
      'TX': 0,
      'FL': 0,
      // Add more states as needed
    };

    const rate = stateTaxRates[state.toUpperCase()] || 0.05; // Default 5%
    return taxableIncome * rate;
  }

  /**
   * Calculates local tax (simplified)
   */
  private calculateLocalTax(taxableIncome: number, city: string, year: number): number {
    // Simplified local tax calculation
    return taxableIncome * 0.02; // Default 2%
  }

  /**
   * Calculates social security tax
   */
  private calculateSocialSecurity(income: number, year: number): number {
    const socialSecurityWageBase = 160200; // 2023 limit
    const socialSecurityRate = 0.062; // 6.2%
    
    return Math.min(income, socialSecurityWageBase) * socialSecurityRate;
  }

  /**
   * Calculates medicare tax
   */
  private calculateMedicare(income: number, year: number): number {
    const medicareRate = 0.0145; // 1.45%
    return income * medicareRate;
  }

  /**
   * Calculates other taxes
   */
  private calculateOtherTaxes(params: TaxCalculationParams): number {
    // Simplified calculation for other taxes
    return 0;
  }

  /**
   * Calculates tax credits
   */
  private calculateCredits(params: TaxCalculationParams, adjustedGrossIncome: number): {
    earnedIncomeCredit: number;
    childTaxCredit: number;
    otherCredits: number;
    totalCredits: number;
  } {
    const earnedIncomeCredit = this.calculateEarnedIncomeCredit(adjustedGrossIncome, params.dependents);
    const childTaxCredit = this.calculateChildTaxCredit(params.dependents, adjustedGrossIncome);
    const otherCredits = params.credits.otherCredits;

    const totalCredits = earnedIncomeCredit + childTaxCredit + otherCredits;

    return {
      earnedIncomeCredit,
      childTaxCredit,
      otherCredits,
      totalCredits,
    };
  }

  /**
   * Calculates earned income credit (simplified)
   */
  private calculateEarnedIncomeCredit(adjustedGrossIncome: number, dependents: number): number {
    // Simplified EIC calculation
    if (adjustedGrossIncome < 15000 && dependents > 0) {
      return 1000 * dependents;
    }
    return 0;
  }

  /**
   * Calculates child tax credit (simplified)
   */
  private calculateChildTaxCredit(dependents: number, adjustedGrossIncome: number): number {
    // Simplified child tax credit calculation
    if (adjustedGrossIncome < 200000) {
      return 2000 * dependents;
    }
    return 0;
  }

  /**
   * Gets standard deduction for filing status and year
   */
  private getStandardDeduction(filingStatus: string, year: number): number {
    const deductions: Record<string, number> = {
      single: 13850,
      married: 27700,
      head_of_household: 20800,
      married_separate: 13850,
    };

    return deductions[filingStatus] || 13850;
  }

  /**
   * Gets federal tax brackets (simplified)
   */
  private getFederalTaxBrackets(filingStatus: string, year: number): Array<{
    min: number;
    max: number;
    rate: number;
  }> {
    // Simplified 2023 tax brackets for single filers
    return [
      { min: 0, max: 11000, rate: 0.10 },
      { min: 11000, max: 44725, rate: 0.12 },
      { min: 44725, max: 95375, rate: 0.22 },
      { min: 95375, max: 182100, rate: 0.24 },
      { min: 182100, max: 231250, rate: 0.32 },
      { min: 231250, max: 578125, rate: 0.35 },
      { min: 578125, max: Infinity, rate: 0.37 },
    ];
  }

  /**
   * Gets tax bracket information
   */
  private getTaxBracket(taxableIncome: number, filingStatus: string, year: number): {
    bracket: string;
    rate: number;
    range: {
      min: number;
      max: number;
    };
  } {
    const brackets = this.getFederalTaxBrackets(filingStatus, year);
    
    for (const bracket of brackets) {
      if (taxableIncome >= bracket.min && taxableIncome <= bracket.max) {
        return {
          bracket: `${bracket.rate * 100}%`,
          rate: bracket.rate,
          range: {
            min: bracket.min,
            max: bracket.max,
          },
        };
      }
    }

    return {
      bracket: '37%',
      rate: 0.37,
      range: { min: 578125, max: Infinity },
    };
  }

  /**
   * Parses location string into country, state, and city
   */
  private parseLocation(location?: string): [string?, string?, string?] {
    if (!location) return [undefined, undefined, undefined];

    const parts = location.split(',').map(part => part.trim());
    
    if (parts.length === 1) {
      return [parts[0], undefined, undefined];
    } else if (parts.length === 2) {
      return [parts[1], parts[0], undefined];
    } else if (parts.length >= 3) {
      return [parts[2], parts[1], parts[0]];
    }

    return [undefined, undefined, undefined];
  }
} 