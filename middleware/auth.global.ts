export default defineNuxtRouteMiddleware(async (to) => {
  // Only check protected routes
  const protectedPaths = ['/upload'] // Add your protected routes
  if (!protectedPaths.some((path) => to.path.startsWith(path))) {
    return
  }

  const user = await useSupabaseUser()

  if (!user) {
    // If no user, redirect to login
    return navigateTo('/')
  }

  if (to.path.startsWith('/upload')) {
    const client = useSupabaseClient()
    const { data: uploader, error } = await client.from('user_roles').select('role_name').eq('user_id', user?.value?.id)

    if (uploader!.length == 0) {
      return navigateTo('/')
    }
    if (error) {
      return navigateTo('/')
    }
  }
})
