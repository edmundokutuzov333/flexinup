import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

function checkCode(code: string) {
  const expected = process.env["ADMIN_CODE"] ?? "";
  if (!expected || code.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < code.length; i++) diff |= code.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

const codeSchema = z.object({ code: z.string().min(1).max(64) });

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d) => codeSchema.parse(d))
  .handler(async ({ data }) => ({ ok: checkCode(data.code) }));

export const adminListEntries = createServerFn({ method: "POST" })
  .inputValidator((d) => codeSchema.parse(d))
  .handler(async ({ data }) => {
    if (!checkCode(data.code)) throw new Error("Código inválido.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("entries")
      .select("id,handle,post_url,contact,status,created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error("Erro a carregar.");
    return rows ?? [];
  });

export const adminSetStatus = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    codeSchema.extend({ id: z.string().uuid(), status: z.enum(["pendente", "validado", "rejeitado"]) }).parse(d),
  )
  .handler(async ({ data }) => {
    if (!checkCode(data.code)) throw new Error("Código inválido.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("entries").update({ status: data.status }).eq("id", data.id);
    if (error) throw new Error("Erro a guardar.");
    return { ok: true };
  });
