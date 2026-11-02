import { z } from "zod";

export const RATE_LIMIT = 3;
export const RATE_WINDOW_MINUTES = 60;

export function isRateLimited(recentCount: number) {
  return recentCount >= RATE_LIMIT;
}

export function normalizeHandle(h: string) {
  return h.trim().replace(/^@+/, "").toLowerCase();
}

export const entrySchema = z.object({
  handle: z
    .string()
    .trim()
    .transform(normalizeHandle)
    .pipe(z.string().regex(/^[a-z0-9._]{1,30}$/, "@ inválido")),
  postUrl: z
    .string()
    .trim()
    .max(300)
    .regex(/^https:\/\/(www\.)?(instagram\.com|tiktok\.com|vm\.tiktok\.com)\/.+/i, "Link do Instagram ou TikTok"),
  contact: z.string().trim().max(120).optional().default(""),
  website: z.string().max(200).optional().default(""),
});
