import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv, type Plugin } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";
import { createStoryHandler } from "./server/storyApi.js";
import { createCheckoutHandler } from "./server/checkoutApi.js";
import { createAvatarHandler } from "./server/avatarApi.js";

const here = path.dirname(fileURLToPath(import.meta.url));

/** Serves the story and checkout endpoints from the dev and preview servers. */
function api(env: Record<string, string>): Plugin {
  const story = createStoryHandler(env.ANTHROPIC_API_KEY);
  const checkout = createCheckoutHandler({
    secretKey: env.STRIPE_SECRET_KEY,
    printEnabled: env.ENABLE_PRINT_ORDERS === "true",
    shipTo: (env.SHIP_TO_COUNTRIES || "FR,BE,CH,LU,CA").split(",").map((c) => c.trim().toUpperCase()),
  });
  const mount = (use: (route: string, handler: typeof story) => void) => {
    use("/api/story", story);
    use("/api/avatar", createAvatarHandler(env.ANTHROPIC_API_KEY));
    use("/api/checkout", checkout);
  };
  return {
    name: "littlehero-api",
    configureServer(server) {
      mount((route, handler) => server.middlewares.use(route, handler));
    },
    configurePreviewServer(server) {
      mount((route, handler) => server.middlewares.use(route, handler));
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Read .env without exposing anything to the browser bundle.
  const env = loadEnv(mode, here, "");
  if (env.STORY_MODEL) process.env.STORY_MODEL = env.STORY_MODEL;
  return {
    plugins: [react(), tailwindcss(), viteSingleFile(), api(env)],
    resolve: {
      alias: {
        "@": path.resolve(here, "src"),
      },
    },
  };
});
