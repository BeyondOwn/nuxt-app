import { serverSupabaseClient } from '#supabase/server'
import { createError } from 'h3'
import type { CalculatedMetrics, PlayerStats } from '~/models/models'
import type { Database } from '~/types/supabase'

// --- Helper Function to Calculate Statistics ---
// (Kept exactly as provided)
function calculateGuildMetrics(playerStats: PlayerStats[] | null | undefined): CalculatedMetrics {
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

  if (!playerStats || playerStats.length === 0) {
    return metrics
  }

  playerStats.forEach((player) => {
    const playerName = player.player_name ?? 'Unknown'
    if ((player.average_dealt ?? 0) > metrics.averageDealt.dealt) {
      metrics.averageDealt.dealt = player.average_dealt ?? 0
      metrics.averageDealt.name = playerName
    }
    if ((player.average_taken ?? 0) > metrics.averageTaken.taken) {
      metrics.averageTaken.taken = player.average_taken ?? 0
      metrics.averageTaken.name = playerName
    }
    if ((player.average_debuffs ?? 0) > metrics.averageDebuffs.debuffs) {
      metrics.averageDebuffs.debuffs = player.average_debuffs ?? 0
      metrics.averageDebuffs.name = playerName
    }
    if ((player.average_healed ?? 0) > metrics.averageHealed.healed) {
      metrics.averageHealed.healed = player.average_healed ?? 0
      metrics.averageHealed.name = playerName
    }
    if ((player.average_kd ?? 0) > metrics.averageKills.kills) {
      metrics.averageKills.kills = player.average_kd ?? 0
      metrics.averageKills.name = playerName
    }
    if ((player.average_deaths ?? 0) > metrics.averageDeaths.deaths) {
      metrics.averageDeaths.deaths = player.average_deaths ?? 0
      metrics.averageDeaths.name = playerName
    }
    if ((player.average_kdr ?? 0) > metrics.averageKDR.kdr) {
      metrics.averageKDR.kdr = player.average_kdr ?? 0
      metrics.averageKDR.name = playerName
    }
    if ((player.highest_kd ?? 0) > metrics.mostKills.kills) {
      metrics.mostKills.kills = player.highest_kd ?? 0
      metrics.mostKills.name = playerName
    }
    if ((player.highest_dealt ?? 0) > metrics.mostDamage.damage) {
      metrics.mostDamage.damage = player.highest_dealt ?? 0
      metrics.mostDamage.name = playerName
    }
    if ((player.highest_deaths ?? 0) > metrics.mostDeaths.deaths) {
      metrics.mostDeaths.deaths = player.highest_deaths ?? 0
      metrics.mostDeaths.name = playerName
    }
  })

  return metrics
}

// --- Main Event Handler ---
export default defineEventHandler(async (event) => {
  // Added 'season' to the body extraction
  const body: { guildName: string; enemyGuild: string; season?: string } = await readBody(event)
  const supabase = await serverSupabaseClient<Database>(event)

  console.log('Received request for Guild:', body.guildName, 'vs Enemy:', body.enemyGuild, 'Season:', body.season)

  if (!supabase) {
    console.error('Supabase client is not available.')
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error: Supabase client failed.' })
  }

  if (!body.guildName) {
    throw createError({ statusCode: 400, statusMessage: 'Bad Request: guildName is required.' })
  }

  try {
    let guildStats: PlayerStats[] | null = null
    let enemyGuildStats: PlayerStats[] | null = null
    let guildError: any = null
    let enemyError: any = null

    const isSpecificEnemy = body.enemyGuild && body.enemyGuild !== 'All'

    if (isSpecificEnemy) {
      console.log(`Workspaceing specific stats: ${body.guildName} vs ${body.enemyGuild}`)
      
      // Added season filter
      let gsQuery = supabase.from('aggregated_stats').select('*').eq('guild', body.guildName).eq('enemy_guild', body.enemyGuild)
      if (body.season) gsQuery = gsQuery.eq('season', body.season)
      const { data: gsData, error: gsError } = await gsQuery
      guildStats = gsData
      guildError = gsError

      // Added season filter
      let egsQuery = supabase.from('aggregated_stats').select('*').eq('guild', body.enemyGuild).eq('enemy_guild', body.guildName)
      if (body.season) egsQuery = egsQuery.eq('season', body.season)
      const { data: egsData, error: egsError } = await egsQuery
      enemyGuildStats = egsData
      enemyError = egsError

    } else {
      console.log(`Workspaceing total stats for guild: ${body.guildName}`)
      
      // Added season filter to aggregated_stats_total
      let gsQuery = supabase.from('aggregated_stats_total').select('*').eq('guild', body.guildName)
      if (body.season) gsQuery = gsQuery.eq('season', body.season)
      const { data: gsData, error: gsError } = await gsQuery
      guildStats = gsData
      guildError = gsError

      // Added season filter to the "All" mode enemy lookup
      let egsQuery = supabase.from('aggregated_stats').select('*').eq('enemy_guild', body.guildName)
      if (body.season) egsQuery = egsQuery.eq('season', body.season)
      const { data: egsData, error: egsError } = await egsQuery
      enemyGuildStats = egsData
      enemyError = egsError
    }

    if (guildError) {
      console.error('Error fetching guild stats:', guildError)
      throw createError({ statusCode: 500, message: `Error fetching guild stats: ${guildError.message}` })
    }
    if (isSpecificEnemy && enemyError) {
      console.error('Error fetching enemy guild stats:', enemyError)
      throw createError({ statusCode: 500, message: `Error fetching enemy guild stats: ${enemyError.message}` })
    }

    const guildMetrics = calculateGuildMetrics(guildStats)
    const enemyMetrics = calculateGuildMetrics(enemyGuildStats)

    console.log('Calculation Complete.')

    return {
      guildMetrics,
      enemyMetrics,
      guildStats: guildStats ?? [],
      enemyGuildStats: enemyGuildStats ?? [],
    }
  } catch (error: any) {
    console.error('Error processing guild stats request:', error)
    if (error.statusCode) {
      throw error
    }
    throw createError({ statusCode: 500, statusMessage: 'Internal Server Error occurred while processing stats.', data: error.message })
  }
})