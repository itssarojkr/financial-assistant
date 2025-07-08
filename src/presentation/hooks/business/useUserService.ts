import { useState, useCallback, useEffect } from 'react';
import { User } from '@/core/domain/entities/User';
import { UserProfile } from '@/core/domain/entities/UserProfile';
import { UserPreferences } from '@/core/domain/entities/UserPreferences';
import { UserValidationError } from '@/core/domain/value-objects/UserValidationError';
import { ServiceFactory } from '@/application/services/ServiceFactory';
import { PaginationParams, PaginatedResult } from '@/infrastructure/database/repositories/BaseRepository';

/**
 * User service hook result interface
 */
export interface UseUserServiceResult {
  // User operations
  createUser: (email: string, profile?: Partial<UserProfile>, preferences?: Partial<UserPreferences>) => Promise<User>;
  getUserById: (userId: string) => Promise<User | null>;
  getUserByEmail: (email: string) => Promise<User | null>;
  updateUserProfile: (userId: string, profileData: Partial<UserProfile>) => Promise<User>;
  updateUserPreferences: (userId: string, preferencesData: Partial<UserPreferences>) => Promise<User>;
  deleteUser: (userId: string) => Promise<boolean>;
  
  // User status operations
  recordUserLogin: (userId: string) => Promise<User>;
  verifyUserEmail: (userId: string) => Promise<User>;
  updateUserActiveStatus: (userId: string, isActive: boolean) => Promise<User>;
  
  // User queries
  getUsers: (pagination?: PaginationParams, filters?: {
    isActive?: boolean;
    emailVerified?: boolean;
    searchTerm?: string;
  }) => Promise<PaginatedResult<User>>;
  getInactiveUsers: (since: Date, pagination?: PaginationParams) => Promise<PaginatedResult<User>>;
  getUserStatistics: () => Promise<{
    totalUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    unverifiedUsers: number;
  }>;
  validateUserCanPerformAction: (userId: string) => Promise<boolean>;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Clear error
  clearError: () => void;
}

/**
 * Custom hook for user service operations
 * 
 * This hook provides access to user-related business logic through
 * the application services layer with proper loading states and error handling.
 */
export function useUserService(): UseUserServiceResult {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get user service instance
  const getUserService = useCallback(() => {
    try {
      const serviceFactory = ServiceFactory.getInstance();
      return serviceFactory.getUserService();
    } catch (err) {
      throw new Error(`Failed to get user service: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Wrapper for async operations with loading and error handling
  const executeOperation = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await operation();
      return result;
    } catch (err) {
      const errorMessage = err instanceof UserValidationError 
        ? err.message 
        : err instanceof Error 
          ? err.message 
          : 'An unexpected error occurred';
      
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // User creation
  const createUser = useCallback(async (
    email: string, 
    profile?: Partial<UserProfile>, 
    preferences?: Partial<UserPreferences>
  ): Promise<User> => {
    return executeOperation(async () => {
      const userService = getUserService();
      return await userService.createUser(email, profile, preferences);
    });
  }, [executeOperation, getUserService]);

  // Get user by ID
  const getUserById = useCallback(async (userId: string): Promise<User | null> => {
    return executeOperation(async () => {
      const userService = getUserService();
      return await userService.getUserById(userId);
    });
  }, [executeOperation, getUserService]);

  // Get user by email
  const getUserByEmail = useCallback(async (email: string): Promise<User | null> => {
    return executeOperation(async () => {
      const userService = getUserService();
      return await userService.getUserByEmail(email);
    });
  }, [executeOperation, getUserService]);

  // Update user profile
  const updateUserProfile = useCallback(async (
    userId: string, 
    profileData: Partial<UserProfile>
  ): Promise<User> => {
    return executeOperation(async () => {
      const userService = getUserService();
      return await userService.updateUserProfile(userId, profileData);
    });
  }, [executeOperation, getUserService]);

  // Update user preferences
  const updateUserPreferences = useCallback(async (
    userId: string, 
    preferencesData: Partial<UserPreferences>
  ): Promise<User> => {
    return executeOperation(async () => {
      const userService = getUserService();
      return await userService.updateUserPreferences(userId, preferencesData);
    });
  }, [executeOperation, getUserService]);

  // Delete user
  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    return executeOperation(async () => {
      const userService = getUserService();
      return await userService.deleteUser(userId);
    });
  }, [executeOperation, getUserService]);

  // Record user login
  const recordUserLogin = useCallback(async (userId: string): Promise<User> => {
    return executeOperation(async () => {
      const userService = getUserService();
      return await userService.recordUserLogin(userId);
    });
  }, [executeOperation, getUserService]);

  // Verify user email
  const verifyUserEmail = useCallback(async (userId: string): Promise<User> => {
    return executeOperation(async () => {
      const userService = getUserService();
      return await userService.verifyUserEmail(userId);
    });
  }, [executeOperation, getUserService]);

  // Update user active status
  const updateUserActiveStatus = useCallback(async (
    userId: string, 
    isActive: boolean
  ): Promise<User> => {
    return executeOperation(async () => {
      const userService = getUserService();
      return await userService.updateUserActiveStatus(userId, isActive);
    });
  }, [executeOperation, getUserService]);

  // Get users with pagination and filtering
  const getUsers = useCallback(async (
    pagination?: PaginationParams, 
    filters?: {
      isActive?: boolean;
      emailVerified?: boolean;
      searchTerm?: string;
    }
  ): Promise<PaginatedResult<User>> => {
    return executeOperation(async () => {
      const userService = getUserService();
      return await userService.getUsers(pagination, filters);
    });
  }, [executeOperation, getUserService]);

  // Get inactive users
  const getInactiveUsers = useCallback(async (
    since: Date, 
    pagination?: PaginationParams
  ): Promise<PaginatedResult<User>> => {
    return executeOperation(async () => {
      const userService = getUserService();
      return await userService.getInactiveUsers(since, pagination);
    });
  }, [executeOperation, getUserService]);

  // Get user statistics
  const getUserStatistics = useCallback(async (): Promise<{
    totalUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    unverifiedUsers: number;
  }> => {
    return executeOperation(async () => {
      const userService = getUserService();
      return await userService.getUserStatistics();
    });
  }, [executeOperation, getUserService]);

  // Validate user can perform action
  const validateUserCanPerformAction = useCallback(async (userId: string): Promise<boolean> => {
    return executeOperation(async () => {
      const userService = getUserService();
      return await userService.validateUserCanPerformAction(userId);
    });
  }, [executeOperation, getUserService]);

  return {
    // User operations
    createUser,
    getUserById,
    getUserByEmail,
    updateUserProfile,
    updateUserPreferences,
    deleteUser,
    
    // User status operations
    recordUserLogin,
    verifyUserEmail,
    updateUserActiveStatus,
    
    // User queries
    getUsers,
    getInactiveUsers,
    getUserStatistics,
    validateUserCanPerformAction,
    
    // Loading states
    isLoading,
    error,
    
    // Clear error
    clearError,
  };
} 