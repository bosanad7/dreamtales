"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, Plus } from "lucide-react";
import { useStoryStore } from "@/store/storyStore";
import StoryCard from "./StoryCard";
import Button from "@/components/ui/Button";

export default function StoryLibrary() {
  const { stories, loadStories, deleteStory } = useStoryStore();

  useEffect(() => { loadStories(); }, [loadStories]);

  if (stories.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center min-h-[50vh] gap-6 text-center"
      >
        <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center text-4xl">
          📚
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">No stories yet</h2>
          <p className="text-white/40 text-sm max-w-xs">
            Create your first personalized bedtime story and it will appear here.
          </p>
        </div>
        <Link href="/create">
          <Button size="lg" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create First Story
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-violet-400" />
            Story Library
          </h1>
          <p className="text-white/40 text-sm mt-0.5">{stories.length} bedtime adventure{stories.length !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/create">
          <Button size="sm" className="flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" />
            New
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <AnimatePresence>
          {stories.map((story) => (
            <StoryCard key={story.id} story={story} onDelete={deleteStory} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
