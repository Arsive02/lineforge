import sharp from "sharp";

/**
 * Convert a raster image buffer to SVG using edge detection and path tracing.
 * Falls back to a simplified approach if potrace native module isn't available.
 */
export async function rasterToSvg(
  imageBuffer: Buffer
): Promise<string> {
  // Try using potrace native module
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const potrace = require("potrace") as { trace: (buf: Buffer, opts: Record<string, unknown>, cb: (err: Error | null, svg: string) => void) => void };
    return new Promise((resolve, reject) => {
      potrace.trace(imageBuffer, { color: "#000000", threshold: 128 }, (err: Error | null, svg: string) => {
        if (err) reject(err);
        else resolve(svg);
      });
    });
  } catch {
    // Fallback: convert to high-contrast PNG via sharp and create a simple SVG embed
    const png = await sharp(imageBuffer)
      .threshold(128)
      .png()
      .toBuffer();

    const metadata = await sharp(imageBuffer).metadata();
    const w = metadata.width || 800;
    const h = metadata.height || 600;
    const b64 = png.toString("base64");

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <image href="data:image/png;base64,${b64}" width="${w}" height="${h}"/>
</svg>`;
  }
}
