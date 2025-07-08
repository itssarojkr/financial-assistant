/**
 * UserProfile - Value object representing user profile information
 * 
 * This encapsulates user profile data with validation and business rules.
 */

export interface UserProfileProps {
  firstName?: string | undefined;
  lastName?: string | undefined;
  location?: string | undefined;
  occupation?: string | undefined;
  company?: string | undefined;
  phoneNumber?: string | undefined;
  dateOfBirth?: Date | undefined;
}

export interface CreateUserProfileParams {
  firstName?: string;
  lastName?: string;
  location?: string;
  occupation?: string;
  company?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
}

/**
 * UserProfile value object with validation
 */
export class UserProfile {
  private readonly _firstName?: string | undefined;
  private readonly _lastName?: string | undefined;
  private readonly _location?: string | undefined;
  private readonly _occupation?: string | undefined;
  private readonly _company?: string | undefined;
  private readonly _phoneNumber?: string | undefined;
  private readonly _dateOfBirth?: Date | undefined;

  constructor(props: UserProfileProps) {
    this.validateProfileProps(props);
    
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._location = props.location;
    this._occupation = props.occupation;
    this._company = props.company;
    this._phoneNumber = props.phoneNumber;
    this._dateOfBirth = props.dateOfBirth;
  }

  /**
   * Creates a new UserProfile instance
   */
  static create(params: CreateUserProfileParams): UserProfile {
    return new UserProfile(params);
  }

  /**
   * Updates profile with new data
   */
  update(params: Partial<UserProfileProps>): UserProfile {
    return new UserProfile({
      firstName: params.firstName ?? this._firstName,
      lastName: params.lastName ?? this._lastName,
      location: params.location ?? this._location,
      occupation: params.occupation ?? this._occupation,
      company: params.company ?? this._company,
      phoneNumber: params.phoneNumber ?? this._phoneNumber,
      dateOfBirth: params.dateOfBirth ?? this._dateOfBirth,
    });
  }

  /**
   * Gets full name
   */
  getFullName(): string {
    const parts = [this._firstName, this._lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'Unknown User';
  }

  /**
   * Gets display name (first name or full name)
   */
  getDisplayName(): string {
    return this._firstName || this.getFullName();
  }

  /**
   * Checks if profile is complete
   */
  isComplete(): boolean {
    return !!(this._firstName && this._lastName && this._location);
  }

  /**
   * Gets age if date of birth is available
   */
  getAge(): number | null {
    if (!this._dateOfBirth) return null;
    
    const today = new Date();
    const birthDate = new Date(this._dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  // Validation methods
  private validateProfileProps(props: UserProfileProps): void {
    if (props.firstName && props.firstName.trim().length === 0) {
      throw new Error('First name cannot be empty');
    }

    if (props.lastName && props.lastName.trim().length === 0) {
      throw new Error('Last name cannot be empty');
    }

    if (props.phoneNumber && !this.isValidPhoneNumber(props.phoneNumber)) {
      throw new Error('Invalid phone number format');
    }

    if (props.dateOfBirth && props.dateOfBirth > new Date()) {
      throw new Error('Date of birth cannot be in the future');
    }
  }

  private isValidPhoneNumber(phone: string): boolean {
    // Basic phone number validation - can be enhanced based on requirements
    const phoneRegex = /^[+]?([1-9][\d]{0,15})$/;
    return phoneRegex.test(phone.replace(/[\s\-()]/g, ''));
  }

  // Getters
  get firstName(): string | undefined { return this._firstName; }
  get lastName(): string | undefined { return this._lastName; }
  get location(): string | undefined { return this._location; }
  get occupation(): string | undefined { return this._occupation; }
  get company(): string | undefined { return this._company; }
  get phoneNumber(): string | undefined { return this._phoneNumber; }
  get dateOfBirth(): Date | undefined { 
    return this._dateOfBirth ? new Date(this._dateOfBirth) : undefined; 
  }

  /**
   * Converts to plain object for serialization
   */
  toJSON(): UserProfileProps {
    return {
      firstName: this._firstName,
      lastName: this._lastName,
      location: this._location,
      occupation: this._occupation,
      company: this._company,
      phoneNumber: this._phoneNumber,
      dateOfBirth: this._dateOfBirth,
    };
  }

  /**
   * Creates UserProfile from JSON data
   */
  static fromJSON(data: unknown): UserProfile {
    const d = data as Record<string, unknown>;
    return new UserProfile({
      firstName: (typeof d.firstName === 'string') ? d.firstName : undefined,
      lastName: (typeof d.lastName === 'string') ? d.lastName : undefined,
      location: (typeof d.location === 'string') ? d.location : undefined,
      occupation: (typeof d.occupation === 'string') ? d.occupation : undefined,
      company: (typeof d.company === 'string') ? d.company : undefined,
      phoneNumber: (typeof d.phoneNumber === 'string') ? d.phoneNumber : undefined,
      dateOfBirth: d.dateOfBirth ? new Date(d.dateOfBirth as string) : undefined,
    });
  }
} 