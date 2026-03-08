"use client";

import { PipelineExecutionState } from "@/lib/pipeline/types";
import StageResultCard from "@/components/ui/StageResultCard";
import GranularProgress from "@/components/ui/GranularProgress";

interface PipelineResultsProps {
  execution: PipelineExecutionState;
}

export default function PipelineResults({ execution }: PipelineResultsProps) {
  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      {execution.isRunning && (
        <div className="border border-bp-border p-4 bg-bp-bg/30">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 bg-bp-accent rounded-full animate-pulse" />
            <span className="text-[10px] text-bp-accent tracking-widest font-bold">
              STAGE {execution.currentStage + 1} OF {execution.totalStages}
            </span>
          </div>
          {execution.totalImages > 0 && (
            <GranularProgress
              current={execution.currentImage}
              total={execution.totalImages}
            />
          )}
        </div>
      )}

      {/* Error */}
      {execution.error && (
        <div className="border border-bp-error/50 p-4">
          <p className="text-bp-error text-xs tracking-wider">
            PIPELINE ERROR: {execution.error}
          </p>
        </div>
      )}

      {/* Stage results */}
      {execution.stageResults.map((result) => (
        <StageResultCard key={result.stageIndex} result={result} />
      ))}
    </div>
  );
}
