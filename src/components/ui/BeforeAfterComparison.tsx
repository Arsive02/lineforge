"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";

interface BeforeAfterComparisonProps {
  beforeSrc: string;
  afterSrc: string;
  beforeLabel?: string;
  afterLabel?: string;
  caption?: string;
}

export default function BeforeAfterComparison({
  beforeSrc,
  afterSrc,
  beforeLabel = "ORIGINAL",
  afterLabel = "PROCESSED",
  caption,
}: BeforeAfterComparisonProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const anim = animate(containerRef.current, {
      opacity: [0, 1],
      translateY: [15, 0],
      duration: 500,
      ease: "outExpo",
    });
    return () => { anim.pause(); };
  }, []);

  return (
    <div ref={containerRef} className="border border-bp-border p-4 opacity-0">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-[10px] text-bp-text-muted tracking-widest mb-2">
            {beforeLabel}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={beforeSrc}
            alt={beforeLabel}
            className="w-full border border-bp-border/50 bg-white/5"
          />
        </div>
        <div>
          <p className="text-[10px] text-bp-text-muted tracking-widest mb-2">
            {afterLabel}
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={afterSrc}
            alt={afterLabel}
            className="w-full border border-bp-border/50 bg-white/5"
          />
        </div>
      </div>
      {caption && (
        <div className="mt-3 pt-3 border-t border-bp-border/30">
          <p className="text-[10px] text-bp-text-muted tracking-wider italic">
            {caption}
          </p>
        </div>
      )}
    </div>
  );
}
