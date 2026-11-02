import { site } from "@/config/site";

type Mode = "intro" | "challenge" | "full";

/**
 * Motor de áudio único. A música sai para os altifalantes (speaker gain, afetado pelo mute)
 * e para um MediaStreamDestination limpo, usado pela gravação do challenge.
 * Se site.audio.trackUrl estiver vazio, gera um beat trap placeholder.
 */
class AudioEngine {
  ctx: AudioContext | null = null;
  master!: GainNode;
  speaker!: GainNode;
  analyser!: AnalyserNode;
  recDest!: MediaStreamAudioDestinationNode;
  muted = false;
  playing = false;
  private track: AudioBuffer | null = null;
  private clip: AudioBuffer | null = null;
  private src: AudioBufferSourceNode | null = null;
  private timer: number | null = null;
  private nextBeat = 0;
  private step = 0;
  private noise: AudioBuffer | null = null;
  private listeners = new Set<() => void>();

  subscribe(fn: () => void) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  private emit() {
    this.listeners.forEach((f) => f());
  }

  async unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.speaker = this.ctx.createGain();
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.recDest = this.ctx.createMediaStreamDestination();
      this.master.connect(this.analyser);
      this.analyser.connect(this.speaker);
      this.speaker.connect(this.ctx.destination);
      this.master.connect(this.recDest);
      const len = this.ctx.sampleRate * 0.5;
      this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      void this.loadFiles();
    }
    if (this.ctx.state !== "running") await this.ctx.resume();
  }

  private async loadFiles() {
    const ctx = this.ctx!;
    const get = async (url: string) => {
      if (!url) return null;
      try {
        const r = await fetch(url);
        return await ctx.decodeAudioData(await r.arrayBuffer());
      } catch {
        return null;
      }
    };
    [this.track, this.clip] = await Promise.all([get(site.audio.trackUrl), get(site.audio.challengeClipUrl)]);
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.ctx) this.speaker.gain.setTargetAtTime(m ? 0 : 1, this.ctx.currentTime, 0.01);
    this.emit();
  }

  play(mode: Mode, loop = mode === "full") {
    if (!this.ctx) return;
    this.stop();
    this.playing = true;
    const buf = mode === "challenge" ? this.clip ?? this.track : this.track;
    if (buf) {
      const s = this.ctx.createBufferSource();
      s.buffer = buf;
      s.loop = loop;
      s.connect(this.master);
      const offset = mode === "challenge" && !this.clip ? site.audio.challengeOffset : 0;
      s.start(this.ctx.currentTime + 0.02, offset);
      s.onended = () => {
        if (this.src === s) {
          this.playing = false;
          this.emit();
        }
      };
      this.src = s;
    } else {
      this.step = mode === "challenge" ? 16 : 0;
      this.nextBeat = this.ctx.currentTime + 0.05;
      this.timer = window.setInterval(() => this.schedule(), 25);
    }
    this.emit();
  }

  stop() {
    if (this.src) {
      try { this.src.stop(); } catch { /* noop */ }
      this.src.disconnect();
      this.src = null;
    }
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.playing = false;
    this.emit();
  }

  toggleFull() {
    if (this.playing) this.stop();
    else this.play("full");
  }

  level() {
    if (!this.ctx || !this.playing) return new Uint8Array(32);
    const a = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(a);
    return a;
  }

  // ---- Placeholder trap beat (16th grid) ----
  private schedule() {
    const ctx = this.ctx!;
    const sixteenth = 60 / site.audio.bpm / 4;
    while (this.nextBeat < ctx.currentTime + 0.12) {
      const s = this.step % 32;
      const t = this.nextBeat;
      const intro = this.step < 16;
      if (!intro) {
        if ([0, 10, 16, 22, 27].includes(s)) this.kick(t);
        if (s % 8 === 4) this.clap(t);
        const roll = s >= 28 && s < 32;
        if (s % 2 === 0 || roll) this.hat(t, roll ? 0.12 : 0.18);
        if (roll) this.hat(t + sixteenth / 2, 0.1);
      }
      if (s % 8 === 0) this.bell(t, [196, 233, 175, 155][(s / 8) % 4] ?? 196);
      this.nextBeat += sixteenth;
      this.step++;
    }
  }
  private env(t: number, peak: number, dur: number) {
    const g = this.ctx!.createGain();
    g.gain.setValueAtTime(peak, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    g.connect(this.master);
    return g;
  }
  private kick(t: number) {
    const o = this.ctx!.createOscillator();
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
    o.connect(this.env(t, 0.9, 0.9));
    o.start(t);
    o.stop(t + 0.9);
  }
  private noiseHit(t: number, type: BiquadFilterType, f: number, peak: number, dur: number) {
    const n = this.ctx!.createBufferSource();
    n.buffer = this.noise;
    const bq = this.ctx!.createBiquadFilter();
    bq.type = type;
    bq.frequency.value = f;
    n.connect(bq);
    bq.connect(this.env(t, peak, dur));
    n.start(t);
    n.stop(t + dur);
  }
  private hat(t: number, v: number) {
    this.noiseHit(t, "highpass", 8000, v, 0.04);
  }
  private clap(t: number) {
    this.noiseHit(t, "bandpass", 1600, 0.5, 0.18);
  }
  private bell(t: number, f: number) {
    const o = this.ctx!.createOscillator();
    o.type = "triangle";
    o.frequency.value = f * 2;
    o.connect(this.env(t, 0.12, 1.4));
    o.start(t);
    o.stop(t + 1.4);
  }
}

export const audio = new AudioEngine();
