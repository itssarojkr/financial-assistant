
import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';
import type { Json } from '@/integrations/supabase/types';

export interface TaxCalculationResult {
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  totalTax: number;
  takeHomeSalary: number;
  taxableIncome: number;
  effectiveTaxRate?: number;
  brackets?: TaxBracket[];
  breakdown?: {
    deductions: number;
    rebates: number;
    additionalTaxes: number;
  };
}

export interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
  tax: number;
}

export interface TaxCalculationParams {
  country: string;
  salary: number;
  currency: string;
  regime?: string;
  filingStatus?: string;
  state?: string;
  deductions?: number;
}

export interface TaxCalculationMetadata {
  country: string;
  currency: string;
  regime?: string;
  filingStatus?: string;
  state?: string;
  deductions?: number;
  calculatedAt: string;
}

export interface TaxCalculationData {
  id: string;
  user_id: string;
  data_type: string;
  data_name: string;
  data_content: unknown;
  created_at: string | null;
  updated_at: string | null;
}

export interface TaxCalculationServiceError {
  message: string;
  code?: string | undefined;
  details?: string | undefined;
}

export interface TaxCalculationServiceResponse<T> {
  data: T | null;
  error: TaxCalculationServiceError | PostgrestError | null;
}

export class TaxCalculationService {
  static async calculateTax(params: TaxCalculationParams): Promise<TaxCalculationResult> {
    const { country, salary, currency, regime, filingStatus, state, deductions = 0 } = params;

    switch (country.toLowerCase()) {
      case 'india':
        return this.calculateIndiaTax(salary, regime as 'old' | 'new', deductions);
      case 'united states':
      case 'usa':
        return this.calculateUSTax(salary, filingStatus as 'single' | 'married' | 'head', state || '', deductions);
      case 'canada':
        return this.calculateCanadaTax(salary, state || '', deductions);
      case 'united kingdom':
      case 'uk':
        return this.calculateUKTax(salary, deductions);
      case 'australia':
        return this.calculateAustraliaTax(salary, deductions);
      case 'germany':
        return this.calculateGermanyTax(salary, deductions);
      case 'france':
        return this.calculateFranceTax(salary, deductions);
      case 'brazil':
        return this.calculateBrazilTax(salary, deductions);
      case 'south africa':
        return this.calculateSouthAfricaTax(salary, deductions);
      default:
        return this.calculateGenericTax(salary, deductions);
    }
  }

  private static calculateIndiaTax(salary: number, regime: 'old' | 'new' = 'new', deductions: number = 0): TaxCalculationResult {
    const brackets = regime === 'new' 
      ? [
          { min: 0, max: 300000, rate: 0, tax: 0 },
          { min: 300001, max: 600000, rate: 5, tax: 0 },
          { min: 600001, max: 900000, rate: 10, tax: 0 },
          { min: 900001, max: 1200000, rate: 15, tax: 0 },
          { min: 1200001, max: 1500000, rate: 20, tax: 0 },
          { min: 1500001, max: null, rate: 30, tax: 0 }
        ]
      : [
          { min: 0, max: 250000, rate: 0, tax: 0 },
          { min: 250001, max: 500000, rate: 5, tax: 0 },
          { min: 500001, max: 1000000, rate: 20, tax: 0 },
          { min: 1000001, max: null, rate: 30, tax: 0 }
        ];

    const taxableIncome = Math.max(0, salary - deductions);
    let totalTax = 0;

    for (const bracket of brackets) {
      if (taxableIncome > bracket.min) {
        const taxableInBracket = bracket.max 
          ? Math.min(taxableIncome, bracket.max) - bracket.min
          : taxableIncome - bracket.min;
        bracket.tax = taxableInBracket * (bracket.rate / 100);
        totalTax += bracket.tax;
      }
    }

    // Add cess (4% on total tax)
    const cess = totalTax * 0.04;
    totalTax += cess;

    return {
      federalTax: totalTax,
      stateTax: 0,
      socialSecurity: 0,
      medicare: 0,
      totalTax,
      takeHomeSalary: salary - totalTax,
      taxableIncome,
      effectiveTaxRate: (totalTax / salary) * 100,
      brackets,
      breakdown: {
        deductions,
        rebates: 0,
        additionalTaxes: cess
      }
    };
  }

  private static calculateUSTax(salary: number, filingStatus: 'single' | 'married' | 'head' = 'single', state: string = '', deductions: number = 0): TaxCalculationResult {
    // 2024 tax brackets for single filers
    const brackets = [
      { min: 0, max: 11000, rate: 10, tax: 0 },
      { min: 11001, max: 44725, rate: 12, tax: 0 },
      { min: 44726, max: 95375, rate: 22, tax: 0 },
      { min: 95376, max: 182050, rate: 24, tax: 0 },
      { min: 182051, max: 231250, rate: 32, tax: 0 },
      { min: 231251, max: 578125, rate: 35, tax: 0 },
      { min: 578126, max: null, rate: 37, tax: 0 }
    ];

    const standardDeduction = filingStatus === 'married' ? 27700 : 13850;
    const taxableIncome = Math.max(0, salary - standardDeduction - deductions);
    
    let federalTax = 0;
    for (const bracket of brackets) {
      if (taxableIncome > bracket.min) {
        const taxableInBracket = bracket.max 
          ? Math.min(taxableIncome, bracket.max) - bracket.min
          : taxableIncome - bracket.min;
        bracket.tax = taxableInBracket * (bracket.rate / 100);
        federalTax += bracket.tax;
      }
    }

    const socialSecurity = Math.min(salary * 0.062, 160200 * 0.062);
    const medicare = salary * 0.0145;
    const stateTax = this.getStateTax(salary, state);
    
    const totalTax = federalTax + socialSecurity + medicare + stateTax;

    return {
      federalTax,
      stateTax,
      socialSecurity,
      medicare,
      totalTax,
      takeHomeSalary: salary - totalTax,
      taxableIncome,
      effectiveTaxRate: (totalTax / salary) * 100,
      brackets
    };
  }

  private static getStateTax(salary: number, state: string): number {
    const stateTaxRates: Record<string, number> = {
      'california': 0.13,
      'new york': 0.109,
      'texas': 0,
      'florida': 0,
      'washington': 0,
      'nevada': 0,
      'wyoming': 0,
      'south dakota': 0,
      'tennessee': 0
    };
    
    return salary * (stateTaxRates[state.toLowerCase()] || 0.05);
  }

  private static calculateCanadaTax(salary: number, province: string = '', deductions: number = 0): TaxCalculationResult {
    // Federal tax brackets
    const federalBrackets = [
      { min: 0, max: 53359, rate: 15, tax: 0 },
      { min: 53360, max: 106717, rate: 20.5, tax: 0 },
      { min: 106718, max: 165430, rate: 26, tax: 0 },
      { min: 165431, max: 235675, rate: 29, tax: 0 },
      { min: 235676, max: null, rate: 33, tax: 0 }
    ];

    const basicPersonalAmount = 15000;
    const taxableIncome = Math.max(0, salary - basicPersonalAmount - deductions);
    
    let federalTax = 0;
    for (const bracket of federalBrackets) {
      if (taxableIncome > bracket.min) {
        const taxableInBracket = bracket.max 
          ? Math.min(taxableIncome, bracket.max) - bracket.min
          : taxableIncome - bracket.min;
        bracket.tax = taxableInBracket * (bracket.rate / 100);
        federalTax += bracket.tax;
      }
    }

    const provincialTax = this.getProvincialTax(salary, province);
    const totalTax = federalTax + provincialTax;

    return {
      federalTax,
      stateTax: provincialTax,
      socialSecurity: 0,
      medicare: 0,
      totalTax,
      takeHomeSalary: salary - totalTax,
      taxableIncome,
      effectiveTaxRate: (totalTax / salary) * 100,
      brackets: federalBrackets
    };
  }

  private static getProvincialTax(salary: number, province: string): number {
    const provincialRates: Record<string, number> = {
      'ontario': 0.0597,
      'quebec': 0.14,
      'british columbia': 0.0506,
      'alberta': 0.10,
      'manitoba': 0.108,
      'saskatchewan': 0.105,
      'nova scotia': 0.0879,
      'new brunswick': 0.0968,
      'newfoundland': 0.087,
      'pei': 0.098
    };
    
    return salary * (provincialRates[province.toLowerCase()] || 0.10);
  }

  private static calculateUKTax(salary: number, deductions: number = 0): TaxCalculationResult {
    const personalAllowance = 12570;
    const taxableIncome = Math.max(0, salary - personalAllowance - deductions);
    
    const brackets = [
      { min: 0, max: 37700, rate: 20, tax: 0 },
      { min: 37701, max: 125140, rate: 40, tax: 0 },
      { min: 125141, max: null, rate: 45, tax: 0 }
    ];

    let incomeTax = 0;
    for (const bracket of brackets) {
      if (taxableIncome > bracket.min) {
        const taxableInBracket = bracket.max 
          ? Math.min(taxableIncome, bracket.max) - bracket.min
          : taxableIncome - bracket.min;
        bracket.tax = taxableInBracket * (bracket.rate / 100);
        incomeTax += bracket.tax;
      }
    }

    const nationalInsurance = this.calculateUKNI(salary);
    const totalTax = incomeTax + nationalInsurance;

    return {
      federalTax: incomeTax,
      stateTax: 0,
      socialSecurity: nationalInsurance,
      medicare: 0,
      totalTax,
      takeHomeSalary: salary - totalTax,
      taxableIncome,
      effectiveTaxRate: (totalTax / salary) * 100,
      brackets
    };
  }

  private static calculateUKNI(salary: number): number {
    const niThreshold = 12570;
    const niRate = 0.12;
    return Math.max(0, (salary - niThreshold) * niRate);
  }

  private static calculateAustraliaTax(salary: number, deductions: number = 0): TaxCalculationResult {
    const brackets = [
      { min: 0, max: 18200, rate: 0, tax: 0 },
      { min: 18201, max: 45000, rate: 19, tax: 0 },
      { min: 45001, max: 120000, rate: 32.5, tax: 0 },
      { min: 120001, max: 180000, rate: 37, tax: 0 },
      { min: 180001, max: null, rate: 45, tax: 0 }
    ];

    const taxableIncome = Math.max(0, salary - deductions);
    let incomeTax = 0;

    for (const bracket of brackets) {
      if (taxableIncome > bracket.min) {
        const taxableInBracket = bracket.max 
          ? Math.min(taxableIncome, bracket.max) - bracket.min
          : taxableIncome - bracket.min;
        bracket.tax = taxableInBracket * (bracket.rate / 100);
        incomeTax += bracket.tax;
      }
    }

    const medicareLevy = salary * 0.02;
    const totalTax = incomeTax + medicareLevy;

    return {
      federalTax: incomeTax,
      stateTax: 0,
      socialSecurity: 0,
      medicare: medicareLevy,
      totalTax,
      takeHomeSalary: salary - totalTax,
      taxableIncome,
      effectiveTaxRate: (totalTax / salary) * 100,
      brackets
    };
  }

  private static calculateGermanyTax(salary: number, deductions: number = 0): TaxCalculationResult {
    const taxableIncome = Math.max(0, salary - deductions);
    
    const brackets = [
      { min: 0, max: 10908, rate: 0, tax: 0 },
      { min: 10909, max: 62809, rate: 42, tax: 0 },
      { min: 62810, max: null, rate: 45, tax: 0 }
    ];

    let incomeTax = 0;
    for (const bracket of brackets) {
      if (taxableIncome > bracket.min) {
        const taxableInBracket = bracket.max 
          ? Math.min(taxableIncome, bracket.max) - bracket.min
          : taxableIncome - bracket.min;
        bracket.tax = taxableInBracket * (bracket.rate / 100);
        incomeTax += bracket.tax;
      }
    }

    const solidarityTax = incomeTax * 0.055;
    const socialContributions = salary * 0.2;
    
    const totalTax = incomeTax + solidarityTax + socialContributions;

    return {
      federalTax: incomeTax,
      stateTax: solidarityTax,
      socialSecurity: socialContributions,
      medicare: 0,
      totalTax,
      takeHomeSalary: salary - totalTax,
      taxableIncome,
      effectiveTaxRate: (totalTax / salary) * 100,
      brackets: []
    };
  }

  private static calculateFranceTax(salary: number, deductions: number = 0): TaxCalculationResult {
    const abatement = salary * 0.1; // 10% professional expenses abatement
    const taxableIncome = Math.max(0, salary - abatement - deductions);
    
    const brackets = [
      { min: 0, max: 10777, rate: 0, tax: 0 },
      { min: 10778, max: 27478, rate: 11, tax: 0 },
      { min: 27479, max: 78570, rate: 30, tax: 0 },
      { min: 78571, max: 168994, rate: 41, tax: 0 },
      { min: 168995, max: null, rate: 45, tax: 0 }
    ];

    let incomeTax = 0;
    for (const bracket of brackets) {
      if (taxableIncome > bracket.min) {
        const taxableInBracket = bracket.max 
          ? Math.min(taxableIncome, bracket.max) - bracket.min
          : taxableIncome - bracket.min;
        bracket.tax = taxableInBracket * (bracket.rate / 100);
        incomeTax += bracket.tax;
      }
    }

    const socialContributions = salary * 0.23;
    const totalTax = incomeTax + socialContributions;

    return {
      federalTax: incomeTax,
      stateTax: 0,
      socialSecurity: socialContributions,
      medicare: 0,
      totalTax,
      takeHomeSalary: salary - totalTax,
      taxableIncome,
      effectiveTaxRate: (totalTax / salary) * 100,
      brackets
    };
  }

  private static calculateBrazilTax(salary: number, deductions: number = 0): TaxCalculationResult {
    const annualSalary = salary * 12;
    const taxableIncome = Math.max(0, annualSalary - deductions);
    
    const brackets = [
      { min: 0, max: 22847.76, rate: 0, tax: 0 },
      { min: 22847.77, max: 33919.80, rate: 7.5, tax: 0 },
      { min: 33919.81, max: 45012.60, rate: 15, tax: 0 },
      { min: 45012.61, max: 55976.16, rate: 22.5, tax: 0 },
      { min: 55976.17, max: null, rate: 27.5, tax: 0 }
    ];

    let annualIncomeTax = 0;
    for (const bracket of brackets) {
      if (taxableIncome > bracket.min) {
        const taxableInBracket = bracket.max 
          ? Math.min(taxableIncome, bracket.max) - bracket.min
          : taxableIncome - bracket.min;
        bracket.tax = taxableInBracket * (bracket.rate / 100);
        annualIncomeTax += bracket.tax;
      }
    }

    const monthlyIncomeTax = annualIncomeTax / 12;
    const inss = Math.min(salary * 0.14, 877.24);
    const totalTax = monthlyIncomeTax + inss;

    return {
      federalTax: monthlyIncomeTax,
      stateTax: 0,
      socialSecurity: inss,
      medicare: 0,
      totalTax,
      takeHomeSalary: salary - totalTax,
      taxableIncome: salary,
      effectiveTaxRate: (totalTax / salary) * 100,
      brackets
    };
  }

  private static calculateSouthAfricaTax(salary: number, deductions: number = 0): TaxCalculationResult {
    const annualSalary = salary * 12;
    const primaryRebate = 17235;
    
    const brackets = [
      { min: 0, max: 237100, rate: 18, tax: 0 },
      { min: 237101, max: 370500, rate: 26, tax: 0 },
      { min: 370501, max: 512800, rate: 31, tax: 0 },
      { min: 512801, max: 673000, rate: 36, tax: 0 },
      { min: 673001, max: 857900, rate: 39, tax: 0 },
      { min: 857901, max: 1817000, rate: 41, tax: 0 },
      { min: 1817001, max: null, rate: 45, tax: 0 }
    ];

    let annualIncomeTax = 0;
    for (const bracket of brackets) {
      if (annualSalary > bracket.min) {
        const taxableInBracket = bracket.max 
          ? Math.min(annualSalary, bracket.max) - bracket.min
          : annualSalary - bracket.min;
        bracket.tax = taxableInBracket * (bracket.rate / 100);
        annualIncomeTax += bracket.tax;
      }
    }

    annualIncomeTax = Math.max(0, annualIncomeTax - primaryRebate);
    const monthlyIncomeTax = annualIncomeTax / 12;
    const uif = Math.min(salary * 0.02, 177.12);
    
    const totalTax = monthlyIncomeTax + uif;

    return {
      federalTax: monthlyIncomeTax,
      stateTax: 0,
      socialSecurity: uif,
      medicare: 0,
      totalTax,
      takeHomeSalary: salary - totalTax,
      taxableIncome: salary,
      effectiveTaxRate: (totalTax / salary) * 100,
      brackets
    };
  }

  private static calculateGenericTax(salary: number, deductions: number = 0): TaxCalculationResult {
    const taxableIncome = Math.max(0, salary - deductions);
    const estimatedTaxRate = 0.25; // 25% estimated tax rate
    const totalTax = taxableIncome * estimatedTaxRate;

    return {
      federalTax: totalTax,
      stateTax: 0,
      socialSecurity: 0,
      medicare: 0,
      totalTax,
      takeHomeSalary: salary - totalTax,
      taxableIncome,
      effectiveTaxRate: (totalTax / salary) * 100,
      brackets: []
    };
  }

  static async saveTaxCalculation(userId: string, calculation: TaxCalculationResult, metadata: TaxCalculationMetadata): Promise<TaxCalculationServiceResponse<TaxCalculationData>> {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .insert({
          user_id: userId,
          data_type: 'tax_calculation',
          data_name: `Tax Calculation - ${new Date().toLocaleDateString()}`,
          data_content: {
            ...calculation,
            metadata,
            calculatedAt: new Date().toISOString()
          } as unknown as Json
        })
        .select()
        .single();

      if (error) throw error;

      return { data: data as unknown as TaxCalculationData, error: null };
    } catch (error) {
      console.error('Error saving tax calculation:', error);
      const serviceError: TaxCalculationServiceError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: error instanceof PostgrestError ? error.code : undefined,
        details: error instanceof PostgrestError ? error.details : undefined,
      };
      return { data: null, error: serviceError };
    }
  }

  static async getUserTaxCalculations(userId: string): Promise<TaxCalculationServiceResponse<TaxCalculationData[]>> {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', userId)
        .eq('data_type', 'tax_calculation')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return { data: data as unknown as TaxCalculationData[], error: null };
    } catch (error) {
      console.error('Error fetching tax calculations:', error);
      const serviceError: TaxCalculationServiceError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: error instanceof PostgrestError ? error.code : undefined,
        details: error instanceof PostgrestError ? error.details : undefined,
      };
      return { data: null, error: serviceError };
    }
  }
}
