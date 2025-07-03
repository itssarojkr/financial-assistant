
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CountrySelector from '@/components/CountrySelector';
import SalaryInput from '@/components/SalaryInput';
import TaxCalculator from '@/components/TaxCalculator';
import LivingExpenses from '@/components/LivingExpenses';
import SavingsAnalysis from '@/components/SavingsAnalysis';
import { Calculator, Globe, TrendingUp } from 'lucide-react';

export interface SalaryData {
  country: string;
  state: string;
  isNative: boolean;
  grossSalary: number;
  currency: string;
  city: string;
}

export interface TaxData {
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
  totalTax: number;
  takeHomeSalary: number;
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

const Index = () => {
  const [salaryData, setSalaryData] = useState<SalaryData>({
    country: '',
    state: '',
    isNative: true,
    grossSalary: 0,
    currency: 'USD',
    city: ''
  });

  const [taxData, setTaxData] = useState<TaxData>({
    federalTax: 0,
    stateTax: 0,
    socialSecurity: 0,
    medicare: 0,
    totalTax: 0,
    takeHomeSalary: 0
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calculator className="w-8 h-8 text-blue-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Global Salary Calculator
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get accurate take-home salary estimates and savings potential for any country worldwide
          </p>
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${activeTab === 'basics' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">Location & Salary</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${activeTab === 'taxes' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
              <Calculator className="w-4 h-4" />
              <span className="text-sm font-medium">Tax Calculation</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${activeTab === 'analysis' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Analysis</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="basics">Location & Salary</TabsTrigger>
            <TabsTrigger value="taxes">Tax Calculation</TabsTrigger>
            <TabsTrigger value="analysis">Living Costs & Savings</TabsTrigger>
          </TabsList>

          <TabsContent value="basics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <CountrySelector 
                salaryData={salaryData} 
                setSalaryData={setSalaryData}
                onNext={() => setActiveTab('taxes')}
              />
              <SalaryInput 
                salaryData={salaryData} 
                setSalaryData={setSalaryData}
              />
            </div>
          </TabsContent>

          <TabsContent value="taxes" className="space-y-6">
            <TaxCalculator 
              salaryData={salaryData}
              taxData={taxData}
              setTaxData={setTaxData}
              onNext={() => setActiveTab('analysis')}
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
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Estimates are based on current tax rates and average living costs. Actual amounts may vary.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
