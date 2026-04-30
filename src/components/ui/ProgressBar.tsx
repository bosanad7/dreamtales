"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number; // 0-100
  label?: string;
  className?: string;
}

export default function ProgressBar({ value, label, className }: ProgressBarProps) {
  return (
    <div className={className}>
      {label && <p className="text-white/60 text-sm mb-2 text-center">{label}</p>}
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-violet-500 to-indigo-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      <p className="text-white/40 text-xs mt-1 text-right">{Math.round(value)}%</p>
    </div>
  );
}
