import { useEffect, useMemo, useRef, useState, type MouseEvent, type ReactNode } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  type HTMLMotionProps,
} from "framer-motion";
import { cn } from "../utils/cn";

const INK = "#231942";

/* ---------- Button ---------- */
const variants = {
  sun: "bg-sun text-ink",
  coral: "bg-coral text-ink",
  mint: "bg-mint text-ink",
  paper: "bg-paper text-ink",
  ink: "bg-ink text-white",
};
const sizes = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  children: ReactNode;
}

/** Chunky "sticker" button that physically presses down when tapped. */
export function Button({ variant = "sun", size = "md", className, children, ...rest }: ButtonProps) {
  return (
    <motion.button
      type="button"
      initial={false}
      style={{ boxShadow: `4px 4px 0px 0px ${INK}` }}
      whileHover={{ y: -2, x: -1, boxShadow: `6px 7px 0px 0px ${INK}` }}
      whileTap={{ y: 3, x: 3, boxShadow: `1px 1px 0px 0px ${INK}` }}
      transition={{ type: "spring", stiffness: 500, damping: 22 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full border-2 border-ink font-display font-semibold leading-none select-none",
        "disabled:opacity-40 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

/* ---------- Scroll reveal ---------- */
export function Reveal({
  children,
  delay = 0,
  className,
  y = 32,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ---------- Section heading ---------- */
export function SectionHead({
  kicker,
  title,
  sub,
  light = false,
  color = "bg-sun",
}: {
  kicker: string;
  title: ReactNode;
  sub?: string;
  light?: boolean;
  color?: string;
}) {
  return (
    <Reveal className="mx-auto max-w-2xl text-center">
      <motion.span
        initial={{ rotate: -8, scale: 0.8 }}
        whileInView={{ rotate: -2, scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 260, damping: 12 }}
        className={cn(
          "inline-block rounded-full border-2 border-ink px-4 py-1.5 font-display text-sm font-semibold text-ink shadow-pop-sm",
          color
        )}
      >
        {kicker}
      </motion.span>
      <h2
        className={cn(
          "mt-5 font-display text-4xl font-bold leading-[1.1] sm:text-5xl",
          light ? "text-white" : "text-ink"
        )}
      >
        {title}
      </h2>
      {sub && (
        <p className={cn("mt-4 text-lg", light ? "text-white/75" : "text-ink/70")}>{sub}</p>
      )}
    </Reveal>
  );
}

/* ---------- 3D tilt on pointer ---------- */
export function Tilt({
  children,
  className,
  max = 12,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const cfg = { stiffness: 180, damping: 16 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), cfg);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), cfg);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className={className} style={{ perspective: 1000 }} onMouseMove={onMove} onMouseLeave={onLeave}>
      <motion.div style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}>{children}</motion.div>
    </div>
  );
}

/* ---------- Count-up number ---------- */
export function CountUp({
  to,
  decimals = 0,
  suffix = "",
}: {
  to: number;
  decimals?: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { duration: 1.6, ease: "easeOut", onUpdate: setValue });
    return () => controls.stop();
  }, [inView, to]);

  const text = decimals
    ? value.toFixed(decimals)
    : Math.round(value).toLocaleString("en-US");
  return (
    <span ref={ref} dir="ltr">
      {text}
      {suffix}
    </span>
  );
}

/* ---------- Emoji confetti burst ---------- */
const CONFETTI = ["🎉", "⭐", "✨", "🎈", "💛", "🌈", "🎊", "💫"];

export function Confetti({ count = 30 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        emoji: CONFETTI[i % CONFETTI.length],
        x: (Math.random() - 0.5) * 700,
        up: -(Math.random() * 320 + 140),
        rotate: Math.random() * 720 - 360,
        delay: Math.random() * 0.25,
        scale: 0.7 + Math.random() * 0.9,
      })),
    [count]
  );
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center overflow-hidden"
    >
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute text-2xl"
          initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
          animate={{
            x: p.x,
            y: [0, p.up, p.up + 620],
            opacity: [0, 1, 1, 0],
            rotate: p.rotate,
            scale: p.scale,
          }}
          transition={{ duration: 2.6, delay: p.delay, ease: "easeOut" }}
        >
          {p.emoji}
        </motion.span>
      ))}
    </div>
  );
}

/* ---------- Hand-drawn underline ---------- */
export function Squiggle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 14" preserveAspectRatio="none" className={className} aria-hidden>
      <motion.path
        d="M3 9 C 30 2, 50 13, 78 7 S 130 2, 158 8 S 190 10, 197 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.9, delay: 0.5, ease: "easeOut" }}
      />
    </svg>
  );
}

/* ---------- Logo ---------- */
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" dir="ltr">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-ink bg-sun text-lg shadow-pop-sm animate-wiggle">
        📖
      </span>
      <span className={cn("font-display text-xl font-bold", light ? "text-white" : "text-ink")}>
        Little<span className="text-coral">Hero</span>
      </span>
    </span>
  );
}
