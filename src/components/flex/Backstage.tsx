import { useEffect, useRef, useState } from "react";
import { site } from "@/config/site";
import { audio } from "@/lib/audio-engine";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./SectionHeading";
type Clip = (typeof site.backstage)[number];
export function Backstage() {
  const [open, setOpen] = useState<Clip | null>(null);
  return <section id="bastidores" className="editorial-section page-shell"><SectionHeading number="04" label="O ESTÚDIO 03:14" title="BASTIDORES" /><div className="snap-x-row backstage-row">{site.backstage.map((c,i) => <ClipCard key={i} clip={c} index={i} onOpen={() => c.src && setOpen(c)} />)}</div>{open && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background" onClick={() => setOpen(null)}><video src={open.src} poster={open.poster || undefined} autoPlay controls playsInline className="max-h-full max-w-full" onPlay={() => audio.stop()} onClick={(e) => e.stopPropagation()} /><Button variant="editorialOutline" onClick={() => setOpen(null)} className="absolute right-5 top-5">FECHAR</Button></div>}</section>;
}
function ClipCard({ clip, index, onOpen }: { clip: Clip; index: number; onOpen: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  useEffect(() => { const el = ref.current?.parentElement; if (!el) return; const io = new IntersectionObserver(([e]) => { if (!e) return; setNear(e.isIntersecting); if (ref.current) e.isIntersecting ? ref.current.play().catch(()=>{}) : ref.current.pause(); },{rootMargin:"200px"}); io.observe(el); return ()=>io.disconnect(); },[]);
  return <figure className={`clip-item ${clip.orientation === "horizontal" ? "landscape" : ""}`}><Button variant="ghost" onClick={onOpen} className="clip-frame" aria-label={clip.caption} disabled={!clip.src}>{clip.src ? <video ref={ref} src={near ? clip.src : undefined} poster={clip.poster || undefined} muted loop playsInline preload="none" className="absolute inset-0 h-full w-full object-cover" /> : <div className="clip-placeholder"><video ref={ref} className="hidden" muted /><span className="font-display">{String(index+1).padStart(2,"0")}</span><p>EM BREVE</p></div>}</Button><figcaption className="clip-caption">{clip.caption}</figcaption></figure>;
}
