"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { StoryInput, StoryTheme } from "@/lib/types";
import { useStoryStore } from "@/store/storyStore";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import StepIndicator from "./StepIndicator";
import ThemeCard from "./ThemeCard";
import { TextArea, SingleLineInput } from "./TextInput";

const TOTAL_STEPS = 4;

const STEP_VARIANTS = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export default function CreateStoryForm() {
  const router = useRouter();
  const { generateStory, isGenerating, progress } = useStoryStore();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  const [form, setForm] = useState<StoryInput>({
    childName: "",
    childAge: 5,
    theme: "magic",
    funnyMoment: "",
    happyMoment: "",
    difficultMoment: "",
    language: "en",
  });

  const update = (key: keyof StoryInput, value: string | number | StoryTheme) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const canProceed = () => {
    if (step === 0) return form.childName.trim().length > 1;
    if (step === 1) return form.funnyMoment.trim().length > 5;
    if (step === 2) return form.happyMoment.trim().length > 5;
    return true;
  };

  const next = () => {
    if (!canProceed()) return;
    setDirection(1);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  };

  const back = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleGenerate = async () => {
    try {
      const story = await generateStory(form);
      router.push(`/story/${story.id}`);
    } catch (err) {
      alert("Something went wrong. Please check your API keys and try again.");
      console.error(err);
    }
  };

  if (isGenerating) {
    const GEN_STEPS: { key: string; label: string; emoji: string }[] = [
      { key: "story",     label: "Generating story",      emoji: "✍️" },
      { key: "images",    label: "Creating scene images", emoji: "🎨" },
      { key: "narration", label: "Preparing narration",   emoji: "🎙️" },
      { key: "done",      label: "Saving story",          emoji: "💾" },
    ];

    const activeIndex = GEN_STEPS.findIndex((s) => s.key === progress?.step);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-2"
      >
        {/* Spinning star */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="text-5xl"
        >
          ✨
        </motion.div>

        {/* Current step message */}
        <div className="text-center space-y-1">
          <AnimatePresence mode="wait">
            <motion.h2
              key={progress?.message}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="text-xl font-bold text-white leading-snug"
            >
              {progress?.message ?? "Creating your magical story…"}
            </motion.h2>
          </AnimatePresence>
          <p className="text-white/40 text-xs">This takes about 30–60 seconds</p>
        </div>

        {/* Progress bar */}
        <ProgressBar value={progress?.progress ?? 0} className="w-full max-w-xs" />

        {/* Step list */}
        <div className="w-full max-w-xs space-y-2">
          {GEN_STEPS.map((s, i) => {
            const isDone    = activeIndex > i || progress?.step === "done";
            const isCurrent = activeIndex === i;
            return (
              <div
                key={s.key}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300 ${
                  isCurrent
                    ? "bg-violet-500/20 border border-violet-500/30"
                    : isDone
                    ? "bg-white/5 border border-white/0"
                    : "opacity-30"
                }`}
              >
                {/* Icon / checkmark */}
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0 bg-white/10">
                  {isDone && !isCurrent ? "✓" : s.emoji}
                </div>

                {/* Label */}
                <span
                  className={`text-sm font-medium flex-1 ${
                    isCurrent ? "text-white" : isDone ? "text-white/50" : "text-white/30"
                  }`}
                >
                  {s.label}
                </span>

                {/* Spinner on active */}
                {isCurrent && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full shrink-0"
                  />
                )}
              </div>
            );
          })}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <StepIndicator totalSteps={TOTAL_STEPS} currentStep={step} />

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={step}
          custom={direction}
          variants={STEP_VARIANTS}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <Card glow className="space-y-6">
            {step === 0 && (
              <>
                <div className="text-center space-y-1">
                  <p className="text-3xl">👶</p>
                  <h2 className="text-xl font-bold text-white">About your child</h2>
                  <p className="text-white/50 text-sm">Let's make this story just for them</p>
                </div>
                <SingleLineInput
                  label="Child's name"
                  emoji="✏️"
                  placeholder="e.g. Layla, Omar, Sophie..."
                  value={form.childName}
                  onChange={(e) => update("childName", e.target.value)}
                />
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-white font-semibold">
                    <span className="text-xl">🎂</span> Age
                  </label>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => update("childAge", Math.max(1, form.childAge - 1))}
                      className="w-10 h-10 rounded-xl bg-white/10 text-white text-xl flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all"
                    >
                      -
                    </button>
                    <span className="text-white text-2xl font-bold w-8 text-center">{form.childAge}</span>
                    <button
                      type="button"
                      onClick={() => update("childAge", Math.min(12, form.childAge + 1))}
                      className="w-10 h-10 rounded-xl bg-white/10 text-white text-xl flex items-center justify-center hover:bg-white/20 active:scale-95 transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-white font-semibold">
                    <span className="text-xl">🌍</span> Language
                  </label>
                  <div className="flex gap-2">
                    {(["en", "ar"] as const).map((lang) => (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => update("language", lang)}
                        className={`flex-1 py-2.5 rounded-xl font-medium transition-all text-sm ${
                          form.language === lang
                            ? "bg-violet-500 text-white"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        {lang === "en" ? "🇬🇧 English" : "🇸🇦 العربية"}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {step === 1 && (
              <>
                <div className="text-center space-y-1">
                  <p className="text-3xl">😄</p>
                  <h2 className="text-xl font-bold text-white">The funny moment</h2>
                  <p className="text-white/50 text-sm">What made everyone laugh today?</p>
                </div>
                <TextArea
                  label="Funny moment"
                  emoji="😂"
                  placeholder="e.g. They tried to put their shoes on the wrong feet and couldn't figure out why they felt funny..."
                  value={form.funnyMoment}
                  onChange={(e) => update("funnyMoment", e.target.value)}
                  rows={4}
                />
              </>
            )}

            {step === 2 && (
              <>
                <div className="text-center space-y-1">
                  <p className="text-3xl">🌟</p>
                  <h2 className="text-xl font-bold text-white">The happy moment</h2>
                  <p className="text-white/50 text-sm">What made {form.childName || "them"} smile today?</p>
                </div>
                <TextArea
                  label="Happy moment"
                  emoji="💛"
                  placeholder="e.g. They finally learned to ride their bike without training wheels..."
                  value={form.happyMoment}
                  onChange={(e) => update("happyMoment", e.target.value)}
                  rows={4}
                />
                <TextArea
                  label="A difficult moment (optional)"
                  emoji="💪"
                  hint="Challenges become lessons in the story"
                  placeholder="e.g. They had a disagreement with a friend at recess..."
                  value={form.difficultMoment}
                  onChange={(e) => update("difficultMoment", e.target.value)}
                  rows={3}
                />
              </>
            )}

            {step === 3 && (
              <>
                <div className="text-center space-y-1">
                  <p className="text-3xl">🎨</p>
                  <h2 className="text-xl font-bold text-white">Pick a theme</h2>
                  <p className="text-white/50 text-sm">
                    What world should {form.childName || "they"} adventure in tonight?
                  </p>
                </div>
                <ThemeCard selected={form.theme} onChange={(t) => update("theme", t)} />
              </>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex items-center gap-3">
        {step > 0 && (
          <Button variant="secondary" onClick={back} className="flex items-center gap-1.5">
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>
        )}

        {step < TOTAL_STEPS - 1 ? (
          <Button
            onClick={next}
            disabled={!canProceed()}
            className="flex-1 flex items-center justify-center gap-1.5"
            size="lg"
          >
            Continue
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleGenerate}
            className="flex-1 flex items-center justify-center gap-2"
            size="lg"
          >
            <Sparkles className="w-5 h-5" />
            Create My Story
          </Button>
        )}
      </div>
    </div>
  );
}
