import { serverSupabaseClient } from '#supabase/server'
export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event)
  if (!supabase) {
    event.node.res.statusCode = 500
    return { error: 'Failed to initialize Supabase client' }
  }
  try {
    const { count: totalGames, error } = await supabase.from('games').select('*', { count: 'exact' })

    if (error) {
      return error
    }

    const { error: dataError, count: victories } = await supabase.from('games').select('*', { count: 'exact' }).eq('victory_team_name', 'Insecure')

    if (dataError) return dataError

    if (!totalGames || !victories) return createError({ message: 'no totalGames or Victories', statusCode: 500 })
    const defeats = totalGames - victories

    const winrate = Math.trunc((victories / totalGames) * 100)

    return {
      totalGames,
      victories,
      defeats,
      winrate,
    }
  } catch (error) {
    event.node.res.statusCode = 500
    console.log(error)
    return error
  }
})
