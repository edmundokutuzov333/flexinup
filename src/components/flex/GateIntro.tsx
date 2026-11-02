import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { audio } from "@/lib/audio-engine";
import { img } from "@/lib/assets";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";

export const INTRO_KEY = "fu_intro_seen";

function GateSound() {
  const muted = useSyncExternalStore(
    (cb) => audio.subscribe(cb),
    () => audio.muted,
    () => false,
  );

  return (
    <Button
      variant="ghost"
      className="sound-button gate-sound poster-sound"
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

  const enter = async () => {
    if (loading) return;
    setLoading(true);
    setError(false);

    try {
      await audio.unlock();
      if (localStorage.getItem(INTRO_KEY)) {
        audio.play("full");
        onDone();
      } else {
        setPlaying(true);
      }
    } catch {
      setError(true);
      setLoading(false);
    }
  };

  return playing ? (
    <Intro onDone={onDone} />
  ) : (
    <div className="editorial-gate flexin-poster-gate" aria-label="Entrada de I'M FLEXIN UP'" aria-busy={loading}>
      <div className="poster-paper-grain" aria-hidden="true" />

      <div className="flexin-poster-sheet">
        <GateSound />
        <header className="poster-heading">
          <h1 className="poster-main-title font-display" data-text="I'M FLEXIN UP'">
            I'M FLEXIN UP'
          </h1>
        </header>

        <div className="poster-gallery" aria-label="Khriys, INF8M8US e símbolos do flex">
          <figure className="poster-frame poster-frame--khriys">
            <img
              src={img.khriys.src}
              srcSet={img.khriys.srcSet}
              sizes="(max-width: 520px) 30vw, 220px"
              alt="Khriys"
              fetchPriority="high"
              decoding="async"
            />
            <figcaption>KHRIYS <span>01</span></figcaption>
          </figure>

          <figure className="poster-frame poster-frame--inf8">
            <img
              src={img.inf8m8us.src}
              srcSet={img.inf8m8us.srcSet}
              sizes="(max-width: 520px) 30vw, 220px"
              alt="INF8M8US"
              fetchPriority="high"
              decoding="async"
            />
            <figcaption>INF8M8US <span>02</span></figcaption>
          </figure>

          <figure className="poster-frame poster-frame--goyard">
            <img src={img.goyard} alt="Bolsa Goyard" loading="eager" decoding="async" />
            <figcaption>THE FLEX <span>03</span></figcaption>
          </figure>

          <div className="poster-snapshot poster-snapshot--cash" aria-hidden="true">
            <img src={img.money} alt="" loading="eager" decoding="async" />
            <span>MT / CASH</span>
          </div>

          <div className="poster-snapshot poster-snapshot--artist" aria-hidden="true">
            <img src={img.khriys.src} srcSet={img.khriys.srcSet} sizes="(max-width: 520px) 28vw, 190px" alt="" decoding="async" />
            <span>KHRIYS · INF8M8US</span>
          </div>

          <span className="poster-cross poster-cross--one" aria-hidden="true">✣</span>
          <span className="poster-cross poster-cross--two" aria-hidden="true">✣</span>
        </div>

        <div className="poster-bottom-copy">
          <h2 className="poster-bottom-title font-display" data-text="SHOW YOUR FLEX">SHOW YOUR FLEX</h2>
          <p className="poster-bottom-line">EVERYTHING OR NOTHING</p>
          <p className="poster-bottom-at">AT ALL</p>
        </div>

        <div className="poster-enter-wrap">
          <Button
            variant="editorial"
            onClick={enter}
            disabled={loading}
            className="gate-enter poster-enter"
          >
            {loading ? "A ABRIR..." : "TOCA PARA ENTRAR"}
            <span aria-hidden="true">↗</span>
          </Button>
          <p className="poster-enter-note" role={error ? "status" : undefined}>
            {error ? "O SOM NÃO ARRANCOU. TENTA OUTRA VEZ." : "KHRIYS × INF8M8US"}
          </p>
        </div>
      </div>
    </div>
  );
}

function Intro({ onDone }: { onDone: () => void }) {
  const [cut, setCut] = useState(0);
  const done = useRef(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    localStorage.setItem(INTRO_KEY, "1");
    audio.play("full");
    onDone();
  };

  useEffect(() => {
    audio.play("intro", false);
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ids = [
      setTimeout(() => setCut(1), 2000),
      setTimeout(() => setCut(2), 4000),
      setTimeout(finish, calm ? 2000 : site.audio.introSeconds * 1000),
    ];
    return () => ids.forEach(clearTimeout);
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
