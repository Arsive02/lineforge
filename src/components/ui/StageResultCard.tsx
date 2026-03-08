"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { StageResult } from "@/lib/pipeline/types";
import ModelPreview from "@/components/image2stl/ModelPreview";

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

interface StageResultCardProps {
  result: StageResult;
}

export default function StageResultCard({ result }: StageResultCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;
    const anim = animate(cardRef.current, {
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 600,
      ease: "outExpo",
    });
    return () => { anim.pause(); };
  }, []);

  return (
    <div ref={cardRef} className="border border-bp-border p-4 opacity-0">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-bp-success rounded-full" />
        <span className="text-[10px] text-bp-accent tracking-widest font-bold">
          STAGE {result.stageIndex + 1} — {result.blockLabel.toUpperCase()}
        </span>
        <span className="text-[10px] text-bp-text-muted tracking-wider ml-auto">
          {result.items.length} {result.items.length === 1 ? "ITEM" : "ITEMS"}
        </span>
      </div>

      <div className="grid gap-3">
        {result.items.map((item) => (
          <div key={item.id} className="border border-bp-border/50 p-3">
            {item.error ? (
              <p className="text-bp-error text-xs tracking-wider">
                ERROR: {item.error}
              </p>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {item.inputBase64 && (
                    <div>
                      <p className="text-[10px] text-bp-text-muted tracking-widest mb-1">
                        INPUT
                        {item.originalSize != null && (
                          <span className="ml-2 text-bp-text-muted/70">
                            [{formatBytes(item.originalSize)}]
                          </span>
                        )}
                      </p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.inputBase64}
                        alt="Input"
                        className="w-full border border-bp-border/30 bg-white/5"
                      />
                    </div>
                  )}
                  {item.outputBase64 && (
                    <div>
                      <p className="text-[10px] text-bp-text-muted tracking-widest mb-1">
                        OUTPUT
                        {item.outputSize != null && (
                          <span className="ml-2 text-bp-text-muted/70">
                            [{formatBytes(item.outputSize)}]
                          </span>
                        )}
                      </p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.outputBase64}
                        alt="Output"
                        className="w-full border border-bp-border/30 bg-white/5"
                      />
                    </div>
                  )}
                  {item.thumbnailUrl && !item.modelUrl && (
                    <div>
                      <p className="text-[10px] text-bp-text-muted tracking-widest mb-1">
                        3D PREVIEW
                      </p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.thumbnailUrl}
                        alt="3D Preview"
                        className="w-full border border-bp-border/30 bg-white/5"
                      />
                    </div>
                  )}
                </div>
                {item.modelUrl && (
                  <div className="mt-3">
                    <ModelPreview glbUrl={item.modelUrl} />
                  </div>
                )}
                {item.videoUrl && (
                  <div className="mt-3">
                    <p className="text-[10px] text-bp-text-muted tracking-widest mb-1">
                      GENERATED VIDEO
                    </p>
                    <video
                      src={item.videoUrl}
                      controls
                      autoPlay
                      loop
                      muted
                      className="w-full border border-bp-border/30 bg-black"
                    />
                  </div>
                )}
                {item.originalSize != null && item.outputSize != null && (
                  <div className="mt-2 pt-2 border-t border-bp-border/30 flex items-center gap-3">
                    <span className="text-[9px] text-bp-accent tracking-widest font-bold">
                      SIZE
                    </span>
                    <span className="text-[10px] text-bp-text-muted tracking-wider">
                      {formatBytes(item.originalSize)} → {formatBytes(item.outputSize)}
                    </span>
                    {item.outputSize < item.originalSize ? (
                      <span className="text-[9px] text-bp-success tracking-widest font-bold px-1.5 py-0.5 border border-bp-success/30 bg-bp-success/10">
                        {Math.round((1 - item.outputSize / item.originalSize) * 100)}% SMALLER
                      </span>
                    ) : (
                      <span className="text-[9px] text-bp-warning tracking-widest font-bold px-1.5 py-0.5 border border-bp-warning/30 bg-bp-warning/10">
                        +{Math.round((item.outputSize / item.originalSize - 1) * 100)}% LARGER
                      </span>
                    )}
                  </div>
                )}
                {item.caption && (
                  <div className="mt-2 pt-2 border-t border-bp-border/30">
                    <span className="text-[9px] text-bp-accent tracking-widest font-bold mr-2">
                      ALT TEXT
                    </span>
                    <span className="text-[10px] text-bp-text-muted tracking-wider italic">
                      {item.caption}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
