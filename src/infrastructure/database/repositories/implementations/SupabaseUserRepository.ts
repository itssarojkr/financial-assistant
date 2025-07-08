import { SupabaseClient } from '@supabase/supabase-js';
import { User } from '@/core/domain/entities/User';
import { UserRepository } from '../UserRepository';
import { UserEntity } from '../../entities/UserEntity';
import { PaginationParams, PaginatedResult } from '../BaseRepository';
import { UserValidationError } from '@/core/domain/value-objects/UserValidationError';

/**
 * Supabase implementation of UserRepository
 * 
 * This class provides concrete implementation of user data access
 * using Supabase as the underlying database.
 */
export class SupabaseUserRepository implements UserRepository {
  private readonly supabase: SupabaseClient;
  private readonly tableName = 'users';

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Finds a user by ID
   */
  async findById(id: string): Promise<User | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Database error: ${error.message}`);
      }

      return data ? UserEntity.fromDatabase(data) : null;
    } catch (error) {
      throw new UserValidationError(`Failed to find user by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Finds all users with optional pagination
   */
  async findAll(limit?: number, offset?: number): Promise<User[]> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      if (offset) {
        query = query.range(offset, offset + (limit || 100) - 1);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return data?.map(UserEntity.fromDatabase) || [];
    } catch (error) {
      throw new UserValidationError(`Failed to find all users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Creates a new user
   */
  async create(user: User): Promise<User> {
    try {
      const userData = UserEntity.toDatabase(user);
      
      const { data, error } = await this.supabase
        .from(this.tableName)
        .insert(userData)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return UserEntity.fromDatabase(data);
    } catch (error) {
      throw new UserValidationError(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Updates an existing user
   */
  async update(id: string, user: Partial<User>): Promise<User> {
    try {
      const userData = UserEntity.toPartialDatabase(user);
      userData.updated_at = new Date().toISOString();

      const { data, error } = await this.supabase
        .from(this.tableName)
        .update(userData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return UserEntity.fromDatabase(data);
    } catch (error) {
      throw new UserValidationError(`Failed to update user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Deletes a user by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return true;
    } catch (error) {
      throw new UserValidationError(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Checks if a user exists by ID
   */
  async exists(id: string): Promise<boolean> {
    try {
      const { count, error } = await this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('id', id);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return (count || 0) > 0;
    } catch (error) {
      throw new UserValidationError(`Failed to check user existence: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Counts total number of users
   */
  async count(): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return count || 0;
    } catch (error) {
      throw new UserValidationError(`Failed to count users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Finds users with pagination
   */
  async findWithPagination(params: PaginationParams): Promise<PaginatedResult<User>> {
    try {
      const page = params.page || 1;
      const limit = params.limit || 10;
      const offset = params.offset || (page - 1) * limit;

      const { data, error, count } = await this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        data: data?.map(UserEntity.fromDatabase) || [],
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        },
      };
    } catch (error) {
      throw new UserValidationError(`Failed to find users with pagination: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Finds a user by email address
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Not found
        }
        throw new Error(`Database error: ${error.message}`);
      }

      return data ? UserEntity.fromDatabase(data) : null;
    } catch (error) {
      throw new UserValidationError(`Failed to find user by email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Finds users by active status
   */
  async findByActiveStatus(isActive: boolean, pagination?: PaginationParams): Promise<PaginatedResult<User>> {
    try {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = pagination?.offset || (page - 1) * limit;

      const { data, error, count } = await this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact' })
        .eq('is_active', isActive)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        data: data?.map(UserEntity.fromDatabase) || [],
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        },
      };
    } catch (error) {
      throw new UserValidationError(`Failed to find users by active status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Finds users by email verification status
   */
  async findByEmailVerificationStatus(emailVerified: boolean, pagination?: PaginationParams): Promise<PaginatedResult<User>> {
    try {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = pagination?.offset || (page - 1) * limit;

      const { data, error, count } = await this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact' })
        .eq('email_verified', emailVerified)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        data: data?.map(UserEntity.fromDatabase) || [],
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        },
      };
    } catch (error) {
      throw new UserValidationError(`Failed to find users by email verification status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Finds users who haven't logged in since a specific date
   */
  async findInactiveSince(since: Date, pagination?: PaginationParams): Promise<PaginatedResult<User>> {
    try {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = pagination?.offset || (page - 1) * limit;

      const { data, error, count } = await this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact' })
        .or(`last_login_at.is.null,last_login_at.lt.${since.toISOString()}`)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        data: data?.map(UserEntity.fromDatabase) || [],
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        },
      };
    } catch (error) {
      throw new UserValidationError(`Failed to find inactive users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Updates user's last login timestamp
   */
  async updateLastLogin(userId: string): Promise<User> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update({
          last_login_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return UserEntity.fromDatabase(data);
    } catch (error) {
      throw new UserValidationError(`Failed to update last login: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verifies a user's email address
   */
  async verifyEmail(userId: string): Promise<User> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update({
          email_verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return UserEntity.fromDatabase(data);
    } catch (error) {
      throw new UserValidationError(`Failed to verify email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Activates or deactivates a user account
   */
  async updateActiveStatus(userId: string, isActive: boolean): Promise<User> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return UserEntity.fromDatabase(data);
    } catch (error) {
      throw new UserValidationError(`Failed to update active status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Counts users by active status
   */
  async countByActiveStatus(isActive: boolean): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('is_active', isActive);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return count || 0;
    } catch (error) {
      throw new UserValidationError(`Failed to count users by active status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Counts users by email verification status
   */
  async countByEmailVerificationStatus(emailVerified: boolean): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('email_verified', emailVerified);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      return count || 0;
    } catch (error) {
      throw new UserValidationError(`Failed to count users by email verification status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Searches users by various criteria
   */
  async search(searchTerm: string, pagination?: PaginationParams): Promise<PaginatedResult<User>> {
    try {
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const offset = pagination?.offset || (page - 1) * limit;

      const { data, error, count } = await this.supabase
        .from(this.tableName)
        .select('*', { count: 'exact' })
        .or(`email.ilike.%${searchTerm}%,profile->>firstName.ilike.%${searchTerm}%,profile->>lastName.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }

      const total = count || 0;
      const totalPages = Math.ceil(total / limit);

      return {
        data: data?.map(UserEntity.fromDatabase) || [],
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        },
      };
    } catch (error) {
      throw new UserValidationError(`Failed to search users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
} 