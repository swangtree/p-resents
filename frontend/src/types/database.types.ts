import { Pairing, RulesetStatistics } from './api.types';

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
      groups: {
        Row: {
          created_at: string | null
          created_by: string | null
          group_code: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          group_code: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          group_code?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      match_results: {
        Row: {
          created_at: string | null
          created_by: string | null
          group_id: string
          id: string
          pairings: Json | null
          play_order: string[] | null
          ruleset: string
          seed: number | null
          statistics: Json | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          group_id: string
          id?: string
          pairings?: Json | null
          play_order?: string[] | null
          ruleset: string
          seed?: number | null
          statistics?: Json | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          group_id?: string
          id?: string
          pairings?: Json | null
          play_order?: string[] | null
          ruleset?: string
          seed?: number | null
          statistics?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "match_results_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      preferences: {
        Row: {
          created_at: string | null
          exclusions: string[] | null
          preference_practicality_giving: number | null
          preference_novelty_giving: number | null
          preference_thoughtfulness_giving: number | null
          preference_practicality_receiving: number | null
          preference_novelty_receiving: number | null
          preference_thoughtfulness_receiving: number | null
          we_hate_being_stolen_from: number | null
          we_enjoy_stealing: number | null
          hate_missing_out: number | null
          enjoy_missing_out: number | null
          group_id: string
          id: string
          interests: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          exclusions?: string[] | null
          preference_practicality_giving?: number | null
          preference_novelty_giving?: number | null
          preference_thoughtfulness_giving?: number | null
          preference_practicality_receiving?: number | null
          preference_novelty_receiving?: number | null
          preference_thoughtfulness_receiving?: number | null
          we_hate_being_stolen_from?: number | null
          we_enjoy_stealing?: number | null
          hate_missing_out?: number | null
          enjoy_missing_out?: number | null
          group_id: string
          id?: string
          interests?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          exclusions?: string[] | null
          preference_practicality_giving?: number | null
          preference_novelty_giving?: number | null
          preference_thoughtfulness_giving?: number | null
          preference_practicality_receiving?: number | null
          preference_novelty_receiving?: number | null
          preference_thoughtfulness_receiving?: number | null
          we_hate_being_stolen_from?: number | null
          we_enjoy_stealing?: number | null
          hate_missing_out?: number | null
          enjoy_missing_out?: number | null
          group_id?: string
          id?: string
          interests?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "preferences_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      profile: {
        Row: {
          created_at: string | null
          group_id: string | null
          id: string
          name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          group_id?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      user_data: {
        Row: {
          email: string
          field_1: string | null
          field_10: string | null
          field_2: string | null
          field_3: string | null
          field_4: string | null
          field_5: string | null
          field_6: string | null
          field_7: string | null
          field_8: string | null
          field_9: string | null
          id: string
        }
        Insert: {
          email: string
          field_1?: string | null
          field_10?: string | null
          field_2?: string | null
          field_3?: string | null
          field_4?: string | null
          field_5?: string | null
          field_6?: string | null
          field_7?: string | null
          field_8?: string | null
          field_9?: string | null
          id: string
        }
        Update: {
          email?: string
          field_1?: string | null
          field_10?: string | null
          field_2?: string | null
          field_3?: string | null
          field_4?: string | null
          field_5?: string | null
          field_6?: string | null
          field_7?: string | null
          field_8?: string | null
          field_9?: string | null
          id?: string
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

export interface GroupMember {
  id: string;
  user_data: {
    email: string;
  };
}

export interface GroupPreview {
  id: string;
  name: string;
  created_at: string;
  memberCount?: number;
}

export interface MatchResults {
  id: string;
  group_id: string;
  ruleset: string;
  pairings: Pairing[] | null;
  play_order: string[] | null;
  statistics: RulesetStatistics[] | null;
  seed: number | null;
  created_at: string | null;
  created_by: string | null;
}

export interface SavePreferencesInput {
  user_id: string;
  group_id: string;
  preference_practicality_giving: number;
  preference_novelty_giving: number;
  preference_thoughtfulness_giving: number;
  preference_practicality_receiving: number;
  preference_novelty_receiving: number;
  preference_thoughtfulness_receiving: number;
  we_hate_being_stolen_from: number;
  we_enjoy_stealing: number;
  hate_missing_out: number;
  enjoy_missing_out: number;
  interests: string[];
  exclusions: string[];
}

export interface SaveMatchResultsInput {
  group_id: string;
  ruleset: string;
  pairings: Pairing[] | null;
  play_order: string[] | null;
  statistics: RulesetStatistics[] | null;
  seed: number | null;
  created_by: string | null;
}