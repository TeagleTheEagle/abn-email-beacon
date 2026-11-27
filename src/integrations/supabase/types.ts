export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      api_rate_limits: {
        Row: {
          created_at: string
          hits: number
          key: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          hits?: number
          key: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          hits?: number
          key?: string
          updated_at?: string
        }
        Relationships: []
      }
      concept_views: {
        Row: {
          id: string
          slug: string
          viewed_at: string
        }
        Insert: {
          id?: string
          slug: string
          viewed_at?: string
        }
        Update: {
          id?: string
          slug?: string
          viewed_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          assigned_owner_id: string | null
          business_name: string
          business_type: string | null
          created_at: string
          current_website: string | null
          customer_confirmation_attempt_id: string | null
          customer_confirmation_attempted_at: string | null
          customer_confirmation_attempts: number
          customer_confirmation_error: string | null
          customer_confirmation_provider_id: string | null
          customer_confirmation_status: string
          email: string
          id: string
          message: string | null
          name: string
          needs: string[]
          next_follow_up_at: string | null
          notes: string | null
          notified_at: string | null
          notify_token_hash: string | null
          owner_notification_attempt_id: string | null
          owner_notification_attempted_at: string | null
          owner_notification_attempts: number
          owner_notification_error: string | null
          owner_notification_provider_id: string | null
          owner_notification_status: string
          phone: string | null
          source: string
          stage: string
          updated_at: string
        }
        Insert: {
          assigned_owner_id?: string | null
          business_name: string
          business_type?: string | null
          created_at?: string
          current_website?: string | null
          customer_confirmation_attempt_id?: string | null
          customer_confirmation_attempted_at?: string | null
          customer_confirmation_attempts?: number
          customer_confirmation_error?: string | null
          customer_confirmation_provider_id?: string | null
          customer_confirmation_status?: string
          email: string
          id?: string
          message?: string | null
          name: string
          needs?: string[]
          next_follow_up_at?: string | null
          notes?: string | null
          notified_at?: string | null
          notify_token_hash?: string | null
          owner_notification_attempt_id?: string | null
          owner_notification_attempted_at?: string | null
          owner_notification_attempts?: number
          owner_notification_error?: string | null
          owner_notification_provider_id?: string | null
          owner_notification_status?: string
          phone?: string | null
          source?: string
          stage?: string
          updated_at?: string
        }
        Update: {
          assigned_owner_id?: string | null
          business_name?: string
          business_type?: string | null
          created_at?: string
          current_website?: string | null
          customer_confirmation_attempt_id?: string | null
          customer_confirmation_attempted_at?: string | null
          customer_confirmation_attempts?: number
          customer_confirmation_error?: string | null
          customer_confirmation_provider_id?: string | null
          customer_confirmation_status?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          needs?: string[]
          next_follow_up_at?: string | null
          notes?: string | null
          notified_at?: string | null
          notify_token_hash?: string | null
          owner_notification_attempt_id?: string | null
          owner_notification_attempted_at?: string | null
          owner_notification_attempts?: number
          owner_notification_error?: string | null
          owner_notification_provider_id?: string | null
          owner_notification_status?: string
          phone?: string | null
          source?: string
          stage?: string
          updated_at?: string
        }
        Relationships: []
      }
      owner_memberships: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          business_name: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          business_name?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          business_name?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_lead_customer_confirmation: {
        Args: {
          p_attempt_id: string
          p_lead_id: string
          p_max_attempts: number
          p_stale_before: string
        }
        Returns: boolean
      }
      claim_lead_owner_notification: {
        Args: {
          p_attempt_id: string
          p_lead_id: string
          p_max_attempts: number
          p_stale_before: string
        }
        Returns: boolean
      }
      consume_rate_limit: { Args: { p_key: string }; Returns: number }
      is_enquiry_owner: { Args: never; Returns: boolean }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
