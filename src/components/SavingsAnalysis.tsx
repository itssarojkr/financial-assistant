import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TrendingUp, Wallet, AlertTriangle, Info, Target, PiggyBank, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { SalaryData, TaxData, ExpenseData } from '@/shared/types/common.types';
import { convertCurrency } from '@/lib/utils';
import { useAuth } from '@/presentation/hooks/business/useAuth';
import { SpendingHabitService, SpendingHabit } from '@/application/services/SpendingHabitService';
import { LocationExpenseService } from '@/application/services/LocationExpenseService';
import { SpendingHabitResult } from '@/shared/types/expense.types';
import { Input } from '@/components/ui/input';

interface SavingsAnalysisProps {
  salaryData: SalaryData;
  taxData: TaxData;
  expenseData: ExpenseData;
  userCurrency?: string;
  countryCurrency?: string;
  onHabitChange?: (expenses: ExpenseData) => void;
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
  INR: '₹'
};

const SavingsAnalysis: React.FC<SavingsAnalysisProps> = ({ salaryData, taxData, expenseData, userCurrency, countryCurrency, onHabitChange }) => {
  const { user } = useAuth();
  const [spendingHabits, setSpendingHabits] = useState<SpendingHabit[]>([]);
  const [spendingHabitId, setSpendingHabitId] = useState<string | null>(null);
  const [spendingHabit, setSpendingHabit] = useState<'conservative' | 'moderate' | 'liberal' | 'custom'>('moderate');
  const [customName, setCustomName] = useState('');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [customized, setCustomized] = useState(false);
  const [loadingHabits, setLoadingHabits] = useState(false);
  const [expenseMultiplier, setExpenseMultiplier] = useState(1.0);
  const [enhancedAnalysis, setEnhancedAnalysis] = useState<SpendingHabitResult | null>(null);
  const [loadingEnhanced, setLoadingEnhanced] = useState(false);

  const locationExpenseService = LocationExpenseService.getInstance();

  // Load spending habits for user/country/state
  useEffect(() => {
    async function loadHabits() {
      console.log('=== SPENDING HABITS DEBUG ===');
      console.log('User:', user);
      console.log('Salary data:', salaryData);
      console.log('Country code:', salaryData.countryCode);
      console.log('State ID:', salaryData.stateId);
      
      if (!user) {
        console.log('No user found, skipping habit loading');
        return;
      }
      
      if (!salaryData.countryCode) {
        console.log('No country code found, skipping habit loading');
        return;
      }
      
      console.log('Loading habits for:', { userId: user.id, countryCode: salaryData.countryCode, stateId: salaryData.stateId });
      setLoadingHabits(true);
      try {
        const habits = await SpendingHabitService.getSpendingHabitsForDropdown(
          user.id,
          salaryData.countryCode,
          salaryData.stateId || null
        );
        console.log('Loaded habits:', habits);
        setSpendingHabits(habits);
        // Set default habit
        const defaultHabit = habits.find(h => h.habit_type === 'moderate');
        if (defaultHabit) {
          console.log('Setting default habit:', defaultHabit);
          setSpendingHabitId(defaultHabit.id);
          setSpendingHabit(defaultHabit.habit_type);
          setExpenseMultiplier(defaultHabit.expense_multiplier);
        } else {
          console.log('No moderate habit found in loaded habits');
        }
      } catch (error) {
        console.error('Error loading habits:', error);
      } finally {
        setLoadingHabits(false);
      }
    }
    loadHabits();
  }, [user, salaryData.countryCode, salaryData.stateId]);

  // Load enhanced analysis when location or salary changes
  useEffect(() => {
    async function loadEnhancedAnalysis() {
      if (!salaryData.countryCode || !salaryData.grossSalary) return;
      
      setLoadingEnhanced(true);
      try {
        const locationExpenses = await locationExpenseService.getLocationExpenses(
          salaryData.countryCode,
          salaryData.stateId,
          salaryData.cityId
        );
        
        if (locationExpenses.length > 0) {
          const defaultHabits = locationExpenseService.getDefaultSpendingHabits();
          const currentHabit = defaultHabits.find(h => h.type === spendingHabit) || defaultHabits[1]; // Default to moderate
          
          const result = locationExpenseService.calculateExpenses(
            locationExpenses,
            currentHabit,
            salaryData.grossSalary
          );
          
          setEnhancedAnalysis(result);
        }
      } catch (error) {
        console.error('Error loading enhanced analysis:', error);
      } finally {
        setLoadingEnhanced(false);
      }
    }
    
    loadEnhancedAnalysis();
  }, [salaryData.countryCode, salaryData.stateId, salaryData.cityId, salaryData.grossSalary, spendingHabit]);

  // When habit changes, update multiplier and populate expenses
  useEffect(() => {
    if (!spendingHabitId) return;
    const habit = spendingHabits.find(h => h.id === spendingHabitId);
    if (habit) {
      setSpendingHabit(habit.habit_type);
      setExpenseMultiplier(habit.expense_multiplier);
      setCustomized(false);
      
      // Calculate and populate expenses based on the selected habit
      if (salaryData.grossSalary && onHabitChange) {
        const baseExpenses = {
          rent: salaryData.grossSalary * 0.30, // 30% for housing
          food: salaryData.grossSalary * 0.15, // 15% for food
          transport: salaryData.grossSalary * 0.10, // 10% for transport
          utilities: salaryData.grossSalary * 0.08, // 8% for utilities
          healthcare: salaryData.grossSalary * 0.05, // 5% for healthcare
          entertainment: salaryData.grossSalary * 0.07, // 7% for entertainment
          other: salaryData.grossSalary * 0.05, // 5% for other
        };

        // Apply the habit multiplier
        const adjustedExpenses = {
          rent: baseExpenses.rent * habit.expense_multiplier,
          food: baseExpenses.food * habit.expense_multiplier,
          transport: baseExpenses.transport * habit.expense_multiplier,
          utilities: baseExpenses.utilities * habit.expense_multiplier,
          healthcare: baseExpenses.healthcare * habit.expense_multiplier,
          entertainment: baseExpenses.entertainment * habit.expense_multiplier,
          other: baseExpenses.other * habit.expense_multiplier,
        };

        // Calculate total
        const total = Object.values(adjustedExpenses).reduce((sum, value) => sum + value, 0);

        const newExpenses: ExpenseData = {
          ...adjustedExpenses,
          total,
          description: expenseData.description || ''
        };

        onHabitChange(newExpenses);
      }
    }
  }, [spendingHabitId, spendingHabits, salaryData.grossSalary, onHabitChange, expenseData.description]);

  // Save custom habit
  async function handleSaveCustomHabit() {
    if (!user || !customName.trim()) return;
    
    try {
      const newHabit = await SpendingHabitService.createSpendingHabit(user.id, {
        name: customName.trim(),
        country_code: salaryData.countryCode,
        state_code: salaryData.stateId || null,
        habit_type: 'custom',
        expense_multiplier: expenseMultiplier,
        description: `Custom spending habit created on ${new Date().toLocaleDateString()}`
      });

      // Reload habits to include the new one
      const habits = await SpendingHabitService.getSpendingHabitsForDropdown(
        user.id,
        salaryData.countryCode,
        salaryData.stateId || null
      );
      setSpendingHabits(habits);
      
      // Select the new habit
      setSpendingHabitId(newHabit.id);
      
      setShowSaveDialog(false);
      setCustomName('');
    } catch (error) {
      console.error('Error saving custom habit:', error);
    }
  }

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

    return monthlyTakeHome - adjustedExpenses;
  };

  const getSavingsStatus = () => {
    const savings = calculateSavings();
    const savingsRate = (savings / (taxData.takeHomeSalary / 12)) * 100;

    if (savingsRate >= 20) return { status: 'excellent', color: 'text-green-600', bgColor: 'bg-green-100' };
    if (savingsRate >= 10) return { status: 'good', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    if (savingsRate >= 5) return { status: 'fair', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { status: 'poor', color: 'text-red-600', bgColor: 'bg-red-100' };
  };

  const savings = calculateSavings();
  const savingsStatus = getSavingsStatus();
  const monthlyTakeHome = taxData.takeHomeSalary / 12;
  const savingsRate = (savings / monthlyTakeHome) * 100;

  const formatCurrency = (amount: number) => {
    return locationExpenseService.formatCurrency(amount, salaryData.currency);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Savings Analysis
          </div>
          {enhancedAnalysis && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Enhanced Analysis
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Enhanced Savings Analysis</DialogTitle>
                  <DialogDescription>
                    Detailed breakdown based on real location expense data
                  </DialogDescription>
                </DialogHeader>
                
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
                            {formatCurrency(enhancedAnalysis.expenses.total)}
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
                            {formatCurrency(enhancedAnalysis.monthly_savings)}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-purple-600" />
                            <span className="text-sm font-medium">Savings Rate</span>
                          </div>
                          <p className="text-2xl font-bold text-purple-600">
                            {enhancedAnalysis.savings_rate.toFixed(1)}%
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Based on {enhancedAnalysis.habit.name} spending habits in your location. 
                        This analysis uses real expense data for {salaryData.countryCode}
                        {salaryData.stateId && `, ${salaryData.stateId}`}
                        {salaryData.cityId && `, ${salaryData.cityId}`}.
                      </AlertDescription>
                    </Alert>
                  </TabsContent>

                  <TabsContent value="breakdown" className="space-y-4">
                    <div className="space-y-3">
                      {enhancedAnalysis.expenses.breakdown.map((expense) => (
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
                            {formatCurrency(enhancedAnalysis.annual_savings)}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Potential annual savings with {enhancedAnalysis.habit.name} habits
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
                            <span className="font-medium">{enhancedAnalysis.savings_rate.toFixed(1)}%</span>
                          </div>
                          <Progress value={enhancedAnalysis.savings_rate} className="w-full" />
                          
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="text-center p-3 border rounded-lg">
                              <p className="text-sm text-muted-foreground">Income</p>
                              <p className="font-bold text-green-600">{formatCurrency(salaryData.grossSalary)}</p>
                            </div>
                            <div className="text-center p-3 border rounded-lg">
                              <p className="text-sm text-muted-foreground">Expenses</p>
                              <p className="font-bold text-red-600">{formatCurrency(enhancedAnalysis.expenses.total)}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Alert>
                        <TrendingUp className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Savings Potential:</strong> You could save up to{' '}
                          {formatCurrency(enhancedAnalysis.expenses.savings_potential)} more per month 
                          by optimizing your flexible expenses.
                        </AlertDescription>
                      </Alert>
                    </div>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          )}
        </CardTitle>
        <CardDescription>
          Analyze your spending habits and potential savings
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Spending Habit Selection */}
        <div className="space-y-3">
          <Label htmlFor="spending-habit">Spending Habit</Label>
          <Select value={spendingHabitId || ''} onValueChange={setSpendingHabitId}>
            <SelectTrigger id="spending-habit" disabled={loadingHabits}>
              <SelectValue placeholder={loadingHabits ? "Loading habits..." : "Choose your spending habit"} />
            </SelectTrigger>
            <SelectContent>
              {spendingHabits.map((habit) => (
                <SelectItem key={habit.id} value={habit.id}>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={
                      habit.habit_type === 'conservative' ? 'bg-green-100 text-green-800 border-green-200' :
                      habit.habit_type === 'moderate' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                      habit.habit_type === 'liberal' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                      'bg-gray-100 text-gray-800 border-gray-200'
                    }>
                      {habit.name}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {habit.habit_type === 'custom' ? 'Custom habit' : `${(habit.expense_multiplier * 100).toFixed(0)}% of base expenses`}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Save Custom Habit Dialog */}
        {showSaveDialog && (
          <div className="space-y-3 p-4 border rounded-lg">
            <Label htmlFor="custom-name">Custom Habit Name</Label>
            <Input
              id="custom-name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Enter a name for your custom habit"
            />
            <div className="flex gap-2">
              <Button onClick={handleSaveCustomHabit} disabled={!customName.trim()}>
                Save Custom Habit
              </Button>
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Enhanced Analysis Status */}
        {loadingEnhanced && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Loading enhanced location-based analysis...
            </AlertDescription>
          </Alert>
        )}

        {/* Savings Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Monthly Take-Home</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {formatAmount(monthlyTakeHome)}
                {formatAmountSecondary(monthlyTakeHome)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium">Monthly Savings</span>
              </div>
              <p className="text-2xl font-bold text-green-600">
                {formatAmount(savings)}
                {formatAmountSecondary(savings)}
              </p>
              <div className={`mt-2 px-2 py-1 rounded-full text-xs ${savingsStatus.bgColor} ${savingsStatus.color}`}>
                {savingsStatus.status} savings rate ({savingsRate.toFixed(1)}%)
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Savings Chart */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Savings Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              {
                name: 'Take-Home',
                amount: monthlyTakeHome,
                fill: '#3b82f6'
              },
              {
                name: 'Expenses',
                amount: expenseData.total,
                fill: '#ef4444'
              },
              {
                name: 'Savings',
                amount: savings,
                fill: '#10b981'
              }
            ]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => [formatAmount(value), 'Amount']} />
              <Bar dataKey="amount" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Annual Projection */}
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Annual Savings Projection</h3>
              <p className="text-3xl font-bold text-green-600">
                {formatAmount(savings * 12)}
                {formatAmountSecondary(savings * 12)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Based on your current spending habits
              </p>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default SavingsAnalysis;
