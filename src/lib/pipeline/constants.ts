import { PipelineBlock } from "./types";

export const PIPELINE_BLOCKS: PipelineBlock[] = [
  {
    id: "line-art",
    label: "Line Art Converter",
    description: "Convert images to CAD-style line art with technical captions",
    accepts: ["document", "image"],
    produces: "image[]",
    icon: "M4 2h18v24H4zM8 8h10M8 12h10M8 16h6",
  },
  {
    id: "3d-model",
    label: "3D Model Generator",
    description: "Transform images into 3D models using Meshy.ai",
    accepts: ["image"],
    produces: "3d-model",
    icon: "M16 4L28 10V22L16 28L4 22V10L16 4ZM16 16L28 10M16 16L4 10M16 16V28",
  },
];

export function getBlockById(id: string): PipelineBlock | undefined {
  return PIPELINE_BLOCKS.find((b) => b.id === id);
}

/**
 * Check if a block can accept the output of the previous stage (or the initial input).
 */
export function isCompatible(
  block: PipelineBlock,
  inputType: "document" | "image" | "image[]" | "3d-model"
): boolean {
  // image[] can be fed to blocks that accept "image" (each image individually)
  if (inputType === "image[]" && block.accepts.includes("image")) return true;
  return block.accepts.includes(inputType);
}

/**
 * Determine the input type of the file based on MIME type.
 */
export function getFileInputType(file: File): "document" | "image" {
  if (file.type.startsWith("image/")) return "image";
  return "document";
}
