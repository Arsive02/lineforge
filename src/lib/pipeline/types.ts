export type BlockInputType = "document" | "image" | "image[]" | "3d-model" | "video";
export type BlockOutputType = "image[]" | "3d-model" | "video";

export interface PipelineBlock {
  id: string;
  label: string;
  description: string;
  accepts: BlockInputType[];
  produces: BlockOutputType;
  icon: string; // SVG path data
  defaultPrompt?: string;
}

export interface PipelineSlot {
  index: number;
  block: PipelineBlock | null;
}

export interface PipelineConfig {
  inputFile: File;
  slots: (PipelineBlock | null)[];
  customPrompts: Record<number, string>; // slotIndex → prompt
}

export interface StageResult {
  stageIndex: number;
  blockId: string;
  blockLabel: string;
  items: StageResultItem[];
}

export interface StageResultItem {
  id: string;
  inputBase64?: string;
  outputBase64?: string;
  caption?: string;
  modelUrl?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  originalSize?: number;
  outputSize?: number;
  error?: string;
}

export interface PipelineExecutionState {
  isRunning: boolean;
  currentStage: number;
  totalStages: number;
  currentImage: number;
  totalImages: number;
  stageResults: StageResult[];
  error?: string;
}
