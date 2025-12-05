import { GoogleGenAI, Type } from "@google/genai";
import { CityGuideData } from "../types";

const apiKey = process.env.API_KEY;

// Initialize the client.
// Note: We are strictly following the guideline to use process.env.API_KEY directly.
const ai = new GoogleGenAI({ apiKey: apiKey });

export const generateCityGuide = async (city: string, country: string, duration: string): Promise<CityGuideData> => {
  const model = "gemini-2.5-flash";
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const numDays = parseInt(duration) || 1;

  const prompt = `
    You are an expert travel assistant system.
    Current Date: ${currentDate}
    Target: ${city}, ${country}
    Trip Duration: ${numDays} days

    The user requires a structured travel guide based on simulated input data for weather, nearby attractions, and map context.
    
    Please act as the system defined in the following specification and generate the output content.
    
    Tasks:
    1. Short City Introduction (2–3 sentences)
    2. Coordinates: Provide the Latitude and Longitude for the city center.
    3. Weather Summary (temperature, condition + packing suggestion based on typical weather for ${currentDate})
    4. Top 5 Attractions (name + short benefit + approximate latitude/longitude coordinates)
    5. Map Context (describe the general layout/geography of the area textually)
    6. Suggested ${numDays}-Day Itinerary. Group activities by day. Each day should have a specific theme.
    7. Helpful Local Tips (travel, food, safety, culture)

    Return the data in a strict JSON format matching the schema provided.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            city: { type: Type.STRING },
            country: { type: Type.STRING },
            coordinates: {
              type: Type.OBJECT,
              properties: {
                lat: { type: Type.NUMBER },
                lng: { type: Type.NUMBER },
              },
            },
            introduction: { type: Type.STRING },
            weather: {
              type: Type.OBJECT,
              properties: {
                temperature: { type: Type.STRING },
                condition: { type: Type.STRING },
                packingSuggestion: { type: Type.STRING },
              },
            },
            attractions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  benefit: { type: Type.STRING },
                  coordinates: {
                    type: Type.OBJECT,
                    properties: {
                      lat: { type: Type.NUMBER },
                      lng: { type: Type.NUMBER },
                    },
                  },
                },
              },
            },
            mapContext: { type: Type.STRING },
            itinerary: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  day: { type: Type.NUMBER },
                  theme: { type: Type.STRING },
                  activities: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        time: { type: Type.STRING },
                        activity: { type: Type.STRING },
                      }
                    }
                  }
                },
              },
            },
            localTips: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  tip: { type: Type.STRING },
                },
              },
            },
          },
        },
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No text returned from Gemini");
    }

    const parsedData = JSON.parse(jsonText);

    // Sanitize and provide default values to ensure UI stability
    // This prevents "Cannot read properties of undefined" errors if the model output is incomplete
    const safeData: CityGuideData = {
      city: parsedData.city || city,
      country: parsedData.country || country,
      coordinates: parsedData.coordinates || { lat: 0, lng: 0 },
      introduction: parsedData.introduction || "Information currently unavailable.",
      weather: parsedData.weather || { 
        temperature: "N/A", 
        condition: "Unknown", 
        packingSuggestion: "Please check local forecast." 
      },
      attractions: Array.isArray(parsedData.attractions) ? parsedData.attractions : [],
      mapContext: parsedData.mapContext || "Map details unavailable.",
      itinerary: Array.isArray(parsedData.itinerary) ? parsedData.itinerary : [],
      localTips: Array.isArray(parsedData.localTips) ? parsedData.localTips : [],
    };

    return safeData;
  } catch (error) {
    console.error("Error generating city guide:", error);
    throw error;
  }
};

export const generateCityImage = async (city: string, country: string): Promise<string | undefined> => {
  const model = "gemini-2.5-flash-image";
  const prompt = `Generate a photorealistic, cinematic wide-angle travel photography image of ${city}, ${country}, showcasing its most iconic landmark or skyline. High quality, detailed, daylight.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        imageConfig: {
          aspectRatio: "16:9",
        },
      },
    });

    // Iterate through parts to find the image
    const parts = response.candidates?.[0]?.content?.parts;
    if (parts) {
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    return undefined;
  } catch (error) {
    console.error("Error generating city image:", error);
    // Return undefined so the app works without the image
    return undefined;
  }
};

export const generateCityGallery = async (city: string, country: string): Promise<string[]> => {
  const model = "gemini-2.5-flash-image";
  const prompts = [
    `Famous historic landmark or architecture in ${city}, ${country}, photorealistic travel photography, 4k`,
    `Delicious local street food or traditional dish of ${city}, ${country}, professional food photography`,
    `Vibrant street life or cultural scene in ${city}, ${country}, cinematic lighting`
  ];

  try {
    const promises = prompts.map(async (prompt) => {
      try {
        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            imageConfig: {
              aspectRatio: "4:3",
            },
          },
        });
        const parts = response.candidates?.[0]?.content?.parts;
        if (parts) {
          for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
              return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            }
          }
        }
        return undefined;
      } catch (e) {
        console.warn("Failed to generate one gallery image", e);
        return undefined;
      }
    });

    const results = await Promise.all(promises);
    return results.filter((img): img is string => img !== undefined);
  } catch (error) {
    console.error("Error generating gallery:", error);
    return [];
  }
};