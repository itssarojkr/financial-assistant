/**
 * Base repository interface defining common CRUD operations
 * 
 * This interface provides a contract for all repository implementations
 * and ensures consistent data access patterns across the application.
 */

export interface BaseRepository<T, ID = string> {
  /**
   * Finds an entity by its ID
   * @param id - The unique identifier of the entity
   * @returns Promise resolving to the entity or null if not found
   */
  findById(id: ID): Promise<T | null>;

  /**
   * Finds all entities
   * @param limit - Optional limit on the number of results
   * @param offset - Optional offset for pagination
   * @returns Promise resolving to an array of entities
   */
  findAll(limit?: number, offset?: number): Promise<T[]>;

  /**
   * Creates a new entity
   * @param entity - The entity to create
   * @returns Promise resolving to the created entity
   */
  create(entity: T): Promise<T>;

  /**
   * Updates an existing entity
   * @param id - The unique identifier of the entity to update
   * @param entity - The updated entity data
   * @returns Promise resolving to the updated entity
   */
  update(id: ID, entity: Partial<T>): Promise<T>;

  /**
   * Deletes an entity by its ID
   * @param id - The unique identifier of the entity to delete
   * @returns Promise resolving to true if deleted, false if not found
   */
  delete(id: ID): Promise<boolean>;

  /**
   * Checks if an entity exists by its ID
   * @param id - The unique identifier to check
   * @returns Promise resolving to true if exists, false otherwise
   */
  exists(id: ID): Promise<boolean>;

  /**
   * Counts the total number of entities
   * @returns Promise resolving to the total count
   */
  count(): Promise<number>;
}

/**
 * Repository result wrapper for consistent error handling
 */
export interface RepositoryResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Pagination parameters for repository queries
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

/**
 * Paginated result wrapper
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

/**
 * Base repository with pagination support
 */
export interface PaginatedRepository<T, ID = string> extends BaseRepository<T, ID> {
  /**
   * Finds entities with pagination
   * @param params - Pagination parameters
   * @returns Promise resolving to paginated results
   */
  findWithPagination(params: PaginationParams): Promise<PaginatedResult<T>>;
} 