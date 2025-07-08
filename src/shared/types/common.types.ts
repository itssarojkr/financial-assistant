/**
 * Common Types
 * 
 * This module defines common types and interfaces used across the application.
 * These types provide consistency and reusability throughout the codebase.
 */

/**
 * Environment types
 */
export type Environment = 'development' | 'staging' | 'production' | 'test';

/**
 * Log level types
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * ID types
 */
export type UUID = string;
export type ID = string | number;

/**
 * Date and time types
 */
export type ISODateString = string;
export type UnixTimestamp = number;
export type DateLike = Date | string | number;

/**
 * Primitive types
 */
export type Primitive = string | number | boolean | null | undefined;
export type JSONValue = Primitive | JSONObject | JSONArray;
export type JSONObject = { [key: string]: JSONValue };
export type JSONArray = JSONValue[];

/**
 * Function types
 */
export type AsyncFunction<T = unknown, R = unknown> = (arg: T) => Promise<R>;
export type SyncFunction<T = unknown, R = unknown> = (arg: T) => R;
export type VoidFunction = () => void;
export type AsyncVoidFunction = () => Promise<void>;

/**
 * Object types
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type Mutable<T> = {
  -readonly [P in keyof T]: T[P];
};

export type NonNullable<T> = {
  [P in keyof T]: NonNullable<T[P]>;
};

/**
 * Array types
 */
export type NonEmptyArray<T> = [T, ...T[]];
export type ReadonlyArray<T> = readonly T[];

/**
 * String types
 */
export type StringLiteral<T extends string> = T;
export type StringEnum<T> = T extends string ? T : never;

/**
 * Number types
 */
export type PositiveNumber = number & { __brand: 'PositiveNumber' };
export type NegativeNumber = number & { __brand: 'NegativeNumber' };
export type NonZeroNumber = number & { __brand: 'NonZeroNumber' };

/**
 * Branded types
 */
export type Branded<T, B> = T & { __brand: B };

/**
 * Email type
 */
export type Email = Branded<string, 'Email'>;

/**
 * URL type
 */
export type URL = Branded<string, 'URL'>;

/**
 * Phone number type
 */
export type PhoneNumber = Branded<string, 'PhoneNumber'>;

/**
 * Currency code type
 */
export type CurrencyCode = Branded<string, 'CurrencyCode'>;

/**
 * Country code type
 */
export type CountryCode = Branded<string, 'CountryCode'>;

/**
 * Language code type
 */
export type LanguageCode = Branded<string, 'LanguageCode'>;

/**
 * Timezone type
 */
export type Timezone = Branded<string, 'Timezone'>;

/**
 * Base configuration interface
 */
export interface BaseConfig {
  environment: Environment;
  version: string;
  debug: boolean;
  timestamp: Date;
}

/**
 * Feature flag interface
 */
export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description?: string;
  rolloutPercentage?: number;
  dependencies?: string[];
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: ValidationRule[];
  defaultValue?: unknown;
  disabled?: boolean;
  hidden?: boolean;
  helpText?: string;
  errorMessage?: string;
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'email' | 'url' | 'min' | 'max' | 'custom';
  value?: unknown;
  message: string;
  validator?: (value: unknown) => boolean | string;
}

export interface FormData {
  [key: string]: unknown;
}

export interface FormErrors {
  [key: string]: string;
}

export interface FormState {
  data: FormData;
  errors: FormErrors;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
  isSubmitted: boolean;
}

export interface FormConfig {
  fields: FormField[];
  onSubmit: (data: FormData) => Promise<void> | void;
  onValidate?: (data: FormData) => FormErrors;
  initialData?: FormData;
  submitButtonText?: string;
  cancelButtonText?: string;
  showCancelButton?: boolean;
  onCancel?: () => void;
}

export interface TableColumn<T = unknown> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: unknown, row: T, index: number) => React.ReactNode;
  formatter?: (value: unknown) => string;
}

export interface TableConfig<T = unknown> {
  columns: TableColumn<T>[];
  data: T[];
  sortable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  onSort?: (key: keyof T | string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, unknown>) => void;
  onSelect?: (selectedRows: T[]) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
}

export interface PaginationConfig {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  pageSizeOptions: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  showFirstLast?: boolean;
  showPageNumbers?: boolean;
  maxPageNumbers?: number;
}

export interface ModalConfig {
  title: string;
  content: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closable?: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancelButton?: boolean;
  showConfirmButton?: boolean;
  confirmButtonType?: 'primary' | 'secondary' | 'danger';
  cancelButtonType?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
  error?: string;
}

export interface ToastConfig {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

export interface NotificationConfig {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    url: string;
  };
  onMarkAsRead?: () => void;
  onDelete?: () => void;
}

export interface SearchConfig {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  onClear?: () => void;
  debounce?: number;
  suggestions?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'date' | 'dateRange' | 'number' | 'numberRange' | 'text' | 'boolean';
  options?: Array<{ value: string; label: string }>;
  value: unknown;
  onChange: (value: unknown) => void;
  placeholder?: string;
  multiple?: boolean;
  clearable?: boolean;
  disabled?: boolean;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
  label: string;
}

export interface DataGridConfig<T = unknown> {
  data: T[];
  columns: TableColumn<T>[];
  sortable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  searchable?: boolean;
  exportable?: boolean;
  onSort?: (key: keyof T | string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, unknown>) => void;
  onSelect?: (selectedRows: T[]) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSearch?: (searchTerm: string) => void;
  onExport?: (format: 'csv' | 'excel' | 'pdf') => void;
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
}

export interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'area' | 'scatter' | 'bubble' | 'radar' | 'polarArea';
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
      fill?: boolean;
      tension?: number;
    }>;
  };
  options?: Record<string, unknown>;
  height?: string | number;
  width?: string | number;
}

export interface DashboardConfig {
  title: string;
  description?: string;
  widgets: Array<{
    id: string;
    type: string;
    title: string;
    config: Record<string, unknown>;
    position: { x: number; y: number; w: number; h: number };
  }>;
  layout: 'grid' | 'list' | 'custom';
  refreshInterval?: number;
  onRefresh?: () => void;
  onWidgetEdit?: (widgetId: string) => void;
  onWidgetDelete?: (widgetId: string) => void;
  onLayoutChange?: (layout: 'grid' | 'list' | 'custom') => void;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    dataSharing: boolean;
    analytics: boolean;
  };
  accessibility: {
    fontSize: 'small' | 'medium' | 'large';
    highContrast: boolean;
    reduceMotion: boolean;
    screenReader: boolean;
  };
  display: {
    compactMode: boolean;
    showAvatars: boolean;
    showTimestamps: boolean;
    showReadReceipts: boolean;
  };
}

export interface AppConfig {
  name: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  apiUrl: string;
  websocketUrl?: string;
  features: Record<string, boolean>;
  limits: Record<string, number>;
  integrations: Record<string, unknown>;
}

/**
 * Error interface
 */
export interface AppError extends Error {
  code: string;
  statusCode?: number;
  details?: Record<string, unknown>;
  timestamp: Date;
  context?: string;
}

/**
 * Log entry interface
 */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  data?: Record<string, unknown>;
  error?: Error;
  userId?: string;
  requestId?: string;
}

/**
 * Cache entry interface
 */
export interface CacheEntry<T = unknown> {
  key: string;
  value: T;
  timestamp: Date;
  ttl: number;
  tags?: string[];
}

/**
 * Cache interface
 */
export interface Cache {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number, tags?: string[]): Promise<void>;
  delete(key: string): Promise<void>;
  clear(tags?: string[]): Promise<void>;
  has(key: string): Promise<boolean>;
}

/**
 * Event interface
 */
export interface Event<T = unknown> {
  id: string;
  type: string;
  data: T;
  timestamp: Date;
  source: string;
  version: string;
  correlationId?: string;
  causationId?: string;
}

/**
 * Event handler interface
 */
export interface EventHandler<T = unknown> {
  eventType: string;
  handle(event: Event<T>): Promise<void>;
  priority: number;
}

/**
 * Event bus interface
 */
export interface EventBus {
  publish<T>(event: Event<T>): Promise<void>;
  subscribe<T>(handler: EventHandler<T>): void;
  unsubscribe(handler: EventHandler): void;
}

/**
 * Metrics interface
 */
export interface Metric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

/**
 * Metrics collector interface
 */
export interface MetricsCollector {
  increment(name: string, value?: number, tags?: Record<string, string>): void;
  gauge(name: string, value: number, tags?: Record<string, string>): void;
  histogram(name: string, value: number, tags?: Record<string, string>): void;
  timing(name: string, duration: number, tags?: Record<string, string>): void;
}

/**
 * Health check interface
 */
export interface HealthCheck {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  details?: Record<string, unknown>;
  timestamp: Date;
}

/**
 * Health check result interface
 */
export interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheck[];
  timestamp: Date;
  version: string;
  uptime: number;
}

/**
 * Rate limiter interface
 */
export interface RateLimiter {
  isAllowed(key: string, limit: number, window: number): Promise<boolean>;
  getRemaining(key: string): Promise<number>;
  getResetTime(key: string): Promise<Date>;
}

/**
 * Encryption interface
 */
export interface Encryption {
  encrypt(data: string): Promise<string>;
  decrypt(data: string): Promise<string>;
  hash(data: string): Promise<string>;
  compare(data: string, hash: string): Promise<boolean>;
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
  value?: unknown;
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