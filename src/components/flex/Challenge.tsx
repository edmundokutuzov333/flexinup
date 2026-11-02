import { formatDatePt, site } from "@/config/site";
import { Glitch, Star4 } from "./Glitch";

const steps = [
  ["01", "Filma.", "30s com o filtro night vision e a música."],
  ["02", "Partilha.", `Publica e faz tag @${site.handles.khriys}.`],
  ["03", "Ganha.", "Mais likes leva. Tens de seguir o Khriys."],
];

export function Challenge({ onFilm }: { onFilm: () => void }) {
  const c = site.challenge;
  return (
    <section id="challenge" className="relative flex min-h-[100svh] items-center p-3">
      <div className="relative w-full overflow-hidden border-2 border-gold p-5 py-12 shadow-[var(--shadow-gold)] md:p-12">
        <div className="anim-nvpulse pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--nv)_22%,transparent),transparent_70%)]" />
        <div className="fx-scanlines pointer-events-none absolute inset-0 opacity-60" />
        <span className="absolute left-3 top-3 font-mono text-[10px] text-nv">● NV-CAM 01</span>
        <span className="absolute right-3 top-3 font-mono text-[10px] text-nv">00:00:30</span>

        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.4em] text-nv">The Challenge</p>
          <Glitch as="h2" text="FAZ O TEU FLEX. 30 SEGUNDOS." className="font-display text-7xl leading-[0.85] text-gold-metal md:text-9xl" />

          <ol className="grid w-full gap-3 md:grid-cols-3">
            {steps.map(([n, t, d]) => (
              <li key={n} className="flex items-center gap-4 border border-border bg-background/70 p-4 text-left">
                <span className="font-mono text-3xl text-nv">{n}</span>
                <div>
                  <p className="font-display text-3xl text-bone">{t}</p>
                  <p className="font-mono text-xs text-muted-foreground">{d}</p>
                </div>
              </li>
            ))}
          </ol>

          <button
            onClick={onFilm}
            className="anim-heartbeat min-h-20 w-full max-w-md bg-gold-metal font-display text-5xl text-primary-foreground shadow-[var(--shadow-gold)] md:text-6xl"
          >
            FILMAR AGORA ●
          </button>
          <p className="font-mono text-[11px] uppercase text-muted-foreground">Nada é enviado para servidores. Tudo corre no teu telemóvel.</p>

          <div className="grid w-full grid-cols-3 gap-2 font-mono text-[10px] uppercase">
            {[["Início", c.startDate], ["Fecho", c.endDate], ["Vencedor", c.announceDate]].map(([l, d]) => (
              <div key={l} className="border border-border bg-background/70 p-2">
                <p className="text-nv">{l}</p>
                <p className="text-bone">{formatDatePt(d)}</p>
              </div>
            ))}
          </div>
        </div>
        <Star4 className="absolute bottom-4 left-4 h-5 w-5 text-gold" />
        <Star4 className="absolute bottom-4 right-4 h-5 w-5 text-gold" />
      </div>
    </section>
  );
}
