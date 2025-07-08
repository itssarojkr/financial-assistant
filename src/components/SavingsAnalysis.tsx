import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Wallet, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { SalaryData, TaxData, ExpenseData } from '@/pages/Index';
import { convertCurrency } from '@/lib/utils';

interface SavingsAnalysisProps {
  salaryData: SalaryData;
  taxData: TaxData;
  expenseData: ExpenseData;
  userCurrency?: string;
  countryCurrency?: string;
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

type SpendingHabit = 'conservative' | 'moderate' | 'liberal';

const SavingsAnalysis: React.FC<SavingsAnalysisProps> = ({ salaryData, taxData, expenseData, userCurrency, countryCurrency }) => {
  const [spendingHabit, setSpendingHabit] = useState<SpendingHabit>('moderate');
  const currencySymbol = currencySymbols[salaryData.currency] || salaryData.currency;

  const showSecondaryCurrency = userCurrency && countryCurrency && userCurrency !== countryCurrency;
  const formatAmount = (amount: number) => `${countryCurrency || salaryData.currency}${Math.round(amount).toLocaleString()}`;
  const formatAmountSecondary = (amount: number) => showSecondaryCurrency ? ` (${userCurrency}${Math.round(convertCurrency(amount, countryCurrency!, userCurrency!)).toLocaleString()})` : '';

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(num));
  };

  const calculateSavings = () => {
    const monthlyTakeHome = taxData.takeHomeSalary / 12;
    let adjustedExpenses = expenseData.total;

    // Adjust expenses based on spending habits
    switch (spendingHabit) {
      case 'conservative':
        adjustedExpenses *= 0.85; // 15% less spending
        break;
      case 'liberal':
        adjustedExpenses *= 1.25; // 25% more spending
        break;
      default:
        // moderate - no adjustment
        break;
    }

    const monthlySavings = monthlyTakeHome - adjustedExpenses;
    const annualSavings = monthlySavings * 12;
    const savingsRate = monthlyTakeHome > 0 ? (monthlySavings / monthlyTakeHome) * 100 : 0;

    return {
      monthlyTakeHome,
      adjustedExpenses,
      monthlySavings,
      annualSavings,
      savingsRate
    };
  };

  const savings = calculateSavings();

  const chartData = [
    {
      name: 'Income',
      amount: savings.monthlyTakeHome,
      color: '#10B981'
    },
    {
      name: 'Expenses',
      amount: savings.adjustedExpenses,
      color: '#EF4444'
    },
    {
      name: 'Savings',
      amount: Math.max(0, savings.monthlySavings),
      color: '#3B82F6'
    }
  ];

  const projectionData = Array.from({ length: 12 }, (_, i) => ({
    month: `Month ${i + 1}`,
    savings: Math.max(0, savings.monthlySavings * (i + 1))
  }));

  const getSavingsStatus = () => {
    if (savings.savingsRate >= 20) {
      return { status: 'Excellent', color: 'bg-green-100 text-green-800', icon: '🎉' };
    } else if (savings.savingsRate >= 10) {
      return { status: 'Good', color: 'bg-blue-100 text-blue-800', icon: '👍' };
    } else if (savings.savingsRate >= 0) {
      return { status: 'Needs Improvement', color: 'bg-yellow-100 text-yellow-800', icon: '⚠️' };
    } else {
      return { status: 'Critical', color: 'bg-red-100 text-red-800', icon: '🚨' };
    }
  };

  const status = getSavingsStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5 text-green-600" />
          Savings Analysis
        </CardTitle>
        <CardDescription>
          Potential savings based on your income and spending habits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Spending Habits</Label>
          <Select value={spendingHabit} onValueChange={(value: SpendingHabit) => setSpendingHabit(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="conservative">Conservative (Save more, spend less)</SelectItem>
              <SelectItem value="moderate">Moderate (Balanced approach)</SelectItem>
              <SelectItem value="liberal">Liberal (Enjoy life, spend more)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {savings.monthlyTakeHome > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-green-600 font-medium">Monthly Take-Home</p>
                  <p className="text-xl font-bold text-green-700">
                    {formatAmount(savings.monthlyTakeHome)}{formatAmountSecondary(savings.monthlyTakeHome)}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-red-600 font-medium">Monthly Expenses</p>
                  <p className="text-xl font-bold text-red-700">
                    {formatAmount(savings.adjustedExpenses)}{formatAmountSecondary(savings.adjustedExpenses)}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-center">
                  <p className="text-sm text-blue-600 font-medium">Monthly Savings</p>
                  <p className="text-xl font-bold text-blue-700">
                    {formatAmount(Math.max(0, savings.monthlySavings))}{formatAmountSecondary(Math.max(0, savings.monthlySavings))}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium">Savings Rate</p>
                  <p className="text-2xl font-bold">{savings.savingsRate.toFixed(1)}%</p>
                </div>
              </div>
              <Badge className={status.color}>
                {status.icon} {status.status}
              </Badge>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium">Monthly Breakdown</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => `${currencySymbol}${formatNumber(value)}`} />
                    <Bar dataKey="amount" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {savings.monthlySavings > 0 && (
              <div className="space-y-4">
                <h4 className="font-medium">Savings Projection (12 months)</h4>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={projectionData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => `${currencySymbol}${formatNumber(value)}`} />
                      <Line type="monotone" dataKey="savings" stroke="#10B981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-center text-green-800">
                    <strong>Annual Savings Potential:</strong> {currencySymbol}{formatAmount(Math.max(0, savings.annualSavings))}{formatAmountSecondary(Math.max(0, savings.annualSavings))}
                  </p>
                </div>
              </div>
            )}

            {savings.monthlySavings < 0 && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-800 mb-2">Budget Deficit Warning</p>
                    <p className="text-sm text-red-700">
                      Your estimated expenses exceed your take-home income by {currencySymbol}{formatAmount(Math.abs(savings.monthlySavings))}{formatAmountSecondary(Math.abs(savings.monthlySavings))} per month. 
                      Consider reducing expenses or increasing income to achieve financial stability.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Recommendation:</strong> Aim for a savings rate of at least 20% for financial security. 
                Consider adjusting your spending habits or exploring additional income sources if your current rate is below 10%.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SavingsAnalysis;
