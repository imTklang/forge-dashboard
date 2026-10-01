"use client";

import { MotionConfig } from "motion/react";

/** Respeita prefers-reduced-motion em todas as animações da UI. */
export function Providers({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
