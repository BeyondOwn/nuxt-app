// composables/useIsUploader.ts
export const useIsUploader = async () => {
    const user = useSupabaseUser()
    const client = useSupabaseClient()
  
    if (!user.value) return ref(false)
  
    const { data } = await client
      .from('user_roles')
      .select('role_name')
      .eq('user_id', user.value.id)
      .eq('role_name', 'uploader')
      .maybeSingle()
  
    return ref(!!data)
  }