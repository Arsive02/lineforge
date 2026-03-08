import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { ProcessedImage } from "./types";

/**
 * Create a new PDF with processed line art images and captions.
 */
export async function assemblePdf(
  processedImages: ProcessedImage[]
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Courier);

  for (const img of processedImages) {
    let embeddedImage;
    if (img.lineArtMimeType === "image/png") {
      embeddedImage = await pdfDoc.embedPng(img.lineArt);
    } else {
      embeddedImage = await pdfDoc.embedJpg(img.lineArt);
    }

    const { width: imgWidth, height: imgHeight } = embeddedImage.scale(1);

    // Scale to fit page (max 500pt wide, maintaining aspect)
    const maxWidth = 500;
    const maxHeight = 700;
    const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight, 1);
    const w = imgWidth * scale;
    const h = imgHeight * scale;

    const captionHeight = img.caption ? 40 : 0;
    const pageWidth = w + 80;
    const pageHeight = h + 80 + captionHeight;

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Draw border
    page.drawRectangle({
      x: 20,
      y: 20,
      width: pageWidth - 40,
      height: pageHeight - 40,
      borderColor: rgb(0.3, 0.3, 0.3),
      borderWidth: 0.5,
    });

    // Draw image
    page.drawImage(embeddedImage, {
      x: 40,
      y: 40 + captionHeight,
      width: w,
      height: h,
    });

    // Draw caption
    if (img.caption) {
      const fontSize = 8;
      const captionText = img.caption.substring(0, 120);
      page.drawText(captionText, {
        x: 40,
        y: 30,
        size: fontSize,
        font,
        color: rgb(0.3, 0.3, 0.3),
        maxWidth: pageWidth - 80,
      });
    }
  }

  const bytes = await pdfDoc.save();
  return Buffer.from(bytes);
}
