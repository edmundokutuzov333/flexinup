import { useEffect, useState, useSyncExternalStore } from "react";
import { audio } from "@/lib/audio-engine";
import { Button } from "@/components/ui/button";
const links = [["#challenge", "Challenge"], ["#premios", "Prémios"], ["#ranking", "Ranking"], ["#bastidores", "Bastidores"], ["#ouvir", "Ouvir"]];
export function useAudioState() {
  return useSyncExternalStore((cb) => audio.subscribe(cb), () => `${audio.playing}|${audio.muted}`, () => "false|false");
}
export function Nav({ onFilm }: { onFilm: () => void }) {
  const muted = useAudioState().endsWith("true");
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => { const hero = document.getElementById("top"); setScrolled(!!hero && hero.getBoundingClientRect().bottom <= 56); };
    addEventListener("scroll", on, { passive: true }); return () => removeEventListener("scroll", on);
  }, []);
  return <>
    <nav className="editorial-nav"><a href="#top" className="nav-brand">FU'</a><div className="snap-x-row nav-links">{links.map(([h,l]) => <a key={h} href={h}>{l}</a>)}</div><Button variant="ghost" onClick={() => audio.setMuted(!muted)} aria-label={muted ? "Ligar som" : "Desligar som"} className="sound-button">{muted ? "SOM OFF" : "SOM ON"}</Button></nav>
    <div className={`mobile-film-bar ${scrolled ? "is-shown" : ""}`}><Button variant="editorial" onClick={onFilm}>FILMAR AGORA</Button></div>
  </>;
}
