"use client";

import { useState, useCallback } from "react";
import FileUploader from "@/components/ui/FileUploader";
import BlueprintButton from "@/components/ui/BlueprintButton";
import CrosshairExpand from "@/components/animations/CrosshairExpand";

const DEFAULT_PROMPT =
  "Create a detailed, cinematic multi-angle video guide of this image. Show the subject from multiple perspectives with smooth camera movements. If it's a product, demonstrate assembly or usage step-by-step. If it's a building or space, provide a 360-degree walkthrough including interiors. Make it educational and visually informative for students studying this subject.";

export default function VideoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const handleFileSelect = useCallback((f: File) => {
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setVideoUrl(null);
    setError(null);
    setElapsed(0);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!file) return;

    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);
    setElapsed(0);

    const startTime = Date.now();
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("prompt", prompt);

      const response = await fetch("/api/generate-video", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Video generation failed");
      }

      const data = await response.json();
      setVideoUrl(data.video);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Video generation failed");
    } finally {
      clearInterval(timer);
      setIsGenerating(false);
    }
  }, [file, prompt]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <CrosshairExpand>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-bp-accent tracking-wider">
              VIDEO GUIDE
            </h1>
            <p className="text-bp-text-muted text-xs mt-2 tracking-wide">
              IMAGE → VIDEO GENERATOR — POWERED BY VEO 3.1
            </p>
          </div>
        </CrosshairExpand>

        <div className="grid gap-6">
          {/* Step 1: Upload */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-bp-accent text-xs tracking-widest">01</span>
              <span className="text-bp-text text-sm tracking-wide">SELECT IMAGE</span>
            </div>
            <FileUploader
              accept="image/png,image/jpeg,image/webp,image/jpg"
              onFileSelect={handleFileSelect}
              label="Drop an image to generate a video guide"
            />
            <div className="mt-2 flex items-center gap-3 text-[10px] text-bp-text-muted/60 tracking-wider">
              <span>PNG</span>
              <span>·</span>
              <span>JPEG</span>
              <span>·</span>
              <span>WEBP</span>
              <span className="ml-auto" />
              <button
                type="button"
                onClick={async () => {
                  const res = await fetch("/examples/pi.png");
                  const blob = await res.blob();
                  handleFileSelect(new File([blob], "pi.png", { type: "image/png" }));
                }}
                className="text-[10px] text-bp-accent hover:text-bp-text tracking-wider transition-colors cursor-pointer"
              >
                TRY WITH EXAMPLE →
              </button>
            </div>
          </div>

          {/* Preview */}
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

          {/* Step 2: Prompt */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-bp-accent text-xs tracking-widest">02</span>
              <span className="text-bp-text text-sm tracking-wide">CUSTOMIZE PROMPT</span>
            </div>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              disabled={isGenerating}
              className="w-full bg-bp-bg border border-bp-border p-3 text-xs text-bp-text tracking-wider resize-none focus:outline-none focus:border-bp-accent transition-colors disabled:opacity-50"
              placeholder="Describe what kind of video to generate..."
            />
          </div>

          {/* Generate button */}
          <BlueprintButton
            onClick={handleGenerate}
            disabled={!file || isGenerating}
          >
            {isGenerating
              ? `GENERATING... ${formatTime(elapsed)}`
              : "GENERATE VIDEO"}
          </BlueprintButton>

          {/* Progress indicator */}
          {isGenerating && (
            <div className="border border-bp-accent/30 p-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-bp-accent rounded-full animate-pulse" />
                <p className="text-[10px] text-bp-accent tracking-widest font-bold">
                  GENERATING VIDEO — THIS CAN TAKE UP TO 6 MINUTES
                </p>
              </div>
              <div className="mt-3 w-full bg-bp-border/30 h-1">
                <div
                  className="h-full bg-bp-accent/50 transition-all duration-1000"
                  style={{ width: `${Math.min((elapsed / 360) * 100, 95)}%` }}
                />
              </div>
              <p className="text-[10px] text-bp-text-muted tracking-wider mt-2">
                ELAPSED: {formatTime(elapsed)}
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="border border-bp-error/50 p-4">
              <p className="text-bp-error text-xs tracking-wider">
                ERROR: {error}
              </p>
            </div>
          )}

          {/* Video preview */}
          {videoUrl && (
            <div className="border border-bp-border p-4">
              <p className="text-[10px] text-bp-text-muted tracking-widest mb-3">
                GENERATED VIDEO
              </p>
              <video
                src={videoUrl}
                controls
                autoPlay
                loop
                muted
                className="w-full border border-bp-border/30 bg-black"
              />
            </div>
          )}

          {/* Download */}
          {videoUrl && (
            <div className="flex items-center gap-4 p-4 border border-bp-success/30">
              <a
                href={videoUrl}
                download="video-guide.mp4"
                className="text-xs text-bp-accent hover:text-bp-text tracking-wider transition-colors font-bold"
              >
                → DOWNLOAD VIDEO (MP4)
              </a>
              <span className="text-bp-success text-xs tracking-wider">
                VIDEO READY
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
