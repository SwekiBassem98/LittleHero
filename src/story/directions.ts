import type { BuddyId } from "../characters/Buddy";
import { BUDDY_IDS } from "../characters/Buddy";
import type { Beat } from "./types";

/**
 * A scene direction is the "film script" of one page: where we are, what time
 * it is, what the hero and the companion are doing, which objects are around,
 * who drops by, and what the air is full of. The story engines write one per
 * page, and Scene.tsx stages it.
 */
export const PLACES = ["home", "world", "near", "far"] as const;
export const TIMES = ["day", "sunset", "night"] as const;
export const HERO_ACTS = ["stand", "wave", "walk", "run", "jump", "fly", "think", "cheer", "sleep", "hug", "look"] as const;
export const BUDDY_ACTS = ["none", "enter", "wave", "scared", "think", "cheer", "dance", "sleep", "walk", "fly"] as const;
export const EFFECTS = ["none", "sparkles", "rain", "wind", "confetti", "hearts", "glow", "shake", "bubbles"] as const;

export interface SceneDirection {
  /** home = the child's bedroom · world = wide view · near / far = two close-ups of the world */
  place: (typeof PLACES)[number];
  time: (typeof TIMES)[number];
  hero: (typeof HERO_ACTS)[number];
  buddy: (typeof BUDDY_ACTS)[number];
  /** Up to three objects standing in the scene, each one emoji. */
  props: string[];
  effect: (typeof EFFECTS)[number];
  /** Other members of the cast dropping by in the background. */
  guests: BuddyId[];
  /** A comic-book sound word, e.g. "WOOOSH !". */
  sfx: string;
  /** A few words in the companion's speech bubble. */
  says: string;
}

type Partial_ = Partial<SceneDirection>;
const base: SceneDirection = { place: "world", time: "day", hero: "stand", buddy: "none", props: [], effect: "none", guests: [], sfx: "", says: "" };

/** What a beat looks like when nothing more specific is known. */
const byBeat: Record<Beat, Partial_> = {
  start: { place: "home", hero: "wave" },
  journey: { hero: "walk" },
  friend: { place: "near", hero: "wave", buddy: "enter" },
  wonder: { hero: "jump", buddy: "dance", effect: "sparkles" },
  problem: { place: "far", hero: "look", buddy: "scared", effect: "wind" },
  idea: { place: "near", hero: "think", buddy: "think" },
  brave: { hero: "run", buddy: "walk" },
  almost: { place: "far", time: "sunset", hero: "jump", buddy: "cheer" },
  celebrate: { hero: "cheer", buddy: "cheer", effect: "confetti" },
  end: { place: "home", time: "night", hero: "wave", buddy: "wave", effect: "hearts" },
};

export const defaultDirection = (beat: Beat): SceneDirection => ({ ...base, ...byBeat[beat] });

/** Hand-directed scenes for the built-in stories: one per beat, per world. */
const authored: Record<string, Partial<Record<Beat, Partial_>>> = {
  space: {
    start: { time: "night", hero: "look", props: ["🔭", "🧸"], effect: "sparkles" },
    journey: { hero: "fly", props: ["🚀"], effect: "wind" },
    friend: { props: ["🪐"] },
    wonder: { props: ["🌙", "✨"] },
    problem: { props: ["☄️", "🪨", "☄️"], effect: "shake" },
    idea: { props: ["🗺️"] },
    brave: { props: ["☄️"], effect: "wind" },
    almost: { time: "night", props: ["⛰️", "⭐"], effect: "glow" },
    celebrate: { props: ["🌟", "⭐", "✨"], guests: ["nour"] },
    end: { props: ["🚀"] },
  },
  pirate: {
    start: { place: "far", hero: "look", props: ["🍾", "🗺️"] },
    journey: { hero: "wave", props: ["⚓", "🧭"], effect: "wind" },
    friend: { props: ["🪣"] },
    wonder: { props: ["🐬", "🐬"], effect: "bubbles" },
    problem: { place: "world", time: "night", props: ["🌩️", "🌊"], effect: "rain" },
    idea: { props: ["🧭"] },
    brave: { props: ["⛵"], effect: "wind" },
    almost: { props: ["🏝️", "⛏️"] },
    celebrate: { place: "far", props: ["💎", "🌈", "👑"], guests: ["plouf"] },
    end: { props: ["🐚"] },
  },
  dinosaur: {
    start: { place: "world", hero: "look", props: ["🔍", "🎩"] },
    journey: { props: ["🐾", "🌿", "🐾"] },
    friend: { props: ["🪨"] },
    wonder: { props: ["🦕"] },
    problem: { place: "near", props: ["💧", "🐾"], effect: "rain" },
    idea: { props: ["📒"] },
    brave: { props: ["🌿"] },
    almost: { time: "night", hero: "look", buddy: "walk", props: ["🔦", "🕳️"], effect: "glow" },
    celebrate: { props: ["🌙", "🥚", "🦖"], guests: ["kiki"] },
    end: { props: ["🔍"] },
  },
  fairy: {
    start: { place: "near", hero: "look", props: ["🚪", "🌼"] },
    journey: { props: ["🍃", "🌸"], effect: "sparkles" },
    friend: { props: ["🍄"] },
    wonder: { props: ["🦉", "🌷", "🐌"], guests: ["nour"] },
    problem: { props: ["🥀", "🕸️"] },
    idea: { props: ["🪄"] },
    brave: { hero: "walk", props: ["🍃"] },
    almost: { hero: "look", buddy: "think", props: ["⛲"] },
    celebrate: { place: "far", buddy: "dance", props: ["⛲", "🎶", "💧"] },
    end: { props: ["🌸"] },
  },
  superhero: {
    start: { hero: "look", props: ["⭐"], effect: "sparkles" },
    journey: { hero: "fly", props: ["☁️"], effect: "wind" },
    friend: { props: ["📡"] },
    wonder: { props: ["🏢"] },
    problem: { props: ["🌩️", "☁️"], effect: "shake" },
    idea: { props: ["💭"] },
    brave: { hero: "fly", buddy: "fly", effect: "wind" },
    almost: { time: "day", hero: "fly", props: ["🌩️"], effect: "rain" },
    celebrate: { props: ["🌈", "☀️"], guests: ["lumi"] },
    end: { props: ["⭐"] },
  },
  underwater: {
    start: { place: "world", hero: "look", props: ["🫧", "🐚"], effect: "bubbles" },
    journey: { hero: "fly", props: ["🐟", "🐠", "🐡"], effect: "bubbles" },
    friend: { props: ["🪸"] },
    wonder: { place: "far", props: ["🏰", "🎵"], effect: "hearts" },
    problem: { place: "world", props: ["🌊"] },
    idea: { props: ["🐚"] },
    brave: { effect: "bubbles" },
    almost: { place: "near", time: "night", hero: "fly", buddy: "walk", props: ["🔦", "💤"], effect: "glow" },
    celebrate: { place: "far", props: ["🦪", "🌈", "🐠"], guests: ["pinso"] },
    end: { props: ["🐚"] },
  },
  jungle: {
    start: { hero: "look", props: ["🎒", "🗺️"] },
    journey: { props: ["🦜", "🌺"] },
    friend: { props: ["🍌"] },
    wonder: { props: ["🦋", "🦜"] },
    problem: { place: "near", props: ["🗺️", "🪧"], effect: "none" },
    idea: { props: ["🧭"] },
    brave: { props: ["🌿"], effect: "wind" },
    almost: { hero: "walk", buddy: "walk", props: ["🪨", "💦"] },
    celebrate: { place: "far", props: ["🍌", "🐒", "🐒"], guests: ["trixie"] },
    end: { props: ["🍌"] },
  },
  bedtime: {
    start: { time: "night", hero: "look", props: ["🧸", "📖"], effect: "sparkles" },
    journey: { hero: "fly", buddy: "fly", props: ["☁️"], effect: "sparkles" },
    friend: { buddy: "wave", props: ["🏠"] },
    wonder: { hero: "think", buddy: "think", props: ["🐑", "🌙", "🐑"] },
    problem: { buddy: "think", props: ["⭐", "⭐", "⭐"], effect: "none" },
    idea: {},
    brave: { hero: "walk", effect: "sparkles" },
    almost: { time: "night", hero: "look", buddy: "wave", props: ["🐻", "✨"], effect: "glow" },
    celebrate: { place: "far", props: ["🌙", "💫"], effect: "glow", guests: ["lumi"] },
    end: { hero: "sleep", buddy: "sleep", props: ["🧸"] },
  },
};

export const authoredDirection = (themeId: string, beat: Beat, extra: Partial_ = {}): SceneDirection => ({
  ...defaultDirection(beat),
  ...authored[themeId]?.[beat],
  ...extra,
});

/* ---------- validation of directions coming from the AI ---------- */
const oneOf = <T extends string>(list: readonly T[], value: unknown, fallback: T): T =>
  list.includes(value as T) ? (value as T) : fallback;

const clean = (value: unknown, max: number) =>
  typeof value === "string" ? value.replace(/[<>{}]/g, "").trim().slice(0, max) : "";

/** Keep only what the scene can stage; anything unexpected falls back to the beat's default. */
export function sanitizeDirection(raw: unknown, beat: Beat): SceneDirection {
  const d = defaultDirection(beat);
  if (!raw || typeof raw !== "object") return d;
  const r = raw as Record<string, unknown>;
  const props = Array.isArray(r.props)
    ? r.props
        .filter((p): p is string => typeof p === "string")
        .map((p) => p.trim())
        // objects are emoji only: no letters, digits or markup
        .filter((p) => p.length > 0 && p.length <= 8 && !/[\p{L}\p{N}<>&]/u.test(p))
        .slice(0, 3)
    : d.props;
  const guest = oneOf(BUDDY_IDS, r.guest, "lumi");
  return {
    place: oneOf(PLACES, r.place, d.place),
    time: oneOf(TIMES, r.time, d.time),
    hero: oneOf(HERO_ACTS, r.hero, d.hero),
    buddy: oneOf(BUDDY_ACTS, r.buddy, d.buddy),
    props,
    effect: oneOf(EFFECTS, r.effect, d.effect),
    guests: BUDDY_IDS.includes(r.guest as BuddyId) ? [guest] : [],
    sfx: clean(r.sfx, 18),
    says: clean(r.says, 44),
  };
}
