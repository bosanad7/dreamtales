import Anthropic from "@anthropic-ai/sdk";
import { StoryInput, StoryScene } from "./types";
import { v4 as uuidv4 } from "uuid";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface GeneratedStory {
  title: string;
  moral: string;
  scenes: Omit<StoryScene, "id" | "imageUrl" | "audioUrl" | "audioDuration">[];
}

const THEME_DETAILS: Record<string, string> = {
  space: "outer space, stars, planets, rockets, friendly aliens",
  animals: "friendly talking animals in a magical forest",
  ocean: "underwater world, colorful fish, mermaids, coral reefs",
  jungle: "tropical jungle, exotic animals, vines and waterfalls",
  school: "school adventures, friends, learning new things",
  magic: "enchanted kingdom, wizards, spells, magical creatures",
  dinosaurs: "prehistoric world, friendly dinosaurs, lush ancient forests",
  superheroes: "superpowers, saving the day, friendship and bravery",
};

export async function generateStory(input: StoryInput): Promise<GeneratedStory> {
  const themeDetail = THEME_DETAILS[input.theme] || THEME_DETAILS.magic;
  const isArabic = input.language === "ar";

  const prompt = `You are a magical children's bedtime story writer. Create a warm, soothing bedtime story for ${input.childName}, age ${input.childAge}.

Today's moments to weave into the story:
- Something funny that happened: "${input.funnyMoment}"
- Something that made them happy: "${input.happyMoment}"
${input.difficultMoment ? `- A difficult moment they faced: "${input.difficultMoment}"` : ""}

Story theme: ${themeDetail}

Requirements:
- Write in ${isArabic ? "Arabic" : "English"}, warm and child-friendly
- Age-appropriate vocabulary for a ${input.childAge}-year-old
- Structure: Beginning (magical setup), Middle (adventure with echoes of their real day), End (positive resolution, lesson, gentle sleep invitation)
- 6 scenes total, each 2-4 sentences
- Tone: magical, cozy, reassuring — perfect for falling asleep
- Weave today's real moments subtly into the story
- End with the child drifting off to sleep happily

Return ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "title": "Story title",
  "moral": "One gentle lesson or takeaway (1 sentence)",
  "scenes": [
    {
      "order": 1,
      "title": "Scene title",
      "text": "Scene narrative text (2-4 sentences)",
      "imagePrompt": "Detailed image generation prompt for a Pixar-style children's book illustration of this scene. Soft colors, warm lighting, magical atmosphere. No text in image."
    }
  ]
}`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type from Claude");

  const text = content.text.trim();
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}") + 1;
  const jsonStr = text.slice(jsonStart, jsonEnd);

  const parsed = JSON.parse(jsonStr) as GeneratedStory;

  return {
    ...parsed,
    scenes: parsed.scenes.map((scene) => ({
      ...scene,
      id: uuidv4(),
    })),
  };
}
