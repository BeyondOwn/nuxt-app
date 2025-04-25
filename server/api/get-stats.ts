import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'
export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient<Database>(event)
  if (!supabase) {
    event.node.res.statusCode = 500
    return { error: 'Failed to initialize Supabase client' }
  }
  try {
    const { data: totalGames, error } = await supabase.from('games').select('*', { count: 'exact' })

    if (error) {
      return error
    }

    const { error: dataError, data: victories } = await supabase.from('games').select('*', { count: 'exact' }).eq('victory_team_name', 'Insecure')

    if (dataError) return dataError

    if (!totalGames || !victories) return createError({ message: 'no totalGames or Victories', statusCode: 500 })
    // const defeats = totalGames - victories

    // const winrate = Math.trunc((victories / totalGames) * 100)

    const totalGamesConverted = totalGames.map((el) => {
      return {
        victory_team: el.victory_team_name,
        defeat_team: el.defeat_team_name,
      }
    })

    return {
      totalGamesConverted,
      // victories,
      // defeats,
      // winrate,
    }
  } catch (error) {
    event.node.res.statusCode = 500
    console.log(error)
    return error
  }
})
