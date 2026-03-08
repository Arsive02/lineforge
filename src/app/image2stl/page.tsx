"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import ImageUploader from "@/components/image2stl/ImageUploader";
import ConversionProgress from "@/components/image2stl/ConversionProgress";
import ModelPreview from "@/components/image2stl/ModelPreview";
import BlueprintButton from "@/components/ui/BlueprintButton";
import DownloadButton from "@/components/ui/DownloadButton";
import BeforeAfterComparison from "@/components/ui/BeforeAfterComparison";
import CrosshairExpand from "@/components/animations/CrosshairExpand";

export default function Image2StlPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [glbUrl, setGlbUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const handleFileSelect = useCallback((f: File) => {
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setTaskId(null);
    setStatus("");
    setProgress(0);
    setGlbUrl(null);
    setError(null);
    setThumbnailUrl(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!file) return;

    setIsSubmitting(true);
    setError(null);
    setGlbUrl(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/image-to-3d", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Submission failed");
      }

      const data = await response.json();
      setTaskId(data.taskId);
      setStatus("PENDING");
      setProgress(0);

      // Start polling
      pollRef.current = setInterval(async () => {
        try {
          const pollResponse = await fetch(
            `/api/image-to-3d/${data.taskId}`
          );
          if (!pollResponse.ok) throw new Error("Poll failed");

          const pollData = await pollResponse.json();
          setStatus(pollData.status);
          setProgress(pollData.progress || 0);

          if (pollData.thumbnailUrl) {
            setThumbnailUrl(pollData.thumbnailUrl);
          }
          if (pollData.status === "SUCCEEDED") {
            if (pollRef.current) clearInterval(pollRef.current);
            setGlbUrl(pollData.modelUrls?.glb || null);
          } else if (pollData.status === "FAILED") {
            if (pollRef.current) clearInterval(pollRef.current);
            setError(pollData.error || "3D generation failed");
          }
        } catch {
          // Continue polling on transient errors
        }
      }, 3000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Submission failed";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }, [file]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <CrosshairExpand>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-bp-accent tracking-wider">
              IMAGE2 3D
            </h1>
            <p className="text-bp-text-muted text-xs mt-2 tracking-wide">
              IMAGE → 3D MODEL GENERATOR — POWERED BY MESHY.AI
            </p>
          </div>
        </CrosshairExpand>

        <div className="grid gap-6">
          <ImageUploader onFileSelect={handleFileSelect} />

          {previewUrl && (
            <div className="border border-bp-border p-4">
              <p className="text-[10px] text-bp-text-muted tracking-widest mb-3">
                INPUT PREVIEW
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Input"
                className="max-h-64 mx-auto border border-bp-border/50"
              />
            </div>
          )}

          <BlueprintButton
            onClick={handleSubmit}
            disabled={!file || isSubmitting || !!taskId}
          >
            {isSubmitting
              ? "SUBMITTING..."
              : taskId
              ? "SUBMITTED — POLLING..."
              : "GENERATE 3D MODEL"}
          </BlueprintButton>

          {taskId && (
            <ConversionProgress
              status={status}
              progress={progress}
              error={error || undefined}
            />
          )}

          {error && !taskId && (
            <div className="border border-bp-error/50 p-4">
              <p className="text-bp-error text-xs tracking-wider">
                ERROR: {error}
              </p>
            </div>
          )}

          {glbUrl && <ModelPreview glbUrl={glbUrl} />}

          {glbUrl && previewUrl && thumbnailUrl && (
            <BeforeAfterComparison
              beforeSrc={previewUrl}
              afterSrc={thumbnailUrl}
              beforeLabel="ORIGINAL IMAGE"
              afterLabel="3D MODEL PREVIEW"
            />
          )}

          {glbUrl && (
            <div className="flex items-center gap-4 p-4 border border-bp-success/30">
              <DownloadButton
                href={glbUrl}
                filename="model.glb"
                label="DOWNLOAD GLB"
              />
              <span className="text-bp-success text-xs tracking-wider">
                3D MODEL READY
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
