import { GoogleGenAI } from "@google/genai";
import { compressLineArt } from "./compress";

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const MODEL = process.env.GEMINI_MODEL || "gemini-3-pro-image-preview";

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 5000;

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status === 429 && attempt < MAX_RETRIES) {
        // Parse retry delay from error if available, otherwise use exponential backoff
        let delay = BASE_DELAY_MS * Math.pow(2, attempt);
        const message = (err as { message?: string }).message || "";
        const retryMatch = message.match(/retryDelay.*?(\d+)s/);
        if (retryMatch) {
          delay = Math.max(delay, parseInt(retryMatch[1], 10) * 1000);
        }
        console.log(`Rate limited. Retrying in ${delay / 1000}s (attempt ${attempt + 1}/${MAX_RETRIES})...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Max retries exceeded");
}

/**
 * Convert an image to CAD-style line art using Gemini's image generation.
 */
export async function convertToLineArt(
  imageBuffer: Buffer,
  mimeType: string
): Promise<{ buffer: Buffer; mimeType: string }> {
  const base64 = imageBuffer.toString("base64");

  const response = await withRetry(() =>
    client.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64,
              },
            },
            {
              text: "Convert this image into a clean CAD-style technical line art drawing. Use only black lines on a white background. Show clear outlines, edges, and structural details as an engineer would draw them. Remove all colors, textures, and shading — keep only precise contour lines. The output should look like a blueprint/engineering drawing.",
            },
          ],
        },
      ],
      config: {
        responseModalities: ["IMAGE", "TEXT"],
      },
    })
  );

  // Extract image from response
  const parts = response.candidates?.[0]?.content?.parts;
  if (!parts) {
    throw new Error("No response from Gemini");
  }

  for (const part of parts) {
    if (part.inlineData) {
      const rawBuffer = Buffer.from(part.inlineData.data!, "base64");
      const compressed = await compressLineArt(rawBuffer);
      return {
        buffer: compressed,
        mimeType: "image/png",
      };
    }
  }

  throw new Error(
    "Gemini returned text instead of an image. The model may not support image generation for this input."
  );
}

/**
 * Generate a technical engineering caption for an image.
 */
export async function generateCaption(
  imageBuffer: Buffer,
  mimeType: string
): Promise<string> {
  const base64 = imageBuffer.toString("base64");

  const response = await withRetry(() =>
    client.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType,
                data: base64,
              },
            },
            {
              text: "Generate a brief, technical engineering-style caption for this image. Be concise (1-2 sentences). Use formal technical language as would appear in an engineering document or blueprint annotation. Do not use markdown formatting.",
            },
          ],
        },
      ],
      config: {
        responseModalities: ["TEXT"],
      },
    })
  );

  const text = response.candidates?.[0]?.content?.parts
    ?.filter((p) => p.text)
    .map((p) => p.text)
    .join("");

  return text || "Technical illustration — no caption generated";
}
