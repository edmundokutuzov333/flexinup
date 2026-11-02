import { useEffect, useRef } from "react";
import { img } from "@/lib/assets";
import { Glitch, Star4, Cross } from "./Glitch";

const sparklesK = [[34, 40], [66, 40], [44, 72], [58, 78], [50, 90], [38, 86], [62, 68]];
const sparklesI = [[32, 87], [53, 72], [55, 83], [34, 31], [63, 40], [55, 97]];

export function Hero({ onFilm, onListen }: { onFilm: () => void; onListen: () => void }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const set = (x: number, y: number) => {
      el.style.setProperty("--px", x.toFixed(3));
      el.style.setProperty("--py", y.toFixed(3));
    };
    const onMove = (e: PointerEvent) => set(e.clientX / innerWidth - 0.5, e.clientY / innerHeight - 0.5);
    const onTilt = (e: DeviceOrientationEvent) => set(Math.max(-1, Math.min(1, (e.gamma ?? 0) / 30)) / 2, Math.max(-1, Math.min(1, ((e.beta ?? 45) - 45) / 30)) / 2);
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("deviceorientation", onTilt, { passive: true });
    return () => {
      removeEventListener("pointermove", onMove);
      removeEventListener("deviceorientation", onTilt);
    };
  }, []);

  return (
    <section ref={ref} id="top" className="relative flex min-h-[100svh] flex-col overflow-hidden pt-16" style={{ "--px": 0, "--py": 0 } as React.CSSProperties}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,color-mix(in_oklab,var(--gold)_14%,transparent),transparent_60%)]" />
      <span className="absolute left-4 top-20 font-mono text-[10px] text-gold/60">✚ REL. 2026</span>
      <span className="absolute right-4 top-20 font-mono text-[10px] text-gold/60">TRK 01 ✦</span>

      {/* Title behind */}
      <div className="relative z-10 mt-6 px-2 text-center" style={{ transform: "translate3d(calc(var(--px) * -12px), calc(var(--py) * -8px), 0)" }}>
        <Glitch as="h1" text="I'M FLEXIN UP'" className="font-display text-[23vw] leading-[0.8] text-gold-metal md:text-[13vw]" />
        <p className="mt-3 font-mono text-sm uppercase tracking-[0.35em] text-bone">Khriys <span className="text-gold">x</span> INF8M8US</p>
      </div>

      {/* Artists in front, heads breaking the title */}
      <div className="relative z-20 -mt-[18vw] flex flex-1 items-end justify-center md:-mt-[9vw]">
        <Artist side="left" src={img.inf8m8us} alt="INF8M8US" sparkles={sparklesI} delay={0} />
        <Artist side="right" src={img.khriys} alt="Khriys" sparkles={sparklesK} delay={2.2} />
      </div>

      <div className="absolute inset-x-0 bottom-0 z-30 flex flex-col gap-3 bg-gradient-to-t from-background via-background/85 to-transparent px-4 pb-6 pt-16 md:flex-row md:justify-center">
        <button
          onClick={onFilm}
          className="min-h-16 bg-gold-metal px-8 font-display text-4xl text-primary-foreground shadow-[var(--shadow-gold)] transition-transform active:scale-95 md:text-5xl"
        >
          <Glitch text="FAZ O TEU FLEX →" />
        </button>
        <button onClick={onListen} className="min-h-12 border border-gold/60 px-6 font-mono text-sm uppercase tracking-widest text-gold">
          ▶ Ouvir agora
        </button>
      </div>
      <Cross className="absolute bottom-40 left-3 z-10 h-6 w-4 text-gold/40" />
    </section>
  );
}

function Artist({ side, src, alt, sparkles, delay }: { side: "left" | "right"; src: { src: string; srcSet: string }; alt: string; sparkles: number[][]; delay: number }) {
  const depth = side === "left" ? 18 : 26;
  return (
    <div
      className={`relative w-[62vw] max-w-[560px] ${side === "left" ? "-mr-[14vw] md:-mr-24" : "-ml-[14vw] md:-ml-24"}`}
      style={{ transform: `translate3d(calc(var(--px) * ${depth}px), calc(var(--py) * ${depth / 2}px), 0)` }}
    >
      <div className="anim-breathe origin-bottom" style={{ animationDelay: `${delay}s` }}>
        <div className="anim-glitch-burst relative" style={{ animationDelay: `${delay}s` }}>
          <img
            src={src.src}
            srcSet={src.srcSet}
            sizes="(max-width: 768px) 62vw, 560px"
            alt={alt}
            width={540}
            height={540}
            fetchPriority="high"
            className="block h-auto w-full select-none"
            draggable={false}
          />
          {/* gold shimmer masked to the cutout */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gold-metal opacity-35 mix-blend-color-dodge"
            style={{
              WebkitMaskImage: `url(${src.src}), linear-gradient(transparent 55%, black 70%)`,
              maskImage: `url(${src.src}), linear-gradient(transparent 55%, black 70%)`,
              WebkitMaskComposite: "source-in",
              maskComposite: "intersect",
              WebkitMaskSize: "100% 100%",
              maskSize: "100% 100%",
            }}
          />
          {sparkles.map(([x, y], i) => (
            <Star4
              key={i}
              className="absolute h-[5%] w-[5%] text-bone drop-shadow-[0_0_6px_var(--gold-glow)]"
              style={{ left: `${x}%`, top: `${y}%`, translate: "-50% -50%", animation: `twinkle ${1.4 + (i % 3) * 0.5}s steps(5) ${i * 0.37 + delay}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
