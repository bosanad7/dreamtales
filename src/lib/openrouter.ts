/**
 * OpenRouter client — server-side ONLY.
 * OPENROUTER_API_KEY is read from process.env and never sent to the browser.
 * Falls back to a built-in template story when the key is absent (demo mode).
 */

import { StoryInput, StoryScene } from "./types";
import { v4 as uuidv4 } from "uuid";

const OPENROUTER_BASE = "https://openrouter.ai/api/v1";
const LLM_MODEL = process.env.OPENROUTER_MODEL ?? "anthropic/claude-sonnet-4.5";

interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}
interface OpenRouterResponse {
  choices: { message: { content: string } }[];
}

async function chatCompletion(messages: OpenRouterMessage[], maxTokens = 1500): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is not set");

  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "DreamTales Bedtime Stories",
    },
    body: JSON.stringify({ model: LLM_MODEL, messages, max_tokens: maxTokens, temperature: 0.85 }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`OpenRouter error ${res.status}: ${body}`);
  }

  const data = (await res.json()) as OpenRouterResponse;
  const content = data.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenRouter");
  return content;
}

// ─── Theme config ────────────────────────────────────────────────────────────

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

const THEME_SETTING: Record<string, string> = {
  space: "aboard a cozy starship drifting through the galaxy",
  animals: "deep in the Whispering Forest where animals can speak",
  ocean: "in the glittering Coral Kingdom beneath the waves",
  jungle: "in the sunlit canopy of the Emerald Jungle",
  school: "at the magical Moonbeam Academy",
  magic: "in the enchanted Kingdom of Starlight",
  dinosaurs: "in the lush valleys of the Prehistoric Meadows",
  superheroes: "in the sparkling city of Sunhaven",
};

// ─── Types ───────────────────────────────────────────────────────────────────

export interface GeneratedStory {
  title: string;
  moral: string;
  isDemoMode?: boolean;
  scenes: Omit<StoryScene, "imageUrl" | "audioUrl" | "audioDuration">[];
}

// ─── Demo / template fallback (no API key needed) ────────────────────────────

function buildDemoStory(input: StoryInput): GeneratedStory {
  const { childName, theme, funnyMoment, happyMoment, difficultMoment, childAge } = input;
  const setting = THEME_SETTING[theme] ?? THEME_SETTING.magic;
  const detail = THEME_DETAILS[theme] ?? THEME_DETAILS.magic;

  // Trim moments to a short phrase for embedding in story text
  const funnyShort = funnyMoment.split(/[.,!?]/)[0].trim().toLowerCase();
  const happyShort = happyMoment.split(/[.,!?]/)[0].trim().toLowerCase();
  const difficultShort = difficultMoment
    ? difficultMoment.split(/[.,!?]/)[0].trim().toLowerCase()
    : null;

  const scenes: GeneratedStory["scenes"] = [
    {
      id: uuidv4(),
      order: 1,
      title: "The Journey Begins",
      text: `As the moon climbed into the velvet sky, ${childName} closed their eyes and found themselves ${setting}. Everything glittered and hummed with gentle magic, just waiting to be explored. A soft breeze carried the scent of adventure — and it smelled wonderful.`,
      imagePrompt: `Pixar-style children's book illustration: ${detail}, a young child just arriving in a magical world, wide eyes full of wonder, warm soft lighting, pastel colors, dreamy atmosphere`,
    },
    {
      id: uuidv4(),
      order: 2,
      title: "A Funny Discovery",
      text: `Not long into the journey, something delightfully silly happened — it reminded ${childName} of when ${funnyShort}. Everyone burst into warm laughter that echoed through the magical land. Laughter, they discovered, was the best kind of magic of all.`,
      imagePrompt: `Pixar-style children's book illustration: ${detail}, a child laughing joyfully with magical friendly creatures, bright cheerful scene, soft watercolor tones, whimsical`,
    },
    {
      id: uuidv4(),
      order: 3,
      title: "The Heart of the Adventure",
      text: `${childName} journeyed deeper into the wonder${difficultShort ? `, and soon came across a challenge that felt a little like when ${difficultShort}` : ""}. But ${childAge <= 5 ? "with a big brave heart" : "with quiet courage"}, ${childName} took a deep breath and tried again. Sometimes the hardest steps lead to the most beautiful places.`,
      imagePrompt: `Pixar-style children's book illustration: ${detail}, a child facing a gentle challenge with determination, supportive magical friends nearby, warm encouraging light, soft colors`,
    },
    {
      id: uuidv4(),
      order: 4,
      title: "The Happiest Moment",
      text: `Then came the moment that made ${childName}'s heart soar — a feeling just like when ${happyShort}. The whole magical world seemed to celebrate along, with twinkling lights and happy sounds. ${childName} felt proud, warm, and perfectly happy.`,
      imagePrompt: `Pixar-style children's book illustration: ${detail}, a child in a peak moment of joy and triumph, magical celebration all around, glowing warm light, confetti of stars, beautiful`,
    },
    {
      id: uuidv4(),
      order: 5,
      title: "New Friends Say Goodnight",
      text: `As the adventure drew to a close, ${childName}'s new friends gathered close to say goodnight. They promised the magic would always be there, waiting in dreams. "Come back tomorrow," they whispered, "we'll be right here."`,
      imagePrompt: `Pixar-style children's book illustration: ${detail}, magical friends gathered around the child waving goodbye, twilight colors, soft purple and gold sky, peaceful and tender`,
    },
    {
      id: uuidv4(),
      order: 6,
      title: "Drifting Off to Sleep",
      text: `${childName} floated gently back to their cozy bed, wrapped in the warmth of a wonderful day. Their eyelids grew heavy with happy memories. And as the stars outside kept watch, ${childName} drifted into the sweetest, most peaceful sleep — full of magic and love.`,
      imagePrompt: `Pixar-style children's book illustration: a child sleeping peacefully in a cozy bed, moonlight through the window, soft stars and the hint of ${theme} magic in the gentle glow, utterly peaceful`,
    },
  ];

  return {
    title: `${childName} and the ${theme.charAt(0).toUpperCase() + theme.slice(1)} Adventure`,
    moral: "Every day holds magic — in the funny moments, the happy ones, and the brave ones too.",
    isDemoMode: true,
    scenes,
  };
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function generateStory(input: StoryInput): Promise<GeneratedStory> {
  // Demo mode: no API key → use template story
  if (!process.env.OPENROUTER_API_KEY) {
    console.log("[DreamTales] No OPENROUTER_API_KEY — using demo story template");
    return buildDemoStory(input);
  }

  const themeDetail = THEME_DETAILS[input.theme] ?? THEME_DETAILS.magic;
  const isArabic = input.language === "ar";

  const userPrompt = `You are a magical children's bedtime story writer. Create a warm, soothing bedtime story for ${input.childName}, age ${input.childAge}.

Today's moments to weave into the story:
- Something funny that happened: "${input.funnyMoment}"
- Something that made them happy: "${input.happyMoment}"
${input.difficultMoment ? `- A difficult moment they faced: "${input.difficultMoment}"` : ""}

Story theme: ${themeDetail}

Requirements:
- Write in ${isArabic ? "Arabic" : "English"}, warm and child-friendly
- Age-appropriate vocabulary for a ${input.childAge}-year-old
- Structure: Beginning (magical setup) → Middle (adventure echoing their real day) → End (positive resolution + gentle sleep invitation)
- Exactly 6 scenes, each 2–4 sentences
- Tone: magical, cozy, reassuring — perfect for falling asleep
- Weave today's real moments subtly into the story
- End with the child character drifting peacefully to sleep

Return ONLY valid JSON, no markdown fences, no explanation:
{
  "title": "Story title",
  "moral": "One gentle lesson (1 sentence)",
  "scenes": [
    {
      "id": "scene-1",
      "order": 1,
      "title": "Scene title",
      "text": "Scene narrative (2-4 sentences)",
      "imagePrompt": "Detailed DALL-E prompt: Pixar-style children's book illustration, soft watercolor, warm lighting, no text in image."
    }
  ]
}`;

  const rawText = await chatCompletion([{ role: "user", content: userPrompt }], 1500);
  const jsonStart = rawText.indexOf("{");
  const jsonEnd = rawText.lastIndexOf("}") + 1;
  if (jsonStart === -1 || jsonEnd === 0) throw new Error("No JSON found in model response");

  const parsed = JSON.parse(rawText.slice(jsonStart, jsonEnd)) as GeneratedStory;
  return {
    ...parsed,
    scenes: parsed.scenes.map((scene, i) => ({
      ...scene,
      id: scene.id ?? uuidv4(),
      order: scene.order ?? i + 1,
    })),
  };
}
