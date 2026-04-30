import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

export default function Card({ className, glow, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-6",
        glow && "shadow-lg shadow-violet-500/10",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
