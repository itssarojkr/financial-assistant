import { LocalNotifications } from '@capacitor/local-notifications';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { BiometricAuthService } from './BiometricAuthService';
import { VoiceInputService } from './VoiceInputService';
import { DataExportService } from './DataExportService';
import { AdvancedSearchService } from './AdvancedSearchService';

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  config: WidgetConfig;
  position: WidgetPosition;
  size: WidgetSize;
  isVisible: boolean;
  isPinned: boolean;
  lastUpdated: number;
}

export type WidgetType = 
  | 'expense_summary'
  | 'budget_progress'
  | 'recent_transactions'
  | 'tax_calculator'
  | 'savings_goal'
  | 'spending_chart'
  | 'currency_converter'
  | 'quick_actions';

export interface WidgetConfig {
  refreshInterval?: number;
  maxItems?: number;
  currency?: string;
  dateRange?: { start: Date; end: Date };
  customSettings?: Record<string, unknown>;
}

export interface WidgetPosition {
  x: number;
  y: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

export interface WidgetData {
  widgetId: string;
  data: Record<string, unknown>;
  timestamp: number;
}

export interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: string;
  parameters?: Record<string, any>;
  requiresAuth?: boolean;
  shortcut?: string;
}

/**
 * WidgetsService for managing dashboard widgets and quick actions
 * 
 * This service provides widget management functionality including
 * creation, configuration, data updates, and action execution.
 */
export class WidgetsService {
  private static instance: WidgetsService;
  private widgets: Map<string, Widget> = new Map();
  private widgetData: Map<string, WidgetData> = new Map();
  private refreshTimers: Map<string, NodeJS.Timeout> = new Map();
  private defaultWidgets: Widget[] = [];

  /**
   * Gets the singleton instance of WidgetsService
   */
  static getInstance(): WidgetsService {
    if (!WidgetsService.instance) {
      WidgetsService.instance = new WidgetsService();
    }
    return WidgetsService.instance;
  }

  /**
   * Initialize widgets service
   */
  async initialize(): Promise<void> {
    await this.loadWidgets();
    await this.setupDefaultWidgets();
    this.startRefreshTimers();
  }

  /**
   * Setup default widgets
   */
  private async setupDefaultWidgets(): Promise<void> {
    this.defaultWidgets = [
      {
        id: 'expense-summary',
        type: 'expense_summary',
        title: 'Expense Summary',
        config: { refreshInterval: 300000, currency: 'USD' }, // 5 minutes
        position: { x: 0, y: 0 },
        size: { width: 300, height: 200 },
        isVisible: true,
        isPinned: false,
        lastUpdated: Date.now()
      },
      {
        id: 'budget-progress',
        type: 'budget_progress',
        title: 'Budget Progress',
        config: { refreshInterval: 600000 }, // 10 minutes
        position: { x: 320, y: 0 },
        size: { width: 300, height: 200 },
        isVisible: true,
        isPinned: false,
        lastUpdated: Date.now()
      },
      {
        id: 'recent-transactions',
        type: 'recent_transactions',
        title: 'Recent Transactions',
        config: { refreshInterval: 300000, maxItems: 5 },
        position: { x: 0, y: 220 },
        size: { width: 300, height: 250 },
        isVisible: true,
        isPinned: false,
        lastUpdated: Date.now()
      }
    ];

    // Add default widgets if no widgets exist
    if (this.widgets.size === 0) {
      for (const widget of this.defaultWidgets) {
        await this.addWidget(widget);
      }
    }
  }

  /**
   * Add new widget
   */
  async addWidget(widget: Omit<Widget, 'id' | 'lastUpdated'>): Promise<string> {
    const id = this.generateWidgetId();
    const newWidget: Widget = {
      ...widget,
      id,
      lastUpdated: Date.now()
    };

    this.widgets.set(id, newWidget);
    await this.saveWidgets();
    this.setupRefreshTimer(id, newWidget.config.refreshInterval);
    
    return id;
  }

  /**
   * Update widget
   */
  async updateWidget(widgetId: string, updates: Partial<Widget>): Promise<void> {
    const widget = this.widgets.get(widgetId);
    if (!widget) {
      throw new Error(`Widget not found: ${widgetId}`);
    }

    const updatedWidget: Widget = {
      ...widget,
      ...updates,
      lastUpdated: Date.now()
    };

    this.widgets.set(widgetId, updatedWidget);
    await this.saveWidgets();

    // Update refresh timer if interval changed
    if (updates.config?.refreshInterval !== undefined) {
      this.updateRefreshTimer(widgetId, updates.config.refreshInterval);
    }
  }

  /**
   * Remove widget
   */
  async removeWidget(widgetId: string): Promise<void> {
    this.widgets.delete(widgetId);
    this.widgetData.delete(widgetId);
    this.clearRefreshTimer(widgetId);
    await this.saveWidgets();
  }

  /**
   * Get widget by ID
   */
  getWidget(widgetId: string): Widget | null {
    return this.widgets.get(widgetId) || null;
  }

  /**
   * Get all widgets
   */
  getAllWidgets(): Widget[] {
    return Array.from(this.widgets.values());
  }

  /**
   * Get visible widgets
   */
  getVisibleWidgets(): Widget[] {
    return Array.from(this.widgets.values()).filter(widget => widget.isVisible);
  }

  /**
   * Get widgets by type
   */
  getWidgetsByType(type: WidgetType): Widget[] {
    return Array.from(this.widgets.values()).filter(widget => widget.type === type);
  }

  /**
   * Update widget data
   */
  async updateWidgetData(widgetId: string, data: Record<string, unknown>): Promise<void> {
    const widgetData: WidgetData = {
      widgetId,
      data,
      timestamp: Date.now()
    };

    this.widgetData.set(widgetId, widgetData);
    
    // Update widget lastUpdated timestamp
    const widget = this.widgets.get(widgetId);
    if (widget) {
      widget.lastUpdated = Date.now();
      this.widgets.set(widgetId, widget);
    }
  }

  /**
   * Get widget data
   */
  getWidgetData(widgetId: string): WidgetData | null {
    return this.widgetData.get(widgetId) || null;
  }

  /**
   * Refresh widget data
   */
  async refreshWidget(widgetId: string): Promise<void> {
    const widget = this.widgets.get(widgetId);
    if (!widget) return;

    try {
      const data = await this.fetchWidgetData(widget);
      await this.updateWidgetData(widgetId, data);
    } catch (error) {
      console.error(`Failed to refresh widget ${widgetId}:`, error);
    }
  }

  /**
   * Fetch widget data based on type
   */
  private async fetchWidgetData(widget: Widget): Promise<Record<string, unknown>> {
    switch (widget.type) {
      case 'expense_summary':
        return this.fetchExpenseSummaryData(widget.config);
      case 'budget_progress':
        return this.fetchBudgetProgressData(widget.config);
      case 'recent_transactions':
        return this.fetchRecentTransactionsData(widget.config);
      case 'tax_calculator':
        return this.fetchTaxCalculatorData(widget.config);
      case 'savings_goal':
        return this.fetchSavingsGoalData(widget.config);
      case 'spending_chart':
        return this.fetchSpendingChartData(widget.config);
      case 'currency_converter':
        return this.fetchCurrencyConverterData(widget.config);
      case 'quick_actions':
        return this.fetchQuickActionsData(widget.config);
      default:
        return {};
    }
  }

  /**
   * Fetch expense summary data
   */
  private async fetchExpenseSummaryData(config: WidgetConfig): Promise<Record<string, unknown>> {
    // This would integrate with your expense service
    return {
      totalExpenses: 0,
      monthlyAverage: 0,
      topCategory: 'Food',
      currency: config.currency || 'USD'
    };
  }

  /**
   * Fetch budget progress data
   */
  private async fetchBudgetProgressData(config: WidgetConfig): Promise<Record<string, unknown>> {
    // This would integrate with your budget service
    return {
      totalBudget: 0,
      spent: 0,
      remaining: 0,
      progress: 0
    };
  }

  /**
   * Fetch recent transactions data
   */
  private async fetchRecentTransactionsData(config: WidgetConfig): Promise<Record<string, unknown>> {
    // This would integrate with your transaction service
    return {
      transactions: [],
      maxItems: config.maxItems || 5
    };
  }

  /**
   * Fetch tax calculator data
   */
  private async fetchTaxCalculatorData(config: WidgetConfig): Promise<Record<string, unknown>> {
    // This would integrate with your tax calculator service
    return {
      lastCalculation: null,
      quickCalculate: true
    };
  }

  /**
   * Fetch savings goal data
   */
  private async fetchSavingsGoalData(config: WidgetConfig): Promise<Record<string, unknown>> {
    // This would integrate with your savings service
    return {
      goal: 0,
      current: 0,
      progress: 0
    };
  }

  /**
   * Fetch spending chart data
   */
  private async fetchSpendingChartData(config: WidgetConfig): Promise<Record<string, unknown>> {
    // This would integrate with your analytics service
    return {
      chartData: [],
      period: 'month'
    };
  }

  /**
   * Fetch currency converter data
   */
  private async fetchCurrencyConverterData(config: WidgetConfig): Promise<Record<string, unknown>> {
    // This would integrate with your currency service
    return {
      fromCurrency: 'USD',
      toCurrency: 'EUR',
      rate: 0.85
    };
  }

  /**
   * Fetch quick actions data
   */
  private async fetchQuickActionsData(config: WidgetConfig): Promise<Record<string, unknown>> {
    return {
      actions: [
        { id: 'add-expense', label: 'Add Expense', icon: 'plus' },
        { id: 'add-budget', label: 'Add Budget', icon: 'target' },
        { id: 'calculate-tax', label: 'Calculate Tax', icon: 'calculator' }
      ]
    };
  }

  /**
   * Start refresh timers for all widgets
   */
  private startRefreshTimers(): void {
    this.widgets.forEach((widget, widgetId) => {
      this.setupRefreshTimer(widgetId, widget.config.refreshInterval);
    });
  }

  /**
   * Setup refresh timer for widget
   */
  private setupRefreshTimer(widgetId: string, interval?: number): void {
    if (!interval || interval <= 0) return;

    this.clearRefreshTimer(widgetId);
    
    const timer = setInterval(() => {
      this.refreshWidget(widgetId);
    }, interval);

    this.refreshTimers.set(widgetId, timer);
  }

  /**
   * Update refresh timer
   */
  private updateRefreshTimer(widgetId: string, interval?: number): void {
    this.clearRefreshTimer(widgetId);
    this.setupRefreshTimer(widgetId, interval);
  }

  /**
   * Clear refresh timer
   */
  private clearRefreshTimer(widgetId: string): void {
    const timer = this.refreshTimers.get(widgetId);
    if (timer) {
      clearInterval(timer);
      this.refreshTimers.delete(widgetId);
    }
  }

  /**
   * Generate unique widget ID
   */
  private generateWidgetId(): string {
    return `widget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Load widgets from storage
   */
  private async loadWidgets(): Promise<void> {
    try {
      const stored = localStorage.getItem('widgets');
      if (stored) {
        const widgets = JSON.parse(stored) as Widget[];
        widgets.forEach(widget => {
          this.widgets.set(widget.id, widget);
        });
      }
    } catch (error) {
      console.error('Failed to load widgets:', error);
    }
  }

  /**
   * Save widgets to storage
   */
  private async saveWidgets(): Promise<void> {
    try {
      const widgets = Array.from(this.widgets.values());
      localStorage.setItem('widgets', JSON.stringify(widgets));
    } catch (error) {
      console.error('Failed to save widgets:', error);
    }
  }

  /**
   * Reset to default widgets
   */
  async resetToDefaults(): Promise<void> {
    // Clear existing widgets
    this.widgets.clear();
    this.widgetData.clear();
    this.refreshTimers.forEach(timer => clearInterval(timer));
    this.refreshTimers.clear();

    // Add default widgets
    for (const widget of this.defaultWidgets) {
      await this.addWidget(widget);
    }
  }

  /**
   * Get widget statistics
   */
  getWidgetStats(): { total: number; visible: number; types: Record<WidgetType, number> } {
    const widgets = Array.from(this.widgets.values());
    const types: Record<WidgetType, number> = {} as Record<WidgetType, number>;

    widgets.forEach(widget => {
      types[widget.type] = (types[widget.type] || 0) + 1;
    });

    return {
      total: widgets.length,
      visible: widgets.filter(w => w.isVisible).length,
      types
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.refreshTimers.forEach(timer => clearInterval(timer));
    this.refreshTimers.clear();
  }

  /**
   * Execute widget action
   */
  async executeWidgetAction(widgetId: string): Promise<boolean> {
    const widget = this.widgets.get(widgetId);
    if (!widget || !widget.isVisible) return false;

    try {
      // Provide haptic feedback
      await Haptics.impact({ style: ImpactStyle.Light });

      switch (widget.type) {
        case 'expense_summary':
          return await this.handleExpenseSummaryAction(widget.config);
        case 'budget_progress':
          return await this.handleBudgetProgressAction(widget.config);
        case 'recent_transactions':
          return await this.handleRecentTransactionsAction(widget.config);
        case 'tax_calculator':
          return await this.handleTaxCalculatorAction(widget.config);
        case 'savings_goal':
          return await this.handleSavingsGoalAction(widget.config);
        case 'spending_chart':
          return await this.handleSpendingChartAction(widget.config);
        case 'currency_converter':
          return await this.handleCurrencyConverterAction(widget.config);
        case 'quick_actions':
          return await this.handleQuickActionsAction(widget.config);
        default:
          console.warn(`Unknown widget action for type: ${widget.type}`);
          return false;
      }
    } catch (error) {
      console.error('Failed to execute widget action:', error);
      return false;
    }
  }

  /**
   * Handle expense summary action
   */
  private async handleExpenseSummaryAction(config: WidgetConfig): Promise<boolean> {
    try {
      // Trigger expense form modal
      const event = new CustomEvent('openExpenseForm', {
        detail: { mode: 'add' }
      });
      window.dispatchEvent(event);
      
      // Show notification
      await LocalNotifications.schedule({
        notifications: [{
          title: 'Add Expense',
          body: 'Expense form opened',
          id: 1
        }]
      });
      
      return true;
    } catch (error) {
      console.error('Failed to handle expense summary action:', error);
      return false;
    }
  }

  /**
   * Handle budget progress action
   */
  private async handleBudgetProgressAction(config: WidgetConfig): Promise<boolean> {
    try {
      // Trigger budget form modal
      const event = new CustomEvent('openBudgetForm', {
        detail: { mode: 'add' }
      });
      window.dispatchEvent(event);
      
      // Show notification
      await LocalNotifications.schedule({
        notifications: [{
          title: 'Add Budget',
          body: 'Budget form opened',
          id: 2
        }]
      });
      
      return true;
    } catch (error) {
      console.error('Failed to handle budget progress action:', error);
      return false;
    }
  }

  /**
   * Handle recent transactions action
   */
  private async handleRecentTransactionsAction(config: WidgetConfig): Promise<boolean> {
    try {
      // Trigger transaction list modal
      const event = new CustomEvent('openTransactionList');
      window.dispatchEvent(event);
      
      // Show notification
      await LocalNotifications.schedule({
        notifications: [{
          title: 'Recent Transactions',
          body: 'Transaction list opened',
          id: 3
        }]
      });
      
      return true;
    } catch (error) {
      console.error('Failed to handle recent transactions action:', error);
      return false;
    }
  }

  /**
   * Handle tax calculator action
   */
  private async handleTaxCalculatorAction(config: WidgetConfig): Promise<boolean> {
    try {
      // Trigger tax calculator modal
      const event = new CustomEvent('openTaxCalculator');
      window.dispatchEvent(event);
      
      // Show notification
      await LocalNotifications.schedule({
        notifications: [{
          title: 'Tax Calculator',
          body: 'Tax calculator opened',
          id: 4
        }]
      });
      
      return true;
    } catch (error) {
      console.error('Failed to handle tax calculator action:', error);
      return false;
    }
  }

  /**
   * Handle savings goal action
   */
  private async handleSavingsGoalAction(config: WidgetConfig): Promise<boolean> {
    try {
      // Trigger savings goal modal
      const event = new CustomEvent('openSavingsGoal');
      window.dispatchEvent(event);
      
      // Show notification
      await LocalNotifications.schedule({
        notifications: [{
          title: 'Savings Goal',
          body: 'Savings goal opened',
          id: 5
        }]
      });
      
      return true;
    } catch (error) {
      console.error('Failed to handle savings goal action:', error);
      return false;
    }
  }

  /**
   * Handle spending chart action
   */
  private async handleSpendingChartAction(config: WidgetConfig): Promise<boolean> {
    try {
      // Trigger spending chart modal
      const event = new CustomEvent('openSpendingChart');
      window.dispatchEvent(event);
      
      // Show notification
      await LocalNotifications.schedule({
        notifications: [{
          title: 'Spending Chart',
          body: 'Spending chart opened',
          id: 6
        }]
      });
      
      return true;
    } catch (error) {
      console.error('Failed to handle spending chart action:', error);
      return false;
    }
  }

  /**
   * Handle currency converter action
   */
  private async handleCurrencyConverterAction(config: WidgetConfig): Promise<boolean> {
    try {
      // Trigger currency converter modal
      const event = new CustomEvent('openCurrencyConverter');
      window.dispatchEvent(event);
      
      // Show notification
      await LocalNotifications.schedule({
        notifications: [{
          title: 'Currency Converter',
          body: 'Currency converter opened',
          id: 7
        }]
      });
      
      return true;
    } catch (error) {
      console.error('Failed to handle currency converter action:', error);
      return false;
    }
  }

  /**
   * Handle quick actions action
   */
  private async handleQuickActionsAction(config: WidgetConfig): Promise<boolean> {
    try {
      const quickActions = await this.getQuickActions();
      const action = quickActions.find(q => q.id === 'add-expense'); // Example action

      if (action) {
        // Simulate action execution
        return await this.handleAddExpense();
      }
      
      return false;
    } catch (error) {
      console.error('Failed to handle quick actions action:', error);
      return false;
    }
  }

  /**
   * Get quick actions
   */
  async getQuickActions(): Promise<QuickAction[]> {
    return [
      {
        id: 'add-expense',
        title: 'Add Expense',
        description: 'Quickly add a new expense',
        icon: 'receipt',
        color: '#ef4444',
        action: 'add_expense',
        shortcut: 'Ctrl+E'
      },
      {
        id: 'add-budget',
        title: 'Add Budget',
        description: 'Quickly add a new budget',
        icon: 'target',
        color: '#10b981',
        action: 'add_budget',
        shortcut: 'Ctrl+B'
      },
      {
        id: 'calculate-tax',
        title: 'Calculate Tax',
        description: 'Calculate tax for your income',
        icon: 'calculator',
        color: '#8b5cf6',
        action: 'calculate_tax',
        shortcut: 'Ctrl+T'
      },
      {
        id: 'search',
        title: 'Search',
        description: 'Search through expenses',
        icon: 'search',
        color: '#6b7280',
        action: 'search',
        shortcut: 'Ctrl+F'
      },
      {
        id: 'export',
        title: 'Export Data',
        description: 'Export your financial data',
        icon: 'download',
        color: '#dc2626',
        action: 'export_data',
        requiresAuth: true
      }
    ];
  }

  /**
   * Execute quick action
   */
  async executeQuickAction(actionId: string): Promise<boolean> {
    try {
      switch (actionId) {
        case 'add-expense':
          return await this.handleAddExpense();
        case 'add-budget':
          return await this.handleAddBudget();
        case 'calculate-tax':
          return await this.handleCalculateTax();
        case 'search':
          return await this.handleSearch();
        case 'export':
          return await this.handleExportData();
        default:
          console.warn(`Unknown quick action: ${actionId}`);
          return false;
      }
    } catch (error) {
      console.error('Failed to execute quick action:', error);
      return false;
    }
  }

  /**
   * Handle search action
   */
  private async handleSearch(): Promise<boolean> {
    try {
      const searchService = AdvancedSearchService.getInstance();
      await searchService.initialize();
      
      // Trigger search modal
      const event = new CustomEvent('openSearchModal');
      window.dispatchEvent(event);
      
      return true;
    } catch (error) {
      console.error('Failed to handle search:', error);
      return false;
    }
  }

  /**
   * Handle add expense action
   */
  private async handleAddExpense(): Promise<boolean> {
    try {
      // Trigger expense form modal
      const event = new CustomEvent('openExpenseForm', {
        detail: { mode: 'add' }
      });
      window.dispatchEvent(event);
      
      // Show notification
      await LocalNotifications.schedule({
        notifications: [{
          title: 'Add Expense',
          body: 'Expense form opened',
          id: 1
        }]
      });
      
      return true;
    } catch (error) {
      console.error('Failed to handle add expense:', error);
      return false;
    }
  }

  /**
   * Handle add budget action
   */
  private async handleAddBudget(): Promise<boolean> {
    try {
      // Trigger budget form modal
      const event = new CustomEvent('openBudgetForm', {
        detail: { mode: 'add' }
      });
      window.dispatchEvent(event);
      
      // Show notification
      await LocalNotifications.schedule({
        notifications: [{
          title: 'Add Budget',
          body: 'Budget form opened',
          id: 2
        }]
      });
      
      return true;
    } catch (error) {
      console.error('Failed to handle add budget:', error);
      return false;
    }
  }

  /**
   * Handle calculate tax action
   */
  private async handleCalculateTax(): Promise<boolean> {
    try {
      // Trigger tax calculator modal
      const event = new CustomEvent('openTaxCalculator');
      window.dispatchEvent(event);
      
      // Show notification
      await LocalNotifications.schedule({
        notifications: [{
          title: 'Tax Calculator',
          body: 'Tax calculator opened',
          id: 4
        }]
      });
      
      return true;
    } catch (error) {
      console.error('Failed to handle calculate tax:', error);
      return false;
    }
  }

  /**
   * Handle export data action
   */
  private async handleExportData(): Promise<boolean> {
    try {
      const exportService = DataExportService.getInstance();
      await exportService.initialize();
      
      const result = await exportService.exportData({
        format: 'csv',
        includeMetadata: true
      });
      
      if (result.success) {
        await LocalNotifications.schedule({
          notifications: [{
            title: 'Data Export',
            body: 'Data exported successfully',
            id: 3
          }]
        });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to handle export data:', error);
      return false;
    }
  }

  /**
   * Get widget templates
   */
  getWidgetTemplates(): Omit<Widget, 'id' | 'position' | 'order'>[] {
    return [
      {
        type: 'expense_summary',
        title: 'Expense Summary',
        description: 'Display your total expenses and monthly average',
        icon: 'receipt',
        color: '#ef4444',
        size: { width: 300, height: 200 },
        config: { refreshInterval: 300000 },
        isVisible: true,
        isPinned: false
      },
      {
        type: 'budget_progress',
        title: 'Budget Progress',
        description: 'Track your monthly budget utilization',
        icon: 'trending_up',
        color: '#10b981',
        size: { width: 300, height: 200 },
        config: { refreshInterval: 600000 },
        isVisible: true,
        isPinned: false
      },
      {
        type: 'recent_transactions',
        title: 'Recent Transactions',
        description: 'View your latest transactions',
        icon: 'history',
        color: '#6b7280',
        size: { width: 300, height: 250 },
        config: { refreshInterval: 300000, maxItems: 5 },
        isVisible: true,
        isPinned: false
      },
      {
        type: 'tax_calculator',
        title: 'Tax Calculator',
        description: 'Calculate your tax based on income',
        icon: 'calculate',
        color: '#8b5cf6',
        size: { width: 300, height: 200 },
        config: { refreshInterval: 600000 },
        isVisible: true,
        isPinned: false
      },
      {
        type: 'savings_goal',
        title: 'Savings Goal',
        description: 'Set and track your savings goals',
        icon: 'savings',
        color: '#059669',
        size: { width: 300, height: 200 },
        config: { refreshInterval: 300000 },
        isVisible: true,
        isPinned: false
      },
      {
        type: 'spending_chart',
        title: 'Spending Chart',
        description: 'Visualize your spending patterns',
        icon: 'bar_chart',
        color: '#f59e0b',
        size: { width: 300, height: 200 },
        config: { refreshInterval: 600000 },
        isVisible: true,
        isPinned: false
      },
      {
        type: 'currency_converter',
        title: 'Currency Converter',
        description: 'Convert currencies easily',
        icon: 'swap_horiz',
        color: '#3b82f6',
        size: { width: 300, height: 200 },
        config: { refreshInterval: 300000 },
        isVisible: true,
        isPinned: false
      },
      {
        type: 'quick_actions',
        title: 'Quick Actions',
        description: 'Access frequently used actions',
        icon: 'bolt',
        color: '#dc2626',
        size: { width: 300, height: 200 },
        config: { refreshInterval: 300000 },
        isVisible: true,
        isPinned: false
      }
    ];
  }
} 