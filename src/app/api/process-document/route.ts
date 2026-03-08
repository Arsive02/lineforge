import { NextRequest, NextResponse } from "next/server";
import { processDocument } from "@/lib/document/processor";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const generateCaptions = formData.get("generateCaptions") !== "false";
    const convertToSvg = formData.get("convertToSvg") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    if (fileBuffer.length > 4.5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File exceeds 4.5MB limit" },
        { status: 413 }
      );
    }

    const result = await processDocument(fileBuffer, file.name, {
      generateCaptions,
      convertToSvg,
    });

    return new NextResponse(new Uint8Array(result.outputBuffer), {
      headers: {
        "Content-Type": result.outputMimeType,
        "Content-Disposition": `attachment; filename="${result.outputFilename}"`,
        "X-Processed-Images": String(result.processedImages.length),
      },
    });
  } catch (err) {
    console.error("Document processing error:", err);
    const message = err instanceof Error ? err.message : "Processing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
