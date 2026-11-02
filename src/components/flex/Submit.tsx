import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { submitEntry } from "@/lib/entries.functions";
import { entrySchema } from "@/lib/entries-rules";
import { SectionHeading } from "./SectionHeading";
import { Button } from "@/components/ui/button";

export function useEntries() {
  return useQuery({
    queryKey: ["entries"],
    queryFn: async () => {
      const [list, count] = await Promise.all([supabase.rpc("public_entries"), supabase.rpc("entries_count")]);
      return { list: list.data ?? [], count: Number(count.data ?? 0) };
    },
    refetchInterval: 60_000,
  });
}

export function Submit() {
  const qc = useQueryClient();
  const submit = useServerFn(submitEntry);
  const { data } = useEntries();
  const [form, setForm] = useState({ handle: "", postUrl: "", contact: "", website: "" });
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const parsed = entrySchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Verifica os campos.");
      return;
    }
    setState("sending");
    try {
      const r = await submit({ data: form });
      if (!r.ok) {
        setError(r.error);
        setState("idle");
        return;
      }
      setState("done");
      navigator.vibrate?.(60);
      qc.invalidateQueries({ queryKey: ["entries"] });
    } catch {
      setError("Falhou. Tenta outra vez.");
      setState("idle");
    }
  };

  const field = "editorial-input";

  return (
    <section id="ranking" className="editorial-section page-shell">
      <div className="ranking-layout">
        <div><SectionHeading number="05" label="O RANKING" title="ENTRA NO RANKING" />
        <p className="ranking-count">
          {data?.count ?? "—"} pessoas já entraram.
        </p></div>

        {state === "done" ? (
          <div className="relative mt-8 overflow-hidden border border-border bg-card p-6">
            <p className="font-display text-5xl text-bone">Estás dentro.</p>
            <p className="mt-3 font-mono text-sm text-bone">A equipa valida na data de fecho. Mantém o post público e segue o Khriys.</p>
            <Button variant="editorialOutline" onClick={() => { setForm({ handle: "", postUrl: "", contact: "", website: "" }); setState("idle"); }} className="mt-5 min-h-12 font-mono text-xs uppercase text-gold underline">
              Inscrever outro vídeo
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
            <label className="editorial-label">
              @ do Instagram
              <input className={field + " mt-1"} placeholder="@khriys_say_chris" autoCapitalize="none" autoComplete="off" value={form.handle} onChange={(e) => setForm({ ...form, handle: e.target.value })} maxLength={31} required />
            </label>
            <label className="editorial-label">
              Link da publicação
              <input className={field + " mt-1"} type="url" inputMode="url" placeholder="https://www.instagram.com/reel/…" value={form.postUrl} onChange={(e) => setForm({ ...form, postUrl: e.target.value })} maxLength={300} required />
            </label>
            <label className="editorial-label">
              Contacto (WhatsApp ou email)
              <input className={field + " mt-1"} placeholder="+258 84 000 0000" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} maxLength={120} />
            </label>
            {/* honeypot */}
            <div aria-hidden className="hidden">
              <input tabIndex={-1} autoComplete="off" name="website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            </div>
            {error && <p role="alert" className="font-mono text-sm text-bone">{error}</p>}
            <Button variant="editorial" type="submit" disabled={state === "sending"} className="mt-6">
              {state === "sending" ? "A ENVIAR…" : "ENTRAR →"}
            </Button>
            <p className="font-mono text-[11px] text-muted-foreground">Só guardamos o @, o link e o contacto. O vídeo fica no Instagram.</p>
          </form>
        )}
      </div>

      {!!data?.list.length && (
        <div className="mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-2 md:grid-cols-4">
          {data.list.map((e) => (
            <a key={e.post_url} href={e.post_url} target="_blank" rel="noopener noreferrer nofollow" className="group flex min-h-24 flex-col justify-between border border-border bg-graphite p-3 hover:border-gold">
              <span className="editorial-label">PUBLICAÇÃO</span>
              <span className="truncate font-mono text-sm text-bone group-hover:text-gold">@{e.handle}</span>
              <span className="font-mono text-[10px] uppercase text-muted-foreground">Ver post →</span>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
