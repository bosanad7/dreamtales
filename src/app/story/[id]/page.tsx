"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { getStoryFromLocal } from "@/lib/storage";
import { Story } from "@/lib/types";
import StoryViewer from "@/components/story/StoryViewer";

export default function StoryPage() {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const found = getStoryFromLocal(id);
    setStory(found);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-4xl"
        >
          🌙
        </motion.div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <p className="text-5xl">😴</p>
        <h2 className="text-xl font-bold text-white">Story not found</h2>
        <p className="text-white/40 text-sm">This story may have been deleted.</p>
        <Link href="/library" className="text-violet-400 hover:text-violet-300 text-sm underline">
          Back to library
        </Link>
      </div>
    );
  }

  return <StoryViewer story={story} />;
}
