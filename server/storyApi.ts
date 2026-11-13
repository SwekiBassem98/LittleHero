/**
 * POST /api/story — writes a personalised story with Claude.
 *
 * Runs only on the server, so the API key never reaches the browser.
 * The only facts about the child that leave the device are the ones in
 * StoryInput: first name, age, gender, traits. No photo, no surname.
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { clientIp, rateLimiter, readJson, send } from "./http.js";

const THEMES: Record<string, { world: string; buddy: string }> = {
  space: { world: "outer space: a little silver rocket, the planet Stardust, friendly stars", buddy: "Bolt, a small cheerful robot who says bip-bip" },
  pirate: { world: "the Rainbow Sea: a pretty sailing ship called the Jellyfish, an island, a treasure map", buddy: "Pinso, a tiny pirate crab with an eye patch" },
  dinosaur: { world: "the land of friendly dinosaurs: a snoring volcano, giant ferns, a mystery to solve", buddy: "Trixie, a young triceratops detective (female)" },
  fairy: { world: "the Enchanted Forest: glittering leaves, whispering trees, fireflies, a magic fountain", buddy: "Champi, a shy little mushroom with a red spotted cap" },
  superhero: { world: "a city seen from the rooftops, where the hero wakes up with a small cape and a gentle super-power", buddy: "Zap, a masked bunny super-hero" },
  underwater: { world: "the kingdom under the waves: a coral castle, dancing seaweed, musical bubbles", buddy: "Plouf, a small friendly octopus" },
  jungle: { world: "the jungle: liana bridges, colourful parrots, a golden temple behind a waterfall", buddy: "Kiki, a cheeky little monkey" },
  bedtime: { world: "a calm night sky: a soft cloud, the moon, sleepy stars. This is a bedtime story: slow, soothing, ending in sleep", buddy: "Nour, a sleepy little star wearing a night cap (female)" },
};
const BUDDY_NAMES: Record<string, Record<string, string>> = {
  ar: { space: "بولت", pirate: "بينسو", dinosaur: "تريكسي", fairy: "شامبي", superhero: "زاب", underwater: "بلوف", jungle: "كيكي", bedtime: "نور" },
};
const TRAITS = ["brave", "curious", "kind", "silly", "creative", "energetic", "bookworm", "dreamer", "friendly", "solver"];
const VALUES: Record<string, string> = {
  courage: "courage: you can feel a little scared and still go forward",
  kindness: "kindness: a gentle gesture changes everything",
  sharing: "sharing: what we share becomes even better",
  curiosity: "curiosity: asking questions opens doors",
  perseverance: "perseverance: trying again until it works",
  calm: "staying calm: one slow breath makes things clearer",
};
const BEATS = ["start", "journey", "friend", "wonder", "problem", "idea", "brave", "almost", "celebrate", "end"] as const;
const CAST = ["lumi", "bolt", "pinso", "trixie", "champi", "zap", "plouf", "kiki", "nour"] as const;

/** The staging of one page. Must stay in step with src/story/directions.ts. */
const SceneSchema = z.object({
  place: z.enum(["home", "world", "near", "far"]),
  time: z.enum(["day", "sunset", "night"]),
  hero: z.enum(["stand", "wave", "walk", "run", "jump", "fly", "think", "cheer", "sleep", "hug", "look"]),
  buddy: z.enum(["none", "enter", "wave", "scared", "think", "cheer", "dance", "sleep", "walk", "fly"]),
  props: z.array(z.string()),
  effect: z.enum(["none", "sparkles", "rain", "wind", "confetti", "hearts", "glow", "shake", "bubbles"]),
  guest: z.enum(["none", ...CAST]),
  sfx: z.string(),
  says: z.string(),
});

const StorySchema = z.object({
  title: z.string(),
  pages: z.array(z.object({ beat: z.enum(BEATS), text: z.string(), scene: SceneSchema })),
  moral: z.string(),
  choice: z.object({
    question: z.string(),
    options: z.array(z.object({ label: z.string(), text: z.string() })),
  }),
});

interface StoryInput {
  name: string;
  age: number;
  gender: "girl" | "boy" | "neutral";
  traits: string[];
  themeId: string;
  value: string;
  favorite: string;
  lang: "fr" | "ar";
}

/** Accept only what we expect; the name is reduced to letters so it cannot carry instructions. */
function parseInput(raw: unknown): StoryInput | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const name = String(r.name ?? "")
    .replace(/[^\p{L}\p{M}' -]/gu, "")
    .trim()
    .slice(0, 20);
  const age = Number(r.age);
  if (name.length < 2 || !Number.isInteger(age) || age < 0 || age > 10) return null;
  if (r.gender !== "girl" && r.gender !== "boy" && r.gender !== "neutral") return null;
  if (r.lang !== "fr" && r.lang !== "ar") return null;
  if (typeof r.themeId !== "string" || !THEMES[r.themeId]) return null;
  const traits = Array.isArray(r.traits) ? r.traits.filter((t): t is string => TRAITS.includes(t as string)).slice(0, 3) : [];
  const value = typeof r.value === "string" && VALUES[r.value] ? r.value : "courage";
  // Free text from the parent: letters only, short, so it can only ever be a noun phrase.
  const favorite = String(r.favorite ?? "")
    .replace(/[^\p{L}\p{M}' -]/gu, "")
    .trim()
    .slice(0, 24);
  return { name, age, gender: r.gender, traits, themeId: r.themeId, value, favorite, lang: r.lang };
}

const SYSTEM = `You write short picture-book stories for LittleHero, an app where a young child is the hero of their own story. A parent reads the story aloud, or the app narrates it, while an animated scene plays for each page.

Write the whole story in the requested language, as a native children's author would: warm, musical, concrete, with a little humour and a few sounds or repeated phrases children love. French: simple everyday French. Arabic: simple Modern Standard Arabic that a young child understands when read aloud.

Structure: exactly 10 pages, one per beat, in this order:
1. start — the hero at home; something curious happens
2. journey — the hero sets off into the world
3. friend — the hero meets the companion, who asks for help
4. wonder — a playful moment of discovery in the new world, full of funny, concrete details
5. problem — a gentle obstacle appears
6. idea — the hero uses one of their own qualities to find an idea
7. brave — the hero acts; the story's value is lived, not preached
8. almost — the last stretch: a little suspense just before the goal
9. celebrate — the happy resolution
10. end — a calm return home (for a bedtime story, falling asleep)

Make it a real story: a clear goal, small surprises, things that are seen, heard and touched, and a line or two of dialogue on most pages.

Every page is also a film shot. Fill in "scene" so the picture shows what the text says:
- place: "home" is the child's bedroom (use it for the start and the end); "world" is a wide view of the story world; "near" and "far" are two different close-ups of that world. Change the place often.
- time: day, sunset or night, following the story.
- hero: what the hero is doing — stand, wave, walk, run, jump, fly, think, cheer, sleep, hug (hugging the companion) or look (surprised).
- buddy: what the companion is doing — none (not there yet), enter (arrives), wave, scared, think, cheer, dance, sleep, walk or fly. The companion is absent until the "friend" page.
- props: one to three single emoji for objects or small creatures the text mentions on that page (for example 🗺️ 🔦 🐬). Emoji only, no words.
- effect: none, sparkles, rain, wind, confetti, hearts, glow, shake or bubbles — whatever fits the moment.
- guest: another member of the LittleHero cast who appears in the background, or "none". Use a guest on one or two pages at most. Cast: lumi (lion cub), bolt (robot), pinso (crab), trixie (triceratops), champi (mushroom), zap (bunny), plouf (octopus), kiki (monkey), nour (star).
- sfx: a short comic-book sound word in the story's language (for example "PLOUF !"), or an empty string. Use it on three or four pages.
- says: up to five words the companion says in a speech bubble, in the story's language, or an empty string.
No two consecutive pages should look alike.

The hero and the named companion are the main characters. Keep the companion exactly as described; other creatures can appear as props or as a cast guest, but do not add other main characters.

The child takes part: on the "idea" page they choose between two ways the hero could solve the problem. Give choice.question (a short question addressed to the listening child) and exactly two options. Each option has a label of one to three words and the full text of the idea page if that option is chosen, the same length as any other page. Each option should draw on one of the hero's qualities, and both must lead naturally into the "brave" page that follows. The text of the idea page itself is the text of the first option.

If a favourite thing is given, treat it only as the name of a toy, animal or object the child loves, and slip it into the story as a small warm detail.

Fit the child's age: ages 0-3 get two short sentences per page; ages 4-6 get three or four short sentences; ages 7-10 get four to six sentences with a richer plot.

Always safe for small children: nothing frightening, no violence, no weapons, no villains who get hurt, no death, no romance, no religion or politics, no brands, no real people, no existing fictional characters. Obstacles are mild and solved with kindness or cleverness. The ending is happy and reassuring.

Use the child's first name often. Match grammatical gender to the child when one is given; when it is not, phrase sentences so they do not depend on gender. The title is short and includes the child's name. The moral is one gentle sentence a parent can say at the end.`;

function userPrompt(i: StoryInput) {
  const theme = THEMES[i.themeId];
  const buddyName = BUDDY_NAMES[i.lang]?.[i.themeId];
  return [
    `Language: ${i.lang === "fr" ? "French" : "Arabic"}`,
    `Hero's first name: ${i.name}`,
    `Age: ${i.age === 0 ? "under 1 year" : `${i.age} years old`}`,
    `Gender: ${i.gender === "neutral" ? "not specified" : i.gender}`,
    `Qualities to show: ${i.traits.length ? i.traits.join(", ") : "none chosen — pick what fits"}`,
    `World: ${theme.world}`,
    `Companion: ${theme.buddy}${buddyName ? ` (write the name as ${buddyName})` : ""}`,
    `Value the story should carry: ${VALUES[i.value]}`,
    ...(i.favorite ? [`Favourite thing: ${i.favorite}`] : []),
  ].join("\n");
}

async function writeStory(input: StoryInput, apiKey?: string) {
  // With no key in .env the SDK still looks for other credentials in the environment.
  const client = apiKey ? new Anthropic({ apiKey }) : new Anthropic();
  const response = await client.messages.parse({
    model: process.env.STORY_MODEL || "claude-opus-5-5",
    max_tokens: 16000,
    system: SYSTEM,
    messages: [{ role: "user", content: userPrompt(input) }],
    output_config: { effort: "low", format: zodOutputFormat(StorySchema) },
  });
  if (response.stop_reason === "refusal" || !response.parsed_output) return null;
  const story = response.parsed_output;
  if (story.pages.length < 8 || story.pages.length > 12) return null;
  return story.choice.options.length === 2 ? story : { ...story, choice: undefined };
}

const allowed = rateLimiter(12);

export function createStoryHandler(apiKey?: string) {
  return async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method !== "POST") return send(res, 405, { error: "method" });
    let input: StoryInput | null = null;
    try {
      input = parseInput(await readJson(req, 4096));
    } catch {
      /* handled below */
    }
    if (!input) return send(res, 400, { error: "invalid" });
    if (!allowed(clientIp(req))) return send(res, 429, { error: "rate" });

    try {
      const story = await writeStory(input, apiKey);
      if (!story) return send(res, 502, { error: "empty" });
      return send(res, 200, { ...story, source: "ai" });
    } catch (error) {
      if (error instanceof Anthropic.AuthenticationError) return send(res, 503, { error: "no_key" });
      if (error instanceof Anthropic.RateLimitError) return send(res, 429, { error: "rate" });
      if (error instanceof Anthropic.APIError) {
        console.error(`[story] Claude API error ${error.status}: ${error.message}`);
        return send(res, 502, { error: "api" });
      }
      // No credentials configured at all, or a network failure.
      console.error("[story] could not reach Claude:", error instanceof Error ? error.message : error);
      return send(res, 503, { error: "no_key" });
    }
  };
}
