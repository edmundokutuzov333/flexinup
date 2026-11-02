import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { site } from "@/config/site";
import { audio } from "@/lib/audio-engine";
import { useAudioState } from "./Nav";
import { Glitch, Cross } from "./Glitch";

const BARS = 28;

export function Listen() {
  const playing = useAudioState().startsWith("true");
  const bars = useRef<(HTMLSpanElement | null)[]>([]);
  useEffect(() => {
    let id = 0;
    const tick = () => {
      const lv = audio.level();
      bars.current.forEach((b, i) => {
        if (b) b.style.transform = `scaleY(${0.08 + (lv[i % lv.length] ?? 0) / 280})`;
      });
      id = requestAnimationFrame(tick);
    };
    if (playing) id = requestAnimationFrame(tick);
    else bars.current.forEach((b) => b && (b.style.transform = "scaleY(0.08)"));
    return () => cancelAnimationFrame(id);
  }, [playing]);

  const streams: [string, string][] = [
    ["Spotify", site.links.spotify],
    ["Apple Music", site.links.appleMusic],
    ["YouTube", site.links.youtube],
    ["Audiomack", site.links.audiomack],
  ];

  return (
    <section id="ouvir" className="px-4 py-24">
      <div className="mx-auto max-w-3xl">
        <Glitch as="h2" text="OUVIR" className="block font-display text-6xl text-gold-metal md:text-8xl" />
        <div className="mt-8 flex items-center gap-4 border border-gold/60 bg-graphite p-4">
          <button
            onClick={async () => { await audio.unlock(); audio.toggleFull(); }}
            aria-label={playing ? "Pausa" : "Tocar"}
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gold-metal font-mono text-2xl text-primary-foreground"
          >
            {playing ? "❚❚" : "▶"}
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-3xl text-bone">I'M FLEXIN UP'</p>
            <p className="font-mono text-xs text-muted-foreground">Khriys x INF8M8US{site.audio.trackUrl ? "" : " · preview"}</p>
            <div className="mt-2 flex h-10 items-center gap-[3px]" aria-hidden>
              {Array.from({ length: BARS }).map((_, i) => (
                <span key={i} ref={(el) => { bars.current[i] = el; }} className="h-full flex-1 origin-center bg-gold" style={{ transform: "scaleY(0.08)" }} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          {streams.map(([n, url]) =>
            url ? (
              <a key={n} href={url} target="_blank" rel="noopener noreferrer" className="flex min-h-14 items-center justify-center border border-border font-mono text-sm uppercase text-bone hover:border-gold hover:text-gold">
                {n} ↗
              </a>
            ) : (
              <span key={n} className="flex min-h-14 flex-col items-center justify-center border border-dashed border-border font-mono text-sm uppercase text-muted-foreground">
                {n}<span className="text-[10px]">em breve</span>
              </span>
            ),
          )}
        </div>

        <a href={site.links.instagramKhriys} target="_blank" rel="noopener noreferrer" className="mt-8 flex items-center justify-between gap-4 border-2 border-gold p-5 shadow-[var(--shadow-gold)]">
          <div>
            <p className="font-mono text-xs uppercase text-nv">Instagram</p>
            <p className="font-display text-4xl text-gold-metal">@{site.handles.khriys}</p>
          </div>
          <span className="min-h-12 bg-gold-metal px-5 py-3 font-mono text-sm font-bold uppercase text-primary-foreground">Seguir</span>
        </a>
      </div>
    </section>
  );
}

export function Footer({ onReplayIntro }: { onReplayIntro: () => void }) {
  return (
    <footer className="border-t border-border px-4 pb-28 pt-12 font-mono text-xs text-muted-foreground md:pb-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-display text-4xl text-gold">Khriys x INF8M8US</p>
          <p className="mt-2">I'M FLEXIN UP' — Written & performed by Khriys x INF8M8US.</p>
          <p className="mt-1">© 2026 · {site.url}</p>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-1">
          <Link to="/regulamento" className="flex min-h-12 items-center hover:text-gold">Regulamento</Link>
          <Link to="/privacidade" className="flex min-h-12 items-center hover:text-gold">Privacidade</Link>
          <button onClick={onReplayIntro} className="flex min-h-12 items-center uppercase hover:text-gold">Ver intro de novo ↺</button>
        </div>
      </div>
      <Cross className="mx-auto mt-8 h-6 w-4 text-gold/30" />
    </footer>
  );
}
