import {
  Document,
  Packer,
  Paragraph,
  ImageRun,
  TextRun,
  AlignmentType,
} from "docx";
import { ProcessedImage } from "./types";

/**
 * Build a new DOCX with line art images and captions.
 */
export async function assembleDocx(
  processedImages: ProcessedImage[]
): Promise<Buffer> {
  const children: Paragraph[] = [];

  for (const img of processedImages) {
    // Add image
    const imgWidth = Math.min(img.original.width || 400, 500);
    const imgHeight = img.original.height
      ? Math.round(
          (img.original.height / (img.original.width || 400)) * imgWidth
        )
      : 300;

    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            data: img.lineArt,
            transformation: { width: imgWidth, height: imgHeight },
            type: "png",
          }),
        ],
        spacing: { before: 200, after: 100 },
      })
    );

    // Add caption
    if (img.caption) {
      children.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({
              text: img.caption,
              size: 18,
              italics: true,
              color: "666666",
              font: "Courier New",
            }),
          ],
          spacing: { after: 300 },
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}
