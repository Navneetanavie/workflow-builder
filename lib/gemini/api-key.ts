export function getGeminiApiKey(): string {
  const key =
    process.env.GOOGLE_GEMINI_API_KEY ??
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ??
    process.env.GEMINI_API_KEY;

  if (!key?.trim()) {
    throw new Error(
      "GOOGLE_GEMINI_API_KEY is not set. Add an API key from Google AI Studio.",
    );
  }

  return key.trim();
}
