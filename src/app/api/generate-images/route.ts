/**
 * POST /api/generate-images
 *
 * Streams Server-Sent Events so the client gets real-time per-scene progress.
 * Event types:
 *   { type: "progress", index: number, total: number, sceneTitle: string }
 *   { type: "image",    index: number, sceneId: string, imageUrl: string }
 *   { type: "cover",    coverImageUrl: string }
 *   { type: "done",     scenes: StoryScene[], coverImageUrl: string, isPlaceholder?: boolean }
 *   { type: "error",    message: string }
 */
import { NextRequest } from "next/server";
import { generateSceneImage, generateCoverImage } from "@/lib/openai";
import { generatePlaceholderSvg } from "@/lib/placeholderImage";
import { StoryScene } from "@/lib/types";

interface RequestBody {
  scenes: StoryScene[];
  theme: string;
  title: string;
  childName: string;
}

const enc = new TextEncoder();
function sseEvent(data: object): Uint8Array {
  return enc.encode(`data: ${JSON.stringify(data)}\n\n`);
}

export async function POST(req: NextRequest) {
  const { scenes, theme, title, childName } = (await req.json()) as RequestBody;
  const hasOpenAI = !!process.env.OPENAI_API_KEY;

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // ── Placeholder mode ──────────────────────────────────────────────
        if (!hasOpenAI) {
          console.log("[DreamTales] No OPENAI_API_KEY — using SVG placeholder images");
          const scenesOut: StoryScene[] = scenes.map((scene) => ({
            ...scene,
            imageUrl: generatePlaceholderSvg(theme, scene.title, scene.order),
          }));
          const coverImageUrl = generatePlaceholderSvg(theme, title, 0);
          controller.enqueue(sseEvent({ type: "done", scenes: scenesOut, coverImageUrl, isPlaceholder: true }));
          return; // `finally` will close the controller
        }

        // ── DALL-E 3 — one image at a time with progress events ───────────
        const scenesOut: StoryScene[] = [...scenes];

        for (let i = 0; i < scenes.length; i++) {
          const scene = scenes[i];
          controller.enqueue(
            sseEvent({ type: "progress", index: i, total: scenes.length, sceneTitle: scene.title })
          );

          try {
            const imageUrl = await generateSceneImage(
              scene.imagePrompt,
              scene.title,
              theme,
              childName
            );
            scenesOut[i] = { ...scenesOut[i], imageUrl };
            controller.enqueue(sseEvent({ type: "image", index: i, sceneId: scene.id, imageUrl }));
          } catch (err) {
            console.error(`[DreamTales] Image ${i + 1} failed:`, err);
            // Use placeholder for this scene so the rest continue
            scenesOut[i] = {
              ...scenesOut[i],
              imageUrl: generatePlaceholderSvg(theme, scene.title, scene.order),
            };
          }
        }

        // Cover image
        controller.enqueue(
          sseEvent({ type: "progress", index: scenes.length, total: scenes.length, sceneTitle: "cover" })
        );
        let coverImageUrl: string;
        try {
          coverImageUrl = await generateCoverImage(title, theme, childName);
        } catch {
          coverImageUrl = generatePlaceholderSvg(theme, title, 0);
        }
        controller.enqueue(sseEvent({ type: "cover", coverImageUrl }));
        controller.enqueue(sseEvent({ type: "done", scenes: scenesOut, coverImageUrl }));
      } catch (err) {
        controller.enqueue(
          sseEvent({ type: "error", message: err instanceof Error ? err.message : "Image generation failed" })
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
