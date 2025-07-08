import { RepositoryFactory } from '@/infrastructure/database/repositories/RepositoryFactory';

/**
 * Transaction context for managing database transactions
 */
export interface TransactionContext {
  id: string;
  startTime: Date;
  status: 'active' | 'committed' | 'rolled_back' | 'failed';
  operations: Array<{
    type: string;
    description: string;
    timestamp: Date;
  }>;
}

/**
 * Transaction result wrapper
 */
export interface TransactionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  transactionId: string;
  duration: number;
}

/**
 * Transaction manager for handling complex business operations
 * 
 * This class provides transaction support for operations that span
 * multiple repositories or require atomicity.
 */
export class TransactionManager {
  private static instance: TransactionManager;
  private repositoryFactory: RepositoryFactory;
  private activeTransactions: Map<string, TransactionContext> = new Map();

  private constructor() {
    this.repositoryFactory = RepositoryFactory.getInstance();
  }

  /**
   * Gets the singleton instance of TransactionManager
   */
  static getInstance(): TransactionManager {
    if (!TransactionManager.instance) {
      TransactionManager.instance = new TransactionManager();
    }
    return TransactionManager.instance;
  }

  /**
   * Executes a function within a transaction context
   */
  async executeInTransaction<T>(
    operation: (context: TransactionContext) => Promise<T>,
    description: string = 'Transaction'
  ): Promise<TransactionResult<T>> {
    const transactionId = this.generateTransactionId();
    const startTime = new Date();
    
    const context: TransactionContext = {
      id: transactionId,
      startTime,
      status: 'active',
      operations: [],
    };

    this.activeTransactions.set(transactionId, context);

    try {
      // Log transaction start
      this.logOperation(context, 'START', description);

      // Execute the operation
      const result = await operation(context);

      // Commit transaction
      await this.commitTransaction(context);

      const duration = Date.now() - startTime.getTime();

      return {
        success: true,
        data: result,
        transactionId,
        duration,
      };
    } catch (error) {
      // Rollback transaction
      await this.rollbackTransaction(context);

      const duration = Date.now() - startTime.getTime();

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        transactionId,
        duration,
      };
    } finally {
      // Clean up
      this.activeTransactions.delete(transactionId);
    }
  }

  /**
   * Executes multiple operations in a single transaction
   */
  async executeMultipleOperations<T>(
    operations: Array<{
      name: string;
      operation: (context: TransactionContext) => Promise<unknown>;
    }>
  ): Promise<TransactionResult<T[]>> {
    return this.executeInTransaction(async (context) => {
      const results: T[] = [];

      for (const { name, operation } of operations) {
        try {
          const result = await operation(context);
          results.push(result as T);
          this.logOperation(context, 'SUCCESS', name);
        } catch (error) {
          this.logOperation(context, 'FAILED', `${name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          throw error;
        }
      }

      return results;
    }, `Multiple operations: ${operations.map(op => op.name).join(', ')}`);
  }

  /**
   * Gets transaction status
   */
  getTransactionStatus(transactionId: string): TransactionContext | null {
    return this.activeTransactions.get(transactionId) || null;
  }

  /**
   * Gets all active transactions
   */
  getActiveTransactions(): TransactionContext[] {
    return Array.from(this.activeTransactions.values());
  }

  /**
   * Commits a transaction
   */
  private async commitTransaction(context: TransactionContext): Promise<void> {
    try {
      // In a real implementation, this would commit the database transaction
      // For now, we just update the status
      context.status = 'committed';
      this.logOperation(context, 'COMMIT', 'Transaction committed successfully');
    } catch (error) {
      context.status = 'failed';
      this.logOperation(context, 'COMMIT_FAILED', `Commit failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }

  /**
   * Rollbacks a transaction
   */
  private async rollbackTransaction(context: TransactionContext): Promise<void> {
    try {
      // In a real implementation, this would rollback the database transaction
      // For now, we just update the status
      context.status = 'rolled_back';
      this.logOperation(context, 'ROLLBACK', 'Transaction rolled back');
    } catch (error) {
      context.status = 'failed';
      this.logOperation(context, 'ROLLBACK_FAILED', `Rollback failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Don't throw here as we're already in an error state
    }
  }

  /**
   * Logs an operation within a transaction
   */
  private logOperation(context: TransactionContext, type: string, description: string): void {
    context.operations.push({
      type,
      description,
      timestamp: new Date(),
    });
  }

  /**
   * Generates a unique transaction ID
   */
  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Gets transaction statistics
   */
  getTransactionStatistics(): {
    activeTransactions: number;
    totalTransactions: number;
    averageDuration: number;
  } {
    const activeTransactions = this.activeTransactions.size;
    // In a real implementation, you'd track total transactions and average duration
    return {
      activeTransactions,
      totalTransactions: 0, // Would be tracked in a real implementation
      averageDuration: 0, // Would be calculated in a real implementation
    };
  }
} 