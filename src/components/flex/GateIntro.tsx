import { useEffect, useRef, useState } from "react";
import { audio } from "@/lib/audio-engine";
import { img } from "@/lib/assets";
import { Button } from "@/components/ui/button";
export const INTRO_KEY = "fu_intro_seen";
export function GateIntro({ mode, onDone }: { mode: "gate" | "intro"; onDone: () => void }) {
  const [playing, setPlaying] = useState(mode === "intro");
  const enter = async () => {
    await audio.unlock();
    if (localStorage.getItem(INTRO_KEY)) { audio.play("full"); onDone(); } else setPlaying(true);
  };
  return playing ? <Intro onDone={onDone} /> : <div className="editorial-gate"><Button variant="editorial" onClick={enter} className="gate-enter">ENTER</Button><p>SOM LIGADO. LUZES APAGADAS.</p></div>;
}
function Intro({ onDone }: { onDone: () => void }) {
  const [cut, setCut] = useState(0);
  const done = useRef(false);
  const finish = () => { if (done.current) return; done.current = true; localStorage.setItem(INTRO_KEY, "1"); audio.play("full"); onDone(); };
  useEffect(() => {
    audio.play("intro", true);
    const ids = [setTimeout(() => setCut(1), 2000), setTimeout(() => setCut(2), 4000), setTimeout(finish, 6000)];
    return () => ids.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return <div className={`editorial-intro intro-cut-${cut}`} aria-label="Intro"><div className="intro-jewel"><img src={cut === 1 ? img.inf8m8us.src : img.khriys.src} alt="" /></div><p className="font-display">{["I'M", "FLEXIN", "UP'"][cut]}</p><Button variant="ghost" onClick={finish} className="intro-skip">SKIP →</Button></div>;
}
