import { serverSupabaseClient } from '#supabase/server' // Import the server client helper
import type { H3Event } from 'h3' // Import H3Event type for better typing

export default defineEventHandler(async (event: H3Event) => {
  // Define which paths this middleware should protect
  // Example: Protect all routes under /api/protected/*
  console.log(`[Auth Middleware] Running for path: ${event.node.req.url}`)
  const protectedPaths = ['/api/'] // Add more paths/patterns as needed
  const excludePaths = ['/api/_nuxt_icon'] // Add paths to exclude

  const url = event.node.req.url

  // Check if the URL is in the exclude paths
  if (excludePaths.some((path) => url?.startsWith(path))) {
    console.log(`[Auth Middleware] Skipping auth check for excluded path: ${url}`)
    return // Skip authentication check for excluded path
  }

  //   console.log("URLa: ",url)
  if (!url || !protectedPaths.some((path) => url.startsWith(path))) {
    // If the path doesn't start with any protected path, skip the auth check
    return
  }

  try {
    // Get cookies
    const cookies = parseCookies(event)
    // console.log('All cookies:', cookies)

    // If there are no cookies, this is likely a cold navigation
    if (!cookies || Object.keys(cookies).length === 0) {
      console.log('No cookies found - likely cold navigation')

      // Set a header to let the client know auth is required
      setResponseHeader(event, 'X-Auth-Required', 'true')

      // Allow the request to continue - client-side code will handle the redirect
      return
    }

    // Initialize Supabase client
    const client = await serverSupabaseClient(event)
    const {
      data: { user },
    } = await client.auth.getUser()

    if (!user) {
      console.error(`No user found despite cookies being present`)
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized: Access Denied',
      })
    }

    event.context.user = user
  } catch (error) {
    console.error('Auth error:', error)
    throw createError({
      statusCode: 401,
      statusMessage: 'Authentication error',
    })
  }
})
