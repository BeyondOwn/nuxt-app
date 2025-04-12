import type { GoogleGenAI } from '@google/genai'
import type { createGame } from '~/models/models'

export async function generateTableContent(base64Image: string[], ai: GoogleGenAI) {
  // const imagePath = 'public/image.webp'; // Replace with your image path
  // const imageBytes = fs.readFileSync(imagePath);
  // const base64Image = Buffer.from(imageBytes).toString('base64');

  const imageBytes = base64Image[0].split(',')[1] // Extract base64 data and convert

  const parts = [
    {
      text: 'You are an automated data extraction tool. Your sole task is to analyze the provided image, which is expected to contain game result information (like a scoreboard). Follow these instructions precisely:\n\n1.  **Identify Data Points:** Extract the following information from the image:\n    * The exact date and time of the match.\n    * The names of the two participating teams, their names are never Guild Defender or Guild Unit, you can get them after [Victory] respectively [Defeat] tags. Determine which team won and which lost based on the score or visual cues (e.g., "Victory"/"Defeat" labels).\n    * For **each** participant on the **victory team**: name, Kill/Death ratio (kd), debuffs applied (or relevant status effect count/metric), damage dealt, damage taken, and healing done.\n    * For **each** participant on the **defeat team**: name, Kill/Death ratio (kd), debuffs applied (or relevant status effect count/metric), damage dealt, damage taken, and healing done.\n    * The total number of kills achieved by **each team**. If only individual kills are shown, sum them for each team.\n\n2.  **Perform Calculations:**\n    * Calculate `victory_team_score`: Sum of kills for all participants in the victory team * 10.\n    * Calculate `defeat_team_score`: Sum of kills for all participants in the defeat team * 10.\n\n3.  **Format Output:** Structure the extracted and calculated data into a single JSON object matching this **exact** format. `victory_team` and `defeat_team` must be arrays of participant objects.\n\n    ```json\n    {\n      "date_hour": "YYYY-MM-DD HH:MM",\n      "victory_team": [\n        {\n          "name": "participant_name",\n          "kd": "K/D value",\n          "debuffs": "value",\n          "dealt": "value",\n          "taken": "value",\n          "healed": "value"\n        }\n      ],\n      "defeat_team": [\n        {\n          "name": "participant_name",\n          "kd": "K/D value",\n          "debuffs": "value",\n          "dealt": "value",\n          "taken": "value",\n          "healed": "value"\n        }\n      ],\n      "score": {\n        "victory_team_score": calculated_score_value,\n        "defeat_team_score": calculated_score_value\n      },\n      "victory_team_name": "winning_team_name",\n      "defeat_team_name": "losing_team_name"\n    }\n    ```\n\n4.  **Output Constraints:**\n    * Your response MUST be **only** the JSON object defined above.\n    * Do NOT include any introductory text, explanations, apologies, summaries, or markdown formatting like ```json` or ```.\n    * Ensure the `date_hour` value strictly follows the `YYYY-MM-DD HH:MM` format. Extract the single relevant date and time from the image.\n\n5.  **Error Handling:**\n    * If the image does not contain clearly identifiable information for **all** required fields (both teams, participants with stats, date/time, team names, data needed for score calculation), or if the content obviously isn\'t a game result screen matching this structure, then your **entire response** must be **only** the following JSON object:\n        ```json\n        {"error": "Image data does not match the required structure or is insufficient."}\n        ```\n    * Do not attempt to generate partial JSON or guess missing values. Output the error JSON instead.\n\n**Execute this analysis on the provided image.**',
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

  console.log(response.text)
  const parsedResponse = JSON.parse(response.text!.replace('```json', '').replace('```', '')) as createGame

  return parsedResponse
}
