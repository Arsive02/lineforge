"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";

export default function BlueprintLoader({ text = "Processing..." }: { text?: string }) {
  const pathRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!pathRef.current) return;
    const length = pathRef.current.getTotalLength();
    pathRef.current.style.strokeDasharray = `${length}`;
    pathRef.current.style.strokeDashoffset = `${length}`;

    const anim = animate(pathRef.current, {
      strokeDashoffset: [length, 0],
      ease: "inOutSine",
      duration: 2000,
      loop: true,
    });

    return () => { anim.pause(); };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
        <path
          ref={pathRef}
          d="M10 40 L25 10 L55 10 L70 40 L55 70 L25 70 Z"
          stroke="#22d3ee"
          strokeWidth="1.5"
          fill="none"
        />
        <circle cx="40" cy="40" r="8" stroke="#22d3ee" strokeWidth="1" fill="none" opacity="0.5" />
        <line x1="40" y1="0" x2="40" y2="80" stroke="#22d3ee" strokeWidth="0.5" opacity="0.2" />
        <line x1="0" y1="40" x2="80" y2="40" stroke="#22d3ee" strokeWidth="0.5" opacity="0.2" />
      </svg>
      <span className="text-bp-accent text-xs tracking-widest animate-bp-pulse">
        {text}
      </span>
    </div>
  );
}
