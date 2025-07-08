/**
 * API Response Types
 * 
 * This module defines common types for API operations across the application.
 * These types ensure consistency in API communication and error handling.
 */

/**
 * Base API response interface
 */
export interface ApiResponse<T = unknown> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

/**
 * Paginated API response interface
 */
export interface PaginatedApiResponse<T = unknown> extends ApiResponse<T[]> {
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
 * API error response interface
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
    timestamp: string;
  };
}

/**
 * API request options interface
 */
export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
  retries?: number;
  cache?: boolean;
}

/**
 * API client configuration interface
 */
export interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
  authToken?: string;
}

/**
 * HTTP status codes enum
 */
export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
}

/**
 * API error codes enum
 */
export enum ApiErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR = 'NOT_FOUND_ERROR',
  CONFLICT_ERROR = 'CONFLICT_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

/**
 * API operation result interface
 */
export interface ApiOperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: ApiErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * API query parameters interface
 */
export interface ApiQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, unknown>;
  include?: string[];
  fields?: string[];
}

/**
 * API upload progress interface
 */
export interface ApiUploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  speed: number; // bytes per second
  estimatedTime: number; // seconds
}

/**
 * API cache entry interface
 */
export interface ApiCacheEntry<T = unknown> {
  data: T;
  timestamp: number;
  ttl: number; // time to live in milliseconds
  key: string;
}

/**
 * API rate limit information interface
 */
export interface ApiRateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // timestamp when limit resets
  retryAfter?: number; // seconds to wait before retry
}

/**
 * API health check response interface
 */
export interface ApiHealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  services: {
    database: 'healthy' | 'degraded' | 'unhealthy';
    cache: 'healthy' | 'degraded' | 'unhealthy';
    external: 'healthy' | 'degraded' | 'unhealthy';
  };
  metrics?: {
    responseTime: number;
    errorRate: number;
    requestCount: number;
  };
} 