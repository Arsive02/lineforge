"use client";

import FileUploader from "@/components/ui/FileUploader";

interface DocumentUploaderProps {
  onFileSelect: (file: File) => void;
}

const ACCEPTED_FORMATS = ".pdf,.docx,.doc,.md,.markdown,.html,.htm,.png,.jpg,.jpeg,.webp,.gif,.bmp,.tiff,.tif,.svg";

export default function DocumentUploader({ onFileSelect }: DocumentUploaderProps) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-bp-accent text-xs tracking-widest">01</span>
        <span className="text-bp-text text-sm tracking-wide">SELECT FILE</span>
      </div>
      <FileUploader
        accept={ACCEPTED_FORMATS}
        onFileSelect={onFileSelect}
        label="Drop document or image file"
      />
      <div className="mt-2 flex gap-3 flex-wrap text-[10px] text-bp-text-muted/60 tracking-wider">
        <span>PDF</span>
        <span>·</span>
        <span>DOCX</span>
        <span>·</span>
        <span>MD</span>
        <span>·</span>
        <span>HTML</span>
        <span>·</span>
        <span>PNG</span>
        <span>·</span>
        <span>JPG</span>
        <span>·</span>
        <span>WEBP</span>
      </div>
    </div>
  );
}
