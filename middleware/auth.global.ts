export default defineNuxtRouteMiddleware(async (to) => {
  // Only check protected routes
  const protectedPaths = ['/scoreboard/'] // Add your protected routes
  if (!protectedPaths.some((path) => to.path.startsWith(path))) {
    return
  }

  const { auth } = useSupabaseClient()
  const user = await useSupabaseUser()

  if (!user) {
    // If no user, redirect to login
    return navigateTo('/login')
  }
})
