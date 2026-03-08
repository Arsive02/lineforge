"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { animate, createTimeline, utils } from "animejs";
import { PipelineBlock, PipelineExecutionState } from "@/lib/pipeline/types";
import { executePipeline } from "@/lib/pipeline/executor";
import PipelineCanvas from "@/components/pipeline/PipelineCanvas";
import BlockPalette from "@/components/pipeline/BlockPalette";
import PipelineResults from "@/components/pipeline/PipelineResults";
import PromptEditor from "@/components/pipeline/PromptEditor";
import BlueprintButton from "@/components/ui/BlueprintButton";
import Link from "next/link";

export default function HomePage() {
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [slots, setSlots] = useState<(PipelineBlock | null)[]>([null, null, null]);
  const [customPrompts, setCustomPrompts] = useState<Record<number, string>>({});
  const [execution, setExecution] = useState<PipelineExecutionState | null>(
    null
  );

  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = createTimeline({ defaults: { ease: "outExpo" } });

    tl.add(titleRef.current!, {
      opacity: [0, 1],
      translateY: [30, 0],
      duration: 1000,
    })
      .add(
        subtitleRef.current!,
        {
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 800,
        },
        "-=600"
      )
      .add(
        contentRef.current!.children,
        {
          opacity: [0, 1],
          translateY: [40, 0],
          delay: utils.stagger(150),
          duration: 800,
        },
        "-=400"
      );

    return () => {
      tl.pause();
    };
  }, []);

  const hasValidPipeline =
    inputFile !== null && slots.some((s) => s !== null);

  const isExecuting = execution?.isRunning ?? false;

  const handleExecute = useCallback(async () => {
    if (!inputFile || !hasValidPipeline) return;

    setExecution({
      isRunning: true,
      currentStage: 0,
      totalStages: slots.filter((s) => s !== null).length,
      currentImage: 0,
      totalImages: 0,
      stageResults: [],
    });

    await executePipeline(
      { inputFile, slots, customPrompts },
      (state) => setExecution({ ...state })
    );
  }, [inputFile, slots, customPrompts, hasValidPipeline]);

  const handleReset = useCallback(() => {
    setInputFile(null);
    setSlots([null, null, null]);
    setCustomPrompts({});
    setExecution(null);
  }, []);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-6 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1
            ref={titleRef}
            className="text-4xl md:text-5xl font-bold text-bp-accent glow-text opacity-0"
          >
            LINEFORGE
          </h1>
          <p
            ref={subtitleRef}
            className="mt-3 text-bp-text-muted text-sm max-w-lg mx-auto opacity-0"
          >
            Compose your processing pipeline. Drag blocks into slots to build
            workflows.
          </p>
        </div>

        {/* Main content */}
        <div ref={contentRef} className="grid grid-cols-[200px_1fr] gap-6">
          {/* Left: Block Palette + nav links */}
          <div className="space-y-4 opacity-0">
            <BlockPalette />

            <div className="border border-bp-border p-3 bg-bp-bg/50 space-y-2">
              <p className="text-[10px] text-bp-text-muted tracking-widest font-bold">
                DIRECT ACCESS
              </p>
              <Link
                href="/doc2cad"
                className="block text-[10px] text-bp-accent tracking-wider hover:text-bp-text transition-colors"
              >
                → DOC2CAD
              </Link>
              <Link
                href="/image2stl"
                className="block text-[10px] text-bp-accent tracking-wider hover:text-bp-text transition-colors"
              >
                → IMAGE2 3D
              </Link>
            </div>
          </div>

          {/* Right: Pipeline canvas + controls + results */}
          <div className="space-y-4 opacity-0">
            <PipelineCanvas
              inputFile={inputFile}
              onFileSelect={(f) => {
                setInputFile(f);
                setExecution(null);
              }}
              slots={slots}
              onSlotsChange={(newSlots) => {
                // Initialize default prompts for newly placed blocks, clear removed ones
                const next = { ...customPrompts };
                newSlots.forEach((block, i) => {
                  if (block?.defaultPrompt && !(i in next)) {
                    next[i] = block.defaultPrompt;
                  }
                  if (!block) {
                    delete next[i];
                  }
                });
                setSlots(newSlots);
                setCustomPrompts(next);
              }}
              isExecuting={isExecuting}
            />

            <PromptEditor
              slots={slots}
              customPrompts={customPrompts}
              onPromptsChange={setCustomPrompts}
              disabled={isExecuting}
            />

            {/* Controls */}
            <div className="flex gap-3">
              <BlueprintButton
                onClick={handleExecute}
                disabled={!hasValidPipeline || isExecuting}
              >
                {isExecuting ? "EXECUTING..." : "EXECUTE PIPELINE"}
              </BlueprintButton>

              {(execution || inputFile) && (
                <BlueprintButton
                  variant="secondary"
                  onClick={handleReset}
                  disabled={isExecuting}
                >
                  RESET
                </BlueprintButton>
              )}
            </div>

            {/* Results */}
            {execution && <PipelineResults execution={execution} />}

            {/* Download links for 3D models */}
            {execution &&
              !execution.isRunning &&
              execution.stageResults.some((r) =>
                r.items.some((item) => item.modelUrl)
              ) && (
                <div className="border border-bp-success/30 p-4">
                  <p className="text-[10px] text-bp-success tracking-widest font-bold mb-2">
                    DOWNLOADABLE MODELS
                  </p>
                  {execution.stageResults
                    .flatMap((r) => r.items)
                    .filter((item) => item.modelUrl)
                    .map((item, i) => (
                      <a
                        key={i}
                        href={item.modelUrl!}
                        download={`model-${i}.glb`}
                        className="block text-xs text-bp-accent hover:text-bp-text tracking-wider transition-colors mb-1"
                      >
                        → DOWNLOAD MODEL {i + 1} (GLB)
                      </a>
                    ))}
                </div>
              )}

            {/* Download links for SVGs */}
            {execution &&
              !execution.isRunning &&
              execution.stageResults.some((r) =>
                r.items.some((item) => item.svgData)
              ) && (
                <div className="border border-bp-success/30 p-4">
                  <p className="text-[10px] text-bp-success tracking-widest font-bold mb-2">
                    DOWNLOADABLE SVGS
                  </p>
                  {execution.stageResults
                    .flatMap((r) => r.items)
                    .filter((item) => item.svgData)
                    .map((item, i) => (
                      <a
                        key={i}
                        href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(item.svgData!)}`}
                        download={`vector-${i}.svg`}
                        className="block text-xs text-bp-accent hover:text-bp-text tracking-wider transition-colors mb-1"
                      >
                        → DOWNLOAD SVG {i + 1}
                      </a>
                    ))}
                </div>
              )}

            {/* Download links for videos */}
            {execution &&
              !execution.isRunning &&
              execution.stageResults.some((r) =>
                r.items.some((item) => item.videoUrl)
              ) && (
                <div className="border border-bp-success/30 p-4">
                  <p className="text-[10px] text-bp-success tracking-widest font-bold mb-2">
                    DOWNLOADABLE VIDEOS
                  </p>
                  {execution.stageResults
                    .flatMap((r) => r.items)
                    .filter((item) => item.videoUrl)
                    .map((item, i) => (
                      <a
                        key={i}
                        href={item.videoUrl!}
                        download={`video-${i}.mp4`}
                        className="block text-xs text-bp-accent hover:text-bp-text tracking-wider transition-colors mb-1"
                      >
                        → DOWNLOAD VIDEO {i + 1} (MP4)
                      </a>
                    ))}
                </div>
              )}
          </div>
        </div>

        {/* Bottom dimension line */}
        <div className="mt-16 flex items-center justify-center gap-2 text-bp-text-muted/40 text-[10px] tracking-widest">
          <div className="w-16 h-px bg-bp-border" />
          <span>v2.0 — HACKCU 2026</span>
          <div className="w-16 h-px bg-bp-border" />
        </div>
      </div>
    </div>
  );
}
