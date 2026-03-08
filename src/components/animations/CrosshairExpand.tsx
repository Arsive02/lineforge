"use client";

import { useEffect, useRef } from "react";
import { createTimeline } from "animejs";

export default function CrosshairExpand({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hLineRef = useRef<HTMLDivElement>(null);
  const vLineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = createTimeline({ defaults: { ease: "outExpo" } });

    tl.add(hLineRef.current!, {
      scaleX: [0, 1],
      opacity: [0, 0.3],
      duration: 600,
    }).add(vLineRef.current!, {
      scaleY: [0, 1],
      opacity: [0, 0.3],
      duration: 600,
    }, "-=400").add(containerRef.current!, {
      opacity: [0, 1],
      translateY: [10, 0],
      duration: 800,
    }, "-=300");

    return () => { tl.pause(); };
  }, []);

  return (
    <div className="relative">
      <div
        ref={hLineRef}
        className="absolute top-1/2 left-0 w-full h-px bg-bp-accent opacity-0"
      />
      <div
        ref={vLineRef}
        className="absolute top-0 left-1/2 w-px h-full bg-bp-accent opacity-0"
      />
      <div ref={containerRef} className="relative opacity-0">
        {children}
      </div>
    </div>
  );
}
