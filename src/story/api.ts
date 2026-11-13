import { buildLocalStory } from "./localEngine";
import { sanitizeDirection } from "./directions";
import { BEATS, type Beat, type Story, type StoryChoice, type StoryRequest } from "./types";

function isStory(x: unknown): x is Omit<Story, "source"> {
  if (!x || typeof x !== "object") return false;
  const s = x as Record<string, unknown>;
  return (
    typeof s.title === "string" &&
    typeof s.moral === "string" &&
    Array.isArray(s.pages) &&
    s.pages.length >= 6 &&
    s.pages.every(
      (p) =>
        p &&
        typeof p.text === "string" &&
        p.text.trim().length > 0 &&
        (BEATS as readonly string[]).includes(p.beat)
    )
  );
}

function readChoice(x: unknown): StoryChoice | undefined {
  const c = x as StoryChoice | undefined;
  if (!c || typeof c.question !== "string" || !Array.isArray(c.options) || c.options.length !== 2) return undefined;
  if (!c.options.every((o) => o && typeof o.label === "string" && typeof o.text === "string" && o.text.trim())) return undefined;
  return { question: c.question, options: c.options.map((o) => ({ label: o.label, text: o.text })) };
}

/**
 * Ask the server for an AI-written story. If the server has no key, is
 * unreachable, or answers with anything unexpected, the built-in engine
 * writes the story instead — a parent never ends up with nothing.
 */
export async function generateStory(req: StoryRequest): Promise<Story> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90_000);
  try {
    const res = await fetch("/api/story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
      signal: controller.signal,
    });
    if (res.ok) {
      const data: unknown = await res.json();
      if (isStory(data)) {
        return {
          title: data.title,
          pages: data.pages.map((p) => ({
            beat: p.beat,
            text: p.text,
            scene: sanitizeDirection((p as { scene?: unknown }).scene, p.beat as Beat),
          })),
          moral: data.moral,
          choice: readChoice((data as { choice?: unknown }).choice),
          source: "ai",
        };
      }
    }
  } catch {
    /* fall through to the built-in engine */
  } finally {
    clearTimeout(timer);
  }
  return buildLocalStory(req);
}
