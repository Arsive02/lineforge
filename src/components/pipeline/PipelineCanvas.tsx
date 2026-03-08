"use client";

import { useRef, useCallback } from "react";
import { PipelineBlock } from "@/lib/pipeline/types";
import DroppableSlot from "./DroppableSlot";
import FileUploader from "@/components/ui/FileUploader";

interface PipelineCanvasProps {
  inputFile: File | null;
  onFileSelect: (file: File) => void;
  slots: (PipelineBlock | null)[];
  onSlotsChange: (slots: (PipelineBlock | null)[]) => void;
  isExecuting: boolean;
}

export default function PipelineCanvas({
  inputFile,
  onFileSelect,
  slots,
  onSlotsChange,
  isExecuting,
}: PipelineCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleSlotDrop = useCallback(
    (slotIndex: number, block: PipelineBlock): boolean => {
      const newSlots = [...slots];
      newSlots[slotIndex] = block;
      onSlotsChange(newSlots);
      return true;
    },
    [slots, onSlotsChange]
  );

  const handleSlotRemove = useCallback(
    (slotIndex: number) => {
      const newSlots = [...slots];
      newSlots[slotIndex] = null;
      onSlotsChange(newSlots);
    },
    [slots, onSlotsChange]
  );

  // Determine output type
  const lastActiveSlot = [...slots].reverse().find((s) => s !== null);
  const outputType = lastActiveSlot?.produces || "none";
  const hasValidPipeline = slots.some((s) => s !== null) && inputFile;

  return (
    <div ref={canvasRef} className="border border-bp-border p-6 bg-bp-bg/30">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-2 bg-bp-accent rounded-full" />
        <span className="text-[10px] text-bp-text-muted tracking-widest font-bold">
          PIPELINE CANVAS
        </span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-4">
        {/* Input node */}
        <div className="shrink-0">
          <div className="w-40">
            <p className="text-[9px] text-bp-text-muted tracking-widest mb-2 text-center">
              INPUT
            </p>
            <FileUploader
              accept=".pdf,.docx,.doc,.md,.html,.htm,.png,.jpg,.jpeg,.webp"
              maxSizeMB={4.5}
              onFileSelect={onFileSelect}
              compact
            />
            {inputFile && (
              <p className="text-[8px] text-bp-accent tracking-wider mt-1 text-center truncate">
                {inputFile.name}
              </p>
            )}
          </div>
        </div>

        {/* Wire */}
        <svg className="shrink-0" width="32" height="2" viewBox="0 0 32 2">
          <line
            x1="0" y1="1" x2="32" y2="1"
            stroke={inputFile ? "var(--bp-accent)" : "var(--bp-border)"}
            strokeWidth="1.5"
            strokeDasharray={inputFile ? "none" : "4 2"}
          />
          {inputFile && (
            <polygon
              points="28,0 32,1 28,2"
              fill="var(--bp-accent)"
            />
          )}
        </svg>

        {/* Slots */}
        {slots.map((block, i) => (
          <div key={i} className="flex items-center gap-3 shrink-0">
            <DroppableSlot
              index={i}
              block={block}
              onDrop={(b) => handleSlotDrop(i, b)}
              onRemove={() => handleSlotRemove(i)}
            />
            {/* Wire after slot */}
            <svg className="shrink-0" width="32" height="2" viewBox="0 0 32 2">
              <line
                x1="0" y1="1" x2="32" y2="1"
                stroke={block ? "var(--bp-accent)" : "var(--bp-border)"}
                strokeWidth="1.5"
                strokeDasharray={block ? "none" : "4 2"}
              />
              {block && (
                <polygon
                  points="28,0 32,1 28,2"
                  fill="var(--bp-accent)"
                />
              )}
            </svg>
          </div>
        ))}

        {/* Output node */}
        <div className="shrink-0">
          <div
            className={`w-28 h-20 border-2 flex flex-col items-center justify-center transition-all ${
              hasValidPipeline
                ? "border-bp-success/60 bg-bp-success/5"
                : "border-bp-border border-dashed bg-bp-bg/30"
            }`}
          >
            <p className="text-[10px] text-bp-text-muted tracking-widest">
              OUTPUT
            </p>
            {hasValidPipeline && (
              <p className="text-[8px] text-bp-success tracking-wider mt-1">
                {outputType === "image[]"
                  ? "IMAGES"
                  : outputType === "3d-model"
                  ? "3D MODEL"
                  : outputType === "video"
                  ? "VIDEO"
                  : outputType === "svg"
                  ? "SVG"
                  : "—"}
              </p>
            )}
          </div>
        </div>
      </div>

      {isExecuting && (
        <div className="mt-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-bp-accent rounded-full animate-pulse" />
          <span className="text-[10px] text-bp-accent tracking-widest animate-bp-pulse">
            EXECUTING PIPELINE...
          </span>
        </div>
      )}
    </div>
  );
}
