import { TaxBracket } from './tax-utils';

// Core Strategy Interface
export interface TaxCalculationStrategy {
  readonly name: string;
  readonly currency: string;
  readonly countryCode: string;
  
  // Core calculation method
  calculateTax(params: TaxCalculationParams): TaxCalculationResult;
  
  // Configuration methods
  getBrackets(regime?: string): TaxBracketConfig[];
  getDeductions(regime?: string): DeductionConfig[];
  getAdditionalTaxes(): AdditionalTaxConfig[];
  
  // Validation methods
  validateParams(params: TaxCalculationParams): ValidationResult;
  getMaxDeductions(regime?: string): Record<string, number>;
}

// Parameter and Result Interfaces
export interface TaxCalculationParams {
  grossSalary: number;
  deductions: Record<string, number>;
  regime?: string;
  additionalParams?: Record<string, any>;
}

export interface TaxCalculationResult {
  brackets: TaxBracket[];
  totalTax: number;
  takeHomeSalary: number;
  taxableIncome: number;
  additionalTaxes: Record<string, number>;
  breakdown: Record<string, number>;
  effectiveTaxRate: number;
  marginalTaxRate: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Configuration Interfaces
export interface TaxBracketConfig {
  min: number;
  max: number | null;
  rate: number;
  label?: string;
}

export interface DeductionConfig {
  key: string;
  label: string;
  maxValue?: number;
  tooltip?: string;
  applicableRegimes?: string[];
  validationFn?: (value: number, income: number) => boolean;
}

export interface AdditionalTaxConfig {
  key: string;
  label: string;
  calculationFn: (params: AdditionalTaxParams) => number;
  tooltip?: string;
  applicableRegimes?: string[];
}

export interface AdditionalTaxParams {
  grossSalary: number;
  taxableIncome: number;
  baseTax: number;
  regime?: string;
  additionalParams?: Record<string, any>;
}

// Base Strategy Class
export abstract class BaseTaxStrategy implements TaxCalculationStrategy {
  abstract readonly name: string;
  abstract readonly currency: string;
  abstract readonly countryCode: string;

  abstract calculateTax(params: TaxCalculationParams): TaxCalculationResult;
  abstract getBrackets(regime?: string): TaxBracketConfig[];
  abstract getDeductions(regime?: string): DeductionConfig[];
  abstract getAdditionalTaxes(): AdditionalTaxConfig[];

  validateParams(params: TaxCalculationParams): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (params.grossSalary < 0) {
      errors.push('Gross salary cannot be negative');
    }

    if (params.grossSalary === 0) {
      warnings.push('Gross salary is zero');
    }

    // Validate deductions
    const maxDeductions = this.getMaxDeductions(params.regime);
    Object.entries(params.deductions).forEach(([key, value]) => {
      if (value < 0) {
        errors.push(`Deduction ${key} cannot be negative`);
      }
      if (maxDeductions[key] && value > maxDeductions[key]) {
        warnings.push(`Deduction ${key} exceeds maximum allowed value`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  getMaxDeductions(regime?: string): Record<string, number> {
    const deductions = this.getDeductions(regime);
    const maxDeductions: Record<string, number> = {};
    
    deductions.forEach(deduction => {
      if (deduction.maxValue !== undefined) {
        maxDeductions[deduction.key] = deduction.maxValue;
      }
    });

    return maxDeductions;
  }

  // Helper methods for common calculations
  protected calculateBracketTax(taxableIncome: number, brackets: TaxBracketConfig[]): TaxBracket[] {
    return brackets.map(bracket => {
      if (taxableIncome <= bracket.min) {
        return { ...bracket, taxPaid: 0 };
      }
      
      const upper = bracket.max === null ? taxableIncome : Math.min(taxableIncome, bracket.max);
      const band = Math.max(0, upper - bracket.min);
      const tax = band * bracket.rate;
      
      return { ...bracket, taxPaid: tax };
    });
  }

  protected calculateTotalDeductions(deductions: Record<string, number>, regime?: string): number {
    const deductionConfigs = this.getDeductions(regime);
    const maxDeductions = this.getMaxDeductions(regime);
    
    return deductionConfigs.reduce((total, config) => {
      const value = deductions[config.key] || 0;
      const maxValue = maxDeductions[config.key];
      
      if (maxValue !== undefined) {
        return total + Math.min(value, maxValue);
      }
      
      return total + Math.max(0, value);
    }, 0);
  }

  protected calculateAdditionalTaxes(
    params: TaxCalculationParams,
    taxableIncome: number,
    baseTax: number
  ): Record<string, number> {
    const additionalTaxes: Record<string, number> = {};
    const taxConfigs = this.getAdditionalTaxes();
    
    taxConfigs.forEach(config => {
      if (!config.applicableRegimes || config.applicableRegimes.includes(params.regime || 'default')) {
        additionalTaxes[config.key] = config.calculationFn({
          grossSalary: params.grossSalary,
          taxableIncome,
          baseTax,
          regime: params.regime,
          additionalParams: params.additionalParams
        });
      }
    });

    return additionalTaxes;
  }

  protected calculateEffectiveTaxRate(totalTax: number, grossSalary: number): number {
    return grossSalary > 0 ? (totalTax / grossSalary) * 100 : 0;
  }

  protected calculateMarginalTaxRate(taxableIncome: number, brackets: TaxBracketConfig[]): number {
    const bracket = brackets.find(b => 
      taxableIncome > b.min && (b.max === null || taxableIncome <= b.max)
    );
    return bracket ? bracket.rate * 100 : 0;
  }
}

// Strategy Registry
export class TaxStrategyRegistry {
  private static strategies = new Map<string, TaxCalculationStrategy>();

  static register(strategy: TaxCalculationStrategy): void {
    this.strategies.set(strategy.countryCode, strategy);
  }

  static get(countryCode: string): TaxCalculationStrategy | null {
    return this.strategies.get(countryCode) || null;
  }

  static getAll(): TaxCalculationStrategy[] {
    return Array.from(this.strategies.values());
  }

  static getSupportedCountries(): string[] {
    return Array.from(this.strategies.keys());
  }

  static hasStrategy(countryCode: string): boolean {
    return this.strategies.has(countryCode);
  }
}

// Factory for creating strategy instances
export class TaxStrategyFactory {
  static createStrategy(countryCode: string): TaxCalculationStrategy | null {
    return TaxStrategyRegistry.get(countryCode);
  }

  static createStrategyByName(countryName: string): TaxCalculationStrategy | null {
    const countryMap: Record<string, string> = {
      'India': 'IN',
      'United States': 'US',
      'Canada': 'CA',
      'United Kingdom': 'UK',
      'UK': 'UK',
      'Australia': 'AU',
      'Germany': 'DE',
      'France': 'FR',
      'Brazil': 'BR',
      'South Africa': 'ZA'
    };

    const code = countryMap[countryName];
    console.log('Looking for strategy for country:', countryName, 'with code:', code);
    const strategy = code ? this.createStrategy(code) : null;
    console.log('Found strategy:', strategy?.name);
    return strategy;
  }
} 