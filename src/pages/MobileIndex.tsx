import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { UserDataService, TaxCalculationData } from '@/application/services/UserDataService';
import { CalculationStorageService } from '@/application/services/CalculationStorageService';
import { MobileLayout, MobileCard } from '@/components/layout/MobileLayout';
import { CountrySelector } from '@/components/CountrySelector';
import { SalaryInput } from '@/components/SalaryInput';
import TaxCalculator from '@/components/TaxCalculator';
import LivingExpenses from '@/components/LivingExpenses';
import SavingsAnalysis from '@/components/SavingsAnalysis';
import { SignInModal } from '@/components/auth/SignInModal';
import { SaveCalculationModal } from '@/components/modals/SaveCalculationModal';
import { LoadCalculationModal } from '@/components/modals/LoadCalculationModal';
import { Calculator, Globe, TrendingUp, Save, Plus, History, Settings, User, LogIn } from 'lucide-react';
import { SalaryData, TaxData, ExpenseData } from './Index';

// Import the correct interfaces from the modals
interface LoadCalculationModalSavedCalculation {
  id: string;
  data_name: string;
  data_content: {
    country: string;
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

interface ExistingCalculation {
  id: string;
  data_name: string;
  data_content: {
    country: string;
    salary: number;
    currency: string;
    taxAmount: number;
    netSalary: number;
    expenseData?: {
      rent: number;
      utilities: number;
      food: number;
      transport: number;
      healthcare: number;
      other: number;
    };
  };
}

// Add missing type definitions
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

type AustraliaTaxData = TaxData & {
  incomeTax: number;
  medicareSurcharge: number;
  super: number;
  taxable: number;
};

type GermanyTaxData = TaxData & {
  incomeTax: number;
  soli: number;
  churchTax: number;
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

const MobileIndex = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Modal states
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSaveCalculationModal, setShowSaveCalculationModal] = useState(false);
  const [showLoadCalculationModal, setShowLoadCalculationModal] = useState(false);
  const [existingCalculation, setExistingCalculation] = useState<ExistingCalculation | null>(null);
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
    isNative: true,
    grossSalary: 0,
    currency: 'USD',
  });

  // Country-specific tax data states (same as Index.tsx)
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
  const isSalaryValid = salaryData.grossSalary > 0;
  const [indiaRegime, setIndiaRegime] = useState<'new' | 'old'>('new');
  const [usFilingStatus, setUsFilingStatus] = useState<'single' | 'married' | 'head'>('single');
  const [usState, setUsState] = useState('');

  // Select correct taxData and setTaxData for the selected country
  let currentTaxData: TaxData = {
    federalTax: 0,
    stateTax: 0,
    socialSecurity: 0,
    medicare: 0,
    totalTax: 0,
    takeHomeSalary: 0,
    taxableIncome: 0,
  };
  let setTaxData: React.Dispatch<React.SetStateAction<TaxData>> = () => {};
  
  switch (salaryData.country) {
    case 'India':
      currentTaxData = taxDataIndia;
      setTaxData = setTaxDataIndia as React.Dispatch<React.SetStateAction<TaxData>>;
      break;
    case 'United States':
      currentTaxData = taxDataUS;
      setTaxData = setTaxDataUS as React.Dispatch<React.SetStateAction<TaxData>>;
      break;
    case 'Canada':
      currentTaxData = taxDataCanada;
      setTaxData = setTaxDataCanada as React.Dispatch<React.SetStateAction<TaxData>>;
      break;
    case 'United Kingdom':
    case 'UK':
      currentTaxData = taxDataUK;
      setTaxData = setTaxDataUK as React.Dispatch<React.SetStateAction<TaxData>>;
      break;
    case 'Australia':
      currentTaxData = taxDataAustralia;
      setTaxData = setTaxDataAustralia as React.Dispatch<React.SetStateAction<TaxData>>;
      break;
    case 'Germany':
      currentTaxData = taxDataGermany;
      setTaxData = setTaxDataGermany as React.Dispatch<React.SetStateAction<TaxData>>;
      break;
    case 'France':
      currentTaxData = taxDataFrance;
      setTaxData = setTaxDataFrance as React.Dispatch<React.SetStateAction<TaxData>>;
      break;
    case 'Brazil':
      currentTaxData = taxDataBrazil;
      setTaxData = setTaxDataBrazil as React.Dispatch<React.SetStateAction<TaxData>>;
      break;
    case 'South Africa':
      currentTaxData = taxDataSouthAfrica;
      setTaxData = setTaxDataSouthAfrica as React.Dispatch<React.SetStateAction<TaxData>>;
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
      setTaxData = () => {};
  }

  const hasCalculation = currentTaxData.totalTax > 0 && salaryData.grossSalary > 0;

  // Load saved calculations
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
        // Filter and type the data properly
        const typedData = (data || []).filter(item => 
          item.data_content && 
          typeof item.data_content === 'object' && 
          'country' in item.data_content
        ) as LoadCalculationModalSavedCalculation[];
        setSavedCalculations(typedData);
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

  // Load calculation from saved data
  const loadCalculation = (calculation: LoadCalculationModalSavedCalculation) => {
    const data = calculation.data_content;
    
    // Load salary data
    setSalaryData(prev => ({
      ...prev,
      country: data.country || '',
      countryCode: '',
      grossSalary: data.salary || 0,
      currency: data.currency || 'USD',
    }));

    // Load tax data based on country
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
        setTaxDataCanada({ ...taxDataToLoad, provTax: 0, cpp: 0, ei: 0, federalTaxable: 0, provTaxable: 0, brackets: [] });
        break;
      case 'United Kingdom':
        setTaxDataUK({ ...taxDataToLoad, incomeTax: 0, ni: 0, studentLoan: 0, taxable: 0, brackets: [] });
        break;
      case 'Australia':
        setTaxDataAustralia({ ...taxDataToLoad, incomeTax: 0, medicareSurcharge: 0, super: 0, taxable: 0, brackets: [] });
        break;
      case 'Germany':
        setTaxDataGermany({ ...taxDataToLoad, incomeTax: 0, soli: 0, churchTax: 0, taxable: 0, brackets: [] });
        break;
      case 'France':
        setTaxDataFrance({ ...taxDataToLoad, incomeTax: 0, csgcrds: 0, taxable: 0, brackets: [] });
        break;
      case 'Brazil':
        setTaxDataBrazil({ ...taxDataToLoad, inss: 0, irpf: 0, taxable: 0, brackets: [] });
        break;
      case 'South Africa':
        setTaxDataSouthAfrica({ ...taxDataToLoad, incomeTax: 0, rebate: 0, uif: 0, taxable: 0, brackets: [] });
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

  // Check for existing similar calculation
  const checkExistingCalculation = async () => {
    if (!user || !hasCalculation) return null;
    
    try {
      const { data } = await UserDataService.getTaxCalculations(user.id);
      if (data && data.length > 0) {
        // Find calculation with similar data
        const similar = data.find(calc => {
          const existing = calc.data_content as TaxCalculationData;
          return (
            existing.country === salaryData.country &&
            existing.salary === salaryData.grossSalary &&
            existing.currency === salaryData.currency &&
            Math.abs((existing.taxAmount as number) - currentTaxData.totalTax) < 1 &&
            Math.abs((existing.netSalary as number) - currentTaxData.takeHomeSalary) < 1
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
      // Convert to ExistingCalculation type
      const existingCalc: ExistingCalculation = {
        id: existing.id,
        data_name: existing.data_name,
        data_content: {
          country: (existing.data_content as TaxCalculationData).country || '',
          salary: (existing.data_content as TaxCalculationData).salary || 0,
          currency: (existing.data_content as TaxCalculationData).currency || '',
          taxAmount: (existing.data_content as TaxCalculationData).taxAmount || 0,
          netSalary: (existing.data_content as TaxCalculationData).netSalary || 0,
          expenseData: (existing.data_content as TaxCalculationData).expenseData || {
            rent: 0,
            utilities: 0,
            food: 0,
            transport: 0,
            healthcare: 0,
            other: 0,
          },
        },
      };
      setExistingCalculation(existingCalc);
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
      taxAmount: currentTaxData.totalTax,
      netSalary: currentTaxData.takeHomeSalary,
      effectiveTaxRate: currentTaxData.effectiveTaxRate || (currentTaxData.totalTax / salaryData.grossSalary) * 100,
      deductions: currentTaxData.breakdown?.deductions || 0,
      rebates: currentTaxData.breakdown?.rebates || 0,
      additionalTaxes: currentTaxData.breakdown?.additionalTaxes || 0,
      calculationDate: new Date().toISOString(),
      notes: `${salaryData.country} - ${salaryData.state} ${salaryData.city}`,
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

  // Load saved calculations when user changes
  useEffect(() => {
    if (user) {
      loadSavedCalculations();
    }
  }, [user]);

  return (
    <MobileLayout title="Financial Assistant">
      {/* Quick Actions */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-3">
          <MobileCard 
            className="p-4 text-center"
            onClick={() => setActiveTab('basics')}
          >
            <Globe className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <h3 className="font-semibold text-sm">New Calculation</h3>
            <p className="text-xs text-gray-500">Start fresh</p>
          </MobileCard>
          
          <MobileCard 
            className="p-4 text-center"
            onClick={() => setShowLoadCalculationModal(true)}
          >
            <History className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <h3 className="font-semibold text-sm">Saved</h3>
            <p className="text-xs text-gray-500">View history</p>
          </MobileCard>
        </div>
      </div>

      {/* User Status */}
      <div className="mb-4">
        {user ? (
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Signed in as {user.email}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2">
              <LogIn className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Sign in to save calculations
              </span>
            </div>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowSignInModal(true)}
            >
              Sign In
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="basics" className="text-xs">Location & Salary</TabsTrigger>
          <TabsTrigger value="taxes" className="text-xs">Tax Calculation</TabsTrigger>
          <TabsTrigger value="analysis" className="text-xs">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="basics" className="space-y-4">
          <CountrySelector 
            salaryData={salaryData} 
            setSalaryData={setSalaryData}
            onNext={() => setActiveTab('taxes')}
            salaryValid={isSalaryValid}
            onLoadCalculation={() => setShowLoadCalculationModal(true)}
            showLoadButton={!!user}
          />
          <SalaryInput 
            salaryData={salaryData} 
            setSalaryData={setSalaryData}
          />
        </TabsContent>

        <TabsContent value="taxes" className="space-y-4">
          <TaxCalculator 
            salaryData={salaryData}
            taxData={currentTaxData}
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

        <TabsContent value="analysis" className="space-y-4">
          <LivingExpenses 
            salaryData={salaryData}
            expenseData={expenseData}
            setExpenseData={setExpenseData}
          />
          <SavingsAnalysis 
            salaryData={salaryData}
            taxData={currentTaxData}
            expenseData={expenseData}
          />
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      {hasCalculation && (
        <div className="fixed bottom-4 left-4 right-4 z-50">
          <Button 
            onClick={handleSaveCalculation}
            className="w-full"
            size="lg"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Calculation
          </Button>
        </div>
      )}

      {/* Authentication Modal */}
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
        {...(existingCalculation && { existingCalculation })}
        salaryData={salaryData}
        taxData={currentTaxData}
        expenseData={expenseData}
      />

      {/* Load Calculation Modal */}
      <LoadCalculationModal
        isOpen={showLoadCalculationModal}
        onClose={() => setShowLoadCalculationModal(false)}
        onLoad={loadCalculation}
        userId={user?.id || ''}
      />
    </MobileLayout>
  );
};

export default MobileIndex; 