import * as cheerio from "cheerio";
import { ExtractedImage, ProcessedImage } from "./types";

/**
 * Extract image references from HTML.
 */
export async function extractImagesFromHtml(
  htmlContent: string
): Promise<{ images: ExtractedImage[]; imageUrls: string[] }> {
  const $ = cheerio.load(htmlContent);
  const images: ExtractedImage[] = [];
  const imageUrls: string[] = [];
  let idx = 0;

  $("img").each((_i, el) => {
    const src = $(el).attr("src");
    if (!src) return;

    const id = `html-img-${idx++}`;
    imageUrls.push(src);
    images.push({
      id,
      data: Buffer.alloc(0), // Will be populated by orchestrator if URL-based
      mimeType: "image/png",
      context: $(el).attr("alt") || undefined,
    });
  });

  return { images, imageUrls };
}

/**
 * Replace images in HTML with processed line art and add figcaptions.
 */
export async function assembleHtml(
  htmlContent: string,
  processedImages: ProcessedImage[]
): Promise<string> {
  const $ = cheerio.load(htmlContent);
  let imgIdx = 0;

  $("img").each((_i, el) => {
    const processed = processedImages[imgIdx++];
    if (!processed) return;

    const b64 = processed.lineArt.toString("base64");
    const dataUri = `data:${processed.lineArtMimeType};base64,${b64}`;

    $(el).attr("src", dataUri);
    $(el).css("filter", "none");

    if (processed.caption) {
      const figure = $("<figure></figure>");
      figure.css({
        "text-align": "center",
        margin: "1em 0",
        "font-family": "monospace",
      });

      const imgClone = $(el).clone();
      const figcaption = $(
        `<figcaption style="font-size:0.8em;color:#666;margin-top:0.5em;font-style:italic;">${processed.caption}</figcaption>`
      );

      figure.append(imgClone).append(figcaption);
      $(el).replaceWith(figure);
    }
  });

  return $.html();
}
