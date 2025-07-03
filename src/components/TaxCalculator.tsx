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

interface TaxBracket {
  min: number;
  max: number | null;
  rate: number;
  taxPaid: number;
}

interface TaxBreakdown {
  brackets: TaxBracket[];
  totalTax: number;
  takeHomeSalary: number;
  federalTax: number;
  stateTax: number;
  socialSecurity: number;
  medicare: number;
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

const getCountryTaxBrackets = (country: string): { brackets: { min: number; max: number | null; rate: number }[], stateTax?: number, socialSecurity?: number, medicare?: number, stdDeduction?: number, rebate?: (taxable: number, tax: number, isNative: boolean) => number, cess?: number, cpp?: number, ei?: number, ni?: number, medicareLevy?: number } => {
  switch (country) {
    case 'United States':
      return {
        brackets: [
          { min: 0, max: 11000, rate: 0.10 },
          { min: 11000, max: 44725, rate: 0.12 },
          { min: 44725, max: 95375, rate: 0.22 },
          { min: 95375, max: 182100, rate: 0.24 },
          { min: 182100, max: 231250, rate: 0.32 },
          { min: 231250, max: 578125, rate: 0.35 },
          { min: 578125, max: null, rate: 0.37 },
        ],
        stateTax: 0.05,
        socialSecurity: 0.062,
        medicare: 0.0145,
        stdDeduction: 13850, // 2023 single
      };
    case 'Canada':
      return {
        brackets: [
          { min: 0, max: 53359, rate: 0.15 },
          { min: 53359, max: 106717, rate: 0.205 },
          { min: 106717, max: 165430, rate: 0.26 },
          { min: 165430, max: 235675, rate: 0.29 },
          { min: 235675, max: null, rate: 0.33 },
        ],
        stateTax: 0.08,
        socialSecurity: 0.0525,
        stdDeduction: 15000, // Basic personal amount
        cpp: 0.0575, // Canada Pension Plan (2023, simplified)
        ei: 0.0163, // Employment Insurance (2023, simplified)
      };
    case 'United Kingdom':
      return {
        brackets: [
          { min: 0, max: 12570, rate: 0 },
          { min: 12570, max: 50270, rate: 0.20 },
          { min: 50270, max: 125140, rate: 0.40 },
          { min: 125140, max: null, rate: 0.45 },
        ],
        socialSecurity: 0.12, // National Insurance (simplified)
        ni: 0.12, // National Insurance (simplified)
      };
    case 'Germany':
      return {
        brackets: [
          { min: 0, max: 10908, rate: 0 },
          { min: 10908, max: 15999, rate: 0.14 },
          { min: 15999, max: 62809, rate: 0.24 },
          { min: 62809, max: 277825, rate: 0.42 },
          { min: 277825, max: null, rate: 0.45 },
        ],
        socialSecurity: 0.20, // Simplified
      };
    case 'India':
      // FY 2025-26 new regime: https://economictimes.indiatimes.com/wealth/income-tax-slabs?from=mdr
      return {
        brackets: [
          { min: 0, max: 400000, rate: 0 },
          { min: 400000, max: 800000, rate: 0.05 },
          { min: 800000, max: 1200000, rate: 0.10 },
          { min: 1200000, max: 1600000, rate: 0.15 },
          { min: 1600000, max: 2000000, rate: 0.20 },
          { min: 2000000, max: 2400000, rate: 0.25 },
          { min: 2400000, max: null, rate: 0.30 },
        ],
        stdDeduction: 75000, // Standard deduction
        // Section 87A rebate: No tax if net taxable income <= 12 lakh (rebate up to 60,000)
        rebate: (taxable, tax, isNative) => {
          if (isNative && taxable <= 1200000) {
            // Rebate up to 60,000 (i.e., all tax wiped out if taxable <= 12L)
            return Math.min(tax, 60000);
          }
          return 0;
        },
        cess: 0.04, // Health & Education Cess (4% on income tax after rebate)
      };
    case 'Australia':
      return {
        brackets: [
          { min: 0, max: 18200, rate: 0 },
          { min: 18200, max: 45000, rate: 0.19 },
          { min: 45000, max: 120000, rate: 0.325 },
          { min: 120000, max: 180000, rate: 0.37 },
          { min: 180000, max: null, rate: 0.45 },
        ],
        medicareLevy: 0.02, // Medicare Levy (2%)
      };
    case 'Brazil':
      return {
        brackets: [
          { min: 0, max: 22847.76, rate: 0 },
          { min: 22847.76, max: 33919.80, rate: 0.075 },
          { min: 33919.80, max: 45012.60, rate: 0.15 },
          { min: 45012.60, max: 55976.16, rate: 0.225 },
          { min: 55976.16, max: null, rate: 0.275 },
        ],
      };
    case 'South Africa':
      return {
        brackets: [
          { min: 0, max: 237100, rate: 0.18 },
          { min: 237100, max: 370500, rate: 0.26 },
          { min: 370500, max: 512800, rate: 0.31 },
          { min: 512800, max: 673000, rate: 0.36 },
          { min: 673000, max: 857900, rate: 0.39 },
          { min: 857900, max: 1817000, rate: 0.41 },
          { min: 1817000, max: null, rate: 0.45 },
        ],
        // Primary rebate: R17,235 (2023/24) for under 65
        rebate: (taxable, tax, isNative) => Math.min(tax, 17235),
      };
    case 'France':
      return {
        brackets: [
          { min: 0, max: 10777, rate: 0 },
          { min: 10777, max: 27478, rate: 0.11 },
          { min: 27478, max: 78570, rate: 0.30 },
          { min: 78570, max: 168994, rate: 0.41 },
          { min: 168994, max: null, rate: 0.45 },
        ],
      };
    default:
      return {
        brackets: [
          { min: 0, max: 50000, rate: 0.20 },
          { min: 50000, max: null, rate: 0.30 },
        ],
      };
  }
};

function calculateBracketTax(grossSalary: number, brackets: { min: number; max: number | null; rate: number }[]): TaxBracket[] {
  let result: TaxBracket[] = [];
  for (const bracket of brackets) {
    if (grossSalary <= bracket.min) {
      result.push({ ...bracket, taxPaid: 0 });
      continue;
    }
    const upper = bracket.max === null ? grossSalary : Math.min(grossSalary, bracket.max);
    const taxable = Math.max(0, upper - bracket.min);
    const tax = taxable * bracket.rate;
    result.push({ ...bracket, taxPaid: tax });
  }
  return result;
}

// Helper to get country-specific tax labels
const getTaxLabels = (country: string) => {
  switch (country) {
    case 'United States':
      return {
        federal: 'Federal Tax',
        state: 'State Tax',
        social: 'Social Security',
        medicare: 'Medicare',
      };
    case 'Canada':
      return {
        federal: 'Federal Tax',
        state: 'Provincial Tax',
        social: 'Canada Pension Plan',
        medicare: 'Employment Insurance',
        cpp: 'Canada Pension Plan',
        ei: 'Employment Insurance',
      };
    case 'United Kingdom':
      return {
        federal: 'Income Tax',
        state: '',
        social: 'National Insurance',
        medicare: '',
        ni: 'National Insurance',
      };
    case 'Germany':
      return {
        federal: 'Income Tax',
        state: '',
        social: 'Social Security',
        medicare: '',
      };
    case 'India':
      return {
        federal: 'Income Tax',
        state: '',
        social: '',
        medicare: '',
        cess: 'Health & Education Cess',
      };
    case 'Australia':
      return {
        federal: 'Income Tax',
        state: '',
        social: '',
        medicare: '',
        medicareLevy: 'Medicare Levy',
      };
    case 'Brazil':
      return {
        federal: 'Income Tax',
        state: '',
        social: '',
        medicare: '',
      };
    case 'South Africa':
      return {
        federal: 'Income Tax',
        state: '',
        social: '',
        medicare: '',
      };
    case 'France':
      return {
        federal: 'Income Tax',
        state: '',
        social: '',
        medicare: '',
      };
    default:
      return {
        federal: 'Federal Tax',
        state: 'State Tax',
        social: 'Social Security',
        medicare: 'Medicare',
      };
  }
};

const TaxCalculator: React.FC<TaxCalculatorProps> = ({ salaryData, taxData, setTaxData, onNext }) => {
  const currencySymbol = currencySymbols[salaryData.currency] || salaryData.currency;

  // Move formatNumber up so it can be used in deductionInfo
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(num));
  };

  // Get deduction and rebate info for display
  const countryInfo = getCountryTaxBrackets(salaryData.country);
  const deductionInfo = (() => {
    if (salaryData.country === 'India' && countryInfo.stdDeduction) {
      return `Standard Deduction: ₹${formatNumber(countryInfo.stdDeduction)} (applied before tax calculation)`;
    }
    if (salaryData.country === 'United States' && countryInfo.stdDeduction) {
      return `Standard Deduction: $${formatNumber(countryInfo.stdDeduction)} (applied before tax calculation)`;
    }
    if (salaryData.country === 'Canada' && countryInfo.stdDeduction) {
      return `Basic Personal Amount: $${formatNumber(countryInfo.stdDeduction)} (tax-free)`;
    }
    if (salaryData.country === 'South Africa') {
      return `Primary Rebate: R17,235 (deducted from tax owed)`;
    }
    return null;
  })();

  const rebateInfo = (() => {
    if (salaryData.country === 'India') {
      return 'Section 87A Rebate: If net taxable income ≤ ₹12,00,000, all tax is wiped out (rebate up to ₹60,000).';
    }
    if (salaryData.country === 'South Africa') {
      return 'Primary Rebate: R17,235 is subtracted from your tax liability.';
    }
    return null;
  })();

  const taxLabels = getTaxLabels(salaryData.country);

  useEffect(() => {
    if (salaryData.grossSalary > 0) {
      const countryInfo = getCountryTaxBrackets(salaryData.country);
      let taxableIncome = salaryData.grossSalary;
      if (countryInfo.stdDeduction) {
        taxableIncome = Math.max(0, taxableIncome - countryInfo.stdDeduction);
      }
      const brackets = countryInfo.brackets;
      const bracketTaxes = calculateBracketTax(taxableIncome, brackets);
      let federalTax = bracketTaxes.reduce((sum, b) => sum + b.taxPaid, 0);
      let rebate = 0;
      if (countryInfo.rebate) {
        rebate = countryInfo.rebate(taxableIncome, federalTax, salaryData.isNative);
        federalTax = Math.max(0, federalTax - rebate);
      }
      let stateTax = countryInfo.stateTax ? salaryData.grossSalary * countryInfo.stateTax : 0;
      let socialSecurity = countryInfo.socialSecurity ? salaryData.grossSalary * countryInfo.socialSecurity : 0;
      let medicare = countryInfo.medicare ? salaryData.grossSalary * countryInfo.medicare : 0;
      let cpp = countryInfo.cpp ? salaryData.grossSalary * countryInfo.cpp : 0;
      let ei = countryInfo.ei ? salaryData.grossSalary * countryInfo.ei : 0;
      let ni = countryInfo.ni ? salaryData.grossSalary * countryInfo.ni : 0;
      let medicareLevy = countryInfo.medicareLevy ? taxableIncome * countryInfo.medicareLevy : 0;
      let cess = 0;
      if (countryInfo.cess) {
        cess = federalTax * countryInfo.cess;
      }
      let totalTax = federalTax + stateTax + socialSecurity + medicare + cpp + ei + ni + medicareLevy + cess;
      if (salaryData.country === 'United States' && !salaryData.isNative) {
        totalTax += salaryData.grossSalary * 0.02; // extra for non-residents
      }
      const takeHomeSalary = salaryData.grossSalary - totalTax;
      setTaxData({
        brackets: bracketTaxes,
        totalTax,
        takeHomeSalary,
        federalTax,
        stateTax,
        socialSecurity,
        medicare,
        cpp,
        ei,
        ni,
        medicareLevy,
        cess,
      });
    }
  }, [salaryData, setTaxData]);

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

  // Helper to format bracket range
  const formatBracketRange = (min: number, max: number | null, currency: string) => {
    if (max === null) return `${currency}${formatNumber(min)}+`;
    return `${currency}${formatNumber(min)} - ${currency}${formatNumber(max)}`;
  };

  // Find the user's bracket (the last bracket with taxPaid > 0)
  const userBracketIdx = taxData.brackets && taxData.brackets.length > 0
    ? taxData.brackets.map(b => b.taxPaid > 0).lastIndexOf(true)
    : -1;

  // Calculate monthly take-home
  const monthlyTakeHome = taxData.takeHomeSalary > 0 ? taxData.takeHomeSalary / 12 : 0;

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
          {(deductionInfo || rebateInfo) && (
            <div className="mb-2 p-2 bg-blue-50 rounded text-xs text-blue-800 border border-blue-100">
              {deductionInfo && <div>{deductionInfo}</div>}
              {rebateInfo && <div>{rebateInfo}</div>}
            </div>
          )}
          {taxData.takeHomeSalary > 0 && (
            <>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium text-green-800">Take-Home Salary</span>
                  <span className="text-xl font-bold text-green-600">
                    {currencySymbol}{formatNumber(taxData.takeHomeSalary)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg text-green-700 text-sm">
                  <span>Monthly Take-Home</span>
                  <span className="font-semibold">{currencySymbol}{formatNumber(monthlyTakeHome)}</span>
                </div>

                <div className="space-y-2">
                  {taxLabels.federal && taxData.federalTax > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>{taxLabels.federal}</span>
                        <span className="font-medium">{currencySymbol}{formatNumber(taxData.federalTax)}</span>
                      </div>
                      <Progress value={(taxData.federalTax / salaryData.grossSalary) * 100} className="h-2" />
                    </>
                  )}
                  {taxLabels.state && taxData.stateTax > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>{taxLabels.state}</span>
                        <span className="font-medium">{currencySymbol}{formatNumber(taxData.stateTax)}</span>
                      </div>
                      <Progress value={(taxData.stateTax / salaryData.grossSalary) * 100} className="h-2" />
                    </>
                  )}
                  {taxLabels.social && taxData.socialSecurity > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>{taxLabels.social}</span>
                        <span className="font-medium">{currencySymbol}{formatNumber(taxData.socialSecurity)}</span>
                      </div>
                      <Progress value={(taxData.socialSecurity / salaryData.grossSalary) * 100} className="h-2" />
                    </>
                  )}
                  {taxLabels.medicare && taxData.medicare > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>{taxLabels.medicare}</span>
                        <span className="font-medium">{currencySymbol}{formatNumber(taxData.medicare)}</span>
                      </div>
                      <Progress value={(taxData.medicare / salaryData.grossSalary) * 100} className="h-2" />
                    </>
                  )}
                  {taxLabels.cpp && taxData.cpp > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>{taxLabels.cpp}</span>
                        <span className="font-medium">{currencySymbol}{formatNumber(taxData.cpp)}</span>
                      </div>
                      <Progress value={(taxData.cpp / salaryData.grossSalary) * 100} className="h-2" />
                    </>
                  )}
                  {taxLabels.ei && taxData.ei > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>{taxLabels.ei}</span>
                        <span className="font-medium">{currencySymbol}{formatNumber(taxData.ei)}</span>
                      </div>
                      <Progress value={(taxData.ei / salaryData.grossSalary) * 100} className="h-2" />
                    </>
                  )}
                  {taxLabels.ni && taxData.ni > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>{taxLabels.ni}</span>
                        <span className="font-medium">{currencySymbol}{formatNumber(taxData.ni)}</span>
                      </div>
                      <Progress value={(taxData.ni / salaryData.grossSalary) * 100} className="h-2" />
                    </>
                  )}
                  {taxLabels.medicareLevy && taxData.medicareLevy > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>{taxLabels.medicareLevy}</span>
                        <span className="font-medium">{currencySymbol}{formatNumber(taxData.medicareLevy)}</span>
                      </div>
                      <Progress value={(taxData.medicareLevy / salaryData.grossSalary) * 100} className="h-2" />
                    </>
                  )}
                  {taxLabels.cess && taxData.cess > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>{taxLabels.cess}</span>
                        <span className="font-medium">{currencySymbol}{formatNumber(taxData.cess)}</span>
                      </div>
                      <Progress value={(taxData.cess / salaryData.grossSalary) * 100} className="h-2" />
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

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Tax Bracket Breakdown</CardTitle>
          <CardDescription>
            See how your income is taxed in each bracket
          </CardDescription>
        </CardHeader>
        <CardContent>
          {taxData.brackets && taxData.brackets.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border rounded-lg">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left font-semibold">Bracket Range</th>
                    <th className="px-4 py-2 text-left font-semibold">Rate</th>
                    <th className="px-4 py-2 text-left font-semibold">Income Taxed</th>
                    <th className="px-4 py-2 text-left font-semibold">Tax Paid</th>
                  </tr>
                </thead>
                <tbody>
                  {taxData.brackets.map((bracket, idx) => {
                    const isUserBracket = idx === userBracketIdx;
                    const incomeTaxed = bracket.max === null
                      ? Math.max(0, salaryData.grossSalary - bracket.min)
                      : Math.max(0, Math.min(salaryData.grossSalary, bracket.max) - bracket.min);
                    return (
                      <tr
                        key={idx}
                        className={
                          isUserBracket
                            ? 'bg-blue-50 font-semibold text-blue-900'
                            : idx % 2 === 0
                            ? 'bg-white'
                            : 'bg-gray-50'
                        }
                      >
                        <td className="px-4 py-2 whitespace-nowrap">{formatBracketRange(bracket.min, bracket.max, currencySymbol)}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{(bracket.rate * 100).toFixed(1)}%</td>
                        <td className="px-4 py-2 whitespace-nowrap">{currencySymbol}{formatNumber(incomeTaxed)}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{currencySymbol}{formatNumber(bracket.taxPaid)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="text-xs text-gray-500 mt-2">
                Highlighted row shows the bracket you fall into based on your gross salary.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TaxCalculator;
