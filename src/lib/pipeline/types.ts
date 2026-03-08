export type BlockInputType = "document" | "image" | "image[]" | "3d-model";
export type BlockOutputType = "image[]" | "3d-model";

export interface PipelineBlock {
  id: string;
  label: string;
  description: string;
  accepts: BlockInputType[];
  produces: BlockOutputType;
  icon: string; // SVG path data
}

export interface PipelineSlot {
  index: number;
  block: PipelineBlock | null;
}

export interface PipelineConfig {
  inputFile: File;
  slots: (PipelineBlock | null)[];
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
