
import { RepositoryFactory } from '@/infrastructure/database/repositories/RepositoryFactory';
import { UserService } from './UserService';
import { TaxCalculationService } from './TaxCalculationService';
import { BudgetService } from './BudgetService';
import { AlertService } from './AlertService';
import { AnalyticsService } from './AnalyticsService';

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
  getBudgetService(): BudgetService {
    if (!this.repositoryFactory.isInitialized()) {
      throw new Error('Service factory not initialized. Call initialize() first.');
    }

    if (!this.budgetService) {
      const budgetRepository = this.repositoryFactory.getBudgetRepository();
      this.budgetService = new BudgetService(budgetRepository);
    }

    return this.budgetService;
  }

  /**
   * Gets the alert service instance
   */
  getAlertService(): AlertService {
    if (!this.repositoryFactory.isInitialized()) {
      throw new Error('Service factory not initialized. Call initialize() first.');
    }

    if (!this.alertService) {
      this.alertService = AlertService;
    }

    return this.alertService;
  }

  /**
   * Gets the analytics service instance
   */
  getAnalyticsService(): AnalyticsService {
    if (!this.repositoryFactory.isInitialized()) {
      throw new Error('Service factory not initialized. Call initialize() first.');
    }

    if (!this.analyticsService) {
      this.analyticsService = AnalyticsService;
    }

    return this.analyticsService;
  }

  /**
   * Gets all available services
   */
  getAllServices(): {
    userService: UserService;
    taxCalculationService: TaxCalculationService;
    budgetService?: BudgetService;
    alertService?: AlertService;
    analyticsService?: AnalyticsService;
  } {
    if (!this.repositoryFactory.isInitialized()) {
      throw new Error('Service factory not initialized. Call initialize() first.');
    }

    const services = {
      userService: this.getUserService(),
      taxCalculationService: this.getTaxCalculationService(),
    };

    try {
      (services as any).budgetService = this.getBudgetService();
    } catch (error) {
      // Budget service not available
    }

    try {
      (services as any).alertService = this.getAlertService();
    } catch (error) {
      // Alert service not available
    }

    try {
      (services as any).analyticsService = this.getAnalyticsService();
    } catch (error) {
      // Analytics service not available
    }

    return services as {
      userService: UserService;
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
        expense: false,
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

    // Check tax calculation service
    try {
      this.getTaxCalculationService();
    } catch (error) {
      missing.push('TaxCalculationService');
      errors.push(`TaxCalculationService: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      valid: missing.length === 0,
      missing,
      errors,
    };
  }
}
