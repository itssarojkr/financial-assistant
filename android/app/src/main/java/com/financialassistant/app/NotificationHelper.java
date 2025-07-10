package com.financialassistant.app;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.os.Build;
import android.util.Log;

/**
 * Helper class for managing notifications in the Android app
 * Supports new notification types for validation and calculation events
 */
public class NotificationHelper {
    private static final String TAG = "NotificationHelper";

    // Notification channel IDs
    public static final String CHANNEL_BUDGET_ALERTS = "budget-alerts";
    public static final String CHANNEL_CALCULATIONS = "calculations";
    public static final String CHANNEL_VALIDATION = "validation";
    public static final String CHANNEL_REMINDERS = "reminders";

    /**
     * Create notification channels for Android 8.0+
     * @param context Android context
     */
    public static void createNotificationChannels(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager notificationManager = 
                (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);

            if (notificationManager != null) {
                // Budget alerts channel
                NotificationChannel budgetChannel = new NotificationChannel(
                    CHANNEL_BUDGET_ALERTS,
                    "Budget Alerts",
                    NotificationManager.IMPORTANCE_HIGH
                );
                budgetChannel.setDescription("Notifications for budget alerts and spending limits");
                budgetChannel.enableVibration(true);
                notificationManager.createNotificationChannel(budgetChannel);

                // Calculations channel
                NotificationChannel calculationsChannel = new NotificationChannel(
                    CHANNEL_CALCULATIONS,
                    "Calculations",
                    NotificationManager.IMPORTANCE_DEFAULT
                );
                calculationsChannel.setDescription("Notifications for tax calculations and saves");
                calculationsChannel.enableVibration(true);
                notificationManager.createNotificationChannel(calculationsChannel);

                // Validation channel
                NotificationChannel validationChannel = new NotificationChannel(
                    CHANNEL_VALIDATION,
                    "Validation",
                    NotificationManager.IMPORTANCE_LOW
                );
                validationChannel.setDescription("Notifications for validation errors and warnings");
                validationChannel.enableVibration(false);
                notificationManager.createNotificationChannel(validationChannel);

                // Reminders channel
                NotificationChannel remindersChannel = new NotificationChannel(
                    CHANNEL_REMINDERS,
                    "Reminders",
                    NotificationManager.IMPORTANCE_DEFAULT
                );
                remindersChannel.setDescription("Notifications for expense reminders and weekly reviews");
                remindersChannel.enableVibration(true);
                notificationManager.createNotificationChannel(remindersChannel);
            }
        }
    }

    /**
     * Log notification event for debugging
     * @param channelId The notification channel ID
     * @param title The notification title
     * @param message The notification message
     */
    public static void logNotification(String channelId, String title, String message) {
        Log.d(TAG, "Notification sent - Channel: " + channelId + 
              ", Title: " + title + ", Message: " + message);
    }

    /**
     * Check if notifications are enabled for a channel
     * @param context Android context
     * @param channelId The notification channel ID
     * @return true if notifications are enabled, false otherwise
     */
    public static boolean areNotificationsEnabled(Context context, String channelId) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager notificationManager = 
                (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            
            if (notificationManager != null) {
                NotificationChannel channel = notificationManager.getNotificationChannel(channelId);
                return channel != null && channel.getImportance() != NotificationManager.IMPORTANCE_NONE;
            }
        }
        return true; // Default to enabled for older Android versions
    }
} 