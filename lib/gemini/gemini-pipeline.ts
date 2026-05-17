import {
  GoogleGenerativeAI,
  type GenerationConfig,
} from "@google/generative-ai";

import { getGeminiApiKey } from "@/lib/gemini/api-key";
import { imageUrlsToInlineParts } from "@/lib/gemini/image-parts";
import { GEMINI_MODEL_ID } from "@/lib/gemini/models";
import type { GeminiSettings } from "@/lib/workflow/types";

export type GeminiJobPayload = {
  prompt: string;
  systemPrompt?: string;
  imageUrls: string[];
  settings: GeminiSettings;
};

export type GeminiJobResult = {
  success: boolean;
  text?: string;
  message?: string;
  error?: string;
};

function parseStopSequences(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildGenerationConfig(settings: GeminiSettings): GenerationConfig {
  const config: GenerationConfig = {
    temperature: settings.temperature,
    maxOutputTokens: settings.maxTokens,
    topP: settings.topP,
    topK: settings.topK,
  };

  const stopSequences = parseStopSequences(settings.stopSequences);
  if (stopSequences.length > 0) {
    config.stopSequences = stopSequences;
  }

  if (settings.seed > 0) {
    // Supported on select Gemini models; ignored otherwise.
    (config as GenerationConfig & { seed?: number }).seed = settings.seed;
  }

  return config;
}

export async function runGeminiPipeline(
  payload: GeminiJobPayload,
): Promise<GeminiJobResult> {
  const prompt = payload.prompt?.trim();
  if (!prompt) {
    return { success: false, error: "Prompt is required" };
  }

  try {
    const genAI = new GoogleGenerativeAI(getGeminiApiKey());
    const systemInstruction = payload.systemPrompt?.trim() || undefined;

    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL_ID,
      systemInstruction,
      generationConfig: buildGenerationConfig(payload.settings),
    });

    const parts = await imageUrlsToInlineParts(payload.imageUrls ?? []);
    const content = [...parts, { text: prompt }];

    const result = await model.generateContent(content);
    const text = result.response.text();

    if (!text?.trim()) {
      return {
        success: false,
        error: "Gemini returned an empty response",
      };
    }

    return {
      success: true,
      text: text.trim(),
      message: `Generated with ${GEMINI_MODEL_ID}`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("429") || message.includes("quota")) {
      return {
        success: false,
        error:
          `Gemini API rate limit reached for ${GEMINI_MODEL_ID}. Wait a minute and retry, or check usage at https://ai.dev/rate-limit`,
      };
    }
    return { success: false, error: message };
  }
}
