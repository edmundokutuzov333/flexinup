import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { site } from "@/config/site";
import { img } from "@/lib/assets";
import { Glitch } from "./Glitch";

const PrizeScene = lazy(() => import("./PrizeScene"));

const rules = [
  ["Segue o Khriys", `Seguir @${site.handles.khriys} no Instagram é obrigatório.`],
  ["Publica + tag", `Publica o teu vídeo e faz tag @${site.handles.khriys}.`],
  ["Mais likes ganha", "Ganha quem tiver mais likes no vídeo, só se estiver a seguir o Khriys."],
];

export function Prizes() {
  return (
    <section id="premios" className="relative px-4 py-24">
      <Glitch as="h2" text="O QUE ESTÁ EM JOGO" className="block text-center font-display text-6xl leading-[0.85] text-gold-metal md:text-8xl" />
      <p className="mt-4 text-center font-mono text-sm uppercase tracking-widest text-bone">
        {site.challenge.prizeMoney} <span className="text-gold">+</span> {site.challenge.prizeItem}
      </p>
      <div className="mx-auto mt-10 grid max-w-5xl gap-4 md:grid-cols-2">
        <Prize kind="money" label={site.challenge.prizeMoney} fallback={img.money} />
        <Prize kind="goyard" label="Goyard original" fallback={img.goyard} />
      </div>
      <p className="mt-3 text-center font-mono text-[11px] uppercase text-muted-foreground">Arrasta para rodar · toca para fazer saltar</p>

      <div className="mx-auto mt-14 grid max-w-5xl gap-3 md:grid-cols-3">
        {rules.map(([t, d], i) => (
          <div key={t} className="border border-border bg-graphite p-5">
            <p className="font-mono text-xs text-nv">0{i + 1}</p>
            <p className="mt-1 font-display text-3xl text-bone">{t}</p>
            <p className="mt-2 font-mono text-xs text-muted-foreground">{d}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center">
        <Link to="/regulamento" className="inline-flex min-h-12 items-center font-mono text-xs uppercase tracking-widest text-gold underline underline-offset-4">
          Regulamento completo →
        </Link>
      </div>
    </section>
  );
}

function Prize({ kind, label, fallback }: { kind: "money" | "goyard"; label: string; fallback: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => e?.isIntersecting && (setShow(true), io.disconnect()), { rootMargin: "300px" });
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  const placeholder = <img src={fallback} alt={label} loading="lazy" className="absolute inset-0 m-auto h-2/3 w-2/3 object-contain opacity-60" />;
  return (
    <div ref={ref} className="relative aspect-square overflow-hidden border border-border bg-[radial-gradient(ellipse_at_50%_40%,color-mix(in_oklab,var(--gold)_18%,transparent),transparent_65%)] touch-none">
      {show ? <Suspense fallback={placeholder}><PrizeScene kind={kind} image={fallback} /></Suspense> : placeholder}
      <p className="pointer-events-none absolute bottom-3 left-3 font-display text-3xl text-gold-metal">{label}</p>
      <span className="pointer-events-none absolute right-3 top-3 font-mono text-[10px] text-gold/60">3D ✦</span>
    </div>
  );
}
