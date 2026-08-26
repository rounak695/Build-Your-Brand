"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface XcelerateLogoProps {
  className?: string;
  size?: number;
}

export default function XcelerateLogo({
  className,
  size = 28,
}: XcelerateLogoProps) {
  const height = Math.round(size * (528 / 682));

  return (
    <span
      style={{
        width: size,
        height,
        backgroundColor: "currentColor",
        maskImage: "url(/xcelerate-logo.png)",
        maskSize: "contain",
        maskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskImage: "url(/xcelerate-logo.png)",
        WebkitMaskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
      }}
      className={cn("inline-block shrink-0 select-none transition-colors", className)}
      aria-label="Xcelerate Logo"
    />
  );
}
