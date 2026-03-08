import {
  DocumentFormat,
  ExtractedImage,
  ProcessedImage,
  ProcessingOptions,
  ProcessingResult,
} from "./types";
import { extractImagesFromPdf } from "./pdf-extractor";
import { assemblePdf } from "./pdf-assembler";
import { extractImagesFromDocx } from "./docx-extractor";
import { assembleDocx } from "./docx-assembler";
import {
  extractImagesFromMarkdown,
  assembleMarkdown,
} from "./markdown-processor";
import { extractImagesFromHtml, assembleHtml } from "./html-processor";
import { convertToLineArt, generateCaption } from "../gemini";

/**
 * Detect document format from filename.
 */
export function detectFormat(filename: string): DocumentFormat {
  const ext = filename.toLowerCase().split(".").pop();
  switch (ext) {
    case "pdf":
      return "pdf";
    case "docx":
    case "doc":
      return "docx";
    case "md":
    case "markdown":
      return "markdown";
    case "html":
    case "htm":
      return "html";
    default:
      throw new Error(`Unsupported file format: .${ext}`);
  }
}

/**
 * Process a single extracted image through Gemini.
 */
async function processImage(
  image: ExtractedImage,
  options: ProcessingOptions
): Promise<ProcessedImage> {
  // Convert to line art
  const lineArtResult = await convertToLineArt(image.data, image.mimeType);

  // Generate caption if requested
  let caption: string | undefined;
  if (options.generateCaptions) {
    try {
      caption = await generateCaption(image.data, image.mimeType);
    } catch {
      caption = "Technical illustration";
    }
  }

  return {
    original: image,
    lineArt: lineArtResult.buffer,
    lineArtMimeType: lineArtResult.mimeType,
    caption,
  };
}

/**
 * Full document processing pipeline.
 */
export async function processDocument(
  fileBuffer: Buffer,
  filename: string,
  options: ProcessingOptions
): Promise<ProcessingResult> {
  const format = detectFormat(filename);

  // 1. Extract images
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

  // 2. Process each image through Gemini
  const processedImages: ProcessedImage[] = [];
  for (const img of extractedImages) {
    if (img.data.length === 0) {
      // Skip images without data (URL-based references in MD/HTML)
      continue;
    }
    try {
      const processed = await processImage(img, options);
      processedImages.push(processed);
    } catch (err) {
      console.error(`Failed to process image ${img.id}:`, err);
      // Keep original as fallback
      processedImages.push({
        original: img,
        lineArt: img.data,
        lineArtMimeType: img.mimeType,
        caption: options.generateCaptions ? "Processing failed — original image" : undefined,
      });
    }
  }

  // 3. Reassemble document
  let outputBuffer: Buffer;
  let outputMimeType: string;
  let outputFilename: string;

  switch (format) {
    case "pdf":
      outputBuffer = await assemblePdf(processedImages);
      outputMimeType = "application/pdf";
      outputFilename = filename.replace(/\.pdf$/i, "_lineforge.pdf");
      break;
    case "docx":
      outputBuffer = await assembleDocx(processedImages);
      outputMimeType =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      outputFilename = filename.replace(/\.docx?$/i, "_lineforge.docx");
      break;
    case "markdown": {
      const mdOutput = await assembleMarkdown(
        fileBuffer.toString("utf-8"),
        processedImages
      );
      outputBuffer = Buffer.from(mdOutput, "utf-8");
      outputMimeType = "text/markdown";
      outputFilename = filename.replace(/\.md$/i, "_lineforge.md");
      break;
    }
    case "html": {
      const htmlOutput = await assembleHtml(
        fileBuffer.toString("utf-8"),
        processedImages
      );
      outputBuffer = Buffer.from(htmlOutput, "utf-8");
      outputMimeType = "text/html";
      outputFilename = filename.replace(/\.html?$/i, "_lineforge.html");
      break;
    }
  }

  return {
    format,
    outputBuffer,
    outputMimeType,
    outputFilename,
    processedImages,
  };
}
