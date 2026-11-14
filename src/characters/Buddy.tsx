import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { motion, useSpring, type MotionValue } from "framer-motion";
import { cn } from "../utils/cn";

/**
 * The LittleHero cast. Every character is drawn here as live SVG:
 * they breathe, blink, follow the pointer with their eyes, wave,
 * and hop when you poke them.
 */
export type BuddyId =
  | "lumi"
  | "bolt"
  | "pinso"
  | "trixie"
  | "champi"
  | "zap"
  | "plouf"
  | "kiki"
  | "nour";
export type Mood = "idle" | "happy" | "wow" | "think" | "sleep";

export const BUDDY_IDS: BuddyId[] = [
  "lumi",
  "bolt",
  "pinso",
  "trixie",
  "champi",
  "zap",
  "plouf",
  "kiki",
  "nour",
];

const INK = "#231942";
const S = {
  stroke: INK,
  strokeWidth: 4,
  strokeLinejoin: "round" as const,
  strokeLinecap: "round" as const,
};

/* ---------- one shared pointer listener for every character ---------- */
const pointer = { x: -1, y: -1 };
const watchers = new Set<() => void>();
let scheduled = false;
if (typeof window !== "undefined") {
  window.addEventListener(
    "pointermove",
    (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        watchers.forEach((w) => w());
      });
    },
    { passive: true }
  );
}

function useLook(ref: RefObject<SVGSVGElement | null>, enabled: boolean) {
  const x = useSpring(0, { stiffness: 220, damping: 22 });
  const y = useSpring(0, { stiffness: 220, damping: 22 });
  useEffect(() => {
    if (!enabled) return;
    const watch = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      const dx = pointer.x - (r.left + r.width / 2);
      const dy = pointer.y - (r.top + r.height * 0.4);
      const d = Math.hypot(dx, dy) || 1;
      const k = Math.min(1, d / 140) * 3.4;
      x.set((dx / d) * k);
      y.set((dy / d) * k);
    };
    watchers.add(watch);
    return () => {
      watchers.delete(watch);
    };
  }, [enabled, ref, x, y]);
  return { x, y };
}

type Look = { x: MotionValue<number>; y: MotionValue<number> };

/* ---------- face ---------- */
interface FaceProps {
  cx: number;
  cy: number;
  mood: Mood;
  look: Look;
  gap?: number;
  r?: number;
  mouthDy?: number;
  cheekY?: number;
  cheeks?: boolean;
  glow?: boolean; // robot screen face
}

function Face({ cx, cy, mood, look, gap = 18, r = 9, mouthDy = 22, cheekY, cheeks = true, glow = false }: FaceProps) {
  const line = glow ? "#7CF5FF" : INK;
  const my = cy + mouthDy;
  const eyeR = mood === "wow" ? r + 2 : r;
  const fixed = mood === "think" ? { x: -3, y: -3 } : null;

  return (
    <g>
      {cheeks && !glow && (
        <>
          <circle cx={cx - gap - 13} cy={cheekY ?? cy + 14} r={7} fill="#FF8FA3" opacity={0.55} />
          <circle cx={cx + gap + 13} cy={cheekY ?? cy + 14} r={7} fill="#FF8FA3" opacity={0.55} />
        </>
      )}

      {mood === "sleep" ? (
        <g fill="none" stroke={line} strokeWidth={4} strokeLinecap="round">
          <path d={`M${cx - gap - 7} ${cy} q7 7 14 0`} />
          <path d={`M${cx + gap - 7} ${cy} q7 7 14 0`} />
        </g>
      ) : (
        <g className="buddy-blink">
          {[-1, 1].map((side) => {
            const ex = cx + side * gap;
            return glow ? (
              <motion.circle key={side} cx={ex} cy={cy} r={eyeR - 1} fill={line} style={fixed ?? { x: look.x, y: look.y }} />
            ) : (
              <g key={side}>
                <circle cx={ex} cy={cy} r={eyeR} fill="#fff" stroke={INK} strokeWidth={3} />
                <motion.g style={fixed ?? { x: look.x, y: look.y }}>
                  <circle cx={ex} cy={cy} r={eyeR * 0.55} fill={INK} />
                  <circle cx={ex + 1.6} cy={cy - 1.8} r={eyeR * 0.2} fill="#fff" />
                </motion.g>
              </g>
            );
          })}
        </g>
      )}

      {mood === "happy" && (
        <g>
          <path d={`M${cx - 12} ${my - 3} Q${cx} ${my + 17} ${cx + 12} ${my - 3} Z`} fill={glow ? line : "#4A1D2E"} stroke={line} strokeWidth={3} strokeLinejoin="round" />
          {!glow && <ellipse cx={cx} cy={my + 6} rx={5} ry={3} fill="#FF8FA3" />}
        </g>
      )}
      {mood === "idle" && (
        <path d={`M${cx - 9} ${my} Q${cx} ${my + 9} ${cx + 9} ${my}`} fill="none" stroke={line} strokeWidth={4} strokeLinecap="round" />
      )}
      {mood === "wow" && <ellipse cx={cx} cy={my + 3} rx={5} ry={7} fill={glow ? line : "#4A1D2E"} stroke={line} strokeWidth={3} />}
      {mood === "think" && (
        <path d={`M${cx - 7} ${my + 4} Q${cx} ${my} ${cx + 8} ${my + 5}`} fill="none" stroke={line} strokeWidth={4} strokeLinecap="round" />
      )}
      {mood === "sleep" && <ellipse cx={cx} cy={my + 2} rx={4} ry={4} fill={glow ? line : "#4A1D2E"} />}
    </g>
  );
}

/* ---------- waving arm ---------- */
function Arm({ wave, pivot, children }: { wave: boolean; pivot: [number, number]; children: ReactNode }) {
  return (
    <g className={wave ? "buddy-wave" : "buddy-arm"} style={{ transformOrigin: `${pivot[0]}px ${pivot[1]}px` }}>
      {children}
    </g>
  );
}

function starPath(cx: number, cy: number, outer: number, inner: number, rot = -90) {
  let d = "";
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? inner : outer;
    const a = ((rot + i * 36) * Math.PI) / 180;
    d += `${i ? "L" : "M"}${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)} `;
  }
  return d + "Z";
}

/* ---------- shared two-legged body ---------- */
interface BipedProps {
  body: string;
  belly: string;
  feet: string;
  head?: string;
  wave: boolean;
  back?: ReactNode;
  behindHead?: ReactNode;
  onBody?: ReactNode;
  onHead?: ReactNode;
  face: ReactNode;
}

function Biped({ body, belly, feet, head, wave, back, behindHead, onBody, onHead, face }: BipedProps) {
  return (
    <>
      {back}
      <ellipse cx={82} cy={192} rx={15} ry={9} fill={feet} {...S} />
      <ellipse cx={118} cy={192} rx={15} ry={9} fill={feet} {...S} />
      <ellipse cx={58} cy={152} rx={11} ry={22} transform="rotate(18 58 152)" fill={body} {...S} />
      <ellipse cx={100} cy={154} rx={42} ry={39} fill={body} {...S} />
      <ellipse cx={100} cy={162} rx={25} ry={25} fill={belly} />
      {onBody}
      <Arm wave={wave} pivot={[138, 138]}>
        <ellipse cx={142} cy={152} rx={11} ry={22} transform="rotate(-18 142 152)" fill={body} {...S} />
      </Arm>
      {behindHead}
      <circle cx={100} cy={84} r={48} fill={head ?? body} {...S} />
      {onHead}
      {face}
    </>
  );
}

/* ---------- the nine characters ---------- */
type Draw = (p: { mood: Mood; look: Look; wave: boolean }) => ReactNode;

const draw: Record<BuddyId, Draw> = {
  // Lumi — the lion cub in a hero cape. Our guide.
  lumi: ({ mood, look, wave }) => (
    <Biped
      body="#FFC93C"
      belly="#FFF1C9"
      feet="#FF9F1C"
      wave={wave}
      back={<path className="buddy-cape" d="M66 122 Q26 168 42 200 Q100 184 158 200 Q174 168 134 122 Z" fill="#FF7A6B" {...S} />}
      behindHead={
        <>
          {[...Array(12)].map((_, i) => {
            const a = (i * 30 * Math.PI) / 180;
            return <circle key={i} cx={100 + 47 * Math.cos(a)} cy={84 + 47 * Math.sin(a)} r={17} fill="#FF9F1C" {...S} />;
          })}
          <circle cx={62} cy={42} r={14} fill="#FFC93C" {...S} />
          <circle cx={138} cy={42} r={14} fill="#FFC93C" {...S} />
          <circle cx={62} cy={43} r={6} fill="#FFB5A7" />
          <circle cx={138} cy={43} r={6} fill="#FFB5A7" />
        </>
      }
      onBody={<path d={starPath(100, 160, 13, 6)} fill="#FF7A6B" stroke={INK} strokeWidth={3} strokeLinejoin="round" />}
      onHead={
        <>
          <ellipse cx={100} cy={106} rx={21} ry={15} fill="#FFF1C9" />
          <path d="M93 96 L107 96 L100 104 Z" fill="#8B4A2B" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        </>
      }
      face={<Face cx={100} cy={80} mood={mood} look={look} mouthDy={28} />}
    />
  ),

  // Bolt — the bip-bip robot of the space stories.
  bolt: ({ mood, look, wave }) => (
    <>
      <rect x={72} y={184} width={22} height={15} rx={6} fill="#9AA5B1" {...S} />
      <rect x={106} y={184} width={22} height={15} rx={6} fill="#9AA5B1" {...S} />
      <ellipse cx={54} cy={152} rx={10} ry={21} transform="rotate(16 54 152)" fill="#9AA5B1" {...S} />
      <rect x={90} y={114} width={20} height={16} fill="#9AA5B1" {...S} />
      <rect x={60} y={126} width={80} height={62} rx={20} fill="#6CC9FF" {...S} />
      <rect x={78} y={140} width={44} height={28} rx={8} fill="#FFF7EA" {...S} />
      <circle className="buddy-pulse" cx={100} cy={154} r={7} fill="#FF7A6B" stroke={INK} strokeWidth={3} />
      <Arm wave={wave} pivot={[142, 138]}>
        <ellipse cx={146} cy={152} rx={10} ry={21} transform="rotate(-16 146 152)" fill="#9AA5B1" {...S} />
      </Arm>
      <path d="M100 36 V16" {...S} fill="none" />
      <circle className="buddy-pulse" cx={100} cy={12} r={8} fill="#FFC93C" {...S} />
      <rect x={34} y={66} width={14} height={28} rx={5} fill="#9AA5B1" {...S} />
      <rect x={152} y={66} width={14} height={28} rx={5} fill="#9AA5B1" {...S} />
      <rect x={46} y={36} width={108} height={86} rx={24} fill="#6CC9FF" {...S} />
      <rect x={58} y={50} width={84} height={58} rx={16} fill={INK} />
      <Face cx={100} cy={72} mood={mood} look={look} gap={17} r={8} mouthDy={17} glow />
    </>
  ),

  // Pinso — the little pirate crab.
  pinso: ({ mood, look, wave }) => (
    <>
      <g fill="none" {...S} strokeWidth={6}>
        <path d="M50 156 L30 178" />
        <path d="M60 168 L46 192" />
        <path d="M150 156 L170 178" />
        <path d="M140 168 L154 192" />
      </g>
      <path d="M48 126 L30 98" fill="none" {...S} strokeWidth={6} />
      <circle cx={26} cy={84} r={18} fill="#FF7A6B" {...S} />
      <path d="M26 84 L12 68 L34 64 Z" fill="#FFF7EA" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <Arm wave={wave} pivot={[152, 126]}>
        <path d="M152 126 L170 98" fill="none" {...S} strokeWidth={6} />
        <circle cx={174} cy={84} r={18} fill="#FF7A6B" {...S} />
        <path d="M174 84 L188 68 L166 64 Z" fill="#FFF7EA" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      </Arm>
      <path d="M84 104 L80 74 M116 104 L120 74" fill="none" {...S} strokeWidth={6} />
      <ellipse cx={100} cy={142} rx={58} ry={44} fill="#FF7A6B" {...S} />
      <ellipse cx={100} cy={160} rx={34} ry={18} fill="#FFB5A7" />
      <Face cx={100} cy={64} mood={mood} look={look} gap={20} r={11} mouthDy={72} cheekY={132} />
      {/* eye patch */}
      <path d="M62 50 L134 46" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
      <circle cx={80} cy={64} r={13} fill={INK} />
    </>
  ),

  // Trixie — the triceratops detective.
  trixie: ({ mood, look, wave }) => (
    <Biped
      body="#5FE0B7"
      belly="#D9FBEF"
      feet="#3CBF9A"
      wave={wave}
      back={<path d="M134 174 Q184 182 180 146 Q160 162 136 152 Z" fill="#5FE0B7" {...S} />}
      behindHead={
        <>
          <circle cx={100} cy={76} r={63} fill="#3CBF9A" {...S} />
          {[...Array(7)].map((_, i) => {
            const a = ((200 + i * 23.3) * Math.PI) / 180;
            return <circle key={i} cx={100 + 51 * Math.cos(a)} cy={76 + 51 * Math.sin(a)} r={6} fill="#BDF5E3" />;
          })}
        </>
      }
      onHead={
        <>
          <path d="M70 52 Q58 22 66 10 Q82 24 88 44 Z" fill="#FFF7EA" {...S} />
          <path d="M130 52 Q142 22 134 10 Q118 24 112 44 Z" fill="#FFF7EA" {...S} />
          <path d="M92 104 Q100 80 108 104 Z" fill="#FFF7EA" {...S} />
        </>
      }
      face={<Face cx={100} cy={80} mood={mood} look={look} gap={22} mouthDy={34} />}
    />
  ),

  // Champi — the shy mushroom of the Enchanted Forest.
  champi: ({ mood, look, wave }) => (
    <>
      <ellipse cx={86} cy={194} rx={14} ry={8} fill="#F3D9B1" {...S} />
      <ellipse cx={114} cy={194} rx={14} ry={8} fill="#F3D9B1" {...S} />
      <ellipse cx={60} cy={152} rx={9} ry={18} transform="rotate(20 60 152)" fill="#FFF1D6" {...S} />
      <rect x={64} y={92} width={72} height={100} rx={32} fill="#FFF1D6" {...S} />
      <Arm wave={wave} pivot={[136, 140]}>
        <ellipse cx={140} cy={152} rx={9} ry={18} transform="rotate(-20 140 152)" fill="#FFF1D6" {...S} />
      </Arm>
      <path d="M100 24 Q104 6 120 8 Q116 22 100 24 Z" fill="#5FE0B7" {...S} strokeWidth={3} />
      <path d="M20 100 Q20 26 100 22 Q180 26 180 100 Q180 114 160 114 L40 114 Q20 114 20 100 Z" fill="#FF6B8B" {...S} />
      <circle cx={60} cy={64} r={13} fill="#fff" />
      <circle cx={104} cy={48} r={10} fill="#fff" />
      <circle cx={142} cy={70} r={12} fill="#fff" />
      <circle cx={88} cy={94} r={7} fill="#fff" />
      <circle cx={126} cy={98} r={6} fill="#fff" />
      <Face cx={100} cy={140} mood={mood} look={look} gap={15} r={8} mouthDy={19} />
    </>
  ),

  // Zap — the masked bunny super-hero.
  zap: ({ mood, look, wave }) => (
    <Biped
      body="#F1EAFF"
      belly="#FFFFFF"
      feet="#D8C7FF"
      wave={wave}
      behindHead={
        <>
          <ellipse cx={76} cy={24} rx={14} ry={36} transform="rotate(-8 76 24)" fill="#F1EAFF" {...S} />
          <ellipse cx={76} cy={26} rx={6} ry={24} transform="rotate(-8 76 26)" fill="#FF9ED2" />
          <ellipse cx={126} cy={24} rx={14} ry={36} transform="rotate(16 126 24)" fill="#F1EAFF" {...S} />
          <ellipse cx={126} cy={26} rx={6} ry={24} transform="rotate(16 126 26)" fill="#FF9ED2" />
        </>
      }
      onBody={<path d="M105 140 L90 162 L100 162 L94 182 L113 156 L103 156 Z" fill="#FFC93C" stroke={INK} strokeWidth={3} strokeLinejoin="round" />}
      onHead={
        <>
          <path d="M53 72 Q100 56 147 72 Q151 86 147 98 Q100 84 53 98 Q49 86 53 72 Z" fill="#7C5CFF" {...S} strokeWidth={3} />
          <ellipse cx={100} cy={101} rx={5} ry={3.5} fill="#FF9ED2" stroke={INK} strokeWidth={2.5} />
        </>
      }
      face={<Face cx={100} cy={84} mood={mood} look={look} mouthDy={24} cheekY={106} />}
    />
  ),

  // Plouf — the octopus who waves with all eight arms.
  plouf: ({ mood, look, wave }) => {
    const legs = ["M62 128 Q40 160 54 190", "M80 138 Q70 170 84 196", "M100 140 Q100 172 100 198", "M120 138 Q130 170 116 196", "M138 128 Q160 160 146 190"];
    return (
      <>
        {legs.map((d, i) => (
          <g key={i} className="buddy-wiggle" style={{ animationDelay: `${i * -0.35}s`, transformOrigin: "100px 130px" }} fill="none" strokeLinecap="round">
            <path d={d} stroke={INK} strokeWidth={19} />
            <path d={d} stroke="#C4A1FF" strokeWidth={11} />
          </g>
        ))}
        <g fill="none" strokeLinecap="round">
          <path d="M48 112 Q20 108 22 80" stroke={INK} strokeWidth={19} />
          <path d="M48 112 Q20 108 22 80" stroke="#C4A1FF" strokeWidth={11} />
        </g>
        <Arm wave={wave} pivot={[152, 112]}>
          <g fill="none" strokeLinecap="round">
            <path d="M152 112 Q180 108 178 80" stroke={INK} strokeWidth={19} />
            <path d="M152 112 Q180 108 178 80" stroke="#C4A1FF" strokeWidth={11} />
          </g>
        </Arm>
        <ellipse cx={100} cy={88} rx={58} ry={56} fill="#C4A1FF" {...S} />
        <circle cx={66} cy={52} r={9} fill="#E6D6FF" />
        <circle cx={132} cy={46} r={7} fill="#E6D6FF" />
        <circle cx={146} cy={68} r={4} fill="#E6D6FF" />
        <Face cx={100} cy={92} mood={mood} look={look} gap={20} r={10} mouthDy={22} />
      </>
    );
  },

  // Kiki — the cheeky monkey of the jungle.
  kiki: ({ mood, look, wave }) => (
    <Biped
      body="#B5713C"
      belly="#F3D2A9"
      feet="#8F5527"
      wave={wave}
      back={
        <g fill="none" strokeLinecap="round">
          <path d="M136 176 Q184 176 178 140 Q174 118 156 128 Q146 136 158 144" stroke={INK} strokeWidth={15} />
          <path d="M136 176 Q184 176 178 140 Q174 118 156 128 Q146 136 158 144" stroke="#B5713C" strokeWidth={7} />
        </g>
      }
      behindHead={
        <>
          <circle cx={50} cy={84} r={18} fill="#B5713C" {...S} />
          <circle cx={150} cy={84} r={18} fill="#B5713C" {...S} />
          <circle cx={50} cy={84} r={9} fill="#F3D2A9" />
          <circle cx={150} cy={84} r={9} fill="#F3D2A9" />
        </>
      }
      onHead={
        <>
          <path d="M90 40 Q100 20 110 40" fill="none" {...S} />
          <circle cx={82} cy={80} r={21} fill="#F3D2A9" />
          <circle cx={118} cy={80} r={21} fill="#F3D2A9" />
          <ellipse cx={100} cy={104} rx={30} ry={22} fill="#F3D2A9" />
        </>
      }
      face={<Face cx={100} cy={80} mood={mood} look={look} mouthDy={28} />}
    />
  ),

  // Nour — the sleepy star in a night cap.
  nour: ({ mood, look }) => {
    const star = starPath(100, 116, 76, 40);
    return (
      <>
        <path d={star} fill="none" stroke={INK} strokeWidth={24} strokeLinejoin="round" />
        <path d={star} fill="#FFD95A" stroke="#FFD95A" strokeWidth={16} strokeLinejoin="round" />
        <path d="M66 64 Q92 0 142 30 Q120 36 116 62 Z" fill="#6CC9FF" {...S} />
        <path d="M64 66 Q90 52 118 62" fill="none" stroke="#fff" strokeWidth={9} strokeLinecap="round" />
        <circle cx={144} cy={30} r={10} fill="#fff" {...S} />
        <Face cx={100} cy={112} mood={mood} look={look} gap={17} mouthDy={20} />
      </>
    );
  },
};

/* ---------- public component ---------- */
interface BuddyProps {
  id: BuddyId;
  mood?: Mood;
  wave?: boolean;
  className?: string;
  /** Mirror the character so it faces the other way. */
  flip?: boolean;
  /** Eyes follow the pointer (default on). */
  watch?: boolean;
  /** Tap to make it hop (default on). */
  pokable?: boolean;
  onPoke?: () => void;
  label?: string;
}

export default function Buddy({ id, mood = "idle", wave, className, flip, watch = true, pokable = true, onPoke, label }: BuddyProps) {
  const ref = useRef<SVGSVGElement>(null);
  const look = useLook(ref, watch && mood !== "sleep");
  const [poked, setPoked] = useState(0);
  const [giggle, setGiggle] = useState(false);
  const delay = useMemo(() => `${-(Math.random() * 4).toFixed(2)}s`, []);

  useEffect(() => {
    if (!poked) return;
    setGiggle(true);
    const t = setTimeout(() => setGiggle(false), 1100);
    return () => clearTimeout(t);
  }, [poked]);

  const shownMood: Mood = giggle ? "happy" : mood;
  const waving = wave ?? (giggle || mood === "happy");

  const poke = () => {
    if (!pokable) return;
    setPoked((n) => n + 1);
    onPoke?.();
  };

  return (
    <motion.div
      className={cn("relative select-none", pokable && "cursor-pointer", className)}
      onClick={poke}
      role={pokable ? "button" : "img"}
      aria-label={label ?? id}
      tabIndex={pokable ? 0 : undefined}
      onKeyDown={(e) => {
        if (pokable && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          poke();
        }
      }}
      whileHover={pokable ? { scale: 1.05 } : undefined}
      whileTap={pokable ? { scale: 0.92 } : undefined}
    >
      <motion.div
        key={poked}
        animate={poked ? { y: [0, -22, 0, -8, 0], rotate: [0, -6, 6, -3, 0] } : undefined}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <svg
          ref={ref}
          viewBox="0 0 200 210"
          className="buddy-bob block h-auto w-full overflow-visible"
          style={{ animationDelay: delay, transform: flip ? "scaleX(-1)" : undefined, ["--blink-delay" as string]: delay }}
          aria-hidden
        >
          <ellipse cx={100} cy={203} rx={46} ry={6} fill={INK} opacity={0.12} />
          {draw[id]({ mood: shownMood, look, wave: waving })}
          {shownMood === "sleep" && (
            <g className="buddy-zzz" fill={INK} fontFamily="Fredoka, sans-serif" fontWeight={700}>
              <text x={150} y={44} fontSize={22}>z</text>
              <text x={166} y={26} fontSize={16}>z</text>
            </g>
          )}
        </svg>
      </motion.div>
    </motion.div>
  );
}

/* ---------- speech bubble ---------- */
export function Speech({
  children,
  className,
  tail = "start",
}: {
  children: ReactNode;
  className?: string;
  tail?: "start" | "end" | "bottom";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.7, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.7 }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
      className={cn(
        "relative rounded-3xl border-2 border-ink bg-paper px-4 py-3 font-display font-medium leading-snug text-ink shadow-pop-sm",
        className
      )}
    >
      {children}
      <span
        aria-hidden
        className={cn(
          "absolute h-4 w-4 rotate-45 border-ink bg-paper",
          tail === "start" && "top-6 ltr:-left-2 ltr:border-b-2 ltr:border-l-2 rtl:-right-2 rtl:border-r-2 rtl:border-t-2",
          tail === "end" && "top-6 ltr:-right-2 ltr:border-r-2 ltr:border-t-2 rtl:-left-2 rtl:border-b-2 rtl:border-l-2",
          tail === "bottom" && "-bottom-2 start-8 border-b-2 border-e-2"
        )}
      />
    </motion.div>
  );
}
