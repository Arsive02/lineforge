import { NextRequest } from "next/server";
import { detectFormat } from "@/lib/document/processor";
import { extractImagesFromPdf } from "@/lib/document/pdf-extractor";
import { extractImagesFromDocx } from "@/lib/document/docx-extractor";
import {
  extractImagesFromMarkdown,
} from "@/lib/document/markdown-processor";
import { extractImagesFromHtml } from "@/lib/document/html-processor";
import { convertToLineArt, generateCaption } from "@/lib/gemini";
import { ExtractedImage } from "@/lib/document/types";

export const maxDuration = 120;

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const generateCaptions = formData.get("generateCaptions") !== "false";

  if (!file) {
    return new Response(JSON.stringify({ error: "No file provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const arrayBuffer = await file.arrayBuffer();
  const fileBuffer = Buffer.from(arrayBuffer);

  if (fileBuffer.length > 4.5 * 1024 * 1024) {
    return new Response(JSON.stringify({ error: "File exceeds 4.5MB limit" }), {
      status: 413,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(JSON.stringify(data) + "\n"));
      };

      try {
        // Check if input is a direct image file
        const isImageFile = file.type.startsWith("image/");
        let validImages: ExtractedImage[] = [];

        if (isImageFile) {
          // Treat the image file itself as a single "extracted" image
          validImages = [
            {
              id: "img-0",
              data: fileBuffer,
              mimeType: file.type || "image/png",
            },
          ];
        } else {
          // Extract images from document
          const format = detectFormat(file.name);
          let extractedImages: ExtractedImage[] = [];

          switch (format) {
            case "pdf":
              extractedImages = await extractImagesFromPdf(fileBuffer);
              break;
            case "docx": {
              const docxResult = await extractImagesFromDocx(fileBuffer);
              extractedImages = docxResult.images;
              break;
            }
            case "markdown": {
              const mdContent = fileBuffer.toString("utf-8");
              const mdResult = await extractImagesFromMarkdown(mdContent);
              extractedImages = mdResult.images;
              break;
            }
            case "html": {
              const htmlContent = fileBuffer.toString("utf-8");
              const htmlResult = await extractImagesFromHtml(htmlContent);
              extractedImages = htmlResult.images;
              break;
            }
          }

          // Filter out images without data
          validImages = extractedImages.filter((img) => img.data.length > 0);
        }

        send({ type: "extraction", totalImages: validImages.length });

        // Process each image and stream results
        for (let i = 0; i < validImages.length; i++) {
          const img = validImages[i];
          try {
            const lineArtResult = await convertToLineArt(img.data, img.mimeType);

            let caption: string | undefined;
            if (generateCaptions) {
              try {
                caption = await generateCaption(img.data, img.mimeType);
              } catch {
                caption = "Technical illustration";
              }
            }

            const originalBase64 = `data:${img.mimeType};base64,${img.data.toString("base64")}`;
            const lineArtBase64 = `data:${lineArtResult.mimeType};base64,${lineArtResult.buffer.toString("base64")}`;

            send({
              type: "image",
              index: i,
              id: `img-${i}`,
              originalBase64,
              lineArtBase64,
              caption,
              originalSize: img.data.length,
              lineArtSize: lineArtResult.buffer.length,
            });
          } catch (err) {
            send({
              type: "image_error",
              index: i,
              error: err instanceof Error ? err.message : "Processing failed",
            });
          }
        }

        send({ type: "complete" });
      } catch (err) {
        send({
          type: "error",
          error: err instanceof Error ? err.message : "Processing failed",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
    },
  });
}
