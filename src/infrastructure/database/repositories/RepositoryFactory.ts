import { SupabaseClient } from '@supabase/supabase-js';
import { DatabaseConnection } from '../connection/DatabaseConnection';
import { UserRepository } from './UserRepository';
import { ExpenseRepository } from './ExpenseRepository';
import { BudgetRepository } from './BudgetRepository';
import { AlertRepository } from './AlertRepository';
import { SupabaseUserRepository } from './implementations/SupabaseUserRepository';
import { SupabaseBudgetRepository } from './SupabaseBudgetRepository';
import { SupabaseAlertRepository } from './SupabaseAlertRepository';

/**
 * Repository factory for managing and providing access to all repositories
 * 
 * This class implements the Factory pattern to create and manage repository
 * instances, ensuring proper dependency injection and singleton management.
 */
export class RepositoryFactory {
  private static instance: RepositoryFactory;
  private connection: DatabaseConnection;
  private client: SupabaseClient | null = null;
  
  // Repository instances
  private userRepository: UserRepository | null = null;
  private expenseRepository: ExpenseRepository | null = null;
  private budgetRepository: BudgetRepository | null = null;
  private alertRepository: AlertRepository | null = null;

  private constructor() {
    this.connection = DatabaseConnection.getInstance();
  }

  /**
   * Gets the singleton instance of RepositoryFactory
   */
  static getInstance(): RepositoryFactory {
    if (!RepositoryFactory.instance) {
      RepositoryFactory.instance = new RepositoryFactory();
    }
    return RepositoryFactory.instance;
  }

  /**
   * Initializes the repository factory
   */
  async initialize(): Promise<void> {
    try {
      await this.connection.initialize();
      this.client = this.connection.getClient();
      console.log('Repository factory initialized successfully');
    } catch (error) {
      console.error('Failed to initialize repository factory:', error);
      throw new Error(`Repository factory initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets the user repository instance
   */
  getUserRepository(): UserRepository {
    if (!this.client) {
      throw new Error('Repository factory not initialized. Call initialize() first.');
    }

    if (!this.userRepository) {
      this.userRepository = new SupabaseUserRepository(this.client);
    }

    return this.userRepository;
  }

  /**
   * Gets the expense repository instance
   */
  getExpenseRepository(): ExpenseRepository {
    throw new Error('Expense repository not implemented yet');
  }

  /**
   * Gets the budget repository instance
   */
  getBudgetRepository(): BudgetRepository {
    throw new Error('Budget repository not implemented yet');
  }

  /**
   * Gets the alert repository instance
   */
  getAlertRepository(): AlertRepository {
    throw new Error('Alert repository not implemented yet');
  }

  /**
   * Gets the Supabase client instance
   */
  getClient(): SupabaseClient {
    if (!this.client) {
      throw new Error('Repository factory not initialized. Call initialize() first.');
    }
    return this.client;
  }

  /**
   * Checks if the factory is initialized
   */
  isInitialized(): boolean {
    return this.client !== null;
  }

  /**
   * Gets factory status information
   */
  getStatus(): {
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
  } {
    return {
      initialized: this.isInitialized(),
      connectionStatus: this.connection.getConnectionStatus(),
      repositories: {
        user: this.userRepository !== null,
        expense: this.expenseRepository !== null,
        budget: this.budgetRepository !== null,
        alert: this.alertRepository !== null,
      },
    };
  }

  /**
   * Resets all repository instances (useful for testing)
   */
  reset(): void {
    this.userRepository = null;
    this.expenseRepository = null;
    this.budgetRepository = null;
    this.alertRepository = null;
  }

  /**
   * Closes the repository factory and all connections
   */
  async close(): Promise<void> {
    try {
      this.reset();
      await this.connection.close();
      this.client = null;
      console.log('Repository factory closed');
    } catch (error) {
      console.error('Error closing repository factory:', error);
    }
  }
} 