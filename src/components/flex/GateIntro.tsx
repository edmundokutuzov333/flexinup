import { useEffect, useRef, useState, useSyncExternalStore, type PointerEvent as ReactPointerEvent } from "react";
import { audio } from "@/lib/audio-engine";
import { img } from "@/lib/assets";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { FlexAltarArtwork } from "./FlexAltarArtwork";

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
  const gateRef = useRef<HTMLDivElement>(null);

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

  const moveAltar = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    const gate = gateRef.current;
    if (!gate) return;
    gate.style.setProperty("--altar-tilt-x", `${(-y * 3.2).toFixed(2)}deg`);
    gate.style.setProperty("--altar-tilt-y", `${(x * 4.2).toFixed(2)}deg`);
    gate.style.setProperty("--altar-spot-x", `${(50 + x * 34).toFixed(1)}%`);
    gate.style.setProperty("--altar-spot-y", `${(42 + y * 32).toFixed(1)}%`);
  };

  const resetAltar = () => {
    const gate = gateRef.current;
    if (!gate) return;
    gate.style.setProperty("--altar-tilt-x", "0deg");
    gate.style.setProperty("--altar-tilt-y", "0deg");
    gate.style.setProperty("--altar-spot-x", "50%");
    gate.style.setProperty("--altar-spot-y", "42%");
  };

  return playing ? (
    <Intro onDone={onDone} />
  ) : (
    <div
      ref={gateRef}
      className={`editorial-gate altar-gate${loading ? " is-opening" : ""}`}
      aria-label="Entrada de I'M FLEXIN UP'"
      aria-busy={loading}
      onPointerMove={moveAltar}
      onPointerLeave={resetAltar}
    >
      <div className="altar-light" aria-hidden="true" />
      <div className="altar-vignette" aria-hidden="true" />
      <GateSound />

      <div className="altar-topline">
        <span className="altar-edition">FU <b>001</b></span>
        <span className="altar-artists">KHRIYS <i>×</i> INF8M8US</span>
        <span className="altar-collection">THE FLEX ALTAR</span>
      </div>

      <div className="altar-portraits" aria-hidden="true">
        <img className="altar-portrait altar-portrait--left" src={img.khriys.src} alt="" />
        <img className="altar-portrait altar-portrait--right" src={img.inf8m8us.src} alt="" />
      </div>

      <div className="altar-stage" aria-hidden="true">
        <div className="altar-halo" />
        <div className="altar-artwork">
          <div className="altar-artwork-float">
            <FlexAltarArtwork />
          </div>
          <span className="altar-reflection" />
        </div>
      </div>

      <div className="altar-copy">
        <p className="altar-eyebrow">UMA DECLARAÇÃO DE PRESENÇA</p>
        <h1 className="altar-title">
          <span>I'M FLEXIN</span>
          <span className="altar-title-up">UP<span>'</span></span>
        </h1>
        <p className="altar-signature">Khriys <i>×</i> INF8M8US</p>
      </div>

      <div className="altar-action">
        <Button variant="editorial" onClick={enter} disabled={loading} className="gate-enter altar-enter">
          <span className="altar-enter-icon" aria-hidden="true">✦</span>
          {loading ? "A ACENDER..." : "TOCA PARA ENTRAR"}
          <span className="altar-enter-arrow" aria-hidden="true">↗</span>
        </Button>
        <p>{error ? "O SOM NÃO ARRANCOU. TENTA OUTRA VEZ." : "LUZES BAIXAS. BRILHO ALTO."}</p>
        <span className="altar-error" role="status">{error ? "Verifica o som e tenta novamente." : ""}</span>
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
    <div className={`editorial-intro altar-intro intro-cut-${cut}`} aria-label="Intro de I'M FLEXIN UP'">
      <GateSound />
      <div key={cut} className="intro-flash" aria-hidden="true" />
      <div className="intro-trailer">
        <img src={cut === 1 ? img.inf8m8us.src : img.khriys.src} alt={cut === 1 ? "INF8M8US" : "Khriys"} />
      </div>
      <div className="intro-credit editorial-label">
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
