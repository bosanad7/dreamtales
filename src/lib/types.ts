export type StoryTheme =
  | "space"
  | "animals"
  | "ocean"
  | "jungle"
  | "school"
  | "magic"
  | "dinosaurs"
  | "superheroes";

export type StoryLanguage = "en" | "ar";

export interface StoryInput {
  childName: string;
  childAge: number;
  theme: StoryTheme;
  funnyMoment: string;
  happyMoment: string;
  difficultMoment?: string;
  language: StoryLanguage;
}

export interface StoryScene {
  id: string;
  order: number;
  title: string;
  text: string;
  imagePrompt: string;
  imageUrl?: string;
  audioUrl?: string;
  audioDuration?: number;
}

export interface Story {
  id: string;
  createdAt: string;
  input: StoryInput;
  title: string;
  moral: string;
  scenes: StoryScene[];
  coverImageUrl?: string;
  status: "generating" | "ready" | "error";
  isDemoMode?: boolean; // true when generated without API keys
}

export interface GenerationProgress {
  step: "story" | "images" | "narration" | "done";
  message: string;
  progress: number; // 0-100
}
