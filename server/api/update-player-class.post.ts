// server/api/update-player-class.post.ts
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const client = await serverSupabaseClient(event)

  // Check uploader role server-side
  const { data: role } = await client
    .from('user_roles')
    .select('role_name')
    .eq('user_id', user.id)
    .eq('role_name', 'uploader')
    .maybeSingle()

  if (!role) throw createError({ statusCode: 403, message: 'Forbidden: uploader role required' })

  const body = await readBody<{ playerId: number; class: string; spec: string }>(event)

  if (!body.playerId) throw createError({ statusCode: 400, message: 'playerId is required' })

  const { error } = await client
    .from('game_players')
    .update({ class: body.class, spec: body.spec })
    .eq('id', body.playerId)

  if (error) throw createError({ statusCode: 500, message: error.message })

  return { success: true }
})