import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { site } from "@/config/site";
import { img } from "@/lib/assets";
import { SectionHeading } from "./SectionHeading";
const PrizeScene = lazy(() => import("./PrizeScene"));
const rules = [["Segue o Khriys", `Seguir @${site.handles.khriys} no Instagram é obrigatório.`], ["Publica + tag", `Publica o teu vídeo e faz tag @${site.handles.khriys}.`], ["Mais likes ganha", "Ganha quem tiver mais likes no vídeo, só se estiver a seguir o Khriys."]];
export function Prizes() {
  return <section id="premios" className="editorial-section prize-band"><div className="page-shell">
    <SectionHeading number="03" label="O COFRE" title="O QUE ESTÁ EM JOGO" />
    <div className="prize-grid"><Prize kind="money" label={site.challenge.prizeMoney} fallback={img.money} /><Prize kind="goyard" label={site.challenge.prizeItem} fallback={img.goyard} /></div>
    <div className="prize-rules">{rules.map(([t,d]) => <div key={t}><h3>{t}</h3><p>{d}</p></div>)}<Link to="/regulamento">Regulamento completo →</Link></div>
  </div></section>;
}
function Prize({ kind, label, fallback }: { kind: "money" | "goyard"; label: string; fallback: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);
  useEffect(() => { const io = new IntersectionObserver(([e]) => { if (e?.isIntersecting) { setShow(true); io.disconnect(); } }, { rootMargin: "200px" }); if (ref.current) io.observe(ref.current); return () => io.disconnect(); }, []);
  const placeholder = <img src={fallback} alt={label} loading="lazy" className="absolute inset-0 m-auto h-4/5 w-4/5 object-contain" />;
  return <div><div ref={ref} className="prize-stage" aria-label={label}>{show ? <Suspense fallback={placeholder}><PrizeScene kind={kind} image={fallback} /></Suspense> : placeholder}</div><h3 className="prize-label font-display">{label}</h3><p className="prize-caption">{kind === "money" ? "O teu flex. O teu prémio." : "Original. Sem conversa."}</p></div>;
}
