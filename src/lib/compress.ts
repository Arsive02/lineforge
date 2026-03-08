import sharp from "sharp";

/**
 * Compress a line art image for optimal size.
 * Line art is black lines on white — ideal for indexed-color PNG with max compression.
 */
export async function compressLineArt(
  imageBuffer: Buffer
): Promise<Buffer> {
  return sharp(imageBuffer)
    .grayscale()
    .normalise()
    .threshold(128)
    .png({
      compressionLevel: 9,
      palette: true,
      colours: 2,
      effort: 10,
    })
    .toBuffer();
}
