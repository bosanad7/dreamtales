"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";
import { BookOpen, Sparkles, Star, Moon, Music } from "lucide-react";
import { useStoryStore } from "@/store/storyStore";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const FEATURES = [
  { icon: "✍️", title: "AI Story Writing", desc: "Claude weaves today's moments into a magical tale" },
  { icon: "🎨", title: "Scene Illustrations", desc: "Pixar-style art generated for every scene" },
  { icon: "🎙️", title: "Voice Narration", desc: "Calm, warm narration via ElevenLabs" },
  { icon: "🎵", title: "Sleep Music", desc: "Soothing background music as you drift off" },
];

export default function HomePage() {
  const { stories, loadStories } = useStoryStore();

  useEffect(() => { loadStories(); }, [loadStories]);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="text-center space-y-6 pt-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="text-7xl"
          >
            🌙
          </motion.div>
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Magical bedtime stories,{" "}
              <span className="bg-gradient-to-r from-violet-400 to-indigo-300 bg-clip-text text-transparent">
                made from today
              </span>
            </h1>
            <p className="text-white/50 text-base leading-relaxed max-w-xs mx-auto">
              Share moments from your child's day. We'll turn them into a personalized bedtime adventure.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-col gap-3 items-center"
        >
          <Link href="/create" className="w-full">
            <Button size="xl" className="w-full flex items-center justify-center gap-3">
              <Sparkles className="w-5 h-5" />
              Create Tonight's Story
            </Button>
          </Link>
          {stories.length > 0 && (
            <Link href="/library">
              <Button variant="ghost" size="md" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {stories.length} saved {stories.length === 1 ? "story" : "stories"}
              </Button>
            </Link>
          )}
        </motion.div>
      </section>

      {/* Features */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="space-y-3"
      >
        <h2 className="text-white/40 text-xs font-semibold uppercase tracking-widest text-center">
          What's included
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + i * 0.08 }}
            >
              <Card className="p-4 space-y-2">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className="text-white font-semibold text-sm">{f.title}</p>
                  <p className="text-white/40 text-xs leading-relaxed mt-0.5">{f.desc}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* How it works */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="space-y-3"
      >
        <h2 className="text-white/40 text-xs font-semibold uppercase tracking-widest text-center">
          How it works
        </h2>
        <Card className="space-y-4">
          {[
            { step: "1", icon: <Star className="w-4 h-4" />, text: "Share 2–3 moments from today" },
            { step: "2", icon: <Sparkles className="w-4 h-4" />, text: "AI crafts a personalized story" },
            { step: "3", icon: <Moon className="w-4 h-4" />, text: "Enjoy with illustrations & narration" },
            { step: "4", icon: <Music className="w-4 h-4" />, text: "Drift off to sleep together" },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center text-violet-300 flex-shrink-0">
                {item.icon}
              </div>
              <p className="text-white/70 text-sm">{item.text}</p>
            </div>
          ))}
        </Card>
      </motion.section>

      {/* CTA bottom */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="text-center pb-4"
      >
        <p className="text-white/30 text-xs">
          Takes about 60 seconds · No account required
        </p>
      </motion.div>
    </div>
  );
}
