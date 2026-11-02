import { useEffect, useRef } from "react";
import { Link } from "@tanstack/react-router";
import { site } from "@/config/site";
import { audio } from "@/lib/audio-engine";
import { useAudioState } from "./Nav";
import { SectionHeading } from "./SectionHeading";
import { Button } from "@/components/ui/button";
const BARS = 28;
export function Listen() {
  const playing = useAudioState().startsWith("true");
  const bars=useRef<(HTMLSpanElement|null)[]>([]);
  useEffect(()=>{let id=0;const tick=()=>{const lv=audio.level();bars.current.forEach((b,i)=>{if(b)b.style.transform=`scaleY(${.08+(lv[i%lv.length]??0)/280})`;});id=requestAnimationFrame(tick);};if(playing)id=requestAnimationFrame(tick);else bars.current.forEach(b=>{if(b)b.style.transform="scaleY(.08)";});return()=>cancelAnimationFrame(id);},[playing]);
  const streams:[string,string][]=[["Spotify",site.links.spotify],["Apple Music",site.links.appleMusic],["YouTube",site.links.youtube],["Audiomack",site.links.audiomack]];
  return <section id="ouvir" className="editorial-section page-shell"><SectionHeading number="06" label="VOLUME ALTO" title="OUVIR" /><div className="listen-layout"><div><div className="editorial-player"><Button variant="editorialOutline" className="player-play" aria-label={playing?"Pausa":"Tocar"} onClick={async()=>{await audio.unlock();audio.toggleFull();}}>{playing?"Ⅱ":"▷"}</Button><div className="player-track"><h3>{site.title}</h3><p>{site.artists}{site.audio.trackUrl?"":" · preview"}</p><div className="waveform" aria-hidden>{Array.from({length:BARS}).map((_,i)=><span key={i} ref={el=>{bars.current[i]=el;}} />)}</div></div></div><div className="instagram-link"><div><p className="editorial-label">INSTAGRAM</p><h3>@{site.handles.khriys}</h3></div><Button variant="editorial" asChild><a href={site.links.instagramKhriys} target="_blank" rel="noopener noreferrer">SEGUIR</a></Button></div></div><div className="stream-list">{streams.map(([n,url])=>url?<a key={n} href={url} target="_blank" rel="noopener noreferrer">{n}<span>↗</span></a>:<span key={n}>{n}<small>EM BREVE</small></span>)}</div></div></section>;
}
export function Footer({ onReplayIntro }: { onReplayIntro:()=>void }) {
  return <footer className="editorial-footer page-shell"><div className="signature-line" aria-hidden><span /></div><div className="footer-grid"><div><p className="text-bone">{site.title}</p><p>{site.artists}</p><p className="mt-4">Written & performed by Khriys x INF8M8US.</p><p>© 2026 · {site.url}</p></div><div><Link to="/regulamento">Regulamento →</Link><br /><Link to="/privacidade">Privacidade →</Link></div><div><Button variant="ghost" onClick={onReplayIntro}>VER INTRO DE NOVO →</Button></div></div></footer>;
}
