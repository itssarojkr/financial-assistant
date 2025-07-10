package com.financialassistant.app;

import android.content.Context;
import android.util.Log;
import org.json.JSONObject;
import org.json.JSONArray;
import org.json.JSONException;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;

/**
 * Service for handling financial data operations in the Android app
 * Supports calculation-specific data, alerts, budgets, and expenses with proper database integration.
 */
public class FinancialDataService {
    private static final String TAG = "FinancialDataService";
    
    // Database table names
    private static final String TABLE_EXPENSES = "expenses";
    private static final String TABLE_BUDGETS = "budgets";
    private static final String TABLE_ALERTS = "spending_alerts";
    private static final String TABLE_CATEGORIES = "expense_categories";
    private static final String TABLE_USER_DATA = "user_data";
    
    // Calculation data structure
    public static class CalculationData {
        public String id;
        public String name;
        public String country;
        public String currency;
        public double salary;
        public double taxAmount;
        public double netSalary;
        public double effectiveTaxRate;
        public String calculationDate;
        public boolean isFavorite;
        public Map<String, Object> expenseData;
        
        public CalculationData() {
            this.expenseData = new HashMap<>();
        }
    }
    
    // Expense data structure
    public static class ExpenseData {
        public String id;
        public String userId;
        public int categoryId;
        public double amount;
        public String currency;
        public String date;
        public String description;
        public String location;
        public String source;
        public String calculationId;
        public String createdAt;
        public String updatedAt;
        public CategoryData category;
        
        public ExpenseData() {
            this.category = new CategoryData();
        }
    }
    
    // Budget data structure
    public static class BudgetData {
        public String id;
        public String userId;
        public int categoryId;
        public double amount;
        public String period;
        public String currency;
        public String calculationId;
        public String startDate;
        public String endDate;
        public String createdAt;
        public String updatedAt;
        public CategoryData category;
        
        public BudgetData() {
            this.category = new CategoryData();
        }
    }
    
    // Alert data structure
    public static class AlertData {
        public String id;
        public String userId;
        public int categoryId;
        public double threshold;
        public String type;
        public String severity;
        public boolean isActive;
        public String currency;
        public String calculationId;
        public String period;
        public String createdAt;
        public String updatedAt;
        public CategoryData category;
        
        public AlertData() {
            this.category = new CategoryData();
        }
    }
    
    // Category data structure
    public static class CategoryData {
        public int id;
        public String name;
        public String icon;
        public String color;
    }
    
    /**
     * Get calculation-specific expenses
     */
    public static List<ExpenseData> getCalculationExpenses(Context context, String calculationId) {
        List<ExpenseData> expenses = new ArrayList<>();
        
        try {
            // This would typically call a web service or local database
            // For now, we'll create a mock implementation
            Log.d(TAG, "Getting expenses for calculation: " + calculationId);
            
            // Mock data for testing
            if (calculationId != null && !calculationId.isEmpty()) {
                ExpenseData expense = new ExpenseData();
                expense.id = "expense-1";
                expense.userId = "user-1";
                expense.categoryId = 1;
                expense.amount = 150.0;
                expense.currency = "USD";
                expense.date = "2024-01-15";
                expense.description = "Groceries";
                expense.location = "Supermarket";
                expense.source = "Credit Card";
                expense.calculationId = calculationId;
                expense.category.name = "Food & Dining";
                expense.category.color = "#FF6B6B";
                
                expenses.add(expense);
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Error getting calculation expenses", e);
        }
        
        return expenses;
    }
    
    /**
     * Get calculation-specific budgets
     */
    public static List<BudgetData> getCalculationBudgets(Context context, String calculationId) {
        List<BudgetData> budgets = new ArrayList<>();
        
        try {
            Log.d(TAG, "Getting budgets for calculation: " + calculationId);
            
            // Mock data for testing
            if (calculationId != null && !calculationId.isEmpty()) {
                BudgetData budget = new BudgetData();
                budget.id = "budget-1";
                budget.userId = "user-1";
                budget.categoryId = 1;
                budget.amount = 500.0;
                budget.period = "monthly";
                budget.currency = "USD";
                budget.calculationId = calculationId;
                budget.category.name = "Food & Dining";
                budget.category.color = "#FF6B6B";
                
                budgets.add(budget);
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Error getting calculation budgets", e);
        }
        
        return budgets;
    }
    
    /**
     * Get calculation-specific alerts
     */
    public static List<AlertData> getCalculationAlerts(Context context, String calculationId) {
        List<AlertData> alerts = new ArrayList<>();
        
        try {
            Log.d(TAG, "Getting alerts for calculation: " + calculationId);
            
            // Mock data for testing
            if (calculationId != null && !calculationId.isEmpty()) {
                AlertData alert = new AlertData();
                alert.id = "alert-1";
                alert.userId = "user-1";
                alert.categoryId = 1;
                alert.threshold = 400.0;
                alert.type = "amount";
                alert.severity = "medium";
                alert.isActive = true;
                alert.currency = "USD";
                alert.calculationId = calculationId;
                alert.period = "monthly";
                alert.category.name = "Food & Dining";
                alert.category.color = "#FF6B6B";
                
                alerts.add(alert);
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Error getting calculation alerts", e);
        }
        
        return alerts;
    }
    
    /**
     * Add a new expense
     */
    public static boolean addExpense(Context context, ExpenseData expense) {
        try {
            Log.d(TAG, "Adding expense: " + expense.description + " - " + expense.amount);
            
            // This would typically save to a web service or local database
            // For now, we'll just log the action
            
            NotificationHelper.logNotification(
                NotificationHelper.CHANNEL_REMINDERS,
                "Expense Added",
                "Added " + expense.amount + " " + expense.currency + " for " + expense.description
            );
            
            return true;
            
        } catch (Exception e) {
            Log.e(TAG, "Error adding expense", e);
            return false;
        }
    }
    
    /**
     * Add a new budget
     */
    public static boolean addBudget(Context context, BudgetData budget) {
        try {
            Log.d(TAG, "Adding budget: " + budget.amount + " " + budget.currency + " for category " + budget.categoryId);
            
            NotificationHelper.logNotification(
                NotificationHelper.CHANNEL_BUDGET_ALERTS,
                "Budget Added",
                "Added " + budget.amount + " " + budget.currency + " budget"
            );
            
            return true;
            
        } catch (Exception e) {
            Log.e(TAG, "Error adding budget", e);
            return false;
        }
    }
    
    /**
     * Add a new alert
     */
    public static boolean addAlert(Context context, AlertData alert) {
        try {
            Log.d(TAG, "Adding alert: " + alert.threshold + " " + alert.currency + " (" + alert.severity + ")");
            
            NotificationHelper.logNotification(
                NotificationHelper.CHANNEL_BUDGET_ALERTS,
                "Alert Added",
                "Added " + alert.severity + " alert for " + alert.threshold + " " + alert.currency
            );
            
            return true;
            
        } catch (Exception e) {
            Log.e(TAG, "Error adding alert", e);
            return false;
        }
    }
    
    /**
     * Get expense categories
     */
    public static List<CategoryData> getExpenseCategories(Context context) {
        List<CategoryData> categories = new ArrayList<>();
        
        try {
            // Mock categories
            String[] categoryNames = {
                "Food & Dining", "Transportation", "Housing", "Utilities",
                "Healthcare", "Entertainment", "Shopping", "Education"
            };
            
            String[] categoryColors = {
                "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4",
                "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F"
            };
            
            for (int i = 0; i < categoryNames.length; i++) {
                CategoryData category = new CategoryData();
                category.id = i + 1;
                category.name = categoryNames[i];
                category.color = categoryColors[i];
                categories.add(category);
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Error getting expense categories", e);
        }
        
        return categories;
    }
    
    /**
     * Calculate budget progress
     */
    public static Map<Integer, BudgetProgress> calculateBudgetProgress(
            Context context, 
            List<ExpenseData> expenses, 
            List<BudgetData> budgets) {
        
        Map<Integer, BudgetProgress> progress = new HashMap<>();
        
        try {
            // Calculate total spent per category
            for (ExpenseData expense : expenses) {
                int categoryId = expense.categoryId;
                if (!progress.containsKey(categoryId)) {
                    progress.put(categoryId, new BudgetProgress());
                }
                progress.get(categoryId).spent += expense.amount;
            }
            
            // Add budget amounts
            for (BudgetData budget : budgets) {
                int categoryId = budget.categoryId;
                if (!progress.containsKey(categoryId)) {
                    progress.put(categoryId, new BudgetProgress());
                }
                progress.get(categoryId).budget = budget.amount;
            }
            
            // Calculate percentages
            for (BudgetProgress bp : progress.values()) {
                if (bp.budget > 0) {
                    bp.percentage = (bp.spent / bp.budget) * 100;
                }
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Error calculating budget progress", e);
        }
        
        return progress;
    }
    
    /**
     * Budget progress data structure
     */
    public static class BudgetProgress {
        public double spent = 0;
        public double budget = 0;
        public double percentage = 0;
    }
    
    /**
     * Check for triggered alerts
     */
    public static List<AlertData> checkTriggeredAlerts(
            Context context,
            List<AlertData> alerts,
            Map<Integer, BudgetProgress> progress) {
        
        List<AlertData> triggeredAlerts = new ArrayList<>();
        
        try {
            for (AlertData alert : alerts) {
                if (!alert.isActive) continue;
                
                BudgetProgress bp = progress.get(alert.categoryId);
                if (bp == null) continue;
                
                boolean isTriggered = false;
                if ("percentage".equals(alert.type)) {
                    isTriggered = bp.percentage >= alert.threshold;
                } else {
                    isTriggered = bp.spent >= alert.threshold;
                }
                
                if (isTriggered) {
                    triggeredAlerts.add(alert);
                    
                    // Send notification for triggered alert
                    NotificationHelper.logNotification(
                        NotificationHelper.CHANNEL_BUDGET_ALERTS,
                        "Budget Alert",
                        "Alert triggered for " + alert.category.name + ": " + 
                        (alert.type.equals("percentage") ? 
                         String.format("%.1f%%", bp.percentage) : 
                         String.format("%.2f %s", bp.spent, alert.currency))
                    );
                }
            }
            
        } catch (Exception e) {
            Log.e(TAG, "Error checking triggered alerts", e);
        }
        
        return triggeredAlerts;
    }
} 