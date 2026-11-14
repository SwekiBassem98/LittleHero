import { useId, useState, type MouseEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Buddy, { type Mood } from "../characters/Buddy";
import KidAvatar, { type AvatarConfig, type KidMood, type KidPose } from "../characters/KidAvatar";
import { themeById } from "../data";
import { Confetti } from "../components/ui";
import { cn } from "../utils/cn";
import { defaultDirection, type SceneDirection } from "./directions";
import type { Beat } from "./types";

const INK = "#231942";
const S = { stroke: INK, strokeWidth: 4, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

/** Deterministic scatter so stars and bubbles stay put between renders. */
const scatter = (n: number, seed: number) =>
  Array.from({ length: n }, (_, i) => {
    const a = Math.sin((i + 1) * 12.9898 * seed) * 43758.5453;
    const b = Math.sin((i + 1) * 78.233 * seed) * 12543.123;
    return { x: (a - Math.floor(a)) * 800, y: (b - Math.floor(b)) * 300, k: i };
  });

function Stars({ n = 34, seed = 1, color = "#fff" }) {
  return (
    <>
      {scatter(n, seed).map((p) => (
        <circle key={p.k} className="twinkle" style={{ animationDelay: `${-(p.k % 7) * 0.4}s` }} cx={p.x} cy={p.y} r={1.5 + (p.k % 3)} fill={color} />
      ))}
    </>
  );
}

function Cloud({ x, y, s = 1, fill = "#fff" }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className="drift">
        <path d="M0 30 Q-4 8 18 8 Q24 -10 46 -2 Q66 -12 76 8 Q98 8 94 30 Z" fill={fill} {...S} strokeWidth={3} />
      </g>
    </g>
  );
}

function Sky({ id, from, to }: { id: string; from: string; to: string }) {
  return (
    <>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <rect width={800} height={500} fill={`url(#${id})`} />
    </>
  );
}

/* ---------- the eight worlds ---------- */
// Each scene gets its own gradient id: several scenes share a page, and a
// gradient defined inside a hidden scene cannot be referenced by a visible one.
const backdrops: Record<string, (uid: string) => ReactNode> = {
  space: (uid) => (
    <>
      <Sky id={`sky-space-${uid}`} from="#150F3D" to="#4338CA" />
      <Stars n={44} seed={1.3} />
      <circle cx={640} cy={118} r={58} fill="#FF9ED2" {...S} />
      <ellipse cx={640} cy={118} rx={100} ry={20} fill="none" stroke="#FFC93C" strokeWidth={9} transform="rotate(-14 640 118)" />
      <circle cx={150} cy={92} r={26} fill="#5FE0B7" {...S} />
      <path d="M0 410 Q200 366 400 400 T800 388 V500 H0 Z" fill="#8E7CC3" {...S} />
      <ellipse cx={170} cy={440} rx={46} ry={12} fill="#7565AD" />
      <ellipse cx={560} cy={452} rx={60} ry={14} fill="#7565AD" />
      <g transform="translate(70 300)">
        <path d="M30 0 Q60 40 52 96 L8 96 Q0 40 30 0 Z" fill="#fff" {...S} />
        <path d="M8 70 L-14 104 L10 96 Z M52 70 L74 104 L50 96 Z" fill="#FF7A6B" {...S} />
        <circle cx={30} cy={44} r={11} fill="#6CC9FF" {...S} strokeWidth={3} />
      </g>
    </>
  ),
  pirate: (uid) => (
    <>
      <Sky id={`sky-pirate-${uid}`} from="#FFB86B" to="#FF8FA3" />
      <circle cx={610} cy={150} r={62} fill="#FFE08A" {...S} />
      <Cloud x={120} y={70} />
      <Cloud x={380} y={120} s={0.7} />
      <rect y={290} width={800} height={210} fill="#2BA6C9" />
      <ellipse cx={640} cy={300} rx={120} ry={26} fill="#F2D7A0" {...S} />
      <path d="M640 296 Q632 250 648 210" fill="none" stroke="#8B5E3C" strokeWidth={11} strokeLinecap="round" />
      <g className="sway">
        <path d="M648 210 Q610 190 590 212 M648 210 Q690 186 710 214 M648 210 Q640 172 612 168 M648 210 Q664 170 694 170" fill="none" stroke="#3E8E41" strokeWidth={11} strokeLinecap="round" />
      </g>
      <g className="drift" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={0.8}>
        <path d="M40 330 q20 -14 40 0 t40 0 t40 0" />
        <path d="M300 356 q20 -14 40 0 t40 0 t40 0" />
        <path d="M520 344 q20 -14 40 0 t40 0" />
      </g>
      <rect y={404} width={800} height={96} fill="#B9773E" {...S} />
      <path d="M0 436 H800 M0 468 H800 M140 404 V436 M420 436 V468 M620 404 V436 M260 468 V500" stroke={INK} strokeWidth={3} opacity={0.5} />
      <path d="M0 372 H800" stroke="#8B5E3C" strokeWidth={10} />
      <path d="M60 372 V404 M240 372 V404 M560 372 V404 M740 372 V404" stroke="#8B5E3C" strokeWidth={10} />
    </>
  ),
  dinosaur: (uid) => (
    <>
      <Sky id={`sky-dino-${uid}`} from="#A7ECDD" to="#FDF3C4" />
      <Cloud x={90} y={60} />
      <g className="rise" style={{ animationDuration: "9s" }}>
        <circle cx={634} cy={130} r={16} fill="#fff" opacity={0.85} />
        <circle cx={656} cy={110} r={11} fill="#fff" opacity={0.85} />
      </g>
      <path d="M500 400 L610 170 Q640 150 670 170 L780 400 Z" fill="#9B6B43" {...S} />
      <path d="M610 170 Q640 150 670 170 L682 200 Q660 188 648 206 Q636 186 618 204 Q606 190 598 196 Z" fill="#FF7A6B" {...S} />
      <path d="M0 400 Q160 320 330 392 Q520 340 800 400 V500 H0 Z" fill="#7BC96F" {...S} />
      <path d="M0 440 Q300 400 800 446 V500 H0 Z" fill="#5FB356" />
      {[40, 720].map((x) => (
        <g key={x} className="sway" style={{ animationDelay: `${-x / 300}s` }}>
          <path d={`M${x} 420 Q${x - 30} 340 ${x - 50} 320 M${x} 420 Q${x} 330 ${x} 300 M${x} 420 Q${x + 30} 340 ${x + 50} 320`} fill="none" stroke="#2F8F4E" strokeWidth={12} strokeLinecap="round" />
        </g>
      ))}
    </>
  ),
  fairy: (uid) => (
    <>
      <Sky id={`sky-fairy-${uid}`} from="#3B1B6B" to="#C2569B" />
      <Stars n={26} seed={2.1} color="#FFE08A" />
      <rect x={20} y={0} width={70} height={420} fill="#6B3F2A" {...S} />
      <rect x={716} y={0} width={64} height={420} fill="#6B3F2A" {...S} />
      <path d="M-20 0 H160 Q150 90 60 80 Q0 90 -20 40 Z M660 0 H820 V50 Q770 100 720 78 Q660 80 660 0 Z" fill="#2F8F4E" {...S} />
      <path d="M0 404 Q260 372 520 400 T800 392 V500 H0 Z" fill="#3E7C59" {...S} />
      <g transform="translate(610 300)">
        <rect x={-14} y={30} width={28} height={80} rx={12} fill="#FFF1D6" {...S} />
        <path d="M-66 40 Q-60 -24 0 -26 Q60 -24 66 40 Z" fill="#FFC93C" {...S} />
        <circle cx={-26} cy={6} r={9} fill="#fff" />
        <circle cx={22} cy={-4} r={7} fill="#fff" />
      </g>
      <g transform="translate(180 356)">
        <rect x={-8} y={14} width={16} height={44} rx={7} fill="#FFF1D6" {...S} />
        <path d="M-36 20 Q-32 -14 0 -16 Q32 -14 36 20 Z" fill="#6CC9FF" {...S} />
      </g>
    </>
  ),
  superhero: (uid) => (
    <>
      <Sky id={`sky-hero-${uid}`} from="#6CC9FF" to="#E7F6FF" />
      <Cloud x={80} y={70} />
      <Cloud x={520} y={50} s={1.2} />
      {[
        [30, 200, 110, "#7C5CFF"],
        [150, 260, 90, "#5B6BB5"],
        [250, 160, 120, "#8E7CC3"],
        [470, 230, 100, "#5B6BB5"],
        [580, 150, 110, "#7C5CFF"],
        [700, 250, 90, "#8E7CC3"],
      ].map(([x, y, w, c]) => (
        <g key={x as number}>
          <rect x={x as number} y={y as number} width={w as number} height={400 - (y as number)} fill={c as string} {...S} />
          {[0, 1, 2].map((r) =>
            [0, 1].map((cI) => (
              <rect key={`${r}${cI}`} x={(x as number) + 16 + cI * ((w as number) / 2 - 6)} y={(y as number) + 20 + r * 44} width={22} height={24} rx={4} fill="#FFE08A" opacity={(r + cI) % 2 ? 1 : 0.55} />
            ))
          )}
        </g>
      ))}
      <rect y={400} width={800} height={100} fill="#C9CFE6" {...S} />
      <rect y={388} width={800} height={18} fill="#AEB6D6" {...S} />
    </>
  ),
  underwater: (uid) => (
    <>
      <Sky id={`sky-sea-${uid}`} from="#38BDF8" to="#1E3A8A" />
      <path d="M120 0 L260 0 L120 500 L20 500 Z M460 0 L560 0 L640 500 L520 500 Z" fill="#fff" opacity={0.08} />
      {scatter(12, 3.3).map((p) => (
        <circle key={p.k} className="rise" style={{ animationDelay: `${-p.k * 0.6}s`, animationDuration: `${6 + (p.k % 4)}s` }} cx={p.x} cy={470} r={4 + (p.k % 4) * 2} fill="none" stroke="#fff" strokeWidth={2.5} />
      ))}
      <path d="M0 410 Q200 380 420 404 T800 396 V500 H0 Z" fill="#F2D7A0" {...S} />
      {[60, 110, 700, 742].map((x, i) => (
        <g key={x} className="sway" style={{ animationDelay: `${-i * 0.7}s` }}>
          <path d={`M${x} 420 Q${x - 18} 350 ${x} 300 Q${x + 18} 260 ${x} 220`} fill="none" stroke="#34D399" strokeWidth={13} strokeLinecap="round" />
        </g>
      ))}
      <g transform="translate(610 330)">
        <rect x={-50} y={10} width={26} height={74} rx={13} fill="#FF7A6B" {...S} />
        <rect x={-14} y={-24} width={28} height={108} rx={14} fill="#FF9ED2" {...S} />
        <rect x={24} y={18} width={26} height={66} rx={13} fill="#FFC93C" {...S} />
      </g>
      <g className="drift">
        <path d="M250 120 q24 -18 48 0 q-24 18 -48 0 Z M298 120 l18 -12 v24 Z" fill="#FFC93C" {...S} strokeWidth={3} />
        <path d="M430 210 q18 -14 36 0 q-18 14 -36 0 Z M466 210 l14 -9 v18 Z" fill="#FF7A6B" {...S} strokeWidth={3} />
      </g>
    </>
  ),
  jungle: (uid) => (
    <>
      <Sky id={`sky-jungle-${uid}`} from="#B6EC7A" to="#3E8E41" />
      <path d="M300 0 L420 0 L260 500 L120 500 Z" fill="#fff" opacity={0.1} />
      <rect x={560} y={150} width={46} height={260} fill="#BDEBFF" opacity={0.9} />
      <path className="rise" style={{ animationDuration: "3s" }} d="M572 380 v-40 M592 400 v-50" stroke="#fff" strokeWidth={4} strokeLinecap="round" />
      <g transform="translate(600 150)">
        <rect x={0} y={170} width={190} height={90} fill="#E8B94A" {...S} />
        <rect x={24} y={104} width={142} height={70} fill="#F5CE6B" {...S} />
        <rect x={50} y={46} width={90} height={62} fill="#E8B94A" {...S} />
        <path d="M78 260 V206 Q95 184 112 206 V260 Z" fill="#231942" />
      </g>
      <path d="M0 404 Q240 376 500 402 T800 396 V500 H0 Z" fill="#5A9E3C" {...S} />
      {[90, 250, 470].map((x, i) => (
        <g key={x} className="sway" style={{ transformOrigin: "top center", animationDelay: `${-i}s` }}>
          <path d={`M${x} 0 Q${x + 16} ${70 + i * 30} ${x} ${130 + i * 40}`} fill="none" stroke="#2F8F4E" strokeWidth={8} strokeLinecap="round" />
          <ellipse cx={x} cy={136 + i * 40} rx={14} ry={8} fill="#2F8F4E" {...S} strokeWidth={3} />
        </g>
      ))}
      <path d="M-30 420 Q10 300 90 300 Q40 350 50 430 Z M830 420 Q790 300 710 310 Q760 350 750 430 Z" fill="#2F8F4E" {...S} />
    </>
  ),
  bedtime: (uid) => (
    <>
      <Sky id={`sky-night-${uid}`} from="#0F1B4C" to="#4C3A8C" />
      <Stars n={48} seed={4.7} color="#FFF3B0" />
      <circle cx={630} cy={120} r={70} fill="#FFF3B0" {...S} />
      <circle cx={606} cy={100} r={12} fill="#F2E08A" />
      <circle cx={654} cy={140} r={18} fill="#F2E08A" />
      <g transform="translate(70 290)">
        <rect x={0} y={40} width={100} height={84} fill="#6B5CA8" {...S} />
        <path d="M-14 44 L50 -6 L114 44 Z" fill="#FF7A6B" {...S} />
        <rect className="buddy-pulse" x={34} y={64} width={32} height={30} rx={5} fill="#FFE08A" {...S} strokeWidth={3} />
      </g>
      <g fill="#E9E3FF" {...S}>
        {[40, 150, 270, 400, 530, 650, 760].map((x, i) => (
          <circle key={x} cx={x} cy={440 + (i % 2) * 10} r={62} />
        ))}
      </g>
      <rect y={450} width={800} height={50} fill="#E9E3FF" />
    </>
  ),
};

/* ---------- the child's bedroom: where stories start and end ---------- */
const WINDOW_SKY = { day: ["#8FD3FF", "#DFF3FF"], sunset: ["#FFB86B", "#FF8FA3"], night: ["#141B52", "#3B2A7A"] };

function Home({ uid, time }: { uid: string; time: SceneDirection["time"] }) {
  const [top, bottom] = WINDOW_SKY[time];
  return (
    <>
      <rect width={800} height={500} fill={time === "night" ? "#C9B8F2" : "#FFE3B8"} />
      {[...Array(9)].map((_, i) => (
        <path key={i} d={`M${40 + i * 92} 40 l4 8 9 1 -6.5 6 1.5 9 -8-4.5 -8 4.5 1.5-9 -6.5-6 9-1z`} fill="#fff" opacity={0.35} />
      ))}
      {/* window */}
      <defs>
        <linearGradient id={`win-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
      </defs>
      <rect x={300} y={70} width={200} height={170} rx={16} fill={`url(#win-${uid})`} {...S} />
      {time === "night" ? (
        <>
          <circle cx={450} cy={115} r={22} fill="#FFF3B0" />
          {[[330, 100], [372, 150], [410, 96], [348, 200], [468, 190]].map(([x, y], i) => (
            <circle key={i} className="twinkle" style={{ animationDelay: `${-i * 0.5}s` }} cx={x} cy={y} r={3} fill="#fff" />
          ))}
        </>
      ) : (
        <circle cx={450} cy={120} r={24} fill={time === "sunset" ? "#FFE08A" : "#FFD95A"} />
      )}
      <path d="M400 70 V240 M300 155 H500" stroke={INK} strokeWidth={4} />
      <path d="M284 70 Q300 150 284 250 M516 70 Q500 150 516 250" fill="none" stroke="#FF7A6B" strokeWidth={18} strokeLinecap="round" />
      {/* shelf */}
      <rect x={590} y={150} width={170} height={12} rx={4} fill="#B9773E" {...S} />
      <rect x={604} y={104} width={18} height={46} fill="#7C5CFF" {...S} strokeWidth={3} />
      <rect x={624} y={112} width={16} height={38} fill="#5FE0B7" {...S} strokeWidth={3} />
      <rect x={642} y={100} width={20} height={50} fill="#FF7A6B" {...S} strokeWidth={3} />
      <circle cx={716} cy={128} r={22} fill="#6CC9FF" {...S} />
      <path d="M700 122 Q716 136 732 122" fill="none" stroke="#5FE0B7" strokeWidth={8} />
      {/* floor and rug */}
      <rect y={388} width={800} height={112} fill="#D99A5B" {...S} />
      <ellipse cx={430} cy={446} rx={230} ry={36} fill="#FF9ED2" {...S} />
      <ellipse cx={430} cy={446} rx={170} ry={22} fill="#FFC93C" />
      {/* bed */}
      <rect x={18} y={270} width={34} height={150} rx={12} fill="#B9773E" {...S} />
      <rect x={34} y={330} width={250} height={84} rx={18} fill="#6CC9FF" {...S} />
      <rect x={44} y={308} width={84} height={44} rx={18} fill="#fff" {...S} />
      <path d="M120 344 Q200 322 284 350 V414 H120 Z" fill="#7C5CFF" {...S} />
      {/* lamp */}
      <path d="M560 388 V300" stroke={INK} strokeWidth={5} />
      <path d="M534 300 L546 258 H574 L586 300 Z" fill="#FFC93C" {...S} />
      {time !== "day" && <circle className="buddy-pulse" cx={560} cy={300} r={46} fill="#FFE08A" opacity={0.35} />}
    </>
  );
}

/* ---------- camera: three framings of each world ---------- */
const CAMERA: Record<SceneDirection["place"], { scale: number; x: string; y: string }> = {
  home: { scale: 1, x: "0%", y: "0%" },
  world: { scale: 1, x: "0%", y: "0%" },
  near: { scale: 1.4, x: "19%", y: "-19%" },
  far: { scale: 1.4, x: "-19%", y: "-19%" },
};

/* ---------- acting ---------- */
type Loop = "walk" | "run" | "jump" | "float" | "bounce" | "shiver" | "dance";

const loops: Record<Loop, { animate: Record<string, (string | number)[]>; transition: Record<string, unknown> }> = {
  walk: { animate: { x: ["0%", "34%", "0%"] }, transition: { duration: 5, repeat: Infinity, ease: "easeInOut" } },
  run: { animate: { x: ["0%", "70%", "0%"] }, transition: { duration: 2.6, repeat: Infinity, ease: "easeInOut" } },
  jump: { animate: { y: ["0%", "-30%", "0%"] }, transition: { duration: 0.8, repeat: Infinity, repeatDelay: 0.35, ease: "easeOut" } },
  float: { animate: { y: ["0%", "-10%", "0%"], rotate: [-3, 3, -3] }, transition: { duration: 2.6, repeat: Infinity, ease: "easeInOut" } },
  bounce: { animate: { y: ["0%", "-14%", "0%"] }, transition: { duration: 0.6, repeat: Infinity, repeatDelay: 0.3 } },
  shiver: { animate: { x: ["-2%", "2%", "-2%"] }, transition: { duration: 0.16, repeat: Infinity } },
  dance: { animate: { rotate: [-12, 12, -12], y: ["0%", "-6%", "0%"] }, transition: { duration: 0.7, repeat: Infinity, ease: "easeInOut" } },
};

interface HeroStage {
  pose: KidPose;
  mood: KidMood;
  x: number;
  y: number;
  tilt?: number;
  loop?: Loop;
}

const HERO: Record<SceneDirection["hero"], HeroStage> = {
  stand: { pose: "idle", mood: "idle", x: 26, y: 5 },
  wave: { pose: "wave", mood: "happy", x: 26, y: 5 },
  walk: { pose: "idle", mood: "happy", x: 16, y: 5, loop: "walk" },
  run: { pose: "cheer", mood: "happy", x: 8, y: 5, tilt: 8, loop: "run" },
  jump: { pose: "cheer", mood: "happy", x: 27, y: 5, loop: "jump" },
  fly: { pose: "wave", mood: "happy", x: 22, y: 36, tilt: 14, loop: "float" },
  think: { pose: "idle", mood: "idle", x: 26, y: 5 },
  cheer: { pose: "cheer", mood: "happy", x: 26, y: 5, loop: "bounce" },
  sleep: { pose: "idle", mood: "sleep", x: 30, y: 2, tilt: -84 },
  hug: { pose: "cheer", mood: "happy", x: 37, y: 5 },
  look: { pose: "idle", mood: "wow", x: 26, y: 5 },
};

interface BuddyStage {
  mood: Mood;
  wave?: boolean;
  y?: number;
  loop?: Loop;
}

const BUDDY: Record<Exclude<SceneDirection["buddy"], "none">, BuddyStage> = {
  enter: { mood: "happy", wave: true },
  wave: { mood: "happy", wave: true },
  scared: { mood: "wow", loop: "shiver" },
  think: { mood: "think" },
  cheer: { mood: "happy", wave: true, loop: "bounce" },
  dance: { mood: "happy", loop: "dance" },
  sleep: { mood: "sleep" },
  walk: { mood: "happy", loop: "walk" },
  fly: { mood: "happy", y: 38, loop: "float" },
};

const PROP_SPOTS = [
  { left: "5%", bottom: "9%" },
  { right: "4%", bottom: "11%" },
  { left: "47%", bottom: "20%" },
];
const GUEST_SPOTS = [
  { left: "3%", bottom: "30%" },
  { right: "3%", bottom: "36%" },
];

/* ---------- weather and magic ---------- */
function Effect({ kind, still }: { kind: SceneDirection["effect"]; still: boolean }) {
  if (kind === "none" || kind === "shake") return null;
  if (kind === "confetti") return still ? null : <Confetti count={30} />;
  if (kind === "glow")
    return <div className="buddy-pulse absolute inset-0 bg-[radial-gradient(circle_at_60%_45%,rgba(255,240,170,0.75),transparent_55%)]" />;
  const dots = scatter(kind === "rain" ? 26 : kind === "wind" ? 6 : 12, 5.1);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {dots.map((p) => {
        const left = `${(p.x / 800) * 100}%`;
        const top = `${(p.y / 300) * 70}%`;
        const delay = `${-(p.k % 9) * 0.37}s`;
        if (kind === "rain") return <span key={p.k} className="fx-rain absolute -top-[10%] h-[9%] w-[0.5%] rounded-full bg-white/70" style={{ left, animationDelay: delay }} />;
        if (kind === "wind") return <span key={p.k} className="fx-wind absolute h-[1%] w-[18%] rounded-full bg-white/60" style={{ top, animationDelay: delay }} />;
        if (kind === "hearts") return <span key={p.k} className="rise absolute bottom-0 text-[5cqw]" style={{ left, animationDelay: delay, animationDuration: "5s" }}>💗</span>;
        if (kind === "bubbles") return <span key={p.k} className="rise absolute bottom-0 aspect-square w-[3%] rounded-full border-2 border-white/80" style={{ left, animationDelay: delay }} />;
        return <span key={p.k} className="twinkle absolute text-[4cqw] text-[#FFE08A]" style={{ left, top, animationDelay: delay }}>✦</span>;
      })}
    </div>
  );
}

interface SceneProps {
  themeId: string;
  beat: Beat;
  avatar: AvatarConfig;
  /** The page's own staging; without it the beat's default is used. */
  direction?: SceneDirection;
  className?: string;
  /** Tapping the scene scatters sparkles (on by default). */
  playful?: boolean;
  /** Frozen pose with no entrance or looping motion — used for the printed book. */
  still?: boolean;
}

/** One animated illustration: a place, a moment, and everyone acting in it. */
export default function Scene({ themeId, beat, avatar, direction, className, playful = true, still = false }: SceneProps) {
  const theme = themeById(themeId) ?? themeById("space")!;
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const dir = direction ?? defaultDirection(beat);
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number }[]>([]);

  const atHome = dir.place === "home";
  const backdropId = atHome ? `home-${dir.time}` : theme.id;
  const cam = CAMERA[dir.place];
  const closeUp = cam.scale > 1;
  const alreadyDark = theme.id === "space" || theme.id === "bedtime" || atHome;
  const tint =
    dir.time === "night" && !alreadyDark
      ? "linear-gradient(rgba(14,18,70,0.55), rgba(40,24,90,0.4))"
      : dir.time === "sunset" && !atHome
        ? "linear-gradient(rgba(255,150,80,0.38), rgba(255,110,150,0.2))"
        : beat === "problem"
          ? "linear-gradient(rgba(20,12,60,0.22), rgba(20,12,60,0.22))"
          : "";

  const hero = HERO[dir.hero];
  const heroAtHomeAsleep = dir.hero === "sleep" && atHome;
  const buddy = dir.buddy === "none" ? null : BUDDY[dir.buddy];
  const size = closeUp ? "25%" : "21%";
  const mark = beat === "problem" ? "❓" : beat === "idea" ? "💡" : dir.hero === "think" ? "💭" : "";
  const run = (loop?: Loop) => (loop && !still ? loops[loop] : null);

  const sparkle = (e: MouseEvent<HTMLDivElement>) => {
    if (!playful || still) return;
    const r = e.currentTarget.getBoundingClientRect();
    const spark = { id: Date.now(), x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 };
    setSparks((s) => [...s.slice(-5), spark]);
    setTimeout(() => setSparks((s) => s.filter((x) => x.id !== spark.id)), 900);
  };

  const heroLoop = run(hero.loop);
  const buddyLoop = run(buddy?.loop);

  return (
    <div
      className={cn("relative aspect-[16/10] w-full overflow-hidden rounded-[1.75rem] border-2 border-ink bg-ink", className)}
      style={{ containerType: "inline-size" }}
      onClick={sparkle}
      dir="ltr"
    >
      <motion.div
        className="absolute inset-0"
        animate={dir.effect === "shake" && !still ? { x: ["0%", "-1%", "1%", "-0.6%", "0%"] } : { x: "0%" }}
        transition={{ duration: 0.5, repeat: dir.effect === "shake" && !still ? Infinity : 0, repeatDelay: 0.9 }}
      >
        {/* the place, framed by the camera */}
        <motion.div
          className="absolute inset-0"
          initial={false}
          animate={{ scale: cam.scale, x: cam.x, y: cam.y }}
          transition={still ? { duration: 0 } : { type: "spring", stiffness: 50, damping: 15 }}
        >
          <AnimatePresence initial={false}>
            <motion.svg
              key={backdropId}
              viewBox="0 0 800 500"
              preserveAspectRatio="xMidYMid slice"
              className="absolute inset-0 h-full w-full"
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: still ? 0 : 0.6 }}
            >
              {atHome ? <Home uid={uid} time={dir.time} /> : (backdrops[theme.id] ?? backdrops.space)(uid)}
            </motion.svg>
          </AnimatePresence>
        </motion.div>

        {/* time of day */}
        <AnimatePresence initial={!still}>
          {tint && (
            <motion.div key={tint} className="absolute inset-0" style={{ background: tint }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          )}
        </AnimatePresence>
        {dir.time === "night" && !alreadyDark && (
          <svg viewBox="0 0 800 500" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
            <Stars n={22} seed={7.7} color="#FFF3B0" />
            <circle cx={690} cy={80} r={34} fill="#FFF3B0" {...S} strokeWidth={3} />
          </svg>
        )}

        <Effect kind={dir.effect === "confetti" ? "none" : dir.effect} still={still} />

        {/* friends dropping by */}
        <AnimatePresence initial={!still}>
          {dir.guests.slice(0, 2).map((g, i) => (
            <motion.div
              key={g}
              className="absolute w-[12%]"
              style={GUEST_SPOTS[i]}
              initial={{ scale: 0, y: "40%" }}
              animate={{ scale: 1, y: "0%" }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 200, damping: 13, delay: still ? 0 : 0.5 + i * 0.2 }}
            >
              <Buddy id={g} mood="happy" wave flip={i === 1} watch={false} pokable={!still} />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* objects */}
        <AnimatePresence initial={!still}>
          {dir.props.slice(0, 3).map((p, i) => (
            <motion.span
              key={`${p}-${i}`}
              aria-hidden
              className="scene-prop absolute text-[9cqw] leading-none"
              style={PROP_SPOTS[i]}
              initial={{ scale: 0, rotate: -40 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 12, delay: still ? 0 : 0.25 + i * 0.15 }}
            >
              <span className="buddy-wiggle inline-block" style={{ animationDelay: `${-i * 0.6}s` }}>
                {p}
              </span>
            </motion.span>
          ))}
        </AnimatePresence>

        {/* the companion */}
        <AnimatePresence initial={!still}>
          {buddy && (
            <motion.div
              key="buddy"
              className="absolute"
              style={{ width: size }}
              initial={{ right: "-30%", bottom: "7%", opacity: 0 }}
              animate={{ right: dir.hero === "hug" ? "33%" : "19%", bottom: `${buddy.y ?? 7}%`, opacity: 1 }}
              exit={{ right: "-30%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 70, damping: 13 }}
            >
              {dir.says && (
                <motion.div
                  key={dir.says}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 16, delay: still ? 0 : 0.7 }}
                  className="absolute bottom-[96%] left-1/2 w-max max-w-[150%] -translate-x-1/2 rounded-[2.2cqw] border-2 border-ink bg-paper px-[2cqw] py-[1cqw] text-center font-display text-[3.1cqw] font-semibold leading-tight text-ink"
                >
                  {dir.says}
                </motion.div>
              )}
              <motion.div animate={buddyLoop?.animate ?? { x: "0%", y: "0%", rotate: 0 }} transition={buddyLoop?.transition}>
                <Buddy id={theme.buddy} mood={buddy.mood} wave={!!buddy.wave} flip watch={false} pokable={!still} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* the hero */}
        <motion.div
          className="absolute"
          style={{ width: size }}
          initial={false}
          animate={{
            left: `${heroAtHomeAsleep ? 9 : hero.x}%`,
            bottom: `${heroAtHomeAsleep ? 19 : hero.y}%`,
            rotate: hero.tilt ?? 0,
          }}
          transition={still ? { duration: 0 } : { type: "spring", stiffness: 60, damping: 14 }}
        >
          <motion.div key={dir.hero} animate={heroLoop?.animate ?? { x: "0%", y: "0%", rotate: 0 }} transition={heroLoop?.transition}>
            <KidAvatar config={avatar} pose={hero.pose} mood={hero.mood} />
          </motion.div>
        </motion.div>

        {dir.effect === "confetti" && <Effect kind="confetti" still={still} />}
      </motion.div>

      {/* comic-book sound */}
      <AnimatePresence mode="wait" initial={!still}>
        {dir.sfx && (
          <motion.div
            key={dir.sfx}
            aria-hidden
            className="absolute left-[4%] top-[6%] max-w-[46%] rounded-[2cqw] border-2 border-ink bg-sun px-[2.4cqw] py-[1cqw] font-display text-[4.4cqw] font-bold leading-none text-ink shadow-pop-sm"
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: -7 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 11, delay: still ? 0 : 0.4 }}
          >
            {dir.sfx}
          </motion.div>
        )}
      </AnimatePresence>

      {/* what the moment is about */}
      <AnimatePresence mode="wait" initial={!still}>
        {mark && (
          <motion.div
            key={mark}
            aria-hidden
            className="absolute left-1/2 top-[8%] text-[10cqw] leading-none drop-shadow-lg"
            initial={{ scale: 0, x: "-50%", rotate: -30 }}
            animate={still ? { scale: 1, x: "-50%", rotate: 0 } : { scale: [1, 1.15, 1], x: "-50%", rotate: [0, 8, -8, 0] }}
            exit={{ scale: 0, x: "-50%" }}
            transition={{ scale: { duration: 1.6, repeat: still ? 0 : Infinity }, rotate: { duration: 2.4, repeat: still ? 0 : Infinity } }}
          >
            {mark}
          </motion.div>
        )}
      </AnimatePresence>

      {sparks.map((s) => (
        <span key={s.id} aria-hidden className="pointer-events-none absolute" style={{ left: `${s.x}%`, top: `${s.y}%` }}>
          {["✨", "⭐", "✨", "💫", "⭐"].map((e, i) => {
            const a = (i / 5) * Math.PI * 2;
            return (
              <motion.span
                key={i}
                className="absolute text-[4cqw]"
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
                animate={{ x: Math.cos(a) * 60, y: Math.sin(a) * 60, opacity: 0, scale: 1.2 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                {e}
              </motion.span>
            );
          })}
        </span>
      ))}
    </div>
  );
}
