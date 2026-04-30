/**
 * OpenAI DALL-E 3 image generation — server-side ONLY.
 * Client is lazy-initialised so the module can be imported at build time
 * without an API key present.
 */
import OpenAI from "openai";

function getClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set");
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// ─── Consistent illustration style applied to every image ────────────────────
const STYLE =
  "Children's book illustration. " +
  "Art style: soft painterly watercolor with a warm 3-D Pixar-inspired look. " +
  "Palette: deep jewel tones (indigo, violet, gold) on a dark sky background, gentle pastel highlights. " +
  "Lighting: cozy warm candlelight / moonlight glow, dreamy soft shadows. " +
  "Characters: cute expressive round-faced child, big bright eyes, safe and age-appropriate. " +
  "Mood: magical, comforting, bedtime-ready. " +
  "NO text, letters, numbers, or words anywhere in the image. " +
  "Ultra-detailed, storybook quality, 4K.";

const THEME_SETTING: Record<string, string> = {
  space:       "set in outer space — stars, planets, rocket ships, friendly glowing aliens",
  animals:     "set in an enchanted forest — talking animals, mossy trees, fireflies",
  ocean:       "set underwater — coral reefs, colorful fish, gentle mermaids, bioluminescent light",
  jungle:      "set in a tropical jungle — lush green canopy, exotic birds, cascading waterfalls",
  school:      "set at a magical school — whimsical classrooms, floating books, friendly teachers",
  magic:       "set in an enchanted kingdom — glowing spells, friendly wizards, fairy lights",
  dinosaurs:   "set in a prehistoric meadow — gentle dinosaurs, giant ferns, warm amber skies",
  superheroes: "set in a gleaming city — capes, gentle heroic acts, bright optimistic skies",
};

// ─── Scene image ─────────────────────────────────────────────────────────────

export async function generateSceneImage(
  imagePrompt: string,
  sceneTitle: string,
  theme: string,
  childName: string
): Promise<string> {
  const openai = getClient();
  const themeSetting = THEME_SETTING[theme] ?? THEME_SETTING.magic;

  const fullPrompt =
    `${STYLE} ` +
    `Theme world: ${themeSetting}. ` +
    `The main character is a young child named ${childName} — show them as the hero. ` +
    `Scene: "${sceneTitle}". ` +
    `Scene description: ${imagePrompt}`;

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: fullPrompt,
    n: 1,
    size: "1024x1024",
    quality: "standard",
    style: "vivid",
  });

  const url = response.data?.[0]?.url;
  if (!url) throw new Error("No image URL returned from DALL-E");
  return url;
}

// ─── Cover image ─────────────────────────────────────────────────────────────

export async function generateCoverImage(
  title: string,
  theme: string,
  childName: string
): Promise<string> {
  const openai = getClient();
  const themeSetting = THEME_SETTING[theme] ?? THEME_SETTING.magic;

  const prompt =
    `${STYLE} ` +
    `This is a children's storybook cover. ` +
    `Theme world: ${themeSetting}. ` +
    `The hero is a young child named ${childName}, shown in the center looking happy and adventurous. ` +
    `The composition should feel like a classic bedtime storybook cover: ` +
    `a large glowing moon in the background, twinkling stars, magical atmosphere. ` +
    `Title of the book: "${title}". ` +
    `The image should feel inviting, magical, and perfect for bedtime.`;

  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    n: 1,
    size: "1024x1024",
    quality: "standard",
    style: "vivid",
  });

  const url = response.data?.[0]?.url;
  if (!url) throw new Error("No cover image URL returned from DALL-E");
  return url;
}
