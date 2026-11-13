import { AnimatePresence, motion } from "framer-motion";
import Buddy from "../characters/Buddy";
import KidAvatar, { type AvatarConfig } from "../characters/KidAvatar";
import { useLanguage } from "../i18n/LanguageContext";
import { themeById } from "../data";
import { cn } from "../utils/cn";

interface StoryCoverProps {
  name: string;
  themeId: string;
  avatar: AvatarConfig;
  /** Overrides the theme's default title (used for finished stories). */
  title?: string;
  className?: string;
}

/**
 * The story's cover: the child's avatar with the companion of the chosen
 * world. Everything is sized in container units, so it scales from a
 * thumbnail to the hero.
 */
export default function StoryCover({ name, themeId, avatar, title, className }: StoryCoverProps) {
  const { t } = useLanguage();
  const theme = themeById(themeId);
  const background = theme
    ? `linear-gradient(150deg, ${theme.from}, ${theme.to})`
    : "linear-gradient(150deg, #7c5cff, #ff7a6b)";
  const hero = name.trim() || t("cover.yourHero");
  const heading = title ?? (theme ? t(`theme.${theme.id}.title`, { name: hero }) : hero);

  return (
    <div
      className={cn("relative aspect-[3/4] overflow-hidden rounded-[7%/5.5%] border-2 border-ink text-white shadow-pop-lg", className)}
      style={{ containerType: "inline-size" }}
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={themeId || "none"}
          className="absolute inset-0"
          style={{ background }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.35),transparent_55%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[30%] rounded-t-[100%] bg-white/15" />
      <div className="absolute inset-y-0 start-0 w-[4%] bg-black/15" />

      <div className="relative flex h-full flex-col items-center p-[6cqw] ps-[9cqw] text-center">
        <span className="rounded-full bg-white/20 px-[3cqw] py-[1.2cqw] text-[3.2cqw] font-bold uppercase tracking-[0.18em] backdrop-blur" dir="ltr">
          LittleHero
        </span>
        <span
          className="mt-[4cqw] font-display font-bold leading-[1.05] drop-shadow-md"
          style={{ fontSize: heading.length > 26 ? "7.4cqw" : heading.length > 16 ? "8.6cqw" : "10.5cqw" }}
        >
          {heading}
        </span>
      </div>

      <div className="absolute bottom-[1%] start-[14%] w-[50%]" dir="ltr">
        <KidAvatar config={avatar} pose="wave" mood="happy" />
      </div>
      <AnimatePresence mode="popLayout">
        {theme && (
          <motion.div
            key={theme.buddy}
            className="absolute bottom-[3%] end-[5%] w-[36%]"
            initial={{ scale: 0, rotate: 30 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 16 }}
          >
            <Buddy id={theme.buddy} mood="happy" wave={false} flip watch={false} pokable={false} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
