import * as cheerio from 'cheerio';
import type { PlayerData } from "~/types/player";

export async function scrapePlayerClass(
    familyName: string, 
    charName:string,
    region: string = 'NAEU'
  ): Promise<PlayerData> {
    // Example URL - adjust based on actual website
    const searchUrl = `https://www.naeu.playblackdesert.com/en-US/Adventure?checkSearchText=False&region=EU&searchType=1&searchKeyword=${encodeURIComponent(charName)}`;
    
    try {
      const response = await $fetch(searchUrl,{
        headers:{
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1'
        }
      }) as string;
      
      // Parse HTML (you'll need to adjust selectors based on actual site)
      // Using cheerio or similar
      const $ = cheerio.load(response);
    //   console.log("HTML: ",$.text());

      let characterInfo = '';

      const name = $('span.text_area span.text').text().trim();

      if (!name){
        throw new Error(`HTML error: Name not found rate limited`)
      }
  
    //   console.log("Char List: ",charList.text().trim())
      // Iterate through each character in the list

        console.log("Character name found: ",name);
        
        // Check if this matches our target character
        if (name === charName) {
          // Extract the character_info text
            const classProfile =  $('span.name').text().trim();
            characterInfo = classProfile;
        }
    
      
      if (!characterInfo) {
        throw new Error(`Character ${charName} not found in character list`);
      }
      
      console.log('Character info:', characterInfo);
  
      return {
        charName,
        familyName,
        class: characterInfo,
        region
      };
    } catch (error) {
      throw new Error(`Scraping failed: ${error.message}`);
    }
  }