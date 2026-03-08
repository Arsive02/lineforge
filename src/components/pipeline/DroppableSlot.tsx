"use client";

import { DragEvent, useState } from "react";
import { PipelineBlock } from "@/lib/pipeline/types";

interface DroppableSlotProps {
  index: number;
  block: PipelineBlock | null;
  onDrop: (block: PipelineBlock) => boolean; // returns false if invalid
  onRemove: () => void;
}

export default function DroppableSlot({
  index,
  block,
  onDrop,
  onRemove,
}: DroppableSlotProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isInvalid, setIsInvalid] = useState(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const data = e.dataTransfer.getData("application/lineforge-block");
    if (!data) return;

    try {
      const droppedBlock: PipelineBlock = JSON.parse(data);
      const accepted = onDrop(droppedBlock);
      if (!accepted) {
        setIsInvalid(true);
        setTimeout(() => setIsInvalid(false), 600);
      }
    } catch {
      // Invalid data
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-40 h-20 border-2 border-dashed transition-all duration-200 flex items-center justify-center
        ${
          isInvalid
            ? "border-bp-error bg-bp-error/10"
            : isDragOver
            ? "border-bp-accent bg-bp-accent/10 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
            : block
            ? "border-bp-accent/60 bg-bp-accent/5"
            : "border-bp-border bg-bp-bg/30"
        }`}
    >
      {block ? (
        <div className="p-2 text-center w-full">
          <div className="flex items-center justify-between">
            <svg
              width="14"
              height="14"
              viewBox="0 0 32 32"
              fill="none"
              className="text-bp-accent shrink-0"
            >
              <path d={block.icon} stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <button
              onClick={onRemove}
              className="text-bp-text-muted hover:text-bp-error transition-colors text-xs"
            >
              ✕
            </button>
          </div>
          <p className="text-[9px] text-bp-text font-bold tracking-wider mt-1 truncate">
            {block.label.toUpperCase()}
          </p>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-[10px] text-bp-text-muted tracking-widest">
            SLOT {index + 1}
          </p>
          <p className="text-[8px] text-bp-text-muted/60 tracking-wider mt-1">
            DROP BLOCK
          </p>
        </div>
      )}
    </div>
  );
}
