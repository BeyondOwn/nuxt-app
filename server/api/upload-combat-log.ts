import { serverSupabaseClient } from '#supabase/server';
import type { Database } from '~/types/supabase';
export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient<Database>(event)
  const formData = await readMultipartFormData(event);
  let guildName = null;
  let logName = null;
  let type = 'GvG';
  const timestamps: number[] = [];
  const uniqueFamilyNames = new Set<string>();
  const uniqueGuilds = new Set<string>();

  const timestampRegex = /\[(\d{2}):(\d{2}):(\d{2})\]/;
  
  if (!formData){
    return createError({message:'No guild name recieved',status:400})
  }
  
  for (const field of formData) {
    console.log("Field: ",field);
    if (field.name === 'guild') {
      console.log("Field data string: ",field.data.toString('utf-8'));
      guildName = field.data.toString('utf8'); 
    }
    if (field.name === 'logName'){
      console.log('Field data string: ',field.data.toString('utf-8'));
      logName = field.data.toString('utf-8');
    }

    if (field.name === 'type'){
      console.log('Field data string: ',field.data.toString('utf-8'));
      type = field.data.toString('utf-8');
    }
  }
  
  if (!guildName) {
    return createError({ statusCode: 400, statusMessage: 'Guild name is missing' });
  }

  if (!logName){
    logName = 'Default';
  }

  if (!supabase) {
    console.log('No supabase')
    return createError({ message: 'Server initialization error', statusCode: 500 });
  }
  
  try {
    const inc = await readMultipartFormData(event);
    if (!inc || inc.length === 0) {
      console.log('No file uploaded')
      return createError({ message: 'No file uploaded', status: 400 })
    }
    
    const fileField = inc.find(field => field.name === 'demo[]');

    if (!fileField) {
      console.log('File field "demo[]" not found in form data')
      return createError({ message: 'File field not found', status: 400 })
    }

    const fileBuffer: Buffer = fileField.data
    const fileName: string = fileField.filename || 'unknown.log'
    const fileType: string = fileField.type || 'application/octet-stream'

    const fileContent: string = fileBuffer.toString('utf-8');
    const lines = fileContent.split('\n');

    // ⭐ CHANGED: Track stats by CHARACTER NAME instead of family name
    const playerStats : {
        [charName: string]: {
          family_name: string,
          kills: number, 
          deaths: number, 
          guild: string
        } 
    } = {};

    // Map to store character name -> family name relationship
    const charToFamilyMap = new Map<string, string>();

    const initializePlayer = (charName: string, familyName: string) => {
        if (!playerStats[charName]) {
            playerStats[charName] = {
              family_name: familyName,
              kills: 0, 
              deaths: 0, 
              guild: guildName
            }
        }
    }

    const killRegex = /\[\d{2}:\d{2}:\d{2}\] (\w+) has killed (\w+) from /;
    const deathRegex = /\[\d{2}:\d{2}:\d{2}\] (\w+) died to (\w+) from /;
    const guildRegex = /(?<= from )(\w+)/g
    const charNamesRegex = /\(([^,]+),([^)]+)\)/;

    for (const line of lines) {
      if (line.trim() === '') continue;

      // Extract timestamp
    const timeMatch = line.match(timestampRegex);
    if (timeMatch) {
      const hours = parseInt(timeMatch[1]);
      const minutes = parseInt(timeMatch[2]);
      const seconds = parseInt(timeMatch[3]);
      const totalMinutes = hours * 60 + minutes + seconds / 60;
      timestamps.push(totalMinutes);
    }
    

        // A. Check for a KILL event
        let match = line.match(killRegex);
        if (match) {
            const killerFamily = match[1];
            const victimFamily = match[2];

            uniqueFamilyNames.add(match[1]); // killer family
            uniqueFamilyNames.add(match[2]); // victim family

            // Extract character names
            const charMatch = line.match(charNamesRegex);
            if (charMatch) {
                const victimChar = charMatch[1].trim();
                const killerChar = charMatch[2].trim();
                
                // Map characters to families
                charToFamilyMap.set(victimChar, victimFamily);
                charToFamilyMap.set(killerChar, killerFamily);
                
                // Initialize players by CHARACTER NAME
                initializePlayer(killerChar, killerFamily);
                initializePlayer(victimChar, victimFamily);
                
                // Update stats by CHARACTER NAME
                playerStats[killerChar].kills++;
                playerStats[victimChar].deaths++;
                
                const matchGuild = line.match(guildRegex);
                if (matchGuild) playerStats[victimChar].guild = matchGuild[0];
            }
            continue;
        }
    
        // B. Check for a DEATH event
        match = line.match(deathRegex);
        if (match) {
            const victimFamily = match[1];
            const killerFamily = match[2];

            uniqueFamilyNames.add(match[1]); // victim family
            uniqueFamilyNames.add(match[2]); // killer family

            const charMatch = line.match(charNamesRegex);
            if (charMatch) {
                const victimChar = charMatch[2].trim();
                const killerChar = charMatch[1].trim();
                
                charToFamilyMap.set(victimChar, victimFamily);
                charToFamilyMap.set(killerChar, killerFamily);
                
                initializePlayer(victimChar, victimFamily);
                initializePlayer(killerChar, killerFamily);
                
                playerStats[victimChar].deaths++;
                playerStats[killerChar].kills++;
                
                const matchGuild = line.match(guildRegex);
                if (matchGuild) playerStats[killerChar].guild = matchGuild[0];
            }
            continue;
        }
    }

    const statsToInsert: { 
        game_id: string,
        char_name: string,
        family_name: string, 
        kills: number, 
        deaths: number,
        guild: string,
        class: string
        type: string,
        title:string,
    }[] = [];

    if (Object.keys(playerStats).length < 1) {
      return createError({message: "Not a valid .log file", status: 400})
    }

    for (const [char_name, stats] of Object.entries(playerStats)) {
      uniqueGuilds.add(stats.guild);
    }

    // Calculate duration
    let durationMinutes = 0;
    if (timestamps.length > 0) {
      const firstTime = Math.min(...timestamps);
      const lastTime = Math.max(...timestamps);
      durationMinutes = Math.round(lastTime - firstTime);
    }

    const totalGuilds = uniqueGuilds.size;
    const totalCharacters = Object.keys(playerStats).length;

    console.log(`Duration: ${durationMinutes} minutes`);
    console.log(`Total Guilds: ${Array.from(uniqueGuilds)}`);
    console.log(`Total Players: ${totalCharacters}`);

    // Get unique character names
    const characterNamesArray = Array.from(charToFamilyMap.keys());
    console.log("Character to Family mapping:", Object.fromEntries(charToFamilyMap));
    console.log("Unique character names:", characterNamesArray);

    // Check which characters already exist in the database
    const { data: existingChars, error: queryError } = await supabase
      .from('player_class')
      .select('char_name')
      .in('char_name', characterNamesArray);

    if (queryError) {
      console.error("Error querying existing characters:", queryError);
      return;
    }

    const existingCharNamesinDb = new Set(existingChars.map(row => row.char_name));
    console.log("Existing characters in DB:", Array.from(existingCharNamesinDb));

    const charactersToInsert: Array<{
      char_name: string;
      family_name: string;
      class: string;
    }> = [];

    const charsToProcess = Array.from(charToFamilyMap.entries())
      .filter(([char_name]) => !existingCharNamesinDb.has(char_name))
      .map(([char_name, family_name]) => ({ char_name, family_name }));

    const DELAY_MS = 10;
    const MAX_RETRIES = 3;

    const { results, errors, successCount, failureCount } = await processSequentially(
      charsToProcess,
      async (character) => {
        console.log(`DEBUG: Processing char_name="${character.char_name}", family_name="${character.family_name}"`);
        
        try {
          const playerData = await scrapePlayerClass(character.family_name, character.char_name);
          
          return {
            char_name: character.char_name,
            family_name: character.family_name,
            class: playerData.class || 'Unknown'
          };
        } catch (error) {
          console.error(`Scraping failed for ${character.char_name}, inserting as Unknown:`, error);
          // Return Unknown instead of throwing
          return {
            char_name: character.char_name,
            family_name: character.family_name,
            class: 'Unknown'
          };
        }
      },
      DELAY_MS,
      MAX_RETRIES
    );

    charactersToInsert.push(...results);

    console.log(`Successfully scraped: ${charactersToInsert.length}/${charsToProcess.length}`);
    console.log("Records ready for insertion:", charactersToInsert);

    if (charactersToInsert.length > 0) {
      const { data: insertedData, error: insertError } = await supabase
        .from('player_class')
        .insert(charactersToInsert);

      if (insertError) {
        console.error("Error inserting new characters:", insertError);
      } else {
        console.log(`Successfully inserted ${charactersToInsert.length} new characters.`);
      }
    } else {
      console.log("All characters already exist. No records inserted.");
    }

    // Insert combat log
    const { data: insertCombatLog, error: dbError } = await supabase
      .from('combat_logs')
      .insert({title: logName,
        guild:guildName,
        type:type,
        duration: durationMinutes,
        total_guilds:totalGuilds,
        total_players: totalCharacters,})
      .select('*');

    if (dbError) {
      console.error('Supabase DB Insert Error:', dbError);
      return createError({ 
        statusCode: 500, 
        message: 'Failed to save combat statistics to the database1.',
        data: dbError.message 
      });
    }

    // ⭐ CHANGED: Get character names from playerStats
    const characterNamesInLog = Object.keys(playerStats);

    // ⭐ CHANGED: Fetch class by char_name instead of family_name
    const { data: classData, error: classQueryError } = await supabase
      .from('player_class')
      .select('char_name, class')
      .in('char_name', characterNamesInLog);

    if (classQueryError) {
      console.error("Error querying player classes:", classQueryError);
    }

    console.log("Class Data: ", classData);

    // ⭐ CHANGED: Map by char_name instead of family_name
    const charClassMap = new Map<string, string>();
    if (classData) {
      for (const row of classData) {
        charClassMap.set(row.char_name, row.class);
      }
    }

    // ⭐ CHANGED: Loop through CHARACTER stats, not family stats
    for (const [char_name, stats] of Object.entries(playerStats)) {
      const playerClass = charClassMap.get(char_name) || 'Unknown';
      
      statsToInsert.push({
        game_id: insertCombatLog[0].id,
        char_name: char_name,
        family_name: stats.family_name,
        kills: stats.kills,
        deaths: stats.deaths,
        guild: stats.guild,
        class: playerClass,
        title: logName,
        type: type,
      });
    }

    console.log("Player stats: ", playerStats, "Length: ", Object.keys(playerStats).length);

    const { data: insertedCombatLogStats, error: dbError2 } = await supabase
      .from('combat_logs_stats')
      .insert(statsToInsert)
      .select('*');

    if (dbError2) {
      console.error('Supabase DB Insert Error:', dbError2);
      return createError({ 
        statusCode: 500, 
        message: 'Failed to save combat statistics to the database2.',
        data: dbError2.message 
      });
    }

    return insertCombatLog[0].id;
  } catch (error) {
    console.log(error)
    createError({
      statusCode: 500,
      message: "Error during processing the .log file",
      data: (error as Error).message || "Server side error"
    })
  }
})