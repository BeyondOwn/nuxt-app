import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'
import type { GoogleGenAI } from '@google/genai'
import type { createGame } from '~/models/models'
import type { Database } from '~/types/supabase'
import { getGeminiAI } from '../utils/geminiAi'
import { generateTableContent } from '../utils/process-scoreboards'

export default defineEventHandler(async (event) => {
  try {
    const body: { name: string; base64Image: string }[] = await readBody(event)
    const user = await serverSupabaseUser(event)
    const supabase = await serverSupabaseClient<Database>(event)
    const geminiAi = getGeminiAI()
    if (!geminiAi) {
      console.log('No geminiAi provided')
      return
    }

    const contents: { games: createGame[]; errors?: any[]; gamesName: string[] } = await generateTableContent(body, geminiAi as GoogleGenAI)

    if (!Array.isArray(contents.games)) {
      event.node.res.statusCode = 500
      console.error('generateTableContent did not return an array.')
      return 'Internal server error'
    }

    const successfulSubmissions: any[] = []
    const errors: any[] = []

    if (contents.errors && contents.errors?.length > 0) {
      errors.push(contents.errors)
    }

    for (const [index, content] of contents.games.entries()) {
      if (content.error) {
        event.node.res.statusCode = 500
        console.error('Error in generated content:', content.error)
        errors.push(`${content.error}`)
        continue // Skip to the next game if there's an error in generation
      }

      try {
        const { data: duplicate } = await supabase.from('games').select('*').eq('date_hour', content.date_hour)

        if (duplicate && duplicate.length > 0) {
          event.node.res.statusCode = 500
          const errorMessage = `Game '${contents.gamesName[index]}' is already in the system.`
          console.log(errorMessage)
          errors.push(errorMessage)
          continue // Skip to the next game if it's a duplicate
        }

        const { data: games, error: gamesError } = await supabase
          .from('games')
          .insert([
            {
              victory_team_name: content.victory_team_name,
              defeat_team_name: content.defeat_team_name,
              victory_team_score: content.score.victory_team_score,
              defeat_team_score: content.score.defeat_team_score,
              user_id: user?.id,
              date_hour: content.date_hour,
            },
          ])
          .select('*')

        if (gamesError) {
          event.node.res.statusCode = 500
          console.error(`Error inserting game: ${contents.gamesName[index]} `, gamesError)
          errors.push(`Error inserting game: ${contents.gamesName[index]} `)
          continue // Skip to the next game if insertion failed
        }

        if (games && games.length > 0) {
          try {
            const playersToInsert = []

            // Loop through victory team
            for (const playerName in content.victory_team) {
              const player = content.victory_team[playerName]
              playersToInsert.push({
                game_id: games[0].id,
                guild: content.victory_team_name,
                player_name: player.name,
                kd: player.kd,
                deaths: player.deaths,
                debuffs: player.debuffs,
                dealt: player.dealt,
                taken: player.taken,
                healed: player.healed,
                enemy_guild: content.defeat_team_name,
                team_type: 'victory',
              })
            }

            // Loop through defeat team
            for (const playerName in content.defeat_team) {
              const player = content.defeat_team[playerName]
              playersToInsert.push({
                game_id: games[0].id,
                guild: content.defeat_team_name,
                player_name: player.name,
                kd: player.kd,
                deaths: player.deaths,
                debuffs: player.debuffs,
                dealt: player.dealt,
                taken: player.taken,
                healed: player.healed,
                enemy_guild: content.victory_team_name,
                team_type: 'defeat',
              })
            }

            const { data: game_players, error: game_playersError } = await supabase.from('game_players').insert(playersToInsert).select('*')

            if (game_playersError) {
              event.node.res.statusCode = 500
              console.error(`Supabase insert error : ${contents.gamesName[index]}`, game_playersError)
              errors.push(`Supabase insert error : ${contents.gamesName[index]}`)
              // Optionally, you might want to delete the game entry if player insertion fails
              await supabase.from('games').delete().eq('id', games[0].id)
              continue // Skip to the next game
            } else {
              console.log('Players inserted for game:', games[0].id, game_players)
              successfulSubmissions.push({ gameId: games[0].id, message: `Game ${contents.gamesName[index]} submitted successfully` })
            }
          } catch (playerError) {
            console.error('Error processing players:', playerError)
            errors.push(`Error processing players: ${contents.gamesName[index]}`)
            // Optionally, you might want to delete the game entry if player processing fails
            if (games && games.length > 0) {
              await supabase.from('games').delete().eq('id', games[0].id)
            }
          }
        }
      } catch (supabaseError) {
        console.error('Supabase operation error:', supabaseError)
        errors.push(supabaseError)
      }
    }

    if (errors.length > 0 && successfulSubmissions.length === 0) {
      event.node.res.statusCode = 500
      return { errors }
    } else if (errors.length > 0) {
      return { successfulSubmissions, errors }
    } else {
      return { successfulSubmissions, message: 'All games submitted successfully' }
    }
  } catch (topLevelError) {
    console.error('Top-level error:', topLevelError)
    event.node.res.statusCode = 500
    return { errors: topLevelError }
  }
})

export const config = {
  middleware: ['auth'], // Apply the 'auth' middleware
}
