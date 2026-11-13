/**
 * Stripe Checkout for LittleHero.
 *
 *   GET  /api/checkout/config   → is real payment switched on?
 *   POST /api/checkout/session  → create a Stripe-hosted checkout page
 *   GET  /api/checkout/verify   → after the redirect back, was it really paid?
 *
 * Card details are entered only on Stripe's own page; they never touch this
 * app. Prices are read from the shared price list on the server, so a visitor
 * cannot change the amount. With no STRIPE_SECRET_KEY the app stays in demo mode.
 */
import type { IncomingMessage, ServerResponse } from "node:http";
import Stripe from "stripe";
import { CURRENCY, offers } from "../src/shop/pricing.js";
import { readJson, send } from "./http.js";

const NAMES: Record<string, Record<string, string>> = {
  single: { fr: "Histoire complète + livre PDF", ar: "القصة الكاملة + كتاب PDF" },
  pack: { fr: "Pack 5 histoires", ar: "باقة 5 قصص" },
  book: { fr: "Livre imprimé", ar: "الكتاب المطبوع" },
};

interface Options {
  secretKey?: string;
  /** Printed books need a printer and a carrier; keep them off until both exist. */
  printEnabled: boolean;
  /** ISO country codes the printed book can ship to. */
  shipTo: string[];
}

/** The site's own address, used for the return links. */
function origin(req: IncomingMessage) {
  const proto = String(req.headers["x-forwarded-proto"] ?? "http").split(",")[0];
  return `${proto}://${req.headers.host}`;
}

export function createCheckoutHandler({ secretKey, printEnabled, shipTo }: Options) {
  const stripe = secretKey ? new Stripe(secretKey) : null;

  return async (req: IncomingMessage, res: ServerResponse) => {
    // Under Vite the mount prefix is already stripped; on Vercel the full path arrives.
    const url = new URL((req.url ?? "/").replace(/^\/api\/checkout/, "") || "/", "http://local");

    if (req.method === "GET" && url.pathname === "/config") {
      return send(res, 200, { live: !!stripe, printEnabled: !!stripe && printEnabled });
    }
    if (!stripe) return send(res, 503, { error: "not_configured" });

    try {
      if (req.method === "POST" && url.pathname === "/session") {
        const body = (await readJson(req, 4096)) as Record<string, unknown>;
        const offer = offers.find((o) => o.id === body.offerId);
        const storyId = String(body.storyId ?? "");
        if (!offer || !/^[\w-]{6,48}$/.test(storyId)) return send(res, 400, { error: "invalid" });
        if (offer.needsAddress && !printEnabled) return send(res, 409, { error: "print_unavailable" });

        const lang = body.lang === "ar" ? "ar" : "fr";
        const title = String(body.title ?? "").replace(/[<>]/g, "").slice(0, 80);
        const base = origin(req);

        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          locale: lang === "fr" ? "fr" : "auto",
          line_items: [
            {
              quantity: 1,
              price_data: {
                currency: CURRENCY.toLowerCase(),
                unit_amount: Math.round(offer.price * 100),
                product_data: { name: NAMES[offer.id][lang], description: title || undefined },
              },
            },
          ],
          ...(offer.needsAddress
            ? {
                shipping_address_collection: {
                  allowed_countries: shipTo as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[],
                },
                shipping_options: [
                  {
                    shipping_rate_data: {
                      type: "fixed_amount" as const,
                      display_name: lang === "fr" ? "Livraison" : "التوصيل",
                      fixed_amount: { amount: Math.round(offer.shipping * 100), currency: CURRENCY.toLowerCase() },
                    },
                  },
                ],
              }
            : {}),
          metadata: { storyId, offerId: offer.id },
          success_url: `${base}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${base}/?checkout=cancel&story=${encodeURIComponent(storyId)}`,
        });
        return send(res, 200, { url: session.url });
      }

      if (req.method === "GET" && url.pathname === "/verify") {
        const id = url.searchParams.get("session_id") ?? "";
        if (!/^cs_[\w]+$/.test(id)) return send(res, 400, { error: "invalid" });
        const session = await stripe.checkout.sessions.retrieve(id);
        if (session.payment_status !== "paid") return send(res, 200, { paid: false });
        return send(res, 200, {
          paid: true,
          storyId: session.metadata?.storyId ?? "",
          offerId: session.metadata?.offerId ?? "",
          reference: session.id.slice(-10).toUpperCase(),
        });
      }

      return send(res, 404, { error: "not_found" });
    } catch (error) {
      console.error("[checkout]", error instanceof Error ? error.message : error);
      return send(res, 502, { error: "stripe" });
    }
  };
}
