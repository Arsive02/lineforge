"use client";

interface OptionsPanelProps {
  generateCaptions: boolean;
  onCaptionsChange: (value: boolean) => void;
  convertToSvg: boolean;
  onSvgChange: (value: boolean) => void;
}

export default function OptionsPanel({
  generateCaptions,
  onCaptionsChange,
  convertToSvg,
  onSvgChange,
}: OptionsPanelProps) {
  return (
    <div className="border border-bp-border p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-bp-accent text-xs tracking-widest">02</span>
        <span className="text-bp-text text-sm tracking-wide">OPTIONS</span>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            className={`w-4 h-4 border transition-colors ${
              generateCaptions
                ? "bg-bp-accent border-bp-accent"
                : "border-bp-border group-hover:border-bp-accent/50"
            }`}
            onClick={() => onCaptionsChange(!generateCaptions)}
          >
            {generateCaptions && (
              <svg className="w-4 h-4 text-bp-bg" viewBox="0 0 16 16" fill="none">
                <path d="M3 8L7 12L13 4" stroke="currentColor" strokeWidth="2" />
              </svg>
            )}
          </div>
          <span className="text-xs text-bp-text-muted">
            Generate technical captions
          </span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group">
          <div
            className={`w-4 h-4 border transition-colors ${
              convertToSvg
                ? "bg-bp-accent border-bp-accent"
                : "border-bp-border group-hover:border-bp-accent/50"
            }`}
            onClick={() => onSvgChange(!convertToSvg)}
          >
            {convertToSvg && (
              <svg className="w-4 h-4 text-bp-bg" viewBox="0 0 16 16" fill="none">
                <path d="M3 8L7 12L13 4" stroke="currentColor" strokeWidth="2" />
              </svg>
            )}
          </div>
          <span className="text-xs text-bp-text-muted">
            Also vectorize to SVG
          </span>
        </label>
      </div>
    </div>
  );
}
