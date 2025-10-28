
import { GoogleGenAI, Type, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const extractWordsFromImage = async (base64Image: string, mimeType: string): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { text: "Extract all the spelling words from this image. Return them as a JSON array of strings. For example: ['apple', 'banana', 'cherry']. Only return the array." },
          { inlineData: { data: base64Image, mimeType } }
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
        },
      },
    });

    const jsonString = response.text.trim();
    // The response is already parsed by the SDK when a schema is provided.
    const parsedResponse = JSON.parse(jsonString);
    if (Array.isArray(parsedResponse) && parsedResponse.every(item => typeof item === 'string')) {
      return parsedResponse;
    } else {
      throw new Error("Invalid response format from Gemini API");
    }
  } catch (error) {
    console.error("Error extracting words from image:", error);
    throw new Error("Could not extract words from the image. Please try again with a clearer picture.");
  }
};

export const generateSentenceForWord = async (word: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Create a simple, age-appropriate sentence using the word "${word}". The sentence should be easy for a child to understand.`,
    });
    return response.text.trim();
  } catch (error) {
    console.error(`Error generating sentence for "${word}":`, error);
    return `The word is "${word}".`; // Fallback sentence
  }
};

export const textToSpeech = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return base64Audio;
    } else {
      throw new Error("No audio data received from API.");
    }
  } catch (error) {
    console.error(`Error generating speech for "${text}":`, error);
    throw new Error("Could not generate audio for the word.");
  }
};
