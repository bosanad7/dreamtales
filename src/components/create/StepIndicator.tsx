"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
}

export default function StepIndicator({ totalSteps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="relative">
          <motion.div
            className={cn(
              "rounded-full transition-all duration-300",
              i < currentStep
                ? "bg-violet-400 w-2 h-2"
                : i === currentStep
                ? "bg-white w-6 h-2"
                : "bg-white/20 w-2 h-2"
            )}
            layout
          />
        </div>
      ))}
    </div>
  );
}
