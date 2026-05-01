"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  List,
  Share2,
  ArrowLeft,
  Moon,
} from "lucide-react";
import { Story } from "@/lib/types";
import Button from "@/components/ui/Button";
import SceneView from "./SceneView";
import AudioPlayer from "./AudioPlayer";
import BackgroundMusic from "./BackgroundMusic";

interface StoryViewerProps {
  story: Story;
}

type ViewMode = "slideshow" | "autoplay";

export default function StoryViewer({ story }: StoryViewerProps) {
  const router = useRouter();
  const [mode, setMode] = useState<ViewMode>("slideshow");
  const [currentScene, setCurrentScene] = useState(0);
  const [direction, setDirection] = useState(1);
  const [showEndCard, setShowEndCard] = useState(false);
  const [autoPlaying, setAutoPlaying] = useState(false);

  const scene = story.scenes[currentScene];
  const isFirst = currentScene === 0;
  const isLast = currentScene === story.scenes.length - 1;

  const goNext = useCallback(() => {
    if (isLast) {
      setShowEndCard(true);
    } else {
      setDirection(1);
      setCurrentScene((s) => s + 1);
    }
  }, [isLast]);

  const goPrev = useCallback(() => {
    setShowEndCard(false);
    setDirection(-1);
    setCurrentScene((s) => Math.max(0, s - 1));
  }, []);

  // Auto-advance timer for slideshow (fallback when no audio)
  useEffect(() => {
    if (mode !== "autoplay" || !autoPlaying || scene?.audioUrl) return;
    const dur = (scene?.audioDuration ?? 10) * 1000;
    const timer = setTimeout(goNext, dur);
    return () => clearTimeout(timer);
  }, [mode, autoPlaying, currentScene, scene, goNext]);

  const startAutoPlay = () => {
    setMode("autoplay");
    setCurrentScene(0);
    setDirection(1);
    setShowEndCard(false);
    setAutoPlaying(true);
  };

  const SLIDE_VARIANTS = {
    enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -80 : 80, opacity: 0 }),
  };

  if (showEndCard) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center px-4"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="text-6xl"
        >
          🌙
        </motion.div>
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-white">The End</h2>
          <p className="text-white/60 text-base leading-relaxed max-w-xs">
            <span className="text-violet-300 font-medium">Tonight's lesson: </span>
            {story.moral}
          </p>
        </div>
        <p className="text-white/40 text-sm italic">
          Sweet dreams, {story.input.childName} 💫
        </p>
        <div className="flex gap-3 mt-2">
          <Button variant="secondary" onClick={() => { setCurrentScene(0); setShowEndCard(false); }}>
            Read Again
          </Button>
          <Button onClick={() => router.push("/library")}>
            Story Library
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Demo mode banner */}
      {story.isDemoMode && (
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2 text-amber-300 text-xs">
          <span>🧪</span>
          <span>Demo mode — add API keys to <code className="bg-white/10 px-1 rounded">.env.local</code> for AI-generated stories &amp; images</span>
        </div>
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>
        <h1 className="text-white font-semibold text-sm truncate max-w-[160px] text-center">
          {story.title}
        </h1>
        <div className="flex items-center gap-2">
          <BackgroundMusic />
          <button
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all"
            title="Share story"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 bg-white/5 rounded-xl p-1">
        <button
          onClick={() => setMode("slideshow")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === "slideshow" ? "bg-white/15 text-white" : "text-white/40 hover:text-white/70"
          }`}
        >
          <List className="w-3.5 h-3.5" />
          Slideshow
        </button>
        <button
          onClick={startAutoPlay}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === "autoplay" ? "bg-white/15 text-white" : "text-white/40 hover:text-white/70"
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          Auto-play
        </button>
      </div>

      {/* Scene */}
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentScene}
            custom={direction}
            variants={SLIDE_VARIANTS}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <SceneView
              scene={scene}
              sceneNumber={currentScene + 1}
              totalScenes={story.scenes.length}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Audio player — uses ElevenLabs audio if available, falls back to browser TTS */}
      <AudioPlayer
        audioUrl={scene.audioUrl}
        fallbackText={scene.text}
        language={story.input.language}
        autoPlay={mode === "autoplay"}
        onEnded={mode === "autoplay" ? goNext : undefined}
      />

      {/* Scene dots */}
      <div className="flex justify-center gap-1.5">
        {story.scenes.map((_, i) => (
          <button
            key={i}
            onClick={() => { setDirection(i > currentScene ? 1 : -1); setCurrentScene(i); }}
            className={`rounded-full transition-all duration-200 ${
              i === currentScene ? "w-5 h-2 bg-violet-400" : "w-2 h-2 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={goPrev}
          disabled={isFirst}
          className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/20 active:scale-95 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={goNext}
          className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-600 flex items-center justify-center gap-2 text-white font-medium shadow-lg shadow-violet-500/20 hover:shadow-violet-500/40 active:scale-95 transition-all"
        >
          {isLast ? (
            <>
              <Moon className="w-4 h-4" />
              The End
            </>
          ) : (
            <>
              Next
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
