import { NextRequest, NextResponse } from "next/server";
import { generateVideo } from "@/lib/gemini";

export const maxDuration = 300; // Vercel hobby plan max

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const prompt = (formData.get("prompt") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);
    const mimeType = file.type || "image/png";

    const result = await generateVideo(imageBuffer, mimeType, prompt);

    return NextResponse.json({
      video: `data:${result.mimeType};base64,${result.videoBase64}`,
      mimeType: result.mimeType,
      size: result.videoBase64.length,
    });
  } catch (err) {
    console.error("Video generation error:", err);
    const message = err instanceof Error ? err.message : "Video generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
