import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';
export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const gameId = body.gameId;
    console.log("Gameid: ",gameId)
    const supabase = await serverSupabaseClient<Database>(event)
    let combatLogData;
  
    if (!supabase) {
      console.log('No supabase')
      event.node.res.statusCode = 500
      return { error: 'Failed to initialize Supabase client' }
    }

    try{
      const { data:combat_log_data, error } = await supabase.from('combat_logs').select('*').eq('id', gameId)

      if (error) return error.message
      if (combat_log_data){
        combatLogData = combat_log_data;
      }
    }
    catch(error){
      console.log('Error from get-combat-logs: ', error)
      return error
    }

    try {
      const { data, error } = await supabase.from('combat_logs_stats').select('*').eq('game_id', gameId).order('kills',{ascending:false})
  
      if (error) return error.message
      if (data) {
        console.log("STATS: ", data)

        // Extract unique guilds
        const guilds = [...new Set(data.map(s => s.guild))].filter(g => g && g.trim() !== '').sort()

        // Calculate general stats (all players)
        const generalStats = {
          players: data,
          totalKills: data.reduce((sum, p) => sum + p.kills, 0),
          totalDeaths: data.reduce((sum, p) => sum + p.deaths, 0),
          kdRatio: 0,
          playerCount: data.length
        }
        generalStats.kdRatio = generalStats.totalDeaths > 0 
          ? Number((generalStats.totalKills / generalStats.totalDeaths).toFixed(2))
          : generalStats.totalKills
        
        // Calculate guild-specific stats
        const guildStats = guilds.map(guild => {
          const guildPlayers = data.filter(p => p.guild === guild)
          const totalKills = guildPlayers.reduce((sum, p) => sum + p.kills, 0)
          const totalDeaths = guildPlayers.reduce((sum, p) => sum + p.deaths, 0)
          const kdRatio = totalDeaths > 0 
            ? Number((totalKills / totalDeaths).toFixed(2))
            : totalKills

            return {
              guild,
              players: guildPlayers,
              totalKills,
              totalDeaths,
              kdRatio,
              playerCount: guildPlayers.length
            }
          })

          // Sort guilds by total kills (descending)
        guildStats.sort((a, b) => b.totalKills - a.totalKills)

        return {
          generalStats,
          guildStats,
          combatLogData
        }
      }
    } catch (error) {
      console.log('Error from get-combat-logs: ', error)
      return error
    }
  })