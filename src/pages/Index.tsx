import React, { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { UserDataService, TaxCalculationData } from '@/application/services/UserDataService';
import { CalculationStorageService } from '@/application/services/CalculationStorageService';
import { Header } from '@/components/layout/Header';
import { CountrySelector } from '@/components/CountrySelector';
import { SalaryInput } from '@/components/SalaryInput';
import TaxCalculator from '@/components/TaxCalculator';
import LivingExpenses from '@/components/LivingExpenses';
import SavingsAnalysis from '@/components/SavingsAnalysis';
import { FinancialDashboard } from '@/components/dashboard/FinancialDashboard';
import { SignInModal } from '@/components/auth/SignInModal';
import { SaveCalculationModal } from '@/components/modals/SaveCalculationModal';
import { LoadCalculationModal } from '@/components/modals/LoadCalculationModal';
import { Calculator, Globe, TrendingUp, Save, BarChart3, FolderOpen, Star, AlertTriangle, Loader2, ArrowRight } from 'lucide-react';
import { useMobile } from '@/presentation/hooks/ui/useMobile';
import MobileIndex from './MobileIndex';
import { useLocation } from 'react-router-dom';
import { convertCurrency } from '@/lib/utils';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ErrorBoundary } from '@/hooks/use-error-boundary';
import { Stepper } from '@/components/Stepper';

export interface SalaryData {
  country: string;
  countryCode: string;
  state: string;
  stateId: string;
  city: string;
  cityId: string;
  locality: string;
  localityId: string;
  isNative: boolean;
  grossSalary: number;
  currency: string;
}

export interface TaxData {
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  totalTax: number;
  takeHomeSalary: number;
  brackets?: Array<{
    min: number;
    max: number | null;
    rate: number;
    taxPaid: number;
  }>;
  cpp?: number;
  ei?: number;
  ni?: number;
  medicareLevy?: number;
  cess?: number;
  surcharge?: number;
  taxableIncome: number;
  effectiveTaxRate?: number;
  marginalTaxRate?: number;
  additionalTaxes?: Record<string, number>;
  breakdown?: Record<string, number>;
}

export interface ExpenseData {
  rent: number;
  utilities: number;
  food: number;
  transport: number;
  healthcare: number;
  other: number;
  total: number;
}

type CanadaTaxData = TaxData & {
  provTax: number;
  cpp: number;
  ei: number;
  federalTaxable: number;
  provTaxable: number;
};

type UKTaxData = TaxData & {
  incomeTax: number;
  ni: number;
  studentLoan: number;
  taxable: number;
};

type FranceTaxData = TaxData & {
  incomeTax: number;
  csgcrds: number;
  taxable: number;
};

type BrazilTaxData = TaxData & {
  inss: number;
  irpf: number;
  taxable: number;
};

type SouthAfricaTaxData = TaxData & {
  incomeTax: number;
  rebate: number;
  uif: number;
  taxable: number;
};

interface AustraliaTaxData extends TaxData {
  incomeTax: number;
  medicareSurcharge: number;
  super: number;
  taxable: number;
}

interface GermanyTaxData extends TaxData {
  incomeTax: number;
  soli: number;
  churchTax: number;
  taxable: number;
}

interface SavedCalculation {
  id: string;
  data_name: string;
  data_content: TaxCalculationData;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

// Add the interface definition for LoadCalculationModalSavedCalculation
interface LoadCalculationModalSavedCalculation {
  id: string;
  data_name: string;
  data_content: {
    country: string;
    countryCode?: string;
    state?: string;
    stateId?: string;
    city?: string;
    cityId?: string;
    locality?: string;
    localityId?: string;
    isNative?: boolean;
    currency: string;
    salary: number;
    netSalary: number;
    taxAmount: number;
    effectiveTaxRate: number;
    expenseData?: {
      rent: number;
      food: number;
      transport: number;
      utilities: number;
      healthcare: number;
      other: number;
      total: number;
    };
  };
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

// Add proper type definitions for the data structures
interface ExtendedTaxCalculationData extends TaxCalculationData {
  countryCode?: string;
}

interface ExtendedSavedCalculation extends SavedCalculation {
  data_content: ExtendedTaxCalculationData;
}

interface ExistingCalculation {
  id: string;
  data_name: string;
  data_content: TaxCalculationData;
}

// Helper to get default currency for a country code or country name
function getDefaultCurrencyForCountry(countryCode: string): string {
  switch (countryCode.toUpperCase()) {
    case 'IN':
    case 'INDIA':
      return 'INR';
    case 'US':
    case 'UNITED STATES':
    case 'USA':
      return 'USD';
    case 'CA':
    case 'CANADA':
      return 'CAD';
    case 'GB':
    case 'UNITED KINGDOM':
    case 'UK':
      return 'GBP';
    case 'AU':
    case 'AUSTRALIA':
      return 'AUD';
    case 'BR':
    case 'BRAZIL':
      return 'BRL';
    case 'ZA':
    case 'SOUTH AFRICA':
      return 'ZAR';
    case 'FR':
    case 'FRANCE':
      return 'EUR';
    case 'DE':
    case 'GERMANY':
      return 'EUR';
    case 'CN':
    case 'CHINA':
      return 'CNY';
    case 'JP':
    case 'JAPAN':
      return 'JPY';
    default:
      return 'USD';
  }
}

// Helper to format currency
function formatCurrency(amount: number, code: string) {
  return amount.toLocaleString(undefined, {
    style: 'currency',
    currency: code,
    maximumFractionDigits: 0,
  });
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Place type guard functions above their first usage
function isCanadaTaxData(data: TaxData | CanadaTaxData): data is CanadaTaxData {
  return data && typeof (data as CanadaTaxData).provTax !== 'undefined';
}
function isUKTaxData(data: TaxData | UKTaxData): data is UKTaxData {
  return data && typeof (data as UKTaxData).incomeTax !== 'undefined' && typeof (data as UKTaxData).ni !== 'undefined';
}
function isAustraliaTaxData(data: TaxData | AustraliaTaxData): data is AustraliaTaxData {
  return data && typeof (data as AustraliaTaxData).incomeTax !== 'undefined' && typeof (data as AustraliaTaxData).super !== 'undefined';
}
function isGermanyTaxData(data: TaxData | GermanyTaxData): data is GermanyTaxData {
  return data && typeof (data as GermanyTaxData).soli !== 'undefined';
}
function isFranceTaxData(data: TaxData | FranceTaxData): data is FranceTaxData {
  return data && typeof (data as FranceTaxData).csgcrds !== 'undefined';
}
function isBrazilTaxData(data: TaxData | BrazilTaxData): data is BrazilTaxData {
  return data && typeof (data as BrazilTaxData).inss !== 'undefined';
}
function isSouthAfricaTaxData(data: TaxData | SouthAfricaTaxData): data is SouthAfricaTaxData {
  return data && typeof (data as SouthAfricaTaxData).rebate !== 'undefined';
}

// Helper: default objects for each country-specific tax type
const defaultCanadaTaxData: CanadaTaxData = {
  federalTax: 0, stateTax: 0, socialSecurity: 0, medicare: 0, totalTax: 0, takeHomeSalary: 0, taxableIncome: 0,
  provTax: 0, cpp: 0, ei: 0, federalTaxable: 0, provTaxable: 0, brackets: []
};
const defaultUKTaxData: UKTaxData = {
  federalTax: 0, stateTax: 0, socialSecurity: 0, medicare: 0, totalTax: 0, takeHomeSalary: 0, taxableIncome: 0,
  incomeTax: 0, ni: 0, studentLoan: 0, taxable: 0, brackets: []
};
const defaultAustraliaTaxData: AustraliaTaxData = {
  federalTax: 0, stateTax: 0, socialSecurity: 0, medicare: 0, totalTax: 0, takeHomeSalary: 0, taxableIncome: 0,
  incomeTax: 0, medicareSurcharge: 0, super: 0, taxable: 0, brackets: []
};
const defaultGermanyTaxData: GermanyTaxData = {
  federalTax: 0, stateTax: 0, socialSecurity: 0, medicare: 0, totalTax: 0, takeHomeSalary: 0, taxableIncome: 0,
  incomeTax: 0, soli: 0, churchTax: 0, taxable: 0, brackets: []
};
const defaultFranceTaxData: FranceTaxData = {
  federalTax: 0, stateTax: 0, socialSecurity: 0, medicare: 0, totalTax: 0, takeHomeSalary: 0, taxableIncome: 0,
  incomeTax: 0, csgcrds: 0, taxable: 0, brackets: []
};
const defaultBrazilTaxData: BrazilTaxData = {
  federalTax: 0, stateTax: 0, socialSecurity: 0, medicare: 0, totalTax: 0, takeHomeSalary: 0, taxableIncome: 0,
  inss: 0, irpf: 0, taxable: 0, brackets: []
};
const defaultSouthAfricaTaxData: SouthAfricaTaxData = {
  federalTax: 0, stateTax: 0, socialSecurity: 0, medicare: 0, totalTax: 0, takeHomeSalary: 0, taxableIncome: 0,
  incomeTax: 0, rebate: 0, uif: 0, taxable: 0, brackets: []
};

const steps = [
  { 
    id: 'basics', 
    label: 'Location & Salary', 
    description: 'Enter your location and salary details'
  },
  { 
    id: 'taxes', 
    label: 'Tax Calculation', 
    description: 'Calculate your taxes and deductions'
  },
  { 
    id: 'analysis', 
    label: 'Analysis', 
    description: 'View insights and savings analysis'
  },
];

const onboardingSteps = [
  {
    id: 'country-selector',
    title: 'Select Your Country',
    description: 'Start by choosing your country to get accurate tax calculations.',
    target: '[data-onboarding="country-selector"]'
  },
  {
    id: 'salary-input',
    title: 'Enter Your Salary',
    description: 'Input your gross annual salary for precise calculations.',
    target: '[data-onboarding="salary-input"]'
  },
  {
    id: 'calculate-taxes',
    title: 'Calculate Taxes',
    description: 'Click to calculate your taxes and see the breakdown.',
    target: '[data-onboarding="calculate-button"]'
  }
];

const Index = () => {
  // All hooks at the top!
  const { isMobile } = useMobile();
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSaveCalculationModal, setShowSaveCalculationModal] = useState(false);
  const [showLoadCalculationModal, setShowLoadCalculationModal] = useState(false);
  const [existingCalculation, setExistingCalculation] = useState<ExtendedSavedCalculation | null>(null);
  const [savedCalculations, setSavedCalculations] = useState<LoadCalculationModalSavedCalculation[]>([]);
  const [isLoadingSavedCalculations, setIsLoadingSavedCalculations] = useState(false);
  const [salaryData, setSalaryData] = useState<SalaryData>({
    country: '',
    countryCode: '',
    state: '',
    stateId: '',
    city: '',
    cityId: '',
    locality: '',
    localityId: '',
    isNative: false,
    grossSalary: 0,
    currency: 'USD'
  });
  const [taxDataIndia, setTaxDataIndia] = useState<TaxData>({
    federalTax: 0, stateTax: 0, socialSecurity: 0, medicare: 0, totalTax: 0, takeHomeSalary: 0, taxableIncome: 0
  });
  const [taxDataUS, setTaxDataUS] = useState<TaxData>({
    federalTax: 0, stateTax: 0, socialSecurity: 0, medicare: 0, totalTax: 0, takeHomeSalary: 0, taxableIncome: 0
  });
  const [taxDataCanada, setTaxDataCanada] = useState<CanadaTaxData>({
    federalTax: 0, stateTax: 0, socialSecurity: 0, medicare: 0, totalTax: 0, takeHomeSalary: 0, taxableIncome: 0,
    provTax: 0, cpp: 0, ei: 0, federalTaxable: 0, provTaxable: 0, brackets: []
  });
  const [taxDataUK, setTaxDataUK] = useState<UKTaxData>({
    federalTax: 0, stateTax: 0, socialSecurity: 0, medicare: 0, totalTax: 0, takeHomeSalary: 0, taxableIncome: 0,
    incomeTax: 0, ni: 0, studentLoan: 0, taxable: 0, brackets: []
  });
  const [taxDataAustralia, setTaxDataAustralia] = useState<AustraliaTaxData>({
    federalTax: 0, stateTax: 0, socialSecurity: 0, medicare: 0, totalTax: 0, takeHomeSalary: 0, taxableIncome: 0,
    incomeTax: 0, medicareSurcharge: 0, super: 0, taxable: 0, brackets: []
  });
  const [taxDataGermany, setTaxDataGermany] = useState<GermanyTaxData>({
    federalTax: 0, stateTax: 0, socialSecurity: 0, medicare: 0, totalTax: 0, takeHomeSalary: 0, taxableIncome: 0,
    incomeTax: 0, soli: 0, churchTax: 0, taxable: 0, brackets: []
  });
  const [taxDataFrance, setTaxDataFrance] = useState<FranceTaxData>({
    federalTax: 0, stateTax: 0, socialSecurity: 0, medicare: 0, totalTax: 0, takeHomeSalary: 0, taxableIncome: 0,
    incomeTax: 0, csgcrds: 0, taxable: 0, brackets: []
  });
  const [taxDataBrazil, setTaxDataBrazil] = useState<BrazilTaxData>({
    federalTax: 0, stateTax: 0, socialSecurity: 0, medicare: 0, totalTax: 0, takeHomeSalary: 0, taxableIncome: 0,
    inss: 0, irpf: 0, taxable: 0, brackets: []
  });
  const [taxDataSouthAfrica, setTaxDataSouthAfrica] = useState<SouthAfricaTaxData>({
    federalTax: 0, stateTax: 0, socialSecurity: 0, medicare: 0, totalTax: 0, takeHomeSalary: 0, taxableIncome: 0,
    incomeTax: 0, rebate: 0, uif: 0, taxable: 0, brackets: []
  });
  const [expenseData, setExpenseData] = useState<ExpenseData>({
    rent: 0,
    utilities: 0,
    food: 0,
    transport: 0,
    healthcare: 0,
    other: 0,
    total: 0
  });
  const [activeTab, setActiveTab] = useState('basics');
  const [indiaRegime, setIndiaRegime] = useState<'new' | 'old'>('new');
  const [usFilingStatus, setUsFilingStatus] = useState<'single' | 'married' | 'head'>('single');
  const [usState, setUsState] = useState('');
  const [isCalculating, setIsCalculating] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const { isVisible: showOnboarding, complete: completeOnboarding, skip: skipOnboarding } = useOnboarding('tax-calculator');

  const debouncedSalaryData = useDebounce(salaryData, 400);

  // Move useMemo hooks to the very top, before any conditional logic
  const memoizedTaxData = useMemo(() => {
    // Calculate current tax data based on country instead of relying on mutable variable
    let currentTaxData: TaxData;
    
    switch (salaryData.country) {
      case 'India':
        currentTaxData = taxDataIndia;
        break;
      case 'United States':
        currentTaxData = taxDataUS;
        break;
      case 'Canada':
        currentTaxData = taxDataCanada;
        break;
      case 'United Kingdom':
      case 'UK':
        currentTaxData = taxDataUK;
        break;
      case 'Australia':
        currentTaxData = taxDataAustralia;
        break;
      case 'Germany':
        currentTaxData = taxDataGermany;
        break;
      case 'France':
        currentTaxData = taxDataFrance;
        break;
      case 'Brazil':
        currentTaxData = taxDataBrazil;
        break;
      case 'South Africa':
        currentTaxData = taxDataSouthAfrica;
        break;
      default:
        currentTaxData = {
          federalTax: 0,
          stateTax: 0,
          socialSecurity: 0,
          medicare: 0,
          totalTax: 0,
          takeHomeSalary: 0,
          taxableIncome: 0,
        };
    }

    console.log('memoizedTaxData updated:', {
      currentTaxData,
      takeHomeSalary: currentTaxData.takeHomeSalary,
      totalTax: currentTaxData.totalTax,
      country: salaryData.country
    });
    return currentTaxData;
  }, [
    salaryData.country,
    taxDataIndia,
    taxDataUS,
    taxDataCanada,
    taxDataUK,
    taxDataAustralia,
    taxDataGermany,
    taxDataFrance,
    taxDataBrazil,
    taxDataSouthAfrica
  ]);

  // Create a proper setTaxData function that updates the correct country-specific state
  const setTaxData = useCallback((newTaxData: TaxData | ((prev: TaxData) => TaxData)) => {
    const taxDataToSet = typeof newTaxData === 'function' ? newTaxData(memoizedTaxData) : newTaxData;
    
    console.log('setTaxData called with:', taxDataToSet, 'for country:', salaryData.country);
    
    switch (salaryData.country) {
      case 'India':
        setTaxDataIndia(taxDataToSet);
        break;
      case 'United States':
        setTaxDataUS(taxDataToSet);
        break;
      case 'Canada':
        setTaxDataCanada({ ...defaultCanadaTaxData, ...taxDataToSet });
        break;
      case 'United Kingdom':
      case 'UK':
        setTaxDataUK({ ...defaultUKTaxData, ...taxDataToSet });
        break;
      case 'Australia':
        setTaxDataAustralia({ ...defaultAustraliaTaxData, ...taxDataToSet });
        break;
      case 'Germany':
        setTaxDataGermany({ ...defaultGermanyTaxData, ...taxDataToSet });
        break;
      case 'France':
        setTaxDataFrance({ ...defaultFranceTaxData, ...taxDataToSet });
        break;
      case 'Brazil':
        setTaxDataBrazil({ ...defaultBrazilTaxData, ...taxDataToSet });
        break;
      case 'South Africa':
        setTaxDataSouthAfrica({ ...defaultSouthAfricaTaxData, ...taxDataToSet });
        break;
      default:
        console.warn('No tax data setter found for country:', salaryData.country);
    }
  }, [salaryData.country, memoizedTaxData, setTaxDataIndia, setTaxDataUS, setTaxDataCanada, setTaxDataUK, setTaxDataAustralia, setTaxDataGermany, setTaxDataFrance, setTaxDataBrazil, setTaxDataSouthAfrica, defaultCanadaTaxData, defaultUKTaxData, defaultAustraliaTaxData, defaultGermanyTaxData, defaultFranceTaxData, defaultBrazilTaxData, defaultSouthAfricaTaxData]);

  const memoizedExpenseData = useMemo(() => {
    return expenseData;
  }, [expenseData]);

  // Debug logging
  useEffect(() => {
    console.log('Active tab changed to:', activeTab);
    console.log('Salary data:', salaryData);
  }, [activeTab, salaryData]);

  // Handle hash-based navigation
  useEffect(() => {
    const handleHashChange = () => {
      // Remove dashboard handling since it's now a separate page
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [user]);

  // Handle budget editing from dashboard
  useEffect(() => {
    if (location.state?.editBudget) {
      const budget = location.state.editBudget;
      console.log('Loading budget for editing:', budget);
      
      // Set the active tab to basics (salary input page)
      setActiveTab('basics');
      
      // Load budget data into the calculator
      // For now, we'll set the salary to the budget amount as a starting point
      setSalaryData(prev => ({
        ...prev,
        grossSalary: budget.amount,
        currency: 'USD',
        countryCode: prev.countryCode || '',
      }));
      
      // Show a toast notification
      toast({
        title: "Budget loaded for editing",
        description: `Budget "${budget.category?.name || 'All Categories'}" loaded. You can now modify the calculation.`,
      });
      
      // Clear the navigation state to prevent reloading on subsequent renders
      window.history.replaceState({}, document.title);
    }
  }, [location.state, toast]);

  // Restore saved calculation data on mount
  useEffect(() => {
    if (!user) {
      const savedData = CalculationStorageService.getSavedCalculation();
      if (savedData) {
        setSalaryData({
          ...savedData.salaryData,
          countryCode: savedData.salaryData.countryCode || '',
        });
        setExpenseData(savedData.expenseData);
        if (savedData.countrySpecificData.indiaRegime) {
          setIndiaRegime(savedData.countrySpecificData.indiaRegime);
        }
        if (savedData.countrySpecificData.usFilingStatus) {
          setUsFilingStatus(savedData.countrySpecificData.usFilingStatus);
        }
        if (savedData.countrySpecificData.usState) {
          setUsState(savedData.countrySpecificData.usState);
        }
        if (savedData.salaryData.country) {
          switch (savedData.salaryData.country) {
            case 'India':
              setTaxDataIndia(savedData.taxData);
              break;
            case 'United States':
              setTaxDataUS(savedData.taxData);
              break;
            case 'Canada':
              if (isCanadaTaxData(savedData.taxData)) {
                setTaxDataCanada({ ...defaultCanadaTaxData, ...savedData.taxData });
              } else {
                setTaxDataCanada(defaultCanadaTaxData);
              }
              break;
            case 'United Kingdom':
              if (isUKTaxData(savedData.taxData)) {
                setTaxDataUK({ ...defaultUKTaxData, ...savedData.taxData });
              } else {
                setTaxDataUK(defaultUKTaxData);
              }
              break;
            case 'Australia':
              if (isAustraliaTaxData(savedData.taxData)) {
                setTaxDataAustralia({ ...defaultAustraliaTaxData, ...savedData.taxData });
              } else {
                setTaxDataAustralia(defaultAustraliaTaxData);
              }
              break;
            case 'Germany':
              if (isGermanyTaxData(savedData.taxData)) {
                setTaxDataGermany({ ...defaultGermanyTaxData, ...savedData.taxData });
              } else {
                setTaxDataGermany(defaultGermanyTaxData);
              }
              break;
            case 'France':
              if (isFranceTaxData(savedData.taxData)) {
                setTaxDataFrance({ ...defaultFranceTaxData, ...savedData.taxData });
              } else {
                setTaxDataFrance(defaultFranceTaxData);
              }
              break;
            case 'Brazil':
              if (isBrazilTaxData(savedData.taxData)) {
                setTaxDataBrazil({ ...defaultBrazilTaxData, ...savedData.taxData });
              } else {
                setTaxDataBrazil(defaultBrazilTaxData);
              }
              break;
            case 'South Africa':
              if (isSouthAfricaTaxData(savedData.taxData)) {
                setTaxDataSouthAfrica({ ...defaultSouthAfricaTaxData, ...savedData.taxData });
              } else {
                setTaxDataSouthAfrica(defaultSouthAfricaTaxData);
              }
              break;
          }
        }
        toast({
          title: "Calculation restored",
          description: "Your previous calculation has been restored.",
        });
      }
    }
  }, [user, toast]);

  // Save calculation data when it changes (for anonymous users)
  useEffect(() => {
    if (!user && salaryData.country && salaryData.grossSalary > 0) {
      const calculationData = {
        salaryData: {
          ...salaryData,
          countryCode: salaryData.countryCode || '',
        },
        taxData: memoizedTaxData,
        expenseData,
        countrySpecificData: {
          indiaRegime,
          usFilingStatus,
          usState,
        },
      };
      CalculationStorageService.saveCalculation(calculationData);
    }
  }, [salaryData, memoizedTaxData, expenseData, indiaRegime, usFilingStatus, usState, user]);

  // Calculate expenses when salary or location changes
  useEffect(() => {
    if (salaryData.country && salaryData.city && salaryData.grossSalary > 0) {
      // Import the estimateExpenses function from LivingExpenses
      const estimateExpenses = (country: string, city: string, grossSalary: number) => {
        // Basic expense estimation logic
        let rentMultiplier = 0.30;
        let utilitiesBase = 200;
        let foodBase = 400;
        let transportBase = 150;
        let healthcareBase = 300;
        const otherBase = 300;

        // Adjust based on country and city
        switch (country) {
          case 'United States':
            if (city.toLowerCase().includes('san francisco') || city.toLowerCase().includes('new york')) {
              rentMultiplier = 0.45;
              utilitiesBase = 300;
              foodBase = 600;
              transportBase = 200;
            }
            break;
          case 'India':
            rentMultiplier = 0.25;
            utilitiesBase = 100;
            foodBase = 200;
            transportBase = 80;
            healthcareBase = 150;
            break;
          case 'United Kingdom':
          case 'UK':
            rentMultiplier = 0.35;
            utilitiesBase = 200;
            foodBase = 350;
            transportBase = 180;
            healthcareBase = 50;
            break;
          case 'Canada':
            rentMultiplier = 0.30;
            utilitiesBase = 180;
            foodBase = 400;
            transportBase = 150;
            healthcareBase = 100;
            break;
          case 'Australia':
            rentMultiplier = 0.35;
            utilitiesBase = 250;
            foodBase = 450;
            transportBase = 200;
            healthcareBase = 150;
            break;
          default:
            break;
        }

        const rent = grossSalary * rentMultiplier / 12;
        const utilities = utilitiesBase;
        const food = foodBase;
        const transport = transportBase;
        const healthcare = healthcareBase;
        const other = otherBase;
        const total = rent + utilities + food + transport + healthcare + other;

        return {
          rent,
          utilities,
          food,
          transport,
          healthcare,
          other,
          total
        };
      };

      const estimatedExpenses = estimateExpenses(salaryData.country, salaryData.city, salaryData.grossSalary);
      setExpenseData(estimatedExpenses);
    }
  }, [debouncedSalaryData.country, debouncedSalaryData.city, debouncedSalaryData.grossSalary]);

  // Auto-detect country/currency if not set
  useEffect(() => {
    if (!salaryData.country) {
      const userLanguage = navigator.language || 'en-US';
      // Example: 'en-US' => 'US'
      const countryCode = userLanguage.split('-')[1] || 'US';
      // Map countryCode to country name and currency (implement mapping as needed)
      // For demo, set US and USD
      setSalaryData(prev => ({
        ...prev,
        country: prev.country || 'United States',
        countryCode: prev.countryCode || 'US',
        currency: prev.currency || 'USD',
      }));
    }
    // Remember last-used values
    const lastSalaryData = localStorage.getItem('lastSalaryData');
    if (lastSalaryData) {
      const parsed = JSON.parse(lastSalaryData);
      setSalaryData({
        ...parsed,
        countryCode: parsed.countryCode || '',
      });
    }
  }, []);
  useEffect(() => {
    // Save last-used values
    localStorage.setItem('lastSalaryData', JSON.stringify(salaryData));
  }, [salaryData]);

  useEffect(() => {
    if (salaryData.country) {
      const code = typeof salaryData.countryCode === 'string' ? salaryData.countryCode : '';
      const defaultCurrency = getDefaultCurrencyForCountry(code || salaryData.country);
      if (salaryData.currency !== defaultCurrency) {
        setSalaryData(prev => ({
          ...prev,
          currency: defaultCurrency,
        }));
      }
    }
  }, [salaryData.country, salaryData.countryCode]);

  // Load saved preferences from localStorage on mount
  useEffect(() => {
    const savedCurrency = localStorage.getItem('userCurrency');
    const savedCountry = localStorage.getItem('userCountry');
    const savedCountryCode = localStorage.getItem('userCountryCode');
    const savedIndiaRegime = localStorage.getItem('indiaRegime');
    const savedUsFilingStatus = localStorage.getItem('usFilingStatus');
    const savedUsState = localStorage.getItem('usState');

    // Only load saved preferences if no country is currently selected
    if (!salaryData.country) {
      if (savedCountry) {
        setSalaryData(prev => ({
          ...prev,
          country: savedCountry,
        }));
      }
      if (savedCountryCode) {
        setSalaryData(prev => ({
          ...prev,
          countryCode: savedCountryCode,
        }));
      }
      if (savedCurrency) {
        setSalaryData(prev => ({
          ...prev,
          currency: savedCurrency,
        }));
      }
    }

    // Load other preferences regardless
    if (savedIndiaRegime) {
      setIndiaRegime(savedIndiaRegime as 'new' | 'old');
    }
    if (savedUsFilingStatus) {
      setUsFilingStatus(savedUsFilingStatus as 'single' | 'married' | 'head');
    }
    if (savedUsState) {
      setUsState(savedUsState);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('userCurrency', salaryData.currency);
    localStorage.setItem('userCountry', salaryData.country);
    localStorage.setItem('userCountryCode', salaryData.countryCode);
    localStorage.setItem('indiaRegime', indiaRegime);
    localStorage.setItem('usFilingStatus', usFilingStatus);
    localStorage.setItem('usState', usState);
  }, [salaryData, indiaRegime, usFilingStatus, usState]);

  // Show loading while detecting platform
  if (isMobile) {
    return <MobileIndex />;
  }

  // Original web version logic
  const isSalaryValid = Boolean(salaryData.grossSalary > 0);
  
  // Improved hasCalculation logic - check if user has completed the calculation process
  const hasCalculation = Boolean(
    memoizedTaxData.totalTax !== undefined &&
    memoizedTaxData.totalTax >= 0 &&
    memoizedTaxData.takeHomeSalary !== undefined &&
    memoizedTaxData.takeHomeSalary >= 0
  );

  // Debug logging for hasCalculation
  console.log('hasCalculation debug:', {
    salaryDataGrossSalary: salaryData.grossSalary,
    salaryDataCountry: salaryData.country,
    taxDataTotalTax: memoizedTaxData.totalTax,
    taxDataTakeHomeSalary: memoizedTaxData.takeHomeSalary,
    hasCalculation: hasCalculation,
    conditions: {
      hasSalary: salaryData.grossSalary > 0,
      hasCountry: !!salaryData.country,
      hasTotalTax: memoizedTaxData.totalTax !== undefined && memoizedTaxData.totalTax >= 0,
      hasTakeHomeSalary: memoizedTaxData.takeHomeSalary !== undefined && memoizedTaxData.takeHomeSalary >= 0
    }
  });

  // Check for existing similar calculation
  const checkExistingCalculation = async () => {
    if (!user || !hasCalculation) return null;
    
    try {
      const { data } = await UserDataService.getTaxCalculations(user.id);
      if (data && data.length > 0) {
        // Find calculation with similar data
        const similar = data.find(calc => {
          const existing = calc.data_content as ExtendedTaxCalculationData;
          return (
            existing.country === salaryData.country &&
            existing.salary === salaryData.grossSalary &&
            existing.currency === salaryData.currency &&
            Math.abs(existing.taxAmount - memoizedTaxData.totalTax) < 1 &&
            Math.abs(existing.netSalary - memoizedTaxData.takeHomeSalary) < 1
          );
        });
        return similar || null;
      }
    } catch (error) {
      console.error('Error checking existing calculation:', error);
    }
    return null;
  };

  // Validation function to check if all required details are entered
  const validateCalculationForSave = () => {
    const errors: string[] = [];
    
    // Required fields
    if (!salaryData.country) {
      errors.push("Country is required");
    }
    
    if (!salaryData.state) {
      errors.push("State/Province is required");
    }
    
    if (!salaryData.grossSalary || salaryData.grossSalary <= 0) {
      errors.push("Valid salary amount is required");
    }
    
    if (!salaryData.currency) {
      errors.push("Currency is required");
    }
    
    // Check if tax calculation is complete
    if (!memoizedTaxData.totalTax && memoizedTaxData.totalTax !== 0) {
      errors.push("Tax calculation is not complete");
    }
    
    if (!memoizedTaxData.takeHomeSalary && memoizedTaxData.takeHomeSalary !== 0) {
      errors.push("Take-home salary calculation is not complete");
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  // Save calculation functionality
  const handleSaveCalculation = async () => {
    if (!user) {
      setShowSignInModal(true);
      return;
    }

    // Validate required fields
    const validation = validateCalculationForSave();
    if (!validation.isValid) {
      toast({
        title: "Incomplete Information",
        description: `Please complete the following: ${validation.errors.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    if (!hasCalculation) {
      toast({
        title: "No calculation to save",
        description: "Please complete a tax calculation first.",
        variant: "destructive",
      });
      return;
    }

    // Check for existing calculation
    const existing = await checkExistingCalculation();
    if (existing) {
      setExistingCalculation(existing as ExtendedSavedCalculation | null);
      setShowSaveCalculationModal(true);
      return;
    }

    // Save as new calculation
    await saveCalculationAsNew();
  };

  const saveCalculationAsNew = async (name?: string, isOverwrite = false, existingId?: string) => {
    if (!user) return;

    const calculationName = name || `${salaryData.country} - ${salaryData.currency} ${salaryData.grossSalary.toLocaleString()} - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;

    const calculationData: TaxCalculationData = {
      country: salaryData.country,
      countryCode: salaryData.countryCode,
      state: salaryData.state,
      stateId: salaryData.stateId,
      city: salaryData.city,
      cityId: salaryData.cityId,
      locality: salaryData.locality,
      localityId: salaryData.localityId,
      isNative: salaryData.isNative,
      salary: salaryData.grossSalary,
      currency: salaryData.currency,
      taxAmount: memoizedTaxData.totalTax,
      netSalary: memoizedTaxData.takeHomeSalary,
      effectiveTaxRate: memoizedTaxData.effectiveTaxRate || (memoizedTaxData.totalTax / salaryData.grossSalary) * 100,
      deductions: memoizedTaxData.breakdown?.deductions || 0,
      rebates: memoizedTaxData.breakdown?.rebates || 0,
      additionalTaxes: memoizedTaxData.breakdown?.additionalTaxes || 0,
      calculationDate: new Date().toISOString(),
      notes: `${salaryData.country} - ${salaryData.state} ${salaryData.city}`,
      // Include expense data
      expenseData: expenseData,
    };

    try {
      let result;
      if (isOverwrite && existingId) {
        // Update existing calculation
        const { error } = await UserDataService.updateTaxCalculation(user.id, existingId, calculationData);
        
        if (error) throw error;
        result = { data: null, error: null };
      } else {
        // Save as new calculation
        result = await UserDataService.saveTaxCalculation(user.id, calculationData, calculationName);
      }
      
      if (result.error) {
        console.error('Error saving calculation:', result.error);
        toast({
          title: "Error saving calculation",
          description: result.error.message,
          variant: "destructive",
        });
      } else {
        console.log('Calculation saved successfully!');
        toast({
          title: "Calculation saved successfully",
          description: "Your calculation has been saved and can be accessed from the dashboard.",
        });
        setExistingCalculation(null);
      }
    } catch (err) {
      console.error('Unexpected error saving calculation:', err);
      toast({
        title: "Error saving calculation",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  const handleTabChange = (value: string) => {
    // Check if trying to access dashboard without authentication
    if (value === 'dashboard' && !user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access the Financial Dashboard.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if salary is filled before allowing navigation to other tabs
    if (value !== 'basics' && (!salaryData.grossSalary || salaryData.grossSalary <= 0)) {
      toast({
        title: "Salary Required",
        description: "Please enter your salary before proceeding to other tabs.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if country is selected before allowing navigation to other tabs
    if (value !== 'basics' && !salaryData.country) {
      toast({
        title: "Country Required",
        description: "Please select your country before proceeding to other tabs.",
        variant: "destructive",
      });
      return;
    }
    
    setActiveTab(value);
  };

  const loadSavedCalculations = async () => {
    if (!user) return;
    
    setIsLoadingSavedCalculations(true);
    try {
      const { data, error } = await UserDataService.getTaxCalculations(user.id);
      if (error) {
        console.error('Error loading saved calculations:', error);
        toast({
          title: "Error loading calculations",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setSavedCalculations(data as ExtendedSavedCalculation[]);
      }
    } catch (error) {
      console.error('Error loading saved calculations:', error);
      toast({
        title: "Error loading calculations",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSavedCalculations(false);
    }
  };

  const loadCalculation = (calculation: LoadCalculationModalSavedCalculation) => {
    const data = calculation.data_content;
    
    // Load salary data with complete location information
    setSalaryData(prev => ({
      ...prev,
      country: data.country || '',
      countryCode: data.countryCode || '',
      state: data.state || '',
      stateId: data.stateId || '',
      city: data.city || '',
      cityId: data.cityId || '',
      locality: data.locality || '',
      localityId: data.localityId || '',
      isNative: data.isNative || false,
      grossSalary: data.salary || 0,
      currency: data.currency || 'USD',
    }));

    // Load tax data based on country with all required properties
    const taxDataToLoad: TaxData = {
      federalTax: 0,
      stateTax: 0,
      socialSecurity: 0,
      medicare: 0,
      totalTax: data.taxAmount || 0,
      takeHomeSalary: data.netSalary || 0,
      taxableIncome: data.salary || 0,
      effectiveTaxRate: data.effectiveTaxRate || 0,
    };

    // Set tax data for the specific country
    switch (data.country) {
      case 'India':
        setTaxDataIndia(taxDataToLoad);
        break;
      case 'United States':
        setTaxDataUS(taxDataToLoad);
        break;
      case 'Canada':
        setTaxDataCanada({ ...defaultCanadaTaxData, ...taxDataToLoad });
        break;
      case 'United Kingdom':
        setTaxDataUK({ ...defaultUKTaxData, ...taxDataToLoad });
        break;
      case 'Australia':
        setTaxDataAustralia({ ...defaultAustraliaTaxData, ...taxDataToLoad });
        break;
      case 'Germany':
        setTaxDataGermany({ ...defaultGermanyTaxData, ...taxDataToLoad });
        break;
      case 'France':
        setTaxDataFrance({ ...defaultFranceTaxData, ...taxDataToLoad });
        break;
      case 'Brazil':
        setTaxDataBrazil({ ...defaultBrazilTaxData, ...taxDataToLoad });
        break;
      case 'South Africa':
        setTaxDataSouthAfrica({ ...defaultSouthAfricaTaxData, ...taxDataToLoad });
        break;
    }

    // Load expense data if available
    if (data.expenseData) {
      setExpenseData(data.expenseData);
    }

    // Close modal and show success message
    setShowLoadCalculationModal(false);
    toast({
      title: "Calculation loaded",
      description: "Your saved calculation has been loaded successfully. You can now review and modify the data.",
    });

    // Navigate to basics tab to start from the first step
    setActiveTab('basics');
  };

  // Add type conversion function for SaveCalculationModal
  const convertToExistingCalculation = (calc: ExtendedSavedCalculation | null): ExistingCalculation | undefined => {
    if (!calc) return undefined;
    
    return {
      id: calc.id,
      data_name: calc.data_name,
      data_content: {
        country: calc.data_content.country || '',
        salary: calc.data_content.salary || 0,
        currency: calc.data_content.currency || '',
        taxAmount: calc.data_content.taxAmount || 0,
        netSalary: calc.data_content.netSalary || 0,
        effectiveTaxRate: calc.data_content.effectiveTaxRate || 0,
        deductions: calc.data_content.deductions || 0,
        rebates: calc.data_content.rebates || 0,
        additionalTaxes: calc.data_content.additionalTaxes || 0,
        calculationDate: calc.data_content.calculationDate || new Date().toISOString(),
        notes: calc.data_content.notes || '',
        expenseData: calc.data_content.expenseData ? {
          ...calc.data_content.expenseData,
          total: calc.data_content.expenseData.total || 0
        } : {
          rent: 0,
          utilities: 0,
          food: 0,
          transport: 0,
          healthcare: 0,
          other: 0,
          total: 0
        },
      },
    };
  };

  // When calculating taxes, always use the country's default currency
  const countryCurrency = getDefaultCurrencyForCountry(salaryData.country);
  const salaryInCountryCurrency = convertCurrency(salaryData.grossSalary, salaryData.currency, countryCurrency);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header 
        onSaveCalculation={handleSaveCalculation}
        hasCalculation={hasCalculation}
      />
      
      <div className="p-4">
        <div className="max-w-6xl mx-auto">
          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-gray-200">
              <TabsTrigger value="basics">Location & Salary</TabsTrigger>
              <TabsTrigger value="taxes">
                Tax Calculation
                {(!salaryData.grossSalary || !salaryData.country) && (
                  <AlertTriangle className="inline ml-1 text-yellow-500 w-4 h-4" aria-label="Missing info" />
                )}
              </TabsTrigger>
              <TabsTrigger value="analysis">
                Analysis
                {(!salaryData.grossSalary || !salaryData.country) && (
                  <AlertTriangle className="inline ml-1 text-yellow-500 w-4 h-4" aria-label="Missing info" />
                )}
              </TabsTrigger>
            </TabsList>

            {/* Advanced options in Accordion for mobile */}
            <div className="block lg:hidden">
              <Accordion type="single" collapsible>
                <AccordionItem value="advanced">
                  <AccordionTrigger>Show Advanced Options</AccordionTrigger>
                  <AccordionContent>
                    {/* Place advanced options/components here */}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

            {/* Add a stepper wizard above the TabsContent for basics/taxes/analysis */}
            <div className="mb-6">
              <Stepper currentStep={activeTab} steps={[{label: 'Location & Salary', value: 'basics'}, {label: 'Tax Calculation', value: 'taxes'}, {label: 'Analysis', value: 'analysis'}]} />
            </div>

            <TabsContent value="basics" className="space-y-6 transition-opacity duration-200">
              <h2 className="text-xl font-bold mb-2">Location & Salary</h2>
              <Card>
                <CardContent className="p-6">
                  {/* Main content with vertical divider */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                    {/* Location Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Globe className="w-5 h-5" />
                        <h3 className="text-lg font-semibold">Location Details</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Select your country, state, city, and locality for accurate tax calculations
                      </p>
                      <CountrySelector 
                        salaryData={salaryData} 
                        setSalaryData={setSalaryData}
                        salaryValid={isSalaryValid}
                        showLoadButton={false}
                      />
                    </div>

                    {/* Vertical Divider - positioned absolutely between columns */}
                    <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 transform -translate-x-1/2"></div>

                    {/* Salary Section */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Calculator className="w-5 h-5" />
                        <h3 className="text-lg font-semibold">Salary Information</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        Enter your annual salary to calculate take-home pay and taxes
                      </p>
                      <SalaryInput 
                        salaryData={salaryData} 
                        setSalaryData={setSalaryData}
                      />
                    </div>
                  </div>

                  {/* Buttons Section - Outside the divided layout */}
                  <div className="mt-6">
                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                      {/* Continue button */}
                      {salaryData.country && isSalaryValid && (
                        <Button
                          onClick={() => setActiveTab('taxes')}
                          className="w-full sm:w-auto min-h-[44px] touch-manipulation"
                          disabled={!salaryData.country || !salaryData.state || !salaryData.city}
                        >
                          Continue to Tax Calculation
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}

                      {/* Load button */}
                      {user && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowLoadCalculationModal(true)}
                          className="w-full sm:w-auto min-h-[44px] touch-manipulation"
                        >
                          <FolderOpen className="mr-2 h-4 w-4" />
                          Load Saved
                        </Button>
                      )}
                      
                      {/* Reset button */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button type="button" variant="destructive" className="w-full sm:w-auto min-h-[44px] touch-manipulation">
                            Reset
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Reset Location & Salary?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will clear all location and salary fields. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction asChild>
                              <Button
                                type="button"
                                variant="destructive"
                                className="min-h-[44px] touch-manipulation"
                                onClick={() => setSalaryData({
                                  country: '',
                                  countryCode: '',
                                  state: '',
                                  stateId: '',
                                  city: '',
                                  cityId: '',
                                  locality: '',
                                  localityId: '',
                                  isNative: false,
                                  grossSalary: 0,
                                  currency: 'USD',
                                })}
                              >
                                Confirm Reset
                              </Button>
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progressive Disclosure: Advanced Options Accordion */}
              <Accordion type="single" collapsible className="mt-4">
                <AccordionItem value="advanced">
                  <AccordionTrigger>
                    Show Advanced Options
                  </AccordionTrigger>
                  <AccordionContent>
                    {/* Advanced options fields/components here */}
                    <div className="text-sm text-muted-foreground">No advanced options available yet. Future settings will appear here.</div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </TabsContent>

            <TabsContent value="taxes" className="space-y-6 transition-opacity duration-200">
              <h2 className="text-xl font-bold mb-2">Tax Calculation</h2>
              <>
                {salaryData.grossSalary > 0 && salaryData.country ? (
                  isCalculating ? (
                    <CalculationLoading />
                  ) : (
                    <ErrorBoundary>
                      <TaxCalculator 
                        salaryData={salaryData}
                        taxData={memoizedTaxData}
                        setTaxData={setTaxData}
                        onNext={() => {
                          setActiveTab('analysis');
                          if (!completedSteps.includes('analysis')) {
                            setCompletedSteps(prev => [...prev, 'analysis']);
                          }
                        }}
                        indiaRegime={indiaRegime}
                        setIndiaRegime={setIndiaRegime}
                        usFilingStatus={usFilingStatus}
                        setUsFilingStatus={setUsFilingStatus}
                        usState={usState}
                        setUsState={setUsState}
                      />
                    </ErrorBoundary>
                  )
                ) : (
                  <EmptyState
                    icon={Calculator}
                    title="Ready to calculate?"
                    description="Please complete the Location & Salary step first to view your tax calculations."
                    action={{
                      label: "Go to Location & Salary",
                      onClick: () => setActiveTab('basics')
                    }}
                  />
                )}
              </>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6 transition-opacity duration-200">
              <h2 className="text-xl font-bold mb-2">Living Costs & Savings</h2>
              {hasCalculation ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <LivingExpenses 
                    salaryData={salaryData}
                    expenseData={memoizedExpenseData}
                    setExpenseData={setExpenseData}
                  />
                  <SavingsAnalysis 
                    salaryData={salaryData}
                    taxData={memoizedTaxData}
                    expenseData={memoizedExpenseData}
                  />
                </div>
              ) : (
                <EmptyState
                  icon={TrendingUp}
                  title="Almost there!"
                  description="Complete your tax calculation first to see your savings analysis and living cost breakdown."
                  action={{
                    label: "Calculate Taxes",
                    onClick: () => setActiveTab('taxes')
                  }}
                />
              )}
              
              {/* Next Steps Card */}
              {user ? (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">Save your calculation and track your finances</h3>
                      <p className="text-gray-600 mb-4">
                        Save this calculation and access the Financial Dashboard to track expenses, set budgets, and get insights.
                      </p>
                      <div className="flex gap-4 justify-center">
                        <Button 
                          onClick={handleSaveCalculation}
                          className="flex items-center gap-2 min-h-[44px] touch-manipulation"
                          disabled={!hasCalculation}
                        >
                          <Save className="w-4 h-4" />
                          Save Calculation
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold mb-2">Save your calculation and track your finances</h3>
                      <p className="text-gray-600 mb-4">
                        Sign in to save this calculation and access the Financial Dashboard to track expenses, set budgets, and get insights.
                      </p>
                      <div className="flex gap-4 justify-center">
                        <Button 
                          onClick={handleSaveCalculation}
                          className="flex items-center gap-2 min-h-[44px] touch-manipulation"
                          disabled={user ? !hasCalculation : false}
                        >
                          <Save className="w-4 h-4" />
                          {user ? 'Save Calculation' : 'Sign in to Save'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="mt-12 text-center text-gray-500 text-sm">
            <p>Estimates are based on current tax rates and average living costs. Actual amounts may vary.</p>
          </div>
        </div>
      </div>

      {/* Sign In Modal */}
      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
        onSuccess={() => {
          // Clear saved calculation data after successful sign in
          CalculationStorageService.clearSavedCalculation();
          
          // After successful sign in, save the calculation
          if (hasCalculation) {
            handleSaveCalculation();
          }
        }}
      />

      {/* Save Calculation Modal */}
      <SaveCalculationModal
        isOpen={showSaveCalculationModal}
        onClose={() => setShowSaveCalculationModal(false)}
        onSave={saveCalculationAsNew}
        {...(() => { const converted = existingCalculation ? convertToExistingCalculation(existingCalculation) : undefined; return converted ? { existingCalculation: converted } : {}; })()}
        salaryData={salaryData}
        taxData={memoizedTaxData}
        expenseData={expenseData}
      />

      {/* Load Calculation Modal */}
      <LoadCalculationModal
        isOpen={showLoadCalculationModal}
        onClose={() => setShowLoadCalculationModal(false)}
        onLoad={(calculation) => loadCalculation(calculation as LoadCalculationModalSavedCalculation)}
        userId={user?.id || ''}
      />
      {/* Onboarding Tooltip */}
      <OnboardingTooltip 
        steps={onboardingSteps}
        isVisible={showOnboarding}
        onComplete={completeOnboarding}
        onSkip={skipOnboarding}
      />

      {/* Add aria-live region for feedback */}
      <div aria-live="polite" className="sr-only" id="feedback-region"></div>
    </div>
  );
};

export default Index;
