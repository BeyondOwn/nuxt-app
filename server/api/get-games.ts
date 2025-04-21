import { serverSupabaseClient } from '#supabase/server'
import type { Database } from '~/types/supabase'

// export default defineEventHandler(async (event) => {
//   const supabase = await serverSupabaseClient<Database>(event)
//   const query = getQuery(event)

//   // Default values for pagination
//   const page = parseInt(query.page as string) || 1
//   const pageSize = parseInt(query.pageSize as string) || 6 // You can adjust the default page size

//   const startIndex = (page - 1) * pageSize
//   const endIndex = page * pageSize - 1

//   if (!supabase) {
//     console.log('No supabase')
//     event.node.res.statusCode = 500
//     return { error: 'Failed to initialize Supabase client' }
//   }

//   try {
//     const {
//       data,
//       error: gamesError,
//       count,
//     } = await supabase
//       .from('games')
//       .select('*', { count: 'exact' }) // Include the total count for client-side logic
//       .order('created_at', { ascending: false }) // Ensure consistent ordering for pagination (replace 'id' with your preferred column)
//       .range(startIndex, endIndex)

//     if (gamesError) {
//       event.node.res.statusCode = Number(gamesError.code) || 500
//       return { error: gamesError.message, details: gamesError.details }
//     }

//     return {
//       data,
//       totalCount: count,
//       currentPage: page,
//       pageSize: pageSize,
//       hasNextPage: count ? count > endIndex + 1 : false,
//     }
//   } catch (error: any) {
//     console.error('Error fetching games:', error)
//     event.node.res.statusCode = 500
//     return { error: 'Failed to fetch games', details: error.message }
//   }
// })

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient<Database>(event)

  if (!supabase) {
    console.log('No supabase')
    event.node.res.statusCode = 500
    return { error: 'Failed to initialize Supabase client' }
  }

  try {
    const { data, error, count } = await supabase.from('games').select('*', { count: 'exact' }).order('date_hour', { ascending: false })

    if (error) return error.message
    if (data) {
      return {
        data,
        count,
      }
    }
  } catch (error) {
    console.log('Error from get-games: ', error)
    return error
  }
})
