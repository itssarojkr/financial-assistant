import { User } from '@/core/domain/entities/User';
import { UserProfile } from '@/core/domain/entities/UserProfile';
import { UserPreferences } from '@/core/domain/entities/UserPreferences';
import { UserValidationError } from '@/core/domain/value-objects/UserValidationError';

/**
 * Database entity for User domain object
 * Handles mapping between domain entities and database records
 */
export class UserEntity {
  /**
   * Maps a database record to a User domain entity
   * @param dbRecord - Raw database record from Supabase
   * @returns User domain entity
   * @throws UserValidationError if data is invalid
   */
  static fromDatabase(dbRecord: unknown): User {
    const record = dbRecord as Record<string, unknown>;
    try {
      if (!record?.id) {
        throw new UserValidationError('User ID is required');
      }

      const user = new User({
        id: record.id as string,
        email: record.email as string,
        createdAt: new Date(record.created_at as string),
        updatedAt: new Date(record.updated_at as string),
        isActive: record.is_active ?? true,
        lastLoginAt: record.last_login_at ? new Date(record.last_login_at as string) : undefined,
        emailVerified: record.email_verified ?? false,
        preferences: record.preferences ? UserPreferences.fromJSON(record.preferences) : undefined,
        profile: record.profile ? UserProfile.fromJSON(record.profile) : undefined,
      });

      return user;
    } catch (error) {
      if (error instanceof UserValidationError) {
        throw error;
      }
      throw new UserValidationError(`Failed to create user from database: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Maps a User domain entity to a database record
   * @param user - User domain entity
   * @returns Database record for Supabase
   */
  static toDatabase(user: User): Record<string, unknown> {
    return {
      id: user.id,
      email: user.email,
      created_at: user.createdAt.toISOString(),
      updated_at: user.updatedAt.toISOString(),
      is_active: user.isActive,
      last_login_at: user.lastLoginAt?.toISOString() || null,
      email_verified: user.emailVerified,
      preferences: user.preferences?.toJSON() || null,
      profile: user.profile?.toJSON() || null,
    };
  }

  /**
   * Creates a partial database record for updates
   * @param user - User domain entity with partial updates
   * @returns Partial database record
   */
  static toPartialDatabase(user: Partial<User>): Record<string, unknown> {
    const record: Record<string, unknown> = {};

    if (user.email !== undefined) record.email = user.email;
    if (user.updatedAt !== undefined) record.updated_at = user.updatedAt.toISOString();
    if (user.isActive !== undefined) record.is_active = user.isActive;
    if (user.lastLoginAt !== undefined) record.last_login_at = user.lastLoginAt?.toISOString() || null;
    if (user.emailVerified !== undefined) record.email_verified = user.emailVerified;
    if (user.preferences !== undefined) record.preferences = user.preferences?.toJSON() || null;
    if (user.profile !== undefined) record.profile = user.profile?.toJSON() || null;

    return record;
  }
} 