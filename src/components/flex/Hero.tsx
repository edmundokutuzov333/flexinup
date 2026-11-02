import { useEffect, useRef } from "react";
import { img } from "@/lib/assets";
import { site } from "@/config/site";
import { Button } from "@/components/ui/button";

export function Hero({ onFilm, onListen }: { onFilm: () => void; onListen: () => void }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let frame = 0;
    const update = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => el.style.setProperty("--drift", `${Math.min(8, scrollY / 100)}px`)); };
    addEventListener("scroll", update, { passive: true });
    return () => { removeEventListener("scroll", update); cancelAnimationFrame(frame); };
  }, []);
  return (
    <section ref={ref} id="top" className="editorial-hero">
      <p className="editorial-label hero-label">01 / O QUARTO</p>
      <div className="hero-cover">
        <h1 className="hero-title font-display" tabIndex={0}><span>I'M</span><span className="font-brand rgb-brand" data-text="FLEXIN UP'">FLEXIN UP'</span></h1>
        <div className="hero-artists" aria-label={site.artists}>
          <div className="hero-artist artist-left"><img src={img.inf8m8us.src} srcSet={img.inf8m8us.srcSet} sizes="(max-width: 768px) 70vw, 540px" alt="INF8M8US" width={540} height={540} fetchPriority="high" /><span className="jewel-light" /></div>
          <div className="hero-artist artist-right"><img src={img.khriys.src} srcSet={img.khriys.srcSet} sizes="(max-width: 768px) 70vw, 540px" alt="Khriys" width={540} height={540} fetchPriority="high" /><span className="jewel-light" /></div>
        </div>
      </div>
      <div className="hero-bottom">
        <p className="editorial-label text-bone">{site.artists}</p>
        <div className="hero-actions">
          <Button variant="editorial" onClick={onFilm} className="hero-cta">FAZ O TEU FLEX →</Button>
          <Button variant="editorialOutline" onClick={onListen}>OUVIR AGORA</Button>
        </div>
        <p className="hero-footnote">30 SEGUNDOS. O TEU FLEX.</p>
      </div>
    </section>
  );
}
