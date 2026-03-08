import { PipelineBlock, BlockInputType, BlockOutputType } from "./types";

export const PIPELINE_BLOCKS: PipelineBlock[] = [
  {
    id: "line-art",
    label: "Line Art Converter",
    description: "Convert images to CAD-style line art with technical captions",
    accepts: ["document", "image"],
    produces: "image[]",
    icon: "M4 2h18v24H4zM8 8h10M8 12h10M8 16h6",
    defaultPrompt:
      "Convert this image into a clean CAD-style technical line art drawing. Use only black lines on a white background. Show clear outlines, edges, and structural details as an engineer would draw them. Remove all colors, textures, and shading — keep only precise contour lines. The output should look like a blueprint/engineering drawing.",
  },
  {
    id: "3d-model",
    label: "3D Model Generator",
    description: "Transform images into 3D models using Meshy.ai",
    accepts: ["image"],
    produces: "3d-model",
    icon: "M16 4L28 10V22L16 28L4 22V10L16 4ZM16 16L28 10M16 16L4 10M16 16V28",
  },
  {
    id: "svg-vectorize",
    label: "SVG Vectorizer",
    description: "Convert raster images to clean SVG vector graphics",
    accepts: ["image", "image[]"],
    produces: "svg",
    icon: "M12 2L2 7L12 12L22 7L12 2ZM2 17L12 22L22 17M2 12L12 17L22 12",
  },
  {
    id: "video-guide",
    label: "Video Guide",
    description: "Generate cinematic multi-angle guide video using Veo 3.1",
    accepts: ["image"],
    produces: "video",
    icon: "M6 4L26 16L6 28V4Z",
    defaultPrompt:
      "Create a detailed, cinematic multi-angle video guide of this image. Show the subject from multiple perspectives with smooth camera movements. If it's a product, demonstrate assembly or usage step-by-step. If it's a building or space, provide a 360-degree walkthrough including interiors. Make it educational and visually informative for students studying this subject.",
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
  inputType: BlockInputType | BlockOutputType
): boolean {
  // image[] can be fed to blocks that accept "image" (each image individually)
  if (inputType === "image[]" && block.accepts.includes("image")) return true;
  return block.accepts.includes(inputType as BlockInputType);
}

/**
 * Determine the input type of the file based on MIME type.
 */
export function getFileInputType(file: File): "document" | "image" {
  if (file.type.startsWith("image/")) return "image";
  return "document";
}
