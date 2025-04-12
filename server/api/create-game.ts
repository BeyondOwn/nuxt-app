import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";
import type { GoogleGenAI } from "@google/genai";
import type { createGame } from "~/models/models";
import type { Database } from "~/types/supabase";
import { getGeminiAI } from "../utils/geminiAi";
import { generateTableContent } from "../utils/process-scoreboards";

export default defineEventHandler(async(event) =>{
    try{
        const body:string[] = await readBody(event);
        const user = await serverSupabaseUser(event);
        const supabase = await serverSupabaseClient<Database>(event);
        const geminiAi = getGeminiAI();
        if (!geminiAi){
            console.log("No geminiAi provided");
            return;
        }
        
        try{
          const content:createGame = await generateTableContent(body,geminiAi as GoogleGenAI);
          if (content.error){
            event.node.res.statusCode = 500;
            console.log(content.error)
            return content.error;
          }
          const {data:duplicate,error:allGood} = await supabase
          .from('games')
          .select('*')
          .eq('date_hour',content.date_hour);
          if(duplicate && duplicate?.length>0){
            event.node.res.statusCode = 500;
            return 'Your game is already in the system';
          }
          else if (allGood){
            console.log("allGood: ",allGood);
          }
  
          const {data:games,error:gamesError} = await supabase
          .from('games')
          .insert([{
              victory_team_name:content.victory_team_name,
              defeat_team_name:content.defeat_team_name,
              victory_team_score:content.score.victory_team_score,
              defeat_team_score:content.score.defeat_team_score,
              user_id:user?.id,
              date_hour:content.date_hour
          }])
          .select("*");
          if(gamesError)
          {
              event.node.res.statusCode = 500;
              console.log(gamesError)
              return gamesError;
          }
          else{
              console.log("Games:",games)
          }
  
          if (games)
          {
             try{
              const playersToInsert = [];
  
              // Loop through victory team
              for (const playerName in content.victory_team) {
                const player = content.victory_team[playerName];
                playersToInsert.push({
                  game_id: games[0].id,
                  player_name: player.name,
                  kd: player.kd,
                  debuffs: player.debuffs,
                  dealt: player.dealt,
                  taken: player.taken,
                  healed: player.healed,
                  team_type: 'victory',
                });
              }
          
              // Loop through defeat team
              for (const playerName in content.defeat_team) {
                const player = content.defeat_team[playerName];
                playersToInsert.push({
                  game_id: games[0].id,
                  player_name: player.name,
                  kd: player.kd,
                  debuffs: player.debuffs,
                  dealt: player.dealt,
                  taken: player.taken,
                  healed: player.healed,
                  team_type: 'defeat',
                });
              };
  
              const { data: game_players, error: game_playersError } = await supabase
                  .from('game_players')
                  .insert(playersToInsert)
                  .select('*');
   
              if (game_playersError) {
              event.node.res.statusCode = 500;
              console.error('Supabase insert error:', game_playersError);
              return game_playersError;
              // Handle error
              } else {
              console.log('Players inserted:', game_players);
              // Process successful insert    
              }
  }
             catch(error){
              console.log(error)
             }
          }
          
          
  
          return 'Game submited succesfully';
      }catch(error){
          console.log(error);
          event.node.res.statusCode = 500;
          return error;
      }
        }
        catch(error)
        { 
          event.node.res.statusCode = 500;
          console.log(error);
          return error;
        }
        

        
   
    
})

export const config = {
    middleware: ['auth'], // Apply the 'auth' middleware
  };