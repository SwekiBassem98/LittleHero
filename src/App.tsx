import { AnimatePresence, MotionConfig, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import HowItWorks from "./components/HowItWorks";
import Adventures from "./components/Adventures";
import Trust from "./components/Trust";
import Crew from "./components/Crew";
import Library from "./components/Library";
import ScrollGuide from "./components/ScrollGuide";
import StoryPlayer from "./story/StoryPlayer";
import Checkout from "./shop/Checkout";
import PrintBook from "./shop/PrintBook";
import Pricing from "./components/Pricing";
import Faq from "./components/Faq";
import Footer from "./components/Footer";
import StoryBuilder from "./components/builder/StoryBuilder";
import { Button } from "./components/ui";
import { useLanguage } from "./i18n/LanguageContext";
import { useStory } from "./state/StoryContext";

/** Phone-only call to action that appears once the hero has scrolled away. */
function MobileCta() {
  const { t } = useLanguage();
  const { openBuilder, builderOpen, playing } = useStory();
  const { scrollY, scrollYProgress } = useScroll();
  const [show, setShow] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) =>
    setShow(y > 700 && scrollYProgress.get() < 0.9)
  );

  return (
    <AnimatePresence>
      {show && !builderOpen && !playing && (
        <motion.div
          initial={{ y: 90 }}
          animate={{ y: 0 }}
          exit={{ y: 90 }}
          transition={{ type: "spring", stiffness: 260, damping: 24 }}
          className="fixed inset-x-4 bottom-4 z-40 sm:hidden"
        >
          <Button variant="coral" className="w-full" onClick={openBuilder}>
            ✨ {t("nav.cta")}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen overflow-x-clip bg-cream font-sans text-ink">
        <Navbar />
        <main>
          <Hero />
          <Marquee />
          <HowItWorks />
          <Crew />
          <Adventures />
          <Library />
          <Pricing />
          <Trust />
          <Faq />
        </main>
        <Footer />
        <MobileCta />
        <ScrollGuide />
        <StoryBuilder />
        <StoryPlayer />
        <Checkout />
        <PrintBook />
      </div>
    </MotionConfig>
  );
}
