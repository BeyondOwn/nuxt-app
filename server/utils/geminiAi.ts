import { GoogleGenAI } from "@google/genai";

// Module-level variable acts as a singleton
let geminiInstance: GoogleGenAI | null = null;

export function getGeminiAI() {
  if (!geminiInstance) {
    const config = useRuntimeConfig();
    geminiInstance = new GoogleGenAI({apiKey:config.geminiApiKey});
    console.log("Gemini AI instance initialized");
  }
  return geminiInstance;
}