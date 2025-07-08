import { User } from '@/core/domain/entities/User';
import { BaseRepository, PaginatedRepository, PaginationParams, PaginatedResult } from './BaseRepository';

/**
 * User repository interface defining user-specific operations
 * 
 * This interface extends the base repository with user-specific queries
 * and operations that are commonly needed for user management.
 */
export interface UserRepository extends PaginatedRepository<User, string> {
  /**
   * Finds a user by email address
   * @param email - The email address to search for
   * @returns Promise resolving to the user or null if not found
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Finds users by their active status
   * @param isActive - Whether to find active or inactive users
   * @param pagination - Optional pagination parameters
   * @returns Promise resolving to paginated results
   */
  findByActiveStatus(isActive: boolean, pagination?: PaginationParams): Promise<PaginatedResult<User>>;

  /**
   * Finds users by their email verification status
   * @param emailVerified - Whether to find verified or unverified users
   * @param pagination - Optional pagination parameters
   * @returns Promise resolving to paginated results
   */
  findByEmailVerificationStatus(emailVerified: boolean, pagination?: PaginationParams): Promise<PaginatedResult<User>>;

  /**
   * Finds users who haven't logged in since a specific date
   * @param since - The date to check against
   * @param pagination - Optional pagination parameters
   * @returns Promise resolving to paginated results
   */
  findInactiveSince(since: Date, pagination?: PaginationParams): Promise<PaginatedResult<User>>;

  /**
   * Updates user's last login timestamp
   * @param userId - The user ID to update
   * @returns Promise resolving to the updated user
   */
  updateLastLogin(userId: string): Promise<User>;

  /**
   * Verifies a user's email address
   * @param userId - The user ID to verify
   * @returns Promise resolving to the updated user
   */
  verifyEmail(userId: string): Promise<User>;

  /**
   * Activates or deactivates a user account
   * @param userId - The user ID to update
   * @param isActive - The new active status
   * @returns Promise resolving to the updated user
   */
  updateActiveStatus(userId: string, isActive: boolean): Promise<User>;

  /**
   * Counts users by their active status
   * @param isActive - Whether to count active or inactive users
   * @returns Promise resolving to the count
   */
  countByActiveStatus(isActive: boolean): Promise<number>;

  /**
   * Counts users by their email verification status
   * @param emailVerified - Whether to count verified or unverified users
   * @returns Promise resolving to the count
   */
  countByEmailVerificationStatus(emailVerified: boolean): Promise<number>;

  /**
   * Searches users by various criteria
   * @param searchTerm - The search term to match against name, email, etc.
   * @param pagination - Optional pagination parameters
   * @returns Promise resolving to paginated results
   */
  search(searchTerm: string, pagination?: PaginationParams): Promise<PaginatedResult<User>>;
} 