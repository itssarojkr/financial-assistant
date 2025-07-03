
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calculator, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { SalaryData, TaxData } from '@/pages/Index';

interface TaxCalculatorProps {
  salaryData: SalaryData;
  taxData: TaxData;
  setTaxData: (data: TaxData) => void;
  onNext: () => void;
}

const currencySymbols: { [key: string]: string } = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'C$',
  AUD: 'A$',
  JPY: '¥',
  SGD: 'S$',
  CHF: 'CHF'
};

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

const TaxCalculator: React.FC<TaxCalculatorProps> = ({ salaryData, taxData, setTaxData, onNext }) => {
  const currencySymbol = currencySymbols[salaryData.currency] || salaryData.currency;

  const calculateTaxes = (grossSalary: number, country: string, isNative: boolean) => {
    // Simplified tax calculation - in a real app, this would use actual tax tables
    let federalRate = 0;
    let stateRate = 0;
    let socialSecurityRate = 0;
    let medicareRate = 0;

    switch (country) {
      case 'United States':
        federalRate = grossSalary > 100000 ? 0.24 : grossSalary > 50000 ? 0.22 : 0.12;
        stateRate = 0.05; // Simplified state tax
        socialSecurityRate = 0.062;
        medicareRate = 0.0145;
        if (!isNative) federalRate += 0.02; // Additional tax for non-residents
        break;
      case 'United Kingdom':
        federalRate = grossSalary > 50000 ? 0.40 : 0.20;
        socialSecurityRate = 0.12; // National Insurance
        break;
      case 'Germany':
        federalRate = grossSalary > 60000 ? 0.35 : 0.25;
        socialSecurityRate = 0.20; // Social security contributions
        break;
      case 'Canada':
        federalRate = grossSalary > 50000 ? 0.26 : 0.15;
        stateRate = 0.08;
        socialSecurityRate = 0.05;
        break;
      default:
        federalRate = 0.20;
        stateRate = 0.05;
        socialSecurityRate = 0.08;
    }

    const federalTax = grossSalary * federalRate;
    const stateTax = grossSalary * stateRate;
    const socialSecurity = grossSalary * socialSecurityRate;
    const medicare = grossSalary * medicareRate;
    const totalTax = federalTax + stateTax + socialSecurity + medicare;
    const takeHomeSalary = grossSalary - totalTax;

    return {
      federalTax,
      stateTax,
      socialSecurity,
      medicare,
      totalTax,
      takeHomeSalary
    };
  };

  useEffect(() => {
    if (salaryData.grossSalary > 0) {
      const calculations = calculateTaxes(salaryData.grossSalary, salaryData.country, salaryData.isNative);
      setTaxData(calculations);
    }
  }, [salaryData, setTaxData]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(num));
  };

  const pieData = [
    { name: 'Take Home', value: taxData.takeHomeSalary, color: '#10B981' },
    { name: 'Federal Tax', value: taxData.federalTax, color: '#3B82F6' },
    { name: 'State Tax', value: taxData.stateTax, color: '#F59E0B' },
    { name: 'Social Security', value: taxData.socialSecurity, color: '#EF4444' },
  ];

  const barData = [
    { name: 'Gross Salary', value: salaryData.grossSalary },
    { name: 'Take Home', value: taxData.takeHomeSalary },
  ];

  const effectiveTaxRate = salaryData.grossSalary > 0 ? (taxData.totalTax / salaryData.grossSalary) * 100 : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-blue-600" />
            Tax Breakdown
          </CardTitle>
          <CardDescription>
            Detailed tax calculation for {salaryData.country}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {taxData.takeHomeSalary > 0 && (
            <>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-green-800">Take-Home Salary</span>
                  <span className="text-xl font-bold text-green-600">
                    {currencySymbol}{formatNumber(taxData.takeHomeSalary)}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Federal Tax</span>
                    <span className="font-medium">{currencySymbol}{formatNumber(taxData.federalTax)}</span>
                  </div>
                  <Progress value={(taxData.federalTax / salaryData.grossSalary) * 100} className="h-2" />

                  {taxData.stateTax > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>State Tax</span>
                        <span className="font-medium">{currencySymbol}{formatNumber(taxData.stateTax)}</span>
                      </div>
                      <Progress value={(taxData.stateTax / salaryData.grossSalary) * 100} className="h-2" />
                    </>
                  )}

                  <div className="flex justify-between text-sm">
                    <span>Social Security</span>
                    <span className="font-medium">{currencySymbol}{formatNumber(taxData.socialSecurity)}</span>
                  </div>
                  <Progress value={(taxData.socialSecurity / salaryData.grossSalary) * 100} className="h-2" />

                  {taxData.medicare > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>Medicare</span>
                        <span className="font-medium">{currencySymbol}{formatNumber(taxData.medicare)}</span>
                      </div>
                      <Progress value={(taxData.medicare / salaryData.grossSalary) * 100} className="h-2" />
                    </>
                  )}
                </div>

                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border-t">
                  <span className="font-medium text-blue-800">Effective Tax Rate</span>
                  <span className="text-lg font-bold text-blue-600">{effectiveTaxRate.toFixed(1)}%</span>
                </div>
              </div>

              <Button onClick={onNext} className="w-full">
                Continue to Living Expenses
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Visual Breakdown</CardTitle>
          <CardDescription>
            See how your salary is distributed
          </CardDescription>
        </CardHeader>
        <CardContent>
          {taxData.takeHomeSalary > 0 && (
            <div className="space-y-6">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `${currencySymbol}${formatNumber(value)}`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {pieData.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxCalculator;
