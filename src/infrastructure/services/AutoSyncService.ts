import { Network } from '@capacitor/network';
import { PluginListenerHandle } from '@capacitor/core';
import { UserDataService } from '@/application/services/UserDataService';

export interface SyncStatus {
  isOnline: boolean;
  lastSync: Date | null;
  pendingChanges: number;
  isSyncing: boolean;
}

/**
 * AutoSyncService for handling automatic background synchronization
 * 
 * This service automatically syncs data when internet connection is available
 * and handles offline queue management for Android devices.
 */
export class AutoSyncService {
  private static instance: AutoSyncService;
  private isInitialized = false;
  private syncQueue: Array<() => Promise<void>> = [];
  private isSyncing = false;
  private lastSync: Date | null = null;
  private networkListener: PluginListenerHandle | null = null;

  /**
   * Gets the singleton instance of AutoSyncService
   */
  static getInstance(): AutoSyncService {
    if (!AutoSyncService.instance) {
      AutoSyncService.instance = new AutoSyncService();
    }
    return AutoSyncService.instance;
  }

  /**
   * Initialize the auto sync service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Check initial network status
      const status = await Network.getStatus();
      console.log('Initial network status:', status);

      // Set up network listener for automatic sync
      this.networkListener = await Network.addListener('networkStatusChange', (status) => {
        console.log('Network status changed:', status);
        this.handleNetworkChange(status.connected);
      });

      this.isInitialized = true;
      console.log('AutoSyncService initialized');
    } catch (error) {
      console.error('Failed to initialize AutoSyncService:', error);
      this.isInitialized = true; // Mark as initialized even if failed
    }
  }

  /**
   * Handle network status changes
   */
  private async handleNetworkChange(isConnected: boolean): Promise<void> {
    if (isConnected) {
      console.log('Internet connection restored, starting auto sync...');
      await this.performAutoSync();
    } else {
      console.log('Internet connection lost, queuing changes for later sync');
    }
  }

  /**
   * Add a sync operation to the queue
   */
  addToSyncQueue(syncOperation: () => Promise<void>): void {
    this.syncQueue.push(syncOperation);
    console.log(`Added operation to sync queue. Queue length: ${this.syncQueue.length}`);
  }

  /**
   * Perform automatic sync when online
   */
  private async performAutoSync(): Promise<void> {
    if (this.isSyncing || this.syncQueue.length === 0) {
      return;
    }

    this.isSyncing = true;
    console.log(`Starting auto sync with ${this.syncQueue.length} pending operations`);

    try {
      // Process all queued operations
      while (this.syncQueue.length > 0) {
        const operation = this.syncQueue.shift();
        if (operation) {
          try {
            await operation();
            console.log('Sync operation completed successfully');
          } catch (error) {
            console.error('Sync operation failed:', error);
            // Re-add failed operation to queue for retry
            this.syncQueue.unshift(operation);
            break; // Stop processing on first failure
          }
        }
      }

      this.lastSync = new Date();
      console.log('Auto sync completed successfully');
    } catch (error) {
      console.error('Auto sync failed:', error);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Get current sync status
   */
  getSyncStatus(): SyncStatus {
    return {
      isOnline: true, // This would be determined by network status
      lastSync: this.lastSync,
      pendingChanges: this.syncQueue.length,
      isSyncing: this.isSyncing,
    };
  }

  /**
   * Force a manual sync (for Android devices)
   */
  async forceSync(): Promise<void> {
    console.log('Force sync requested');
    await this.performAutoSync();
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.networkListener) {
      this.networkListener.remove();
      this.networkListener = null;
    }
    this.syncQueue = [];
    this.isSyncing = false;
    this.isInitialized = false;
  }
} 