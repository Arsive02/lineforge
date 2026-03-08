import { NextRequest, NextResponse } from "next/server";
import { submitImageTo3D } from "@/lib/meshy";

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    const mimeType = file.type || "image/png";

    const taskId = await submitImageTo3D(base64, mimeType);

    return NextResponse.json({ taskId });
  } catch (err) {
    console.error("3D submission error:", err);
    const message = err instanceof Error ? err.message : "Submission failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
