import { supabase } from '@/integrations/supabase/client';
import { RepositoryFactory } from '@/infrastructure/database/repositories/RepositoryFactory';

export interface Transaction {
  id: string;
  operations: TransactionOperation[];
  status: 'pending' | 'committed' | 'rolled_back';
  createdAt: Date;
  completedAt?: Date;
}

export interface TransactionOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  conditions?: Record<string, any>;
}

/**
 * Transaction manager for handling complex multi-table operations
 */
export class TransactionManager {
  private static instance: TransactionManager;

  private constructor() {
    RepositoryFactory.getInstance();
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
   * Executes operations within a transaction
   */
  async executeTransaction(operations: TransactionOperation[]): Promise<{ success: boolean; results: any[]; error?: any }> {
    const transaction: Transaction = {
      id: this.generateTransactionId(),
      operations,
      status: 'pending',
      createdAt: new Date(),
    };

    try {
      const results: any[] = [];

      // Execute each operation in sequence
      for (const operation of operations) {
        const result = await this.executeOperation(operation);
        results.push(result);
      }

      transaction.status = 'committed';
      transaction.completedAt = new Date();

      return { success: true, results };
    } catch (error) {
      transaction.status = 'rolled_back';
      transaction.completedAt = new Date();

      console.error('Transaction failed:', error);
      return { success: false, results: [], error };
    }
  }

  /**
   * Executes a single operation
   */
  private async executeOperation(operation: TransactionOperation): Promise<any> {
    const { type, table, data, conditions } = operation;

    // Validate table name against known tables
    const validTables = [
      'budgets', 'user_data', 'expense_categories', 'cities', 'states', 
      'countries', 'expenses', 'localities', 'profiles', 'spending_alerts', 
      'user_preferences', 'user_sessions'
    ];

    if (!validTables.includes(table)) {
      throw new Error(`Invalid table name: ${table}`);
    }

    const tableTyped = table as any; // Type assertion for supabase client

    switch (type) {
      case 'create':
        const { data: createResult, error: createError } = await supabase
          .from(tableTyped)
          .insert(data)
          .select();
        if (createError) throw createError;
        return createResult;

      case 'update':
        if (!conditions) {
          throw new Error('Update operations require conditions');
        }
        let updateQuery = supabase.from(tableTyped).update(data);
        
        // Apply conditions
        Object.entries(conditions).forEach(([key, value]) => {
          updateQuery = updateQuery.eq(key, value);
        });

        const { data: updateResult, error: updateError } = await updateQuery.select();
        if (updateError) throw updateError;
        return updateResult;

      case 'delete':
        if (!conditions) {
          throw new Error('Delete operations require conditions');
        }
        let deleteQuery = supabase.from(tableTyped);
        
        // Apply conditions
        Object.entries(conditions).forEach(([key, value]) => {
          deleteQuery = deleteQuery.eq(key, value);
        });

        const { data: deleteResult, error: deleteError } = await deleteQuery.delete();
        if (deleteError) throw deleteError;
        return deleteResult;

      default:
        throw new Error(`Unsupported operation type: ${type}`);
    }
  }

  /**
   * Creates a user with related data in a transaction
   */
  async createUserWithData(userData: {
    email: string;
    profile?: any;
    preferences?: any;
    initialData?: any[];
  }): Promise<{ success: boolean; userId?: string; error?: any }> {
    const operations: TransactionOperation[] = [];

    // Add user creation operation
    operations.push({
      id: this.generateOperationId(),
      type: 'create',
      table: 'profiles',
      data: {
        email: userData.email,
        ...userData.profile,
      },
    });

    // Add preferences creation if provided
    if (userData.preferences) {
      operations.push({
        id: this.generateOperationId(),
        type: 'create',
        table: 'user_preferences',
        data: userData.preferences,
      });
    }

    // Add initial data operations if provided
    if (userData.initialData) {
      userData.initialData.forEach((dataItem, index) => {
        operations.push({
          id: this.generateOperationId(),
          type: 'create',
          table: 'user_data',
          data: dataItem,
        });
      });
    }

    const result = await this.executeTransaction(operations);
    
    if (result.success && result.results.length > 0) {
      return {
        success: true,
        userId: result.results[0]?.[0]?.id,
      };
    }

    return {
      success: false,
      error: result.error,
    };
  }

  /**
   * Updates user and related data in a transaction
   */
  async updateUserWithData(userId: string, updates: {
    profile?: any;
    preferences?: any;
    additionalData?: any[];
  }): Promise<{ success: boolean; error?: any }> {
    const operations: TransactionOperation[] = [];

    // Add profile update if provided
    if (updates.profile) {
      operations.push({
        id: this.generateOperationId(),
        type: 'update',
        table: 'profiles',
        data: updates.profile,
        conditions: { id: userId },
      });
    }

    // Add preferences update if provided
    if (updates.preferences) {
      operations.push({
        id: this.generateOperationId(),
        type: 'update',
        table: 'user_preferences',
        data: updates.preferences,
        conditions: { user_id: userId },
      });
    }

    // Add additional data operations if provided
    if (updates.additionalData) {
      updates.additionalData.forEach((dataItem) => {
        operations.push({
          id: this.generateOperationId(),
          type: 'create',
          table: 'user_data',
          data: {
            ...dataItem,
            user_id: userId,
          },
        });
      });
    }

    const result = await this.executeTransaction(operations);
    
    return {
      success: result.success,
      error: result.error,
    };
  }

  /**
   * Deletes user and all related data in a transaction
   */
  async deleteUserWithData(userId: string): Promise<{ success: boolean; error?: any }> {
    const operations: TransactionOperation[] = [
      {
        id: this.generateOperationId(),
        type: 'delete',
        table: 'user_data',
        data: {},
        conditions: { user_id: userId },
      },
      {
        id: this.generateOperationId(),
        type: 'delete',
        table: 'user_preferences',
        data: {},
        conditions: { user_id: userId },
      },
      {
        id: this.generateOperationId(),
        type: 'delete',
        table: 'expenses',
        data: {},
        conditions: { user_id: userId },
      },
      {
        id: this.generateOperationId(),
        type: 'delete',
        table: 'budgets',
        data: {},
        conditions: { user_id: userId },
      },
      {
        id: this.generateOperationId(),
        type: 'delete',
        table: 'spending_alerts',
        data: {},
        conditions: { user_id: userId },
      },
      {
        id: this.generateOperationId(),
        type: 'delete',
        table: 'profiles',
        data: {},
        conditions: { id: userId },
      },
    ];

    const result = await this.executeTransaction(operations);
    
    return {
      success: result.success,
      error: result.error,
    };
  }

  /**
   * Generates a unique transaction ID
   */
  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generates a unique operation ID
   */
  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
