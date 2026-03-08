"use client";

import { PIPELINE_BLOCKS } from "@/lib/pipeline/constants";
import DraggableBlock from "./DraggableBlock";

export default function BlockPalette() {
  return (
    <div className="border border-bp-border p-4 bg-bp-bg/50">
      <h3 className="text-[10px] text-bp-text-muted tracking-widest mb-3 font-bold">
        AVAILABLE BLOCKS
      </h3>
      <div className="space-y-2">
        {PIPELINE_BLOCKS.map((block) => (
          <DraggableBlock key={block.id} block={block} />
        ))}
      </div>
      <p className="text-[8px] text-bp-text-muted/60 tracking-wider mt-3 text-center">
        DRAG BLOCKS INTO PIPELINE SLOTS
      </p>
    </div>
  );
}
