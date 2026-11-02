import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { audio } from "@/lib/audio-engine";
import { img } from "@/lib/assets";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";

export const INTRO_KEY = "fu_intro_seen";

function hasSeenIntro() {
  try {
    return localStorage.getItem(INTRO_KEY) === "1";
  } catch {
    return false;
  }
}

function rememberIntro() {
  try {
    localStorage.setItem(INTRO_KEY, "1");
  } catch {
    // Storage can be unavailable in private browsing; the intro still completes.
  }
}

function GateSound() {
  const muted = useSyncExternalStore(
    (cb) => audio.subscribe(cb),
    () => audio.muted,
    () => false,
  );

  return (
    <Button
      variant="ghost"
      className="sound-button gate-sound entry-sound"
      aria-label={muted ? "Ligar som da entrada" : "Desligar som da entrada"}
      onClick={() => audio.setMuted(!muted)}
    >
      {muted ? "SOM OFF" : "SOM ON"}
    </Button>
  );
}

export function GateIntro({ mode, onDone }: { mode: "gate" | "intro"; onDone: () => void }) {
  const [playing, setPlaying] = useState(mode === "intro");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const enter = () => {
    if (loading) return;
    setLoading(true);
    setError(false);

    let audioReady: Promise<void>;
    try {
      // Call unlock inside the click gesture so browsers can resume audio.
      audioReady = audio.unlock();
    } catch {
      audioReady = Promise.reject(new Error("Audio unavailable"));
    }

    if (hasSeenIntro()) {
      // Returning visitors enter immediately. Audio loads in the background.
      onDone();
      void audioReady.then(() => audio.play("full")).catch(() => {});
      return;
    }

    // Never make the visitor wait for an audio file before showing the intro.
    setPlaying(true);
    setLoading(false);
    void audioReady.catch(() => {});
  };

  return playing ? (
    <Intro onDone={onDone} />
  ) : (
    <div className="editorial-gate flexin-entry-gate" aria-label="I'M FLEXIN UP' por Khriys e INF8M8US" aria-busy={loading}>
      <div className="entry-atmosphere" aria-hidden="true" />
      <div className="entry-grain" aria-hidden="true" />

      <header className="entry-header">
        <span className="entry-edition">FLEXIN UP&#39; <b>001</b></span>
        <span className="entry-header-title">KHRIYS <i>×</i> INF8M8US</span>
        <span className="entry-header-type">OFFICIAL SINGLE</span>
        <GateSound />
      </header>

      <div className="entry-main">
        <section className="entry-copy">
          <p className="entry-kicker"><span>01</span> THE NEW SINGLE</p>

          <h1 className="entry-headline font-display">
            <span className="entry-headline-im">I'M</span>
            <span className="entry-headline-flex">FLEXIN</span>
            <span className="entry-headline-up">UP<span className="entry-apostrophe">'</span></span>
          </h1>

          <p className="entry-artists">KHRIYS <i>×</i> INF8M8US</p>
          <div className="entry-rule" aria-hidden="true"><span /></div>
          <p className="entry-statement">OUÇA JÁ EM</p>
          <p className="entry-listen"><strong>WWW.FLEXINUP.SITE</strong></p>
        </section>

        <section className="entry-visual" aria-label="Retratos de Khriys e INF8M8US e detalhes da campanha">
          <span className="entry-ghost-word" aria-hidden="true">UP'</span>
          <span className="entry-red-slab" aria-hidden="true" />

          <figure className="entry-photo entry-photo-main">
            <img
              src={img.khriys.src}
              srcSet={img.khriys.srcSet}
              sizes="(max-width: 700px) 62vw, 38vw"
              alt="Khriys"
              fetchPriority="high"
              decoding="async"
            />
            <figcaption><span>KHRIYS</span><b>01 / ARTIST</b></figcaption>
          </figure>

          <figure className="entry-photo entry-photo-second">
            <img
              src={img.inf8m8us.src}
              srcSet={img.inf8m8us.srcSet}
              sizes="(max-width: 700px) 44vw, 28vw"
              alt="INF8M8US"
              fetchPriority="high"
              decoding="async"
            />
            <figcaption><span>INF8M8US</span><b>02 / ARTIST</b></figcaption>
          </figure>

          <figure className="entry-object">
            <img src={img.goyard} alt="Bolsa Goyard" loading="eager" decoding="async" />
            <figcaption>THE FLEX / 03</figcaption>
          </figure>

          <div className="entry-cash" aria-hidden="true">
            <img src={img.money} alt="" loading="eager" decoding="async" />
            <span>NO LIMITS</span>
          </div>

          <span className="entry-side-note" aria-hidden="true">MAPUTO · MOZAMBIQUE</span>
          <span className="entry-hand-note" aria-hidden="true">THIS IS HOW WE FLEX</span>
        </section>
      </div>

      <footer className="entry-footer">
        <div className="entry-footer-copy">
          <span>KHRIYS × INF8M8US</span>
          <span>OUVE A FAIXA. ENTRA NO CHALLENGE.</span>
        </div>

        <Button
          variant="editorial"
          onClick={enter}
          disabled={loading}
          className="gate-enter entry-enter"
        >
          {loading ? "A ABRIR..." : "ENTRAR NO SITE"}
          <span aria-hidden="true">↗</span>
        </Button>

        <p className="entry-error" role={error ? "status" : undefined}>
          {error ? "O SOM NÃO ARRANCOU. TENTA OUTRA VEZ." : ""}
        </p>
      </footer>
    </div>
  );
}

function Intro({ onDone }: { onDone: () => void }) {
  const [cut, setCut] = useState(0);
  const done = useRef(false);

  const finish = async () => {
    if (done.current) return;
    done.current = true;
    rememberIntro();

    try {
      audio.play("full");
    } catch {
      // Continue into the site even when audio is unavailable.
    }

    onDone();
  };

  useEffect(() => {
    let cancelled = false;
    let ids: number[] = [];

    const startIntro = async () => {
      try {
        await audio.unlock();
      } catch {
        // Intro visuals and the skip action remain available without sound.
      }
      if (cancelled) return;

      audio.play("intro", false);
      const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
      ids = [
        window.setTimeout(() => setCut(1), 2000),
        window.setTimeout(() => setCut(2), 4000),
        window.setTimeout(finish, calm ? 2000 : site.audio.introSeconds * 1000),
      ];
    };

    void startIntro();
    return () => {
      cancelled = true;
      ids.forEach(window.clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const titles = ["I'M", "FLEXIN", "UP'"];

  return (
    <div className={`editorial-intro simple-intro intro-cut-${cut}`} aria-label="Intro de I'M FLEXIN UP'">
      <GateSound />
      <div key={cut} className="intro-flash" aria-hidden="true" />
      <div className="intro-trailer">
        <img src={cut === 1 ? img.inf8m8us.src : img.khriys.src} alt={cut === 1 ? "INF8M8US" : "Khriys"} />
      </div>
      <div className="simple-intro-credit editorial-label">
        <span>KHRIYS × INF8M8US</span>
        <span>THE SINGLE · 2026</span>
      </div>
      <p key={`title-${cut}`} className="font-brand intro-brand rgb-brand" data-text={titles[cut]}>
        {titles[cut]}
      </p>
      <Button variant="ghost" onClick={finish} className="intro-skip">SKIP →</Button>
    </div>
  );
}
