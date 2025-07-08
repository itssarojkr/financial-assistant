/**
 * ExpenseCategory - Enum for categorizing expenses
 * 
 * This enum defines the standard categories for expenses in the application,
 * providing a consistent way to classify and analyze spending patterns.
 */

export enum ExpenseCategory {
  // Basic living expenses
  FOOD_AND_DRINKS = 'food_and_drinks',
  TRANSPORTATION = 'transportation',
  HOUSING = 'housing',
  UTILITIES = 'utilities',
  HEALTHCARE = 'healthcare',
  EDUCATION = 'education',
  
  // Personal expenses
  CLOTHING = 'clothing',
  ENTERTAINMENT = 'entertainment',
  TRAVEL = 'travel',
  PERSONAL_CARE = 'personal_care',
  HOBBIES = 'hobbies',
  
  // Financial expenses
  INSURANCE = 'insurance',
  TAXES = 'taxes',
  INVESTMENTS = 'investments',
  DEBT_PAYMENT = 'debt_payment',
  
  // Business expenses
  BUSINESS = 'business',
  PROFESSIONAL_DEVELOPMENT = 'professional_development',
  
  // Technology
  TECHNOLOGY = 'technology',
  SUBSCRIPTIONS = 'subscriptions',
  
  // Miscellaneous
  GIFTS = 'gifts',
  CHARITY = 'charity',
  OTHER = 'other',
}

/**
 * Expense category metadata for display and analysis
 */
export interface ExpenseCategoryMetadata {
  id: ExpenseCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
  isTaxDeductible: boolean;
  defaultBudget?: number;
}

/**
 * Expense category metadata mapping
 */
export const EXPENSE_CATEGORY_METADATA: Record<ExpenseCategory, ExpenseCategoryMetadata> = {
  [ExpenseCategory.FOOD_AND_DRINKS]: {
    id: ExpenseCategory.FOOD_AND_DRINKS,
    name: 'Food & Drinks',
    description: 'Groceries, restaurants, cafes, and food delivery',
    icon: '🍽️',
    color: '#FF6B6B',
    isTaxDeductible: false,
    defaultBudget: 500,
  },
  [ExpenseCategory.TRANSPORTATION]: {
    id: ExpenseCategory.TRANSPORTATION,
    name: 'Transportation',
    description: 'Fuel, public transport, ride-sharing, and vehicle maintenance',
    icon: '🚗',
    color: '#4ECDC4',
    isTaxDeductible: false,
    defaultBudget: 300,
  },
  [ExpenseCategory.HOUSING]: {
    id: ExpenseCategory.HOUSING,
    name: 'Housing',
    description: 'Rent, mortgage, property taxes, and home maintenance',
    icon: '🏠',
    color: '#45B7D1',
    isTaxDeductible: false,
    defaultBudget: 1500,
  },
  [ExpenseCategory.UTILITIES]: {
    id: ExpenseCategory.UTILITIES,
    name: 'Utilities',
    description: 'Electricity, water, gas, internet, and phone bills',
    icon: '⚡',
    color: '#96CEB4',
    isTaxDeductible: false,
    defaultBudget: 200,
  },
  [ExpenseCategory.HEALTHCARE]: {
    id: ExpenseCategory.HEALTHCARE,
    name: 'Healthcare',
    description: 'Medical expenses, prescriptions, and health insurance',
    icon: '🏥',
    color: '#FFEAA7',
    isTaxDeductible: true,
    defaultBudget: 300,
  },
  [ExpenseCategory.EDUCATION]: {
    id: ExpenseCategory.EDUCATION,
    name: 'Education',
    description: 'Tuition, books, courses, and educational materials',
    icon: '📚',
    color: '#DDA0DD',
    isTaxDeductible: true,
    defaultBudget: 400,
  },
  [ExpenseCategory.CLOTHING]: {
    id: ExpenseCategory.CLOTHING,
    name: 'Clothing',
    description: 'Clothes, shoes, accessories, and personal items',
    icon: '👕',
    color: '#FFB6C1',
    isTaxDeductible: false,
    defaultBudget: 200,
  },
  [ExpenseCategory.ENTERTAINMENT]: {
    id: ExpenseCategory.ENTERTAINMENT,
    name: 'Entertainment',
    description: 'Movies, games, events, and leisure activities',
    icon: '🎬',
    color: '#98D8C8',
    isTaxDeductible: false,
    defaultBudget: 150,
  },
  [ExpenseCategory.TRAVEL]: {
    id: ExpenseCategory.TRAVEL,
    name: 'Travel',
    description: 'Vacations, business trips, and travel expenses',
    icon: '✈️',
    color: '#F7DC6F',
    isTaxDeductible: false,
    defaultBudget: 600,
  },
  [ExpenseCategory.PERSONAL_CARE]: {
    id: ExpenseCategory.PERSONAL_CARE,
    name: 'Personal Care',
    description: 'Haircuts, spa, beauty products, and wellness',
    icon: '💅',
    color: '#BB8FCE',
    isTaxDeductible: false,
    defaultBudget: 100,
  },
  [ExpenseCategory.HOBBIES]: {
    id: ExpenseCategory.HOBBIES,
    name: 'Hobbies',
    description: 'Sports, crafts, collections, and recreational activities',
    icon: '🎨',
    color: '#85C1E9',
    isTaxDeductible: false,
    defaultBudget: 100,
  },
  [ExpenseCategory.INSURANCE]: {
    id: ExpenseCategory.INSURANCE,
    name: 'Insurance',
    description: 'Life, health, auto, home, and other insurance policies',
    icon: '🛡️',
    color: '#F8C471',
    isTaxDeductible: false,
    defaultBudget: 250,
  },
  [ExpenseCategory.TAXES]: {
    id: ExpenseCategory.TAXES,
    name: 'Taxes',
    description: 'Income tax, property tax, and other tax payments',
    icon: '💰',
    color: '#82E0AA',
    isTaxDeductible: false,
    defaultBudget: 0, // Varies by income
  },
  [ExpenseCategory.INVESTMENTS]: {
    id: ExpenseCategory.INVESTMENTS,
    name: 'Investments',
    description: 'Stocks, bonds, retirement contributions, and savings',
    icon: '📈',
    color: '#F1948A',
    isTaxDeductible: false,
    defaultBudget: 500,
  },
  [ExpenseCategory.DEBT_PAYMENT]: {
    id: ExpenseCategory.DEBT_PAYMENT,
    name: 'Debt Payment',
    description: 'Credit card payments, loans, and debt reduction',
    icon: '💳',
    color: '#85C1E9',
    isTaxDeductible: false,
    defaultBudget: 400,
  },
  [ExpenseCategory.BUSINESS]: {
    id: ExpenseCategory.BUSINESS,
    name: 'Business',
    description: 'Business-related expenses and professional costs',
    icon: '💼',
    color: '#D7BDE2',
    isTaxDeductible: true,
    defaultBudget: 300,
  },
  [ExpenseCategory.PROFESSIONAL_DEVELOPMENT]: {
    id: ExpenseCategory.PROFESSIONAL_DEVELOPMENT,
    name: 'Professional Development',
    description: 'Training, certifications, and career advancement',
    icon: '🎓',
    color: '#F8C471',
    isTaxDeductible: true,
    defaultBudget: 200,
  },
  [ExpenseCategory.TECHNOLOGY]: {
    id: ExpenseCategory.TECHNOLOGY,
    name: 'Technology',
    description: 'Electronics, software, and tech accessories',
    icon: '💻',
    color: '#A9CCE3',
    isTaxDeductible: false,
    defaultBudget: 150,
  },
  [ExpenseCategory.SUBSCRIPTIONS]: {
    id: ExpenseCategory.SUBSCRIPTIONS,
    name: 'Subscriptions',
    description: 'Streaming services, software, and recurring payments',
    icon: '📱',
    color: '#FAD7A0',
    isTaxDeductible: false,
    defaultBudget: 50,
  },
  [ExpenseCategory.GIFTS]: {
    id: ExpenseCategory.GIFTS,
    name: 'Gifts',
    description: 'Gifts for family, friends, and special occasions',
    icon: '🎁',
    color: '#F1948A',
    isTaxDeductible: false,
    defaultBudget: 100,
  },
  [ExpenseCategory.CHARITY]: {
    id: ExpenseCategory.CHARITY,
    name: 'Charity',
    description: 'Donations, charitable giving, and community support',
    icon: '🤝',
    color: '#82E0AA',
    isTaxDeductible: true,
    defaultBudget: 100,
  },
  [ExpenseCategory.OTHER]: {
    id: ExpenseCategory.OTHER,
    name: 'Other',
    description: 'Miscellaneous expenses not covered by other categories',
    icon: '📦',
    color: '#BDC3C7',
    isTaxDeductible: false,
    defaultBudget: 100,
  },
};

/**
 * Helper functions for working with expense categories
 */
export class ExpenseCategoryHelper {
  /**
   * Gets metadata for a category
   */
  static getMetadata(category: ExpenseCategory): ExpenseCategoryMetadata {
    return EXPENSE_CATEGORY_METADATA[category];
  }

  /**
   * Gets all categories
   */
  static getAllCategories(): ExpenseCategory[] {
    return Object.values(ExpenseCategory);
  }

  /**
   * Gets tax-deductible categories
   */
  static getTaxDeductibleCategories(): ExpenseCategory[] {
    return this.getAllCategories().filter(
      category => EXPENSE_CATEGORY_METADATA[category].isTaxDeductible
    );
  }

  /**
   * Gets categories by budget range
   */
  static getCategoriesByBudgetRange(minBudget: number, maxBudget: number): ExpenseCategory[] {
    return this.getAllCategories().filter(category => {
      const metadata = EXPENSE_CATEGORY_METADATA[category];
      return metadata.defaultBudget && 
             metadata.defaultBudget >= minBudget && 
             metadata.defaultBudget <= maxBudget;
    });
  }

  /**
   * Validates if a category exists
   */
  static isValidCategory(category: string): category is ExpenseCategory {
    return Object.values(ExpenseCategory).includes(category as ExpenseCategory);
  }
} 