import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { UserDataService, TaxCalculationData } from '@/application/services/UserDataService';
import { MobileLayout, MobileCard } from '@/components/layout/MobileLayout';
import { CountrySelector } from '@/components/CountrySelector';
import { SalaryInput } from '@/components/SalaryInput';
import TaxCalculator from '@/components/TaxCalculator';
import LivingExpenses from '@/components/LivingExpenses';
import SavingsAnalysis from '@/components/SavingsAnalysis';
import { Calculator, Globe, TrendingUp, Save, Plus, History, Settings } from 'lucide-react';
import { SalaryData, TaxData, ExpenseData } from './Index';

const MobileIndex = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [salaryData, setSalaryData] = useState<SalaryData>({
    country: '',
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

  const handleSaveCalculation = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save your calculations.",
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
    };

    const name = `${salaryData.country} - ${salaryData.currency} ${salaryData.grossSalary.toLocaleString()}`;

    try {
      const { error } = await UserDataService.saveTaxCalculation(user.id, calculationData, name);
      
      if (error) {
        toast({
          title: "Error saving calculation",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Calculation saved",
          description: "Your calculation has been saved successfully.",
        });
      }
    } catch (err) {
      toast({
        title: "Error saving calculation",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

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
            onClick={() => {/* TODO: Open saved calculations */}}
          >
            <History className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <h3 className="font-semibold text-sm">Saved</h3>
            <p className="text-xs text-gray-500">View history</p>
          </MobileCard>
        </div>
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
          />
          <SalaryInput 
            salaryData={salaryData} 
            setSalaryData={setSalaryData}
          />
        </TabsContent>

        <TabsContent value="taxes" className="space-y-4">
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

        <TabsContent value="analysis" className="space-y-4">
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
    </MobileLayout>
  );
};

export default MobileIndex; 