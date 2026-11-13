// Structure only — every label lives in src/i18n/translations.ts
// (theme.<id>.title, trait.<id>, value.<id>, buddy.<id>.name, …).
import type { BuddyId } from "./characters/Buddy";

export interface Theme {
  id: string;
  /** The character who lives in this world and joins the hero. */
  buddy: BuddyId;
  from: string;
  to: string;
}

export const themes: Theme[] = [
  { id: "space", buddy: "bolt", from: "#4338ca", to: "#7c3aed" },
  { id: "pirate", buddy: "pinso", from: "#f97316", to: "#e11d48" },
  { id: "dinosaur", buddy: "trixie", from: "#059669", to: "#0f766e" },
  { id: "fairy", buddy: "champi", from: "#c026d3", to: "#7e22ce" },
  { id: "superhero", buddy: "zap", from: "#2563eb", to: "#7c3aed" },
  { id: "underwater", buddy: "plouf", from: "#0891b2", to: "#3730a3" },
  { id: "jungle", buddy: "kiki", from: "#4d7c0f", to: "#047857" },
  { id: "bedtime", buddy: "nour", from: "#1e293b", to: "#581c87" },
];

export const THEME_IDS = themes.map((t) => t.id);
export const themeById = (id: string) => themes.find((t) => t.id === id);

export const traits = [
  { id: "brave", emoji: "🦁" },
  { id: "curious", emoji: "🔍" },
  { id: "kind", emoji: "💖" },
  { id: "silly", emoji: "😂" },
  { id: "creative", emoji: "🎨" },
  { id: "energetic", emoji: "⚡" },
  { id: "bookworm", emoji: "📚" },
  { id: "dreamer", emoji: "🌙" },
  { id: "friendly", emoji: "🤝" },
  { id: "solver", emoji: "🧩" },
];
export const TRAIT_IDS = traits.map((t) => t.id);

/** The gentle lesson a parent can ask the story to carry. */
export const values = [
  { id: "courage", emoji: "🦸" },
  { id: "kindness", emoji: "🤗" },
  { id: "sharing", emoji: "🍪" },
  { id: "curiosity", emoji: "🔭" },
  { id: "perseverance", emoji: "🧗" },
  { id: "calm", emoji: "🍃" },
];
export const VALUE_IDS = values.map((v) => v.id);
