// Vercel function: /api/checkout/config · /session · /verify — see server/checkoutApi.ts
import { createCheckoutHandler } from "../../server/checkoutApi.js";

export default createCheckoutHandler({
  secretKey: process.env.STRIPE_SECRET_KEY,
  printEnabled: process.env.ENABLE_PRINT_ORDERS === "true",
  shipTo: (process.env.SHIP_TO_COUNTRIES || "FR,BE,CH,LU,CA").split(",").map((c) => c.trim().toUpperCase()),
});
