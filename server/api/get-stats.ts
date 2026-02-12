import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient<Database>(event)
  
  // Extract season from the query
  const query = getQuery(event)
  const season = query.season as string

  if (!supabase) {
    event.node.res.statusCode = 500
    return { error: 'Failed to initialize Supabase client' }
  }

  try {
    // Added season check to totalGames query
    let totalGamesQuery = supabase.from('games').select('*', { count: 'exact' })
    if (season) totalGamesQuery = totalGamesQuery.eq('season', season)
    
    const { data: totalGames, error } = await totalGamesQuery

    if (error) {
      return error
    }

    // Added season check to victories query
    let victoriesQuery = supabase.from('games').select('*', { count: 'exact' }).eq('victory_team_name', 'Insecure')
    if (season) victoriesQuery = victoriesQuery.eq('season', season)

    const { error: dataError, data: victories } = await victoriesQuery

    if (dataError) return dataError

    if (!totalGames || !victories) return createError({ message: 'no totalGames or Victories', statusCode: 500 })

    const totalGamesConverted = totalGames.map((el) => {
      return {
        victory_team: el.victory_team_name,
        defeat_team: el.defeat_team_name,
      }
    })

    return {
      totalGamesConverted,
    }
  } catch (error) {
    event.node.res.statusCode = 500
    console.log(error)
    return error
  }
})