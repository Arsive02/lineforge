"use client";

import ProcessingStatus, { ProcessingStep } from "@/components/ui/ProcessingStatus";
import BlueprintLoader from "@/components/animations/BlueprintLoader";

interface ProcessingPipelineProps {
  steps: ProcessingStep[];
  isProcessing: boolean;
}

export default function ProcessingPipeline({
  steps,
  isProcessing,
}: ProcessingPipelineProps) {
  if (!isProcessing && steps.every((s) => s.status === "pending")) return null;

  const activeStep = steps.find((s) => s.status === "active");

  return (
    <div className="border border-bp-border p-4">
      <div className="mb-4 flex items-center gap-2">
        <span className="text-bp-accent text-xs tracking-widest">03</span>
        <span className="text-bp-text text-sm tracking-wide">PIPELINE</span>
      </div>

      <div className="flex gap-8">
        <ProcessingStatus steps={steps} />

        {isProcessing && (
          <div className="flex-1 flex items-center justify-center">
            <BlueprintLoader
              text={activeStep?.label || "Processing..."}
            />
          </div>
        )}
      </div>
    </div>
  );
}
