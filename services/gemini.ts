import { GoogleGenAI, Type, Modality } from "@google/genai";
import { decodeBase64, decodeAudioData } from './geminiUtils';

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Text Generation
export const generateStoryText = async (
  communityName: string, 
  objectName: string, 
  theme: string
): Promise<{ title: string; content: string }> => {
  
  const prompt = `
    Write a short, engaging, kid-friendly (ages 8-12) first-person story.
    Perspective: A child from the ${communityName} community.
    Topic: Their cultural connection to "${objectName}" within the theme of "${theme}".
    Length: Approximately 100-120 words.
    Tone: Warm, educational, inviting.
    
    Output JSON format:
    {
      "title": "A creative title for the story",
      "content": "The story text..."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
          },
          required: ["title", "content"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No content generated");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Story Error:", error);
    return {
      title: `${communityName} Story`,
      content: "We are currently unable to load this story. Please try again later or ask your guide!"
    };
  }
};

// Image Generation
export const generateStoryImage = async (
  communityName: string,
  objectName: string,
  themeVisual: string
): Promise<string | undefined> => {
  const prompt = `
    Create a vibrant, educational, kid-friendly illustration in a mixed-media collage style.
    Subject: A beautiful still life composition focusing ONLY on the object "${objectName}" from ${communityName} culture.
    CRITICAL INSTRUCTION: NO PEOPLE, NO FACES, NO BODY PARTS, NO ANIMALS, NO MYTHICAL CREATURES.
    Background/Theme: Integrate patterns, textures, and visual elements of ${themeVisual} as a decorative background.
    Style: Colorful, artistic, warm. Flat lay or detailed object study.
    Aspect Ratio: 16:9.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return part.inlineData.data;
      }
    }
    return undefined;
  } catch (error) {
    console.error("Gemini Image Error:", error);
    return undefined;
  }
};

// Audio Generation (Returns Base64 String)
export const generateStoryAudio = async (text: string): Promise<string> => {
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
    
    if (!base64Audio) {
      throw new Error("No audio data returned");
    }

    return base64Audio;

  } catch (error) {
    console.error("Gemini TTS Error:", error);
    throw error;
  }
};