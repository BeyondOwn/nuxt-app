import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient<Database>(event)
  if (!supabase) {
    console.log('No supabase')
    return
  }

  // Extract season from the query params
  const query = getQuery(event)
  const season = query.season as string

  try {
    // 1. Start the query
    let supabaseQuery = supabase.from('aggregated_stats').select('enemy_guild')

    // 2. Apply season filter only if season is provided
    if (season) {
      supabaseQuery = supabaseQuery.eq('season', season)
    }

    const { data: opponents, error } = await supabaseQuery

    if (error) {
      console.log(error)
      return createError({ message: error.message, status: 500 })
    }

    return opponents
  } catch (error) {
    console.log(error)
    return error
  }
})