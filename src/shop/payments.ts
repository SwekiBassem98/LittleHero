/**
 * Payment gateway (browser side).
 *
 * LIVE: when the server has a Stripe key, paying redirects to Stripe's own
 * checkout page; on the way back the server confirms the payment before
 * anything is unlocked. No card data ever passes through this app.
 *
 * DEMO: with no key, `startPayment` only waits a moment and succeeds, so the
 * flow can be tried end to end. Nothing is charged.
 */
import { useEffect, useState } from "react";

export interface PaymentConfig {
  live: boolean;
  printEnabled: boolean;
}

let configPromise: Promise<PaymentConfig> | null = null;

export function getPaymentConfig(): Promise<PaymentConfig> {
  configPromise ??= fetch("/api/checkout/config")
    .then((r) => (r.ok ? r.json() : Promise.reject()))
    .then((c) => ({ live: !!c.live, printEnabled: !!c.printEnabled }))
    .catch(() => ({ live: false, printEnabled: false }));
  return configPromise;
}

/** null while loading. */
export function usePaymentConfig() {
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  useEffect(() => {
    let alive = true;
    getPaymentConfig().then((c) => alive && setConfig(c));
    return () => {
      alive = false;
    };
  }, []);
  return config;
}

export interface PaymentRequest {
  offerId: string;
  storyId: string;
  title: string;
  lang: string;
}

export type PaymentOutcome =
  | { kind: "paid"; reference: string } // demo mode: done on the spot
  | { kind: "redirect" } // live mode: the browser is leaving for Stripe
  | { kind: "failed" };

export async function startPayment(request: PaymentRequest): Promise<PaymentOutcome> {
  const config = await getPaymentConfig();
  if (!config.live) {
    await new Promise((r) => setTimeout(r, 1500));
    return { kind: "paid", reference: `DEMO-${Date.now().toString(36).toUpperCase()}` };
  }
  try {
    const res = await fetch("/api/checkout/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    const data = res.ok ? await res.json() : null;
    if (typeof data?.url !== "string") return { kind: "failed" };
    window.location.assign(data.url);
    return { kind: "redirect" };
  } catch {
    return { kind: "failed" };
  }
}

export interface VerifiedPayment {
  storyId: string;
  offerId: string;
  reference: string;
}

/** Ask the server whether a Stripe session was really paid. */
export async function verifyPayment(sessionId: string): Promise<VerifiedPayment | null> {
  try {
    const res = await fetch(`/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`);
    const data = res.ok ? await res.json() : null;
    if (!data?.paid || typeof data.storyId !== "string") return null;
    return { storyId: data.storyId, offerId: String(data.offerId), reference: String(data.reference) };
  } catch {
    return null;
  }
}
