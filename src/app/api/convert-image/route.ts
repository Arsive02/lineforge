import { NextRequest, NextResponse } from "next/server";
import { convertToLineArt, generateCaption } from "@/lib/gemini";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const withCaption = formData.get("caption") === "true";
    const prompt = (formData.get("prompt") as string) || undefined;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || "image/png";

    const result = await convertToLineArt(imageBuffer, mimeType, prompt);

    let caption: string | undefined;
    if (withCaption) {
      try {
        caption = await generateCaption(imageBuffer, mimeType);
      } catch {
        caption = undefined;
      }
    }

    const base64 = result.buffer.toString("base64");

    return NextResponse.json({
      image: `data:${result.mimeType};base64,${base64}`,
      mimeType: result.mimeType,
      caption,
      originalSize: imageBuffer.length,
      lineArtSize: result.buffer.length,
    });
  } catch (err) {
    console.error("Image conversion error:", err);
    const message = err instanceof Error ? err.message : "Conversion failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
