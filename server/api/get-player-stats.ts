import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  const body: { gameId: number } = await readBody(event)
  const gameId = body.gameId
  const supabase = await serverSupabaseClient<Database>(event)

  if (!supabase) {
    console.log('No supabase')
    return
  }
  const { data, error } = await supabase.from('game_players').select('*').eq('game_id', gameId)
  if (data) {
    return data
  } else if (error) {
    event.node.res.statusCode = Number(error.code)
    return error.cause
  }
})
