import { ExpenseItem, BudgetItem, AlertItem } from '../../application/services/UserDataService';

export interface SyncItem {
  id: string;
  type: 'expense' | 'budget' | 'alert';
  action: 'create' | 'update' | 'delete';
  data: ExpenseItem | BudgetItem | AlertItem;
  timestamp: number;
  userId: string;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingItems: number;
  syncInProgress: boolean;
}

export interface SyncResult {
  success: boolean;
  syncedItems: number;
  errors: string[];
}

export class OfflineSyncService {
  private static instance: OfflineSyncService;
  private syncQueue: SyncItem[] = [];
  private isOnline = navigator.onLine;
  private syncInProgress = false;
  private lastSync: Date | null = null;

  static getInstance(): OfflineSyncService {
    if (!OfflineSyncService.instance) {
      OfflineSyncService.instance = new OfflineSyncService();
    }
    return OfflineSyncService.instance;
  }

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // Load existing sync queue from localStorage
    this.loadSyncQueue();

    // Set up online/offline event listeners
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));

    // Attempt initial sync if online
    if (this.isOnline) {
      this.syncPendingItems();
    }
  }

  /**
   * Add item to sync queue
   */
  addToSyncQueue(item: Omit<SyncItem, 'timestamp'>): void {
    const syncItem: SyncItem = {
      ...item,
      timestamp: Date.now()
    };

    this.syncQueue.push(syncItem);
    this.saveSyncQueue();

    // Attempt sync if online
    if (this.isOnline && !this.syncInProgress) {
      this.syncPendingItems();
    }
  }

  /**
   * Sync all pending items
   */
  async syncPendingItems(): Promise<SyncResult> {
    if (this.syncInProgress || !this.isOnline || this.syncQueue.length === 0) {
      return {
        success: true,
        syncedItems: 0,
        errors: []
      };
    }

    this.syncInProgress = true;
    const errors: string[] = [];
    let syncedItems = 0;

    try {
      // Sort queue by timestamp to maintain order
      this.syncQueue.sort((a, b) => a.timestamp - b.timestamp);

      for (const item of this.syncQueue) {
        try {
          await this.syncItem(item);
          syncedItems++;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Failed to sync ${item.type} ${item.id}: ${errorMessage}`);
        }
      }

      // Remove successfully synced items
      this.syncQueue = this.syncQueue.filter(item => 
        !errors.some(error => error.includes(item.id))
      );
      this.saveSyncQueue();

      this.lastSync = new Date();
      this.saveLastSync();

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`Sync failed: ${errorMessage}`);
    } finally {
      this.syncInProgress = false;
    }

    return {
      success: errors.length === 0,
      syncedItems,
      errors
    };
  }

  /**
   * Sync individual item
   */
  private async syncItem(item: SyncItem): Promise<void> {
    switch (item.type) {
      case 'expense':
        await this.syncExpense(item);
        break;
      case 'budget':
        await this.syncBudget(item);
        break;
      case 'alert':
        await this.syncAlert(item);
        break;
      default:
        throw new Error(`Unknown item type: ${item.type}`);
    }
  }

  /**
   * Sync expense item
   */
  private async syncExpense(item: SyncItem): Promise<void> {
    const expense = item.data as ExpenseItem;
    
    switch (item.action) {
      case 'create':
        await this.createExpense(expense);
        break;
      case 'update':
        await this.updateExpense(expense);
        break;
      case 'delete':
        await this.deleteExpense(expense.id);
        break;
    }
  }

  /**
   * Sync budget item
   */
  private async syncBudget(item: SyncItem): Promise<void> {
    const budget = item.data as BudgetItem;
    
    switch (item.action) {
      case 'create':
        await this.createBudget(budget);
        break;
      case 'update':
        await this.updateBudget(budget);
        break;
      case 'delete':
        await this.deleteBudget(budget.id);
        break;
    }
  }

  /**
   * Sync alert item
   */
  private async syncAlert(item: SyncItem): Promise<void> {
    const alert = item.data as AlertItem;
    
    switch (item.action) {
      case 'create':
        await this.createAlert(alert);
        break;
      case 'update':
        await this.updateAlert(alert);
        break;
      case 'delete':
        await this.deleteAlert(alert.id);
        break;
    }
  }

  /**
   * Create expense (placeholder - implement with your API)
   */
  private async createExpense(expense: ExpenseItem): Promise<void> {
    // Implement with your actual API call
    console.log('Creating expense:', expense);
  }

  /**
   * Update expense (placeholder - implement with your API)
   */
  private async updateExpense(expense: ExpenseItem): Promise<void> {
    // Implement with your actual API call
    console.log('Updating expense:', expense);
  }

  /**
   * Delete expense (placeholder - implement with your API)
   */
  private async deleteExpense(expenseId: string): Promise<void> {
    // Implement with your actual API call
    console.log('Deleting expense:', expenseId);
  }

  /**
   * Create budget (placeholder - implement with your API)
   */
  private async createBudget(budget: BudgetItem): Promise<void> {
    // Implement with your actual API call
    console.log('Creating budget:', budget);
  }

  /**
   * Update budget (placeholder - implement with your API)
   */
  private async updateBudget(budget: BudgetItem): Promise<void> {
    // Implement with your actual API call
    console.log('Updating budget:', budget);
  }

  /**
   * Delete budget (placeholder - implement with your API)
   */
  private async deleteBudget(budgetId: string): Promise<void> {
    // Implement with your actual API call
    console.log('Deleting budget:', budgetId);
  }

  /**
   * Create alert (placeholder - implement with your API)
   */
  private async createAlert(alert: AlertItem): Promise<void> {
    // Implement with your actual API call
    console.log('Creating alert:', alert);
  }

  /**
   * Update alert (placeholder - implement with your API)
   */
  private async updateAlert(alert: AlertItem): Promise<void> {
    // Implement with your actual API call
    console.log('Updating alert:', alert);
  }

  /**
   * Delete alert (placeholder - implement with your API)
   */
  private async deleteAlert(alertId: string): Promise<void> {
    // Implement with your actual API call
    console.log('Deleting alert:', alertId);
  }

  /**
   * Handle online event
   */
  private handleOnline(): void {
    this.isOnline = true;
    this.syncPendingItems();
  }

  /**
   * Handle offline event
   */
  private handleOffline(): void {
    this.isOnline = false;
  }

  /**
   * Get sync status
   */
  getSyncStatus(): SyncStatus {
    return {
      isOnline: this.isOnline,
      lastSync: this.lastSync,
      pendingItems: this.syncQueue.length,
      syncInProgress: this.syncInProgress
    };
  }

  /**
   * Get pending items count
   */
  getPendingItemsCount(): number {
    return this.syncQueue.length;
  }

  /**
   * Clear sync queue
   */
  clearSyncQueue(): void {
    this.syncQueue = [];
    this.saveSyncQueue();
  }

  /**
   * Load sync queue from localStorage
   */
  private loadSyncQueue(): void {
    try {
      const stored = localStorage.getItem('offline-sync-queue');
      if (stored) {
        this.syncQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error);
      this.syncQueue = [];
    }
  }

  /**
   * Save sync queue to localStorage
   */
  private saveSyncQueue(): void {
    try {
      localStorage.setItem('offline-sync-queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Failed to save sync queue:', error);
    }
  }

  /**
   * Load last sync time from localStorage
   */
  private loadLastSync(): void {
    try {
      const stored = localStorage.getItem('offline-sync-last');
      if (stored) {
        this.lastSync = new Date(stored);
      }
    } catch (error) {
      console.error('Failed to load last sync time:', error);
      this.lastSync = null;
    }
  }

  /**
   * Save last sync time to localStorage
   */
  private saveLastSync(): void {
    try {
      if (this.lastSync) {
        localStorage.setItem('offline-sync-last', this.lastSync.toISOString());
      }
    } catch (error) {
      console.error('Failed to save last sync time:', error);
    }
  }

  /**
   * Force sync (for manual sync button)
   */
  async forceSync(): Promise<SyncResult> {
    return this.syncPendingItems();
  }

  /**
   * Check if sync is needed
   */
  isSyncNeeded(): boolean {
    return this.syncQueue.length > 0 && this.isOnline;
  }

  /**
   * Get sync queue items (for debugging)
   */
  getSyncQueue(): SyncItem[] {
    return [...this.syncQueue];
  }
}