/**
 * User domain entity representing a user in the financial assistant application.
 * 
 * This entity encapsulates all business logic related to user management,
 * including validation rules, authentication state, and user preferences.
 */

import { UserProfile } from './UserProfile';
import { UserPreferences } from './UserPreferences';
import { UserValidationError } from '../value-objects/UserValidationError';

export interface UserProps {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date | undefined;
  isActive: boolean;
  profile?: UserProfile | undefined;
  preferences?: UserPreferences | undefined;
}

export interface CreateUserParams {
  email: string;
  profile?: Partial<UserProfile>;
  preferences?: Partial<UserPreferences>;
}

export interface UpdateUserParams {
  email?: string;
  profile?: Partial<UserProfile>;
  preferences?: Partial<UserPreferences>;
  isActive?: boolean;
}

/**
 * User domain entity with business logic and validation
 */
export class User {
  private readonly _id: string;
  private _email: string;
  private _emailVerified: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;
  private _lastLoginAt?: Date | undefined;
  private _isActive: boolean;
  private _profile?: UserProfile | undefined;
  private _preferences?: UserPreferences | undefined;

  constructor(props: UserProps) {
    this.validateUserProps(props);
    
    this._id = props.id;
    this._email = props.email;
    this._emailVerified = props.emailVerified;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
    this._lastLoginAt = props.lastLoginAt;
    this._isActive = props.isActive;
    this._profile = props.profile;
    this._preferences = props.preferences;
  }

  /**
   * Creates a new User instance with validation
   */
  static create(params: CreateUserParams, id: string): User {
    const now = new Date();
    
    return new User({
      id,
      email: params.email,
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
      isActive: true,
      profile: params.profile ? UserProfile.create(params.profile) : undefined,
      preferences: params.preferences ? UserPreferences.create(params.preferences) : undefined,
    });
  }

  /**
   * Updates user properties with validation
   */
  update(params: UpdateUserParams): void {
    if (params.email !== undefined) {
      this.validateEmail(params.email);
      this._email = params.email;
    }

    if (params.profile !== undefined) {
      this._profile = this._profile 
        ? this._profile.update(params.profile)
        : UserProfile.create(params.profile);
    }

    if (params.preferences !== undefined) {
      this._preferences = this._preferences
        ? this._preferences.update(params.preferences)
        : UserPreferences.create(params.preferences);
    }

    if (params.isActive !== undefined) {
      this._isActive = params.isActive;
    }

    this._updatedAt = new Date();
  }

  /**
   * Records a user login
   */
  recordLogin(): void {
    this._lastLoginAt = new Date();
    this._updatedAt = new Date();
  }

  /**
   * Verifies user email
   */
  verifyEmail(): void {
    this._emailVerified = true;
    this._updatedAt = new Date();
  }

  /**
   * Deactivates user account
   */
  deactivate(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  /**
   * Activates user account
   */
  activate(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  /**
   * Checks if user can perform actions
   */
  canPerformAction(): boolean {
    return this._isActive && this._emailVerified;
  }

  /**
   * Gets user's primary location for tax calculations
   */
  getPrimaryLocation(): string | null {
    return this._profile?.location || null;
  }

  /**
   * Gets user's preferred currency
   */
  getPreferredCurrency(): string {
    return this._preferences?.currency || 'USD';
  }

  /**
   * Gets user's tax regime preference
   */
  getTaxRegime(): string {
    return this._preferences?.taxRegime || 'new';
  }

  // Validation methods
  private validateUserProps(props: UserProps): void {
    if (!props.id || props.id.trim().length === 0) {
      throw new UserValidationError('User ID is required');
    }

    this.validateEmail(props.email);

    if (props.createdAt > props.updatedAt) {
      throw new UserValidationError('Created date cannot be after updated date');
    }
  }

  private validateEmail(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      throw new UserValidationError('Invalid email format');
    }
  }

  // Getters (immutable access to properties)
  get id(): string { return this._id; }
  get email(): string { return this._email; }
  get emailVerified(): boolean { return this._emailVerified; }
  get createdAt(): Date { return new Date(this._createdAt); }
  get updatedAt(): Date { return new Date(this._updatedAt); }
  get lastLoginAt(): Date | undefined { 
    return this._lastLoginAt ? new Date(this._lastLoginAt) : undefined; 
  }
  get isActive(): boolean { return this._isActive; }
  get profile(): UserProfile | undefined { return this._profile; }
  get preferences(): UserPreferences | undefined { return this._preferences; }

  /**
   * Converts entity to plain object for serialization
   */
  toJSON(): UserProps {
    return {
      id: this._id,
      email: this._email,
      emailVerified: this._emailVerified,
      createdAt: this._createdAt,
      updatedAt: this._updatedAt,
      lastLoginAt: this._lastLoginAt,
      isActive: this._isActive,
      profile: this._profile,
      preferences: this._preferences,
    };
  }
} 