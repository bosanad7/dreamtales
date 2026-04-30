"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { StoryScene } from "@/lib/types";

interface SceneViewProps {
  scene: StoryScene;
  sceneNumber: number;
  totalScenes: number;
}

export default function SceneView({ scene, sceneNumber, totalScenes }: SceneViewProps) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isDataUrl = scene.imageUrl?.startsWith("data:");
  const hasImage  = !!scene.imageUrl && !imgError;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="flex flex-col h-full"
    >
      {/* Scene image */}
      <div className="relative flex-1 rounded-2xl overflow-hidden bg-white/5 min-h-[280px]">
        {/* Loading shimmer — shown until image paints */}
        <AnimatePresence>
          {(!imgLoaded || !hasImage) && (
            <motion.div
              key="shimmer"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="text-5xl opacity-30"
              >
                🌙
              </motion.div>
              {hasImage && !isDataUrl && (
                <p className="text-white/25 text-xs">Loading illustration…</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Actual image */}
        {hasImage && (
          isDataUrl ? (
            // SVG data URL — Next/Image can't optimize these
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={scene.imageUrl}
              alt={scene.title}
              className="absolute inset-0 w-full h-full object-cover"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          ) : (
            <Image
              src={scene.imageUrl!}
              alt={scene.title}
              fill
              className={`object-cover transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
              priority
              unoptimized
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          )
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-3 right-3 bg-black/40 backdrop-blur-sm rounded-full px-2.5 py-1 text-white/70 text-xs">
          {sceneNumber} / {totalScenes}
        </div>
      </div>

      {/* Scene text */}
      <div className="pt-5 space-y-2">
        <h3 className="text-violet-300 text-sm font-semibold uppercase tracking-widest">
          {scene.title}
        </h3>
        <p className="text-white text-lg leading-relaxed font-light">{scene.text}</p>
      </div>
    </motion.div>
  );
}
