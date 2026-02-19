// server/api/autofill-player-classes.post.ts
// Call this right after inserting game_players rows for a new game.
// It looks up each player_name in player_roster and updates class/spec if found.

import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

  const client = await serverSupabaseClient(event)

  // Only uploaders can trigger this
  const { data: role } = await client
    .from('user_roles')
    .select('role_name')
    .eq('user_uuid', user.id)
    .eq('role_name', 'uploader')
    .maybeSingle()

  if (!role) throw createError({ statusCode: 403, message: 'Forbidden: uploader role required' })

  const body = await readBody<{ gameId: number }>(event)
  if (!body.gameId) throw createError({ statusCode: 400, message: 'gameId is required' })

  // 1. Get all game_players for this game that have no class set yet
  const { data: players, error: playersError } = await client
    .from('game_players')
    .select('id, player_name')
    .eq('game_id', body.gameId)
    .is('class', null)

  if (playersError) throw createError({ statusCode: 500, message: playersError.message })
  if (!players || players.length === 0) return { updated: 0 }

  // 2. Look up all those player names in the roster in one query
  const playerNames = players.map(p => p.player_name).filter(Boolean) as string[]

  const { data: rosterEntries, error: rosterError } = await client
    .from('player_roster')
    .select('player_name, class, spec')
    .in('player_name', playerNames)

  if (rosterError) throw createError({ statusCode: 500, message: rosterError.message })
  if (!rosterEntries || rosterEntries.length === 0) return { updated: 0 }

  // 3. Build a map for quick lookup
  const rosterMap = new Map(
    rosterEntries.map(r => [r.player_name, { class: r.class, spec: r.spec }])
  )

  // 4. Update each player that has a roster entry
  let updated = 0
  const updates = players
    .filter(p => p.player_name && rosterMap.has(p.player_name))
    .map(p => {
      const entry = rosterMap.get(p.player_name!)!
      updated++
      return client
        .from('game_players')
        .update({ class: entry.class, spec: entry.spec })
        .eq('id', p.id)
    })

  await Promise.all(updates)

  return { updated }
})