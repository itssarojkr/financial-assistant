import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { MapPin, TrendingUp, Info, PieChart, BarChart3 } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { SalaryData, ExpenseData } from '@/pages/Index';
import { convertCurrency } from '@/lib/utils';
import { TooltipProps } from 'recharts';

interface LivingExpensesProps {
  salaryData: SalaryData;
  expenseData: ExpenseData;
  setExpenseData: (data: ExpenseData) => void;
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
  CHF: 'CHF',
  INR: '₹',
  CNY: '¥',
  AED: 'د.إ',
  SAR: '﷼'
};

// Detailed city expense data
const cityExpenseData: { [key: string]: { 
  rent: { min: number; avg: number; max: number; note: string; },
  utilities: { avg: number; note: string; },
  food: { avg: number; note: string; },
  transport: { avg: number; note: string; },
  healthcare: { avg: number; note: string; }
}} = {
  'San Francisco': {
    rent: { min: 2500, avg: 3500, max: 5000, note: '1-bedroom apartment in city center' },
    utilities: { avg: 300, note: 'Electricity, heating, cooling, water, garbage' },
    food: { avg: 600, note: 'Groceries and occasional dining out' },
    transport: { avg: 200, note: 'Public transport or car maintenance' },
    healthcare: { avg: 400, note: 'Health insurance and medical expenses' }
  },
  'New York City': {
    rent: { min: 2200, avg: 3200, max: 4800, note: '1-bedroom apartment in Manhattan' },
    utilities: { avg: 250, note: 'Basic utilities for apartment' },
    food: { avg: 550, note: 'Groceries and dining in NYC' },
    transport: { avg: 120, note: 'MetroCard and occasional taxi' },
    healthcare: { avg: 350, note: 'Health insurance premiums' }
  },
  'Mumbai': {
    rent: { min: 800, avg: 1500, max: 3000, note: '2BHK apartment in good locality' },
    utilities: { avg: 150, note: 'Electricity, water, gas, internet' },
    food: { avg: 300, note: 'Home cooking and occasional dining' },
    transport: { avg: 100, note: 'Local trains, bus, auto-rickshaw' },
    healthcare: { avg: 200, note: 'Health insurance and clinic visits' }
  },
  'Bangalore': {
    rent: { min: 600, avg: 1200, max: 2500, note: '2BHK apartment near IT hubs' },
    utilities: { avg: 120, note: 'Power backup, water, internet' },
    food: { avg: 250, note: 'Mix of home cooking and eating out' },
    transport: { avg: 150, note: 'Cab services, bus, metro' },
    healthcare: { avg: 180, note: 'Corporate health coverage supplement' }
  },
  'Dubai': {
    rent: { min: 1200, avg: 2000, max: 3500, note: '1-bedroom apartment in good area' },
    utilities: { avg: 200, note: 'DEWA bills, internet, cable' },
    food: { avg: 400, note: 'Groceries and dining options' },
    transport: { avg: 300, note: 'Car lease or taxi/metro' },
    healthcare: { avg: 250, note: 'Health insurance mandatory' }
  },
  'London': {
    rent: { min: 1500, avg: 2200, max: 3200, note: '1-bedroom flat in Zone 2-3' },
    utilities: { avg: 200, note: 'Gas, electricity, council tax' },
    food: { avg: 350, note: 'Groceries and pub meals' },
    transport: { avg: 180, note: 'Oyster card for tubes and buses' },
    healthcare: { avg: 50, note: 'NHS contributions and prescriptions' }
  },
  'Singapore': {
    rent: { min: 1800, avg: 2500, max: 3800, note: 'HDB or condo rental' },
    utilities: { avg: 150, note: 'PUB utilities and internet' },
    food: { avg: 400, note: 'Hawker centers and restaurants' },
    transport: { avg: 120, note: 'MRT and bus with EZ-Link' },
    healthcare: { avg: 200, note: 'Medisave and insurance' }
  },
  'Toronto': {
    rent: { min: 1400, avg: 2000, max: 2800, note: '1-bedroom apartment downtown' },
    utilities: { avg: 180, note: 'Hydro, gas, internet' },
    food: { avg: 400, note: 'Groceries and dining out' },
    transport: { avg: 150, note: 'TTC monthly pass' },
    healthcare: { avg: 100, note: 'OHIP plus private insurance' }
  }
};

const LivingExpenses: React.FC<LivingExpensesProps> = ({ salaryData, expenseData, setExpenseData, userCurrency, countryCurrency }) => {
  const currencySymbol = currencySymbols[salaryData.currency] || salaryData.currency;

  const showSecondaryCurrency = userCurrency && countryCurrency && userCurrency !== countryCurrency;
  const formatAmount = (amount: number) => `${countryCurrency || salaryData.currency}${amount.toLocaleString()}`;
  const formatAmountSecondary = (amount: number) => showSecondaryCurrency ? ` (${userCurrency}${convertCurrency(amount, countryCurrency!, userCurrency!).toLocaleString()})` : '';

  const getCityInsights = (city: string) => {
    // Check for exact matches first
    if (cityExpenseData[city]) {
      return cityExpenseData[city];
    }
    
    // Check for partial matches or similar cities
    const cityLower = city.toLowerCase();
    const matchedCity = Object.keys(cityExpenseData).find(key => 
      key.toLowerCase().includes(cityLower) || cityLower.includes(key.toLowerCase())
    );
    
    if (matchedCity) {
      return cityExpenseData[matchedCity];
    }
    
    return null;
  };

  const estimateExpenses = useCallback((country: string, city: string, grossSalary: number) => {
    const cityData = getCityInsights(city);
    
    if (cityData) {
      // Use city-specific data
      return {
        rent: cityData.rent.avg,
        utilities: cityData.utilities.avg,
        food: cityData.food.avg,
        transport: cityData.transport.avg,
        healthcare: cityData.healthcare.avg,
        other: 300,
        total: cityData.rent.avg + cityData.utilities.avg + cityData.food.avg + 
               cityData.transport.avg + cityData.healthcare.avg + 300
      };
    }

    // Fallback to country-based estimates
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
      case 'India':
        rentMultiplier = 0.25;
        utilitiesBase = 100;
        foodBase = 200;
        transportBase = 80;
        healthcareBase = 150;
        break;
      case 'United Arab Emirates':
        rentMultiplier = 0.35;
        utilitiesBase = 200;
        foodBase = 400;
        transportBase = 300;
        healthcareBase = 250;
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
  }, []);

  useEffect(() => {
    if (salaryData.grossSalary > 0 && salaryData.country && salaryData.city) {
      const estimates = estimateExpenses(salaryData.country, salaryData.city, salaryData.grossSalary);
      setExpenseData(estimates);
    }
  }, [salaryData, setExpenseData, estimateExpenses]);

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

  const cityInsights = getCityInsights(salaryData.city);

  // Prepare chart data
  const pieChartData = [
    { name: 'Rent', value: expenseData.rent, color: '#3B82F6' },
    { name: 'Utilities', value: expenseData.utilities, color: '#10B981' },
    { name: 'Food', value: expenseData.food, color: '#F59E0B' },
    { name: 'Transport', value: expenseData.transport, color: '#EF4444' },
    { name: 'Healthcare', value: expenseData.healthcare, color: '#8B5CF6' },
    { name: 'Other', value: expenseData.other, color: '#6B7280' }
  ].filter(item => item.value > 0);

  const barChartData = [
    { category: 'Rent', amount: expenseData.rent, color: '#3B82F6' },
    { category: 'Utilities', amount: expenseData.utilities, color: '#10B981' },
    { category: 'Food', amount: expenseData.food, color: '#F59E0B' },
    { category: 'Transport', amount: expenseData.transport, color: '#EF4444' },
    { category: 'Healthcare', amount: expenseData.healthcare, color: '#8B5CF6' },
    { category: 'Other', amount: expenseData.other, color: '#6B7280' }
  ];

  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length && payload[0]?.value !== undefined && expenseData.total) {
      const value = payload[0].value ?? 0;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-blue-600">{formatAmount(value)}{formatAmountSecondary(value)}</p>
          <p className="text-sm text-gray-600">
            {((value / expenseData.total) * 100).toFixed(1)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-orange-600" />
          Living Expenses
        </CardTitle>
        <CardDescription>
          Estimated monthly expenses for {salaryData.locality}, {salaryData.city}, {salaryData.country}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {cityInsights && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-800">City Insights: {salaryData.city}</span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-1 gap-2">
                <div className="flex justify-between">
                  <span className="text-blue-700">Rent Range:</span>
                  <span className="font-medium text-blue-800">
                    {formatAmount(cityInsights.rent.min)} - {formatAmount(cityInsights.rent.max)}
                  </span>
                </div>
                <p className="text-xs text-blue-600 italic">{cityInsights.rent.note}</p>
              </div>
            </div>
          </div>
        )}

        {expenseData.total > 0 && (
          <>
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <PieChart className="w-4 h-4" />
                    Expense Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <RechartsPieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                    {pieChartData.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Bar Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <BarChart3 className="w-4 h-4" />
                    Expense Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="category" 
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        fontSize={10}
                      />
                      <YAxis fontSize={10} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="amount" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Rent/Housing</Label>
                  <span className="text-sm font-medium">{formatAmount(expenseData.rent)}{formatAmountSecondary(expenseData.rent)}</span>
                </div>
                {cityInsights && (
                  <p className="text-xs text-gray-600 mb-1">{cityInsights.rent.note}</p>
                )}
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
                  <span className="text-sm font-medium">{formatAmount(expenseData.utilities)}{formatAmountSecondary(expenseData.utilities)}</span>
                </div>
                {cityInsights && (
                  <p className="text-xs text-gray-600 mb-1">{cityInsights.utilities.note}</p>
                )}
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
                  <span className="text-sm font-medium">{formatAmount(expenseData.food)}{formatAmountSecondary(expenseData.food)}</span>
                </div>
                {cityInsights && (
                  <p className="text-xs text-gray-600 mb-1">{cityInsights.food.note}</p>
                )}
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
                  <span className="text-sm font-medium">{formatAmount(expenseData.transport)}{formatAmountSecondary(expenseData.transport)}</span>
                </div>
                {cityInsights && (
                  <p className="text-xs text-gray-600 mb-1">{cityInsights.transport.note}</p>
                )}
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
                  <span className="text-sm font-medium">{formatAmount(expenseData.healthcare)}{formatAmountSecondary(expenseData.healthcare)}</span>
                </div>
                {cityInsights && (
                  <p className="text-xs text-gray-600 mb-1">{cityInsights.healthcare.note}</p>
                )}
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
                  <span className="text-sm font-medium">{formatAmount(expenseData.other)}{formatAmountSecondary(expenseData.other)}</span>
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
                  {formatAmount(expenseData.total)}{formatAmountSecondary(expenseData.total)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> {cityInsights ? 'Estimates are based on real data for this city.' : 'These are estimated averages based on country data.'} Adjust the sliders to match your actual or expected expenses.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default LivingExpenses;
