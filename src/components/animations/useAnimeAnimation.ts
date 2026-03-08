"use client";

import { useEffect, useRef } from "react";
import { animate, type AnimationParams } from "animejs";

export function useAnimeAnimation(
  target: string | Element | null,
  params: AnimationParams,
  deps: unknown[] = []
) {
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);

  useEffect(() => {
    if (!target) return;
    animationRef.current = animate(target, params);
    return () => {
      animationRef.current?.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return animationRef;
}
