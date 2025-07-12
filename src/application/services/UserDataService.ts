import { supabase } from '@/integrations/supabase/client';

export interface UserData {
  id: string;
  userId: string;
  dataName: string;
  dataType: string;
  dataContent: any;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDataParams {
  userId: string;
  dataName: string;
  dataType: string;
  dataContent: any;
  isFavorite?: boolean;
}

export interface UpdateUserDataParams {
  dataName?: string;
  dataType?: string;
  dataContent?: any;
  isFavorite?: boolean;
}

export class UserDataService {
  /**
   * Creates new user data
   */
  static async createUserData(params: CreateUserDataParams): Promise<{ data: UserData | null; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .insert({
          user_id: params.userId,
          data_name: params.dataName,
          data_type: params.dataType,
          data_content: params.dataContent,
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
      return { data: null, error };
    }
  }

  /**
   * Gets user data by ID
   */
  static async getUserDataById(id: string): Promise<{ data: UserData | null; error: any }> {
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
      return { data: null, error };
    }
  }

  /**
   * Gets all user data for a specific user
   */
  static async getUserDataByUserId(userId: string): Promise<{ data: UserData[] | null; error: any }> {
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
      return { data: null, error };
    }
  }

  /**
   * Gets user data by type
   */
  static async getUserDataByType(userId: string, dataType: string): Promise<{ data: UserData[] | null; error: any }> {
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
      return { data: null, error };
    }
  }

  /**
   * Updates user data
   */
  static async updateUserData(id: string, updates: UpdateUserDataParams): Promise<{ data: UserData | null; error: any }> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      if (updates.dataName !== undefined) updateData.data_name = updates.dataName;
      if (updates.dataType !== undefined) updateData.data_type = updates.dataType;
      if (updates.dataContent !== undefined) updateData.data_content = updates.dataContent;
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
      return { data: null, error };
    }
  }

  /**
   * Deletes user data
   */
  static async deleteUserData(id: string): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase
        .from('user_data')
        .delete()
        .eq('id', id);

      return { data, error };
    } catch (error) {
      console.error('Error deleting user data:', error);
      return { data: null, error };
    }
  }

  /**
   * Gets favorite user data
   */
  static async getFavoriteUserData(userId: string): Promise<{ data: UserData[] | null; error: any }> {
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
      return { data: null, error };
    }
  }

  /**
   * Maps database row to UserData interface
   */
  private static mapToUserData(data: any): UserData {
    return {
      id: data.id,
      userId: data.user_id,
      dataName: data.data_name,
      dataType: data.data_type,
      dataContent: data.data_content,
      isFavorite: data.is_favorite || false,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
