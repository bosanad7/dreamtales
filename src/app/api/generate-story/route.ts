import { NextRequest, NextResponse } from "next/server";
import { generateStory } from "@/lib/openrouter";
import { StoryInput } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const input = (await req.json()) as StoryInput;

    if (!input.childName || !input.theme || !input.funnyMoment || !input.happyMoment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const story = await generateStory(input);
    // isDemoMode is included in the response so the client can show a badge
    return NextResponse.json(story);
  } catch (error) {
    console.error("Story generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Story generation failed" },
      { status: 500 }
    );
  }
}
