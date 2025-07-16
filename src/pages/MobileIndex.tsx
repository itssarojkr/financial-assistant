import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { UserDataService } from '@/application/services/UserDataService';
import { TaxCalculationService } from '@/application/services/TaxCalculationService';
import { CalculationStorageService } from '@/application/services/CalculationStorageService';
import { MobileLayout, MobileCard } from '@/components/layout/MobileLayout';
import CountrySelector from '@/components/CountrySelector';
import { SalaryInput } from '@/components/SalaryInput';
import TaxCalculator from '@/components/TaxCalculator';
import LivingExpenses from '@/components/LivingExpenses';
import SavingsAnalysis from '@/components/SavingsAnalysis';
import { SignInModal } from '@/components/auth/SignInModal';
import { SaveCalculationModal } from '@/components/modals/SaveCalculationModal';
import { LoadCalculationModal } from '@/components/modals/LoadCalculationModal';
import { Calculator, Globe, TrendingUp, Save, Plus, History, Settings, User, LogIn } from 'lucide-react';
import { SalaryData, TaxData, ExpenseData, LoadCalculationModalSavedCalculation, ExistingCalculation, TaxCalculationData } from '@/shared/types/common.types';

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
  const loadSavedCalculations = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingSavedCalculations(true);
    try {
      const { data, error } = await TaxCalculationService.getUserTaxCalculations(user.id);
      if (error) {
        toast({
          title: "Error loading calculations",
          description: error.message,
          variant: "destructive",
        });
      } else {
        const calculations = data?.map((item: { 
          id: string; 
          dataName: string; 
          dataContent: unknown; 
          createdAt: Date; 
          updatedAt: Date; 
        }) => ({
          id: item.id,
          data_name: item.dataName,
          data_content: item.dataContent as unknown as {
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
          },
          is_favorite: false,
          created_at: item.createdAt.toISOString(),
          updated_at: item.updatedAt.toISOString()
        })) || [];
        
        setSavedCalculations(calculations);
      }
    } catch (error) {
      toast({
        title: "Error loading calculations",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSavedCalculations(false);
    }
  }, [user, toast]);

  const loadCalculation = (calculation: LoadCalculationModalSavedCalculation) => {
    const content = calculation.data_content;
    
    setSalaryData({
      country: content.country || '',
      countryCode: content.countryCode || (content.country === 'India' ? 'IN' : 'US'),
      state: content.state || '',
      stateId: content.stateId || '',
      city: content.city || '',
      cityId: content.cityId || '',
      locality: content.locality || '',
      localityId: content.localityId || '',
      isNative: content.isNative || false,
      grossSalary: content.salary || 0,
      currency: content.currency || 'USD',
    });

    if (content.expenseData) {
      setExpenseData({
        rent: content.expenseData.rent,
        utilities: content.expenseData.utilities,
        food: content.expenseData.food,
        transport: content.expenseData.transport,
        healthcare: content.expenseData.healthcare,
        other: content.expenseData.other,
        total: content.expenseData.total
      });
    }

    setActiveTab('results');
    setShowLoadCalculationModal(false);
    
    toast({
      title: "Calculation loaded",
      description: "Your saved calculation has been loaded successfully.",
    });
  };

  const checkExistingCalculation = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await TaxCalculationService.getUserTaxCalculations(user.id);
      if (error) {
        console.error('Error checking existing calculations:', error);
        return;
      }
      
      if (data && data.length > 0) {
        const calc = data[0];
        const content = calc.data_content as unknown as {
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
        
        setExistingCalculation({
          id: calc.id,
          data_name: calc.data_name,
          data_content: {
            country: content.country,
            salary: content.salary,
            currency: content.currency,
            taxAmount: content.taxAmount,
            netSalary: content.netSalary,
            effectiveTaxRate: 0,
            deductions: 0,
            rebates: 0,
            additionalTaxes: 0,
            calculationDate: new Date().toISOString(),
            notes: '',
            expenseData: content.expenseData ? {
              rent: content.expenseData.rent || 0,
              utilities: content.expenseData.utilities || 0,
              food: content.expenseData.food || 0,
              transport: content.expenseData.transport || 0,
              healthcare: content.expenseData.healthcare || 0,
              other: content.expenseData.other || 0,
              total: (content.expenseData.rent || 0) + (content.expenseData.utilities || 0) + (content.expenseData.food || 0) + (content.expenseData.transport || 0) + (content.expenseData.healthcare || 0) + (content.expenseData.other || 0)
            } : {
              rent: 0,
              utilities: 0,
              food: 0,
              transport: 0,
              healthcare: 0,
              other: 0,
              total: 0
            }
          }
        });
      }
    } catch (error) {
      console.error('Error checking existing calculations:', error);
    }
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
    await checkExistingCalculation();
    if (existingCalculation) {
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
        // Update existing calculation using UserDataService
        const { error } = await UserDataService.updateUserData(existingId, {
          dataName: calculationName,
          dataContent: calculationData
        });
        
        if (error) throw error;
        result = { data: null, error: null };
      } else {
        // Save as new calculation using UserDataService
        result = await UserDataService.createUserData({
          userId: user.id,
          dataName: calculationName,
          dataType: 'tax_calculation',
          dataContent: calculationData
        });
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
  }, [user, loadSavedCalculations]);

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
              {activeTab === 'basics' && (
                <CountrySelector
                  salaryData={salaryData}
                  setSalaryData={setSalaryData}
                  onNext={() => setActiveTab('salary')}
                />
              )}

              {activeTab === 'salary' && (
                <SalaryInput
                  salaryData={salaryData}
                  setSalaryData={setSalaryData}
                />
              )}

              {activeTab === 'expenses' && (
                <LivingExpenses
                  salaryData={salaryData}
                  expenseData={expenseData}
                  setExpenseData={setExpenseData}
                />
              )}
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
            onHabitChange={setExpenseData}
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