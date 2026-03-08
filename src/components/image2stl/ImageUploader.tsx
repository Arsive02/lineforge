"use client";

import FileUploader from "@/components/ui/FileUploader";

interface ImageUploaderProps {
  onFileSelect: (file: File) => void;
}

export default function ImageUploader({ onFileSelect }: ImageUploaderProps) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="text-bp-accent text-xs tracking-widest">01</span>
        <span className="text-bp-text text-sm tracking-wide">SELECT IMAGE</span>
      </div>
      <FileUploader
        accept="image/png,image/jpeg,image/webp,image/jpg"
        onFileSelect={onFileSelect}
        label="Drop an image to convert to 3D"
      />
      <div className="mt-2 flex gap-3 text-[10px] text-bp-text-muted/60 tracking-wider">
        <span>PNG</span>
        <span>·</span>
        <span>JPEG</span>
        <span>·</span>
        <span>WEBP</span>
      </div>
    </div>
  );
}
