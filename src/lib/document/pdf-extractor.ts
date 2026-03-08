import { PDFDocument, PDFName, PDFStream, PDFRawStream, PDFRef } from "pdf-lib";
import sharp from "sharp";
import { ExtractedImage } from "./types";

/**
 * Extract images from a PDF by iterating over page XObjects.
 */
export async function extractImagesFromPdf(
  pdfBuffer: Buffer
): Promise<ExtractedImage[]> {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const images: ExtractedImage[] = [];
  const pages = pdfDoc.getPages();

  for (let pageIdx = 0; pageIdx < pages.length; pageIdx++) {
    const page = pages[pageIdx];
    const resources = page.node.get(PDFName.of("Resources"));
    if (!resources) continue;

    const xObjects =
      resources instanceof Map
        ? (resources as unknown as { get(key: PDFName): unknown }).get(PDFName.of("XObject"))
        : (resources as unknown as { lookupMaybe?(key: PDFName, type: unknown): unknown })?.lookupMaybe?.(
            PDFName.of("XObject"),
            Object
          );
    if (!xObjects) continue;

    // Try to enumerate XObject entries
    const xObjDict = xObjects as { entries?: () => [PDFName, PDFRef | PDFStream][] };
    if (typeof xObjDict.entries !== "function") continue;

    for (const [name, ref] of xObjDict.entries()) {
      try {
        // Dereference if needed
        let stream: PDFStream | PDFRawStream | undefined;
        if (ref instanceof PDFStream || ref instanceof PDFRawStream) {
          stream = ref;
        } else if (ref instanceof PDFRef) {
          const obj = pdfDoc.context.lookup(ref);
          if (obj instanceof PDFStream || obj instanceof PDFRawStream) {
            stream = obj;
          }
        }
        if (!stream) continue;

        const subtypeVal = stream.dict.get(PDFName.of("Subtype"));
        if (!subtypeVal || subtypeVal.toString() !== "/Image") continue;

        // Get raw image data
        const rawData = stream instanceof PDFRawStream
          ? stream.contents
          : (stream as unknown as { getContents(): Uint8Array }).getContents?.();
        if (!rawData || rawData.length < 100) continue;

        // Try converting to PNG via sharp
        let pngBuffer: Buffer;
        try {
          pngBuffer = await sharp(Buffer.from(rawData)).png().toBuffer();
        } catch {
          // If sharp can't read the raw data directly, skip
          continue;
        }

        const metadata = await sharp(pngBuffer).metadata();

        images.push({
          id: `pdf-p${pageIdx}-${name.toString()}`,
          data: pngBuffer,
          mimeType: "image/png",
          width: metadata.width,
          height: metadata.height,
        });
      } catch {
        // Skip problematic images
        continue;
      }
    }
  }

  // Fallback: if no images found via XObjects, try embedded images from pdf-parse
  if (images.length === 0) {
    try {
      const pdfParseModule = await import("pdf-parse");
      const pdfParse = (pdfParseModule as unknown as { default: (buf: Buffer) => Promise<unknown> }).default ?? pdfParseModule;
      await (pdfParse as (buf: Buffer) => Promise<unknown>)(pdfBuffer);
    } catch {
      // Ignore
    }
  }

  return images;
}
