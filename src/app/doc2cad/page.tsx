"use client";

import { useState, useCallback } from "react";
import DocumentUploader from "@/components/doc2cad/DocumentUploader";
import OptionsPanel from "@/components/doc2cad/OptionsPanel";
import ProcessingPipeline from "@/components/doc2cad/ProcessingPipeline";
import ImageResultCard from "@/components/doc2cad/ImageResultCard";
import BlueprintButton from "@/components/ui/BlueprintButton";
import DownloadButton from "@/components/ui/DownloadButton";
import GranularProgress from "@/components/ui/GranularProgress";
import CrosshairExpand from "@/components/animations/CrosshairExpand";
import { ProcessingStep } from "@/components/ui/ProcessingStatus";

interface ConvertedPreview {
  originalSrc: string;
  lineArtSrc: string;
  caption?: string;
  originalSize?: number;
  lineArtSize?: number;
}

export default function Doc2CadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [generateCaptions, setGenerateCaptions] = useState(true);
  const [convertToSvg, setConvertToSvg] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [previews, setPreviews] = useState<ConvertedPreview[]>([]);
  const [imageProgress, setImageProgress] = useState({ current: 0, total: 0 });
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { label: "Uploading document", status: "pending" },
    { label: "Extracting images", status: "pending" },
    { label: "Converting to line art", status: "pending" },
    { label: "Generating captions", status: "pending" },
    { label: "Assembling output", status: "pending" },
  ]);

  const updateStep = useCallback(
    (index: number, status: ProcessingStep["status"], detail?: string) => {
      setSteps((prev) =>
        prev.map((step, i) =>
          i === index ? { ...step, status, detail } : step
        )
      );
    },
    []
  );

  const handleProcess = useCallback(async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setDownloadUrl(null);
    setPreviews([]);
    setImageProgress({ current: 0, total: 0 });

    // Reset steps
    setSteps((prev) => prev.map((s) => ({ ...s, status: "pending" as const, detail: undefined })));

    try {
      // Step 1: Upload
      updateStep(0, "active");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("generateCaptions", String(generateCaptions));
      formData.append("convertToSvg", String(convertToSvg));

      updateStep(0, "complete");

      // Step 2: Extracting images (streaming)
      updateStep(1, "active");

      const streamResponse = await fetch("/api/process-document-streaming", {
        method: "POST",
        body: formData,
      });

      if (!streamResponse.ok) {
        const err = await streamResponse.json();
        throw new Error(err.error || "Processing failed");
      }

      // Read NDJSON stream
      const reader = streamResponse.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let totalImages = 0;
      let processedCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop()!;

        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line);

          switch (event.type) {
            case "extraction":
              totalImages = event.totalImages;
              setImageProgress({ current: 0, total: totalImages });
              updateStep(1, "complete");
              updateStep(2, "active", `0 of ${totalImages} images`);
              break;

            case "image":
              processedCount++;
              setImageProgress({ current: processedCount, total: totalImages });
              updateStep(
                2,
                "active",
                `${processedCount} of ${totalImages} images`
              );
              setPreviews((prev) => [
                ...prev,
                {
                  originalSrc: event.originalBase64,
                  lineArtSrc: event.lineArtBase64,
                  caption: event.caption,
                  originalSize: event.originalSize,
                  lineArtSize: event.lineArtSize,
                },
              ]);
              break;

            case "image_error":
              processedCount++;
              setImageProgress({ current: processedCount, total: totalImages });
              updateStep(
                2,
                "active",
                `${processedCount} of ${totalImages} images`
              );
              break;

            case "complete":
              updateStep(2, "complete");
              updateStep(3, "complete");
              break;

            case "error":
              throw new Error(event.error);
          }
        }
      }

      // For image files, skip document assembly — the line art is the final output
      const isImageFile = file.type.startsWith("image/");

      if (isImageFile) {
        updateStep(4, "complete");
      } else {
        // Fetch assembled document via original endpoint
        updateStep(4, "active");
        const assembleFormData = new FormData();
        assembleFormData.append("file", file);
        assembleFormData.append("generateCaptions", String(generateCaptions));
        assembleFormData.append("convertToSvg", String(convertToSvg));

        const assembleResponse = await fetch("/api/process-document", {
          method: "POST",
          body: assembleFormData,
        });

        if (!assembleResponse.ok) {
          const err = await assembleResponse.json();
          throw new Error(err.error || "Assembly failed");
        }

        const blob = await assembleResponse.blob();
        const url = URL.createObjectURL(blob);
        const filename =
          assembleResponse.headers
            .get("Content-Disposition")
            ?.match(/filename="(.+)"/)?.[1] || "lineforge_output";

        setDownloadUrl(url);
        setDownloadFilename(filename);
        updateStep(4, "complete");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Processing failed";
      setError(message);
      setSteps((prev) =>
        prev.map((s) => (s.status === "active" ? { ...s, status: "error" } : s))
      );
    } finally {
      setIsProcessing(false);
    }
  }, [file, generateCaptions, convertToSvg, updateStep]);

  // Quick preview: convert a single image
  const handlePreviewImage = useCallback(async () => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("caption", String(generateCaptions));

      const response = await fetch("/api/convert-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Preview failed");

      const data = await response.json();
      const originalUrl = URL.createObjectURL(file);

      setPreviews([
        {
          originalSrc: originalUrl,
          lineArtSrc: data.image,
          caption: data.caption,
          originalSize: data.originalSize,
          lineArtSize: data.lineArtSize,
        },
      ]);
    } catch {
      // Silent fail for preview
    }
  }, [file, generateCaptions]);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <CrosshairExpand>
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-bp-accent tracking-wider">
              DOC2CAD
            </h1>
            <p className="text-bp-text-muted text-xs mt-2 tracking-wide">
              DOCUMENT → LINE ART CONVERTER — EXTRACT & TRANSFORM IMAGES TO
              ENGINEERING DRAWINGS
            </p>
          </div>
        </CrosshairExpand>

        <div className="grid gap-6">
          <DocumentUploader
            onFileSelect={(f) => {
              setFile(f);
              setDownloadUrl(null);
              setPreviews([]);
              setError(null);
              setImageProgress({ current: 0, total: 0 });
              setSteps((prev) =>
                prev.map((s) => ({ ...s, status: "pending" as const, detail: undefined }))
              );
            }}
          />

          <OptionsPanel
            generateCaptions={generateCaptions}
            onCaptionsChange={setGenerateCaptions}
            convertToSvg={convertToSvg}
            onSvgChange={setConvertToSvg}
          />

          <div className="flex gap-3">
            <BlueprintButton
              onClick={handleProcess}
              disabled={!file || isProcessing}
            >
              {isProcessing ? "PROCESSING..." : "PROCESS DOCUMENT"}
            </BlueprintButton>

            {file?.type.startsWith("image/") && (
              <BlueprintButton
                variant="secondary"
                onClick={handlePreviewImage}
                disabled={isProcessing}
              >
                PREVIEW SINGLE IMAGE
              </BlueprintButton>
            )}
          </div>

          {error && (
            <div className="border border-bp-error/50 p-4">
              <p className="text-bp-error text-xs tracking-wider">
                ERROR: {error}
              </p>
            </div>
          )}

          <ProcessingPipeline steps={steps} isProcessing={isProcessing} />

          {isProcessing && imageProgress.total > 0 && (
            <GranularProgress
              current={imageProgress.current}
              total={imageProgress.total}
            />
          )}

          {previews.map((preview, i) => (
            <ImageResultCard
              key={i}
              index={i}
              originalSrc={preview.originalSrc}
              lineArtSrc={preview.lineArtSrc}
              caption={preview.caption}
              originalSize={preview.originalSize}
              lineArtSize={preview.lineArtSize}
            />
          ))}

          {downloadUrl && (
            <div className="flex items-center gap-4 p-4 border border-bp-success/30">
              <DownloadButton
                href={downloadUrl}
                filename={downloadFilename}
                label="DOWNLOAD RESULT"
              />
              <span className="text-bp-success text-xs tracking-wider">
                PROCESSING COMPLETE
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
