"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";
import BlueprintLoader from "@/components/animations/BlueprintLoader";

interface ConversionProgressProps {
  status: string;
  progress: number;
  error?: string;
}

export default function ConversionProgress({
  status,
  progress,
  error,
}: ConversionProgressProps) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!barRef.current) return;
    animate(barRef.current, {
      width: `${progress}%`,
      duration: 500,
      ease: "outExpo",
    });
  }, [progress]);

  if (error) {
    return (
      <div className="border border-bp-error/50 p-4">
        <p className="text-bp-error text-xs tracking-wider">ERROR: {error}</p>
      </div>
    );
  }

  return (
    <div className="border border-bp-border p-4">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-bp-accent text-xs tracking-widest">02</span>
        <span className="text-bp-text text-sm tracking-wide">
          3D GENERATION
        </span>
      </div>

      <div className="flex items-center gap-6">
        <BlueprintLoader text={status === "SUCCEEDED" ? "Complete" : "Generating 3D model..."} />

        <div className="flex-1">
          <div className="flex justify-between text-[10px] text-bp-text-muted mb-2">
            <span>STATUS: {status}</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1 bg-bp-bg-light border border-bp-border/30">
            <div
              ref={barRef}
              className="h-full bg-bp-accent"
              style={{ width: "0%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
