import { useEffect, useRef } from "react";

export function SectionHeading({ number, label, title }: { number: string; label: string; title?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) { el.classList.add("is-visible"); observer.disconnect(); }
    }, { threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return (
    <div ref={ref} className="section-heading reveal">
      <div className="signature-line" aria-hidden><span /></div>
      <p className="editorial-label"><span className="text-gold">{number}</span> / {label}</p>
      {title && <h2 className="section-title font-display text-bone">{title}</h2>}
    </div>
  );
}