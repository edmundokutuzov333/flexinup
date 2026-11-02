import { useEffect, useRef, useState } from "react";
import { site } from "@/config/site";
import { audio } from "@/lib/audio-engine";
import { Glitch } from "./Glitch";

type Clip = (typeof site.backstage)[number];

export function Backstage() {
  const [open, setOpen] = useState<Clip | null>(null);
  return (
    <section id="bastidores" className="py-24">
      <div className="px-4">
        <Glitch as="h2" text="BASTIDORES" className="block font-display text-6xl text-gold-metal md:text-8xl" />
        <p className="mt-2 font-mono text-xs uppercase text-muted-foreground">Arrasta → · toca para ver com som</p>
      </div>
      <div className="snap-x-row mt-8 flex items-center gap-3 overflow-x-auto px-4 pb-4">
        {site.backstage.map((c, i) => (
          <ClipCard key={i} clip={c} index={i} onOpen={() => c.src && setOpen(c)} />
        ))}
      </div>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background" onClick={() => setOpen(null)}>
          <video
            src={open.src}
            poster={open.poster || undefined}
            autoPlay
            controls
            playsInline
            className="max-h-full max-w-full"
            onPlay={() => audio.stop()}
            onClick={(e) => e.stopPropagation()}
          />
          <button onClick={() => setOpen(null)} className="absolute right-3 top-3 h-12 border border-border px-4 font-mono text-sm">✕</button>
        </div>
      )}
    </section>
  );
}

function ClipCard({ clip, index, onOpen }: { clip: Clip; index: number; onOpen: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current?.parentElement;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e) return;
      setNear(e.isIntersecting);
      if (ref.current) e.isIntersecting ? ref.current.play().catch(() => {}) : ref.current.pause();
    }, { rootMargin: "200px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const vertical = clip.orientation === "vertical";
  return (
    <button onClick={onOpen} className={`relative shrink-0 overflow-hidden border border-border bg-graphite ${vertical ? "h-[60vh] max-h-[560px] aspect-[9/16]" : "h-[34vh] max-h-[320px] aspect-video"}`}>
      {clip.src ? (
        <video ref={ref} src={near ? clip.src : undefined} poster={clip.poster || undefined} muted loop playsInline preload="none" className="absolute inset-0 h-full w-full object-cover grayscale-[40%]" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(ellipse_at_30%_30%,color-mix(in_oklab,var(--gold)_16%,transparent),transparent_60%),radial-gradient(ellipse_at_70%_80%,color-mix(in_oklab,var(--nv)_10%,transparent),transparent_60%)]">
          <video ref={ref} className="hidden" muted />
          <span className="font-display text-5xl text-gold/40">EM BREVE</span>
        </div>
      )}
      <div className="fx-scanlines pointer-events-none absolute inset-0 opacity-50" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,var(--background)_110%)]" />
      <span className="absolute left-3 top-3 font-mono text-[10px] text-rec"><span className="anim-blink">●</span> {String(index + 1).padStart(2, "0")}</span>
      <span className="absolute bottom-3 left-3 font-mono text-[11px] text-bone">{clip.caption}</span>
    </button>
  );
}
