import { useCallback, useEffect, useRef, useState } from "react";
import { audio } from "@/lib/audio-engine";
import { FlexCam, pickMime, timecode } from "@/lib/flex-cam";
import { buildCaption, site } from "@/config/site";
import { Glitch } from "./Glitch";

type Phase = "prep" | "requesting" | "loading" | "preparing" | "ready" | "countdown" | "recording" | "review" | "success" | "error";
type ErrKind = "denied" | "nocam" | "unsupported" | "generic";

const DURATION = site.challenge.seconds;
const vibrate = (ms: number | number[]) => navigator.vibrate?.(ms);

export function Recorder({ onClose }: { onClose: () => void }) {
  const [phase, setPhase] = useState<Phase>("prep");
  const [err, setErr] = useState<ErrKind>("generic");
  const [count, setCount] = useState(3);
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [mic, setMic] = useState(false);
  const [result, setResult] = useState<{ url: string; blob: Blob; ext: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [canShare, setCanShare] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef<HTMLSpanElement>(null);
  const nv = useRef<FlexCam | null>(null);
  const beatRef = useRef({ level: 0, pulse: 0 });
  const stream = useRef<MediaStream | null>(null);
  const micStream = useRef<MediaStream | null>(null);
  const micNode = useRef<MediaStreamAudioSourceNode | null>(null);
  const raf = useRef(0);
  const recStart = useRef(0);
  const recorder = useRef<MediaRecorder | null>(null);\n  const beginLock = useRef(false);
  const phaseRef = useRef<Phase>("prep");
  phaseRef.current = phase;

  const stopCamera = () => {
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
  };

  const loop = useCallback(() => {
    const v = videoRef.current;
    const r = nv.current;
    if (v && r) {
      const t = performance.now() / 1000;
      const rec = phaseRef.current === "recording";
      const elapsed = rec ? (performance.now() - recStart.current) / 1000 : 0;
      const flash = 0;
      const spectrum = audio.level();
      let bass = 0;
      for (let i = 0; i < Math.min(5, spectrum.length); i++) bass += (spectrum[i] ?? 0) / 255;
      bass /= Math.max(1, Math.min(5, spectrum.length));
      const previous = beatRef.current;
      const level = previous.level + (bass - previous.level) * (bass > previous.level ? 0.34 : 0.075);
      const transient = Math.max(0, bass - previous.level - 0.025);
      const pulse = Math.max(transient * 5.5, previous.pulse * 0.84);
      beatRef.current = { level, pulse };
      const beat = Math.min(1, level * 0.5 + pulse * 0.85);
      r.render(v, t, facing === "user", flash, beat);
      if (rec) {
        if (progressRef.current) progressRef.current.style.transform = `scaleX(${Math.min(elapsed / DURATION, 1)})`;
        if (timeRef.current) timeRef.current.textContent = timecode(elapsed);
        if (elapsed >= DURATION && recorder.current?.state === "recording") recorder.current.stop();
      }
    }
    raf.current = requestAnimationFrame(loop);
  }, [facing]);

  const startCamera = useCallback(
    async (face: "user" | "environment") => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setErr("nocam");
        setPhase("error");
        return;
      }
      if (typeof MediaRecorder === "undefined" || !HTMLCanvasElement.prototype.captureStream) {
        setErr("unsupported");
        setPhase("error");
        return;
      }
      setPhase("requesting");
      try {
        stopCamera();
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: face, width: { ideal: 720 }, height: { ideal: 1280 }, frameRate: { ideal: 30 } },
          audio: false,
        });
        stream.current = s;
        setPhase("loading");
        const v = videoRef.current!;
        v.srcObject = s;
        await v.play();
        if (!nv.current) {
          await document.fonts?.ready;
          nv.current = new FlexCam(canvasRef.current!);
        }
        setPhase("ready");
      } catch (e) {
        const name = (e as DOMException)?.name;
        if (name === "NotAllowedError" || name === "SecurityError") setErr("denied");
        else if (name === "NotFoundError" || name === "OverconstrainedError") setErr("nocam");
        else if ((e as Error)?.message === "webgl2") setErr("unsupported");
        else setErr("generic");
        setPhase("error");
      }
    },
    [],
  );

  // Skip the prep screen when permission was already granted (fewer taps).
  useEffect(() => {
    navigator.permissions
      ?.query({ name: "camera" as PermissionName })
      .then((p) => { if (p.state === "granted") void startCamera("user"); })
      .catch(() => {});
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [startCamera]);

  useEffect(() => {
    cancelAnimationFrame(raf.current);
    if (["ready", "countdown", "recording", "loading", "preparing"].includes(phase)) raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, [phase, loop]);

  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current);
      stopCamera();
      micStream.current?.getTracks().forEach((t) => t.stop());
      if (recorder.current?.state === "recording") recorder.current.stop();
      audio.stop();
      nv.current?.dispose();
    },
    [],
  );

  useEffect(() => () => { if (result) URL.revokeObjectURL(result.url); }, [result]);

  const flip = () => {
    const next = facing === "user" ? "environment" : "user";
    setFacing(next);
    void startCamera(next);
  };

  const begin = async () => {
    if (beginLock.current) return;
    beginLock.current = true;
    setPhase("preparing");

    try {
      await audio.unlock();
      await audio.prepare("challenge");
      setPhase("countdown");
      for (const n of [3, 2, 1]) {
        setCount(n);
        vibrate(20);
        await new Promise((r) => setTimeout(r, 800));
      }
      await record();
    } catch {
      setErr("generic");
      setPhase("error");
    } finally {
      beginLock.current = false;
    }
  };

  const record = async () => {
    const choice = pickMime();
    if (!choice) {
      setErr("unsupported");
      setPhase("error");
      return;
    }
    const out = canvasRef.current!.captureStream(30);
    const music = audio.recDest.stream.getAudioTracks()[0];
    if (mic) {
      try {
        micStream.current = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true } });
        micNode.current = audio.ctx!.createMediaStreamSource(micStream.current);
        micNode.current.connect(audio.recDest);
      } catch {
        /* mic optional */
      }
    }
    if (music) out.addTrack(music);
    const chunks: Blob[] = [];
    let mr: MediaRecorder;
    try {
      mr = new MediaRecorder(out, { mimeType: choice.mime, videoBitsPerSecond: 5_000_000, audioBitsPerSecond: 128_000 });
    } catch {
      mr = new MediaRecorder(out);
    }
    mr.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    mr.onstop = () => {
      audio.stop();
      micNode.current?.disconnect();
      micStream.current?.getTracks().forEach((t) => t.stop());
      vibrate([40, 60, 40]);
      const blob = new Blob(chunks, { type: choice.mime.split(";")[0] ?? choice.mime });
      const file = new File([blob], `flexinup.${choice.ext}`, { type: blob.type });
      setCanShare(!!navigator.canShare?.({ files: [file] }));
      setResult({ url: URL.createObjectURL(blob), blob, ext: choice.ext });
      setPhase("review");
    };
    recorder.current = mr;
    recStart.current = performance.now();
    beatRef.current = { level: 0, pulse: 0 };
    audio.play("challenge", false);
    mr.start(1000);
    vibrate(80);
    setPhase("recording");
  };

  const redo = () => {
    if (result) URL.revokeObjectURL(result.url);
    setResult(null);
    setPhase("ready");
  };

  const download = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.url;
    a.download = `flexinup-${Date.now()}.${result.ext}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setPhase("success");
  };

  const share = async () => {
    if (!result) return;
    const file = new File([result.blob], `flexinup.${result.ext}`, { type: result.blob.type });
    try {
      await navigator.share({ files: [file], text: buildCaption() });
      setPhase("success");
    } catch {
      /* cancelled */
    }
  };

  const copy = async () => {
    await navigator.clipboard?.writeText(buildCaption());
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const live = ["loading", "preparing", "ready", "countdown", "recording"].includes(phase);

  return (
    <div role="dialog" aria-modal="true" aria-label="Gravar o teu flex" className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
      <div className="relative h-full max-h-[100dvh] w-full max-w-[calc(100dvh*9/16)] overflow-hidden bg-graphite">
        <video ref={videoRef} playsInline muted className="hidden" />
        <canvas ref={canvasRef} className={`absolute inset-0 h-full w-full object-cover ${live ? "" : "hidden"}`} />

        {/* top bar */}
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between p-3">
          <button onClick={onClose} aria-label="Fechar" className="h-12 min-w-12 border border-border bg-background/70 px-3 font-mono text-sm uppercase">
            ✕ Sair
          </button>
          {live && phase !== "recording" && (
            <button onClick={flip} aria-label="Trocar câmara" className="h-12 min-w-12 border border-border bg-background/70 px-3 font-mono text-sm uppercase">
              ⟲ Câmara
            </button>
          )}
        </div>

        {phase === "recording" && (
          <>
            <div className="absolute inset-x-0 top-0 z-30 h-1 bg-muted">
              <div ref={progressRef} className="h-full origin-left bg-gold" style={{ transform: "scaleX(0)" }} />
            </div>
            <span ref={timeRef} className="absolute bottom-32 right-4 z-30 font-mono text-sm text-bone">00:00:00</span>
          </>
        )}

        {phase === "prep" && (
          <Panel>
            <p className="font-mono text-xs uppercase tracking-widest text-nv">✦ Passo 1 de 2</p>
            <h2 className="font-display text-6xl text-gold-metal">Liga a câmara.</h2>
            <p className="font-mono text-sm text-bone/80">Precisamos da câmara para o filtro. Nada é enviado para servidores. Tudo fica no teu telemóvel.</p>
            <BigBtn onClick={() => startCamera(facing)}>ATIVAR CÂMARA</BigBtn>
          </Panel>
        )}
        {phase === "requesting" && <Status text="A pedir permissão…" />}
        {phase === "loading" && <Status text="A carregar o filtro…" />}\n        {phase === "preparing" && <Status text="A preparar a música…" />}

        {phase === "ready" && (
          <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col items-center gap-4 bg-gradient-to-t from-background/90 to-transparent p-5 pb-8">
            <label className="flex min-h-12 items-center gap-3 font-mono text-xs uppercase text-bone">
              <input type="checkbox" checked={mic} onChange={(e) => setMic(e.target.checked)} className="h-5 w-5 accent-[var(--gold)]" />
              Microfone {mic ? "ligado" : "desligado"}
            </label>
            {mic && <p className="-mt-3 font-mono text-[11px] text-nv">Usa auscultadores se ligares o microfone.</p>}
            <button onClick={begin} aria-label="Gravar" className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-gold shadow-[var(--shadow-gold)]">
              <span className="h-16 w-16 rounded-full bg-rec" />
            </button>
            <p className="font-mono text-[11px] uppercase text-muted-foreground">{DURATION}s · música incluída · fica só no teu dispositivo</p>
          </div>
        )}

        {phase === "countdown" && (
          <div className="absolute inset-0 z-30 flex items-center justify-center">
            <Glitch key={count} text={String(count)} className="font-display text-[12rem] text-gold-metal" active />
          </div>
        )}

        {phase === "review" && result && (
          <div className="absolute inset-0 z-20 flex flex-col bg-background">
            <video src={result.url} playsInline controls autoPlay loop className="min-h-0 flex-1 bg-background object-contain" />
            <div className="grid grid-cols-3 gap-2 p-3">
              <BigBtn onClick={download}>DESCARREGAR</BigBtn>
              <BigBtn onClick={share} disabled={!canShare} ghost>PARTILHAR</BigBtn>
              <BigBtn onClick={redo} ghost>REFAZER</BigBtn>
            </div>
            {result.ext === "webm" && (
              <p className="px-4 pb-3 font-mono text-[11px] text-muted-foreground">
                O teu browser gravou em WebM. Se o Instagram recusar, abre o site no Safari (iPhone) ou converte no CapCut.
              </p>
            )}
          </div>
        )}

        {phase === "success" && (
          <Panel>
            <p className="font-mono text-xs uppercase tracking-widest text-nv">✦ Feito</p>
            <h2 className="font-display text-6xl text-gold-metal">Flex gravado.</h2>
            <p className="font-mono text-sm text-bone/80">Publica, faz tag ao @{site.handles.khriys} e mete o link no ranking.</p>
            <div className="border border-gold/50 bg-graphite p-3 text-left font-mono text-sm text-bone">{buildCaption()}</div>
            <BigBtn onClick={copy}>{copied ? "COPIADO ✓" : "COPIAR LEGENDA"}</BigBtn>
            <div className="grid grid-cols-2 gap-2">
              {canShare && <BigBtn onClick={share} ghost>PARTILHAR</BigBtn>}
              <BigBtn
                ghost
                onClick={() => {
                  onClose();
                  setTimeout(() => document.getElementById("ranking")?.scrollIntoView(), 50);
                }}
              >
                ENTRAR NO RANKING
              </BigBtn>
              <BigBtn ghost onClick={redo}>REFAZER</BigBtn>
            </div>
          </Panel>
        )}

        {phase === "error" && (
          <Panel>
            <h2 className="font-display text-5xl text-gold-metal">
              {err === "denied" ? "Câmara bloqueada." : err === "nocam" ? "Sem câmara aqui." : err === "unsupported" ? "Este browser não grava." : "Algo falhou."}
            </h2>
            <p className="font-mono text-sm text-bone/80">
              {err === "denied"
                ? "Dá permissão à câmara nas definições do browser e tenta outra vez."
                : err === "nocam"
                  ? `Abre ${site.url} no telemóvel e filma lá.`
                  : err === "unsupported"
                    ? "Usa o Chrome (Android) ou Safari atualizado (iPhone). Ou abre no telemóvel."
                    : "Fecha e tenta outra vez."}
            </p>
            <BigBtn onClick={() => startCamera(facing)}>TENTAR DE NOVO</BigBtn>
          </Panel>
        )}
      </div>
    </div>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-center gap-5 overflow-y-auto bg-background/95 p-6 text-center fx-scanlines">{children}</div>
  );
}
function Status({ text }: { text: string }) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center">
      <p className="anim-nvpulse font-mono text-sm uppercase tracking-widest text-nv">● {text}</p>
    </div>
  );
}
function BigBtn({ children, onClick, ghost, disabled }: { children: React.ReactNode; onClick: () => void; ghost?: boolean; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`min-h-14 px-3 font-mono text-sm font-bold uppercase tracking-wider transition-transform active:scale-95 disabled:opacity-30 ${
        ghost ? "border border-gold text-gold" : "bg-gold-metal text-primary-foreground shadow-[var(--shadow-gold)]"
      }`}
    >
      {children}
    </button>
  );
}
