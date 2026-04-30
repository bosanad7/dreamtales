import { NextRequest, NextResponse } from "next/server";
import { generateNarration } from "@/lib/elevenlabs";
import { StoryScene } from "@/lib/types";

interface RequestBody {
  storyId: string;
  scenes: StoryScene[];
}

// Estimate audio duration: ~130 words per minute for calm narration
function estimateDuration(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.ceil((words / 130) * 60);
}

export async function POST(req: NextRequest) {
  try {
    const { scenes } = (await req.json()) as RequestBody;

    if (!process.env.ELEVENLABS_API_KEY) {
      // Return scenes without audio if ElevenLabs not configured
      const scenesWithEstimates = scenes.map((scene) => ({
        ...scene,
        audioDuration: estimateDuration(scene.text),
      }));
      return NextResponse.json({ scenes: scenesWithEstimates, narrationSkipped: true });
    }

    const scenesWithAudio: StoryScene[] = [];

    for (const scene of scenes) {
      try {
        const audioBuffer = await generateNarration(scene.text);
        const base64Audio = audioBuffer.toString("base64");
        const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;

        scenesWithAudio.push({
          ...scene,
          audioUrl: audioDataUrl,
          audioDuration: estimateDuration(scene.text),
        });
      } catch (err) {
        console.error(`Narration failed for scene ${scene.id}:`, err);
        scenesWithAudio.push({
          ...scene,
          audioDuration: estimateDuration(scene.text),
        });
      }
    }

    return NextResponse.json({ scenes: scenesWithAudio });
  } catch (error) {
    console.error("Narration generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Narration generation failed" },
      { status: 500 }
    );
  }
}
