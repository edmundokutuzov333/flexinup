import { formatDatePt, site } from "@/config/site";
import { img } from "@/lib/assets";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "./SectionHeading";

const steps = [["01", "Filma.", "30s com o filtro oficial."], ["02", "Partilha.", `Publica e faz tag @${site.handles.khriys}.`], ["03", "Ganha.", "Mais likes leva. Segue o Khriys."]];
export function Challenge({ onFilm }: { onFilm: () => void }) {
  const c = site.challenge;
  return (
    <section id="challenge" className="editorial-section page-shell">
      <SectionHeading number="02" label="THE CHALLENGE" />
      <div className="challenge-layout">
        <div className="challenge-copy">
          <h2 className="section-title font-display">FAZ O TEU FLEX.<br />30 SEGUNDOS.</h2>
          <ol className="challenge-steps">{steps.map(([n,t,d]) => <li key={n}><span className="editorial-label text-gold">{n}</span><h3>{t}</h3><p>{d}</p></li>)}</ol>
          <Button variant="editorial" onClick={onFilm} className="challenge-cta">FILMAR AGORA</Button>
          <p className="privacy-note">O vídeo fica no teu telemóvel. Nunca nos nossos servidores.</p>
          <div className="challenge-dates">{([["Início", c.startDate], ["Fecho", c.endDate], ["Vencedor", c.announceDate]] as const).map(([label,date]) => <div key={label}><p className="editorial-label">{label}</p><p>{formatDatePt(date)}</p></div>)}</div>
        </div>
        <div className="filter-preview" aria-label="Preview do filtro night vision">
          <img src={img.khriys.src} alt="Khriys com preview night vision" width={540} height={540} loading="lazy" />
          <div className="preview-top"><span>NV / 01</span><span>00:30</span></div>
          <div className="preview-safe" aria-hidden />
          <p className="preview-bottom">I'M FLEXIN UP'<br /><span>OFFICIAL FILTER</span></p>
        </div>
      </div>
    </section>
  );
}
