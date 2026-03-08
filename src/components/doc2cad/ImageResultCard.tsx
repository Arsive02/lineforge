"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

interface ImageResultCardProps {
  originalSrc: string;
  lineArtSrc: string;
  caption?: string;
  index: number;
  originalSize?: number;
  lineArtSize?: number;
}

export default function ImageResultCard({
  originalSrc,
  lineArtSrc,
  caption,
  index,
  originalSize,
  lineArtSize,
}: ImageResultCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    const anim = animate(cardRef.current, {
      opacity: [0, 1],
      translateY: [20, 0],
      delay: index * 150,
      duration: 600,
      ease: "outExpo",
    });
    return () => { anim.pause(); };
  }, [index]);

  return (
    <div
      ref={cardRef}
      className="border border-bp-border p-4 opacity-0"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-bp-accent text-[10px] tracking-widest">
          IMG-{String(index + 1).padStart(3, "0")}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] text-bp-text-muted tracking-widest mb-2">
            ORIGINAL
            {originalSize != null && (
              <span className="ml-2 text-bp-text-muted/70">
                [{formatBytes(originalSize)}]
              </span>
            )}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={originalSrc}
            alt="Original"
            className="w-full border border-bp-border/50"
          />
        </div>
        <div>
          <p className="text-[10px] text-bp-text-muted tracking-widest mb-2">
            LINE ART
            {lineArtSize != null && (
              <span className="ml-2 text-bp-text-muted/70">
                [{formatBytes(lineArtSize)}]
              </span>
            )}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lineArtSrc}
            alt="Line art"
            className="w-full border border-bp-border/50"
          />
        </div>
      </div>

      {originalSize != null && lineArtSize != null && (
        <div className="mt-3 pt-3 border-t border-bp-border/30 flex items-center gap-3">
          <span className="text-[9px] text-bp-accent tracking-widest font-bold">
            SIZE
          </span>
          <span className="text-[10px] text-bp-text-muted tracking-wider">
            {formatBytes(originalSize)} → {formatBytes(lineArtSize)}
          </span>
          {lineArtSize < originalSize ? (
            <span className="text-[9px] text-bp-success tracking-widest font-bold px-1.5 py-0.5 border border-bp-success/30 bg-bp-success/10">
              {Math.round((1 - lineArtSize / originalSize) * 100)}% SMALLER
            </span>
          ) : (
            <span className="text-[9px] text-bp-warning tracking-widest font-bold px-1.5 py-0.5 border border-bp-warning/30 bg-bp-warning/10">
              +{Math.round((lineArtSize / originalSize - 1) * 100)}% LARGER
            </span>
          )}
        </div>
      )}

      {caption && (
        <div className="mt-3 pt-3 border-t border-bp-border/30">
          <span className="text-[9px] text-bp-accent tracking-widest font-bold mr-2">
            ALT TEXT
          </span>
          <span className="text-[10px] text-bp-text-muted tracking-wider italic">
            {caption}
          </span>
        </div>
      )}
    </div>
  );
}
