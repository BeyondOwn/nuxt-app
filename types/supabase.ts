export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      aggregated_stats: {
        Row: {
          average_dealt: number | null
          average_deaths: number | null
          average_debuffs: number | null
          average_healed: number | null
          average_kd: number | null
          average_kdr: number | null
          average_taken: number | null
          created_at: string
          enemy_guild: string
          games_count: number | null
          guild: string | null
          highest_dealt: number | null
          highest_deaths: number | null
          highest_debuffs: number | null
          highest_healed: number | null
          highest_kd: number | null
          highest_taken: number | null
          player_name: string
          total_dealt: number | null
          total_deaths: number | null
          total_debuffs: number | null
          total_healed: number | null
          total_kd: number | null
          total_taken: number | null
        }
        Insert: {
          average_dealt?: number | null
          average_deaths?: number | null
          average_debuffs?: number | null
          average_healed?: number | null
          average_kd?: number | null
          average_kdr?: number | null
          average_taken?: number | null
          created_at?: string
          enemy_guild: string
          games_count?: number | null
          guild?: string | null
          highest_dealt?: number | null
          highest_deaths?: number | null
          highest_debuffs?: number | null
          highest_healed?: number | null
          highest_kd?: number | null
          highest_taken?: number | null
          player_name: string
          total_dealt?: number | null
          total_deaths?: number | null
          total_debuffs?: number | null
          total_healed?: number | null
          total_kd?: number | null
          total_taken?: number | null
        }
        Update: {
          average_dealt?: number | null
          average_deaths?: number | null
          average_debuffs?: number | null
          average_healed?: number | null
          average_kd?: number | null
          average_kdr?: number | null
          average_taken?: number | null
          created_at?: string
          enemy_guild?: string
          games_count?: number | null
          guild?: string | null
          highest_dealt?: number | null
          highest_deaths?: number | null
          highest_debuffs?: number | null
          highest_healed?: number | null
          highest_kd?: number | null
          highest_taken?: number | null
          player_name?: string
          total_dealt?: number | null
          total_deaths?: number | null
          total_debuffs?: number | null
          total_healed?: number | null
          total_kd?: number | null
          total_taken?: number | null
        }
        Relationships: []
      }
      aggregated_stats_total: {
        Row: {
          average_dealt: number | null
          average_deaths: number | null
          average_debuffs: number | null
          average_healed: number | null
          average_kd: number | null
          average_kdr: number | null
          average_taken: number | null
          created_at: string
          enemy_guild: string
          games_count: number | null
          guild: string | null
          highest_dealt: number | null
          highest_deaths: number | null
          highest_debuffs: number | null
          highest_healed: number | null
          highest_kd: number | null
          highest_taken: number | null
          player_name: string
          total_dealt: number | null
          total_deaths: number | null
          total_debuffs: number | null
          total_healed: number | null
          total_kd: number | null
          total_taken: number | null
        }
        Insert: {
          average_dealt?: number | null
          average_deaths?: number | null
          average_debuffs?: number | null
          average_healed?: number | null
          average_kd?: number | null
          average_kdr?: number | null
          average_taken?: number | null
          created_at?: string
          enemy_guild: string
          games_count?: number | null
          guild?: string | null
          highest_dealt?: number | null
          highest_deaths?: number | null
          highest_debuffs?: number | null
          highest_healed?: number | null
          highest_kd?: number | null
          highest_taken?: number | null
          player_name: string
          total_dealt?: number | null
          total_deaths?: number | null
          total_debuffs?: number | null
          total_healed?: number | null
          total_kd?: number | null
          total_taken?: number | null
        }
        Update: {
          average_dealt?: number | null
          average_deaths?: number | null
          average_debuffs?: number | null
          average_healed?: number | null
          average_kd?: number | null
          average_kdr?: number | null
          average_taken?: number | null
          created_at?: string
          enemy_guild?: string
          games_count?: number | null
          guild?: string | null
          highest_dealt?: number | null
          highest_deaths?: number | null
          highest_debuffs?: number | null
          highest_healed?: number | null
          highest_kd?: number | null
          highest_taken?: number | null
          player_name?: string
          total_dealt?: number | null
          total_deaths?: number | null
          total_debuffs?: number | null
          total_healed?: number | null
          total_kd?: number | null
          total_taken?: number | null
        }
        Relationships: []
      }
      debug_logs: {
        Row: {
          created_at: string
          id: number
          log_message: string | null
          log_time: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          log_message?: string | null
          log_time?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          log_message?: string | null
          log_time?: string | null
        }
        Relationships: []
      }
      game_players: {
        Row: {
          created_at: string
          dealt: number | null
          deaths: number | null
          debuffs: number | null
          enemy_guild: string | null
          game_id: number | null
          guild: string | null
          healed: number | null
          id: number
          kd: string | null
          player_name: string | null
          taken: number | null
          team_type: string | null
        }
        Insert: {
          created_at?: string
          dealt?: number | null
          deaths?: number | null
          debuffs?: number | null
          enemy_guild?: string | null
          game_id?: number | null
          guild?: string | null
          healed?: number | null
          id?: number
          kd?: string | null
          player_name?: string | null
          taken?: number | null
          team_type?: string | null
        }
        Update: {
          created_at?: string
          dealt?: number | null
          deaths?: number | null
          debuffs?: number | null
          enemy_guild?: string | null
          game_id?: number | null
          guild?: string | null
          healed?: number | null
          id?: number
          kd?: string | null
          player_name?: string | null
          taken?: number | null
          team_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_players_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          created_at: string
          date_hour: string
          defeat_team_name: string | null
          defeat_team_score: number | null
          id: number
          user_id: string | null
          victory_team_name: string | null
          victory_team_score: number | null
        }
        Insert: {
          created_at?: string
          date_hour: string
          defeat_team_name?: string | null
          defeat_team_score?: number | null
          id?: number
          user_id?: string | null
          victory_team_name?: string | null
          victory_team_score?: number | null
        }
        Update: {
          created_at?: string
          date_hour?: string
          defeat_team_name?: string | null
          defeat_team_score?: number | null
          id?: number
          user_id?: string | null
          victory_team_name?: string | null
          victory_team_score?: number | null
        }
        Relationships: []
      }
      test: {
        Row: {
          apples: string
          created_at: string
          id: number
          user_id: string | null
        }
        Insert: {
          apples: string
          created_at?: string
          id?: number
          user_id?: string | null
        }
        Update: {
          apples?: string
          created_at?: string
          id?: number
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      extract_kills: {
        Args: { kd_text: string }
        Returns: number
      }
    }
    Enums: {
      team_type_types: "victory" | "defeat"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      team_type_types: ["victory", "defeat"],
    },
  },
} as const
