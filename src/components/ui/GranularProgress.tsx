"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";

interface GranularProgressProps {
  current: number;
  total: number;
  label?: string;
}

export default function GranularProgress({
  current,
  total,
  label = "Processing image",
}: GranularProgressProps) {
  const counterRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (counterRef.current) {
      animate(counterRef.current, {
        scale: [1.2, 1],
        duration: 300,
        ease: "outExpo",
      });
    }
  }, [current]);

  useEffect(() => {
    if (barRef.current && total > 0) {
      animate(barRef.current, {
        width: `${(current / total) * 100}%`,
        duration: 400,
        ease: "outExpo",
      });
    }
  }, [current, total]);

  if (total === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-bp-text-muted tracking-wider">
          {label}{" "}
          <span ref={counterRef} className="text-bp-accent font-bold inline-block">
            {current}
          </span>
          {" "}of{" "}
          <span className="text-bp-text">{total}</span>
        </span>
        <span className="text-[10px] text-bp-text-muted tracking-widest">
          {Math.round((current / total) * 100)}%
        </span>
      </div>
      <div className="h-1 bg-bp-border/30 overflow-hidden">
        <div
          ref={barRef}
          className="h-full bg-bp-accent transition-colors"
          style={{ width: `${(current / total) * 100}%` }}
        />
      </div>
    </div>
  );
}
