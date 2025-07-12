
import { User, CreateUserParams } from '@/core/domain/entities/User';
import { UserProfile } from '@/core/domain/entities/UserProfile';
import { UserPreferences } from '@/core/domain/entities/UserPreferences';
import { UserRepository } from '@/infrastructure/database/repositories/UserRepository';
import { UserValidationError } from '@/core/domain/value-objects/UserValidationError';
import { PaginationParams, PaginatedResult } from '@/infrastructure/database/repositories/BaseRepository';

/**
 * User service for orchestrating user-related business logic
 * 
 * This service coordinates between repositories and implements
 * application-level user management operations.
 */
export class UserService {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Creates a new user with validation and business rules
   */
  async createUser(email: string, profile?: Partial<UserProfile>, preferences?: Partial<UserPreferences>): Promise<User> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(email);
      if (existingUser) {
        throw new UserValidationError('User with this email already exists');
      }

      // Generate unique ID (in a real app, this might come from auth service)
      const userId = this.generateUserId();

      // Create user with domain logic
      const createParams: CreateUserParams = { 
        email,
        profile: profile || undefined,
        preferences: preferences || undefined
      };

      const user = User.create(createParams, userId);

      // Save to database
      return await this.userRepository.create(user);
    } catch (error) {
      if (error instanceof UserValidationError) {
        throw error;
      }
      throw new UserValidationError(`Failed to create user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Finds a user by ID with proper error handling
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      return await this.userRepository.findById(userId);
    } catch (error) {
      throw new UserValidationError(`Failed to get user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Finds a user by email with proper error handling
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      return await this.userRepository.findByEmail(email);
    } catch (error) {
      throw new UserValidationError(`Failed to get user by email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Updates user profile with validation
   */
  async updateUserProfile(userId: string, profileData: Partial<UserProfile>): Promise<User> {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw new UserValidationError('User not found');
      }

      // Update user with new profile data
      user.update({ profile: profileData });

      // Save to database
      return await this.userRepository.update(userId, user);
    } catch (error) {
      if (error instanceof UserValidationError) {
        throw error;
      }
      throw new UserValidationError(`Failed to update user profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Updates user preferences with validation
   */
  async updateUserPreferences(userId: string, preferencesData: Partial<UserPreferences>): Promise<User> {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw new UserValidationError('User not found');
      }

      // Update user with new preferences data
      user.update({ preferences: preferencesData });

      // Save to database
      return await this.userRepository.update(userId, user);
    } catch (error) {
      if (error instanceof UserValidationError) {
        throw error;
      }
      throw new UserValidationError(`Failed to update user preferences: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Records a user login with business logic
   */
  async recordUserLogin(userId: string): Promise<User> {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw new UserValidationError('User not found');
      }

      // Record login using domain logic
      user.recordLogin();

      // Save to database
      return await this.userRepository.update(userId, user);
    } catch (error) {
      if (error instanceof UserValidationError) {
        throw error;
      }
      throw new UserValidationError(`Failed to record user login: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Verifies user email with business logic
   */
  async verifyUserEmail(userId: string): Promise<User> {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw new UserValidationError('User not found');
      }

      if (user.emailVerified) {
        throw new UserValidationError('Email is already verified');
      }

      // Verify email using domain logic
      user.verifyEmail();

      // Save to database
      return await this.userRepository.update(userId, user);
    } catch (error) {
      if (error instanceof UserValidationError) {
        throw error;
      }
      throw new UserValidationError(`Failed to verify user email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Activates or deactivates user account
   */
  async updateUserActiveStatus(userId: string, isActive: boolean): Promise<User> {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw new UserValidationError('User not found');
      }

      if (isActive) {
        user.activate();
      } else {
        user.deactivate();
      }

      // Save to database
      return await this.userRepository.update(userId, user);
    } catch (error) {
      if (error instanceof UserValidationError) {
        throw error;
      }
      throw new UserValidationError(`Failed to update user active status: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets users with pagination and filtering
   */
  async getUsers(pagination?: PaginationParams, filters?: {
    isActive?: boolean;
    emailVerified?: boolean;
    searchTerm?: string;
  }): Promise<PaginatedResult<User>> {
    try {
      if (filters?.searchTerm) {
        return await this.userRepository.search(filters.searchTerm, pagination);
      }

      if (filters?.isActive !== undefined) {
        return await this.userRepository.findByActiveStatus(filters.isActive, pagination);
      }

      if (filters?.emailVerified !== undefined) {
        return await this.userRepository.findByEmailVerificationStatus(filters.emailVerified, pagination);
      }

      return await this.userRepository.findWithPagination(pagination || {});
    } catch (error) {
      throw new UserValidationError(`Failed to get users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets inactive users since a specific date
   */
  async getInactiveUsers(since: Date, pagination?: PaginationParams): Promise<PaginatedResult<User>> {
    try {
      return await this.userRepository.findInactiveSince(since, pagination);
    } catch (error) {
      throw new UserValidationError(`Failed to get inactive users: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Deletes a user with business validation
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        throw new UserValidationError('User not found');
      }

      // Additional business validation could go here
      // For example, check if user has active subscriptions, etc.

      return await this.userRepository.delete(userId);
    } catch (error) {
      if (error instanceof UserValidationError) {
        throw error;
      }
      throw new UserValidationError(`Failed to delete user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets user statistics for analytics
   */
  async getUserStatistics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    unverifiedUsers: number;
  }> {
    try {
      const [
        totalUsers,
        activeUsers,
        verifiedUsers,
        unverifiedUsers,
      ] = await Promise.all([
        this.userRepository.count(),
        this.userRepository.countByActiveStatus(true),
        this.userRepository.countByEmailVerificationStatus(true),
        this.userRepository.countByEmailVerificationStatus(false),
      ]);

      return {
        totalUsers,
        activeUsers,
        verifiedUsers,
        unverifiedUsers,
      };
    } catch (error) {
      throw new UserValidationError(`Failed to get user statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validates user can perform actions
   */
  async validateUserCanPerformAction(userId: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      if (!user) {
        return false;
      }

      return user.canPerformAction();
    } catch (error) {
      return false;
    }
  }

  /**
   * Generates a unique user ID
   */
  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
