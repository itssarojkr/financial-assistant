export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      budgets: {
        Row: {
          amount: number
          calculation_id: string | null
          category_id: number | null
          created_at: string | null
          currency: string | null
          end_date: string | null
          id: string
          period: string
          start_date: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          calculation_id?: string | null
          category_id?: number | null
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          id?: string
          period: string
          start_date?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          calculation_id?: string | null
          category_id?: number | null
          created_at?: string | null
          currency?: string | null
          end_date?: string | null
          id?: string
          period?: string
          start_date?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_calculation_id_fkey"
            columns: ["calculation_id"]
            isOneToOne: false
            referencedRelation: "user_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          area_km2: number | null
          created_at: string | null
          id: number
          latitude: number | null
          longitude: number | null
          name: string
          population: number | null
          state_id: number
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          area_km2?: number | null
          created_at?: string | null
          id?: number
          latitude?: number | null
          longitude?: number | null
          name: string
          population?: number | null
          state_id: number
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          area_km2?: number | null
          created_at?: string | null
          id?: number
          latitude?: number | null
          longitude?: number | null
          name?: string
          population?: number | null
          state_id?: number
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cities_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "location_hierarchy"
            referencedColumns: ["state_id"]
          },
          {
            foreignKeyName: "cities_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      countries: {
        Row: {
          code: string
          created_at: string | null
          currency: string
          gdp_per_capita: number | null
          id: number
          name: string
          population: number | null
          region: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          currency: string
          gdp_per_capita?: number | null
          id?: number
          name: string
          population?: number | null
          region: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          currency?: string
          gdp_per_capita?: number | null
          id?: number
          name?: string
          population?: number | null
          region?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      expense_categories: {
        Row: {
          color: string | null
          icon: string | null
          id: number
          is_default: boolean | null
          name: string
        }
        Insert: {
          color?: string | null
          icon?: string | null
          id?: number
          is_default?: boolean | null
          name: string
        }
        Update: {
          color?: string | null
          icon?: string | null
          id?: number
          is_default?: boolean | null
          name?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          calculation_id: string | null
          category_id: number | null
          created_at: string | null
          currency: string
          date: string
          description: string | null
          id: string
          location: string | null
          source: string | null
          user_id: string
        }
        Insert: {
          amount: number
          calculation_id?: string | null
          category_id?: number | null
          created_at?: string | null
          currency: string
          date: string
          description?: string | null
          id?: string
          location?: string | null
          source?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          calculation_id?: string | null
          category_id?: number | null
          created_at?: string | null
          currency?: string
          date?: string
          description?: string | null
          id?: string
          location?: string | null
          source?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_calculation_id_fkey"
            columns: ["calculation_id"]
            isOneToOne: false
            referencedRelation: "user_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      localities: {
        Row: {
          area_km2: number | null
          city_id: number
          created_at: string | null
          id: number
          name: string
          population: number | null
          updated_at: string | null
        }
        Insert: {
          area_km2?: number | null
          city_id: number
          created_at?: string | null
          id?: number
          name: string
          population?: number | null
          updated_at?: string | null
        }
        Update: {
          area_km2?: number | null
          city_id?: number
          created_at?: string | null
          id?: number
          name?: string
          population?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "localities_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "localities_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "location_hierarchy"
            referencedColumns: ["city_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      spending_alerts: {
        Row: {
          active: boolean | null
          calculation_id: string | null
          category_id: number | null
          created_at: string | null
          currency: string | null
          id: string
          period: string
          severity: string | null
          threshold: number
          type: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active?: boolean | null
          calculation_id?: string | null
          category_id?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          period: string
          severity?: string | null
          threshold: number
          type?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active?: boolean | null
          calculation_id?: string | null
          category_id?: number | null
          created_at?: string | null
          currency?: string | null
          id?: string
          period?: string
          severity?: string | null
          threshold?: number
          type?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "spending_alerts_calculation_id_fkey"
            columns: ["calculation_id"]
            isOneToOne: false
            referencedRelation: "user_data"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "spending_alerts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      states: {
        Row: {
          area_km2: number | null
          capital: string | null
          code: string | null
          country_id: number
          created_at: string | null
          id: number
          name: string
          population: number | null
          updated_at: string | null
        }
        Insert: {
          area_km2?: number | null
          capital?: string | null
          code?: string | null
          country_id: number
          created_at?: string | null
          id?: number
          name: string
          population?: number | null
          updated_at?: string | null
        }
        Update: {
          area_km2?: number | null
          capital?: string | null
          code?: string | null
          country_id?: number
          created_at?: string | null
          id?: number
          name?: string
          population?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "states_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "countries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "states_country_id_fkey"
            columns: ["country_id"]
            isOneToOne: false
            referencedRelation: "location_hierarchy"
            referencedColumns: ["country_id"]
          },
        ]
      }
      user_data: {
        Row: {
          created_at: string | null
          data_content: Json
          data_name: string
          data_type: string
          id: string
          is_favorite: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data_content: Json
          data_name: string
          data_type: string
          id?: string
          is_favorite?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data_content?: Json
          data_name?: string
          data_type?: string
          id?: string
          is_favorite?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string | null
          default_currency: string | null
          language: string | null
          notifications: Json | null
          sms_scanning_enabled: boolean | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          default_currency?: string | null
          language?: string | null
          notifications?: Json | null
          sms_scanning_enabled?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          default_currency?: string | null
          language?: string | null
          notifications?: Json | null
          sms_scanning_enabled?: boolean | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string | null
          id: string
          session_data: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          session_data?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          session_data?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      location_hierarchy: {
        Row: {
          city_id: number | null
          city_name: string | null
          city_population: number | null
          country_code: string | null
          country_id: number | null
          country_name: string | null
          currency: string | null
          latitude: number | null
          longitude: number | null
          region: string | null
          state_capital: string | null
          state_code: string | null
          state_id: number | null
          state_name: string | null
          timezone: string | null
        }
        Relationships: []
      }
      mv_budget_vs_actual: {
        Row: {
          actual_amount: number | null
          budget_amount: number | null
          category_id: number | null
          difference: number | null
          period: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      mv_monthly_expense_summary: {
        Row: {
          avg_amount: number | null
          category_id: number | null
          month: string | null
          total_amount: number | null
          transaction_count: number | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      get_calculation_currency: {
        Args: { calc_id: string }
        Returns: string
      }
      get_locations_by_country: {
        Args: { country_code: string }
        Returns: {
          country_name: string
          state_name: string
          city_name: string
          city_population: number
        }[]
      }
      get_user_expenses_paginated: {
        Args: {
          p_user_id: string
          p_limit?: number
          p_offset?: number
          p_category_id?: number
          p_start_date?: string
          p_end_date?: string
        }
        Returns: {
          id: string
          category_id: number
          category_name: string
          amount: number
          currency: string
          date: string
          description: string
          total_count: number
        }[]
      }
      get_user_monthly_expenses: {
        Args: { p_user_id: string; p_year?: number; p_month?: number }
        Returns: {
          category_id: number
          category_name: string
          total_amount: number
          transaction_count: number
          avg_amount: number
        }[]
      }
      get_user_spending_alerts: {
        Args: { p_user_id: string }
        Returns: {
          alert_id: string
          category_id: number
          category_name: string
          threshold: number
          period: string
          active: boolean
          current_spending: number
        }[]
      }
      refresh_analytics_views: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      search_locations: {
        Args: { search_term: string }
        Returns: {
          country_name: string
          state_name: string
          city_name: string
          match_type: string
        }[]
      }
      validate_calculation_ownership: {
        Args: { calc_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
