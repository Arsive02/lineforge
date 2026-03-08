import {
  PipelineConfig,
  PipelineExecutionState,
  PipelineBlock,
  StageResult,
  StageResultItem,
} from "./types";
import { getFileInputType } from "./constants";

type ProgressCallback = (state: PipelineExecutionState) => void;

function createInitialState(totalStages: number): PipelineExecutionState {
  return {
    isRunning: true,
    currentStage: 0,
    totalStages,
    currentImage: 0,
    totalImages: 0,
    stageResults: [],
  };
}

/**
 * Execute the Line Art stage using the streaming API (for documents) or convert-image (for single images).
 */
async function executeLineArtStage(
  block: PipelineBlock,
  inputFile: File,
  inputImages: string[] | null, // base64 data URLs from previous stage
  stageIndex: number,
  onProgress: ProgressCallback,
  state: PipelineExecutionState,
  customPrompt?: string
): Promise<{ result: StageResult; outputImages: string[] }> {
  const items: StageResultItem[] = [];
  const outputImages: string[] = [];

  if (inputImages) {
    // Process individual images (from previous stage output)
    state.totalImages = inputImages.length;
    state.currentImage = 0;
    onProgress({ ...state });

    for (let i = 0; i < inputImages.length; i++) {
      try {
        const blob = await fetch(inputImages[i]).then((r) => r.blob());
        const file = new File([blob], `image-${i}.png`, { type: "image/png" });

        const formData = new FormData();
        formData.append("file", file);
        formData.append("caption", "true");
        if (customPrompt) formData.append("prompt", customPrompt);

        const response = await fetch("/api/convert-image", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Conversion failed");

        const data = await response.json();
        items.push({
          id: `stage-${stageIndex}-img-${i}`,
          inputBase64: inputImages[i],
          outputBase64: data.image,
          caption: data.caption,
          originalSize: data.originalSize,
          outputSize: data.lineArtSize,
        });
        outputImages.push(data.image);
      } catch (err) {
        items.push({
          id: `stage-${stageIndex}-img-${i}`,
          inputBase64: inputImages[i],
          error: err instanceof Error ? err.message : "Processing failed",
        });
      }

      state.currentImage = i + 1;
      onProgress({ ...state });
    }
  } else if (getFileInputType(inputFile) === "document") {
    // Stream document processing
    const formData = new FormData();
    formData.append("file", inputFile);
    formData.append("generateCaptions", "true");
    if (customPrompt) formData.append("prompt", customPrompt);

    const response = await fetch("/api/process-document-streaming", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || "Processing failed");
    }

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop()!;

      for (const line of lines) {
        if (!line.trim()) continue;
        const event = JSON.parse(line);

        switch (event.type) {
          case "extraction":
            state.totalImages = event.totalImages;
            state.currentImage = 0;
            onProgress({ ...state });
            break;

          case "image":
            items.push({
              id: event.id,
              inputBase64: event.originalBase64,
              outputBase64: event.lineArtBase64,
              caption: event.caption,
              originalSize: event.originalSize,
              outputSize: event.lineArtSize,
            });
            outputImages.push(event.lineArtBase64);
            state.currentImage = event.index + 1;
            onProgress({ ...state });
            break;

          case "image_error":
            items.push({
              id: `img-${event.index}`,
              error: event.error,
            });
            state.currentImage = event.index + 1;
            onProgress({ ...state });
            break;

          case "error":
            throw new Error(event.error);
        }
      }
    }
  } else {
    // Single image file
    state.totalImages = 1;
    state.currentImage = 0;
    onProgress({ ...state });

    const formData = new FormData();
    formData.append("file", inputFile);
    formData.append("caption", "true");
    if (customPrompt) formData.append("prompt", customPrompt);

    const response = await fetch("/api/convert-image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Conversion failed");

    const data = await response.json();
    const originalUrl = URL.createObjectURL(inputFile);
    items.push({
      id: `stage-${stageIndex}-img-0`,
      inputBase64: originalUrl,
      outputBase64: data.image,
      caption: data.caption,
      originalSize: data.originalSize,
      outputSize: data.lineArtSize,
    });
    outputImages.push(data.image);
    state.currentImage = 1;
    onProgress({ ...state });
  }

  return {
    result: {
      stageIndex,
      blockId: block.id,
      blockLabel: block.label,
      items,
    },
    outputImages,
  };
}

/**
 * Execute the 3D Model stage for a list of input images.
 */
async function execute3DModelStage(
  block: PipelineBlock,
  inputFile: File,
  inputImages: string[] | null,
  stageIndex: number,
  onProgress: ProgressCallback,
  state: PipelineExecutionState
): Promise<{ result: StageResult; outputImages: string[] }> {
  const items: StageResultItem[] = [];
  const images = inputImages || [URL.createObjectURL(inputFile)];

  state.totalImages = images.length;
  state.currentImage = 0;
  onProgress({ ...state });

  for (let i = 0; i < images.length; i++) {
    try {
      // Convert base64/URL to File for upload
      const blob = await fetch(images[i]).then((r) => r.blob());
      const file = new File([blob], `image-${i}.png`, { type: "image/png" });

      const formData = new FormData();
      formData.append("file", file);

      const submitResponse = await fetch("/api/image-to-3d", {
        method: "POST",
        body: formData,
      });

      if (!submitResponse.ok) throw new Error("3D submission failed");

      const { taskId } = await submitResponse.json();

      // Poll for completion
      let completed = false;
      while (!completed) {
        await new Promise((r) => setTimeout(r, 3000));
        const pollResponse = await fetch(`/api/image-to-3d/${taskId}`);
        if (!pollResponse.ok) continue;

        const pollData = await pollResponse.json();

        if (pollData.status === "SUCCEEDED") {
          items.push({
            id: `stage-${stageIndex}-3d-${i}`,
            inputBase64: images[i],
            modelUrl: pollData.modelUrls?.glb,
            thumbnailUrl: pollData.thumbnailUrl,
          });
          completed = true;
        } else if (pollData.status === "FAILED" || pollData.status === "EXPIRED") {
          items.push({
            id: `stage-${stageIndex}-3d-${i}`,
            inputBase64: images[i],
            error: pollData.error || "3D generation failed",
          });
          completed = true;
        }
      }
    } catch (err) {
      items.push({
        id: `stage-${stageIndex}-3d-${i}`,
        inputBase64: images[i],
        error: err instanceof Error ? err.message : "3D generation failed",
      });
    }

    state.currentImage = i + 1;
    onProgress({ ...state });
  }

  return {
    result: {
      stageIndex,
      blockId: block.id,
      blockLabel: block.label,
      items,
    },
    outputImages: [], // 3D models don't chain
  };
}

/**
 * Execute the Video Guide stage for a list of input images.
 */
async function executeVideoStage(
  block: PipelineBlock,
  inputFile: File,
  inputImages: string[] | null,
  stageIndex: number,
  onProgress: ProgressCallback,
  state: PipelineExecutionState,
  customPrompt?: string
): Promise<{ result: StageResult; outputImages: string[] }> {
  const items: StageResultItem[] = [];
  const images = inputImages || [URL.createObjectURL(inputFile)];

  state.totalImages = images.length;
  state.currentImage = 0;
  onProgress({ ...state });

  for (let i = 0; i < images.length; i++) {
    try {
      const blob = await fetch(images[i]).then((r) => r.blob());
      const file = new File([blob], `image-${i}.png`, { type: "image/png" });

      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "prompt",
        customPrompt || block.defaultPrompt || ""
      );

      const response = await fetch("/api/generate-video", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Video generation failed");
      }

      const data = await response.json();
      items.push({
        id: `stage-${stageIndex}-video-${i}`,
        inputBase64: images[i],
        videoUrl: data.video,
      });
    } catch (err) {
      items.push({
        id: `stage-${stageIndex}-video-${i}`,
        inputBase64: images[i],
        error: err instanceof Error ? err.message : "Video generation failed",
      });
    }

    state.currentImage = i + 1;
    onProgress({ ...state });
  }

  return {
    result: {
      stageIndex,
      blockId: block.id,
      blockLabel: block.label,
      items,
    },
    outputImages: [], // video is terminal
  };
}

/**
 * Vectorize output images and attach svgData to existing result items.
 */
async function vectorizeResults(items: StageResultItem[]): Promise<void> {
  for (const item of items) {
    if (!item.outputBase64 || item.error) continue;
    try {
      const blob = await fetch(item.outputBase64).then((r) => r.blob());
      const file = new File([blob], "image.png", { type: "image/png" });

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/vectorize", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        item.svgData = await response.text();
      }
    } catch {
      // SVG generation is best-effort; skip on failure
    }
  }
}

/**
 * Execute the full pipeline based on composed slots.
 */
export async function executePipeline(
  config: PipelineConfig,
  onProgress: ProgressCallback
): Promise<void> {
  const activeSlots: { block: PipelineBlock; originalIndex: number }[] = [];
  for (let i = 0; i < config.slots.length; i++) {
    const s = config.slots[i];
    if (s !== null) activeSlots.push({ block: s, originalIndex: i });
  }

  if (activeSlots.length === 0) return;

  const state = createInitialState(activeSlots.length);
  onProgress(state);

  let currentImages: string[] | null = null;

  for (let i = 0; i < activeSlots.length; i++) {
    const { block, originalIndex } = activeSlots[i];
    const customPrompt = config.customPrompts[originalIndex] || undefined;

    state.currentStage = i;
    state.stageResults = [...state.stageResults];
    onProgress({ ...state });

    try {
      let stageOutput: { result: StageResult; outputImages: string[] };

      if (block.id === "line-art") {
        stageOutput = await executeLineArtStage(
          block,
          config.inputFile,
          currentImages,
          i,
          onProgress,
          state,
          customPrompt
        );
      } else if (block.id === "3d-model") {
        stageOutput = await execute3DModelStage(
          block,
          config.inputFile,
          currentImages,
          i,
          onProgress,
          state
        );
      } else if (block.id === "video-guide") {
        stageOutput = await executeVideoStage(
          block,
          config.inputFile,
          currentImages,
          i,
          onProgress,
          state,
          customPrompt
        );
      } else {
        continue;
      }

      // Also generate SVGs for image-producing stages if enabled
      if (config.generateSvg && stageOutput.outputImages.length > 0) {
        await vectorizeResults(stageOutput.result.items);
      }

      state.stageResults = [...state.stageResults, stageOutput.result];
      currentImages =
        stageOutput.outputImages.length > 0
          ? stageOutput.outputImages
          : null;
      onProgress({ ...state });
    } catch (err) {
      state.error = err instanceof Error ? err.message : "Pipeline failed";
      state.isRunning = false;
      onProgress({ ...state });
      return;
    }
  }

  state.isRunning = false;
  onProgress({ ...state });
}
