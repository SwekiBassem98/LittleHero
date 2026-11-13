/**
 * POST /api/avatar — turns a parent's photo of their child into avatar choices.
 *
 * Claude looks at the photo once and answers with a handful of visible
 * features (hair, colours, glasses…). It is never asked who the child is.
 * The image lives only in memory for the length of the request: this server
 * does not write it to disk or to any log.
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { clientIp, rateLimiter, readJson, send } from "./http.js";

const SKIN = ["very_light", "light", "medium", "brown", "dark"] as const;
const HAIR = ["short", "spiky", "curly", "afro", "bob", "long", "ponytail", "pigtails", "braids", "buns", "baby"] as const;
const HAIR_COLOR = ["black", "dark_brown", "light_brown", "blond", "red"] as const;
const EYES = ["dark", "brown", "blue", "green"] as const;
const OUTFIT = ["coral", "purple", "mint", "sky", "yellow", "pink"] as const;

const Features = z.object({
  usable: z.boolean(),
  skin: z.enum(SKIN),
  hair: z.enum(HAIR),
  hairColor: z.enum(HAIR_COLOR),
  eyes: z.enum(EYES),
  glasses: z.boolean(),
  freckles: z.boolean(),
  outfit: z.enum(OUTFIT),
});

const PROMPT = `A parent uploaded this photo of their own child so a children's story app can draw a simple cartoon avatar that looks like them. Do not identify the child or guess anything about who they are. Only pick, from the fixed lists, the options closest to what is visible.

- usable: true if one child's face and hair are clearly visible; false if there is no face, several people, or the picture is too dark or blurry to tell.
- skin: the closest of five tones, from very_light to dark.
- hair: the closest cartoon hairstyle —
  short (short, combed to one side), spiky (short and standing up), curly (short to medium curls), afro (round and voluminous), bob (straight, chin length, with a fringe), long (worn down past the shoulders), ponytail (one tail at the back), pigtails (two bunches at the sides), braids (two braids), buns (two buns on top), baby (very little hair).
- hairColor: black, dark_brown, light_brown, blond or red.
- eyes: dark, brown, blue or green; choose dark if you cannot tell.
- glasses: true only if the child is wearing glasses.
- freckles: true only if freckles are clearly visible.
- outfit: the listed colour closest to the main colour of their clothes; choose purple if unclear.`;

const MAX_BYTES = 3 * 1024 * 1024;
const allowed = rateLimiter(15);

export function createAvatarHandler(apiKey?: string) {
  return async (req: IncomingMessage, res: ServerResponse) => {
    if (req.method !== "POST") return send(res, 405, { error: "method" });
    let image = "";
    let consent = false;
    try {
      const body = (await readJson(req, MAX_BYTES)) as Record<string, unknown>;
      image = typeof body.image === "string" ? body.image : "";
      consent = body.consent === true;
    } catch {
      return send(res, 400, { error: "invalid" });
    }
    // The browser sends a small JPEG it has already shrunk.
    const match = /^data:image\/(jpeg|png);base64,([A-Za-z0-9+/=]+)$/.exec(image);
    if (!match) return send(res, 400, { error: "invalid" });
    if (!consent) return send(res, 400, { error: "consent" });
    if (!allowed(clientIp(req))) return send(res, 429, { error: "rate" });

    try {
      const client = apiKey ? new Anthropic({ apiKey }) : new Anthropic();
      const response = await client.messages.parse({
        model: process.env.STORY_MODEL || "claude-opus-5-5",
        max_tokens: 2000,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: `image/${match[1]}` as "image/jpeg" | "image/png", data: match[2] } },
              { type: "text", text: PROMPT },
            ],
          },
        ],
        output_config: { effort: "low", format: zodOutputFormat(Features) },
      });
      const f = response.parsed_output;
      if (response.stop_reason === "refusal" || !f || !f.usable) return send(res, 422, { error: "unusable" });
      return send(res, 200, {
        skin: SKIN.indexOf(f.skin),
        hair: f.hair,
        hairColor: HAIR_COLOR.indexOf(f.hairColor),
        eyes: EYES.indexOf(f.eyes),
        glasses: f.glasses,
        freckles: f.freckles,
        outfit: OUTFIT.indexOf(f.outfit),
      });
    } catch (error) {
      if (error instanceof Anthropic.RateLimitError) return send(res, 429, { error: "rate" });
      if (error instanceof Anthropic.APIError && !(error instanceof Anthropic.AuthenticationError)) {
        console.error(`[avatar] Claude API error ${error.status}`);
        return send(res, 502, { error: "api" });
      }
      return send(res, 503, { error: "no_key" });
    }
  };
}
