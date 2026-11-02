import { useEffect, useRef, useState } from "react";
import { audio } from "@/lib/audio-engine";
import { img } from "@/lib/assets";
import { Glitch, Star4 } from "./Glitch";

export const INTRO_KEY = "fu_intro_seen";

/** Gate (unlocks audio) + 9s intro synced to the 140bpm grid. */
export function GateIntro({ mode, onDone }: { mode: "gate" | "intro"; onDone: () => void }) {
  const [playing, setPlaying] = useState(mode === "intro");

  const enter = async () => {
    await audio.unlock();
    const D = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent;
    D?.requestPermission?.().catch(() => {});
    const seen = localStorage.getItem(INTRO_KEY);
    if (seen) {
      audio.play("full");
      onDone();
    } else setPlaying(true);
  };

  if (!playing) {
    return (
      <div className="fixed inset-0 z-[90] flex flex-col items-center justify-center gap-10 bg-background">
        <Corners />
        <button
          onClick={enter}
          className="anim-heartbeat flex h-40 w-40 items-center justify-center rounded-full bg-gold-metal font-display text-5xl text-primary-foreground shadow-[var(--shadow-gold)]"
        >
          ENTER
        </button>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-bone/70">Som ligado. Luzes apagadas.</p>
      </div>
    );
  }
  return <Intro onDone={onDone} />;
}

const BEAT = 60 / 140;
const timeline: [number, string][] = [
  [0, "jewels"],
  [BEAT * 4, "w1"],
  [BEAT * 6, "w2"],
  [BEAT * 8, "w3"],
  [BEAT * 10, "all"],
  [BEAT * 14, "zoom"],
  [BEAT * 17, "black"],
  [BEAT * 17.5, "logo"],
  [BEAT * 21, "done"],
];
const flashes = [4, 6, 8, 10, 12, 14, 16, 17.5];

function Intro({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState("jewels");
  const [flash, setFlash] = useState(false);
  const done = useRef(false);
  const finish = () => {
    if (done.current) return;
    done.current = true;
    localStorage.setItem(INTRO_KEY, "1");
    audio.play("full");
    onDone();
  };

  useEffect(() => {
    audio.play("intro", true);
    const ids = timeline.map(([t, s]) => setTimeout(() => (s === "done" ? finish() : setStep(s)), t * 1000));
    const fl = flashes.map((b) =>
      setTimeout(() => {
        setFlash(true);
        setTimeout(() => setFlash(false), 70);
      }, b * BEAT * 1000),
    );
    return () => [...ids, ...fl].forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const words = { w1: ["I'M"], w2: ["FLEXIN"], w3: ["UP'"], all: ["I'M", "FLEXIN", "UP'"], zoom: ["I'M", "FLEXIN", "UP'"] }[step as "w1"];

  return (
    <div className="fixed inset-0 z-[90] overflow-hidden bg-background" aria-label="Intro">
      {step !== "black" && step !== "logo" && <Jewels fast={step === "zoom"} />}
      {words && (
        <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center ${step === "zoom" ? "scale-[1.6]" : ""}`}>
          {words.map((w) => (
            <Glitch key={w + step} text={w} active className="font-display text-[26vw] leading-[0.8] text-gold-metal md:text-[16vw]" />
          ))}
        </div>
      )}
      {step === "logo" && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4">
          <h1 className="font-display text-[19vw] text-gold-metal md:text-[11vw]">I'M FLEXIN UP'</h1>
          <p className="font-mono text-sm uppercase tracking-[0.4em] text-bone">Khriys x INF8M8US</p>
        </div>
      )}
      {flash && <div className="absolute inset-0 z-20 bg-bone" />}
      <div className="fx-scanlines pointer-events-none absolute inset-0 z-20 opacity-40" />
      <button onClick={finish} className="absolute bottom-6 right-5 z-30 min-h-12 px-4 font-mono text-xs uppercase tracking-widest text-bone/60">
        Skip →
      </button>
    </div>
  );
}

const jewels = [
  { bg: img.khriys.src, pos: "50% 92%", size: "38vmin", r: "40vmin", dur: 2.6, d: 0 },
  { bg: img.inf8m8us.src, pos: "28% 88%", size: "28vmin", r: "34vmin", dur: 2.2, d: -0.8 },
  { bg: img.inf8m8us.src, pos: "54% 76%", size: "22vmin", r: "46vmin", dur: 3.1, d: -1.6 },
  { bg: img.khriys.src, pos: "50% 37%", size: "30vmin", r: "28vmin", dur: 1.9, d: -0.4 },
  { bg: img.khriys.src, pos: "38% 80%", size: "24vmin", r: "50vmin", dur: 2.8, d: -2 },
];

function Jewels({ fast }: { fast: boolean }) {
  return (
    <div className="absolute inset-0">
      <style>{`@keyframes orbit { from { transform: rotate(0deg) translateX(var(--r)) rotate(0deg) scale(1);} 50% { transform: rotate(180deg) translateX(var(--r)) rotate(-160deg) scale(1.25);} to { transform: rotate(360deg) translateX(var(--r)) rotate(-360deg) scale(1);} }`}</style>
      {jewels.map((j, i) => (
        <div key={i} className="absolute left-1/2 top-1/2" style={{ width: 0, height: 0 }}>
          <div
            className="rounded-full"
            style={
              {
                "--r": j.r,
                width: j.size,
                height: j.size,
                marginLeft: `calc(${j.size} / -2)`,
                marginTop: `calc(${j.size} / -2)`,
                backgroundImage: `url(${j.bg})`,
                backgroundSize: "320%",
                backgroundPosition: j.pos,
                boxShadow: "0 0 60px -10px var(--gold-glow)",
                animation: `orbit ${fast ? j.dur / 3 : j.dur}s linear ${j.d}s infinite`,
                filter: "contrast(1.2) saturate(1.3)",
              } as React.CSSProperties
            }
          />
        </div>
      ))}
      {Array.from({ length: 14 }).map((_, i) => (
        <Star4
          key={i}
          className="absolute h-6 w-6 text-gold-glow"
          style={{ left: `${(i * 37) % 100}%`, top: `${(i * 61) % 100}%`, animation: `twinkle ${0.6 + (i % 4) * 0.3}s steps(4) ${i * 0.1}s infinite` }}
        />
      ))}
    </div>
  );
}

export function Corners() {
  return (
    <>
      <span className="absolute left-4 top-4 font-mono text-[10px] text-gold/60">✚ 001</span>
      <span className="absolute right-4 top-4 font-mono text-[10px] text-gold/60">✦ 140BPM</span>
      <span className="absolute bottom-4 left-4 font-mono text-[10px] text-gold/60">N.V. 6400</span>
      <span className="absolute bottom-4 right-4 font-mono text-[10px] text-gold/60">✚ 2026</span>
    </>
  );
}
