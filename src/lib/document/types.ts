export interface ExtractedImage {
  id: string;
  data: Buffer;
  mimeType: string;
  width?: number;
  height?: number;
  /** Context from the document (e.g. alt text, surrounding text) */
  context?: string;
}

export interface ProcessedImage {
  original: ExtractedImage;
  lineArt: Buffer;
  lineArtMimeType: string;
  caption?: string;
  svgData?: string;
}

export interface ProcessingOptions {
  generateCaptions: boolean;
  convertToSvg: boolean;
}

export type DocumentFormat = "pdf" | "docx" | "markdown" | "html";

export interface ProcessingResult {
  format: DocumentFormat;
  outputBuffer: Buffer;
  outputMimeType: string;
  outputFilename: string;
  processedImages: ProcessedImage[];
}
