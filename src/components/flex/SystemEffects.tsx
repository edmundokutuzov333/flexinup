import { useEffect, useRef, useState } from "react";
import { audio } from "@/lib/audio-engine";

export function SystemEffects({ active }: { active: boolean }) {
  const [telemetry, setTelemetry] = useState("0000 / 0000");
  const flash = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!active || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let last = "";
    let frame = 0;
    let timer = 0;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || entry.target.id === last) continue;
        if (last && flash.current) {
          flash.current.classList.remove("is-cut");
          frame = requestAnimationFrame(() => flash.current?.classList.add("is-cut"));
        }
        last = entry.target.id;
      }
    }, { rootMargin: "-15% 0px -70% 0px", threshold: 0 });
    document.querySelectorAll("main > section[id]").forEach(el => observer.observe(el));
    const tick = () => {
      setTelemetry(`${String(Math.floor(Math.random() * 9999)).padStart(4, "0")} / ${String(Math.floor(Math.random() * 9999)).padStart(4, "0")}`);
      const levels = audio.level();
      const peak = Math.max(...levels) / 255;
      root.current?.style.setProperty("--signal", String(audio.playing ? peak : 0.15));
    };
    timer = window.setInterval(tick, 600);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); clearInterval(timer); };
  }, [active]);
  return <div ref={root} className="system-effects" aria-hidden><div ref={flash} className="chapter-flash" /><span className="system-telemetry">SYS / {telemetry}</span><span className="system-signal">● LIVE / FU</span></div>;
}