"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── ElevenLabs audio player (when audioUrl is a base64 data URL) ────────────

interface AudioPlayerProps {
  audioUrl: string | undefined;
  fallbackText?: string; // used for browser TTS when no audioUrl
  language?: string;     // ISO code: "en", "ar", etc.
  autoPlay?: boolean;
  onEnded?: () => void;
}

export function useAudioPlayer(
  audioUrl: string | undefined,
  autoPlay = false,
  onEnded?: () => void
) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    const handleEnded = () => { setIsPlaying(false); onEnded?.(); };
    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("durationchange", handleDurationChange);

    if (autoPlay) audio.play().then(() => setIsPlaying(true)).catch(() => {});

    return () => {
      audio.pause();
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("durationchange", handleDurationChange);
      audioRef.current = null;
    };
  }, [audioUrl, autoPlay, onEnded]);

  const play = useCallback(() => {
    audioRef.current?.play().then(() => setIsPlaying(true)).catch(() => {});
  }, []);
  const pause = useCallback(() => { audioRef.current?.pause(); setIsPlaying(false); }, []);
  const toggle = useCallback(() => { if (isPlaying) pause(); else play(); }, [isPlaying, play, pause]);

  return { isPlaying, duration, currentTime, play, pause, toggle };
}

// ─── Browser TTS (Web Speech API fallback) ───────────────────────────────────

export function useBrowserSpeech(
  text: string | undefined,
  language: string = "en",
  autoPlay = false,
  onEnded?: () => void,
) {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [supported] = useState(() => typeof window !== "undefined" && "speechSynthesis" in window);

  useEffect(() => {
    if (!supported || !text) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.85;
    utter.pitch = 1.05;
    utter.volume = 0.9;

    // Map our language code → BCP-47 tag the TTS engine expects
    const langTag =
      language === "ar" ? "ar-SA" :
      language === "en" ? "en-US" :
      language;
    utter.lang = langTag;

    // Pick the best voice for this language. Voices may not be loaded on the
    // first render (Chrome quirk) — getVoices() can return [] until the
    // `voiceschanged` event fires, but we still set utter.lang so the engine
    // picks a reasonable default.
    const pickVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;
      const langPrefix = langTag.split("-")[0]; // "ar" / "en"

      // Try exact-region match first, then any voice in that language
      const exact = voices.find((v) => v.lang === langTag);
      const sameLang = voices.find((v) => v.lang.startsWith(langPrefix));

      // English-only: prefer a soft female voice when available
      const preferredEn = langPrefix === "en"
        ? voices.find(
            (v) => v.lang.startsWith("en") &&
              /female|samantha|karen|victoria|moira/i.test(v.name),
          )
        : undefined;

      const chosen = preferredEn ?? exact ?? sameLang;
      if (chosen) utter.voice = chosen;
    };

    pickVoice();
    // Voices load asynchronously — re-pick once they're available
    window.speechSynthesis.onvoiceschanged = pickVoice;

    utter.onend = () => { setIsPlaying(false); onEnded?.(); };
    utter.onerror = () => setIsPlaying(false);
    utteranceRef.current = utter;

    if (autoPlay) {
      window.speechSynthesis.speak(utter);
      setIsPlaying(true);
    }

    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
      setIsPlaying(false);
    };
  }, [text, language, autoPlay, onEnded, supported]);

  const play = useCallback(() => {
    if (!utteranceRef.current || !supported) return;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utteranceRef.current);
    setIsPlaying(true);
  }, [supported]);

  const pause = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => { if (isPlaying) pause(); else play(); }, [isPlaying, play, pause]);

  return { isPlaying, supported, play, pause, toggle };
}

// ─── Unified AudioPlayer component ───────────────────────────────────────────

export default function AudioPlayer({ audioUrl, fallbackText, language = "en", autoPlay, onEnded }: AudioPlayerProps) {
  const elev = useAudioPlayer(audioUrl, autoPlay && !!audioUrl, audioUrl ? onEnded : undefined);
  const tts  = useBrowserSpeech(
    !audioUrl ? fallbackText : undefined,
    language,
    autoPlay && !audioUrl,
    !audioUrl ? onEnded : undefined,
  );

  const hasAudio = !!audioUrl;
  const isPlaying = hasAudio ? elev.isPlaying : tts.isPlaying;
  const toggle = hasAudio ? elev.toggle : tts.toggle;

  // Nothing to play and no TTS text
  if (!audioUrl && !fallbackText) return null;

  const progress = hasAudio && elev.duration > 0
    ? (elev.currentTime / elev.duration) * 100
    : 0;

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={toggle}
        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all active:scale-95 text-lg"
        aria-label={isPlaying ? "Pause" : "Play narration"}
        title={!hasAudio ? "Browser voice (demo mode)" : undefined}
      >
        {isPlaying ? "⏸" : "▶️"}
      </button>

      {hasAudio ? (
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-400 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : (
        <span className="text-white/30 text-xs italic flex-1">
          {tts.supported ? "🗣 Browser voice narration" : "Text narration (no audio available)"}
        </span>
      )}
    </div>
  );
}
