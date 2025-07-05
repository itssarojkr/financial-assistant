// Export all services
export { ExpenseService } from './expenseService';
export { BudgetService } from './budgetService';
export { AlertService } from './alertService';
export { PreferencesService } from './preferencesService';
export { AnalyticsService } from './analyticsService';

// Export types
export type {
  Expense,
  ExpenseCategory,
  CreateExpenseData,
  ExpenseFilters,
} from './expenseService';

export type {
  Budget,
  CreateBudgetData,
  BudgetProgress,
} from './budgetService';

export type {
  SpendingAlert,
  CreateAlertData,
  AlertTrigger,
} from './alertService';

export type {
  UserPreferences,
  UpdatePreferencesData,
} from './preferencesService';

export type {
  SpendingInsights,
  MonthlyReport,
  SavingsAnalysis,
} from './analyticsService'; 