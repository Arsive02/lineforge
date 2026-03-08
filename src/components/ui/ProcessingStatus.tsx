"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";

export interface ProcessingStep {
  label: string;
  status: "pending" | "active" | "complete" | "error";
  detail?: string;
}

interface ProcessingStatusProps {
  steps: ProcessingStep[];
}

export default function ProcessingStatus({ steps }: ProcessingStatusProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const activeStep = containerRef.current.querySelector('[data-status="active"]');
    if (activeStep) {
      const dot = activeStep.querySelector(".step-dot");
      if (dot) {
        animate(dot, {
          scale: [1, 1.3, 1],
          duration: 1000,
          loop: true,
          ease: "inOutSine",
        });
      }
    }
  }, [steps]);

  return (
    <div ref={containerRef} className="flex flex-col gap-1">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-3" data-status={step.status}>
          {/* Connector line */}
          {i > 0 && (
            <div className="absolute ml-[7px] -mt-6 w-px h-4"
              style={{
                background: step.status === "complete" || step.status === "active"
                  ? "var(--bp-accent)"
                  : "var(--bp-border)",
              }}
            />
          )}

          {/* Step dot */}
          <div className="relative">
            <div
              className={`step-dot w-4 h-4 rounded-full border-2 transition-colors ${
                step.status === "complete"
                  ? "bg-bp-success border-bp-success"
                  : step.status === "active"
                  ? "border-bp-accent bg-bp-accent/20"
                  : step.status === "error"
                  ? "border-bp-error bg-bp-error/20"
                  : "border-bp-border"
              }`}
            >
              {step.status === "complete" && (
                <svg className="w-3 h-3 m-auto mt-px text-bp-bg" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" />
                </svg>
              )}
            </div>
          </div>

          {/* Label */}
          <div className="flex flex-col">
            <span
              className={`text-xs tracking-wide ${
                step.status === "active"
                  ? "text-bp-accent"
                  : step.status === "complete"
                  ? "text-bp-success"
                  : step.status === "error"
                  ? "text-bp-error"
                  : "text-bp-text-muted"
              }`}
            >
              {step.label}
            </span>
            {step.detail && step.status === "active" && (
              <span className="text-[10px] text-bp-text-muted tracking-wider mt-0.5">
                {step.detail}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
