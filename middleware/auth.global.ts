export default defineNuxtRouteMiddleware(async (to) => {
  // Only check protected routes
  const protectedPaths = ['/scoreboards', '/stats'] // Add your protected routes
  if (!protectedPaths.some((path) => to.path.startsWith(path))) {
    return
  }

  const user = await useSupabaseUser()

  if (!user) {
    // If no user, redirect to login
    return navigateTo('/login')
  }
})
