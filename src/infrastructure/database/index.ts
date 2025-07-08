// Database configuration
export { DatabaseConfig, DatabaseConfigOptions } from './config/DatabaseConfig';

// Database connection
export { DatabaseConnection } from './connection/DatabaseConnection';

// Database entities
export { UserEntity } from './entities/UserEntity';
export { ExpenseEntity } from './entities/ExpenseEntity';

// Repository interfaces
export { 
  BaseRepository, 
  PaginatedRepository, 
  RepositoryResult, 
  PaginationParams, 
  PaginatedResult 
} from './repositories/BaseRepository';
export { UserRepository } from './repositories/UserRepository';
export { ExpenseRepository } from './repositories/ExpenseRepository';

// Repository implementations
export { SupabaseUserRepository } from './repositories/implementations/SupabaseUserRepository';

// Repository factory
export { RepositoryFactory } from './repositories/RepositoryFactory'; 