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
  mimeType: string,
  customPrompt?: string
): Promise<{ buffer: Buffer; mimeType: string }> {
  const base64 = imageBuffer.toString("base64");

  const prompt =
    customPrompt ||
    "Convert this image into a clean CAD-style technical line art drawing. Use only black lines on a white background. Show clear outlines, edges, and structural details as an engineer would draw them. Remove all colors, textures, and shading — keep only precise contour lines. The output should look like a blueprint/engineering drawing.";

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
              text: prompt,
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

/**
 * Generate a video from an image using Veo 3.1.
 */
export async function generateVideo(
  imageBuffer: Buffer,
  mimeType: string,
  prompt: string
): Promise<{ videoBase64: string; mimeType: string }> {
  const base64 = imageBuffer.toString("base64");

  const operation = await withRetry(() =>
    client.models.generateVideos({
      model: "veo-3.1-generate-preview",
      prompt,
      image: {
        imageBytes: base64,
        mimeType,
      },
      config: {
        aspectRatio: "16:9",
        numberOfVideos: 1,
      },
    })
  );

  // Poll for completion — Veo can take up to 6 minutes
  let result = operation;
  while (!result.done) {
    await new Promise((r) => setTimeout(r, 10000));
    result = await client.operations.getVideosOperation({
      operation: result,
    });
  }

  const video = result.response?.generatedVideos?.[0]?.video;
  if (!video) {
    throw new Error("Veo returned no video");
  }

  // Get video bytes — SDK provides base64 string directly
  if (video.videoBytes) {
    return {
      videoBase64: video.videoBytes,
      mimeType: "video/mp4",
    };
  }

  // Fallback: fetch from URI with authentication
  if (video.uri) {
    // Try with Bearer token first
    let res = await fetch(video.uri, {
      headers: { Authorization: `Bearer ${process.env.GEMINI_API_KEY}` },
    });
    if (!res.ok) {
      // Try with API key as query param (Google AI Studio style)
      const urlWithKey = `${video.uri}${video.uri.includes("?") ? "&" : "?"}key=${process.env.GEMINI_API_KEY}`;
      res = await fetch(urlWithKey);
    }
    if (!res.ok) throw new Error(`Failed to fetch video from URI: ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    return {
      videoBase64: buf.toString("base64"),
      mimeType: "video/mp4",
    };
  }

  throw new Error("Veo returned video with no bytes or URI");
}
