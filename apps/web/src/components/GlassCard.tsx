"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { cn } from "@/lib/cn";

type Props = HTMLMotionProps<"div"> & { hover?: boolean };

export function GlassCard({ className, hover = false, ...props }: Props) {
  return (
    <motion.div
      whileHover={hover ? { y: -4 } : undefined}
      className={cn("rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl", className)}
      {...props}
    />
  );
}
