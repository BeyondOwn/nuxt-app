import { serverSupabaseClient } from '#supabase/server'
import { createError } from 'h3' // Import createError
import type { CalculatedMetrics, PlayerStats } from '~/models/models'
import type { Database } from '~/types/supabase' // Assuming types are correct

// Define the type for a single player stat record (adjust based on your actual Supabase schema)
// Trying to infer from your usage. Make sure these types match your DB tables.

// --- Helper Function to Calculate Statistics ---
function calculateGuildMetrics(playerStats: PlayerStats[] | null | undefined): CalculatedMetrics {
  // Initialize metrics with default values
  const metrics: CalculatedMetrics = {
    averageDealt: { dealt: 0, name: '' },
    averageTaken: { taken: 0, name: '' },
    averageDebuffs: { debuffs: 0, name: '' },
    averageHealed: { healed: 0, name: '' },
    averageKills: { kills: 0, name: '' },
    averageDeaths: { deaths: 0, name: '' },
    averageKDR: { kdr: 0, name: '' },
    mostKills: { kills: 0, name: '' },
    mostDamage: { damage: 0, name: '' },
    mostDeaths: { deaths: 0, name: '' },
  }

  // If no stats data, return the default zeroed metrics
  if (!playerStats || playerStats.length === 0) {
    return metrics
  }

  playerStats.forEach((player) => {
    // Use nullish coalescing (??) for safety in case DB values are null
    const playerName = player.player_name ?? 'Unknown' // Handle potential null player names

    // Find highest Average Dealt
    if ((player.average_dealt ?? 0) > metrics.averageDealt.dealt) {
      metrics.averageDealt.dealt = player.average_dealt ?? 0
      metrics.averageDealt.name = playerName
    }
    // Find highest Average Taken
    if ((player.average_taken ?? 0) > metrics.averageTaken.taken) {
      metrics.averageTaken.taken = player.average_taken ?? 0
      metrics.averageTaken.name = playerName
    }
    // Find highest Average Debuffs
    if ((player.average_debuffs ?? 0) > metrics.averageDebuffs.debuffs) {
      metrics.averageDebuffs.debuffs = player.average_debuffs ?? 0
      metrics.averageDebuffs.name = playerName
    }
    // Find highest Average Healed
    if ((player.average_healed ?? 0) > metrics.averageHealed.healed) {
      metrics.averageHealed.healed = player.average_healed ?? 0
      metrics.averageHealed.name = playerName
    }
    // Find highest Average Kills (assuming average_kd)
    if ((player.average_kd ?? 0) > metrics.averageKills.kills) {
      metrics.averageKills.kills = player.average_kd ?? 0
      metrics.averageKills.name = playerName
    }
    // Find highest Average Deaths
    if ((player.average_deaths ?? 0) > metrics.averageDeaths.deaths) {
      metrics.averageDeaths.deaths = player.average_deaths ?? 0
      metrics.averageDeaths.name = playerName
    }
    // Find highest Average KDR
    if ((player.average_kdr ?? 0) > metrics.averageKDR.kdr) {
      metrics.averageKDR.kdr = player.average_kdr ?? 0
      metrics.averageKDR.name = playerName
    }
    // Find Most Kills (assuming highest_kd)
    if ((player.highest_kd ?? 0) > metrics.mostKills.kills) {
      metrics.mostKills.kills = player.highest_kd ?? 0
      metrics.mostKills.name = playerName
    }
    // Find Most Damage (assuming highest_dealt)
    if ((player.highest_dealt ?? 0) > metrics.mostDamage.damage) {
      metrics.mostDamage.damage = player.highest_dealt ?? 0
      metrics.mostDamage.name = playerName
    }
    // Find Most Deaths (assuming highest_deaths)
    if ((player.highest_deaths ?? 0) > metrics.mostDeaths.deaths) {
      metrics.mostDeaths.deaths = player.highest_deaths ?? 0
      metrics.mostDeaths.name = playerName
    }
  })

  return metrics
}

// --- Main Event Handler ---
export default defineEventHandler(async (event) => {
  const body: { guildName: string; enemyGuild: string } = await readBody(event)
  const supabase = await serverSupabaseClient<Database>(event)

  console.log('Received request for Guild:', body.guildName, 'vs Enemy:', body.enemyGuild)

  if (!supabase) {
    console.error('Supabase client is not available.')
    // Use H3's createError for proper error handling in Nitro/Nuxt
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error: Supabase client failed.' })
  }

  if (!body.guildName) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: guildName is required.' })
  }

  try {
    let guildStats: PlayerStats[] | null = null
    let enemyGuildStats: PlayerStats[] | null = null
    let guildError: any = null // Use 'any' for Supabase error type or define properly
    let enemyError: any = null

    const isSpecificEnemy = body.enemyGuild && body.enemyGuild !== 'All'

    if (isSpecificEnemy) {
      console.log(`Workspaceing specific stats: ${body.guildName} vs ${body.enemyGuild}`)
      // Fetch stats for guildName vs enemyGuild from 'aggregated_stats'
      const { data: gsData, error: gsError } = await supabase.from('aggregated_stats').select('*').eq('guild', body.guildName).eq('enemy_guild', body.enemyGuild)
      guildStats = gsData
      guildError = gsError

      // Fetch stats for enemyGuild vs guildName from 'aggregated_stats'
      const { data: egsData, error: egsError } = await supabase
        .from('aggregated_stats')
        .select('*')
        .eq('guild', body.enemyGuild) // Enemy is the 'guild'
        .eq('enemy_guild', body.guildName) // Original guild is the 'enemy_guild'
      enemyGuildStats = egsData
      enemyError = egsError
    } else {
      // 'All' or no enemy specified - use 'aggregated_stats_total'
      console.log(`Workspaceing total stats for guild: ${body.guildName}`)
      // Fetch total stats for guildName
      const { data: gsData, error: gsError } = await supabase.from('aggregated_stats_total').select('*').eq('guild', body.guildName)
      guildStats = gsData
      guildError = gsError

      // In 'All' mode, we don't fetch specific enemy stats.
      // Initialize enemyGuildStats as empty; metrics will be calculated as zero.
      const { data: egsData, error: egsError } = await supabase.from('aggregated_stats').select('*').eq('enemy_guild', body.guildName) // Original guild is the 'enemy_guild'
      enemyGuildStats = egsData
      enemyError = egsError
    }

    // --- Handle potential errors from Supabase queries ---
    if (guildError) {
      console.error('Error fetching guild stats:', guildError)
      throw createError({ statusCode: 500, message: `Error fetching guild stats: ${guildError.message}` })
    }
    // Only check enemyError if we attempted to fetch specific enemy stats
    if (isSpecificEnemy && enemyError) {
      console.error('Error fetching enemy guild stats:', enemyError)
      throw createError({ statusCode: 500, message: `Error fetching enemy guild stats: ${enemyError.message}` })
    }

    // --- Calculate metrics using the helper function ---
    const guildMetrics = calculateGuildMetrics(guildStats)
    // Calculate enemy metrics only if a specific enemy was provided, otherwise calculate from empty array (results in zeroed stats)
    const enemyMetrics = calculateGuildMetrics(enemyGuildStats)

    console.log('Calculation Complete.')
    // console.log('Guild Metrics:', guildMetrics); // Optional: log calculated metrics
    // console.log('Enemy Metrics:', enemyMetrics); // Optional: log calculated metrics

    // --- Return the results ---
    return {
      guildMetrics, // Calculated highest/average stats for the main guild
      enemyMetrics, // Calculated highest/average stats for the enemy guild (zeroed if 'All')
      guildStats: guildStats ?? [], // Raw stats list for the main guild (ensure it's an array)
      enemyGuildStats: enemyGuildStats ?? [], // Raw stats list for the enemy guild (ensure it's an array)
    }
  } catch (error: any) {
    console.error('Error processing guild stats request:', error)
    // If it's already an H3Error (created by createError), rethrow it.
    // Otherwise, create a generic 500 error.
    if (error.statusCode) {
      throw error
    }
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error occurred while processing stats.', data: error.message })
  }
})
