
import { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { MapPin, TrendingUp } from 'lucide-react';
import { SalaryData, ExpenseData } from '@/pages/Index';

interface LivingExpensesProps {
  salaryData: SalaryData;
  expenseData: ExpenseData;
  setExpenseData: (data: ExpenseData) => void;
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

const LivingExpenses: React.FC<LivingExpensesProps> = ({ salaryData, expenseData, setExpenseData }) => {
  const currencySymbol = currencySymbols[salaryData.currency] || salaryData.currency;

  const estimateExpenses = (country: string, city: string, grossSalary: number) => {
    // Simplified cost of living estimates based on country and salary
    let rentMultiplier = 0.30; // Base 30% of gross salary
    let utilitiesBase = 200;
    let foodBase = 400;
    let transportBase = 150;
    let healthcareBase = 300;
    let otherBase = 300;

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
      case 'Switzerland':
        rentMultiplier = 0.35;
        utilitiesBase = 400;
        foodBase = 800;
        transportBase = 300;
        healthcareBase = 500;
        break;
      case 'Singapore':
        rentMultiplier = 0.40;
        utilitiesBase = 250;
        foodBase = 500;
        transportBase = 100;
        break;
      case 'Germany':
        rentMultiplier = 0.25;
        utilitiesBase = 250;
        foodBase = 400;
        transportBase = 120;
        healthcareBase = 200;
        break;
    }

    const rent = grossSalary * rentMultiplier / 12; // Monthly rent
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

  useEffect(() => {
    if (salaryData.grossSalary > 0 && salaryData.country && salaryData.city) {
      const estimates = estimateExpenses(salaryData.country, salaryData.city, salaryData.grossSalary);
      setExpenseData(estimates);
    }
  }, [salaryData, setExpenseData]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(Math.round(num));
  };

  const updateExpense = (field: keyof ExpenseData, value: number) => {
    const updatedExpenses = { ...expenseData, [field]: value };
    updatedExpenses.total = updatedExpenses.rent + updatedExpenses.utilities + 
                           updatedExpenses.food + updatedExpenses.transport + 
                           updatedExpenses.healthcare + updatedExpenses.other;
    setExpenseData(updatedExpenses);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-orange-600" />
          Living Expenses
        </CardTitle>
        <CardDescription>
          Estimated monthly expenses for {salaryData.city}, {salaryData.country}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {expenseData.total > 0 && (
          <>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Rent/Housing</Label>
                  <span className="text-sm font-medium">{currencySymbol}{formatNumber(expenseData.rent)}</span>
                </div>
                <Slider
                  value={[expenseData.rent]}
                  onValueChange={(value) => updateExpense('rent', value[0])}
                  max={5000}
                  step={50}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Utilities</Label>
                  <span className="text-sm font-medium">{currencySymbol}{formatNumber(expenseData.utilities)}</span>
                </div>
                <Slider
                  value={[expenseData.utilities]}
                  onValueChange={(value) => updateExpense('utilities', value[0])}
                  max={500}
                  step={25}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Food & Groceries</Label>
                  <span className="text-sm font-medium">{currencySymbol}{formatNumber(expenseData.food)}</span>
                </div>
                <Slider
                  value={[expenseData.food]}
                  onValueChange={(value) => updateExpense('food', value[0])}
                  max={1000}
                  step={50}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Transportation</Label>
                  <span className="text-sm font-medium">{currencySymbol}{formatNumber(expenseData.transport)}</span>
                </div>
                <Slider
                  value={[expenseData.transport]}
                  onValueChange={(value) => updateExpense('transport', value[0])}
                  max={400}
                  step={25}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Healthcare</Label>
                  <span className="text-sm font-medium">{currencySymbol}{formatNumber(expenseData.healthcare)}</span>
                </div>
                <Slider
                  value={[expenseData.healthcare]}
                  onValueChange={(value) => updateExpense('healthcare', value[0])}
                  max={800}
                  step={25}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Other Expenses</Label>
                  <span className="text-sm font-medium">{currencySymbol}{formatNumber(expenseData.other)}</span>
                </div>
                <Slider
                  value={[expenseData.other]}
                  onValueChange={(value) => updateExpense('other', value[0])}
                  max={1000}
                  step={50}
                  className="w-full"
                />
              </div>
            </div>

            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-orange-600" />
                <span className="font-medium text-orange-800">Monthly Expenses Summary</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-orange-700">Total Monthly Expenses:</span>
                <span className="text-xl font-bold text-orange-600">
                  {currencySymbol}{formatNumber(expenseData.total)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> These are estimated averages. Adjust the sliders to match your actual or expected expenses.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default LivingExpenses;
