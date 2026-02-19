import type { SupabaseClient } from '@supabase/supabase-js'

export async function checkRequestLimit(supabase: SupabaseClient) {
  // Fetch the current request count from Supabase
  const { data, error } = await supabase
    .from('api_hardcap')
    .select('id, current_requests, max_requests')
    .single()

  if (error) {
    throw new Error(`Failed to fetch request limit: ${error.message}`)
  }

  if (!data) {
    throw new Error('No api_hardcap record found')
  }

  // Check if limit is reached
  if (data.current_requests >= data.max_requests) {
    throw new Error(
      `Request limit reached. Hard cap of ${data.max_requests} requests exceeded.`
    )
  }

  // Increment the counter in the database
  const { error: updateError } = await supabase
    .from('api_hardcap')
    .update({ current_requests: data.current_requests + 1 })
    .eq('id', data.id)

  if (updateError) {
    throw new Error(`Failed to update request count: ${updateError.message}`)
  }

  console.log(`Request ${data.current_requests + 1}/${data.max_requests}`)
}