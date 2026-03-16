/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/ai.service.ts
import { GoogleGenAI } from "@google/genai";
import fetch from "node-fetch";
import { enVars } from "../../config/env";

const gemini = new GoogleGenAI({ apiKey: enVars.GEMINI_API_KEY });

export const generateAIResponse = async (message: string) => {
  try {
    // Try Gemini first
    const gemResponse = await gemini.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `You are PayKotha AI assistant.\nUser: ${message}`,
    });
    return gemResponse.text;
  } catch (e: any) {
    if (e.status === 429 || e.status === 403) {
      // Fallback to Hugging Face
      const hfResponse = await fetch(
        "https://api-inference.huggingface.co/models/gpt2",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${enVars.HUGGINGFACE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ inputs: message }),
        },
      );
      const data = await hfResponse.json();

      if (Array.isArray(data) && data[0]?.generated_text) {
        return data[0].generated_text;
      }

      return "AI temporarily unavailable.";
    }
    throw e;
  }
};

export const AIServices = {
  generateAIResponse,
};
