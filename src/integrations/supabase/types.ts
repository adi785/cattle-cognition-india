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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      animal_records: {
        Row: {
          animal_id: string
          animal_type: Database["public"]["Enums"]["animal_type"]
          confidence_score: number | null
          created_at: string
          final_breed: Database["public"]["Enums"]["breed_type"] | null
          id: string
          image_url: string | null
          location_data: Json | null
          manual_breed: Database["public"]["Enums"]["breed_type"] | null
          notes: string | null
          owner_details: Json | null
          predicted_breed: Database["public"]["Enums"]["breed_type"] | null
          updated_at: string
          user_id: string
          verification_status: string | null
          verified_by: string | null
        }
        Insert: {
          animal_id: string
          animal_type: Database["public"]["Enums"]["animal_type"]
          confidence_score?: number | null
          created_at?: string
          final_breed?: Database["public"]["Enums"]["breed_type"] | null
          id?: string
          image_url?: string | null
          location_data?: Json | null
          manual_breed?: Database["public"]["Enums"]["breed_type"] | null
          notes?: string | null
          owner_details?: Json | null
          predicted_breed?: Database["public"]["Enums"]["breed_type"] | null
          updated_at?: string
          user_id: string
          verification_status?: string | null
          verified_by?: string | null
        }
        Update: {
          animal_id?: string
          animal_type?: Database["public"]["Enums"]["animal_type"]
          confidence_score?: number | null
          created_at?: string
          final_breed?: Database["public"]["Enums"]["breed_type"] | null
          id?: string
          image_url?: string | null
          location_data?: Json | null
          manual_breed?: Database["public"]["Enums"]["breed_type"] | null
          notes?: string | null
          owner_details?: Json | null
          predicted_breed?: Database["public"]["Enums"]["breed_type"] | null
          updated_at?: string
          user_id?: string
          verification_status?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      breed_predictions: {
        Row: {
          animal_record_id: string
          created_at: string
          id: string
          image_url: string
          model_version: string | null
          predicted_breeds: Json
          processing_time_ms: number | null
        }
        Insert: {
          animal_record_id: string
          created_at?: string
          id?: string
          image_url: string
          model_version?: string | null
          predicted_breeds: Json
          processing_time_ms?: number | null
        }
        Update: {
          animal_record_id?: string
          created_at?: string
          id?: string
          image_url?: string
          model_version?: string | null
          predicted_breeds?: Json
          processing_time_ms?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "breed_predictions_animal_record_id_fkey"
            columns: ["animal_record_id"]
            isOneToOne: false
            referencedRelation: "animal_records"
            referencedColumns: ["id"]
          },
        ]
      }
      breeds: {
        Row: {
          animal_type: Database["public"]["Enums"]["animal_type"]
          breed_code: Database["public"]["Enums"]["breed_type"]
          characteristics: Json | null
          created_at: string
          description: string | null
          id: string
          is_indigenous: boolean | null
          name: string
          native_region: string | null
          updated_at: string
        }
        Insert: {
          animal_type: Database["public"]["Enums"]["animal_type"]
          breed_code: Database["public"]["Enums"]["breed_type"]
          characteristics?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_indigenous?: boolean | null
          name: string
          native_region?: string | null
          updated_at?: string
        }
        Update: {
          animal_type?: Database["public"]["Enums"]["animal_type"]
          breed_code?: Database["public"]["Enums"]["breed_type"]
          characteristics?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_indigenous?: boolean | null
          name?: string
          native_region?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          designation: string | null
          district: string | null
          employee_id: string | null
          full_name: string | null
          id: string
          is_verified: boolean | null
          phone: string | null
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          designation?: string | null
          district?: string | null
          employee_id?: string | null
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          designation?: string | null
          district?: string | null
          employee_id?: string | null
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          phone?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      animal_type: "cattle" | "buffalo"
      breed_type:
        | "gir"
        | "sahiwal"
        | "red_sindhi"
        | "tharparkar"
        | "rathi"
        | "hariana"
        | "ongole"
        | "krishna_valley"
        | "deoni"
        | "khillari"
        | "hallikar"
        | "amritmahal"
        | "kangayam"
        | "pulikulam"
        | "bargur"
        | "malvi"
        | "nimari"
        | "dangi"
        | "gaolao"
        | "jersey_cross"
        | "holstein_friesian_cross"
        | "crossbred"
        | "murrah"
        | "nili_ravi"
        | "surti"
        | "jaffarabadi"
        | "bhadawari"
        | "nagpuri"
        | "toda"
        | "pandharpuri"
        | "kalahandi"
        | "mehsana"
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
      animal_type: ["cattle", "buffalo"],
      breed_type: [
        "gir",
        "sahiwal",
        "red_sindhi",
        "tharparkar",
        "rathi",
        "hariana",
        "ongole",
        "krishna_valley",
        "deoni",
        "khillari",
        "hallikar",
        "amritmahal",
        "kangayam",
        "pulikulam",
        "bargur",
        "malvi",
        "nimari",
        "dangi",
        "gaolao",
        "jersey_cross",
        "holstein_friesian_cross",
        "crossbred",
        "murrah",
        "nili_ravi",
        "surti",
        "jaffarabadi",
        "bhadawari",
        "nagpuri",
        "toda",
        "pandharpuri",
        "kalahandi",
        "mehsana",
      ],
    },
  },
} as const
