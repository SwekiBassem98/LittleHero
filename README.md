# LittleHero

Animated stories in which a child is the hero — in French and Arabic.

A parent names the child, builds a cartoon avatar (by hand or from a photo), picks one of eight worlds, and gets a ten-page animated story to read or listen to. The first three pages are free; the rest unlocks with a purchase, which also gives a printable PDF picture book.

## Run it locally

```bash
npm install
```

```bash
npm run dev
```

The app works with no keys at all: stories come from the built-in engine and the checkout runs in demo mode.

## Environment variables

Copy `.env.example` to `.env` for local work. On Vercel, add the same names under Project → Settings → Environment Variables. Never commit real keys.

| Name | What it switches on | Without it |
|---|---|---|
| `ANTHROPIC_API_KEY` | AI-written stories and reading a photo into an avatar | Built-in stories; photo colours estimated on the device |
| `STRIPE_SECRET_KEY` | Real payments through Stripe Checkout | Demo checkout, nothing charged |
| `ENABLE_PRINT_ORDERS` | Selling the printed book (`true`) | Printed book shown as "coming soon" when Stripe is live |
| `SHIP_TO_COUNTRIES` | Countries the printed book ships to (ISO codes) | `FR,BE,CH,LU,CA` |
| `STORY_MODEL` | Which Claude model writes stories | `claude-opus-5-5` |

## Deploy to Vercel

1. Import this repository in Vercel. It is detected as a Vite project; `vercel.json` sets the rest.
2. Add the environment variables you want (none are required for a first deploy).
3. Deploy. The site is static; the three endpoints in `api/` run as serverless functions.

## How the code is organised

| Path | What lives there |
|---|---|
| `src/characters/` | The cast and the child avatar, drawn and animated in code |
| `src/story/` | Story types, the built-in story engine, scene directions, the animated scene and the reader |
| `src/shop/` | Prices, checkout, payment client and the printable book |
| `src/components/` | Landing page sections and the story studio |
| `src/i18n/` | All French and Arabic text |
| `server/` | The endpoint logic (stories, photo avatar, Stripe) |
| `api/` | Thin Vercel entry points for `server/` |

Prices and the currency are in `src/shop/pricing.ts`.

## Before taking real payments

- Purchases are remembered in the browser only. Real sales need accounts and server-side records.
- The printed book has no printer or carrier connected.
- Terms of sale, a refund policy and a privacy policy still have to be written. The privacy policy must say that story details and, if used, the child's photo are processed by Anthropic.
