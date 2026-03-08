import sharp from "sharp";

/**
 * Convert a raster image buffer to SVG using potrace.
 * Uses sharp for image decoding to avoid Jimp compatibility issues.
 */
export async function rasterToSvg(imageBuffer: Buffer): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const potrace = require("potrace");

  const { data, info } = await sharp(imageBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const P = new potrace.Potrace();
  P.setParameters({ color: "#000000", threshold: 128 });

  // Build a Jimp-compatible image object so potrace can process it
  interface JimpLike {
    bitmap: { width: number; height: number; data: Buffer };
    scan(x: number, y: number, w: number, h: number, cb: (this: JimpLike, x: number, y: number, idx: number) => void): JimpLike;
  }

  const image: JimpLike = {
    bitmap: { width: info.width, height: info.height, data },
    scan(x, y, w, h, cb) {
      for (let j = y; j < y + h; j++) {
        for (let i = x; i < x + w; i++) {
          cb.call(this, i, j, (j * info.width + i) * 4);
        }
      }
      return this;
    },
  };

  P._processLoadedImage(image);
  return P.getSVG() as string;
}
