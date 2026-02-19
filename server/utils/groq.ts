import Groq from "groq-sdk";

let groqInstance: Groq | null = null;

export function getGroqAI() {
  if (!groqInstance) {
    const config = useRuntimeConfig();
    groqInstance = new Groq({ apiKey: config.groqApiKey });
    console.log("Groq instance initialized");
  }
  return groqInstance;
}