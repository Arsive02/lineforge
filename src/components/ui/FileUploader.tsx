"use client";

import { useCallback, useState, useRef } from "react";

interface FileUploaderProps {
  accept: string;
  onFileSelect: (file: File) => void;
  label?: string;
  maxSizeMB?: number;
  compact?: boolean;
}

export default function FileUploader({
  accept,
  onFileSelect,
  label = "Drop file here or click to browse",
  maxSizeMB = 4.5,
  compact = false,
}: FileUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File exceeds ${maxSizeMB}MB limit`);
        return;
      }
      setFileName(file.name);
      onFileSelect(file);
    },
    [maxSizeMB, onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        relative border-2 border-dashed rounded-sm text-center cursor-pointer
        transition-all duration-300
        ${compact ? "p-3" : "p-8"}
        ${isDragOver
          ? "border-bp-accent bg-bp-accent/5 scale-[1.01]"
          : "border-bp-border hover:border-bp-accent/50"
        }
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />

      <div className={`flex flex-col items-center ${compact ? "gap-1" : "gap-3"}`}>
        {!compact && (
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="text-bp-accent opacity-60">
            <path d="M20 5L20 25M12 17L20 25L28 17" stroke="currentColor" strokeWidth="1.5" transform="rotate(180, 20, 15)" />
            <path d="M5 30L5 33C5 34.1 5.9 35 7 35L33 35C34.1 35 35 34.1 35 33L35 30" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        )}

        {fileName ? (
          <div>
            <p className={`text-bp-accent ${compact ? "text-[9px] tracking-wider" : "text-sm"}`}>{fileName}</p>
            {!compact && <p className="text-bp-text-muted text-xs mt-1">Click to change</p>}
          </div>
        ) : (
          <div>
            <p className={`text-bp-text-muted ${compact ? "text-[9px] tracking-wider" : "text-sm"}`}>
              {compact ? "Upload file" : label}
            </p>
            {!compact && (
              <p className="text-bp-text-muted/60 text-xs mt-1">
                Max {maxSizeMB}MB
              </p>
            )}
          </div>
        )}

        {error && (
          <p className={`text-bp-error ${compact ? "text-[8px]" : "text-xs"}`}>{error}</p>
        )}
      </div>

      {/* Corner brackets */}
      <span className="absolute top-2 left-2 w-3 h-3 border-t border-l border-bp-accent/30" />
      <span className="absolute top-2 right-2 w-3 h-3 border-t border-r border-bp-accent/30" />
      <span className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-bp-accent/30" />
      <span className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-bp-accent/30" />
    </div>
  );
}
