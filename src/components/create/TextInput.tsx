"use client";

import { TextareaHTMLAttributes, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextInputProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  hint?: string;
  emoji?: string;
}

interface SingleLineInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  emoji?: string;
}

export function TextArea({ label, hint, emoji, className, ...props }: TextInputProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-white font-semibold text-base">
        {emoji && <span className="text-xl">{emoji}</span>}
        {label}
      </label>
      {hint && <p className="text-white/40 text-sm">{hint}</p>}
      <textarea
        className={cn(
          "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-violet-400/60 focus:bg-white/10 transition-all resize-none min-h-[100px] text-base",
          className
        )}
        {...props}
      />
    </div>
  );
}

export function SingleLineInput({ label, hint, emoji, className, ...props }: SingleLineInputProps) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-white font-semibold text-base">
        {emoji && <span className="text-xl">{emoji}</span>}
        {label}
      </label>
      {hint && <p className="text-white/40 text-sm">{hint}</p>}
      <input
        className={cn(
          "w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-violet-400/60 focus:bg-white/10 transition-all text-base",
          className
        )}
        {...props}
      />
    </div>
  );
}
