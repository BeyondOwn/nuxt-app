import type { GoogleGenAI } from '@google/genai';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { createGame } from '~/models/models';
import { checkRequestLimit } from './requestGuard';

interface beforeParsed {
  error?: string
  date_hour: string
  victory_team: {
    name: string
    kd: string
    deaths: number
    debuffs: number
    dealt: number
    taken: number
    healed: number
  }[]
  defeat_team: {
    name: string
    kd: string
    deaths: number
    debuffs: number
    dealt: number
    taken: number
    healed: number
  }[]
  score: {
    victory_team_score: number[]
    defeat_team_score: number[]
  }
  victory_team_name: string
  defeat_team_name: string
}

export async function generateTableContent(body: { name: string; base64Image: string }[], ai: GoogleGenAI, supabase: SupabaseClient) {
  // const imagePath = 'public/image.webp'; // Replace with your image path
  // const imageBytes = fs.readFileSync(imagePath);
  // const base64Image = Buffer.from(imageBytes).toString('base64');

  // const referencePath = path.join(process.cwd(), 'public', 'reference_image.png');
  
  // let referenceImageBase64 = '';
  // try {
  //   referenceImageBase64 = fs.readFileSync(referencePath, { encoding: 'base64' });
  // } catch (err) {
  //   console.error("Could not find reference image at:",err, referencePath);
  //   // Handle the error or provide a fallback
  // }

  const returns: { games: createGame[]; errors?: any[]; gamesName: string[] } = { games: [], errors: [], gamesName: [] }
  for (const image of body) {
    try {
      // Check request limit before each API call
      await checkRequestLimit(supabase);

      const imageBytes = image.base64Image.split(',')[1] // Extract base64 data and convert
      let sumDefeat = 0
      let sumVictory = 0

      const parts = [
        {
          text: 'You are an automated data extraction tool. Your sole task is to analyze the provided image, which is expected to contain game result information (like a scoreboard). Follow these instructions precisely:\n\n  *Careful with the OCR, for example there might be 2 players that seem the same called MEIGU but one is MEIGU and other is MElGU*\n 1.  **Identify Data Points:** Extract the following information from the image:\n    * The exact date and time of the match.\n    * The names of the two participating teams. Their names are found immediately after the "[Victory]" or "[Defeat]" tag associated with "[Guild Defender]" or "[Guild Unit]". For example, if you see "[Guild Defender][Victory] TeamAlpha", then "TeamAlpha" is the victory team name. Similarly, "[Guild Unit][Defeat] TeamBeta" means "TeamBeta" is the defeat team name.\n    * For **each** participant on the **victory team**: name, Kill/Death ratio (kd), debuffs applied (or relevant status effect count/metric), damage dealt, damage taken, and healing done.\n    * For **each** participant on the **defeat team**: name, Kill/Death ratio (kd), debuffs applied (or relevant status effect count/metric), damage dealt, damage taken, and healing done.\n * Deaths are found within the "K/D" value. The number of **deaths** is the integer value **after** the forward slash ("/") ex: 15/9 the deaths are 9  \n   * Kills are found within the "K/D" value. The number of **kills** is the integer value **before** the forward slash ("/"). For example, in "21/9", the kills are 21. Ensure you convert this value to a whole number (integer) before any calculations. The "/" is the only separator between kills and deaths.\n    * The total number of kills achieved by **each team**. Sum the individual kills (the number before the "/") for all participants on each team. Ensure this summation is accurate.\n\n2.  **Perform Calculations:**\n    * ** Calculate victory_team_score as an array of integer kill counts for each victory team participant;\ncalculate defeat_team_score as an array of integer kill counts for each defeat team participant.\n   3.  **Format Output:** Structure the extracted and calculated data into a single JSON object matching this **exact** format. `victory_team` and `defeat_team` must be arrays of participant objects.\n\n    ```json\n    {\n      "date_hour": "YYYY-MM-DD HH:MM",\n      "victory_team": [\n        {\n          "name": "participant_name",\n        "kd": "K/D value",\n      "deaths":"Deaths value",\n            "debuffs": "value",\n          "dealt": "value",\n          "taken": "value",\n          "healed": "value"\n        }\n      ],\n      "defeat_team": [\n        {\n          "name": "participant_name",\n          "kd": "K/D value",\n      "deaths":"Deaths value",\n          "debuffs": "value",\n          "dealt": "value",\n          "taken": "value",\n          "healed": "value"\n        }\n      ],\n      "score": {\n        "victory_team_score": [kill_int_1, kill_int_2, ...]\n  "defeat_team_score": [kill_int_1, kill_int_2, ...]},\n      "victory_team_name": "winning_team_name",\n      "defeat_team_name": "losing_team_name"\n    }\n    ```\n\n4.  **Output Constraints:**\n    * Your response MUST be **only** the JSON object defined above.\n    * Do NOT include any introductory text, explanations, apologies, summaries, or markdown formatting like ```json` or ```.\n    * Ensure the `date_hour` value strictly follows the `YYYY-MM-DD HH:MM` format. Extract the single relevant date and time from the image.\n\n5.  **Error Handling:**\n    * If the image does not contain clearly identifiable information for **all** required fields (both teams, participants with stats, date/time, team names, data needed for score calculation), or if the content obviously isn\'t a game result screen matching this structure, then your **entire response** must be **only** the following JSON object:\n        ```json\n        {"error": "Image data does not match the required structure or is insufficient."}\n        ```\n    * Do not attempt to generate partial JSON or guess missing values. Output the error JSON instead.\n\n**Execute this analysis on the provided image.**',
        }, // Text prompt
        {
          inlineData: {
            mimeType: 'image/png', // Or image/jpeg, etc.
            data: imageBytes,
          },
        },
      ]

      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ parts }],
      })

      if (!response.text) {
        console.error(`Error processing image ${image.name}.`)
        returns.errors?.push(`Error processing image ${image.name}.`)
        continue // Move to the next image
      }

      console.log(response.text)

      const beforeParsed = JSON.parse(response.text!.replace('```json', '').replace('```', '')) as beforeParsed

      beforeParsed.score.defeat_team_score.forEach((element) => {
        sumDefeat += element
      })

      beforeParsed.score.victory_team_score.forEach((element) => {
        sumVictory += element
      })

      sumDefeat = sumDefeat * 10
      sumVictory = sumVictory * 10

      const parsedResponse: createGame = {
        date_hour: beforeParsed.date_hour,
        victory_team: beforeParsed.victory_team,
        defeat_team: beforeParsed.defeat_team,
        score: {
          victory_team_score: sumVictory,
          defeat_team_score: sumDefeat,
        },
        victory_team_name: beforeParsed.victory_team_name,
        defeat_team_name: beforeParsed.defeat_team_name,
      }

      returns.games.push(parsedResponse)
      returns.gamesName.push(image.name)
    } catch (error) {
      console.error(`An unexpected error occurred while processing file ${image.name}:`, error)
      returns.errors?.push(`An unexpected error occurred while processing file ${image.name}: ${error}`)
      continue // Move to the next image
    }
  }
  return returns
}