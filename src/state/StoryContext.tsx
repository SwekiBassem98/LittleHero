import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { defaultAvatar, type AvatarConfig } from "../characters/KidAvatar";
import { generateStory } from "../story/api";
import type { Gender, SavedStory, StoryLang } from "../story/types";
import { verifyPayment } from "../shop/payments";
import { offerById } from "../shop/pricing";

export interface HeroData {
  childName: string;
  age: number;
  gender: Gender | "";
  avatar: AvatarConfig;
  traits: string[];
  value: string;
  favorite: string;
  themeId: string;
  dedication: string;
  dedicationFrom: string;
}

const emptyHero: HeroData = {
  childName: "",
  age: 5,
  gender: "",
  avatar: defaultAvatar,
  traits: [],
  value: "courage",
  favorite: "",
  themeId: "",
  dedication: "",
  dedicationFrom: "",
};

export const MAX_TRAITS = 3;
const LIBRARY_KEY = "littlehero-library";
const WALLET_KEY = "littlehero-wallet";

/** What this device has bought: unlocked stories and spare story credits. */
interface Wallet {
  credits: number;
  unlocked: string[];
  /** Payment references already turned into purchases, so none counts twice. */
  redeemed?: string[];
}

export interface Receipt {
  storyId: string;
  offerId: string;
  reference: string;
}

function loadWallet(): Wallet {
  try {
    const w = JSON.parse(localStorage.getItem(WALLET_KEY) ?? "null");
    if (w && typeof w.credits === "number" && Array.isArray(w.unlocked)) return w;
  } catch {
    /* fall through */
  }
  return { credits: 0, unlocked: [] };
}
const LIBRARY_MAX = 12;

/** Stories are kept on this device only — there is no account and no server copy. */
function loadLibrary(): SavedStory[] {
  try {
    const raw = localStorage.getItem(LIBRARY_KEY);
    const list: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? (list as SavedStory[]).filter((s) => s?.story?.pages?.length) : [];
  } catch {
    return [];
  }
}

interface StoryContextType {
  data: HeroData;
  update: <K extends keyof HeroData>(key: K, value: HeroData[K]) => void;
  toggleTrait: (id: string) => void;
  reset: () => void;

  builderOpen: boolean;
  openBuilder: () => void;
  closeBuilder: () => void;
  step: number;
  setStep: (n: number) => void;

  generating: boolean;
  createStory: (lang: StoryLang) => Promise<void>;

  library: SavedStory[];
  removeStory: (id: string) => void;
  playing: SavedStory | null;
  play: (story: SavedStory) => void;
  stopPlaying: () => void;
  setPick: (id: string, pick: number) => void;

  credits: number;
  isUnlocked: (id: string) => boolean;
  unlockWithCredit: (id: string) => void;
  /** Called once a payment has succeeded: unlocks the story and adds the offer's credits. */
  completePurchase: (receipt: Receipt) => void;
  receipt: Receipt | null;
  checkoutFor: SavedStory | null;
  openCheckout: (story: SavedStory) => void;
  closeCheckout: () => void;

  printing: SavedStory | null;
  printStory: (story: SavedStory | null) => void;
}

const StoryContext = createContext<StoryContextType | null>(null);

export function StoryProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<HeroData>(emptyHero);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [library, setLibrary] = useState<SavedStory[]>(loadLibrary);
  const [playing, setPlaying] = useState<SavedStory | null>(null);
  const [wallet, setWallet] = useState<Wallet>(loadWallet);
  const [checkoutFor, setCheckoutFor] = useState<SavedStory | null>(null);
  const [printing, setPrinting] = useState<SavedStory | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
    } catch {
      /* storage unavailable */
    }
  }, [wallet]);

  const unlock = (id: string, creditDelta: number) =>
    setWallet((w) => ({
      credits: Math.max(0, w.credits + creditDelta),
      unlocked: w.unlocked.includes(id) ? w.unlocked : [...w.unlocked, id],
    }));

  const completePurchase = useCallback((r: Receipt) => {
    setWallet((w) => {
      if (w.redeemed?.includes(r.reference)) return w;
      return {
        credits: w.credits + offerById(r.offerId).credits,
        unlocked: w.unlocked.includes(r.storyId) ? w.unlocked : [...w.unlocked, r.storyId],
        redeemed: [...(w.redeemed ?? []), r.reference].slice(-50),
      };
    });
    setReceipt(r);
  }, []);

  // Coming back from Stripe: confirm with the server, then unlock and celebrate.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get("checkout");
    if (!status) return;
    window.history.replaceState(null, "", window.location.pathname);
    const find = (id: string | null) => loadLibrary().find((s) => s.id === id) ?? null;

    if (status === "cancel") {
      const story = find(params.get("story"));
      if (story) setPlaying(story);
      return;
    }
    const sessionId = params.get("session_id");
    if (status !== "success" || !sessionId) return;
    verifyPayment(sessionId).then((paid) => {
      if (!paid) return;
      const story = find(paid.storyId);
      completePurchase(paid);
      if (story) {
        setPlaying(story);
        setCheckoutFor(story);
      }
    });
  }, [completePurchase]);

  const setPick = useCallback((id: string, pick: number) => {
    setLibrary((l) => l.map((s) => (s.id === id ? { ...s, pick } : s)));
    setPlaying((p) => (p && p.id === id ? { ...p, pick } : p));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
    } catch {
      /* storage unavailable — the library just won't persist */
    }
  }, [library]);

  const update = useCallback(
    <K extends keyof HeroData>(key: K, value: HeroData[K]) => setData((d) => ({ ...d, [key]: value })),
    []
  );

  const toggleTrait = useCallback(
    (id: string) =>
      setData((d) => ({
        ...d,
        traits: d.traits.includes(id)
          ? d.traits.filter((x) => x !== id)
          : d.traits.length < MAX_TRAITS
            ? [...d.traits, id]
            : d.traits,
      })),
    []
  );

  const reset = useCallback(() => {
    setData(emptyHero);
    setStep(0);
  }, []);

  const createStory = useCallback(
    async (lang: StoryLang) => {
      if (generating || !data.themeId || !data.gender) return;
      setGenerating(true);
      const started = Date.now();
      try {
        const story = await generateStory({
          name: data.childName.trim(),
          age: data.age,
          gender: data.gender,
          traits: data.traits,
          themeId: data.themeId,
          value: data.value,
          favorite: data.favorite.trim(),
          lang,
        });
        // Let the "making of" animation play at least a moment.
        const wait = 2800 - (Date.now() - started);
        if (wait > 0) await new Promise((r) => setTimeout(r, wait));

        const saved: SavedStory = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          createdAt: Date.now(),
          lang,
          themeId: data.themeId,
          hero: { name: data.childName.trim(), age: data.age, avatar: data.avatar },
          dedication: data.dedication.trim(),
          dedicationFrom: data.dedicationFrom.trim(),
          story,
        };
        setLibrary((l) => [saved, ...l].slice(0, LIBRARY_MAX));
        setPlaying(saved);
        setBuilderOpen(false);
        setStep(0);
      } finally {
        setGenerating(false);
      }
    },
    [data, generating]
  );

  return (
    <StoryContext.Provider
      value={{
        data,
        update,
        toggleTrait,
        reset,
        builderOpen,
        openBuilder: () => setBuilderOpen(true),
        closeBuilder: () => setBuilderOpen(false),
        step,
        setStep,
        generating,
        createStory,
        library,
        removeStory: (id) => setLibrary((l) => l.filter((s) => s.id !== id)),
        playing,
        play: setPlaying,
        stopPlaying: () => setPlaying(null),
        setPick,
        credits: wallet.credits,
        isUnlocked: (id) => wallet.unlocked.includes(id),
        unlockWithCredit: (id) => wallet.credits > 0 && unlock(id, -1),
        completePurchase,
        receipt,
        checkoutFor,
        openCheckout: (story) => {
          setReceipt(null);
          setCheckoutFor(story);
        },
        closeCheckout: () => {
          setCheckoutFor(null);
          setReceipt(null);
        },
        printing,
        printStory: setPrinting,
      }}
    >
      {children}
    </StoryContext.Provider>
  );
}

export function useStory() {
  const ctx = useContext(StoryContext);
  if (!ctx) throw new Error("useStory must be used within StoryProvider");
  return ctx;
}
