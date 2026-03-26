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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      burial_cases: {
        Row: {
          created_at: string
          date_of_death: string
          date_reported: string
          eligibility_reason: string | null
          eligibility_status: string
          household_id: string
          id: string
          member_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_of_death: string
          date_reported?: string
          eligibility_reason?: string | null
          eligibility_status?: string
          household_id: string
          id?: string
          member_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_of_death?: string
          date_reported?: string
          eligibility_reason?: string | null
          eligibility_status?: string
          household_id?: string
          id?: string
          member_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "burial_cases_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "burial_cases_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      household_access_codes: {
        Row: {
          access_code: string
          created_at: string
          household_id: string
          id: string
          is_active: boolean
          last_used_at: string | null
          phone: string
        }
        Insert: {
          access_code: string
          created_at?: string
          household_id: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          phone: string
        }
        Update: {
          access_code?: string
          created_at?: string
          household_id?: string
          id?: string
          is_active?: boolean
          last_used_at?: string | null
          phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_access_codes_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          address: string | null
          contact_person: string
          created_at: string
          gps_lat: number | null
          gps_lng: number | null
          id: string
          join_date: string
          name: string
          phone: string | null
          section: string | null
          stand_number: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_person: string
          created_at?: string
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          join_date?: string
          name: string
          phone?: string | null
          section?: string | null
          stand_number?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_person?: string
          created_at?: string
          gps_lat?: number | null
          gps_lng?: number | null
          id?: string
          join_date?: string
          name?: string
          phone?: string | null
          section?: string | null
          stand_number?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      members: {
        Row: {
          created_at: string
          date_of_birth: string | null
          email: string | null
          full_name: string
          household_id: string
          id: string
          id_number: string | null
          phone_1: string | null
          phone_2: string | null
          profile_picture_url: string | null
          relationship: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name: string
          household_id: string
          id?: string
          id_number?: string | null
          phone_1?: string | null
          phone_2?: string | null
          profile_picture_url?: string | null
          relationship?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string
          household_id?: string
          id?: string
          id_number?: string | null
          phone_1?: string | null
          phone_2?: string | null
          profile_picture_url?: string | null
          relationship?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          household_id: string
          id: string
          notes: string | null
          payment_date: string | null
          payment_method: string
          payment_month: string
          receipt_image_url: string | null
          recorded_by: string | null
          status: string
        }
        Insert: {
          amount?: number
          created_at?: string
          household_id: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string
          payment_month: string
          receipt_image_url?: string | null
          recorded_by?: string | null
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          household_id?: string
          id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method?: string
          payment_month?: string
          receipt_image_url?: string | null
          recorded_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      payouts: {
        Row: {
          approved_amount: number
          approved_by: string | null
          case_id: string
          created_at: string
          id: string
          notes: string | null
          payment_date: string
          payment_method: string
        }
        Insert: {
          approved_amount: number
          approved_by?: string | null
          case_id: string
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method: string
        }
        Update: {
          approved_amount?: number
          approved_by?: string | null
          case_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "burial_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      requests: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          created_at: string
          description: string | null
          household_id: string
          id: string
          member_id: string | null
          request_type: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          created_at?: string
          description?: string | null
          household_id: string
          id?: string
          member_id?: string | null
          request_type?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          created_at?: string
          description?: string | null
          household_id?: string
          id?: string
          member_id?: string | null
          request_type?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "requests_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      rules_config: {
        Row: {
          id: string
          minimum_age: number
          minimum_membership_months: number
          monthly_contribution: number
          payout_amount: number
          updated_at: string
        }
        Insert: {
          id?: string
          minimum_age?: number
          minimum_membership_months?: number
          monthly_contribution?: number
          payout_amount?: number
          updated_at?: string
        }
        Update: {
          id?: string
          minimum_age?: number
          minimum_membership_months?: number
          monthly_contribution?: number
          payout_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      section_leaders: {
        Row: {
          created_at: string
          full_name: string
          id: string
          phone: string | null
          section: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name: string
          id?: string
          phone?: string | null
          section: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          section?: string
          user_id?: string
        }
        Relationships: []
      }
      special_contribution_payments: {
        Row: {
          amount: number
          contribution_id: string
          created_at: string
          household_id: string
          id: string
          payment_date: string | null
          status: string
        }
        Insert: {
          amount?: number
          contribution_id: string
          created_at?: string
          household_id: string
          id?: string
          payment_date?: string | null
          status?: string
        }
        Update: {
          amount?: number
          contribution_id?: string
          created_at?: string
          household_id?: string
          id?: string
          payment_date?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "special_contribution_payments_contribution_id_fkey"
            columns: ["contribution_id"]
            isOneToOne: false
            referencedRelation: "special_contributions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "special_contribution_payments_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      special_contributions: {
        Row: {
          amount_per_household: number
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          amount_per_household?: number
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          amount_per_household?: number
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_section_leader: {
        Args: { _section: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "treasurer" | "secretary"
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
    Enums: {
      app_role: ["admin", "treasurer", "secretary"],
    },
  },
} as const
