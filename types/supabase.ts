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
          guild: string
          highest_dealt: number | null
          highest_deaths: number | null
          highest_debuffs: number | null
          highest_healed: number | null
          highest_kd: number | null
          highest_taken: number | null
          player_name: string
          season: string
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
          guild: string
          highest_dealt?: number | null
          highest_deaths?: number | null
          highest_debuffs?: number | null
          highest_healed?: number | null
          highest_kd?: number | null
          highest_taken?: number | null
          player_name: string
          season?: string
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
          guild?: string
          highest_dealt?: number | null
          highest_deaths?: number | null
          highest_debuffs?: number | null
          highest_healed?: number | null
          highest_kd?: number | null
          highest_taken?: number | null
          player_name?: string
          season?: string
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
          season: string
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
          season?: string
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
          season?: string
          total_dealt?: number | null
          total_deaths?: number | null
          total_debuffs?: number | null
          total_healed?: number | null
          total_kd?: number | null
          total_taken?: number | null
        }
        Relationships: []
      }
      combat_logs: {
        Row: {
          created_at: string
          death_matrix: Json | null
          duration: number | null
          guild: string
          id: string
          kill_matrix: Json | null
          title: string | null
          total_guilds: number | null
          total_players: number | null
          type: string
        }
        Insert: {
          created_at?: string
          death_matrix?: Json | null
          duration?: number | null
          guild?: string
          id?: string
          kill_matrix?: Json | null
          title?: string | null
          total_guilds?: number | null
          total_players?: number | null
          type?: string
        }
        Update: {
          created_at?: string
          death_matrix?: Json | null
          duration?: number | null
          guild?: string
          id?: string
          kill_matrix?: Json | null
          title?: string | null
          total_guilds?: number | null
          total_players?: number | null
          type?: string
        }
        Relationships: []
      }
      combat_logs_stats: {
        Row: {
          char_name: string | null
          class: string | null
          deaths: number | null
          family_name: string
          game_id: string
          guild: string | null
          id: number
          join_duration: number | null
          kd: number | null
          kills: number | null
          performance: number | null
          title: string
          type: string
        }
        Insert: {
          char_name?: string | null
          class?: string | null
          deaths?: number | null
          family_name?: string
          game_id?: string
          guild?: string | null
          id?: number
          join_duration?: number | null
          kd?: number | null
          kills?: number | null
          performance?: number | null
          title?: string
          type?: string
        }
        Update: {
          char_name?: string | null
          class?: string | null
          deaths?: number | null
          family_name?: string
          game_id?: string
          guild?: string | null
          id?: number
          join_duration?: number | null
          kd?: number | null
          kills?: number | null
          performance?: number | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "combat_logs_stats_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "combat_logs"
            referencedColumns: ["id"]
          },
        ]
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
          season: string
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
          season?: string
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
          season?: string
          taken?: number | null
          team_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_game_id_season"
            columns: ["game_id", "season"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id", "season"]
          },
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
          season: string
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
          season?: string
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
          season?: string
          user_id?: string | null
          victory_team_name?: string | null
          victory_team_score?: number | null
        }
        Relationships: []
      }
      player_class: {
        Row: {
          char_name: string
          class: string
          created_at: string
          family_name: string
          id: number
        }
        Insert: {
          char_name?: string
          class?: string
          created_at?: string
          family_name?: string
          id?: number
        }
        Update: {
          char_name?: string
          class?: string
          created_at?: string
          family_name?: string
          id?: number
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
      user_roles: {
        Row: {
          role_name: string
          user_id: string
        }
        Insert: {
          role_name: string
          user_id?: string
        }
        Update: {
          role_name?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      player_season_view: {
        Row: {
          created_at: string | null
          dealt: number | null
          deaths: number | null
          debuffs: number | null
          enemy_guild: string | null
          game_id: number | null
          guild: string | null
          healed: number | null
          id: number | null
          kd: string | null
          player_name: string | null
          season: string | null
          taken: number | null
          team_type: string | null
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
    }
    Functions: {
      extract_kills: { Args: { kd_text: string }; Returns: number }
    }
    Enums: {
      team_type_types: "victory" | "defeat"
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
      team_type_types: ["victory", "defeat"],
    },
  },
} as const
