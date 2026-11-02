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
      className="sound-button gate-sound"
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
    <div className="editorial-gate simple-gate" aria-label="Entrada de I'M FLEXIN UP'" aria-busy={loading}>
      <div className="simple-gate-art" aria-hidden="true">
        <img className="simple-gate-artist simple-gate-artist--left" src={img.khriys.src} alt="" />
        <img className="simple-gate-artist simple-gate-artist--right" src={img.inf8m8us.src} alt="" />
      </div>

      <GateSound />

      <div className="simple-gate-main">
        <p className="simple-gate-kicker">A NOVA FAIXA DE KHRIYS X INF8M8US</p>
        <h1 className="simple-gate-title font-brand">
          <span>I'M</span>
          <span>FLEXIN</span>
          <span className="simple-gate-title-up">UP'</span>
        </h1>
        <p className="simple-gate-signature">Khriys <i>×</i> INF8M8US</p>

        <Button variant="editorial" onClick={enter} disabled={loading} className="gate-enter simple-gate-enter">
          {loading ? "A ABRIR..." : "TOCA PARA ENTRAR"}
          <span aria-hidden="true">↗</span>
        </Button>

        <p className="simple-gate-note" role={error ? "status" : undefined}>
          {error ? "O SOM NÃO ARRANCOU. TENTA OUTRA VEZ." : "SOM LIGADO. LUZES APAGADAS."}
        </p>
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
