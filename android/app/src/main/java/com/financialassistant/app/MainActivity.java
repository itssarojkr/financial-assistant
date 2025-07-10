package com.financialassistant.app;

import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.Plugin;

import java.util.ArrayList;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Initialize notification channels
        NotificationHelper.createNotificationChannels(this);
        
        // Initialize AutoSync service
        AutoSyncService.getInstance().initialize(this);
        
        // Handle deep links
        handleIntent(getIntent());
    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        handleIntent(intent);
    }

    private void handleIntent(Intent intent) {
        if (intent != null && intent.getData() != null) {
            String data = intent.getData().toString();
            Log.d(TAG, "Received deep link: " + data);
            
            // Handle different deep link scenarios
            if (data.contains("financial-dashboard")) {
                // Navigate to financial dashboard
                bridge.eval("window.location.href = '/dashboard'", null);
                NotificationHelper.logNotification(
                    NotificationHelper.CHANNEL_CALCULATIONS,
                    "Navigation",
                    "Navigated to Financial Dashboard"
                );
            } else if (data.contains("tax-calculator")) {
                // Navigate to tax calculator
                bridge.eval("window.location.href = '/tax-calculator'", null);
                NotificationHelper.logNotification(
                    NotificationHelper.CHANNEL_CALCULATIONS,
                    "Navigation",
                    "Navigated to Tax Calculator"
                );
            } else if (data.contains("save-calculation")) {
                // Trigger save calculation
                bridge.eval("window.dispatchEvent(new CustomEvent('save-calculation'))", null);
                NotificationHelper.logNotification(
                    NotificationHelper.CHANNEL_CALCULATIONS,
                    "Save Calculation",
                    "Save calculation triggered"
                );
            } else if (data.contains("add-expense")) {
                // Navigate to add expense
                bridge.eval("window.location.href = '/dashboard?tab=expenses'", null);
                NotificationHelper.logNotification(
                    NotificationHelper.CHANNEL_REMINDERS,
                    "Add Expense",
                    "Navigated to Add Expense"
                );
            } else if (data.contains("budget-overview")) {
                // Navigate to budget overview
                bridge.eval("window.location.href = '/dashboard?tab=budgets'", null);
                NotificationHelper.logNotification(
                    NotificationHelper.CHANNEL_BUDGET_ALERTS,
                    "Budget Overview",
                    "Navigated to Budget Overview"
                );
            } else if (data.contains("add-budget")) {
                // Navigate to add budget
                bridge.eval("window.location.href = '/dashboard?tab=budgets&action=add'", null);
                NotificationHelper.logNotification(
                    NotificationHelper.CHANNEL_BUDGET_ALERTS,
                    "Add Budget",
                    "Navigated to Add Budget"
                );
            } else if (data.contains("add-alert")) {
                // Navigate to add alert
                bridge.eval("window.location.href = '/dashboard?tab=alerts&action=add'", null);
                NotificationHelper.logNotification(
                    NotificationHelper.CHANNEL_BUDGET_ALERTS,
                    "Add Alert",
                    "Navigated to Add Alert"
                );
            } else if (data.contains("calculation-id=")) {
                // Handle calculation-specific navigation
                String calculationId = extractCalculationId(data);
                if (calculationId != null) {
                    bridge.eval("window.location.href = '/dashboard?calculation=" + calculationId + "'", null);
                    NotificationHelper.logNotification(
                        NotificationHelper.CHANNEL_CALCULATIONS,
                        "Load Calculation",
                        "Loading calculation: " + calculationId
                    );
                }
            } else if (data.contains("force-sync")) {
                // Trigger force sync
                AutoSyncService.getInstance().forceSync();
                NotificationHelper.logNotification(
                    NotificationHelper.CHANNEL_CALCULATIONS,
                    "Force Sync",
                    "Manual sync triggered"
                );
            }
        }
    }

    /**
     * Extract calculation ID from deep link
     */
    private String extractCalculationId(String data) {
        try {
            if (data.contains("calculation-id=")) {
                int startIndex = data.indexOf("calculation-id=") + 14;
                int endIndex = data.indexOf("&", startIndex);
                if (endIndex == -1) {
                    endIndex = data.length();
                }
                return data.substring(startIndex, endIndex);
            }
        } catch (Exception e) {
            Log.e(TAG, "Error extracting calculation ID", e);
        }
        return null;
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        
        // Handle permission results for camera, storage, etc.
        Log.d(TAG, "Permission result received: " + requestCode);
        
        // Log permission results for debugging
        for (int i = 0; i < permissions.length; i++) {
            String permission = permissions[i];
            int result = grantResults[i];
            Log.d(TAG, "Permission: " + permission + " - Result: " + 
                  (result == android.content.pm.PackageManager.PERMISSION_GRANTED ? "GRANTED" : "DENIED"));
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        
        // Check if we need to trigger any background operations
        checkBackgroundOperations();
    }

    @Override
    protected void onPause() {
        super.onPause();
        
        // Save any pending data
        savePendingData();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        
        // Shutdown AutoSync service
        AutoSyncService.getInstance().shutdown();
    }

    /**
     * Check and perform background operations
     */
    private void checkBackgroundOperations() {
        // Check for triggered alerts
        checkTriggeredAlerts();
        
        // Check sync status
        AutoSyncService.SyncStatus status = AutoSyncService.getInstance().getSyncStatus();
        if (status.error != null) {
            Log.w(TAG, "Sync error detected: " + status.error);
        }
    }

    /**
     * Check for triggered alerts and send notifications
     */
    private void checkTriggeredAlerts() {
        // This would typically check the database for triggered alerts
        // For now, we'll just log the operation
        Log.d(TAG, "Checking for triggered alerts");
        
        // Mock alert check - in real implementation, this would query the database
        // and send notifications for triggered alerts
    }

    /**
     * Save any pending data
     */
    private void savePendingData() {
        // This would typically save any pending changes to local storage
        // For now, we'll just log the operation
        Log.d(TAG, "Saving pending data");
    }
}
