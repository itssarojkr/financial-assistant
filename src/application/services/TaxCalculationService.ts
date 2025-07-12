
import { supabase } from '@/integrations/supabase/client';

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
    const cpp = Math.min((salary - 3500) * 0.0595, 3754.45);
    const ei = Math.min(salary * 0.0163, 1002.45);
    
    const totalTax = federalTax + provincialTax + cpp + ei;

    return {
      federalTax,
      stateTax: provincialTax,
      socialSecurity: cpp,
      medicare: ei,
      totalTax,
      takeHomeSalary: salary - totalTax,
      taxableIncome,
      effectiveTaxRate: (totalTax / salary) * 100,
      brackets: federalBrackets
    };
  }

  private static getProvincialTax(salary: number, province: string): number {
    const provincialRates: Record<string, number> = {
      'ontario': 0.1316,
      'quebec': 0.25,
      'british columbia': 0.205,
      'alberta': 0.15,
      'manitoba': 0.1775,
      'saskatchewan': 0.145,
      'nova scotia': 0.21,
      'new brunswick': 0.1598,
      'newfoundland': 0.187,
      'prince edward island': 0.167
    };
    
    return salary * (provincialRates[province.toLowerCase()] || 0.1);
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
    if (salary <= 12570) return 0;
    if (salary <= 50270) return (salary - 12570) * 0.12;
    return (50270 - 12570) * 0.12 + (salary - 50270) * 0.02;
  }

  private static calculateAustraliaTax(salary: number, deductions: number = 0): TaxCalculationResult {
    const taxFreeThreshold = 18200;
    const taxableIncome = Math.max(0, salary - taxFreeThreshold - deductions);
    
    const brackets = [
      { min: 0, max: 18200, rate: 0, tax: 0 },
      { min: 18201, max: 45000, rate: 19, tax: 0 },
      { min: 45001, max: 120000, rate: 32.5, tax: 0 },
      { min: 120001, max: 180000, rate: 37, tax: 0 },
      { min: 180001, max: null, rate: 45, tax: 0 }
    ];

    let incomeTax = 0;
    for (const bracket of brackets) {
      if (salary > bracket.min) {
        const taxableInBracket = bracket.max 
          ? Math.min(salary, bracket.max) - bracket.min
          : salary - bracket.min;
        bracket.tax = taxableInBracket * (bracket.rate / 100);
        incomeTax += bracket.tax;
      }
    }

    const medicareLevy = salary > 23365 ? salary * 0.02 : 0;
    const superannuation = salary * 0.105;
    
    const totalTax = incomeTax + medicareLevy;

    return {
      federalTax: incomeTax,
      stateTax: 0,
      socialSecurity: 0,
      medicare: medicareLevy,
      totalTax,
      takeHomeSalary: salary - totalTax - superannuation,
      taxableIncome: salary,
      effectiveTaxRate: (totalTax / salary) * 100,
      brackets
    };
  }

  private static calculateGermanyTax(salary: number, deductions: number = 0): TaxCalculationResult {
    const basicAllowance = 10908;
    const taxableIncome = Math.max(0, salary - basicAllowance - deductions);
    
    let incomeTax = 0;
    if (taxableIncome > 62810) {
      incomeTax = 17543.26 + (taxableIncome - 62810) * 0.42;
    } else if (taxableIncome > 17005) {
      incomeTax = 922.98 + (taxableIncome - 17005) * 0.24;
    } else if (taxableIncome > 10908) {
      incomeTax = (taxableIncome - 10908) * 0.14;
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

  static async saveTaxCalculation(userId: string, calculation: TaxCalculationResult, metadata: any): Promise<{ data: any; error: any }> {
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
          }
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  static async getUserTaxCalculations(userId: string): Promise<{ data: any[] | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', userId)
        .eq('data_type', 'tax_calculation')
        .order('created_at', { ascending: false });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }
}
