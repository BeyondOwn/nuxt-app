import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient<Database>(event)

  if (!supabase) {
    console.log('No supabase')
    return
  }
  const { data, error: gamesError } = await supabase.from('combat_logs').select('*').order('created_at',{ascending:false})
  if (data) {
    console.log("GAmes: ",data);
    return data
  } else if (gamesError) {
    event.node.res.statusCode = Number(gamesError.code)
    return gamesError.cause
  }
})
