import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkStringify from "remark-stringify";
import { visit } from "unist-util-visit";
import { ExtractedImage, ProcessedImage } from "./types";

interface ImageNode {
  type: "image";
  url: string;
  alt?: string | null;
  title?: string | null;
}

/**
 * Extract image references from Markdown.
 */
export async function extractImagesFromMarkdown(
  mdContent: string
): Promise<{ images: ExtractedImage[]; imageUrls: string[] }> {
  const images: ExtractedImage[] = [];
  const imageUrls: string[] = [];
  let idx = 0;

  const tree = unified().use(remarkParse).parse(mdContent);

  visit(tree, "image", (node: ImageNode) => {
    const id = `md-img-${idx++}`;
    imageUrls.push(node.url);
    // For markdown, we store the URL reference; actual data is fetched externally
    images.push({
      id,
      data: Buffer.alloc(0), // Will be populated by the orchestrator
      mimeType: "image/png",
      context: node.alt || undefined,
    });
  });

  return { images, imageUrls };
}

/**
 * Replace images in Markdown with processed line art (as data URIs) and add captions.
 */
export async function assembleMarkdown(
  mdContent: string,
  processedImages: ProcessedImage[]
): Promise<string> {
  let imgIdx = 0;

  const tree = unified().use(remarkParse).parse(mdContent);

  visit(tree, "image", (node: ImageNode) => {
    const processed = processedImages[imgIdx++];
    if (!processed) return;

    const b64 = processed.lineArt.toString("base64");
    node.url = `data:${processed.lineArtMimeType};base64,${b64}`;
    if (processed.caption) {
      node.alt = processed.caption;
    }
  });

  const output = unified().use(remarkStringify).stringify(tree);
  return String(output);
}
