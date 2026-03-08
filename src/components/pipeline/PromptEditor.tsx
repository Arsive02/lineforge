"use client";

import { PipelineBlock } from "@/lib/pipeline/types";

interface PromptEditorProps {
  slots: (PipelineBlock | null)[];
  customPrompts: Record<number, string>;
  onPromptsChange: (prompts: Record<number, string>) => void;
  disabled?: boolean;
}

export default function PromptEditor({
  slots,
  customPrompts,
  onPromptsChange,
  disabled,
}: PromptEditorProps) {
  const editableSlots = slots
    .map((block, index) => ({ block, index }))
    .filter(
      (s): s is { block: PipelineBlock; index: number } =>
        s.block !== null && !!s.block.defaultPrompt
    );

  if (editableSlots.length === 0) return null;

  return (
    <div className="border border-bp-border p-4 bg-bp-bg/30 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 bg-bp-accent/60 rounded-full" />
        <span className="text-[10px] text-bp-text-muted tracking-widest font-bold">
          PROMPT CONFIGURATION
        </span>
      </div>

      {editableSlots.map(({ block, index }) => {
        const current = customPrompts[index] ?? block.defaultPrompt ?? "";
        const isDefault = current === block.defaultPrompt;

        return (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-[9px] text-bp-accent tracking-widest font-bold">
                SLOT {index + 1} — {block.label.toUpperCase()}
              </label>
              {!isDefault && (
                <button
                  className="text-[9px] text-bp-text-muted tracking-widest hover:text-bp-accent transition-colors disabled:opacity-40"
                  disabled={disabled}
                  onClick={() => {
                    const next = { ...customPrompts };
                    next[index] = block.defaultPrompt!;
                    onPromptsChange(next);
                  }}
                >
                  RESET TO DEFAULT
                </button>
              )}
            </div>
            <textarea
              className="w-full bg-bp-bg border border-bp-border/60 text-bp-text text-xs tracking-wider p-2 resize-y min-h-[60px] focus:outline-none focus:border-bp-accent/60 disabled:opacity-40 font-mono"
              value={current}
              disabled={disabled}
              onChange={(e) => {
                const next = { ...customPrompts };
                next[index] = e.target.value;
                onPromptsChange(next);
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
