"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";

interface DownloadButtonProps {
  href: string;
  filename: string;
  label?: string;
}

export default function DownloadButton({
  href,
  filename,
  label = "DOWNLOAD",
}: DownloadButtonProps) {
  const btnRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!btnRef.current) return;
    const anim = animate(btnRef.current, {
      boxShadow: [
        "0 0 0px rgba(34,211,238,0.3)",
        "0 0 20px rgba(34,211,238,0.3)",
        "0 0 0px rgba(34,211,238,0.3)",
      ],
      duration: 2000,
      loop: true,
      ease: "inOutSine",
    });
    return () => { anim.pause(); };
  }, []);

  return (
    <a
      ref={btnRef}
      href={href}
      download={filename}
      className="inline-flex items-center gap-2 px-6 py-2.5 border border-bp-success text-bp-success text-xs tracking-widest uppercase hover:bg-bp-success/10 transition-colors"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M7 1V10M3 7L7 10L11 7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M1 12H13" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      {label}
    </a>
  );
}
