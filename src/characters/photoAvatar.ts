import { HAIRS, HAIR_COLORS, OUTFITS, SKINS, EYES, type AvatarConfig, type HairId } from "./KidAvatar";

/**
 * Photo → avatar.
 *
 * The photo is shrunk in the browser first, so only a small picture is ever
 * sent. The server asks the AI for a few visible features and returns avatar
 * choices. If the AI is not available, a simple colour estimate is made on
 * the device instead and the photo never leaves it.
 */
export interface PhotoResult {
  avatar: AvatarConfig;
  /** "ai" = features read by the AI · "device" = colours estimated locally */
  source: "ai" | "device";
}

export type PhotoError = "unusable" | "failed";

const MAX_SIDE = 640;

/** Load, crop to a centred square and shrink. Returns a JPEG data URL. */
export async function preparePhoto(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const size = Math.min(MAX_SIDE, side);
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  // Portraits usually have the face in the upper part: bias the crop upward.
  const sx = (bitmap.width - side) / 2;
  const sy = Math.max(0, (bitmap.height - side) * 0.3);
  ctx.drawImage(bitmap, sx, sy, side, side, 0, 0, size, size);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", 0.82);
}

const hexToRgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

function nearest(rgb: number[], palette: string[]) {
  let best = 0;
  let bestDistance = Infinity;
  palette.forEach((hex, i) => {
    const [r, g, b] = hexToRgb(hex);
    const d = (r - rgb[0]) ** 2 + (g - rgb[1]) ** 2 + (b - rgb[2]) ** 2;
    if (d < bestDistance) {
      bestDistance = d;
      best = i;
    }
  });
  return best;
}

/** Average colour of a region given in fractions of the picture. */
function average(ctx: CanvasRenderingContext2D, size: number, x0: number, y0: number, x1: number, y1: number) {
  const { data } = ctx.getImageData(Math.round(x0 * size), Math.round(y0 * size), Math.round((x1 - x0) * size), Math.round((y1 - y0) * size));
  const sum = [0, 0, 0];
  for (let i = 0; i < data.length; i += 4) {
    sum[0] += data[i];
    sum[1] += data[i + 1];
    sum[2] += data[i + 2];
  }
  const n = data.length / 4 || 1;
  return sum.map((v) => v / n);
}

/** On-device fallback: only skin tone, hair colour and outfit colour can be guessed this way. */
async function estimateOnDevice(dataUrl: string, current: AvatarConfig): Promise<AvatarConfig> {
  const img = new Image();
  img.src = dataUrl;
  await img.decode();
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, size, size);
  return {
    ...current,
    skin: nearest(average(ctx, size, 0.38, 0.4, 0.62, 0.6), SKINS),
    hairColor: nearest(average(ctx, size, 0.34, 0.06, 0.66, 0.2), HAIR_COLORS.slice(0, 5)),
    outfit: nearest(average(ctx, size, 0.3, 0.86, 0.7, 0.98), OUTFITS),
  };
}

const inRange = (n: unknown, max: number, fallback: number) =>
  typeof n === "number" && Number.isInteger(n) && n >= 0 && n < max ? n : fallback;

export async function avatarFromPhoto(dataUrl: string, current: AvatarConfig): Promise<PhotoResult | PhotoError> {
  try {
    const res = await fetch("/api/avatar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: dataUrl, consent: true }),
    });
    if (res.ok) {
      const f = (await res.json()) as Record<string, unknown>;
      return {
        source: "ai",
        avatar: {
          ...current,
          skin: inRange(f.skin, SKINS.length, current.skin),
          hair: HAIRS.includes(f.hair as HairId) ? (f.hair as HairId) : current.hair,
          hairColor: inRange(f.hairColor, HAIR_COLORS.length, current.hairColor),
          eyes: inRange(f.eyes, EYES.length, 0),
          glasses: f.glasses === true,
          freckles: f.freckles === true,
          outfit: inRange(f.outfit, OUTFITS.length, current.outfit),
        },
      };
    }
    if (res.status === 422) return "unusable";
    // 503 = no AI configured: fall through to the on-device estimate.
    if (res.status !== 503) return "failed";
  } catch {
    /* offline: estimate on the device */
  }
  try {
    return { source: "device", avatar: await estimateOnDevice(dataUrl, current) };
  } catch {
    return "failed";
  }
}
