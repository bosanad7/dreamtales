import { create } from "zustand";
import { Story, StoryInput, GenerationProgress } from "@/lib/types";
import { saveStoryToLocal, getStoriesFromLocal, deleteStoryFromLocal } from "@/lib/storage";
import { v4 as uuidv4 } from "uuid";

// SSE event shapes coming from /api/generate-images
interface SseProgress { type: "progress"; index: number; total: number; sceneTitle: string }
interface SseImage    { type: "image";    index: number; sceneId: string; imageUrl: string }
interface SseCover    { type: "cover";    coverImageUrl: string }
interface SseDone     { type: "done";     scenes: Story["scenes"]; coverImageUrl: string; isPlaceholder?: boolean }
interface SseError    { type: "error";    message: string }
type SseEvent = SseProgress | SseImage | SseCover | SseDone | SseError;

// Parse SSE text chunk → events (handles partial chunks)
function parseSseChunk(chunk: string): SseEvent[] {
  return chunk
    .split("\n\n")
    .map((block) => block.trim())
    .filter((block) => block.startsWith("data: "))
    .map((block) => {
      try { return JSON.parse(block.slice(6)) as SseEvent; }
      catch { return null; }
    })
    .filter((e): e is SseEvent => e !== null);
}

interface StoryStore {
  stories: Story[];
  currentStory: Story | null;
  progress: GenerationProgress | null;
  isGenerating: boolean;

  loadStories: () => void;
  setCurrentStory: (story: Story | null) => void;
  deleteStory: (id: string) => void;
  generateStory: (input: StoryInput) => Promise<Story>;
}

export const useStoryStore = create<StoryStore>((set) => ({
  stories: [],
  currentStory: null,
  progress: null,
  isGenerating: false,

  loadStories: () => set({ stories: getStoriesFromLocal() }),
  setCurrentStory: (story) => set({ currentStory: story }),
  deleteStory: (id) => { deleteStoryFromLocal(id); set({ stories: getStoriesFromLocal() }); },

  generateStory: async (input: StoryInput): Promise<Story> => {
    const storyId = uuidv4();

    const setProgress = (p: GenerationProgress) => set({ progress: p });

    set({
      isGenerating: true,
      progress: { step: "story", message: "Generating story…", progress: 2 },
    });

    try {
      // ── Step 1: Story text ─────────────────────────────────────────────
      setProgress({ step: "story", message: "✍️ Writing your personalised story…", progress: 5 });

      const storyRes = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!storyRes.ok) throw new Error(await storyRes.text());
      const { title, moral, scenes, isDemoMode } = await storyRes.json();

      setProgress({ step: "story", message: "✍️ Story written!", progress: 25 });

      const partialStory: Story = {
        id: storyId,
        createdAt: new Date().toISOString(),
        input,
        title,
        moral,
        scenes,
        isDemoMode: !!isDemoMode,
        status: "generating",
      };
      saveStoryToLocal(partialStory);

      // ── Step 2: Images via SSE stream ──────────────────────────────────
      setProgress({ step: "images", message: "🎨 Preparing scene illustrations…", progress: 28 });

      const imageRes = await fetch("/api/generate-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenes, theme: input.theme, title, childName: input.childName }),
      });
      if (!imageRes.ok || !imageRes.body) throw new Error("Image generation request failed");

      const reader = imageRes.body.getReader();
      const decoder = new TextDecoder();
      let scenesWithImages: Story["scenes"] = [...scenes];
      let coverImageUrl = "";
      let leftover = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const raw = leftover + decoder.decode(value, { stream: true });
        // SSE events are separated by \n\n; keep any trailing partial event
        const lastSep = raw.lastIndexOf("\n\n");
        if (lastSep === -1) { leftover = raw; continue; }
        const complete = raw.slice(0, lastSep + 2);
        leftover = raw.slice(lastSep + 2);

        for (const evt of parseSseChunk(complete)) {
          if (evt.type === "progress") {
            const iscover = evt.sceneTitle === "cover";
            const pct = iscover
              ? 58
              : 28 + Math.round((evt.index / Math.max(evt.total, 1)) * 28);
            setProgress({
              step: "images",
              message: iscover
                ? `🎨 Painting cover illustration…`
                : `🎨 Scene ${evt.index + 1} of ${evt.total} — "${evt.sceneTitle}"`,
              progress: pct,
            });
          } else if (evt.type === "image") {
            scenesWithImages = scenesWithImages.map((s) =>
              s.id === evt.sceneId ? { ...s, imageUrl: evt.imageUrl } : s
            );
            // Persist partial state so library updates in real time
            saveStoryToLocal({ ...partialStory, scenes: scenesWithImages, coverImageUrl });
          } else if (evt.type === "cover") {
            coverImageUrl = evt.coverImageUrl;
          } else if (evt.type === "done") {
            scenesWithImages = evt.scenes;
            coverImageUrl = evt.coverImageUrl;
          } else if (evt.type === "error") {
            console.error("[DreamTales] Image SSE error:", evt.message);
          }
        }
      }

      const storyWithImages: Story = {
        ...partialStory,
        scenes: scenesWithImages,
        coverImageUrl,
      };
      saveStoryToLocal(storyWithImages);

      // ── Step 3: Narration ──────────────────────────────────────────────
      setProgress({ step: "narration", message: "🎙️ Preparing narration…", progress: 62 });

      const narrationRes = await fetch("/api/generate-narration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storyId, scenes: scenesWithImages }),
      });
      if (!narrationRes.ok) throw new Error("Narration request failed");
      const { scenes: scenesWithAudio } = await narrationRes.json();

      setProgress({ step: "narration", message: "🎙️ Narration ready!", progress: 90 });

      // ── Step 4: Save ───────────────────────────────────────────────────
      setProgress({ step: "done", message: "💾 Saving your story…", progress: 95 });

      const finalStory: Story = {
        ...storyWithImages,
        scenes: scenesWithAudio,
        status: "ready",
      };
      saveStoryToLocal(finalStory);

      setProgress({ step: "done", message: "🌙 Your story is ready!", progress: 100 });
      set({
        currentStory: finalStory,
        stories: getStoriesFromLocal(),
        isGenerating: false,
      });

      return finalStory;
    } catch (error) {
      set({ isGenerating: false, progress: null });
      throw error;
    }
  },
}));
