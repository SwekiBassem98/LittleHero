// Vercel function: POST /api/avatar — see server/avatarApi.ts
import { createAvatarHandler } from "../server/avatarApi.js";

export default createAvatarHandler(process.env.ANTHROPIC_API_KEY);
