import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient<Database>(event)
  
  // 1. Extract the season from the query parameters
  const query = getQuery(event)
  const season = query.season as string

  if (!supabase) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to initialize Supabase client',
    })
  }

  try {
    // 2. Start building the query
    let dbQuery = supabase
      .from('games')
      .select('*', { count: 'exact' })

    // 3. Apply the season filter ONLY if it's provided
    if (season) {
      dbQuery = dbQuery.eq('season', season)
    }

    const { data, error, count } = await dbQuery
      .order('date_hour', { ascending: false })

    if (error) {
      throw createError({
        statusCode: 400,
        statusMessage: error.message,
      })
    }

    return {
      data: data || [],
      count: count || 0,
    }

  } catch (error: any) {
    console.error('Error from get-games API:', error)
    return createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal Server Error',
    })
  }
})