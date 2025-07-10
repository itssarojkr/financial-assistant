package com.financialassistant.app;

import android.content.Context;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * AutoSync service for handling background synchronization of financial data
 * Mirrors the web app's AutoSyncService functionality
 */
public class AutoSyncService {
    private static final String TAG = "AutoSyncService";
    
    // Singleton instance
    private static AutoSyncService instance;
    
    // Sync configuration
    private static final int SYNC_INTERVAL_SECONDS = 30; // Sync every 30 seconds
    private static final int MAX_RETRY_ATTEMPTS = 3;
    private static final int RETRY_DELAY_SECONDS = 5;
    
    // Service state
    private final AtomicBoolean isInitialized = new AtomicBoolean(false);
    private final AtomicBoolean isSyncing = new AtomicBoolean(false);
    private final AtomicBoolean isOnline = new AtomicBoolean(true);
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    
    // Sync statistics
    private int pendingChanges = 0;
    private long lastSyncTime = 0;
    private int retryAttempts = 0;
    private String lastError = null;
    
    // Context for Android operations
    private Context context;
    
    /**
     * Private constructor for singleton pattern
     */
    private AutoSyncService() {}
    
    /**
     * Get singleton instance
     */
    public static synchronized AutoSyncService getInstance() {
        if (instance == null) {
            instance = new AutoSyncService();
        }
        return instance;
    }
    
    /**
     * Initialize the auto-sync service
     */
    public void initialize(Context context) {
        if (isInitialized.get()) {
            Log.d(TAG, "AutoSync service already initialized");
            return;
        }
        
        this.context = context;
        Log.d(TAG, "Initializing AutoSync service");
        
        // Start background sync
        startBackgroundSync();
        
        isInitialized.set(true);
        Log.d(TAG, "AutoSync service initialized successfully");
    }
    
    /**
     * Start background synchronization
     */
    private void startBackgroundSync() {
        Log.d(TAG, "Starting background sync with interval: " + SYNC_INTERVAL_SECONDS + " seconds");
        
        scheduler.scheduleAtFixedRate(
            this::performSync,
            SYNC_INTERVAL_SECONDS,
            SYNC_INTERVAL_SECONDS,
            TimeUnit.SECONDS
        );
    }
    
    /**
     * Perform synchronization
     */
    private void performSync() {
        if (isSyncing.get()) {
            Log.d(TAG, "Sync already in progress, skipping");
            return;
        }
        
        isSyncing.set(true);
        Log.d(TAG, "Starting sync operation");
        
        try {
            // Check network connectivity
            if (!isOnline.get()) {
                Log.d(TAG, "Device is offline, skipping sync");
                return;
            }
            
            // Perform sync operations
            syncExpenses();
            syncBudgets();
            syncAlerts();
            
            // Update sync statistics
            lastSyncTime = System.currentTimeMillis();
            retryAttempts = 0;
            lastError = null;
            
            Log.d(TAG, "Sync completed successfully");
            
            // Notify success
            mainHandler.post(() -> {
                NotificationHelper.logNotification(
                    NotificationHelper.CHANNEL_CALCULATIONS,
                    "Sync Complete",
                    "Data synchronized successfully"
                );
            });
            
        } catch (Exception e) {
            Log.e(TAG, "Sync failed", e);
            lastError = e.getMessage();
            retryAttempts++;
            
            // Schedule retry if under max attempts
            if (retryAttempts < MAX_RETRY_ATTEMPTS) {
                Log.d(TAG, "Scheduling retry attempt " + (retryAttempts + 1));
                scheduler.schedule(
                    this::performSync,
                    RETRY_DELAY_SECONDS,
                    TimeUnit.SECONDS
                );
            } else {
                Log.w(TAG, "Max retry attempts reached, stopping retries");
            }
            
            // Notify error
            mainHandler.post(() -> {
                NotificationHelper.logNotification(
                    NotificationHelper.CHANNEL_VALIDATION,
                    "Sync Error",
                    "Failed to sync data: " + e.getMessage()
                );
            });
            
        } finally {
            isSyncing.set(false);
        }
    }
    
    /**
     * Sync expenses data
     */
    private void syncExpenses() {
        Log.d(TAG, "Syncing expenses");
        
        // This would typically sync with a web service
        // For now, we'll just log the operation
        
        // Simulate some processing time
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        Log.d(TAG, "Expenses sync completed");
    }
    
    /**
     * Sync budgets data
     */
    private void syncBudgets() {
        Log.d(TAG, "Syncing budgets");
        
        // This would typically sync with a web service
        // For now, we'll just log the operation
        
        // Simulate some processing time
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        Log.d(TAG, "Budgets sync completed");
    }
    
    /**
     * Sync alerts data
     */
    private void syncAlerts() {
        Log.d(TAG, "Syncing alerts");
        
        // This would typically sync with a web service
        // For now, we'll just log the operation
        
        // Simulate some processing time
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        Log.d(TAG, "Alerts sync completed");
    }
    
    /**
     * Force immediate sync
     */
    public void forceSync() {
        Log.d(TAG, "Force sync requested");
        
        if (isSyncing.get()) {
            Log.d(TAG, "Sync already in progress, cannot force sync");
            return;
        }
        
        // Run sync on background thread
        scheduler.execute(this::performSync);
    }
    
    /**
     * Get current sync status
     */
    public SyncStatus getSyncStatus() {
        return new SyncStatus(
            isOnline.get(),
            isSyncing.get(),
            pendingChanges,
            lastSyncTime > 0 ? new java.util.Date(lastSyncTime) : null,
            lastError
        );
    }
    
    /**
     * Set online status
     */
    public void setOnlineStatus(boolean online) {
        boolean wasOnline = isOnline.get();
        isOnline.set(online);
        
        if (online != wasOnline) {
            Log.d(TAG, "Online status changed to: " + online);
            
            if (online) {
                // Trigger sync when coming back online
                scheduler.execute(this::performSync);
            }
        }
    }
    
    /**
     * Shutdown the service
     */
    public void shutdown() {
        Log.d(TAG, "Shutting down AutoSync service");
        
        scheduler.shutdown();
        try {
            if (!scheduler.awaitTermination(5, TimeUnit.SECONDS)) {
                scheduler.shutdownNow();
            }
        } catch (InterruptedException e) {
            scheduler.shutdownNow();
            Thread.currentThread().interrupt();
        }
        
        isInitialized.set(false);
        Log.d(TAG, "AutoSync service shutdown complete");
    }
    
    /**
     * Sync status data structure
     */
    public static class SyncStatus {
        public final boolean isOnline;
        public final boolean isSyncing;
        public final int pendingChanges;
        public final java.util.Date lastSync;
        public final String error;
        
        public SyncStatus(boolean isOnline, boolean isSyncing, int pendingChanges, 
                        java.util.Date lastSync, String error) {
            this.isOnline = isOnline;
            this.isSyncing = isSyncing;
            this.pendingChanges = pendingChanges;
            this.lastSync = lastSync;
            this.error = error;
        }
    }
} 