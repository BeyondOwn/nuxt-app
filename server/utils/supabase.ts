import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Module-level variable acts as a singleton
let supabaseInstance: SupabaseClient | null = null

export async function getSupabase() {
  if (!supabaseInstance) {
    const runtimeConfig = useRuntimeConfig()
    console.log(runtimeConfig)

    const supabaseUrl = runtimeConfig.supabaseUrl
    const supabaseAnonKey = runtimeConfig.supabaseKey

    //  console.log("BR::",supabaseUrl,supabaseAnonKey);

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase URL or API Key are not defined in runtimeConfig.')
      return
    }

    supabaseInstance = await createClient(supabaseUrl, supabaseAnonKey)
    console.log('Supabase instance initialized')
  }
  return supabaseInstance
}
