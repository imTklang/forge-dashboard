"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect } from "react";

export function CountUp({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const reduced = useReducedMotion();
  const mv = useMotionValue(reduced ? value : 0);
  const text = useTransform(mv, (v) => v.toLocaleString("pt-BR", { minimumFractionDigits: decimals, maximumFractionDigits: decimals }));
  useEffect(() => {
    if (reduced) return mv.set(value);
    const controls = animate(mv, value, { duration: 0.8, ease: "easeOut" });
    return () => controls.stop();
  }, [mv, value, reduced]);
  return <motion.span>{text}</motion.span>;
}
