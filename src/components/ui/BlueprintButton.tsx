"use client";

import { useRef } from "react";

interface BlueprintButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
  className?: string;
  type?: "button" | "submit";
}

export default function BlueprintButton({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  className = "",
  type = "button",
}: BlueprintButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  const baseStyles =
    "relative px-6 py-2.5 text-xs tracking-widest uppercase border transition-all duration-300 group overflow-hidden";
  const variants = {
    primary:
      "border-bp-accent text-bp-accent hover:bg-bp-accent/10 disabled:opacity-40 disabled:cursor-not-allowed",
    secondary:
      "border-bp-border text-bp-text-muted hover:text-bp-text hover:border-bp-accent/50 disabled:opacity-40 disabled:cursor-not-allowed",
  };

  return (
    <button
      ref={btnRef}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {/* Caliper lines */}
      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-px bg-bp-accent transition-all duration-300 group-hover:w-3 opacity-50" />
      <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-px bg-bp-accent transition-all duration-300 group-hover:w-3 opacity-50" />
      {children}
    </button>
  );
}
