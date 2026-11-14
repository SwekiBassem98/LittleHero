import type { AvatarConfig } from "../characters/KidAvatar";
import type { SceneDirection } from "./directions";

/** Each page plays one beat; the animated scene is chosen from it. */
export const BEATS = ["start", "journey", "friend", "wonder", "problem", "idea", "brave", "almost", "celebrate", "end"] as const;
export type Beat = (typeof BEATS)[number];

export type Gender = "girl" | "boy" | "neutral";
export type StoryLang = "fr" | "ar";

export interface StoryPage {
  beat: Beat;
  text: string;
  /** How the page is staged. Older stories have none and use the beat's default. */
  scene?: SceneDirection;
}

/** On the "idea" page the child listening decides how the hero solves the problem. */
export interface StoryChoice {
  question: string;
  options: { label: string; text: string }[];
}

export interface Story {
  title: string;
  pages: StoryPage[];
  moral: string;
  choice?: StoryChoice;
  /** "ai" = written by Claude for this child; "offline" = built-in story engine. */
  source: "ai" | "offline";
}

/** Everything the story engine is told about the child. No photo, no surname. */
export interface StoryRequest {
  name: string;
  age: number;
  gender: Gender;
  traits: string[];
  themeId: string;
  value: string;
  /** A favourite toy, animal or thing to slip into the story (optional). */
  favorite: string;
  lang: StoryLang;
}

export interface SavedStory {
  id: string;
  createdAt: number;
  lang: StoryLang;
  themeId: string;
  hero: { name: string; age: number; avatar: AvatarConfig };
  dedication: string;
  dedicationFrom: string;
  /** Which option the child picked on the choice page (default: the first). */
  pick?: number;
  story: Story;
}
