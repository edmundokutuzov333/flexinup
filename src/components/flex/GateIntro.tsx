import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { audio } from "@/lib/audio-engine";
import { img } from "@/lib/assets";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
export const INTRO_KEY = "fu_intro_seen";
function GateSound() {
  const muted = useSyncExternalStore(cb => audio.subscribe(cb), () => audio.muted, () => false);
  return <Button variant="ghost" className="sound-button gate-sound" aria-label={muted ? "Ligar som da entrada" : "Desligar som da entrada"} onClick={() => audio.setMuted(!muted)}>{muted ? "SOM OFF" : "SOM ON"}</Button>;
}
export function GateIntro({ mode, onDone }: { mode: "gate" | "intro"; onDone: () => void }) {
  const [playing, setPlaying] = useState(mode === "intro");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const enter = async () => {
    setLoading(true);
    setError(false);
    try {
      await audio.unlock();
      if (localStorage.getItem(INTRO_KEY)) { audio.play("full"); onDone(); } else setPlaying(true);
    } catch { setError(true); setLoading(false); }
  };
  const skip = async () => { await audio.unlock(); localStorage.setItem(INTRO_KEY, "1"); audio.play("full"); onDone(); };
  return playing ? <Intro onDone={onDone} /> : <div className="editorial-gate os-gate"><GateSound /><div className="gate-system"><p className="os-wordmark font-brand">FLEXIN_OS</p><p className="editorial-label">V1.0 / SYSTEM STANDBY</p><div className="boot-terminal"><p>&gt; audio driver {loading ? "a carregar..." : "em espera"}</p><p>&gt; luzes desligadas</p><p>&gt; {error ? "tenta outra vez" : "à espera do teu sinal_"}</p></div><Button variant="editorial" onClick={enter} disabled={loading} className="gate-enter">{loading ? "A LIGAR…" : "ENTER"}</Button><p className="gate-motto">SOM LIGADO. LUZES APAGADAS.</p></div><Button variant="ghost" onClick={() => void skip()} className="intro-skip">SKIP →</Button></div>;
}
function Intro({ onDone }: { onDone: () => void }) {
  const [cut, setCut] = useState(0);
  const done = useRef(false);
  const finish = () => { if (done.current) return; done.current = true; localStorage.setItem(INTRO_KEY, "1"); audio.play("full"); onDone(); };
  useEffect(() => {
    audio.play("intro", false);
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ids = [setTimeout(() => setCut(1), 2000), setTimeout(() => setCut(2), 4000), setTimeout(finish, calm ? 2000 : site.audio.introSeconds * 1000)];
    return () => ids.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <div className={`editorial-intro os-intro intro-cut-${cut}`} aria-label="Intro"><GateSound /><div key={cut} className="intro-flash" aria-hidden /><div className="intro-trailer"><img src={cut === 1 ? img.inf8m8us.src : img.khriys.src} alt={cut === 1 ? "INF8M8US" : "Khriys"} /></div><div className="intro-terminal editorial-label"><p>FLEXIN_OS v1.0</p><p>{["a carregar audio driver...", "a desligar luzes...", "sistema pronto / entra no quarto_"][cut]}</p></div><p key={`title-${cut}`} className="font-brand intro-brand rgb-brand" data-text={["I'M", "FLEXIN", "UP'"][cut]}>{["I'M", "FLEXIN", "UP'"][cut]}</p><Button variant="ghost" onClick={finish} className="intro-skip">SKIP →</Button></div>;
}
