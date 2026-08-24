// ─────────────────────────────────────────────────────────────────
// ACCELERATE AI — Gemini Client
// ─────────────────────────────────────────────────────────────────

import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

export function getGemini() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export function getModel(modelName = "gemini-2.0-flash") {
  return getGemini().getGenerativeModel({ model: modelName });
}

export async function generateText(
  systemPrompt: string,
  userPrompt: string,
  model = "gemini-2.0-flash"
): Promise<string> {
  try {
    const genModel = getModel(model);
    const result = await genModel.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.7,
      },
    });
    return result.response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    throw error;
  }
}

export async function* generateTextStream(
  systemPrompt: string,
  userPrompt: string,
  model = "gemini-2.0-flash"
): AsyncGenerator<string> {
  try {
    const genModel = getModel(model);
    const result = await genModel.generateContentStream({
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
        },
      ],
      generationConfig: {
        maxOutputTokens: 4096,
        temperature: 0.7,
      },
    });

    for await (const chunk of result.stream) {
      const text = chunk.text();
      if (text) yield text;
    }
  } catch (error) {
    console.error("Gemini stream error:", error);
    throw error;
  }
}
