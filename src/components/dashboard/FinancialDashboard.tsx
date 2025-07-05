import React, { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { 
  DollarSign, 
  Target, 
  Bell, 
  BarChart3, 
  Plus,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  Calculator,
  Trash2,
  Star,
  Edit
} from 'lucide-react';
import { ExpenseList } from '@/components/expenses/ExpenseList';
import { BudgetList } from '@/components/budgets/BudgetList';
import { AlertList } from '@/components/alerts/AlertList';
import { ExpenseAnalytics } from '@/components/analytics/ExpenseAnalytics';
import { 
  ExpenseService, 
  BudgetService, 
  AlertService, 
  AnalyticsService,
  type Expense,
  type ExpenseCategory,
  type Budget,
  type BudgetProgress,
  type SpendingAlert,
  type SpendingInsights
} from '@/services';
import { UserDataService, type SavedData } from '@/services/userDataService';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Label } from '@/components/ui/label';

interface FinancialDashboardProps {
  userId: string;
}

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ userId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetProgress, setBudgetProgress] = useState<BudgetProgress[]>([]);
  const [alerts, setAlerts] = useState<SpendingAlert[]>([]);
  const [analytics, setAnalytics] = useState<SpendingInsights | null>(null);
  const [period, setPeriod] = useState('monthly');
  const [savedCalculations, setSavedCalculations] = useState<SavedData[]>([]);
  const [selectedCalculation, setSelectedCalculation] = useState<string>('');
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    isOpen: boolean;
    calculationId: string | null;
    calculationName: string;
  }>({
    isOpen: false,
    calculationId: null,
    calculationName: '',
  });
  const dataLoadedRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!dataLoadedRef.current && userId) {
      loadDashboardData();
    }
  }, [userId]);

  // Reset dataLoadedRef when userId changes
  useEffect(() => {
    dataLoadedRef.current = false;
  }, [userId]);

  const loadDashboardData = async () => {
    if (dataLoadedRef.current) return;
    
    setIsLoading(true);
    console.log('Loading dashboard data for user:', userId);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated');
        return;
      }
      
      console.log('User authenticated:', user.id);
      
      const [
        expensesData,
        categoriesData,
        budgetsData,
        budgetProgressData,
        alertsData,
        analyticsData,
        savedCalculationsData
      ] = await Promise.all([
        ExpenseService.getExpenses(userId).catch(err => {
          console.error('Error loading expenses:', err);
          return [];
        }),
        ExpenseService.getCategories().catch(err => {
          console.error('Error loading categories:', err);
          return [];
        }),
        BudgetService.getBudgets(userId).catch(err => {
          console.error('Error loading budgets:', err);
          return [];
        }),
        BudgetService.getBudgetProgress(userId).catch(err => {
          console.error('Error loading budget progress:', err);
          return [];
        }),
        AlertService.getAlerts(userId).catch(err => {
          console.error('Error loading alerts:', err);
          return [];
        }),
        AnalyticsService.getSpendingInsights(userId).catch(err => {
          console.error('Error loading analytics:', err);
          return null;
        }),
        UserDataService.getTaxCalculations(userId).catch(err => {
          console.error('Error loading saved calculations:', err);
          return { data: [], error: null };
        })
      ]);

      console.log('Data loaded:', {
        expenses: expensesData.length,
        categories: categoriesData.length,
        budgets: budgetsData.length,
        alerts: alertsData.length,
        analytics: analyticsData ? 'loaded' : 'null',
        savedCalculations: savedCalculationsData.data?.length || 0
      });

      setExpenses(expensesData);
      setCategories(categoriesData);
      setBudgets(budgetsData);
      setBudgetProgress(budgetProgressData);
      setAlerts(alertsData);
      setAnalytics(analyticsData);
      setSavedCalculations(savedCalculationsData.data || []);
      
      // Set the first calculation as selected by default
      if (savedCalculationsData.data && savedCalculationsData.data.length > 0) {
        setSelectedCalculation(savedCalculationsData.data[0].id);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
      dataLoadedRef.current = true;
    }
  };

  const handleDataUpdate = () => {
    loadDashboardData();
  };

  const handleRefresh = () => {
    setIsLoading(true);
    loadDashboardData();
  };

  const handleEditBudgetInCalculator = (budget: Budget) => {
    // Navigate to calculator with budget data for editing
    navigate('/calculator', { 
      state: { 
        editBudget: budget,
        startTab: 'basics' // Start from salary input page
      } 
    });
  };

  const handleDeleteCalculation = async (calculationId: string) => {
    const calculationToDelete = savedCalculations.find(calc => calc.id === calculationId);
    setSavedCalculations(prev => prev.filter(calc => calc.id !== calculationId));

    try {
      const { error } = await UserDataService.deleteSavedData(calculationId);
      if (error) {
        console.error('Error deleting calculation:', error);
        if (calculationToDelete) {
          setSavedCalculations(prev => [...prev, calculationToDelete]);
        }
      }
    } catch (error) {
      console.error('Error deleting calculation:', error);
      if (calculationToDelete) {
        setSavedCalculations(prev => [...prev, calculationToDelete]);
      }
    }
  };

  const confirmDeleteCalculation = (calculationId: string, calculationName: string) => {
    setDeleteConfirmDialog({
      isOpen: true,
      calculationId,
      calculationName,
    });
  };

  const executeDeleteCalculation = () => {
    if (deleteConfirmDialog.calculationId) {
      handleDeleteCalculation(deleteConfirmDialog.calculationId);
    }
    setDeleteConfirmDialog({ isOpen: false, calculationId: null, calculationName: '' });
  };

  const handleToggleFavorite = async (calculationId: string, isFavorite: boolean) => {
    setSavedCalculations(prev => 
      prev.map(calc => 
        calc.id === calculationId 
          ? { ...calc, is_favorite: !isFavorite }
          : calc
      )
    );

    try {
      const { error } = await UserDataService.updateFavoriteStatus(calculationId, !isFavorite);
      if (error) {
        console.error('Error updating favorite status:', error);
        setSavedCalculations(prev => 
          prev.map(calc => 
            calc.id === calculationId 
              ? { ...calc, is_favorite: isFavorite }
              : calc
          )
        );
      }
    } catch (error) {
      console.error('Error updating favorite status:', error);
      setSavedCalculations(prev => 
        prev.map(calc => 
          calc.id === calculationId 
            ? { ...calc, is_favorite: isFavorite }
            : calc
        )
      );
    }
  };

  const getTotalSpending = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const getOverBudgetCount = () => {
    return budgetProgress.filter(budget => budget.is_over_budget).length;
  };

  const getActiveAlertsCount = () => {
    return alerts.filter(alert => alert.active).length;
  };

  const getTriggeredAlertsCount = () => {
    return analytics?.alerts_summary.triggered_alerts || 0;
  };

  const getSelectedCalculationData = () => {
    return savedCalculations.find(calc => calc.id === selectedCalculation);
  };

  const getCurrencySymbol = () => {
    const calculation = getSelectedCalculationData();
    if (calculation) {
      const currency = calculation.data_content.currency || 'USD';
      const currencySymbols: { [key: string]: string } = {
        USD: '$', EUR: '€', GBP: '£', CAD: 'C$', AUD: 'A$', JPY: '¥', 
        SGD: 'S$', CHF: 'CHF', INR: '₹', CNY: '¥', AED: 'د.إ', SAR: '﷼'
      };
      return currencySymbols[currency] || currency;
    }
    return '$';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-end">
        <Button onClick={() => navigate('/calculator')} variant="outline">
          <Calculator className="w-4 h-4 mr-2" />
          New Calculation
        </Button>
        <Button onClick={handleRefresh} variant="outline" className="ml-3">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Calculation Selector */}
      {savedCalculations.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Label className="text-sm font-medium">Selected Calculation:</Label>
                <Select value={selectedCalculation} onValueChange={setSelectedCalculation}>
                  <SelectTrigger className="w-80">
                    <SelectValue placeholder="Select a calculation" />
                  </SelectTrigger>
                  <SelectContent>
                    {savedCalculations.map((calculation) => (
                      <SelectItem key={calculation.id} value={calculation.id}>
                        <div className="flex items-center gap-2">
                          {calculation.is_favorite && (
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          )}
                          <span>{calculation.data_name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/calculator')}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards - Single Line */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getCurrencySymbol()}{getTotalSpending().toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {expenses.length} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budgets</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgets.length}</div>
            <p className="text-xs text-muted-foreground">
              {getOverBudgetCount()} over budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{alerts.length}</div>
            <p className="text-xs text-muted-foreground">
              {getTriggeredAlertsCount()} triggered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Categories</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
            <p className="text-xs text-muted-foreground">
              Expense categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calculations</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{savedCalculations.length}</div>
            <p className="text-xs text-muted-foreground">
              {savedCalculations.filter(calc => calc.is_favorite).length} favorited
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {analytics && (
            <ExpenseAnalytics analytics={analytics} period={period} />
          )}
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          {expenses.length === 0 && categories.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Data Available</CardTitle>
                <CardDescription>
                  It looks like there's no expense data available. This could be because:
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                  <li>The database tables haven't been created yet</li>
                  <li>You're not authenticated</li>
                  <li>There's a connection issue</li>
                </ul>
                <div className="flex gap-2">
                  <Button onClick={handleRefresh} variant="outline">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <ExpenseList 
              expenses={expenses} 
              categories={categories} 
              onExpenseUpdate={handleDataUpdate}
              userId={userId}
            />
          )}
        </TabsContent>

        <TabsContent value="budgets" className="space-y-4">
          <BudgetList 
            budgets={budgets} 
            budgetProgress={budgetProgress}
            onBudgetUpdate={handleDataUpdate}
            onEditInCalculator={handleEditBudgetInCalculator}
            userId={userId}
          />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <AlertList 
            alerts={alerts} 
            onAlertUpdate={handleDataUpdate}
            userId={userId}
          />
        </TabsContent>
      </Tabs>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmDialog.isOpen}
        onClose={() => setDeleteConfirmDialog({ isOpen: false, calculationId: null, calculationName: '' })}
        onConfirm={executeDeleteCalculation}
        title="Delete Calculation"
        description={`Are you sure you want to delete "${deleteConfirmDialog.calculationName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}; 