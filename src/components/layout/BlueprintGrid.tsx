"use client";

import { useEffect, useRef } from "react";

export default function BlueprintGrid() {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (svgRef.current) {
      svgRef.current.style.opacity = "0";
      requestAnimationFrame(() => {
        if (svgRef.current) {
          svgRef.current.style.transition = "opacity 1.5s ease-in";
          svgRef.current.style.opacity = "1";
        }
      });
    }
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <svg
        ref={svgRef}
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="smallGrid"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 20 0 L 0 0 0 20"
              fill="none"
              stroke="rgba(59,130,246,0.06)"
              strokeWidth="0.5"
            />
          </pattern>
          <pattern
            id="grid"
            width="100"
            height="100"
            patternUnits="userSpaceOnUse"
          >
            <rect width="100" height="100" fill="url(#smallGrid)" />
            <path
              d="M 100 0 L 0 0 0 100"
              fill="none"
              stroke="rgba(59,130,246,0.12)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}
