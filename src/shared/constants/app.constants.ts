/**
 * Application Constants
 * 
 * This module defines shared constants used across the application.
 * These constants ensure consistency and maintainability throughout the codebase.
 */

/**
 * Application information
 */
export const APP_INFO = {
  NAME: 'Financial Assistant',
  VERSION: '1.0.0',
  DESCRIPTION: 'A comprehensive financial management application',
  AUTHOR: 'Financial Assistant Team',
  REPOSITORY: 'https://github.com/financial-assistant',
  SUPPORT_EMAIL: 'support@financial-assistant.com',
} as const;

/**
 * Environment constants
 */
export const ENVIRONMENT = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TEST: 'test',
} as const;

/**
 * API constants
 */
export const API = {
  BASE_URL: process.env.VITE_API_BASE_URL || 'http://localhost:3000',
  TIMEOUT: 30000, // 30 seconds
  RETRIES: 3,
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 100,
    REQUESTS_PER_HOUR: 1000,
  },
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REGISTER: '/auth/register',
      REFRESH: '/auth/refresh',
      RESET_PASSWORD: '/auth/reset-password',
      VERIFY_EMAIL: '/auth/verify-email',
    },
    USERS: {
      PROFILE: '/users/profile',
      PREFERENCES: '/users/preferences',
      STATISTICS: '/users/statistics',
    },
    EXPENSES: {
      LIST: '/expenses',
      CREATE: '/expenses',
      UPDATE: '/expenses/:id',
      DELETE: '/expenses/:id',
      ANALYTICS: '/expenses/analytics',
      CATEGORIES: '/expenses/categories',
    },
    TAX: {
      CALCULATE: '/tax/calculate',
      SCENARIOS: '/tax/scenarios',
      OPTIMIZATION: '/tax/optimization',
      BRACKETS: '/tax/brackets',
    },
    BUDGETS: {
      LIST: '/budgets',
      CREATE: '/budgets',
      UPDATE: '/budgets/:id',
      DELETE: '/budgets/:id',
      ALERTS: '/budgets/alerts',
    },
  },
} as const;

/**
 * Database constants
 */
export const DATABASE = {
  TABLES: {
    USERS: 'users',
    USER_PROFILES: 'user_profiles',
    USER_PREFERENCES: 'user_preferences',
    EXPENSES: 'expenses',
    BUDGETS: 'budgets',
    BUDGET_ALERTS: 'budget_alerts',
    TAX_CALCULATIONS: 'tax_calculations',
    TAX_SCENARIOS: 'tax_scenarios',
  },
  ROW_LIMIT: 1000,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Authentication constants
 */
export const AUTH = {
  TOKEN_KEY: 'financial_assistant_token',
  REFRESH_TOKEN_KEY: 'financial_assistant_refresh_token',
  USER_KEY: 'financial_assistant_user',
  TOKEN_EXPIRY: 24 * 60 * 60 * 1000, // 24 hours
  REFRESH_TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
} as const;

/**
 * UI constants
 */
export const UI = {
  THEME: {
    LIGHT: 'light',
    DARK: 'dark',
    AUTO: 'auto',
  },
  BREAKPOINTS: {
    XS: 0,
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536,
  },
  ANIMATION: {
    DURATION: {
      FAST: 150,
      NORMAL: 300,
      SLOW: 500,
    },
    EASING: {
      LINEAR: 'linear',
      EASE_IN: 'ease-in',
      EASE_OUT: 'ease-out',
      EASE_IN_OUT: 'ease-in-out',
    },
  },
  Z_INDEX: {
    DROPDOWN: 1000,
    STICKY: 1020,
    FIXED: 1030,
    MODAL_BACKDROP: 1040,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070,
  },
} as const;

/**
 * Validation constants
 */
export const VALIDATION = {
  EMAIL: {
    MAX_LENGTH: 254,
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
  },
  NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z\s\-'\.]+$/,
  },
  PHONE: {
    PATTERN: /^[\+]?[1-9][\d]{0,15}$/,
  },
  URL: {
    PATTERN: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  },
} as const;

/**
 * Currency constants
 */
export const CURRENCY = {
  DEFAULT: 'USD',
  SUPPORTED: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR', 'BRL', 'ZAR'],
  PRECISION: {
    USD: 2,
    EUR: 2,
    GBP: 2,
    CAD: 2,
    AUD: 2,
    JPY: 0,
    CHF: 2,
    CNY: 2,
    INR: 2,
    BRL: 2,
    ZAR: 2,
  },
} as const;

/**
 * Date and time constants
 */
export const DATE_TIME = {
  FORMATS: {
    DATE: 'YYYY-MM-DD',
    TIME: 'HH:mm:ss',
    DATETIME: 'YYYY-MM-DD HH:mm:ss',
    ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
    DISPLAY: 'MMM DD, YYYY',
    DISPLAY_TIME: 'MMM DD, YYYY HH:mm',
    SHORT: 'MM/DD/YYYY',
    MONTH_YEAR: 'MMMM YYYY',
  },
  TIMEZONES: {
    UTC: 'UTC',
    EST: 'America/New_York',
    CST: 'America/Chicago',
    MST: 'America/Denver',
    PST: 'America/Los_Angeles',
  },
  DURATIONS: {
    SECOND: 1000,
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000,
    WEEK: 7 * 24 * 60 * 60 * 1000,
    MONTH: 30 * 24 * 60 * 60 * 1000,
    YEAR: 365 * 24 * 60 * 60 * 1000,
  },
} as const;

/**
 * File upload constants
 */
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: {
    IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    SPREADSHEET: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  },
  MAX_FILES: 10,
  CHUNK_SIZE: 1024 * 1024, // 1MB chunks
} as const;

/**
 * Notification constants
 */
export const NOTIFICATION = {
  TYPES: {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info',
  },
  DURATION: {
    SHORT: 3000,
    NORMAL: 5000,
    LONG: 10000,
  },
  POSITIONS: {
    TOP_LEFT: 'top-left',
    TOP_RIGHT: 'top-right',
    BOTTOM_LEFT: 'bottom-left',
    BOTTOM_RIGHT: 'bottom-right',
    TOP_CENTER: 'top-center',
    BOTTOM_CENTER: 'bottom-center',
  },
} as const;

/**
 * Error constants
 */
export const ERROR = {
  CODES: {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
    CONFLICT_ERROR: 'CONFLICT_ERROR',
    RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
    NETWORK_ERROR: 'NETWORK_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  },
  MESSAGES: {
    GENERIC: 'An unexpected error occurred. Please try again.',
    NETWORK: 'Network error. Please check your connection.',
    VALIDATION: 'Please check your input and try again.',
    AUTHENTICATION: 'Please log in to continue.',
    AUTHORIZATION: 'You do not have permission to perform this action.',
    NOT_FOUND: 'The requested resource was not found.',
    SERVER: 'Server error. Please try again later.',
  },
} as const;

/**
 * Cache constants
 */
export const CACHE = {
  TTL: {
    SHORT: 5 * 60 * 1000, // 5 minutes
    NORMAL: 30 * 60 * 1000, // 30 minutes
    LONG: 24 * 60 * 60 * 1000, // 24 hours
    PERMANENT: 0, // No expiration
  },
  KEYS: {
    USER_PROFILE: 'user_profile',
    USER_PREFERENCES: 'user_preferences',
    EXPENSES: 'expenses',
    TAX_CALCULATIONS: 'tax_calculations',
    CURRENCY_RATES: 'currency_rates',
  },
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  THEME: 'financial_assistant_theme',
  LANGUAGE: 'financial_assistant_language',
  CURRENCY: 'financial_assistant_currency',
  USER_PREFERENCES: 'financial_assistant_user_preferences',
  EXPENSE_FILTERS: 'financial_assistant_expense_filters',
  TAX_CALCULATIONS: 'financial_assistant_tax_calculations',
  OFFLINE_DATA: 'financial_assistant_offline_data',
} as const;

/**
 * Feature flags
 */
export const FEATURE_FLAGS = {
  TAX_CALCULATOR: 'tax_calculator',
  EXPENSE_ANALYTICS: 'expense_analytics',
  BUDGET_TRACKING: 'budget_tracking',
  MOBILE_APP: 'mobile_app',
  DARK_MODE: 'dark_mode',
  MULTI_CURRENCY: 'multi_currency',
  EXPORT_FEATURES: 'export_features',
  NOTIFICATIONS: 'notifications',
} as const;

/**
 * Performance constants
 */
export const PERFORMANCE = {
  DEBOUNCE_DELAY: 300,
  THROTTLE_DELAY: 100,
  LAZY_LOAD_OFFSET: 100,
  IMAGE_LAZY_LOAD_OFFSET: 200,
  ANIMATION_FRAME_RATE: 60,
} as const;

/**
 * Security constants
 */
export const SECURITY = {
  PASSWORD_SALT_ROUNDS: 12,
  JWT_SECRET_MIN_LENGTH: 32,
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  CSRF_TOKEN_LENGTH: 32,
} as const; 