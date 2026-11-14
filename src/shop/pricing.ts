/**
 * Everything about what is sold and for how much lives here.
 * Change a price or the currency in this one file.
 */
export const CURRENCY = "EUR";

/** Pages every parent can read before buying. */
export const FREE_PAGES = 3;

export interface Offer {
  id: "single" | "pack" | "book";
  price: number;
  shipping: number;
  /** Extra story credits granted on top of unlocking the current story. */
  credits: number;
  needsAddress: boolean;
  popular: boolean;
  emoji: string;
  color: string;
}

export const offers: Offer[] = [
  { id: "single", price: 3.9, shipping: 0, credits: 0, needsAddress: false, popular: false, emoji: "📖", color: "bg-sky" },
  { id: "pack", price: 14.9, shipping: 0, credits: 4, needsAddress: false, popular: true, emoji: "🎁", color: "bg-sun" },
  { id: "book", price: 24.9, shipping: 4.9, credits: 0, needsAddress: true, popular: false, emoji: "📕", color: "bg-bubble" },
];

export const offerById = (id: string) => offers.find((o) => o.id === id) ?? offers[0];

const formatter = new Intl.NumberFormat("fr-FR", { style: "currency", currency: CURRENCY });
export const money = (n: number) => formatter.format(n);
