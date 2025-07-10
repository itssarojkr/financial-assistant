package com.financialassistant.app;

import android.content.Context;
import android.util.Log;

/**
 * Helper class for handling validation logic in the Android app
 * Supports the new save calculation validation functionality
 */
public class ValidationHelper {
    private static final String TAG = "ValidationHelper";

    /**
     * Validation error types
     */
    public enum ValidationError {
        COUNTRY_REQUIRED,
        STATE_REQUIRED,
        SALARY_REQUIRED,
        CURRENCY_REQUIRED,
        TAX_CALCULATION_INCOMPLETE,
        TAKEHOME_CALCULATION_INCOMPLETE,
        NO_CALCULATION_TO_SAVE
    }

    /**
     * Check if all required fields are filled for saving a calculation
     * @param country The selected country
     * @param state The selected state/province
     * @param salary The salary amount
     * @param currency The currency
     * @param totalTax The calculated total tax
     * @param takeHomeSalary The calculated take-home salary
     * @return ValidationError if validation fails, null if valid
     */
    public static ValidationError validateCalculationForSave(
            String country,
            String state,
            double salary,
            String currency,
            double totalTax,
            double takeHomeSalary) {
        
        if (country == null || country.trim().isEmpty()) {
            return ValidationError.COUNTRY_REQUIRED;
        }
        
        if (state == null || state.trim().isEmpty()) {
            return ValidationError.STATE_REQUIRED;
        }
        
        if (salary <= 0) {
            return ValidationError.SALARY_REQUIRED;
        }
        
        if (currency == null || currency.trim().isEmpty()) {
            return ValidationError.CURRENCY_REQUIRED;
        }
        
        if (totalTax < 0) {
            return ValidationError.TAX_CALCULATION_INCOMPLETE;
        }
        
        if (takeHomeSalary < 0) {
            return ValidationError.TAKEHOME_CALCULATION_INCOMPLETE;
        }
        
        return null; // Validation passed
    }

    /**
     * Get user-friendly error message for validation error
     * @param context Android context
     * @param error The validation error
     * @return User-friendly error message
     */
    public static String getErrorMessage(Context context, ValidationError error) {
        switch (error) {
            case COUNTRY_REQUIRED:
                return context.getString(R.string.validation_country_required);
            case STATE_REQUIRED:
                return context.getString(R.string.validation_state_required);
            case SALARY_REQUIRED:
                return context.getString(R.string.validation_salary_required);
            case CURRENCY_REQUIRED:
                return context.getString(R.string.validation_currency_required);
            case TAX_CALCULATION_INCOMPLETE:
                return context.getString(R.string.validation_tax_calculation_incomplete);
            case TAKEHOME_CALCULATION_INCOMPLETE:
                return context.getString(R.string.validation_takehome_calculation_incomplete);
            case NO_CALCULATION_TO_SAVE:
                return context.getString(R.string.validation_no_calculation_to_save);
            default:
                return "Validation error occurred";
        }
    }

    /**
     * Log validation error for debugging
     * @param error The validation error
     * @param details Additional details about the validation failure
     */
    public static void logValidationError(ValidationError error, String details) {
        Log.w(TAG, "Validation failed: " + error.name() + " - " + details);
    }
} 