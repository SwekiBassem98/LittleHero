import { useMemo } from "react";
import { cn } from "../utils/cn";

/** The child hero, drawn from a handful of choices instead of a photo. */
export interface AvatarConfig {
  skin: number;
  hair: HairId;
  hairColor: number;
  outfit: number;
  extra: ExtraId;
  /** Added with photo avatars; older saved avatars simply don't have them. */
  eyes?: number;
  glasses?: boolean;
  freckles?: boolean;
}

export const SKINS = ["#FFE3CC", "#F7C9A0", "#E0A070", "#B97A4E", "#8A5633"];
export const HAIR_COLORS = ["#2B1B12", "#5B3A21", "#A8651F", "#E8B94A", "#D9502F", "#2A2550"];
export const OUTFITS = ["#FF7A6B", "#7C5CFF", "#5FE0B7", "#6CC9FF", "#FFC93C", "#FF9ED2"];
export const HAIRS = ["short", "spiky", "curly", "afro", "bob", "long", "ponytail", "pigtails", "braids", "buns", "baby"] as const;
export const EYES = ["#231942", "#6B4423", "#2E7BCF", "#3E9B5F"];
// "glasses" stays in the type for avatars saved before glasses became their own switch.
export const EXTRAS = ["none", "cape", "crown", "bow", "cap", "glasses"] as const;
/** The accessories offered in the studio. */
export const EXTRA_CHOICES: ExtraId[] = ["none", "cape", "crown", "bow", "cap"];
export type HairId = (typeof HAIRS)[number];
export type ExtraId = (typeof EXTRAS)[number];

export const defaultAvatar: AvatarConfig = { skin: 1, hair: "short", hairColor: 1, outfit: 1, extra: "cape", eyes: 0, glasses: false, freckles: false };

export function randomAvatar(): AvatarConfig {
  const pick = (n: number) => Math.floor(Math.random() * n);
  return {
    skin: pick(SKINS.length),
    hair: HAIRS[pick(HAIRS.length)],
    hairColor: pick(HAIR_COLORS.length),
    outfit: pick(OUTFITS.length),
    extra: EXTRA_CHOICES[pick(EXTRA_CHOICES.length)],
    eyes: pick(EYES.length),
    glasses: Math.random() < 0.2,
    freckles: Math.random() < 0.2,
  };
}

export type KidMood = "idle" | "happy" | "wow" | "sleep";
export type KidPose = "idle" | "wave" | "cheer";

const INK = "#231942";
const S = { stroke: INK, strokeWidth: 4, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

const FRINGE_SIDE = "M54 90 Q48 40 100 40 Q152 40 146 90 Q140 64 112 60 Q84 72 54 90 Z";
const FRINGE_MID = "M54 92 Q50 40 100 40 Q150 40 146 92 Q136 62 100 58 Q64 62 54 92 Z";
const FRINGE_FLAT = "M54 88 Q52 40 100 40 Q148 40 146 88 L140 72 Q100 60 60 72 Z";

function HairBack({ hair, color }: { hair: HairId; color: string }) {
  if (hair === "long") return <path d="M50 86 Q40 176 64 184 L136 184 Q160 176 150 86 Z" fill={color} {...S} />;
  if (hair === "afro") return <circle cx={100} cy={72} r={64} fill={color} {...S} />;
  if (hair === "ponytail") return <path d="M138 52 Q186 54 180 108 Q176 136 158 116 Q164 84 138 80 Z" fill={color} {...S} />;
  if (hair === "braids")
    return (
      <>
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <circle cx={48 - i} cy={104 + i * 19} r={11} fill={color} {...S} />
            <circle cx={152 + i} cy={104 + i * 19} r={11} fill={color} {...S} />
          </g>
        ))}
        <circle cx={44} cy={180} r={6} fill="#FF7A6B" stroke={INK} strokeWidth={3} />
        <circle cx={156} cy={180} r={6} fill="#FF7A6B" stroke={INK} strokeWidth={3} />
      </>
    );
  if (hair === "bob") return <ellipse cx={100} cy={98} rx={56} ry={54} fill={color} {...S} />;
  if (hair === "pigtails")
    return (
      <>
        <circle cx={40} cy={106} r={19} fill={color} {...S} />
        <circle cx={160} cy={106} r={19} fill={color} {...S} />
      </>
    );
  if (hair === "buns")
    return (
      <>
        <circle cx={62} cy={42} r={18} fill={color} {...S} />
        <circle cx={138} cy={42} r={18} fill={color} {...S} />
      </>
    );
  return null;
}

function HairFront({ hair, color }: { hair: HairId; color: string }) {
  switch (hair) {
    case "short":
    case "ponytail":
      return <path d={FRINGE_SIDE} fill={color} {...S} />;
    case "afro":
      return <path d="M56 86 Q58 42 100 40 Q142 42 144 86 Q122 64 100 64 Q78 64 56 86 Z" fill={color} {...S} />;
    case "braids":
      return <path d={FRINGE_MID} fill={color} {...S} />;
    case "spiky":
      return (
        <path
          d="M54 88 L50 58 L66 64 L68 36 L86 52 L98 28 L110 52 L130 34 L132 62 L150 56 L146 88 Q130 64 100 64 Q70 64 54 88 Z"
          fill={color}
          {...S}
        />
      );
    case "curly":
      return (
        <>
          {[...Array(8)].map((_, i) => {
            const a = ((188 + i * 23.5) * Math.PI) / 180;
            return <circle key={i} cx={100 + 44 * Math.cos(a)} cy={86 + 44 * Math.sin(a)} r={15} fill={color} {...S} />;
          })}
          <circle cx={84} cy={54} r={13} fill={color} {...S} />
          <circle cx={116} cy={54} r={13} fill={color} {...S} />
        </>
      );
    case "bob":
    case "buns":
      return <path d={FRINGE_FLAT} fill={color} {...S} />;
    case "long":
      return <path d={FRINGE_MID} fill={color} {...S} />;
    case "pigtails":
      return (
        <>
          <path d={FRINGE_MID} fill={color} {...S} />
          <circle cx={54} cy={94} r={6} fill="#FF7A6B" stroke={INK} strokeWidth={3} />
          <circle cx={146} cy={94} r={6} fill="#FF7A6B" stroke={INK} strokeWidth={3} />
        </>
      );
    case "baby":
      return <path d="M90 46 Q98 22 112 38 Q104 36 100 48" fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" />;
  }
}

interface KidAvatarProps {
  config: AvatarConfig;
  mood?: KidMood;
  pose?: KidPose;
  /** Head and shoulders only. */
  bust?: boolean;
  className?: string;
  flip?: boolean;
}

export default function KidAvatar({ config, mood = "idle", pose = "idle", bust, className, flip }: KidAvatarProps) {
  const skin = SKINS[config.skin] ?? SKINS[1];
  const hair = HAIR_COLORS[config.hairColor] ?? HAIR_COLORS[1];
  const outfit = OUTFITS[config.outfit] ?? OUTFITS[1];
  const delay = useMemo(() => `${-(Math.random() * 4).toFixed(2)}s`, []);
  const leftArm = pose === "cheer" ? "kid-cheer-l" : "buddy-arm";
  const rightArm = pose === "cheer" ? "kid-cheer-r" : pose === "wave" ? "buddy-wave" : "buddy-arm";

  return (
    <svg
      viewBox={bust ? "24 14 152 152" : "0 0 200 250"}
      className={cn("block h-auto w-full overflow-visible", !bust && "buddy-bob", className)}
      style={{ animationDelay: delay, transform: flip ? "scaleX(-1)" : undefined, ["--blink-delay" as string]: delay }}
      aria-hidden
    >
      {!bust && <ellipse cx={100} cy={242} rx={44} ry={6} fill={INK} opacity={0.12} />}

      {config.extra === "cape" && (
        <path className="buddy-cape" d="M72 148 Q34 196 50 232 Q100 214 150 232 Q166 196 128 148 Z" fill="#FF7A6B" {...S} />
      )}
      <HairBack hair={config.hair} color={hair} />

      {/* legs */}
      <rect x={80} y={196} width={16} height={36} rx={7} fill={skin} {...S} />
      <rect x={104} y={196} width={16} height={36} rx={7} fill={skin} {...S} />
      <ellipse cx={84} cy={234} rx={15} ry={8} fill="#3D2C6B" {...S} />
      <ellipse cx={116} cy={234} rx={15} ry={8} fill="#3D2C6B" {...S} />

      {/* left arm */}
      <g className={leftArm} style={{ transformOrigin: "70px 150px" }}>
        <ellipse cx={62} cy={170} rx={10} ry={24} transform="rotate(14 62 170)" fill={outfit} {...S} />
        <circle cx={56} cy={192} r={9} fill={skin} {...S} />
      </g>

      {/* body */}
      <rect x={68} y={138} width={64} height={68} rx={22} fill={outfit} {...S} />
      <path d="M100 160 l4.5 9.2 10 1.4 -7.3 7 1.8 10 -9-4.8 -9 4.8 1.8-10 -7.3-7 10-1.4z" fill="#fff" opacity={0.9} />

      {/* right arm */}
      <g className={rightArm} style={{ transformOrigin: "130px 150px" }}>
        <ellipse cx={138} cy={170} rx={10} ry={24} transform="rotate(-14 138 170)" fill={outfit} {...S} />
        <circle cx={144} cy={192} r={9} fill={skin} {...S} />
      </g>

      {/* head */}
      <circle cx={54} cy={94} r={9} fill={skin} {...S} />
      <circle cx={146} cy={94} r={9} fill={skin} {...S} />
      <circle cx={100} cy={88} r={46} fill={skin} {...S} />
      <HairFront hair={config.hair} color={hair} />

      {config.extra === "cap" && (
        <>
          <path d="M54 76 Q52 34 100 34 Q148 34 146 76 Z" fill="#FF7A6B" {...S} />
          <path d="M144 74 Q178 70 182 84 Q162 88 144 82 Z" fill="#FF7A6B" {...S} />
        </>
      )}
      {config.extra === "crown" && (
        <path d="M70 46 L74 16 L90 34 L100 10 L110 34 L126 16 L130 46 Z" fill="#FFC93C" {...S} />
      )}
      {config.extra === "bow" && (
        <g>
          <path d="M132 44 L112 32 L114 56 Z M132 44 L152 32 L150 56 Z" fill="#FF9ED2" {...S} />
          <circle cx={132} cy={44} r={6} fill="#FF7A6B" {...S} strokeWidth={3} />
        </g>
      )}

      {/* face */}
      <circle cx={70} cy={106} r={8} fill="#FF8FA3" opacity={0.5} />
      <circle cx={130} cy={106} r={8} fill="#FF8FA3" opacity={0.5} />
      {mood === "sleep" ? (
        <g fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round">
          <path d="M76 94 q8 7 16 0" />
          <path d="M108 94 q8 7 16 0" />
        </g>
      ) : (
        <g className="buddy-blink">
          {[84, 116].map((x) => (
            <g key={x}>
              <ellipse cx={x} cy={93} rx={mood === "wow" ? 6.5 : 5.5} ry={mood === "wow" ? 8.5 : 7} fill={EYES[config.eyes ?? 0] ?? INK} stroke={INK} strokeWidth={2} />
              <circle cx={x} cy={94} r={2.6} fill={INK} />
              <circle cx={x + 1.8} cy={90} r={2} fill="#fff" />
            </g>
          ))}
        </g>
      )}
      {config.freckles && (
        <g fill="#B5713C" opacity={0.7}>
          {[[66, 100], [72, 104], [62, 106], [134, 100], [128, 104], [138, 106]].map(([x, y]) => (
            <circle key={`${x}${y}`} cx={x} cy={y} r={1.8} />
          ))}
        </g>
      )}
      {mood === "idle" && <path d="M88 110 Q100 121 112 110" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />}
      {mood === "happy" && (
        <path d="M86 107 Q100 128 114 107 Z" fill="#4A1D2E" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      )}
      {mood === "wow" && <ellipse cx={100} cy={114} rx={6} ry={8} fill="#4A1D2E" stroke={INK} strokeWidth={3} />}
      {mood === "sleep" && <ellipse cx={100} cy={113} rx={4} ry={4} fill="#4A1D2E" />}

      {(config.glasses || config.extra === "glasses") && (
        <g fill="rgba(255,255,255,0.3)" stroke={INK} strokeWidth={3.5}>
          <circle cx={84} cy={93} r={14} />
          <circle cx={116} cy={93} r={14} />
          <path d="M98 93 h4" fill="none" />
        </g>
      )}
    </svg>
  );
}
