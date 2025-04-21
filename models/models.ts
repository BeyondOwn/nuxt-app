import type { Database } from '@/types/supabase'
export interface createGame {
  error?: string
  date_hour: string
  victory_team: {
    name: string
    kd: string
    deaths: number
    debuffs: number
    dealt: number
    taken: number
    healed: number
  }[]
  defeat_team: {
    name: string
    kd: string
    deaths: number
    debuffs: number
    dealt: number
    taken: number
    healed: number
  }[]
  score: {
    victory_team_score: number
    defeat_team_score: number
  }
  victory_team_name: string
  defeat_team_name: string
}
export interface AllStats {
  guildMetrics: CalculatedMetrics // Calculated highest/average stats for the main guild
  enemyMetrics: CalculatedMetrics // Calculated highest/average stats for the enemy guild (zeroed if 'All')
  guildStats: PlayerStats[] // Raw stats list for the main guild (ensure it's an array)
  enemyGuildStats: PlayerStats[] // Raw stats list for the enemy guild (ensure it's an array)
}

export type PlayerStats = Database['public']['Tables']['aggregated_stats']['Row'] | Database['public']['Tables']['aggregated_stats_total']['Row']
// Add other possible stat table Row types if necessary

// Define the structure for the calculated metrics for clarity
export interface CalculatedMetrics {
  averageDealt: { dealt: number; name: string }
  averageTaken: { taken: number; name: string }
  averageDebuffs: { debuffs: number; name: string }
  averageHealed: { healed: number; name: string }
  averageKills: { kills: number; name: string } // Assuming average_kd is average kills
  averageDeaths: { deaths: number; name: string }
  averageKDR: { kdr: number; name: string }
  mostKills: { kills: number; name: string }
  mostDamage: { damage: number; name: string }
  mostDeaths: { deaths: number; name: string }
}
