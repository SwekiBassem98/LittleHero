// Vercel function: POST /api/story — see server/storyApi.ts
import { createStoryHandler } from "../server/storyApi.js";

export default createStoryHandler(process.env.ANTHROPIC_API_KEY);
