import { NextRequest, NextResponse } from "next/server";
import { rasterToSvg } from "@/lib/potrace";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    const svg = await rasterToSvg(imageBuffer);

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
      },
    });
  } catch (err) {
    console.error("Vectorization error:", err);
    const message = err instanceof Error ? err.message : "Vectorization failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
