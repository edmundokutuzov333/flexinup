import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { GateIntro } from "@/components/flex/GateIntro";
import { Hero } from "@/components/flex/Hero";
import { Nav } from "@/components/flex/Nav";
import { Challenge } from "@/components/flex/Challenge";
import { Prizes } from "@/components/flex/Prizes";
import { Submit } from "@/components/flex/Submit";
import { Backstage } from "@/components/flex/Backstage";
import { Listen, Footer } from "@/components/flex/Listen";
import { audio } from "@/lib/audio-engine";

const Recorder = lazy(() => import("@/components/flex/Recorder").then((m) => ({ default: m.Recorder })));

const TITLE = "I'M FLEXIN UP' — Khriys x INF8M8US";
const DESC = "Faz o teu flex em 30s com o filtro night vision oficial. Publica, faz tag ao @khriys e ganha 5.000 MT + bolsa Goyard.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESC },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESC },
      { property: "og:type", content: "music.song" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESC },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  const [overlay, setOverlay] = useState<"gate" | "intro" | null>("gate");
  const [rec, setRec] = useState(false);
  const film = () => {
    void audio.unlock();
    setRec(true);
  };

  return (
    <main className="relative editorial-site">
      {overlay && <GateIntro key={overlay} mode={overlay} onDone={() => setOverlay(null)} />}
      <Nav onFilm={film} />
      <Hero onFilm={() => document.getElementById("challenge")?.scrollIntoView()} onListen={() => document.getElementById("ouvir")?.scrollIntoView()} />
      <Challenge onFilm={film} />
      <Prizes />
      <Submit />
      <Backstage />
      <Listen />
      <Footer onReplayIntro={() => { audio.stop(); scrollTo(0, 0); setOverlay("intro"); }} />
      {rec && (
        <Suspense fallback={<div className="fixed inset-0 z-[100] flex items-center justify-center bg-background font-mono text-sm text-nv">● A carregar o filtro…</div>}>
          <Recorder onClose={() => { setRec(false); audio.play("full"); }} />
        </Suspense>
      )}
    </main>
  );
}
