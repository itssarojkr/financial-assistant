import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PiggyBank, 
  Target,
  Info,
  AlertCircle
} from 'lucide-react';
import { LocationExpenseService } from '@/application/services/LocationExpenseService';
import { SpendingHabitResult, SpendingHabit } from '@/shared/types/expense.types';

interface EnhancedSavingsAnalysisProps {
  grossSalary: number;
  countryCode: string;
  stateCode?: string;
  cityCode?: string;
  currency: string;
}

export function EnhancedSavingsAnalysis({
  grossSalary,
  countryCode,
  stateCode,
  cityCode,
  currency
}: EnhancedSavingsAnalysisProps) {
  const [selectedHabit, setSelectedHabit] = useState<string>('moderate');
  const [locationExpenses, setLocationExpenses] = useState<any[]>([]);
  const [calculationResult, setCalculationResult] = useState<SpendingHabitResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locationExpenseService = LocationExpenseService.getInstance();
  const defaultHabits = locationExpenseService.getDefaultSpendingHabits();

  useEffect(() => {
    loadLocationExpenses();
  }, [countryCode, stateCode, cityCode]);

  useEffect(() => {
    if (locationExpenses.length > 0 && grossSalary > 0) {
      calculateSavings();
    }
  }, [locationExpenses, selectedHabit, grossSalary]);

  const loadLocationExpenses = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const expenses = await locationExpenseService.getLocationExpenses(
        countryCode,
        stateCode,
        cityCode
      );
      setLocationExpenses(expenses);
      console.log('Loaded location expenses:', expenses);
    } catch (err) {
      console.error('Error loading location expenses:', err);
      setError('Failed to load location expense data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateSavings = () => {
    if (locationExpenses.length === 0 || grossSalary <= 0) return;

    const habit = defaultHabits.find(h => h.type === selectedHabit);
    if (!habit) return;

    const result = locationExpenseService.calculateExpenses(
      locationExpenses,
      habit,
      grossSalary
    );
    
    setCalculationResult(result);
    console.log('Calculation result:', result);
  };

  const getHabitColor = (type: string) => {
    switch (type) {
      case 'conservative': return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'liberal': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatCurrency = (amount: number) => {
    return locationExpenseService.formatCurrency(amount, currency);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Savings Analysis</CardTitle>
          <CardDescription>Loading location expense data...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Savings Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Enhanced Savings Analysis
        </CardTitle>
        <CardDescription>
          Analyze your spending habits and potential savings based on your location
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Spending Habit Selection */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Select Spending Habit</label>
          <Select value={selectedHabit} onValueChange={setSelectedHabit}>
            <SelectTrigger>
              <SelectValue placeholder="Choose your spending habit" />
            </SelectTrigger>
            <SelectContent>
              {defaultHabits.map((habit) => (
                <SelectItem key={habit.type} value={habit.type}>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getHabitColor(habit.type)}>
                      {habit.name}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {habit.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results Display */}
        {calculationResult && (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="breakdown">Expense Breakdown</TabsTrigger>
              <TabsTrigger value="savings">Savings Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Monthly Expenses</span>
                    </div>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(calculationResult.expenses.total)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <PiggyBank className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">Monthly Savings</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-600">
                      {formatCurrency(calculationResult.monthly_savings)}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">Savings Rate</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">
                      {calculationResult.savings_rate.toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Based on {calculationResult.habit.name} spending habits in your location. 
                  This analysis uses real expense data for {countryCode}
                  {stateCode && `, ${stateCode}`}
                  {cityCode && `, ${cityCode}`}.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="breakdown" className="space-y-4">
              <div className="space-y-3">
                {calculationResult.expenses.breakdown.map((expense) => (
                  <div key={expense.type} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <div>
                        <p className="font-medium capitalize">{expense.type}</p>
                        <p className="text-sm text-muted-foreground">{expense.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(expense.adjusted_amount)}</p>
                      {expense.savings_potential > 0 && (
                        <p className="text-sm text-green-600">
                          Save {formatCurrency(expense.savings_potential)}
                        </p>
                      )}
                      {expense.savings_potential < 0 && (
                        <p className="text-sm text-red-600">
                          +{formatCurrency(Math.abs(expense.savings_potential))}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="savings" className="space-y-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Annual Savings Projection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {formatCurrency(calculationResult.annual_savings)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Potential annual savings with {calculationResult.habit.name} habits
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Savings Rate Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Current Savings Rate</span>
                      <span className="font-medium">{calculationResult.savings_rate.toFixed(1)}%</span>
                    </div>
                    <Progress value={calculationResult.savings_rate} className="w-full" />
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="text-center p-3 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Income</p>
                        <p className="font-bold text-green-600">{formatCurrency(grossSalary)}</p>
                      </div>
                      <div className="text-center p-3 border rounded-lg">
                        <p className="text-sm text-muted-foreground">Expenses</p>
                        <p className="font-bold text-red-600">{formatCurrency(calculationResult.expenses.total)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Savings Potential:</strong> You could save up to{' '}
                    {formatCurrency(calculationResult.expenses.savings_potential)} more per month 
                    by optimizing your flexible expenses.
                  </AlertDescription>
                </Alert>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
} 