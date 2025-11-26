
import { GoogleGenAI } from "@google/genai";

export const getAINameSuggestion = async (inputText: string): Promise<string> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is not set.");
    // Return a formatted version of the input as a fallback.
     return inputText
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Based on the user input "${inputText}", suggest a concise and professional item description for a bill or estimate. For example, if the input is '5m cloth', a good suggestion is 'Cloth (5 meters)'. If the input is '10kg silk cotton', suggest 'Silk Cotton (10 kg)'. Return ONLY the suggested text, nothing else.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            // Disable thinking for low latency response
            thinkingConfig: { thinkingBudget: 0 }
        }
    });

    const text = response.text.trim();
    // A simple check to ensure the response is not empty or just punctuation
    return text.length > 2 ? text : inputText;

  } catch (error) {
    console.error("Error fetching AI suggestion:", error);
    // Fallback in case of API error
     return inputText
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
};


export const getAIPriceSuggestion = async (itemName: string): Promise<number | null> => {
  if (!process.env.API_KEY) {
    console.error("API_KEY is not set.");
    return null;
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Based on the item description "${itemName}" for a custom bedding and cushion shop in India, suggest a plausible market price in Indian Rupees (INR). Return ONLY the numeric value, without any currency symbols, commas, or explanatory text. For example, for '1kg Silk Cotton', a good suggestion is '800'. For 'Standard Pillow Cover', suggest '150'.`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            // Disable thinking for low latency response
            thinkingConfig: { thinkingBudget: 0 }
        }
    });

    const text = response.text.trim();
    const price = parseFloat(text);

    return isNaN(price) ? null : price;

  } catch (error) {
    console.error("Error fetching AI price suggestion:", error);
    return null;
  }
};
