import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient<Database>(event)
  const gameId = await readBody(event)

  if (!supabase) {
    console.log('No supabase')
    return
  }
  const { data, error: gamesError } = await supabase.from('games').select('*').eq('id', gameId)
  if (data) {
    return data[0]
  } else if (gamesError) {
    event.node.res.statusCode = Number(gamesError.code)
    return gamesError.cause
  }
})
