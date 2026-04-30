"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

// Uses a soft royalty-free lullaby available via URL
const MUSIC_URL = "https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3";

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    audio.loop = true;
    audio.volume = 0.12;
    // Use a gentle sine wave oscillator via Web Audio API instead of external URL
    audioRef.current = audio;
    return () => { audio.pause(); };
  }, []);

  // Generate soft ambient music via Web Audio API
  useEffect(() => {
    if (!started) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const notes = [261.63, 293.66, 329.63, 349.23, 392.0]; // C D E F G

    const oscillators: OscillatorNode[] = [];
    const masterGain = ctx.createGain();
    masterGain.gain.value = muted ? 0 : 0.04;
    masterGain.connect(ctx.destination);

    const playNote = (freq: number, startTime: number, dur: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.5);
      gain.gain.linearRampToValueAtTime(0, startTime + dur - 0.3);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(startTime);
      osc.stop(startTime + dur);
      oscillators.push(osc);
    };

    const now = ctx.currentTime;
    const pattern = [0, 2, 4, 2, 1, 3, 2, 0];
    pattern.forEach((noteIdx, i) => {
      playNote(notes[noteIdx], now + i * 2, 2.5);
      playNote(notes[noteIdx] / 2, now + i * 2, 3);
    });

    return () => {
      oscillators.forEach((o) => { try { o.stop(); } catch {} });
      ctx.close();
    };
  }, [started, muted]);

  const toggle = () => {
    setMuted((m) => !m);
    if (!started) setStarted(true);
  };

  return (
    <button
      onClick={toggle}
      title={muted ? "Unmute music" : "Mute music"}
      className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-95"
    >
      {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
    </button>
  );
}
