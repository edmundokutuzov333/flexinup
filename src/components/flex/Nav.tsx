import { useEffect, useState, useSyncExternalStore } from "react";
import { audio } from "@/lib/audio-engine";

const links = [
  ["#challenge", "Challenge"],
  ["#premios", "Prémios"],
  ["#ranking", "Ranking"],
  ["#bastidores", "Bastidores"],
  ["#ouvir", "Ouvir"],
];

export function useAudioState() {
  return useSyncExternalStore(
    (cb) => audio.subscribe(cb),
    () => `${audio.playing}|${audio.muted}`,
    () => "false|false",
  );
}

export function Nav({ onFilm }: { onFilm: () => void }) {
  const state = useAudioState();
  const muted = state.endsWith("true");
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(scrollY > innerHeight * 0.8);
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);

  return (
    <>
      <nav className="fixed inset-x-0 top-0 z-50 flex h-14 items-center gap-2 border-b border-border bg-background/80 px-3 backdrop-blur-sm">
        <a href="#top" className="font-display text-2xl text-gold">FU'</a>
        <div className="snap-x-row flex flex-1 gap-4 overflow-x-auto px-2">
          {links.map(([h, l]) => (
            <a key={h} href={h} className="flex min-h-12 shrink-0 items-center font-mono text-[11px] uppercase tracking-widest text-bone/70 hover:text-gold">
              {l}
            </a>
          ))}
        </div>
        <button
          onClick={() => audio.setMuted(!muted)}
          aria-label={muted ? "Ligar som" : "Desligar som"}
          className="flex h-12 w-12 shrink-0 items-center justify-center border border-border font-mono text-xs text-gold"
        >
          {muted ? "🔇" : "🔊"}
        </button>
      </nav>
      <div className={`fixed inset-x-3 bottom-3 z-50 transition-transform duration-150 md:hidden ${scrolled ? "translate-y-0" : "translate-y-[150%]"}`}>
        <button onClick={onFilm} className="min-h-14 w-full bg-gold-metal font-display text-3xl text-primary-foreground shadow-[var(--shadow-gold)]">
          FILMAR AGORA ●
        </button>
      </div>
    </>
  );
}
