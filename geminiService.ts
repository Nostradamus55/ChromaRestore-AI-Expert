
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisResponse } from "./types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async analyzePhotos(bwImageBase64: string, refImageBase64?: string): Promise<AnalysisResponse> {
    const model = 'gemini-3-pro-preview';

    const parts: any[] = [
      {
        inlineData: {
          mimeType: 'image/png',
          data: bwImageBase64,
        },
      },
    ];

    let refPrompt = "";
    if (refImageBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: refImageBase64,
        },
      });
      refPrompt = `
      There is a second image provided as a COLOR REFERENCE. 
      Analyze its chromatic characteristics (skin tones, lighting, contrast) 
      and suggest how to transfer these specific colors to the B&W photo.
      `;
    }

    const prompt = `
      As a "ChromaRestore AI Expert", analyze this historical B&W photograph.
      Your goal is to provide a comprehensive plan for digital reconstruction and colorization.
      
      Tasks:
      1. Scene Detection: Identify objects, textures, period, and geographical context. Analyze any text or notes.
      2. Color Palette: Create a set of colors (HEX) for accurate colorization based on historical research or the provided reference.
      3. Restoration Guide: List technical steps to repair damage, noise, or sharpness.
      4. Imagen 3 Prompt: Generate a professional English technical prompt for Image-to-Image colorization.

      ${refPrompt}

      Return the response strictly as a JSON object with the following structure:
      {
        "sceneDetection": {
          "description": "string",
          "objects": ["string"],
          "era": "string",
          "context": "string",
          "textAnalysis": "string (optional)"
        },
        "colorPalette": [
          {"hex": "string", "label": "string", "description": "string"}
        ],
        "restorationGuide": [
          {"step": "string", "action": "string", "details": "string"}
        ],
        "imagenPrompt": "string"
      }
    `;

    parts.push({ text: prompt });

    const response: GenerateContentResponse = await this.ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sceneDetection: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                objects: { type: Type.ARRAY, items: { type: Type.STRING } },
                era: { type: Type.STRING },
                context: { type: Type.STRING },
                textAnalysis: { type: Type.STRING }
              },
              required: ["description", "objects", "era", "context"]
            },
            colorPalette: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  hex: { type: Type.STRING },
                  label: { type: Type.STRING },
                  description: { type: Type.STRING }
                },
                required: ["hex", "label", "description"]
              }
            },
            restorationGuide: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  step: { type: Type.STRING },
                  action: { type: Type.STRING },
                  details: { type: Type.STRING }
                },
                required: ["step", "action", "details"]
              }
            },
            imagenPrompt: { type: Type.STRING }
          },
          required: ["sceneDetection", "colorPalette", "restorationGuide", "imagenPrompt"]
        }
      },
    });

    const result = JSON.parse(response.text || '{}');
    return result as AnalysisResponse;
  }
}
