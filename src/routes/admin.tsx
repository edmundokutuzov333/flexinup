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
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Admin,
});

type Entry = { id: string; handle: string; post_url: string; contact: string | null; status: string; created_at: string };

function Admin() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  if (!ready) return null;
  return <main className="mx-auto max-w-5xl px-4 py-10">{session ? <Panel userId={session.user.id} /> : <Login />}</main>;
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const f = "min-h-12 w-full border border-input bg-graphite px-3 font-mono text-bone";
  return (
    <form
      className="mx-auto mt-20 flex max-w-sm flex-col gap-3"
      onSubmit={async (e) => {
        e.preventDefault();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setErr("Credenciais inválidas.");
      }}
    >
      <h1 className="font-display text-5xl text-gold-metal">Equipa</h1>
      <input className={f} type="email" placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input className={f} type="password" placeholder="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      {err && <p className="font-mono text-sm text-rec">{err}</p>}
      <button className="min-h-12 bg-gold-metal font-mono font-bold uppercase text-primary-foreground">Entrar</button>
    </form>
  );
}

function Panel({ userId }: { userId: string }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<Entry[]>([]);
  const [filter, setFilter] = useState("todos");
  const load = async () => {
    const { data } = await supabase.from("entries").select("id,handle,post_url,contact,status,created_at").order("created_at", { ascending: false });
    setRows((data as Entry[]) ?? []);
  };
  useEffect(() => {
    supabase.rpc("has_role", { _user_id: userId, _role: "admin" }).then(({ data }) => {
      setIsAdmin(!!data);
      if (data) void load();
    });
  }, [userId]);
  const setStatus = async (id: string, status: string) => {
    await supabase.from("entries").update({ status }).eq("id", id);
    setRows((r) => r.map((x) => (x.id === id ? { ...x, status } : x)));
  };
  if (isAdmin === null) return null;
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
