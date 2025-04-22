import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'
export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient<Database>(event)
  if (!supabase) {
    console.log('No supabase')
    return
  }
  try {
    const { data: opponents, error } = await supabase.from('aggregated_stats').select('enemy_guild')
    if (error) {
      console.log(error)
      return createError({ message: error.message, status: 500 })
    }
    // console.log('opo: ', opponents)
    return opponents
  } catch (error) {
    console.log(error)
    return error
  }
})
