import mammoth from "mammoth";
import { ExtractedImage } from "./types";

/**
 * Extract images from a DOCX file using mammoth.
 */
export async function extractImagesFromDocx(
  docxBuffer: Buffer
): Promise<{ images: ExtractedImage[]; html: string }> {
  const images: ExtractedImage[] = [];
  let imageIndex = 0;

  const result = await mammoth.convertToHtml(
    { buffer: docxBuffer },
    {
      convertImage: mammoth.images.imgElement(async (image) => {
        const imgBuffer = await image.read();
        const contentType = image.contentType || "image/png";
        const id = `docx-img-${imageIndex++}`;

        images.push({
          id,
          data: Buffer.from(imgBuffer),
          mimeType: contentType,
        });

        // Return a placeholder src that we can find later
        return { src: `__LINEFORGE_IMAGE_${id}__` };
      }),
    }
  );

  return { images, html: result.value };
}
