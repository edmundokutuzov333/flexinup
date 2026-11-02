import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Equipa — FLEXIN UP'" },
      { name: "description", content: "Painel interno da equipa." },
      { property: "og:title", content: "Equipa — FLEXIN UP'" },
      { property: "og:description", content: "Painel interno da equipa Khriys x INF8M8US." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Admin,
});

type Entry = { id: string; handle: string; post_url: string; contact: string | null; status: string; created_at: string };
const KEY = "flex_admin_code";

function Admin() {
  const [code, setCode] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => { setCode(sessionStorage.getItem(KEY)); setReady(true); }, []);
  if (!ready) return null;
  const logout = () => { sessionStorage.removeItem(KEY); setCode(null); };
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      {code ? <Panel code={code} onLogout={logout} /> : <Login onOk={(c) => { sessionStorage.setItem(KEY, c); setCode(c); }} />}
    </main>
  );
}

function Login({ onOk }: { onOk: (c: string) => void }) {
  const [value, setValue] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const login = useServerFn(adminLogin);
  const f = "min-h-12 w-full border border-input bg-graphite px-3 font-mono text-bone";
  return (
    <form
      className="mx-auto mt-20 flex max-w-sm flex-col gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true); setErr("");
        try {
          const r = await login({ data: { code: value } });
          if (r.ok) onOk(value); else setErr("Código inválido.");
        } catch { setErr("Código inválido."); }
        setBusy(false);
      }}
    >
      <h1 className="font-display text-5xl text-gold-metal">Equipa</h1>
      <input className={f} type="password" placeholder="código de acesso" autoComplete="off" value={value} onChange={(e) => setValue(e.target.value)} required />
      {err && <p className="font-mono text-sm text-rec">{err}</p>}
      <button disabled={busy} className="min-h-12 bg-gold-metal font-mono font-bold uppercase text-primary-foreground">{busy ? "..." : "Entrar"}</button>
    </form>
  );
}

function Panel({ code, onLogout }: { code: string; onLogout: () => void }) {
  const [rows, setRows] = useState<Entry[] | null>(null);
  const [filter, setFilter] = useState("todos");
  const list = useServerFn(adminListEntries);
  const update = useServerFn(adminSetStatus);
  useEffect(() => {
    list({ data: { code } }).then((d) => setRows(d as Entry[])).catch(onLogout);
  }, [code]);
  const setStatus = async (id: string, status: "validado" | "rejeitado") => {
    await update({ data: { code, id, status } });
    setRows((r) => (r ?? []).map((x) => (x.id === id ? { ...x, status } : x)));
  };
  const logoutBtn = onLogout;
  if (rows === null) return null;
  if (!isAdmin)
    return (
      <div className="mt-20 text-center font-mono text-sm">
        <p>Esta conta não tem acesso de equipa.</p>
        <button onClick={() => supabase.auth.signOut()} className="mt-4 min-h-12 text-gold underline">Sair</button>
      </div>
    );
  const shown = rows.filter((r) => filter === "todos" || r.status === filter);
  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-5xl text-gold-metal">Inscrições ({rows.length})</h1>
        <button onClick={() => supabase.auth.signOut()} className="min-h-12 font-mono text-xs uppercase text-gold">Sair</button>
      </div>
      <div className="mt-4 flex gap-2 font-mono text-xs uppercase">
        {["todos", "pendente", "validado", "rejeitado"].map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`min-h-10 border px-3 ${filter === s ? "border-gold text-gold" : "border-border"}`}>{s}</button>
        ))}
      </div>
      <div className="mt-4 divide-y divide-border border border-border">
        {shown.map((r) => (
          <div key={r.id} className="flex flex-col gap-2 p-3 font-mono text-sm md:flex-row md:items-center">
            <div className="min-w-0 flex-1">
              <p className="text-bone">@{r.handle} <span className="text-xs text-muted-foreground">· {new Date(r.created_at).toLocaleString("pt-PT")}</span></p>
              <a href={r.post_url} target="_blank" rel="noopener noreferrer" className="block truncate text-xs text-gold underline">{r.post_url}</a>
              {r.contact && <p className="text-xs text-muted-foreground">{r.contact}</p>}
            </div>
            <span className={`text-xs uppercase ${r.status === "validado" ? "text-nv" : r.status === "rejeitado" ? "text-rec" : "text-muted-foreground"}`}>{r.status}</span>
            <div className="flex gap-2">
              <button onClick={() => setStatus(r.id, "validado")} className="min-h-10 border border-nv px-3 text-xs text-nv">Validar</button>
              <button onClick={() => setStatus(r.id, "rejeitado")} className="min-h-10 border border-rec px-3 text-xs text-rec">Rejeitar</button>
            </div>
          </div>
        ))}
        {!shown.length && <p className="p-6 text-center font-mono text-sm text-muted-foreground">Nada aqui.</p>}
      </div>
    </div>
  );
}
