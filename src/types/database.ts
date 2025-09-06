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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_allowlist: {
        Row: {
          created_at: string | null
          email: string
          id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      app_config: {
        Row: {
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      attachments: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          file_name: string
          file_size: number
          file_type: string
          id: string
          storage_path: string
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          file_name: string
          file_size: number
          file_type: string
          id?: string
          storage_path: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          storage_path?: string
        }
        Relationships: []
      }
      call_followups: {
        Row: {
          assigned_to: string
          call_outcome: string | null
          caller_name: string
          caller_number: string
          created_at: string | null
          id: string
          notes: string
          operator: string
          person_to_contact: string
          priority: Database["public"]["Enums"]["priority_level"]
          response_time: string | null
          status: Database["public"]["Enums"]["call_status"]
          time_to_respond: string | null
          timestamp: string
          updated_at: string | null
        }
        Insert: {
          assigned_to: string
          call_outcome?: string | null
          caller_name: string
          caller_number: string
          created_at?: string | null
          id?: string
          notes: string
          operator: string
          person_to_contact: string
          priority?: Database["public"]["Enums"]["priority_level"]
          response_time?: string | null
          status?: Database["public"]["Enums"]["call_status"]
          time_to_respond?: string | null
          timestamp: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string
          call_outcome?: string | null
          caller_name?: string
          caller_number?: string
          created_at?: string | null
          id?: string
          notes?: string
          operator?: string
          person_to_contact?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          response_time?: string | null
          status?: Database["public"]["Enums"]["call_status"]
          time_to_respond?: string | null
          timestamp?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      requirement_comments: {
        Row: {
          author: string
          id: string
          requirement_id: string
          text: string
          timestamp: string | null
        }
        Insert: {
          author: string
          id?: string
          requirement_id: string
          text: string
          timestamp?: string | null
        }
        Update: {
          author?: string
          id?: string
          requirement_id?: string
          text?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "requirement_comments_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      requirements: {
        Row: {
          created_at: string | null
          customer_name: string
          customer_number: string
          description: string
          id: string
          priority: Database["public"]["Enums"]["priority_level"]
          status: Database["public"]["Enums"]["requirement_status"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_name: string
          customer_number: string
          description: string
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          status?: Database["public"]["Enums"]["requirement_status"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_name?: string
          customer_number?: string
          description?: string
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"]
          status?: Database["public"]["Enums"]["requirement_status"]
          updated_at?: string | null
        }
        Relationships: []
      }
      service_job_comments: {
        Row: {
          author: string
          id: string
          service_job_id: string
          text: string
          timestamp: string | null
        }
        Insert: {
          author: string
          id?: string
          service_job_id: string
          text: string
          timestamp?: string | null
        }
        Update: {
          author?: string
          id?: string
          service_job_id?: string
          text?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_job_comments_service_job_id_fkey"
            columns: ["service_job_id"]
            isOneToOne: false
            referencedRelation: "service_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      service_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          customer_name: string
          customer_number: string
          description: string
          id: string
          modal_name: string
          modal_registration_number: string
          scheduled_at: string
          status: Database["public"]["Enums"]["service_status"]
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          customer_name: string
          customer_number: string
          description: string
          id?: string
          modal_name: string
          modal_registration_number: string
          scheduled_at: string
          status?: Database["public"]["Enums"]["service_status"]
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          customer_name?: string
          customer_number?: string
          description?: string
          id?: string
          modal_name?: string
          modal_registration_number?: string
          scheduled_at?: string
          status?: Database["public"]["Enums"]["service_status"]
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      call_status:
        | "Active Calls"
        | "Pending"
        | "Followed up"
        | "Not Received"
        | "Completed"
      priority_level: "Low" | "Medium" | "High"
      requirement_status:
        | "Pending"
        | "In Progress"
        | "Ordered"
        | "Procedure"
        | "Contacted Customer"
        | "Completed"
      service_status:
        | "New Complaint"
        | "Under Inspection"
        | "Sent to Service Centre"
        | "Received"
        | "Completed"
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
      call_status: [
        "Active Calls",
        "Pending",
        "Followed up",
        "Not Received",
        "Completed",
      ],
      priority_level: ["Low", "Medium", "High"],
      requirement_status: [
        "Pending",
        "In Progress",
        "Ordered",
        "Procedure",
        "Contacted Customer",
        "Completed",
      ],
      service_status: [
        "New Complaint",
        "Under Inspection",
        "Sent to Service Centre",
        "Received",
        "Completed",
      ],
    },
  },
} as const
