"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { StageResult } from "@/lib/pipeline/types";

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
                      </p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.outputBase64}
                        alt="Output"
                        className="w-full border border-bp-border/30 bg-white/5"
                      />
                    </div>
                  )}
                  {item.thumbnailUrl && (
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
