"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Clock } from "lucide-react";
import { Story } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const THEME_EMOJIS: Record<string, string> = {
  space: "🚀", animals: "🦁", ocean: "🐠", jungle: "🌿",
  school: "📚", magic: "✨", dinosaurs: "🦕", superheroes: "🦸",
};

interface StoryCardProps {
  story: Story;
  onDelete: (id: string) => void;
}

export default function StoryCard({ story, onDelete }: StoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="relative group"
    >
      <Link href={`/story/${story.id}`}>
        <div className="rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-violet-400/40 transition-all hover:shadow-lg hover:shadow-violet-500/10 active:scale-98">
          {/* Cover image */}
          <div className="relative h-36 bg-gradient-to-br from-indigo-900/50 to-violet-900/50">
            {story.coverImageUrl ? (
              <Image
                src={story.coverImageUrl}
                alt={story.title}
                fill
                className="object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-4xl">
                {THEME_EMOJIS[story.input.theme] ?? "🌙"}
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-2 left-3">
              <span className="text-xs bg-black/40 backdrop-blur-sm text-white/70 px-2 py-0.5 rounded-full">
                {story.scenes.length} scenes
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="p-3 space-y-1">
            <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2">
              {story.title}
            </h3>
            <p className="text-white/40 text-xs flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(story.createdAt)} · {story.input.childName}
            </p>
          </div>
        </div>
      </Link>

      {/* Delete button */}
      <button
        onClick={(e) => { e.preventDefault(); onDelete(story.id); }}
        className="absolute top-2 right-2 w-8 h-8 rounded-xl bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/20 opacity-0 group-hover:opacity-100 transition-all"
        title="Delete story"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
}
