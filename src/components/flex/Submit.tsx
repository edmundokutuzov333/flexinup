import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { submitEntry } from "@/lib/entries.functions";
import { entrySchema } from "@/lib/entries-rules";
import { Glitch, Star4 } from "./Glitch";

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

  const field = "min-h-14 w-full border border-input bg-graphite px-4 font-mono text-base text-bone placeholder:text-muted-foreground focus:border-gold focus:outline-none";

  return (
    <section id="ranking" className="px-4 py-24">
      <div className="mx-auto max-w-xl">
        <Glitch as="h2" text="ENTRA NO RANKING" className="block font-display text-6xl leading-[0.85] text-gold-metal md:text-8xl" />
        <p className="mt-3 font-mono text-sm text-bone/80">
          <span className="text-nv">●</span> {data?.count ?? "—"} pessoas já entraram.
        </p>

        {state === "done" ? (
          <div className="relative mt-8 overflow-hidden border-2 border-gold p-8 text-center shadow-[var(--shadow-gold)]">
            {Array.from({ length: 10 }).map((_, i) => (
              <Star4 key={i} className="absolute h-5 w-5 text-gold-glow" style={{ left: `${(i * 23) % 95}%`, top: `${(i * 41) % 90}%`, animation: `twinkle 1.2s steps(5) ${i * 0.12}s infinite` }} />
            ))}
            <p className="font-display text-5xl text-gold-metal">Estás dentro.</p>
            <p className="mt-3 font-mono text-sm text-bone">A equipa valida na data de fecho. Mantém o post público e segue o Khriys.</p>
            <button onClick={() => { setForm({ handle: "", postUrl: "", contact: "", website: "" }); setState("idle"); }} className="mt-5 min-h-12 font-mono text-xs uppercase text-gold underline">
              Inscrever outro vídeo
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3" noValidate>
            <label className="font-mono text-xs uppercase text-muted-foreground">
              @ do Instagram
              <input className={field + " mt-1"} placeholder="@khriys_say_chris" autoCapitalize="none" autoComplete="off" value={form.handle} onChange={(e) => setForm({ ...form, handle: e.target.value })} maxLength={31} required />
            </label>
            <label className="font-mono text-xs uppercase text-muted-foreground">
              Link da publicação
              <input className={field + " mt-1"} type="url" inputMode="url" placeholder="https://www.instagram.com/reel/…" value={form.postUrl} onChange={(e) => setForm({ ...form, postUrl: e.target.value })} maxLength={300} required />
            </label>
            <label className="font-mono text-xs uppercase text-muted-foreground">
              Contacto (WhatsApp ou email)
              <input className={field + " mt-1"} placeholder="+258 84 000 0000" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} maxLength={120} />
            </label>
            {/* honeypot */}
            <input tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0 opacity-0" name="website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} />
            {error && <p role="alert" className="font-mono text-sm text-rec">{error}</p>}
            <button disabled={state === "sending"} className="mt-2 min-h-16 bg-gold-metal font-display text-4xl text-primary-foreground shadow-[var(--shadow-gold)] disabled:opacity-60">
              {state === "sending" ? "A ENVIAR…" : "ENTRAR →"}
            </button>
            <p className="font-mono text-[11px] text-muted-foreground">Só guardamos o @, o link e o contacto. O vídeo fica no Instagram.</p>
          </form>
        )}
      </div>

      {!!data?.list.length && (
        <div className="mx-auto mt-14 grid max-w-5xl grid-cols-2 gap-2 md:grid-cols-4">
          {data.list.map((e) => (
            <a key={e.post_url} href={e.post_url} target="_blank" rel="noopener noreferrer nofollow" className="group flex min-h-24 flex-col justify-between border border-border bg-graphite p-3 hover:border-gold">
              <span className="font-mono text-[10px] text-nv">● REC</span>
              <span className="truncate font-mono text-sm text-bone group-hover:text-gold">@{e.handle}</span>
              <span className="font-mono text-[10px] uppercase text-muted-foreground">Ver post →</span>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
