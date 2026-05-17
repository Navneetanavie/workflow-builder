import type { GeminiJobPayload } from "@/lib/gemini/gemini-pipeline";

export function formatGeminiErrorResponse(
  message: string,
  payload: Pick<GeminiJobPayload, "prompt" | "systemPrompt" | "imageUrls">,
): string {
  const prompt = payload.prompt ?? "";
  const systemPrompt = payload.systemPrompt ?? "";
  const imageURL = payload.imageUrls?.filter(Boolean).join(", ") ?? "";

  return `Error: ${message};\nThe inputs were: [${prompt}, ${systemPrompt}, ${imageURL}]`;
}
