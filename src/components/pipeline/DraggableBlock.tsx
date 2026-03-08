"use client";

import { DragEvent } from "react";
import { PipelineBlock } from "@/lib/pipeline/types";

interface DraggableBlockProps {
  block: PipelineBlock;
}

export default function DraggableBlock({ block }: DraggableBlockProps) {
  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData(
      "application/lineforge-block",
      JSON.stringify(block)
    );
    e.dataTransfer.effectAllowed = "copy";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="group relative border border-bp-border p-3 cursor-grab active:cursor-grabbing
        hover:border-bp-accent/50 transition-all duration-200 bg-bp-bg/50 backdrop-blur-sm select-none"
    >
      {/* Corner accents */}
      <span className="absolute top-0 left-0 w-3 h-3 border-t border-l border-bp-accent/40 transition-all group-hover:border-bp-accent" />
      <span className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-bp-accent/40 transition-all group-hover:border-bp-accent" />

      <div className="flex items-center gap-2 mb-1">
        <svg width="16" height="16" viewBox="0 0 32 32" fill="none" className="text-bp-accent shrink-0">
          <path d={block.icon} stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <span className="text-[10px] text-bp-text font-bold tracking-wider">
          {block.label.toUpperCase()}
        </span>
      </div>
      <p className="text-[9px] text-bp-text-muted tracking-wider leading-relaxed">
        {block.description}
      </p>
    </div>
  );
}
