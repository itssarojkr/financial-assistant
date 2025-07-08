import { RepositoryFactory } from '@/infrastructure/database/repositories/RepositoryFactory';
import { UserService } from './UserService';
import { ExpenseService } from './ExpenseService';
import { TaxCalculationService } from './TaxCalculationService';
import { BudgetService } from './BudgetService';
import { AlertService } from './AlertService';
import { AnalyticsService } from './AnalyticsService';
import { UserRepository } from '@/infrastructure/database/repositories/UserRepository';
import { ExpenseRepository } from '@/infrastructure/database/repositories/ExpenseRepository';
import { BudgetRepository } from '@/infrastructure/database/repositories/BudgetRepository';
import { AlertRepository } from '@/infrastructure/database/repositories/AlertRepository';

/**
 * Service factory for managing and providing access to all application services
 * 
 * This class implements the Factory pattern to create and manage service
 * instances, ensuring proper dependency injection and singleton management.
 */
export class ServiceFactory {
  private static instance: ServiceFactory;
  private repositoryFactory: RepositoryFactory;
  
  // Service instances
  private userService: UserService | null = null;
  private expenseService: ExpenseService | null = null;
  private taxCalculationService: TaxCalculationService | null = null;
  private budgetService: BudgetService | null = null;
  private alertService: AlertService | null = null;
  private analyticsService: AnalyticsService | null = null;

  private constructor() {
    this.repositoryFactory = RepositoryFactory.getInstance();
  }

  /**
   * Gets the singleton instance of ServiceFactory
   */
  static getInstance(): ServiceFactory {
    if (!ServiceFactory.instance) {
      ServiceFactory.instance = new ServiceFactory();
    }
    return ServiceFactory.instance;
  }

  /**
   * Initializes the service factory
   */
  async initialize(): Promise<void> {
    try {
      // Ensure repository factory is initialized
      if (!this.repositoryFactory.isInitialized()) {
        await this.repositoryFactory.initialize();
      }
      console.log('Service factory initialized successfully');
    } catch (error) {
      console.error('Failed to initialize service factory:', error);
      throw new Error(`Service factory initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets the user service instance
   */
  getUserService(): UserService {
    if (!this.repositoryFactory.isInitialized()) {
      throw new Error('Service factory not initialized. Call initialize() first.');
    }

    if (!this.userService) {
      const userRepository = this.repositoryFactory.getUserRepository();
      this.userService = new UserService(userRepository);
    }

    return this.userService;
  }

  /**
   * Gets the expense service instance
   */
  getExpenseService(): ExpenseService {
    if (!this.repositoryFactory.isInitialized()) {
      throw new Error('Service factory not initialized. Call initialize() first.');
    }

    if (!this.expenseService) {
      try {
        const expenseRepository = this.repositoryFactory.getExpenseRepository();
        this.expenseService = new ExpenseService(expenseRepository);
      } catch (error) {
        throw new Error('Expense service not available: Expense repository not implemented');
      }
    }

    return this.expenseService;
  }

  /**
   * Gets the tax calculation service instance
   */
  getTaxCalculationService(): TaxCalculationService {
    if (!this.repositoryFactory.isInitialized()) {
      throw new Error('Service factory not initialized. Call initialize() first.');
    }

    if (!this.taxCalculationService) {
      const userService = this.getUserService();
      this.taxCalculationService = new TaxCalculationService(userService);
    }

    return this.taxCalculationService;
  }

  /**
   * Gets the budget service instance
   */
  getBudgetService(
    budgetRepository: BudgetRepository,
    expenseService: ExpenseService
  ): BudgetService {
    if (!this.repositoryFactory.isInitialized()) {
      throw new Error('Service factory not initialized. Call initialize() first.');
    }

    if (!this.budgetService) {
      this.budgetService = new BudgetService(budgetRepository, expenseService);
    }

    return this.budgetService;
  }

  /**
   * Gets the alert service instance
   */
  getAlertService(alertRepository: AlertRepository): AlertService {
    if (!this.repositoryFactory.isInitialized()) {
      throw new Error('Service factory not initialized. Call initialize() first.');
    }

    if (!this.alertService) {
      this.alertService = new AlertService(alertRepository);
    }

    return this.alertService;
  }

  /**
   * Gets the analytics service instance
   */
  getAnalyticsService(
    expenseService: ExpenseService,
    budgetService: BudgetService
  ): AnalyticsService {
    if (!this.repositoryFactory.isInitialized()) {
      throw new Error('Service factory not initialized. Call initialize() first.');
    }

    if (!this.analyticsService) {
      this.analyticsService = new AnalyticsService(expenseService, budgetService);
    }

    return this.analyticsService;
  }

  /**
   * Gets all available services
   */
  getAllServices(): {
    userService: UserService;
    expenseService?: ExpenseService;
    taxCalculationService: TaxCalculationService;
    budgetService?: BudgetService;
    alertService?: AlertService;
    analyticsService?: AnalyticsService;
  } {
    if (!this.repositoryFactory.isInitialized()) {
      throw new Error('Service factory not initialized. Call initialize() first.');
    }

    const services: unknown = {
      userService: this.getUserService(),
      taxCalculationService: this.getTaxCalculationService(),
    };

    try {
      services.expenseService = this.getExpenseService();
    } catch (error) {
      // Expense service not available
    }

    try {
      services.budgetService = this.getBudgetService(this.repositoryFactory.getBudgetRepository(), this.getExpenseService());
    } catch (error) {
      // Budget service not available
    }

    try {
      services.alertService = this.getAlertService(this.repositoryFactory.getAlertRepository());
    } catch (error) {
      // Alert service not available
    }

    try {
      services.analyticsService = this.getAnalyticsService(this.getExpenseService(), this.getBudgetService(this.repositoryFactory.getBudgetRepository(), this.getExpenseService()));
    } catch (error) {
      // Analytics service not available
    }

    return services as {
      userService: UserService;
      expenseService?: ExpenseService;
      taxCalculationService: TaxCalculationService;
      budgetService?: BudgetService;
      alertService?: AlertService;
      analyticsService?: AnalyticsService;
    };
  }

  /**
   * Checks if the factory is initialized
   */
  isInitialized(): boolean {
    return this.repositoryFactory.isInitialized();
  }

  /**
   * Gets factory status information
   */
  getStatus(): {
    initialized: boolean;
    repositoryStatus: {
      initialized: boolean;
      connectionStatus: {
        connected: boolean;
        environment: string;
        url: string;
      };
      repositories: {
        user: boolean;
        expense: boolean;
        budget: boolean;
        alert: boolean;
      };
    };
    services: {
      user: boolean;
      expense: boolean;
      taxCalculation: boolean;
      budget: boolean;
      alert: boolean;
      analytics: boolean;
    };
  } {
    return {
      initialized: this.isInitialized(),
      repositoryStatus: this.repositoryFactory.getStatus(),
      services: {
        user: this.userService !== null,
        expense: this.expenseService !== null,
        taxCalculation: this.taxCalculationService !== null,
        budget: this.budgetService !== null,
        alert: this.alertService !== null,
        analytics: this.analyticsService !== null,
      },
    };
  }

  /**
   * Resets all service instances (useful for testing)
   */
  reset(): void {
    this.userService = null;
    this.expenseService = null;
    this.taxCalculationService = null;
    this.budgetService = null;
    this.alertService = null;
    this.analyticsService = null;
  }

  /**
   * Closes the service factory and all connections
   */
  async close(): Promise<void> {
    try {
      this.reset();
      await this.repositoryFactory.close();
      console.log('Service factory closed');
    } catch (error) {
      console.error('Error closing service factory:', error);
    }
  }

  /**
   * Validates that all required services are available
   */
  validateServices(): {
    valid: boolean;
    missing: string[];
    errors: string[];
  } {
    const missing: string[] = [];
    const errors: string[] = [];

    // Check user service
    try {
      this.getUserService();
    } catch (error) {
      missing.push('UserService');
      errors.push(`UserService: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Check expense service
    try {
      this.getExpenseService();
    } catch (error) {
      missing.push('ExpenseService');
      errors.push(`ExpenseService: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Check tax calculation service
    try {
      this.getTaxCalculationService();
    } catch (error) {
      missing.push('TaxCalculationService');
      errors.push(`TaxCalculationService: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Check budget service
    try {
      this.getBudgetService(this.repositoryFactory.getBudgetRepository(), this.getExpenseService());
    } catch (error) {
      missing.push('BudgetService');
      errors.push(`BudgetService: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Check alert service
    try {
      this.getAlertService(this.repositoryFactory.getAlertRepository());
    } catch (error) {
      missing.push('AlertService');
      errors.push(`AlertService: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Check analytics service
    try {
      this.getAnalyticsService(this.getExpenseService(), this.getBudgetService(this.repositoryFactory.getBudgetRepository(), this.getExpenseService()));
    } catch (error) {
      missing.push('AnalyticsService');
      errors.push(`AnalyticsService: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      valid: missing.length === 0,
      missing,
      errors,
    };
  }
} 