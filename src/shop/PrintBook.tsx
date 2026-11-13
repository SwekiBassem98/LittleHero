import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useStory } from "../state/StoryContext";
import StoryCover from "../components/StoryCover";
import Buddy from "../characters/Buddy";
import Scene from "../story/Scene";
import { themeById } from "../data";
import type { SavedStory } from "../story/types";

/** The text of each page, with the child's own choice applied. */
export function pageText(saved: SavedStory, index: number) {
  const page = saved.story.pages[index];
  const choice = saved.story.choice;
  if (page.beat === "idea" && choice) return choice.options[saved.pick ?? 0]?.text ?? page.text;
  return page.text;
}

/**
 * The story laid out as a landscape picture book. It is invisible on screen
 * and becomes the whole document when printing, so "Save as PDF" in the
 * browser's print dialog produces the book — with correct Arabic shaping,
 * crisp vector illustrations and the app's own fonts.
 */
export default function PrintBook() {
  const { printing, printStory } = useStory();

  useEffect(() => {
    if (!printing) return;
    const previousTitle = document.title;
    document.title = printing.story.title;
    const done = () => printStory(null);
    window.addEventListener("afterprint", done);
    // Give the pages and fonts a moment to render before the dialog opens.
    const timer = setTimeout(() => {
      document.fonts.ready.then(() => window.print());
    }, 500);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("afterprint", done);
      document.title = previousTitle;
    };
  }, [printing, printStory]);

  if (!printing) return null;
  const { story, hero } = printing;
  const theme = themeById(printing.themeId) ?? themeById("space")!;
  const rtl = printing.lang === "ar";

  return createPortal(
    <div className="print-root" dir={rtl ? "rtl" : "ltr"} lang={printing.lang}>
      {/* cover */}
      <section className="print-page flex items-center justify-center gap-[14mm] p-[16mm]" style={{ background: `linear-gradient(150deg, ${theme.from}, ${theme.to})` }}>
        <StoryCover name={hero.name} themeId={printing.themeId} avatar={hero.avatar} title={story.title} className="w-[110mm] shrink-0" />
        <div className="max-w-[120mm] text-white">
          <p className="font-display text-[5mm] font-semibold uppercase tracking-[0.2em] opacity-80" dir="ltr">
            LittleHero
          </p>
          <h1 className="mt-[4mm] font-display text-[15mm] font-bold leading-[1.05]">{story.title}</h1>
          {printing.dedication && (
            <p className="mt-[10mm] font-display text-[6mm] leading-snug opacity-95">
              “{printing.dedication}”
              {printing.dedicationFrom && <span className="mt-[2mm] block text-[5mm] opacity-80">— {printing.dedicationFrom}</span>}
            </p>
          )}
        </div>
      </section>

      {/* story pages */}
      {story.pages.map((page, i) => (
        <section key={i} className="print-page flex flex-col bg-[#fff7ea] p-[12mm]">
          <Scene themeId={printing.themeId} beat={page.beat} direction={page.scene} avatar={hero.avatar} still className="!aspect-auto min-h-0 flex-1" />
          <div className="mt-[7mm] flex items-end gap-[8mm]">
            <p className="flex-1 font-display text-[7.2mm] font-medium leading-[1.45] text-[#231942]">{pageText(printing, i)}</p>
            <span className="font-display text-[5mm] font-semibold text-[#231942]/50" dir="ltr">
              {i + 1}
            </span>
          </div>
        </section>
      ))}

      {/* the end */}
      <section className="print-page flex flex-col items-center justify-center bg-[#231942] p-[16mm] text-center text-white">
        <div className="w-[46mm]">
          <Buddy id={theme.buddy} mood="happy" wave={false} pokable={false} watch={false} />
        </div>
        <p className="mt-[8mm] max-w-[200mm] font-display text-[9mm] font-semibold leading-snug">💛 {story.moral}</p>
        <p className="mt-[12mm] font-display text-[4.5mm] opacity-60" dir="ltr">
          LittleHero · {new Date(printing.createdAt).getFullYear()}
        </p>
      </section>
    </div>,
    document.body
  );
}
