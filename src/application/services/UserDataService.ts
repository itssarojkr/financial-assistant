import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';
import type { Json } from '@/integrations/supabase/types';

export interface UserData {
  id: string;
  userId: string;
  dataName: string;
  dataType: string;
  dataContent: unknown;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDataParams {
  userId: string;
  dataName: string;
  dataType: string;
  dataContent: unknown;
  isFavorite?: boolean;
}

export interface UpdateUserDataParams {
  dataName?: string;
  dataType?: string;
  dataContent?: unknown;
  isFavorite?: boolean;
}

export interface UserDataServiceError {
  message: string;
  code?: string | undefined;
  details?: string | undefined;
}

export interface UserDataServiceResponse<T> {
  data: T | null;
  error: UserDataServiceError | PostgrestError | null;
}

export interface UserDataRecord {
  id: string;
  user_id: string;
  data_name: string;
  data_type: string;
  data_content: Json;
  is_favorite: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export class UserDataService {
  /**
   * Creates new user data
   */
  static async createUserData(params: CreateUserDataParams): Promise<UserDataServiceResponse<UserData>> {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .insert({
          user_id: params.userId,
          data_name: params.dataName,
          data_type: params.dataType,
          data_content: params.dataContent as unknown as Json,
          is_favorite: params.isFavorite || false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return {
        data: data ? this.mapToUserData(data) : null,
        error: null
      };
    } catch (error) {
      console.error('Error creating user data:', error);
      const serviceError: UserDataServiceError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: error instanceof PostgrestError ? error.code : undefined,
        details: error instanceof PostgrestError ? error.details : undefined,
      };
      return { data: null, error: serviceError };
    }
  }

  /**
   * Gets user data by ID
   */
  static async getUserDataById(id: string): Promise<UserDataServiceResponse<UserData>> {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      return {
        data: data ? this.mapToUserData(data) : null,
        error: null
      };
    } catch (error) {
      console.error('Error fetching user data by ID:', error);
      const serviceError: UserDataServiceError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: error instanceof PostgrestError ? error.code : undefined,
        details: error instanceof PostgrestError ? error.details : undefined,
      };
      return { data: null, error: serviceError };
    }
  }

  /**
   * Gets all user data for a specific user
   */
  static async getUserDataByUserId(userId: string): Promise<UserDataServiceResponse<UserData[]>> {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return {
        data: data ? data.map(this.mapToUserData) : null,
        error: null
      };
    } catch (error) {
      console.error('Error fetching user data by user ID:', error);
      const serviceError: UserDataServiceError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: error instanceof PostgrestError ? error.code : undefined,
        details: error instanceof PostgrestError ? error.details : undefined,
      };
      return { data: null, error: serviceError };
    }
  }

  /**
   * Gets user data by type
   */
  static async getUserDataByType(userId: string, dataType: string): Promise<UserDataServiceResponse<UserData[]>> {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', userId)
        .eq('data_type', dataType)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return {
        data: data ? data.map(this.mapToUserData) : null,
        error: null
      };
    } catch (error) {
      console.error('Error fetching user data by type:', error);
      const serviceError: UserDataServiceError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: error instanceof PostgrestError ? error.code : undefined,
        details: error instanceof PostgrestError ? error.details : undefined,
      };
      return { data: null, error: serviceError };
    }
  }

  /**
   * Updates user data
   */
  static async updateUserData(id: string, updates: UpdateUserDataParams): Promise<UserDataServiceResponse<UserData>> {
    try {
      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (updates.dataName !== undefined) updateData.data_name = updates.dataName;
      if (updates.dataType !== undefined) updateData.data_type = updates.dataType;
      if (updates.dataContent !== undefined) updateData.data_content = updates.dataContent as unknown as Json;
      if (updates.isFavorite !== undefined) updateData.is_favorite = updates.isFavorite;

      const { data, error } = await supabase
        .from('user_data')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data: data ? this.mapToUserData(data) : null,
        error: null
      };
    } catch (error) {
      console.error('Error updating user data:', error);
      const serviceError: UserDataServiceError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: error instanceof PostgrestError ? error.code : undefined,
        details: error instanceof PostgrestError ? error.details : undefined,
      };
      return { data: null, error: serviceError };
    }
  }

  /**
   * Deletes user data
   */
  static async deleteUserData(id: string): Promise<UserDataServiceResponse<{ success: boolean }>> {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { data: { success: true }, error: null };
    } catch (error) {
      console.error('Error deleting user data:', error);
      const serviceError: UserDataServiceError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: error instanceof PostgrestError ? error.code : undefined,
        details: error instanceof PostgrestError ? error.details : undefined,
      };
      return { data: null, error: serviceError };
    }
  }

  /**
   * Gets favorite user data
   */
  static async getFavoriteUserData(userId: string): Promise<UserDataServiceResponse<UserData[]>> {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .select('*')
        .eq('user_id', userId)
        .eq('is_favorite', true)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      return {
        data: data ? data.map(this.mapToUserData) : null,
        error: null
      };
    } catch (error) {
      console.error('Error fetching favorite user data:', error);
      const serviceError: UserDataServiceError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: error instanceof PostgrestError ? error.code : undefined,
        details: error instanceof PostgrestError ? error.details : undefined,
      };
      return { data: null, error: serviceError };
    }
  }

  /**
   * Toggles favorite status
   */
  static async toggleFavorite(id: string): Promise<UserDataServiceResponse<UserData>> {
    try {
      const currentData = await this.getUserDataById(id);
      if (!currentData.data) {
        throw new Error('User data not found');
      }

      const { data, error } = await supabase
        .from('user_data')
        .update({
          is_favorite: !currentData.data.isFavorite,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        data: data ? this.mapToUserData(data) : null,
        error: null
      };
    } catch (error) {
      console.error('Error toggling favorite status:', error);
      const serviceError: UserDataServiceError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: error instanceof PostgrestError ? error.code : undefined,
        details: error instanceof PostgrestError ? error.details : undefined,
      };
      return { data: null, error: serviceError };
    }
  }

  /**
   * Maps database record to UserData object
   */
  private static mapToUserData(data: UserDataRecord): UserData {
    return {
      id: data.id,
      userId: data.user_id,
      dataName: data.data_name,
      dataType: data.data_type,
      dataContent: data.data_content as unknown,
      isFavorite: data.is_favorite || false,
      createdAt: new Date(data.created_at || ''),
      updatedAt: new Date(data.updated_at || ''),
    };
  }
}
