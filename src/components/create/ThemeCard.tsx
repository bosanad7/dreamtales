"use client";

import { cn } from "@/lib/utils";
import { StoryTheme } from "@/lib/types";

const THEMES: { id: StoryTheme; label: string; emoji: string; color: string }[] = [
  { id: "space", label: "Space", emoji: "🚀", color: "from-indigo-600 to-violet-700" },
  { id: "animals", label: "Animals", emoji: "🦁", color: "from-amber-500 to-orange-600" },
  { id: "ocean", label: "Ocean", emoji: "🐠", color: "from-cyan-500 to-blue-600" },
  { id: "jungle", label: "Jungle", emoji: "🌿", color: "from-green-500 to-emerald-600" },
  { id: "school", label: "School", emoji: "📚", color: "from-yellow-500 to-amber-600" },
  { id: "magic", label: "Magic", emoji: "✨", color: "from-purple-500 to-pink-600" },
  { id: "dinosaurs", label: "Dinos", emoji: "🦕", color: "from-lime-500 to-green-600" },
  { id: "superheroes", label: "Heroes", emoji: "🦸", color: "from-red-500 to-rose-600" },
];

interface ThemeCardProps {
  selected: StoryTheme;
  onChange: (theme: StoryTheme) => void;
}

export default function ThemeCard({ selected, onChange }: ThemeCardProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {THEMES.map((theme) => (
        <button
          key={theme.id}
          type="button"
          onClick={() => onChange(theme.id)}
          className={cn(
            "flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all duration-200 active:scale-95",
            selected === theme.id
              ? `bg-gradient-to-br ${theme.color} border-white/40 shadow-lg scale-105`
              : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
          )}
        >
          <span className="text-2xl">{theme.emoji}</span>
          <span className="text-white text-xs font-medium">{theme.label}</span>
        </button>
      ))}
    </div>
  );
}
