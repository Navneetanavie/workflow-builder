import { task, logger } from "@trigger.dev/sdk/v3";

import {
  runGeminiPipeline,
  type GeminiJobPayload,
  type GeminiJobResult,
} from "@/lib/gemini/gemini-pipeline";

export type { GeminiJobPayload, GeminiJobResult };

export const geminiJob = task({
  id: "gemini-generate",
  run: async (payload: GeminiJobPayload): Promise<GeminiJobResult> => {
    logger.info("Starting gemini-generate task", {
      imageCount: payload.imageUrls?.length ?? 0,
    });
    return runGeminiPipeline(payload);
  },
});
