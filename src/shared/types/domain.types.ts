/**
 * Domain Types
 * 
 * This module defines common types for domain entities and business logic
 * across the application. These types ensure consistency in domain modeling.
 */

/**
 * Base entity interface
 */
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Auditable entity interface
 */
export interface AuditableEntity extends BaseEntity {
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: Date;
  isDeleted: boolean;
}

/**
 * Soft deletable entity interface
 */
export interface SoftDeletableEntity extends BaseEntity {
  deletedAt?: Date;
  isDeleted: boolean;
}

/**
 * Pagination parameters interface
 */
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

/**
 * Paginated result interface
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Sorting parameters interface
 */
export interface SortParams {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Filter parameters interface
 */
export interface FilterParams {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'nin' | 'like' | 'ilike' | 'contains';
  value: unknown;
}

/**
 * Search parameters interface
 */
export interface SearchParams {
  query: string;
  fields: string[];
  operator: 'or' | 'and';
}

/**
 * Query parameters interface
 */
export interface QueryParams {
  pagination?: PaginationParams;
  sorting?: SortParams[];
  filters?: FilterParams[];
  search?: SearchParams;
  include?: string[];
  select?: string[];
}

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Validation error interface
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: any;
}

/**
 * Validation warning interface
 */
export interface ValidationWarning {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

/**
 * Business rule interface
 */
export interface BusinessRule<T = any> {
  name: string;
  description: string;
  validate: (entity: T) => ValidationResult;
  priority: 'high' | 'medium' | 'low';
}

/**
 * Domain event interface
 */
export interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  aggregateType: string;
  data: Record<string, any>;
  metadata: {
    timestamp: Date;
    version: number;
    correlationId?: string;
    causationId?: string;
  };
}

/**
 * Domain event handler interface
 */
export interface DomainEventHandler<T extends DomainEvent = DomainEvent> {
  eventType: string;
  handle: (event: T) => Promise<void>;
  priority: number;
}

/**
 * Repository interface
 */
export interface Repository<T extends BaseEntity> {
  findById(id: string): Promise<T | null>;
  findByIds(ids: string[]): Promise<T[]>;
  findOne(params: QueryParams): Promise<T | null>;
  findMany(params: QueryParams): Promise<PaginatedResult<T>>;
  create(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
  count(params?: QueryParams): Promise<number>;
}

/**
 * Unit of work interface
 */
export interface UnitOfWork {
  beginTransaction(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  isActive(): boolean;
}

/**
 * Specification interface
 */
export interface Specification<T> {
  isSatisfiedBy(entity: T): boolean;
  and(other: Specification<T>): Specification<T>;
  or(other: Specification<T>): Specification<T>;
  not(): Specification<T>;
}

/**
 * Money value object interface
 */
export interface Money {
  amount: number;
  currency: string;
  equals(other: Money): boolean;
  add(other: Money): Money;
  subtract(other: Money): Money;
  multiply(factor: number): Money;
  divide(divisor: number): Money;
  isPositive(): boolean;
  isNegative(): boolean;
  isZero(): boolean;
  format(): string;
}

/**
 * Date range interface
 */
export interface DateRange {
  start: Date;
  end: Date;
  contains(date: Date): boolean;
  overlaps(other: DateRange): boolean;
  duration(): number; // in milliseconds
  days(): number;
  months(): number;
  years(): number;
}

/**
 * Address value object interface
 */
export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  formatted(): string;
  equals(other: Address): boolean;
}

/**
 * Email value object interface
 */
export interface Email {
  value: string;
  isValid(): boolean;
  domain(): string;
  localPart(): string;
  equals(other: Email): boolean;
}

/**
 * Phone number value object interface
 */
export interface PhoneNumber {
  value: string;
  countryCode: string;
  isValid(): boolean;
  format(): string;
  equals(other: PhoneNumber): boolean;
}

/**
 * Result type for operations that can fail
 */
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

/**
 * Optional type for nullable values
 */
export type Optional<T> = T | null | undefined;

/**
 * Required fields utility type
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Optional fields utility type
 */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Deep partial utility type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Deep required utility type
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Entity ID type
 */
export type EntityId = string;

/**
 * Timestamp type
 */
export type Timestamp = Date | string | number; 