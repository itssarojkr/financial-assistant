import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Calculator, Globe, TrendingUp, Save, BarChart3, FolderOpen, Star } from 'lucide-react';
import { useMobile } from '@/presentation/hooks/ui/useMobile';
import MobileIndex from './MobileIndex';
import { useLocation } from 'react-router-dom';
import { convertCurrency } from '@/lib/utils';
import { TaxStrategyFactory } from '@/lib/tax-strategy';

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

interface TaxCalculationData {
  country: string;
  salary: number;
  currency: string;
  taxAmount: number;
  netSalary: number;
  effectiveTaxRate: number;
  expenseData?: ExpenseData;
}

// Helper to get default currency for a country code
function getDefaultCurrencyForCountry(countryCode: string): string {
  switch (countryCode) {
    case 'IN': return 'INR';
    case 'US': return 'USD';
    case 'CA': return 'CAD';
    case 'GB': return 'GBP';
    case 'AU': return 'AUD';
    case 'BR': return 'BRL';
    case 'ZA': return 'ZAR';
    case 'FR': return 'EUR';
    case 'DE': return 'EUR';
    case 'CN': return 'CNY';
    case 'JP': return 'JPY';
    default: return 'USD';
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

const Index = () => {
  // All hooks at the top!
  const { isMobile } = useMobile();
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSaveCalculationModal, setShowSaveCalculationModal] = useState(false);
  const [showLoadCalculationModal, setShowLoadCalculationModal] = useState(false);
  const [existingCalculation, setExistingCalculation] = useState<SavedCalculation | null>(null);
  const [savedCalculations, setSavedCalculations] = useState<SavedCalculation[]>([]);
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
        currency: 'USD', // Default currency, could be enhanced to detect from budget
        countryCode: prev.countryCode || ''
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
        setSalaryData(savedData.salaryData);
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
              setTaxDataCanada(savedData.taxData as CanadaTaxData);
              break;
            case 'United Kingdom':
              setTaxDataUK(savedData.taxData as UKTaxData);
              break;
            case 'Australia':
              setTaxDataAustralia(savedData.taxData as AustraliaTaxData);
              break;
            case 'Germany':
              setTaxDataGermany(savedData.taxData as GermanyTaxData);
              break;
            case 'France':
              setTaxDataFrance(savedData.taxData as FranceTaxData);
              break;
            case 'Brazil':
              setTaxDataBrazil(savedData.taxData as BrazilTaxData);
              break;
            case 'South Africa':
              setTaxDataSouthAfrica(savedData.taxData as SouthAfricaTaxData);
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
    let taxData: TaxData = {};
    let setTaxData: React.Dispatch<React.SetStateAction<TaxData>> = () => {};
    switch (salaryData.country) {
      case 'India':
        taxData = taxDataIndia;
        setTaxData = setTaxDataIndia;
        break;
      case 'United States':
        taxData = taxDataUS;
        setTaxData = setTaxDataUS;
        break;
      case 'Canada':
        taxData = taxDataCanada;
        setTaxData = setTaxDataCanada;
        break;
      case 'United Kingdom':
      case 'UK':
        taxData = taxDataUK;
        setTaxData = setTaxDataUK;
        break;
      case 'Australia':
        taxData = taxDataAustralia;
        setTaxData = setTaxDataAustralia;
        break;
      case 'Germany':
        taxData = taxDataGermany;
        setTaxData = setTaxDataGermany;
        break;
      case 'France':
        taxData = taxDataFrance;
        setTaxData = setTaxDataFrance;
        break;
      case 'Brazil':
        taxData = taxDataBrazil;
        setTaxData = setTaxDataBrazil;
        break;
      case 'South Africa':
        taxData = taxDataSouthAfrica;
        setTaxData = setTaxDataSouthAfrica;
        break;
      default:
        taxData = {};
        setTaxData = () => {};
    }
    const hasCalculation = taxData.totalTax > 0 && salaryData.grossSalary > 0;
    if (!user && hasCalculation) {
      const dataToSave = {
        salaryData,
        taxData,
        expenseData,
        countrySpecificData: {
          indiaRegime,
          usFilingStatus,
          usState
        }
      };
      CalculationStorageService.saveCalculation(dataToSave);
    }
  }, [user, salaryData, taxDataIndia, taxDataUS, taxDataCanada, taxDataUK, taxDataAustralia, taxDataGermany, taxDataFrance, taxDataBrazil, taxDataSouthAfrica, expenseData, indiaRegime, usFilingStatus, usState]);

  // Estimate expenses when salary data changes
  useEffect(() => {
    if (salaryData.grossSalary > 0 && salaryData.country && salaryData.city) {
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
  }, [salaryData.grossSalary, salaryData.country, salaryData.city]);

  // Select correct taxData and setTaxData for the selected country
  let taxData: TaxData = {};
  let setTaxData: React.Dispatch<React.SetStateAction<TaxData>> = () => {};
  switch (salaryData.country) {
    case 'India':
      taxData = taxDataIndia;
      setTaxData = setTaxDataIndia;
      break;
    case 'United States':
      taxData = taxDataUS;
      setTaxData = setTaxDataUS;
      break;
    case 'Canada':
      taxData = taxDataCanada;
      setTaxData = setTaxDataCanada;
      break;
    case 'United Kingdom':
    case 'UK':
      taxData = taxDataUK;
      setTaxData = setTaxDataUK;
      break;
    case 'Australia':
      taxData = taxDataAustralia;
      setTaxData = setTaxDataAustralia;
      break;
    case 'Germany':
      taxData = taxDataGermany;
      setTaxData = setTaxDataGermany;
      break;
    case 'France':
      taxData = taxDataFrance;
      setTaxData = setTaxDataFrance;
      break;
    case 'Brazil':
      taxData = taxDataBrazil;
      setTaxData = setTaxDataBrazil;
      break;
    case 'South Africa':
      taxData = taxDataSouthAfrica;
      setTaxData = setTaxDataSouthAfrica;
      break;
    default:
      taxData = {};
      setTaxData = () => {};
  }

  // Add this useEffect after all state declarations and before rendering logic
  useEffect(() => {
    if (!salaryData.countryCode || !salaryData.grossSalary || salaryData.grossSalary <= 0) return;
    const strategy = TaxStrategyFactory.createStrategy(salaryData.countryCode);
    if (!strategy) return;

    // Collect regime and additional params if needed
    let regime = undefined;
    let additionalParams = {};
    switch (salaryData.country) {
      case 'India':
        regime = indiaRegime;
        break;
      case 'United States':
        additionalParams = { filingStatus: usFilingStatus, state: usState };
        break;
      default:
        break;
    }

    const regimeValue = typeof regime === 'string' ? regime : 'new';
    const params = {
      grossSalary: salaryData.grossSalary,
      deductions: {}, // TODO: connect to deductions if available
      regime: regimeValue,
      additionalParams
    };
    const result = strategy.calculateTax(params);

    // Update the correct taxData state
    switch (salaryData.country) {
      case 'India':
        setTaxDataIndia({
          federalTax: result.breakdown?.incomeTax ?? 0,
          stateTax: result.breakdown?.stateTax ?? 0,
          socialSecurity: result.additionalTaxes?.socialSecurity ?? 0,
          medicare: result.additionalTaxes?.medicare ?? 0,
          totalTax: result.totalTax ?? 0,
          takeHomeSalary: result.takeHomeSalary ?? 0,
          taxableIncome: result.taxableIncome ?? 0,
          brackets: result.brackets ?? [],
          effectiveTaxRate: result.effectiveTaxRate ?? 0,
          marginalTaxRate: result.marginalTaxRate ?? 0,
          additionalTaxes: result.additionalTaxes ?? {},
          breakdown: result.breakdown ?? {},
        });
        break;
      case 'United States':
        setTaxDataUS({
          federalTax: result.breakdown?.incomeTax ?? 0,
          stateTax: result.breakdown?.stateTax ?? 0,
          socialSecurity: result.additionalTaxes?.socialSecurity ?? 0,
          medicare: result.additionalTaxes?.medicare ?? 0,
          totalTax: result.totalTax ?? 0,
          takeHomeSalary: result.takeHomeSalary ?? 0,
          taxableIncome: result.taxableIncome ?? 0,
          effectiveTaxRate: result.effectiveTaxRate ?? 0,
          marginalTaxRate: result.marginalTaxRate ?? 0,
          additionalTaxes: result.additionalTaxes ?? {},
          breakdown: result.breakdown ?? {},
        });
        break;
      case 'Canada':
        setTaxDataCanada({
          federalTax: result.breakdown?.incomeTax ?? 0,
          stateTax: result.breakdown?.stateTax ?? 0,
          socialSecurity: result.additionalTaxes?.socialSecurity ?? 0,
          medicare: result.additionalTaxes?.medicare ?? 0,
          totalTax: result.totalTax ?? 0,
          takeHomeSalary: result.takeHomeSalary ?? 0,
          taxableIncome: result.taxableIncome ?? 0,
          brackets: result.brackets ?? [],
          effectiveTaxRate: result.effectiveTaxRate ?? 0,
          marginalTaxRate: result.marginalTaxRate ?? 0,
          additionalTaxes: result.additionalTaxes ?? {},
          breakdown: result.breakdown ?? {},
          provTax: 0,
          cpp: 0,
          ei: 0,
          federalTaxable: 0,
          provTaxable: 0,
        });
        break;
      case 'United Kingdom':
      case 'UK':
        setTaxDataUK({
          federalTax: result.breakdown?.incomeTax ?? 0,
          stateTax: result.breakdown?.stateTax ?? 0,
          socialSecurity: result.additionalTaxes?.socialSecurity ?? 0,
          medicare: result.additionalTaxes?.medicare ?? 0,
          totalTax: result.totalTax ?? 0,
          takeHomeSalary: result.takeHomeSalary ?? 0,
          taxableIncome: result.taxableIncome ?? 0,
          brackets: result.brackets ?? [],
          effectiveTaxRate: result.effectiveTaxRate ?? 0,
          marginalTaxRate: result.marginalTaxRate ?? 0,
          additionalTaxes: result.additionalTaxes ?? {},
          breakdown: result.breakdown ?? {},
          incomeTax: 0,
          ni: 0,
          studentLoan: 0,
          taxable: 0,
        });
        break;
      case 'Australia':
        setTaxDataAustralia({
          federalTax: result.breakdown?.incomeTax ?? 0,
          stateTax: result.breakdown?.stateTax ?? 0,
          socialSecurity: result.additionalTaxes?.socialSecurity ?? 0,
          medicare: result.additionalTaxes?.medicare ?? 0,
          totalTax: result.totalTax ?? 0,
          takeHomeSalary: result.takeHomeSalary ?? 0,
          taxableIncome: result.taxableIncome ?? 0,
          brackets: result.brackets ?? [],
          effectiveTaxRate: result.effectiveTaxRate ?? 0,
          marginalTaxRate: result.marginalTaxRate ?? 0,
          additionalTaxes: result.additionalTaxes ?? {},
          breakdown: result.breakdown ?? {},
          incomeTax: 0,
          medicareSurcharge: 0,
          super: 0,
          taxable: 0,
        });
        break;
      case 'Germany':
        setTaxDataGermany({
          federalTax: result.breakdown?.incomeTax ?? 0,
          stateTax: result.breakdown?.stateTax ?? 0,
          socialSecurity: result.additionalTaxes?.socialSecurity ?? 0,
          medicare: result.additionalTaxes?.medicare ?? 0,
          totalTax: result.totalTax ?? 0,
          takeHomeSalary: result.takeHomeSalary ?? 0,
          taxableIncome: result.taxableIncome ?? 0,
          brackets: result.brackets ?? [],
          effectiveTaxRate: result.effectiveTaxRate ?? 0,
          marginalTaxRate: result.marginalTaxRate ?? 0,
          additionalTaxes: result.additionalTaxes ?? {},
          breakdown: result.breakdown ?? {},
          incomeTax: 0,
          soli: 0,
          churchTax: 0,
          taxable: 0,
        });
        break;
      case 'France':
        setTaxDataFrance({
          federalTax: result.breakdown?.incomeTax ?? 0,
          stateTax: result.breakdown?.stateTax ?? 0,
          socialSecurity: result.additionalTaxes?.socialSecurity ?? 0,
          medicare: result.additionalTaxes?.medicare ?? 0,
          totalTax: result.totalTax ?? 0,
          takeHomeSalary: result.takeHomeSalary ?? 0,
          taxableIncome: result.taxableIncome ?? 0,
          brackets: result.brackets ?? [],
          effectiveTaxRate: result.effectiveTaxRate ?? 0,
          marginalTaxRate: result.marginalTaxRate ?? 0,
          additionalTaxes: result.additionalTaxes ?? {},
          breakdown: result.breakdown ?? {},
          incomeTax: 0,
          csgcrds: 0,
          taxable: 0,
        });
        break;
      case 'Brazil':
        setTaxDataBrazil({
          federalTax: result.breakdown?.incomeTax ?? 0,
          stateTax: result.breakdown?.stateTax ?? 0,
          socialSecurity: result.additionalTaxes?.socialSecurity ?? 0,
          medicare: result.additionalTaxes?.medicare ?? 0,
          totalTax: result.totalTax ?? 0,
          takeHomeSalary: result.takeHomeSalary ?? 0,
          taxableIncome: result.taxableIncome ?? 0,
          brackets: result.brackets ?? [],
          effectiveTaxRate: result.effectiveTaxRate ?? 0,
          marginalTaxRate: result.marginalTaxRate ?? 0,
          additionalTaxes: result.additionalTaxes ?? {},
          breakdown: result.breakdown ?? {},
          inss: 0,
          irpf: 0,
          taxable: 0,
        });
        break;
      case 'South Africa':
        setTaxDataSouthAfrica({
          federalTax: result.breakdown?.incomeTax ?? 0,
          stateTax: result.breakdown?.stateTax ?? 0,
          socialSecurity: result.additionalTaxes?.socialSecurity ?? 0,
          medicare: result.additionalTaxes?.medicare ?? 0,
          totalTax: result.totalTax ?? 0,
          takeHomeSalary: result.takeHomeSalary ?? 0,
          taxableIncome: result.taxableIncome ?? 0,
          brackets: result.brackets ?? [],
          effectiveTaxRate: result.effectiveTaxRate ?? 0,
          marginalTaxRate: result.marginalTaxRate ?? 0,
          additionalTaxes: result.additionalTaxes ?? {},
          breakdown: result.breakdown ?? {},
          incomeTax: 0,
          rebate: 0,
          uif: 0,
          taxable: 0,
        });
        break;
      default:
        break;
    }
  }, [salaryData, indiaRegime, usFilingStatus, usState]);

  // Show loading while detecting platform
  if (isMobile) {
    return <MobileIndex />;
  }

  // Original web version logic
  const isSalaryValid = salaryData.grossSalary > 0;
  
  // Improved hasCalculation logic - check if user has completed the calculation process
  const hasCalculation = (
    salaryData.grossSalary > 0 && 
    salaryData.country && 
    taxData.totalTax !== undefined && 
    taxData.totalTax >= 0 && 
    taxData.takeHomeSalary !== undefined && 
    taxData.takeHomeSalary >= 0
  );

  // Debug logging for hasCalculation
  console.log('hasCalculation debug:', {
    salaryDataGrossSalary: salaryData.grossSalary,
    salaryDataCountry: salaryData.country,
    taxDataTotalTax: taxData.totalTax,
    taxDataTakeHomeSalary: taxData.takeHomeSalary,
    hasCalculation: hasCalculation,
    conditions: {
      hasSalary: salaryData.grossSalary > 0,
      hasCountry: !!salaryData.country,
      hasTotalTax: taxData.totalTax !== undefined && taxData.totalTax >= 0,
      hasTakeHomeSalary: taxData.takeHomeSalary !== undefined && taxData.takeHomeSalary >= 0
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
          const existing = calc.data_content;
          return (
            existing.country === salaryData.country &&
            existing.salary === salaryData.grossSalary &&
            existing.currency === salaryData.currency &&
            Math.abs(existing.taxAmount - taxData.totalTax) < 1 &&
            Math.abs(existing.netSalary - taxData.takeHomeSalary) < 1
          );
        });
        return similar || null;
      }
    } catch (error) {
      console.error('Error checking existing calculation:', error);
    }
    return null;
  };

  // Save calculation functionality
  const handleSaveCalculation = async () => {
    if (!user) {
      setShowSignInModal(true);
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
      setExistingCalculation(existing);
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
      salary: salaryData.grossSalary,
      currency: salaryData.currency,
      taxAmount: taxData.totalTax,
      netSalary: taxData.takeHomeSalary,
      effectiveTaxRate: taxData.effectiveTaxRate || (taxData.totalTax / salaryData.grossSalary) * 100,
      deductions: taxData.breakdown?.deductions || 0,
      rebates: taxData.breakdown?.rebates || 0,
      additionalTaxes: taxData.breakdown?.additionalTaxes || 0,
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
          title: "Calculation saved",
          description: "Your calculation has been saved successfully.",
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
        setSavedCalculations(data || []);
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

  const loadCalculation = (calculation: SavedCalculation) => {
    const data = calculation.data_content;
    
    // Load salary data
    setSalaryData(prev => ({
      ...prev,
      country: data.country || '',
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
        setTaxDataCanada(taxDataToLoad as CanadaTaxData);
        break;
      case 'United Kingdom':
        setTaxDataUK(taxDataToLoad as UKTaxData);
        break;
      case 'Australia':
        setTaxDataAustralia(taxDataToLoad as AustraliaTaxData);
        break;
      case 'Germany':
        setTaxDataGermany(taxDataToLoad as GermanyTaxData);
        break;
      case 'France':
        setTaxDataFrance(taxDataToLoad as FranceTaxData);
        break;
      case 'Brazil':
        setTaxDataBrazil(taxDataToLoad as BrazilTaxData);
        break;
      case 'South Africa':
        setTaxDataSouthAfrica(taxDataToLoad as SouthAfricaTaxData);
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
      description: "Your saved calculation has been loaded successfully.",
    });

    // Navigate to analysis tab to show the loaded calculation
    setActiveTab('analysis');
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
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="basics">Location & Salary</TabsTrigger>
              <TabsTrigger 
                value="taxes" 
                disabled={!salaryData.grossSalary || salaryData.grossSalary <= 0 || !salaryData.country}
                className={(!salaryData.grossSalary || salaryData.grossSalary <= 0 || !salaryData.country) ? 'opacity-50 cursor-not-allowed' : ''}
              >
                Tax Calculation
              </TabsTrigger>
              <TabsTrigger 
                value="analysis" 
                disabled={!salaryData.grossSalary || salaryData.grossSalary <= 0 || !salaryData.country}
                className={(!salaryData.grossSalary || salaryData.grossSalary <= 0 || !salaryData.country) ? 'opacity-50 cursor-not-allowed' : ''}
              >
                Living Costs & Savings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Location Details
                    </CardTitle>
                    <CardDescription>
                      Select your country, state, city, and locality for accurate tax calculations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <CountrySelector 
                      salaryData={salaryData} 
                      setSalaryData={setSalaryData}
                      onNext={() => setActiveTab('taxes')}
                      salaryValid={isSalaryValid}
                      onLoadCalculation={() => setShowLoadCalculationModal(true)}
                      showLoadButton={!!user}
                    />
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calculator className="w-5 h-5" />
                      Salary Information
                    </CardTitle>
                    <CardDescription>
                      Enter your annual salary to calculate take-home pay and taxes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SalaryInput 
                      salaryData={salaryData} 
                      setSalaryData={setSalaryData}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="taxes" className="space-y-6">
              <TaxCalculator 
                salaryData={salaryData}
                taxData={taxData}
                setTaxData={setTaxData}
                onNext={() => setActiveTab('analysis')}
                indiaRegime={indiaRegime}
                setIndiaRegime={setIndiaRegime}
                usFilingStatus={usFilingStatus}
                setUsFilingStatus={setUsFilingStatus}
                usState={usState}
                setUsState={setUsState}
              />
            </TabsContent>

            <TabsContent value="analysis" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LivingExpenses 
                  salaryData={salaryData}
                  expenseData={expenseData}
                  setExpenseData={setExpenseData}
                />
                <SavingsAnalysis 
                  salaryData={salaryData}
                  taxData={taxData}
                  expenseData={expenseData}
                />
              </div>
              
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
                          className="flex items-center gap-2"
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
                          className="flex items-center gap-2"
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
        onClose={() => {
          setShowSaveCalculationModal(false);
          setExistingCalculation(null);
        }}
        onSave={saveCalculationAsNew}
        existingCalculation={existingCalculation}
        salaryData={salaryData}
        taxData={taxData}
        expenseData={expenseData}
      />

      {/* Load Calculation Modal */}
      <LoadCalculationModal
        isOpen={showLoadCalculationModal}
        onClose={() => setShowLoadCalculationModal(false)}
        onLoad={loadCalculation}
        userId={user?.id || ''}
      />
    </div>
  );
};

export default Index;
