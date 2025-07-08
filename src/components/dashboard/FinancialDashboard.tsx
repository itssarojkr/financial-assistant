import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  CheckCircle
} from 'lucide-react';
import { UserDataService, type SavedData } from '@/application/services/UserDataService';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';


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

interface FinancialDashboardProps {
  userId: string;
  userCurrency?: string;
  countryCurrency?: string;
}

// --- Offline Sync Status Card ---
const OfflineSyncStatusCard: React.FC = () => {
  const [status, setStatus] = useState({
    isOnline: true,
    syncInProgress: false,
    queueLength: 0,
    lastSync: null as number | null,
    error: null as string | null,
  });
  const [loading, setLoading] = useState(true);
  const [forceSyncing, setForceSyncing] = useState(false);
  const syncServiceRef = useRef<OfflineSyncService | null>(null);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      if (!syncServiceRef.current) {
        syncServiceRef.current = OfflineSyncService.getInstance();
        await syncServiceRef.current.initialize();
      }
      const syncStatus = await syncServiceRef.current.getSyncStatus();
      setStatus({
        isOnline: syncStatus.isOnline,
        syncInProgress: syncStatus.syncInProgress,
        queueLength: syncStatus.queueLength,
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
    fetchStatus();
    // Poll every 10 seconds for live updates
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleForceSync = async () => {
    setForceSyncing(true);
    setStatus(s => ({ ...s, error: null }));
    try {
      if (syncServiceRef.current) {
        await syncServiceRef.current.forceSync();
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
    ? new Date(status.lastSync).toLocaleString()
    : 'Never';

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
  const [commandResult, setCommandResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const voiceServiceRef = useRef<VoiceInputService | null>(null);

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
      const result = await voiceServiceRef.current.startListening();
      setTranscript(result.text || '');
      setListening(false);
      setProcessing(false);
      if (result.success && result.text) {
        const cmdResult = await voiceServiceRef.current.processVoiceCommand(result.text);
        setCommandResult(cmdResult);
      } else {
        setError(result.error || 'No speech detected');
      }
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
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
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

  const getSelectedCalculationData = () => {
    return savedCalculations.find(calc => calc.id === selectedCalculation);
  };

  // --- UI state for modals/forms ---
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [expenseSearch, setExpenseSearch] = useState('');

  // --- Extract items from selected calculation ---
  const selectedCalc = getSelectedCalculationData();
  const calcData: CalculationData = (selectedCalc?.data_content || {}) as CalculationData;
  const expenses: Expense[] = calcData.expenses || [];
  const budgets: Budget[] = calcData.budgets || [];
  const alerts: Alert[] = calcData.alerts || [];

  // --- Filtered expenses ---
  const filteredExpenses = expenses.filter((e: Expense) => {
    const q = expenseSearch.toLowerCase();
    return (
      e.description?.toLowerCase().includes(q) ||
      e.amount?.toString().includes(q) ||
      e.location?.toLowerCase().includes(q) ||
      e.source?.toLowerCase().includes(q) ||
      '' + e.category_id === q
    );
  });

  // --- Add handlers (seamless, no full reload) ---
  const handleAddExpense = async (expense: Expense) => {
    const updated = [...expenses, expense];
    calcData.expenses = updated;
    await UserDataService.syncCalculationExpenses(userId, updated, selectedCalculation);
    // Update local state for seamless UI
    setSavedCalculations(prev => prev.map(calc =>
      calc.id === selectedCalculation
        ? { ...calc, data_content: { ...calc.data_content, expenses: updated } }
        : calc
    ));
    setShowAddExpense(false);
  };
  const handleAddBudget = async (budget: Budget) => {
    const updated = [...budgets, budget];
    calcData.budgets = updated;
    await UserDataService.syncCalculationBudgets(userId, updated, selectedCalculation);
    setSavedCalculations(prev => prev.map(calc =>
      calc.id === selectedCalculation
        ? { ...calc, data_content: { ...calc.data_content, budgets: updated } }
        : calc
    ));
    setShowAddBudget(false);
  };
  const handleAddAlert = async (alert: Alert) => {
    const updated = [...alerts, alert];
    calcData.alerts = updated;
    await UserDataService.syncCalculationAlerts(userId, updated, selectedCalculation);
    setSavedCalculations(prev => prev.map(calc =>
      calc.id === selectedCalculation
        ? { ...calc, data_content: { ...calc.data_content, alerts: updated } }
        : calc
    ));
    setShowAddAlert(false);
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
      
      const savedCalculationsData = await UserDataService.getTaxCalculations(userId).catch(err => {
        console.error('Error loading saved calculations:', err);
        return { data: [], error: null };
      });

      console.log('Data loaded:', {
        savedCalculations: savedCalculationsData.data?.length || 0
      });

      setSavedCalculations(savedCalculationsData.data || []);
      
      // Set the first calculation as selected by default
      if (savedCalculationsData.data && savedCalculationsData.data.length > 0) {
        setSelectedCalculation(savedCalculationsData.data[0].id);
      }
    } catch (error: unknown) {
      const message = (typeof error === 'object' && error && 'message' in error) ? (error as { message?: string }).message : undefined;
      console.error('Error loading dashboard data:', message || 'Unknown error');
    } finally {
      setIsLoading(false);
      dataLoadedRef.current = true;
    }
  }, [userId]);

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

  const handleDataUpdate = () => {
    loadDashboardData();
  };

  const handleRefresh = () => {
    setIsLoading(true);
    loadDashboardData();
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
      data_content: {
        country: calc.data_content?.country || '',
        salary: calc.data_content?.salary || 0,
        currency: calc.data_content?.currency || '',
        taxAmount: calc.data_content?.taxAmount || 0,
        netSalary: calc.data_content?.netSalary || 0,
        expenseData: calc.data_content?.expenseData || {},
      },
    };
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

  // Summary stats (mocked for now)
  const summary = {
    totalSpending: 0,
    budgets: 0,
    activeAlerts: 1,
    categories: 11,
    calculations: savedCalculations.length,
    favorited: savedCalculations.filter(calc => calc.is_favorite).length,
    topCategories: 0,
    budgetPerformance: 0,
    triggeredAlerts: 1,
  };

  return (
    <>
      <OfflineSyncStatusCard />
      <VoiceInputModal />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <header className="bg-white rounded-lg shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 mb-6 sticky top-0 z-10" role="banner" aria-label="Dashboard header">
          <div className="flex-1 min-w-0">
            <Label className="text-sm font-medium mb-1 block">Selected Calculation:</Label>
            <div className="flex items-center gap-2">
              <Select value={selectedCalculation} onValueChange={setSelectedCalculation}>
                <SelectTrigger className="w-full md:w-96">
                  <SelectValue placeholder="Select a calculation" />
                </SelectTrigger>
                <SelectContent>
                  {savedCalculations.map((calculation) => (
                    <SelectItem key={calculation.id} value={calculation.id} className="flex items-center gap-2">
                      <Star className={`w-4 h-4 ${calculation.is_favorite ? 'text-yellow-400' : 'text-gray-300'}`} />
                      {calculation.data_name} - {new Date(calculation.created_at).toLocaleString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" aria-label="Edit Calculation" onClick={() => setShowEditCalculation(true)} className="min-w-[44px] min-h-[44px]">
                <Edit className="w-5 h-5 text-gray-500 hover:text-blue-600" />
              </Button>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button onClick={() => navigate('/tax-calculator')} variant="outline" aria-label="New Calculation" className="min-w-[44px] min-h-[44px]">
              <Calculator className="w-4 h-4 mr-2" />
              New Calculation
            </Button>
            <Button onClick={handleRefresh} variant="outline" aria-label="Refresh Dashboard" className="min-w-[44px] min-h-[44px]">
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatAmount(0)}{formatAmountSecondary(0)}</div>
              <p className="text-xs text-muted-foreground">0 transactions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Budgets</CardTitle>
              <Target className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.budgets}</div>
              <p className="text-xs text-muted-foreground">0 over budget</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
              <Bell className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.activeAlerts}</div>
              <p className="text-xs text-muted-foreground">1 triggered</p>
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
                  <div className="text-xl font-bold">{formatAmount(0)}{formatAmountSecondary(0)}</div>
                  <p className="text-xs text-muted-foreground">Average daily: {formatAmount(0)}{formatAmountSecondary(0)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Top Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Categories tracked</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Budget Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Budgets tracked</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">1</div>
                  <p className="text-xs text-muted-foreground">0 triggered</p>
                </CardContent>
              </Card>
            </div>

            {/* Large Placeholder Cards */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Top Spending Categories</CardTitle>
                <CardDescription>This Month spending breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Placeholder for chart or data */}
              </CardContent>
            </Card>
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Budget Performance</CardTitle>
                <CardDescription>How you're doing against your budgets</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Placeholder for chart or data */}
              </CardContent>
            </Card>
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Spending Trends</CardTitle>
                <CardDescription>Daily spending over the period</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Placeholder for chart or data */}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="space-y-6" role="tabpanel" id="dashboard-tab-expenses" aria-labelledby="dashboard-tab-trigger-expenses">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setShowAddExpense(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add Expense
              </Button>
            </div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search expenses..."
                  value={expenseSearch}
                  onChange={e => setExpenseSearch(e.target.value)}
                  className="w-full md:w-80 px-3 py-2 border rounded shadow-sm"
                  aria-label="Search expenses"
                />
              </div>
            </div>
            <div className="overflow-x-auto rounded-lg shadow">
              <table className="min-w-full text-sm bg-white rounded-lg">
                <thead className="sticky top-0 bg-gray-50 z-10">
                  <tr>
                    <th className="px-2 py-2 text-left font-semibold">Date</th>
                    <th className="px-2 py-2 text-left font-semibold">Category</th>
                    <th className="px-2 py-2 text-left font-semibold">Amount</th>
                    <th className="px-2 py-2 text-left font-semibold">Description</th>
                    <th className="px-2 py-2 text-left font-semibold">Location</th>
                    <th className="px-2 py-2 text-left font-semibold">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses.length === 0 ? (
                    <tr><td colSpan={6} className="text-center text-gray-500 py-8">No expenses data available.</td></tr>
                  ) : (
                    filteredExpenses.map((e: Expense, idx: number) => (
                      <tr key={e.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-2 py-2">{e.date}</td>
                        <td className="px-2 py-2">{e.category_id}</td>
                        <td className="px-2 py-2">{formatAmount(e.amount)}{formatAmountSecondary(e.amount)}</td>
                        <td className="px-2 py-2">{e.description}</td>
                        <td className="px-2 py-2">{e.location}</td>
                        <td className="px-2 py-2">{e.source}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
              <DialogContent>
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
          </TabsContent>

          {/* Budgets Tab */}
          <TabsContent value="budgets" className="space-y-6" role="tabpanel" id="dashboard-tab-budgets" aria-labelledby="dashboard-tab-trigger-budgets">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setShowAddBudget(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add Budget
              </Button>
            </div>
            <div className="overflow-x-auto rounded-lg shadow">
              <table className="min-w-full text-sm bg-white rounded-lg">
                <thead className="sticky top-0 bg-gray-50 z-10">
                  <tr>
                    <th className="px-2 py-2 text-left font-semibold">Category</th>
                    <th className="px-2 py-2 text-left font-semibold">Amount</th>
                    <th className="px-2 py-2 text-left font-semibold">Period</th>
                    <th className="px-2 py-2 text-left font-semibold">Start</th>
                    <th className="px-2 py-2 text-left font-semibold">End</th>
                  </tr>
                </thead>
                <tbody>
                  {budgets.length === 0 ? (
                    <tr><td colSpan={5} className="text-center text-gray-500 py-8">No budgets data available.</td></tr>
                  ) : (
                    budgets.map((b: Budget, idx: number) => (
                      <tr key={b.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-2 py-2">{b.category_id}</td>
                        <td className="px-2 py-2">{formatAmount(b.amount)}{formatAmountSecondary(b.amount)}</td>
                        <td className="px-2 py-2">{b.period}</td>
                        <td className="px-2 py-2">{b.start_date}</td>
                        <td className="px-2 py-2">{b.end_date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <Dialog open={showAddBudget} onOpenChange={setShowAddBudget}>
              <DialogContent>
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
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-6" role="tabpanel" id="dashboard-tab-alerts" aria-labelledby="dashboard-tab-trigger-alerts">
            <div className="flex justify-end mb-4">
              <Button onClick={() => setShowAddAlert(true)}>
                <Plus className="w-4 h-4 mr-2" /> Add Alert
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {alerts.length === 0 ? (
                <Card className="col-span-full text-center text-gray-500 py-8">No alerts data available.</Card>
              ) : (
                alerts.map((a: Alert) => (
                  <Card key={a.id} className={`border-l-4 ${a.severity === 'high' ? 'border-red-500' : a.severity === 'medium' ? 'border-yellow-500' : 'border-green-500'}`}>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardTitle className="text-sm font-medium">{a.category_id}</CardTitle>
                      <Badge color={a.active ? 'success' : 'secondary'}>{a.active ? 'Active' : 'Inactive'}</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="font-bold">Threshold: {a.threshold}</div>
                      <div className="text-xs text-muted-foreground">Period: {a.period}</div>
                      <div className="text-xs text-muted-foreground">Severity: {a.severity || 'low'}</div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            <Dialog open={showAddAlert} onOpenChange={setShowAddAlert}>
              <DialogContent>
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