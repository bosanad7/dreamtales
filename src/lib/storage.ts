import { Story } from "./types";

const STORAGE_KEY = "bedtime_stories";

export function getStoriesFromLocal(): Story[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Story[]) : [];
  } catch {
    return [];
  }
}

export function saveStoryToLocal(story: Story): void {
  if (typeof window === "undefined") return;
  const stories = getStoriesFromLocal();
  const existing = stories.findIndex((s) => s.id === story.id);
  if (existing >= 0) {
    stories[existing] = story;
  } else {
    stories.unshift(story);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
}

export function getStoryFromLocal(id: string): Story | null {
  const stories = getStoriesFromLocal();
  return stories.find((s) => s.id === id) ?? null;
}

export function deleteStoryFromLocal(id: string): void {
  const stories = getStoriesFromLocal().filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stories));
}
