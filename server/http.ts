/**
 * Small HTTP helpers shared by every endpoint, so the same handlers run both
 * under the Vite dev server and as Vercel functions.
 */
import type { IncomingMessage, ServerResponse } from "node:http";

export function send(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

/**
 * The request's JSON body. Vercel has usually parsed it already (req.body);
 * the Vite dev server hands us the raw stream. Throws on bad or oversized input.
 */
export async function readJson(req: IncomingMessage, maxBytes: number): Promise<unknown> {
  const parsed = (req as IncomingMessage & { body?: unknown }).body;
  if (parsed !== undefined && parsed !== null) {
    if (typeof parsed === "string") {
      if (parsed.length > maxBytes) throw new Error("too large");
      return JSON.parse(parsed);
    }
    if (Buffer.isBuffer(parsed)) {
      if (parsed.length > maxBytes) throw new Error("too large");
      return JSON.parse(parsed.toString("utf8"));
    }
    return parsed;
  }
  const text = await new Promise<string>((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
      if (data.length > maxBytes) reject(new Error("too large"));
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
  return JSON.parse(text);
}

/** The caller's address, behind Vercel's proxy or directly. */
export function clientIp(req: IncomingMessage) {
  const forwarded = String(req.headers["x-forwarded-for"] ?? "").split(",")[0].trim();
  return forwarded || req.socket.remoteAddress || "unknown";
}

/**
 * A light per-address limit. It lives in memory, so on serverless hosting it
 * only slows down bursts hitting the same instance — real protection comes
 * from the platform's firewall and from spending limits on the API keys.
 */
export function rateLimiter(max: number, windowMs = 3_600_000) {
  const hits = new Map<string, number[]>();
  return (ip: string) => {
    const now = Date.now();
    const recent = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= max) return false;
    recent.push(now);
    hits.set(ip, recent);
    return true;
  };
}
