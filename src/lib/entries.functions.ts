import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { z } from "zod";
import { entrySchema, isRateLimited, RATE_WINDOW_MINUTES } from "./entries-rules";

export const submitEntry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => entrySchema.parse(input))
  .handler(async ({ data }) => {
    // Honeypot: bots fill the hidden field; pretend success.
    if (data.website) return { ok: true as const };

    const ip =
      getRequestHeader("cf-connecting-ip") ||
      getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`flexinup:${ip}`));
    const ipHash = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const since = new Date(Date.now() - RATE_WINDOW_MINUTES * 60_000).toISOString();
    const { count } = await supabaseAdmin
      .from("entries")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", since);
    if (isRateLimited(count ?? 0)) {
      return { ok: false as const, error: "Calma. Muitas inscrições seguidas. Tenta daqui a pouco." };
    }

    const { data: dup } = await supabaseAdmin.from("entries").select("id").eq("post_url", data.postUrl).maybeSingle();
    if (dup) return { ok: false as const, error: "Esse vídeo já está no ranking." };

    const { error } = await supabaseAdmin.from("entries").insert({
      handle: data.handle,
      post_url: data.postUrl,
      contact: data.contact || null,
      ip_hash: ipHash,
    });
    if (error) return { ok: false as const, error: "Falhou. Tenta outra vez." };
    return { ok: true as const };
  });

export type SubmitInput = z.input<typeof entrySchema>;
