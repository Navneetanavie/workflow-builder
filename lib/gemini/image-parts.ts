import type { Part } from "@google/generative-ai";

function guessMimeType(url: string): string {
  const lower = url.split("?")[0]?.toLowerCase() ?? "";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}

export async function imageUrlToInlinePart(url: string): Promise<Part> {
  const response = await fetch(url, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch vision image (${response.status}): ${url}`,
    );
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const headerMime = response.headers.get("content-type")?.split(";")[0]?.trim();
  const mimeType =
    headerMime && headerMime.startsWith("image/")
      ? headerMime
      : guessMimeType(url);

  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType,
    },
  };
}

export async function imageUrlsToInlineParts(urls: string[]): Promise<Part[]> {
  const unique = [...new Set(urls.map((u) => u.trim()).filter(Boolean))];
  return Promise.all(unique.map((url) => imageUrlToInlinePart(url)));
}
