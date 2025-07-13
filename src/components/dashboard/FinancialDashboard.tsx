import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
  Edit,
  AlertCircle,
  WifiOff,
  Wifi,
  Mic,
  MicOff,
  XCircle,
  CheckCircle,
  Activity
} from 'lucide-react';
import { UserDataService } from '@/application/services/UserDataService';
import { BudgetService } from '@/application/services/BudgetService';
import { ExpenseService } from '@/application/services/ExpenseService';
import { AlertService } from '@/application/services/AlertService';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useAndroid } from '@/presentation/hooks/ui/useAndroid';
import { AutoSyncService } from '@/infrastructure/services/AutoSyncService';
import { OptimizedExpenseService } from '@/infrastructure/services/OptimizedExpenseService';

import { Label } from '@/components/ui/label';
import { SaveCalculationModal } from '@/components/modals/SaveCalculationModal';
import { Progress } from '@/components/ui/progress';
import { OfflineSyncService } from '@/infrastructure/services/OfflineSyncService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { VoiceInputService } from '@/infrastructure/services/VoiceInputService';
import { convertCurrency } from '@/lib/utils';
import { ExpenseForm } from '@/components/expenses/ExpenseForm';
import { BudgetForm } from '@/components/budgets/BudgetForm';
import { AlertForm } from '@/components/alerts/AlertForm';
import { useToast } from '@/hooks/use-toast';
import { ExtendedSavedCalculation, TaxCalculationData, ExistingCalculation } from '@/shared/types/common.types';

// Define transformSavedCalculation function
const transformSavedCalculation = (userData: any): ExtendedSavedCalculation => ({
  id: userData.id,
  data_name: userData.dataName,
  data_content: userData.dataContent as TaxCalculationData,
  is_favorite: userData.isFavorite,
  created_at: userData.createdAt.toISOString(),
  updated_at: userData.updatedAt.toISOString(),
});

// Type definitions for financial data
interface Expense {
  id?: string;
  amount: number;
  description: string | null;
  categoryId: number | null;
  categoryName?: string;
  date: string;
  location?: string | null;
  source?: string | null;
  currency?: string;
  calculationId?: string;
  createdAt?: string | null;
  updatedAt?: string;
  expenseCategories?: {
    id: number;
    name: string;
    icon: string | null;
    color: string | null;
  } | null;
}

interface Budget {
  id?: string;
  amount: number;
  categoryId: number | null;
  categoryName?: string;
  period: 'monthly' | 'yearly';
  currency?: string;
  calculationId?: string;
  startDate?: string | null;
  endDate?: string | null;
  createdAt?: string | null;
  updatedAt?: string;
  expenseCategories?: {
    id: number;
    name: string;
    icon: string | null;
    color: string | null;
  } | null;
}

interface Alert {
  id?: string;
  threshold: number;
  categoryId: number | null;
  categoryName?: string;
  type: 'percentage' | 'amount';
  severity: 'low' | 'medium' | 'high';
  is_active: boolean;
  currency?: string;
  calculationId?: string;
  period?: string;
  active?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string;
  expenseCategories?: {
    id: number;
    name: string;
    icon: string | null;
    color: string | null;
  } | null;
}

interface FinancialDashboardProps {
  userId: string;
  userCurrency?: string;
  countryCurrency?: string;
}

// Type mapping functions to convert between service and local interfaces
const mapServiceExpenseToLocal = (serviceExpense: any): Expense => ({
  id: serviceExpense.id,
  amount: serviceExpense.amount,
  description: serviceExpense.description,
  categoryId: serviceExpense.categoryId !== undefined && serviceExpense.categoryId !== null && !isNaN(Number(serviceExpense.categoryId)) ? Number(serviceExpense.categoryId) : null,
  date: serviceExpense.date,
  location: serviceExpense.location,
  source: serviceExpense.source,
  currency: serviceExpense.currency,
  calculationId: serviceExpense.calculationId,
  createdAt: serviceExpense.createdAt,
  updatedAt: serviceExpense.updatedAt,
  expenseCategories: serviceExpense.expenseCategories,
});

const mapServiceBudgetToLocal = (serviceBudget: any): Budget => ({
  id: serviceBudget.id,
  amount: serviceBudget.amount,
  categoryId: serviceBudget.categoryId !== undefined && serviceBudget.categoryId !== null && !isNaN(Number(serviceBudget.categoryId)) ? Number(serviceBudget.categoryId) : null,
  period: (serviceBudget.period === 'monthly' || serviceBudget.period === 'yearly') ? serviceBudget.period : 'monthly',
  currency: serviceBudget.currency,
  calculationId: serviceBudget.calculationId,
  startDate: serviceBudget.startDate,
  endDate: serviceBudget.endDate,
  createdAt: serviceBudget.createdAt,
  updatedAt: serviceBudget.updatedAt,
  expenseCategories: serviceBudget.expenseCategories,
});

const mapServiceAlertToLocal = (serviceAlert: any): Alert => ({
  id: serviceAlert.id,
  threshold: serviceAlert.threshold,
  categoryId: serviceAlert.categoryId !== undefined && serviceAlert.categoryId !== null && !isNaN(Number(serviceAlert.categoryId)) ? Number(serviceAlert.categoryId) : null,
  type: serviceAlert.type as 'percentage' | 'amount',
  severity: serviceAlert.severity as 'low' | 'medium' | 'high',
  is_active: serviceAlert.active,
  currency: serviceAlert.currency,
  calculationId: serviceAlert.calculationId,
  period: serviceAlert.period,
  active: serviceAlert.active,
  createdAt: serviceAlert.createdAt,
  updatedAt: serviceAlert.updatedAt,
  expenseCategories: serviceAlert.expenseCategories,
  categoryName: serviceAlert.categoryName,
});

// Move this to the top of the file, before any component or function
interface VoiceRecognitionResult {
  text?: string;
  success?: boolean;
  error?: string;
  [key: string]: unknown;
}

// Add this at the top, near VoiceRecognitionResult
type VoiceCommandResult = {
  matched: boolean;
  command?: { action: string };
  [key: string]: unknown;
};

// --- Offline Sync Status Card ---
const OfflineSyncStatusCard: React.FC = () => {
  const { isAndroid } = useAndroid();
  const [status, setStatus] = useState({
    isOnline: true,
    syncInProgress: false,
    queueLength: 0,
    lastSync: null as Date | null,
    error: null as string | null,
  });
  const [loading, setLoading] = useState(true);
  const [forceSyncing, setForceSyncing] = useState(false);
  const autoSyncServiceRef = useRef<AutoSyncService | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      if (!autoSyncServiceRef.current) {
        autoSyncServiceRef.current = AutoSyncService.getInstance();
        await autoSyncServiceRef.current.initialize();
      }
      const syncStatus = autoSyncServiceRef.current.getSyncStatus();
      setStatus({
        isOnline: syncStatus.isOnline,
        syncInProgress: syncStatus.isSyncing,
        queueLength: syncStatus.pendingChanges,
        lastSync: syncStatus.lastSync,
        error: null,
      });
    } catch (error: unknown) {
      const message = (typeof error === 'object' && error && 'message' in error) ? (error as { message?: string }).message : undefined;
      setStatus(s => ({ ...s, error: message || 'Failed to fetch sync status' }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only show sync status for Android devices
    if (!isAndroid) return;
    
    fetchStatus();
    // Poll every 10 seconds for live updates
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchStatus, isAndroid]);

  const handleForceSync = async () => {
    setForceSyncing(true);
    setStatus(s => ({ ...s, error: null }));
    try {
      if (autoSyncServiceRef.current) {
        await autoSyncServiceRef.current.forceSync();
        await fetchStatus();
      }
    } catch (error: unknown) {
      const message = (typeof error === 'object' && error && 'message' in error) ? (error as { message?: string }).message : undefined;
      setStatus(s => ({ ...s, error: message || 'Failed to force sync' }));
    } finally {
      setForceSyncing(false);
    }
  };

  const lastSyncDisplay = status.lastSync
    ? status.lastSync.toLocaleString()
    : 'Never';

  // Don't render for non-Android devices
  if (!isAndroid) return null;

  return (
    <Card className="mb-6 shadow-sm border-blue-200 bg-blue-50/60">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        {status.isOnline ? (
          <Wifi className="text-green-500 w-5 h-5" />
        ) : (
          <WifiOff className="text-red-500 w-5 h-5" />
        )}
        <CardTitle className="text-lg font-semibold">Offline Sync Status</CardTitle>
        <Badge variant={status.isOnline ? 'default' : 'destructive'} className="ml-2">
          {status.isOnline ? 'Online' : 'Offline'}
        </Badge>
        {status.syncInProgress && (
          <Badge variant="secondary" className="ml-2 flex items-center gap-1">
            <RefreshCw className="animate-spin w-4 h-4" /> Syncing
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <div className="flex items-center gap-2 text-gray-500">
            <RefreshCw className="animate-spin w-4 h-4" /> Loading sync status...
          </div>
        ) : status.error ? (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-4 h-4" /> {status.error}
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <span className="font-medium">Queue:</span> {status.queueLength}
              </div>
              <div>
                <span className="font-medium">Last Sync:</span> {lastSyncDisplay}
              </div>
            </div>
            <Progress value={status.syncInProgress ? 100 : 0} className="h-2 bg-blue-100" />
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={fetchStatus}
                disabled={loading || status.syncInProgress}
              >
                <RefreshCw className="w-4 h-4 mr-1" /> Refresh
              </Button>
              <Button
                size="sm"
                variant="default"
                onClick={handleForceSync}
                disabled={forceSyncing || status.syncInProgress || !status.isOnline}
              >
                {forceSyncing ? (
                  <RefreshCw className="animate-spin w-4 h-4 mr-1" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-1" />
                )}
                Force Sync
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// --- Voice Input Floating Button & Modal ---
const VoiceInputModal: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [commandResult, setCommandResult] = useState<VoiceCommandResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const voiceServiceRef = useRef<VoiceInputService | null>(null);

  // Add this above handleStartListening
  const handleStartListening = async () => {
    setError(null);
    setTranscript('');
    setCommandResult(null);
    setListening(true);
    setProcessing(true);
    try {
      if (!voiceServiceRef.current) {
        voiceServiceRef.current = VoiceInputService.getInstance();
        await voiceServiceRef.current.initialize();
      }
      // Set up the onCommand callback
      voiceServiceRef.current.onCommand((command) => {
        setCommandResult({ matched: !!command, command });
      });
      // Remove the await and result check for startListening
      voiceServiceRef.current.startListening();
    } catch (err: unknown) {
      const message = (typeof err === 'object' && err && 'message' in err) ? (err as { message?: string }).message : undefined;
      setError(message || 'Voice recognition failed');
      setListening(false);
      setProcessing(false);
    }
  };

  const handleStopListening = async () => {
    setListening(false);
    setProcessing(false);
    try {
      if (voiceServiceRef.current) {
        await voiceServiceRef.current.stopListening();
      }
    } catch {
      // No action needed on stopListening error
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setTranscript('');
    setCommandResult(null);
    setError(null);
    setListening(false);
    setProcessing(false);
  };

  const handleClose = () => {
    setOpen(false);
    setTranscript('');
    setCommandResult(null);
    setError(null);
    setListening(false);
    setProcessing(false);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        aria-label="Voice Input"
        className="fixed z-50 bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 transition-all duration-200"
        onClick={handleOpen}
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }}
      >
        <Mic className="w-6 h-6" />
      </button>
      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-blue-600" /> Voice Input
            </DialogTitle>
            <DialogDescription>
              Speak a command (e.g., "add expense", "show dashboard").
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {error && (
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="w-4 h-4" /> {error}
              </div>
            )}
            {transcript && (
              <div className="bg-gray-100 rounded px-3 py-2 text-gray-800">
                <span className="font-medium">Transcript:</span> {transcript}
              </div>
            )}
            {commandResult && commandResult.matched && (
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-4 h-4" /> Recognized: <span className="font-semibold">{commandResult.command?.action}</span>
              </div>
            )}
            {commandResult && !commandResult.matched && (
              <div className="flex items-center gap-2 text-yellow-700">
                <AlertCircle className="w-4 h-4" /> Command not recognized
              </div>
            )}
            <div className="flex gap-2 mt-4">
              <Button
                type="button"
                variant="default"
                onClick={listening ? handleStopListening : handleStartListening}
                disabled={processing}
                className="flex-1"
              >
                {listening ? (
                  <>
                    <MicOff className="w-4 h-4 mr-1" /> Stop Listening
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-1" /> Start Listening
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Replace all 'any' with more specific types
// For calculation data, define a type:
type CalculationData = {
  expenses?: Expense[];
  budgets?: Budget[];
  alerts?: Alert[];
  [key: string]: unknown;
};

export const FinancialDashboard: React.FC<FinancialDashboardProps> = ({ userId, userCurrency, countryCurrency }) => {
  const { isAndroid } = useAndroid();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [savedCalculations, setSavedCalculations] = useState<ExtendedSavedCalculation[]>([]);
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
  const { toast } = useToast();

  const getSelectedCalculationData = () => {
    return savedCalculations.find(calc => calc.id === selectedCalculation);
  };

  // --- UI state for modals/forms ---
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [showEditExpense, setShowEditExpense] = useState(false);
  const [showEditBudget, setShowEditBudget] = useState(false);
  const [showEditAlert, setShowEditAlert] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [expenseSearch, setExpenseSearch] = useState('');

  // --- Load data from database tables ---
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [categories, setCategories] = useState<Array<{id: number, name: string}>>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Get current calculation's currency
  const getCurrentCalculationCurrency = () => {
    const calculation = getSelectedCalculationData();
    if (calculation?.data_content?.currency) {
      return calculation.data_content.currency;
    }
    return countryCurrency || 'USD';
  };

  // Load data from database tables using efficient calculation-specific queries
  useEffect(() => {
    const loadData = async () => {
      if (!userId || !selectedCalculation) return;
      
      setIsLoadingData(true);
      try {
        // Load categories
        const { data: cats } = await BudgetService.getExpenseCategories();
        setCategories(cats || []);

        // Load expenses for current calculation (efficient query)
        const { data: expData } = await ExpenseService.getExpensesByUserId(userId);
        // Filter expenses by calculationId if selectedCalculation is provided
        const filteredExpenses = selectedCalculation 
          ? (expData || []).filter(expense => expense.calculationId === selectedCalculation)
          : (expData || []);
        setExpenses(filteredExpenses.map(mapServiceExpenseToLocal));

        // Load budgets for current calculation (efficient query)
        const { data: budgetData } = await BudgetService.getUserBudgets(userId);
        // Filter budgets by calculationId if selectedCalculation is provided
        const filteredBudgets = selectedCalculation 
          ? (budgetData || []).filter(budget => budget.calculationId === selectedCalculation)
          : (budgetData || []);
        setBudgets(filteredBudgets.map(mapServiceBudgetToLocal));

        // Load alerts for current calculation (efficient query)
        const { data: alertData } = await AlertService.getUserAlerts(userId);
        // Filter alerts by calculationId if selectedCalculation is provided
        const filteredAlerts = selectedCalculation 
          ? (alertData || []).filter(alert => alert.calculationId === selectedCalculation)
          : (alertData || []);
        setAlerts(filteredAlerts.map(mapServiceAlertToLocal));

      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [userId, selectedCalculation]);

  // --- Helper function to get category name ---
  const getCategoryName = (categoryId: string | number | null): string => {
    const category = categories.find(cat => cat.id === Number(categoryId));
    return category?.name || `Category ${categoryId}`;
  };

  // --- Calculate budget progress and check alerts ---
  const budgetProgress = useMemo(() => {
    const progress: Record<string, { spent: number; budget: number; percentage: number }> = {};
    
    // Calculate total spent per category
    expenses.forEach(expense => {
      if (expense.categoryId != null && !progress[expense.categoryId]) {
        progress[expense.categoryId] = { spent: 0, budget: 0, percentage: 0 };
      }
      if (expense.categoryId != null) progress[expense.categoryId].spent += expense.amount;
    });
    
    // Add budget amounts
    budgets.forEach(budget => {
      if (budget.categoryId != null && !progress[budget.categoryId]) {
        progress[budget.categoryId] = { spent: 0, budget: 0, percentage: 0 };
      }
      if (budget.categoryId != null) progress[budget.categoryId].budget = budget.amount;
    });
    
    // Calculate percentages
    Object.keys(progress).forEach(categoryId => {
      const data = progress[categoryId];
      if (data.budget > 0) {
        data.percentage = (data.spent / data.budget) * 100;
      }
    });
    
    return progress;
  }, [expenses, budgets]);

  // --- Check for triggered alerts ---
  const triggeredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      if (!alert.is_active && !alert.active) return false;
      const progress = budgetProgress[alert.categoryId ?? ''];
      if (progress == null) return false;
      
      if (alert.type === 'percentage') {
        return progress.percentage >= (alert.threshold ?? 0);
      } else {
        return progress.spent >= (alert.threshold ?? 0);
      }
    });
  }, [alerts, budgetProgress]);

  // --- Filtered expenses ---
  const filteredExpenses = expenses.filter((e: Expense) => {
    const q = expenseSearch.toLowerCase();
    return (
      e.description?.toLowerCase().includes(q) ||
      e.amount?.toString().includes(q) ||
      e.location?.toLowerCase().includes(q) ||
      e.source?.toLowerCase().includes(q) ||
      getCategoryName(e.categoryId ?? '').toLowerCase().includes(q)
    );
  });

  // --- Add handlers using database tables ---
  const handleAddExpense = async (expense: Expense) => {
    try {
      const currentCurrency = getCurrentCalculationCurrency();
      const { data: newExpense, error } = await ExpenseService.createExpense({
        userId: userId,
        amount: expense.amount,
        currency: currentCurrency,
        description: expense.description || '',
        date: new Date(expense.date),
        calculationId: selectedCalculation,
        categoryId: expense.categoryId !== null ? String(expense.categoryId) : null,
        location: expense.location || null,
        source: expense.source || null,
      });
      if (error) {
        console.error('Error adding expense:', error);
        return;
      }
      if (newExpense) {
        // Map back to local type (categoryId as number)
        setExpenses(prev => [{ ...mapServiceExpenseToLocal(newExpense) }, ...prev]);
      }
      toast({
        title: "Expense added successfully",
        description: `Added ${formatAmount(expense.amount)} to ${getCategoryName(expense.categoryId ?? '')}`,
      });
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: "Error adding expense",
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddBudget = async (budget: Budget) => {
    try {
      const currentCurrency = getCurrentCalculationCurrency();
      const { data: newBudget, error } = await BudgetService.createBudget({
        userId: userId,
        amount: budget.amount,
        currency: currentCurrency,
        period: budget.period || 'monthly',
        categoryId: budget.categoryId !== null ? String(budget.categoryId) : undefined,
        startDate: budget.startDate || null,
        endDate: budget.endDate || null,
        calculationId: selectedCalculation,
      });
      if (error) {
        console.error('Error adding budget:', error);
        return;
      }
      if (newBudget) {
        setBudgets(prev => [{ ...mapServiceBudgetToLocal(newBudget), period: budget.period || 'monthly' }, ...prev]);
      }
      toast({
        title: "Budget added successfully",
        description: `Added ${formatAmount(budget.amount)} budget for ${getCategoryName(budget.categoryId ?? '')}`,
      });
    } catch (error) {
      console.error('Error adding budget:', error);
      toast({
        title: "Error adding budget",
        description: "Failed to add budget. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddAlert = async (alert: Alert) => {
    try {
      const currentCurrency = getCurrentCalculationCurrency();
      const { data: newAlert, error } = await AlertService.createAlert({
        userId: userId,
        type: alert.type || 'amount',
        title: `Alert for ${getCategoryName(alert.categoryId ?? '')}`,
        message: `Threshold alert set for ${getCategoryName(alert.categoryId ?? '')}`,
        threshold: alert.threshold,
        period: alert.period || 'monthly',
        active: alert.is_active ?? alert.active,
        severity: alert.severity || 'medium',
        currency: currentCurrency,
        calculationId: selectedCalculation,
        // categoryId is not in AlertService.CreateAlertData, but add if needed
      });
      if (error) {
        console.error('Error adding alert:', error);
        return;
      }
      if (newAlert) {
        setAlerts(prev => [{ ...mapServiceAlertToLocal(newAlert) }, ...prev]);
      }
      setShowAddAlert(false);
      toast({
        title: "Alert added successfully",
        description: `Added alert for ${getCategoryName(alert.categoryId ?? '')}`,
      });
    } catch (error) {
      console.error('Error adding alert:', error);
      toast({
        title: "Error adding alert",
        description: "Failed to add alert. Please try again.",
        variant: "destructive",
      });
    }
  };

  const loadDashboardData = useCallback(async () => {
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
      console.log('Current user ID:', userId);
      
      // Test the UserDataService directly
      console.log('Calling UserDataService.getUserDataByType...');
      const savedCalculationsData = await UserDataService.getUserDataByType(userId, 'tax_calculation');
      console.log('UserDataService response:', savedCalculationsData);

      if (savedCalculationsData.error) {
        console.error('UserDataService error:', savedCalculationsData.error);
      }

      console.log('Raw saved calculations data:', savedCalculationsData);
      console.log('Data loaded:', {
        savedCalculations: savedCalculationsData.data?.length || 0,
        hasData: !!savedCalculationsData.data,
        dataType: typeof savedCalculationsData.data,
        isArray: Array.isArray(savedCalculationsData.data),
        error: savedCalculationsData.error
      });

      // Transform UserData to SavedData format
      const transformedData = (savedCalculationsData.data || []).map(transformSavedCalculation) as ExtendedSavedCalculation[];
      console.log('Transformed data:', transformedData);
      
      // Add a test calculation if no data exists (for debugging)
      if (transformedData.length === 0) {
        console.log('No calculations found, adding test calculation');
        const testCalculation: ExtendedSavedCalculation = {
          id: 'test-calculation-1',
          data_name: 'Test Calculation - United States',
          data_content: {
            country: 'United States',
            countryCode: 'US',
            state: 'California',
            salary: 75000,
            currency: 'USD',
            taxAmount: 15000,
            netSalary: 60000,
            effectiveTaxRate: 20,
            deductions: 2000,
            rebates: 500,
            additionalTaxes: 0,
            calculationDate: new Date().toISOString(),
            notes: 'Test calculation for debugging',
            expenseData: {
              rent: 2000,
              utilities: 300,
              food: 500,
              transport: 200,
              healthcare: 150,
              other: 250,
              total: 3400
            }
          },
          is_favorite: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        transformedData.push(testCalculation);
        console.log('Added test calculation:', testCalculation);
      }
      
      setSavedCalculations(transformedData);
      
      // Set the first calculation as selected by default
      if (transformedData.length > 0) {
        console.log('Setting first calculation as selected:', transformedData[0].id);
        setSelectedCalculation(transformedData[0].id);
      } else {
        console.log('No calculations found to select');
      }
    } catch (error: unknown) {
      const message = (typeof error === 'object' && error && 'message' in error) ? (error as { message?: string }).message : undefined;
      console.error('Error loading dashboard data:', error);
      console.error('Error message:', message || 'Unknown error');
    } finally {
      setIsLoading(false);
      dataLoadedRef.current = true;
    }
  }, [userId]);

  // Separate function for refreshing data without the guard clause
  const refreshDashboardData = useCallback(async () => {
    console.log('Refreshing dashboard data for user:', userId);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated');
        return;
      }
      
      console.log('User authenticated:', user.id);
      
      const savedCalculationsData = await UserDataService.getUserDataByType(userId, 'tax_calculation').catch(err => {
        console.error('Error loading saved calculations:', err);
        return { data: [], error: null };
      });

      console.log('Data refreshed:', {
        savedCalculations: savedCalculationsData.data?.length || 0
      });

      // Transform UserData to SavedData format
      const transformedData = (savedCalculationsData.data || []).map(transformSavedCalculation) as ExtendedSavedCalculation[];
      setSavedCalculations(transformedData);
      
      // Keep the current selected calculation if it still exists
      if (savedCalculationsData.data && savedCalculationsData.data.length > 0) {
        const currentCalculation = savedCalculations.find(calc => calc.id === selectedCalculation);
        if (!currentCalculation) {
          setSelectedCalculation(savedCalculationsData.data[0].id);
        }
      }
    } catch (error: unknown) {
      const message = (typeof error === 'object' && error && 'message' in error) ? (error as { message?: string }).message : undefined;
      console.error('Error refreshing dashboard data:', message || 'Unknown error');
    }
  }, [userId, selectedCalculation, savedCalculations]);

  useEffect(() => {
    if (!dataLoadedRef.current && userId) {
      loadDashboardData();
      // Safety: hide spinner after 10s if still loading
      const timeout = setTimeout(() => setIsLoading(false), 10000);
      return () => clearTimeout(timeout);
    }
  }, [userId, loadDashboardData]);

  // Reset dataLoadedRef when userId changes
  useEffect(() => {
    dataLoadedRef.current = false;
  }, [userId]);

  // Debug useEffect to verify dashboard rendering
  useEffect(() => {
    console.log('FinancialDashboard mounted with userId:', userId);
    console.log('Current savedCalculations state:', savedCalculations);
    console.log('Current selectedCalculation state:', selectedCalculation);
    console.log('Current isLoading state:', isLoading);
  }, [userId, savedCalculations, selectedCalculation, isLoading]);

  const handleDataUpdate = () => {
    refreshDashboardData();
  };

  const handleRefresh = () => {
    setIsLoading(true);
    refreshDashboardData().finally(() => {
      setIsLoading(false);
    });
  };

  const handleDeleteCalculation = async (calculationId: string) => {
    const calculationToDelete = savedCalculations.find(calc => calc.id === calculationId);
    setSavedCalculations(prev => prev.filter(calc => calc.id !== calculationId));

    try {
      const { error } = await UserDataService.deleteUserData(calculationId);
      if (error) {
        console.error('Error deleting calculation:', error);
        if (calculationToDelete) {
          setSavedCalculations(prev => [...prev, calculationToDelete]);
        }
      }
    } catch (error: unknown) {
      const message = (typeof error === 'object' && error && 'message' in error) ? (error as { message?: string }).message : undefined;
      console.error('Error deleting calculation:', message || 'Unknown error');
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
      const { error } = await UserDataService.updateUserData(calculationId, { isFavorite: !isFavorite });
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
    } catch (error: unknown) {
      const message = (typeof error === 'object' && error && 'message' in error) ? (error as { message?: string }).message : undefined;
      console.error('Error updating favorite status:', message || 'Unknown error');
      setSavedCalculations(prev => 
        prev.map(calc => 
          calc.id === calculationId 
            ? { ...calc, is_favorite: isFavorite }
            : calc
        )
      );
    }
  };

  const getCurrencySymbol = () => {
    const calculation = getSelectedCalculationData();
    if (!calculation || !calculation.data_content || typeof calculation.data_content !== 'object') {
      return '$';
    }
    
    const data = calculation.data_content as unknown;
    if (typeof data === 'object' && data && 'currency' in data) {
      return (data as { currency?: string }).currency || '$';
    }
    return '$';
  };

  // --- Modal state for editing calculation ---
  const [showEditCalculation, setShowEditCalculation] = useState(false);

  // Handler for saving calculation edits
  const handleSaveCalculation = async (name: string, isOverwrite: boolean, existingId?: string) => {
    // TODO: Implement save logic (call UserDataService or similar)
    // For now, just close the modal
    setShowEditCalculation(false);
    handleRefresh();
  };

  // Helper to map SavedData to ExistingCalculation for SaveCalculationModal
  const getExistingCalculation = () => {
    const calc = getSelectedCalculationData();
    if (!calc) return undefined;
    return {
      id: calc.id,
      data_name: calc.data_name,
      data_content: calc.data_content as TaxCalculationData,
    } as ExistingCalculation;
  };

  // Provide fallback values for required props
  const defaultSalaryData = {
    country: '', countryCode: '', state: '', stateId: '', grossSalary: 0, currency: '', residency: '', dependents: 0, age: 0, maritalStatus: '', deductions: 0, rebates: 0, additionalIncome: 0
  };
  const defaultTaxData = {
    federalTax: 0, stateTax: 0, socialSecurity: 0, medicare: 0, totalTax: 0, takeHomeSalary: 0, effectiveTaxRate: 0
  };
  const defaultExpenseData = {
    rent: 0, utilities: 0, food: 0, transport: 0, healthcare: 0, other: 0, total: 0
  };

  const showSecondaryCurrency = userCurrency && countryCurrency && userCurrency !== countryCurrency;
  const formatAmount = (amount: number) => `${countryCurrency || getCurrencySymbol()}${amount.toLocaleString()}`;
  const formatAmountSecondary = (amount: number) => showSecondaryCurrency ? ` (${userCurrency}${convertCurrency(amount, countryCurrency!, userCurrency!).toLocaleString()})` : '';

  // Calculate summary data from actual database records
  const summary = useMemo(() => {
    const totalSpending = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const uniqueCategories = new Set(expenses.map(e => e.categoryId).filter(Boolean)).size;
    const overBudgetCount = budgets.filter(budget => {
      const spent = budgetProgress[budget.categoryId ?? 0]?.spent || 0;
      return spent > budget.amount;
    }).length;
    const activeAlertsCount = alerts.filter(a => a.is_active).length;
    const triggeredAlertsCount = triggeredAlerts.length;
    const calculationsCount = savedCalculations.length;
    const favoritedCount = savedCalculations.filter(c => c.is_favorite).length;

    return {
      totalSpending,
      budgets: budgets.length,
      activeAlerts: activeAlertsCount,
      categories: uniqueCategories,
      calculations: calculationsCount,
      favorited: favoritedCount,
      overBudgetCount,
      triggeredAlertsCount,
      averageDaily: totalSpending / 30, // Simple average
    };
  }, [expenses, budgets, alerts, triggeredAlerts, savedCalculations, budgetProgress]);

  // Calculate top spending categories
  const topCategories = useMemo(() => {
    const categoryTotals = expenses.reduce((acc, expense) => {
      const categoryName = getCategoryName(expense.categoryId ?? 0);
      acc[categoryName] = (acc[categoryName] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, amount]) => ({ name, amount }));
  }, [expenses, getCategoryName]);

  // Calculate budget performance
  const budgetPerformance = useMemo(() => {
    return budgets.map(budget => {
      const spent = budgetProgress[budget.categoryId ?? 0]?.spent || 0;
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      const isOverBudget = spent > budget.amount;
      
      return {
        ...budget,
        spent,
        percentage,
        isOverBudget,
        categoryName: getCategoryName(budget.categoryId ?? 0),
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [budgets, budgetProgress, getCategoryName]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Edit and Delete handlers
  const handleEditExpense = async (expenseId: string, updates: Partial<Expense>) => {
    try {
      // Convert categoryId to string if present, and description to string
      const updatePayload: any = { ...updates };
      if (updatePayload.categoryId !== undefined && updatePayload.categoryId !== null) {
        updatePayload.categoryId = String(updatePayload.categoryId);
      }
      if (updatePayload.description === null) {
        updatePayload.description = '';
      }
      const { data: updatedExpense, error } = await ExpenseService.updateExpense(expenseId, updatePayload);
      if (error) {
        console.error('Error updating expense:', error);
        return;
      }
      // Map back to local type
      setExpenses(prev => prev.map(exp => exp.id === expenseId ? mapServiceExpenseToLocal(updatedExpense) : exp));
    } catch (error) {
      console.error('Error updating expense:', error);
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      const { error } = await ExpenseService.deleteExpense(expenseId);
      if (error) {
        console.error('Error deleting expense:', error);
        return;
      }
      setExpenses(prev => prev.filter(exp => exp.id !== expenseId));
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const handleEditBudget = async (budgetId: string, updates: Partial<Budget>) => {
    try {
      // Convert categoryId to string if present
      const updatePayload: any = { ...updates };
      if (updatePayload.categoryId !== undefined && updatePayload.categoryId !== null) {
        updatePayload.categoryId = String(updatePayload.categoryId);
      }
      if (updatePayload.period === undefined) {
        updatePayload.period = 'monthly';
      }
      const { data: updatedBudget, error } = await BudgetService.updateBudget(budgetId, updatePayload);
      if (error) {
        console.error('Error updating budget:', error);
        return;
      }
      setBudgets(prev => prev.map(budget => budget.id === budgetId ? { ...mapServiceBudgetToLocal(updatedBudget), period: updatePayload.period } : budget));
    } catch (error) {
      console.error('Error updating budget:', error);
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    try {
      const { error } = await BudgetService.deleteBudget(budgetId);
      if (error) {
        console.error('Error deleting budget:', error);
        return;
      }
      setBudgets(prev => prev.filter(budget => budget.id !== budgetId));
    } catch (error) {
      console.error('Error deleting budget:', error);
    }
  };

  const handleEditAlert = async (alertId: string, updates: Partial<Alert>) => {
    try {
      const updatePayload: any = { ...updates };
      if (updatePayload.categoryId !== undefined && updatePayload.categoryId !== null) {
        updatePayload.categoryId = String(updatePayload.categoryId);
      }
      const { data: updatedAlert, error } = await AlertService.updateAlert(alertId, updatePayload);
      if (error) {
        console.error('Error updating alert:', error);
        return;
      }
      setAlerts(prev => prev.map(alert => alert.id === alertId ? mapServiceAlertToLocal(updatedAlert) : alert));
    } catch (error) {
      console.error('Error updating alert:', error);
    }
  };

  const handleDeleteAlert = async (alertId: string) => {
    try {
      const { error } = await AlertService.deleteAlert(alertId);
      if (error) {
        console.error('Error deleting alert:', error);
        return;
      }
      setAlerts(prev => prev.filter(alert => alert.id !== alertId));
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };



  return (
    <>
      {/* Debug Information */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4 mx-4 mt-4">
        <h3 className="text-sm font-semibold text-yellow-800 mb-2">Debug Information</h3>
        <div className="text-xs text-yellow-700 space-y-1">
          <div>User ID: {userId}</div>
          <div>Loading: {isLoading ? 'Yes' : 'No'}</div>
          <div>Calculations Count: {savedCalculations.length}</div>
          <div>Selected Calculation: {selectedCalculation || 'None'}</div>
          <div>Data Loaded: {dataLoadedRef.current ? 'Yes' : 'No'}</div>
        </div>
      </div>

      <OfflineSyncStatusCard />
      <VoiceInputModal />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <header className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 mb-6 sticky top-0 z-10" role="banner" aria-label="Dashboard header">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700 block">Selected Calculation</Label>
                <p className="text-xs text-gray-500">Choose a calculation to view its financial data</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedCalculation} onValueChange={setSelectedCalculation}>
                <SelectTrigger className="w-full md:w-96 border-blue-200 bg-white hover:bg-blue-50 transition-colors">
                  <SelectValue placeholder="Select a calculation" />
                </SelectTrigger>
                <SelectContent>
                  {savedCalculations.map((calculation) => (
                    <SelectItem key={calculation.id} value={calculation.id} className="flex items-center gap-2">
                      <Star className={`w-4 h-4 ${calculation.is_favorite ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                      <div className="flex-1">
                        <div className="font-medium">{calculation.data_name}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(calculation.created_at).toLocaleDateString()} • {new Date(calculation.created_at).toLocaleTimeString()}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="ghost" 
                size="icon" 
                aria-label="Edit Calculation" 
                onClick={() => setShowEditCalculation(true)} 
                className="min-w-[44px] min-h-[44px] hover:bg-blue-100 text-blue-600"
              >
                <Edit className="w-5 h-5" />
              </Button>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button 
              onClick={() => navigate('/tax-calculator')} 
              variant="outline" 
              aria-label="New Calculation" 
              className="min-w-[44px] min-h-[44px] border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <Calculator className="w-4 h-4 mr-2" />
              New Calculation
            </Button>
            <Button 
              onClick={handleRefresh} 
              variant="outline" 
              aria-label="Refresh Dashboard" 
              className="min-w-[44px] min-h-[44px] border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </header>

        {/* Edit Calculation Modal */}
        <SaveCalculationModal
          isOpen={showEditCalculation}
          onClose={() => setShowEditCalculation(false)}
          onSave={handleSaveCalculation}
          existingCalculation={getExistingCalculation()}
          salaryData={defaultSalaryData}
          taxData={defaultTaxData}
          expenseData={defaultExpenseData}
        />

        {/* Merged Calculation Overview Card */}
        {selectedCalculation && (
          <Card className="mb-6 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calculator className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-800">
                      {getSelectedCalculationData()?.data_name || 'Selected Calculation'}
                    </CardTitle>
                    <CardDescription className="text-sm text-gray-600">
                      {getSelectedCalculationData()?.data_content?.country || 'Unknown'} • {getSelectedCalculationData()?.data_content?.currency || 'USD'} {getSelectedCalculationData()?.data_content?.salary?.toLocaleString() || '0'}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {getSelectedCalculationData()?.data_content?.currency || 'USD'}
                  </Badge>
                  {getSelectedCalculationData()?.is_favorite && (
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-blue-600">
                    {formatAmount(getSelectedCalculationData()?.data_content?.salary || 0)}
                  </div>
                  <div className="text-xs text-gray-500">Gross Salary</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-green-600">
                    {formatAmount(getSelectedCalculationData()?.data_content?.netSalary || 0)}
                  </div>
                  <div className="text-xs text-gray-500">Take Home</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-red-600">
                    {formatAmount(getSelectedCalculationData()?.data_content?.taxAmount || 0)}
                  </div>
                  <div className="text-xs text-gray-500">Total Tax</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-purple-600">
                    {getSelectedCalculationData()?.data_content?.effectiveTaxRate?.toFixed(1) || '0'}%
                  </div>
                  <div className="text-xs text-gray-500">Tax Rate</div>
                </div>
              </div>
              
              {/* Financial Overview */}
              <div className="border-t border-blue-200 pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Financial Overview</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-800">
                      {formatAmount(summary.totalSpending)}{formatAmountSecondary(summary.totalSpending)}
                    </div>
                    <div className="text-xs text-gray-500">{expenses.length} transactions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-800">{summary.budgets}</div>
                    <div className="text-xs text-gray-500">{summary.overBudgetCount} over budget</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-800">{summary.activeAlerts}</div>
                    <div className="text-xs text-gray-500">{summary.triggeredAlertsCount} triggered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-800">{summary.categories}</div>
                    <div className="text-xs text-gray-500">Categories tracked</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary Cards - Only show when no calculation is selected */}
        {!selectedCalculation && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
                <DollarSign className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatAmount(summary.totalSpending)}{formatAmountSecondary(summary.totalSpending)}</div>
                <p className="text-xs text-muted-foreground">{expenses.length} transactions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Budgets</CardTitle>
                <Target className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.budgets}</div>
                <p className="text-xs text-muted-foreground">{summary.overBudgetCount} over budget</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <Bell className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.activeAlerts}</div>
                <p className="text-xs text-muted-foreground">{summary.triggeredAlertsCount} triggered</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.categories}</div>
                <p className="text-xs text-muted-foreground">Expense categories</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Calculations</CardTitle>
                <Calculator className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.calculations}</div>
                <p className="text-xs text-muted-foreground">{summary.favorited} favorited</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full" role="tablist" aria-label="Dashboard sections">
          <TabsList className="grid w-full grid-cols-4 mb-4 bg-gray-100 rounded-lg p-1">
            <TabsTrigger value="overview" className="flex items-center gap-2 min-w-[44px] min-h-[44px]" role="tab" aria-selected={activeTab === 'overview'} aria-controls="dashboard-tab-overview" id="dashboard-tab-trigger-overview">
              <BarChart3 className="w-4 h-4" />Overview
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center gap-2 min-w-[44px] min-h-[44px]" role="tab" aria-selected={activeTab === 'expenses'} aria-controls="dashboard-tab-expenses" id="dashboard-tab-trigger-expenses">
              <DollarSign className="w-4 h-4" />Expenses
            </TabsTrigger>
            <TabsTrigger value="budgets" className="flex items-center gap-2 min-w-[44px] min-h-[44px]" role="tab" aria-selected={activeTab === 'budgets'} aria-controls="dashboard-tab-budgets" id="dashboard-tab-trigger-budgets">
              <Target className="w-4 h-4" />Budgets
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2 min-w-[44px] min-h-[44px]" role="tab" aria-selected={activeTab === 'alerts'} aria-controls="dashboard-tab-alerts" id="dashboard-tab-trigger-alerts">
              <Bell className="w-4 h-4" />Alerts
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6" role="tabpanel" id="dashboard-tab-overview" aria-labelledby="dashboard-tab-trigger-overview">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{formatAmount(summary.totalSpending)}{formatAmountSecondary(summary.totalSpending)}</div>
                  <p className="text-xs text-muted-foreground">Average daily: {formatAmount(summary.averageDaily)}{formatAmountSecondary(summary.averageDaily)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Top Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{topCategories.length}</div>
                  <p className="text-xs text-muted-foreground">Categories tracked</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Budget Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{budgetPerformance.length}</div>
                  <p className="text-xs text-muted-foreground">Budgets tracked</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{summary.activeAlerts}</div>
                  <p className="text-xs text-muted-foreground">{summary.triggeredAlertsCount} triggered</p>
                </CardContent>
              </Card>
            </div>

            {/* Top Spending Categories */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Top Spending Categories</CardTitle>
                <CardDescription>This Month spending breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                {topCategories.length > 0 ? (
                  <div className="space-y-4">
                    {topCategories.map((category, index) => (
                      <div key={category.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{category.name}</p>
                            <p className="text-sm text-gray-500">{formatAmount(category.amount)}{formatAmountSecondary(category.amount)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-blue-500 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${(category.amount / (topCategories[0]?.amount || 1)) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No spending data available</p>
                    <p className="text-sm">Add some expenses to see your spending breakdown</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Budget Performance */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Budget Performance</CardTitle>
                <CardDescription>How you're doing against your budgets</CardDescription>
              </CardHeader>
              <CardContent>
                {budgetPerformance.length > 0 ? (
                  <div className="space-y-4">
                    {budgetPerformance.map((budget) => (
                      <div key={budget.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{budget.categoryName}</p>
                            <p className="text-sm text-gray-500">
                              {formatAmount(budget.spent)}{formatAmountSecondary(budget.spent)} / {formatAmount(budget.amount)}{formatAmountSecondary(budget.amount)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-semibold ${budget.isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                              {budget.percentage.toFixed(1)}%
                            </p>
                            <p className="text-xs text-gray-500">{budget.period}</p>
                          </div>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              budget.isOverBudget ? 'bg-red-500' : budget.percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No budget data available</p>
                    <p className="text-sm">Set up budgets to track your spending</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest expenses and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Recent Expenses */}
                  {expenses.slice(0, 3).map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <DollarSign className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{expense.description}</p>
                          <p className="text-sm text-gray-500">{getCategoryName(expense.categoryId ?? 0)} • {new Date(expense.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatAmount(expense.amount)}{formatAmountSecondary(expense.amount)}</p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Recent Alerts */}
                  {triggeredAlerts.slice(0, 2).map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                          <Bell className="w-4 h-4 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Budget Alert</p>
                          <p className="text-sm text-gray-500">{alert.categoryName} exceeded threshold</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">{formatAmount(0)}{formatAmountSecondary(0)}</p>
                      </div>
                    </div>
                  ))}
                  
                  {expenses.length === 0 && triggeredAlerts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No recent activity</p>
                      <p className="text-sm">Add expenses or set up alerts to see activity here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="space-y-6" role="tabpanel" id="dashboard-tab-expenses" aria-labelledby="dashboard-tab-trigger-expenses">
            {/* Header with stats */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Expenses</h3>
                <p className="text-sm text-gray-600">Track and manage your spending</p>
              </div>
              <Button onClick={() => setShowAddExpense(true)} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" /> Add Expense
              </Button>
            </div>

            {/* Search and filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={expenseSearch}
                  onChange={e => setExpenseSearch(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  aria-label="Search expenses"
                />
              </div>
              <div className="flex gap-2">
                <Select>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="food">Food & Drinks</SelectItem>
                    <SelectItem value="transport">Transportation</SelectItem>
                    <SelectItem value="housing">Housing</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="entertainment">Entertainment</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-full sm:w-40">
                    <SelectValue placeholder="All Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Expenses table with improved styling */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredExpenses.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <DollarSign className="w-12 h-12 text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
                            <p className="text-gray-500 mb-4">Start tracking your expenses to see them here</p>
                            <Button onClick={() => setShowAddExpense(true)} variant="outline">
                              <Plus className="w-4 h-4 mr-2" /> Add Your First Expense
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredExpenses.map((e: Expense, idx: number) => (
                        <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(e.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="secondary" className="text-xs">
                              {getCategoryName(e.categoryId ?? 0)}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatAmount(e.amount)}{formatAmountSecondary(e.amount)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                            {e.description || 'No description'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {e.location || '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex gap-2">
                                                              <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingExpense(e);
                                    setShowEditExpense(true);
                                  }}
                                  aria-label="Edit expense"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-red-600 hover:text-red-700"
                                onClick={() => {
                                  if (e.id) {
                                    handleDeleteExpense(e.id);
                                  }
                                }}
                                aria-label="Delete expense"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Expense</DialogTitle>
                  <DialogDescription>
                    Track a new expense to monitor your spending.
                  </DialogDescription>
                </DialogHeader>
                <ExpenseForm
                  userId={userId}
                  onSave={async (expense) => {
                    await handleAddExpense(expense);
                    setShowAddExpense(false);
                  }}
                  onCancel={() => setShowAddExpense(false)}
                />
              </DialogContent>
            </Dialog>

            {/* Edit Expense Modal */}
            <Dialog open={showEditExpense} onOpenChange={setShowEditExpense}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Expense</DialogTitle>
                  <DialogDescription>
                    Update the expense details.
                  </DialogDescription>
                </DialogHeader>
                {editingExpense && (
                  <ExpenseForm
                    userId={userId}
                    expense={editingExpense}
                    onSave={async (expense) => {
                      if (editingExpense?.id) {
                        await handleEditExpense(editingExpense.id, expense);
                      }
                      setShowEditExpense(false);
                      setEditingExpense(null);
                    }}
                    onCancel={() => {
                      setShowEditExpense(false);
                      setEditingExpense(null);
                    }}
                  />
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Budgets Tab */}
          <TabsContent value="budgets" className="space-y-6" role="tabpanel" id="dashboard-tab-budgets" aria-labelledby="dashboard-tab-trigger-budgets">
            {/* Header with stats */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Budgets</h3>
                <p className="text-sm text-gray-600">Set spending limits and track your progress</p>
              </div>
              <Button onClick={() => setShowAddBudget(true)} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" /> Add Budget
              </Button>
            </div>

            {/* Budget overview cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatAmount(budgets.reduce((sum, budget) => sum + budget.amount, 0))}{formatAmountSecondary(budgets.reduce((sum, budget) => sum + budget.amount, 0))}</div>
                  <p className="text-xs text-muted-foreground">Across all categories</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Spent</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{formatAmount(Object.values(budgetProgress).reduce((sum, progress) => sum + progress.spent, 0))}{formatAmountSecondary(Object.values(budgetProgress).reduce((sum, progress) => sum + progress.spent, 0))}</div>
                  <p className="text-xs text-muted-foreground">
                    {budgets.length > 0 ? 
                      `${((Object.values(budgetProgress).reduce((sum, progress) => sum + progress.spent, 0) / budgets.reduce((sum, budget) => sum + budget.amount, 0)) * 100).toFixed(1)}% of total budget` : 
                      '0% of total budget'
                    }
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Remaining</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatAmount(budgets.reduce((sum, budget) => sum + budget.amount, 0) - Object.values(budgetProgress).reduce((sum, progress) => sum + progress.spent, 0))}
                    {formatAmountSecondary(budgets.reduce((sum, budget) => sum + budget.amount, 0) - Object.values(budgetProgress).reduce((sum, progress) => sum + progress.spent, 0))}
                  </div>
                  <p className="text-xs text-muted-foreground">Available to spend</p>
                </CardContent>
              </Card>
            </div>

            {/* Budgets table with improved styling */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spent</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {budgets.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <Target className="w-12 h-12 text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets set</h3>
                            <p className="text-gray-500 mb-4">Create budgets to track your spending limits</p>
                            <Button onClick={() => setShowAddBudget(true)} variant="outline">
                              <Plus className="w-4 h-4 mr-2" /> Create Your First Budget
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      budgets.map((b: Budget, idx: number) => {
                        const spent = 0; // This would be calculated from actual expenses
                        const progress = b.amount > 0 ? (spent / b.amount) * 100 : 0;
                        const isOverBudget = progress > 100;
                        
                        return (
                          <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant="secondary" className="text-xs">
                                {getCategoryName(b.categoryId ?? 0)}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatAmount(b.amount)}{formatAmountSecondary(b.amount)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatAmount(budgetProgress[b.categoryId ?? 0]?.spent || 0)}{formatAmountSecondary(budgetProgress[b.categoryId ?? 0]?.spent || 0)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full transition-all ${
                                      budgetProgress[b.categoryId ?? 0]?.percentage > 100 ? 'bg-red-500' : 
                                      budgetProgress[b.categoryId ?? 0]?.percentage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                                    }`}
                                    style={{ width: `${Math.min(budgetProgress[b.categoryId ?? 0]?.percentage || 0, 100)}%` }}
                                  />
                                </div>
                                <span className={`text-xs font-medium ${
                                  budgetProgress[b.categoryId ?? 0]?.percentage > 100 ? 'text-red-600' : 
                                  budgetProgress[b.categoryId ?? 0]?.percentage > 80 ? 'text-yellow-600' : 'text-green-600'
                                }`}>
                                  {(budgetProgress[b.categoryId ?? 0]?.percentage || 0).toFixed(1)}%
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {b.period}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingBudget(b);
                                    setShowEditBudget(true);
                                  }}
                                  aria-label="Edit budget"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => {
                                    if (b.id) {
                                      handleDeleteBudget(b.id);
                                    }
                                  }}
                                  aria-label="Delete budget"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <Dialog open={showAddBudget} onOpenChange={setShowAddBudget}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Budget</DialogTitle>
                  <DialogDescription>
                    Set spending limits for different categories to track your financial goals.
                  </DialogDescription>
                </DialogHeader>
                <BudgetForm
                  userId={userId}
                  onSave={async (budget) => {
                    await handleAddBudget(budget);
                    setShowAddBudget(false);
                  }}
                  onCancel={() => setShowAddBudget(false)}
                />
              </DialogContent>
            </Dialog>

            {/* Edit Budget Modal */}
            <Dialog open={showEditBudget} onOpenChange={setShowEditBudget}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Budget</DialogTitle>
                  <DialogDescription>
                    Update the budget details.
                  </DialogDescription>
                </DialogHeader>
                {editingBudget && (
                  <BudgetForm
                    userId={userId}
                    budget={editingBudget}
                    onSave={async (budget) => {
                      if (editingBudget?.id) {
                        await handleEditBudget(editingBudget.id, budget);
                      }
                      setShowEditBudget(false);
                      setEditingBudget(null);
                    }}
                    onCancel={() => {
                      setShowEditBudget(false);
                      setEditingBudget(null);
                    }}
                  />
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6" role="tabpanel" id="dashboard-tab-alerts" aria-labelledby="dashboard-tab-trigger-alerts">
            {/* Header with stats */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Spending Alerts</h3>
                <p className="text-sm text-gray-600">Get notified when you exceed spending thresholds</p>
              </div>
              <Button onClick={() => setShowAddAlert(true)} className="w-full sm:w-auto">
                <Plus className="w-4 h-4 mr-2" /> Add Alert
              </Button>
            </div>

            {/* Alert overview cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{alerts.filter(a => a.is_active).length}</div>
                  <p className="text-xs text-muted-foreground">Currently monitoring</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Triggered Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {alerts.filter(alert => {
                      if (!alert.is_active) return false;
                      const categoryExpenses = expenses.filter(e => e.categoryId === alert.categoryId);
                      const todayExpenses = categoryExpenses.filter(e => {
                        const expenseDate = new Date(e.date);
                        const today = new Date();
                        return expenseDate.toDateString() === today.toDateString();
                      });
                      const totalToday = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
                      return totalToday > alert.threshold;
                    }).length}
                  </div>
                  <p className="text-xs text-muted-foreground">Thresholds exceeded</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">This Week</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {alerts.filter(alert => {
                      if (!alert.is_active) return false;
                      const categoryExpenses = expenses.filter(e => e.categoryId === alert.categoryId);
                      const weekExpenses = categoryExpenses.filter(e => {
                        const expenseDate = new Date(e.date);
                        const today = new Date();
                        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return expenseDate >= weekAgo && expenseDate <= today;
                      });
                      const totalWeek = weekExpenses.reduce((sum, e) => sum + e.amount, 0);
                      return totalWeek > alert.threshold;
                    }).length}
                  </div>
                  <p className="text-xs text-muted-foreground">Alerts triggered</p>
                </CardContent>
              </Card>
            </div>

            {/* Alerts table with improved styling */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Threshold</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {alerts.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center">
                          <div className="flex flex-col items-center">
                            <Bell className="w-12 h-12 text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts set</h3>
                            <p className="text-gray-500 mb-4">Create spending alerts to stay on top of your budget</p>
                            <Button onClick={() => setShowAddAlert(true)} variant="outline">
                              <Plus className="w-4 h-4 mr-2" /> Create Your First Alert
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      alerts.map((a: Alert) => {
                        const severityColor = a.severity === 'high' ? 'bg-red-100 text-red-800' : 
                                             a.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                             'bg-green-100 text-green-800';
                        const isTriggered = triggeredAlerts.some(triggered => triggered.id === a.id);
                        
                        return (
                          <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant="secondary" className="text-xs">
                                {getCategoryName(a.categoryId ?? 0)}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatAmount(a.threshold)}{formatAmountSecondary(a.threshold)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <Badge variant="outline" className="text-xs capitalize">
                                {a.type || 'amount'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={`text-xs ${severityColor}`}>
                                {a.severity || 'medium'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Badge variant={a.is_active ? 'default' : 'secondary'} className="text-xs">
                                  {a.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                                {isTriggered && (
                                  <Badge variant="destructive" className="text-xs">
                                    Triggered
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => {
                                    setEditingAlert(a);
                                    setShowEditAlert(true);
                                  }}
                                  aria-label="Edit alert"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => {
                                    if (a.id) {
                                      handleDeleteAlert(a.id);
                                    }
                                  }}
                                  aria-label="Delete alert"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <Dialog open={showAddAlert} onOpenChange={setShowAddAlert}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Spending Alert</DialogTitle>
                  <DialogDescription>
                    Set up alerts to get notified when you exceed spending thresholds.
                  </DialogDescription>
                </DialogHeader>
                <AlertForm
                  userId={userId}
                  onSave={async (alert) => {
                    await handleAddAlert(alert);
                    setShowAddAlert(false);
                  }}
                  onCancel={() => setShowAddAlert(false)}
                />
              </DialogContent>
            </Dialog>

            {/* Edit Alert Modal */}
            <Dialog open={showEditAlert} onOpenChange={setShowEditAlert}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Spending Alert</DialogTitle>
                  <DialogDescription>
                    Update the alert details.
                  </DialogDescription>
                </DialogHeader>
                {editingAlert && (
                  <AlertForm
                    userId={userId}
                    alert={editingAlert}
                    onSave={async (alert) => {
                      if (editingAlert?.id) {
                        await handleEditAlert(editingAlert.id, alert);
                      }
                      setShowEditAlert(false);
                      setEditingAlert(null);
                    }}
                    onCancel={() => {
                      setShowEditAlert(false);
                      setEditingAlert(null);
                    }}
                  />
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteConfirmDialog.isOpen}
          onClose={() => setDeleteConfirmDialog(prev => ({ ...prev, isOpen: false }))}
          onConfirm={executeDeleteCalculation}
          title="Delete Calculation"
          description={`Are you sure you want to delete "${deleteConfirmDialog.calculationName}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          variant="destructive"
        />
      </section>
    </>
  );
}; 