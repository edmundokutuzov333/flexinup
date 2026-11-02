import { site } from "@/config/site";

export const CAPTURE_W = 720;
export const CAPTURE_H = 1280;

const VS = `#version 300 es
in vec2 a; out vec2 v;
void main(){ v = a*0.5+0.5; gl_Position = vec4(a,0.,1.); }`;

// Single-pass night-vision shader: mono phosphor, contrast, bloom, grain, scanlines,
// edge chromatic aberration, vignette, flicker, horizontal instability + HUD overlay.
const FS = `#version 300 es
precision mediump float;
uniform sampler2D uVid; uniform sampler2D uOv;
uniform vec2 uScale; uniform vec2 uOff;
uniform float uT; uniform float uQ; uniform float uMirror; uniform float uFlash;
in vec2 v; out vec4 o;
float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
vec2 vuv(vec2 p){ vec2 u = p*uScale + uOff; if(uMirror > .5) u.x = 1.-u.x; return u; }
float lum(vec2 p){ return dot(texture(uVid, vuv(p)).rgb, vec3(.299,.587,.114)); }
float tone(float l){ l = smoothstep(.04, .78, l); return pow(l, .8) * 1.2; }
void main(){
  vec2 p = v;
  float line = floor(p.y * 360.);
  float glitchOn = step(.975, h(vec2(floor(uT*6.), 7.)));
  p.x += glitchOn * (h(vec2(line, floor(uT*30.))) - .5) * .03;
  p.x += sin(p.y*40. + uT*3.) * .0008;
  vec2 c = p - .5; float r = dot(c,c);
  float ca = r * .045;
  float l = lum(p), lr = lum(p + c*ca), lb = lum(p - c*ca);
  float b = 0.;
  if (uQ > .5) {
    for (int i = 0; i < 8; i++) {
      float a = float(i) * .7854;
      vec2 d = vec2(cos(a), sin(a)*.5625);
      b += max(lum(p + d*.012) - .6, 0.) + max(lum(p + d*.03) - .6, 0.) * .7;
    }
    b *= .5;
  }
  vec3 nv = vec3(.224, 1., .478);
  vec3 col = vec3(tone(lr)*nv.r, tone(l)*nv.g, tone(lb)*nv.b);
  col += pow(clamp(l,0.,1.), 5.) * vec3(.8,1.,.85) * 1.4;
  col += b * vec3(.55,1.,.7);
  float g = h(p*vec2(731.,1297.) + fract(uT*13.)) - .5;
  col += g * (uQ > .5 ? .2 : .1);
  col *= .86 + .14 * sin(v.y * 1280. * 1.5708);
  col *= .93 + .07 * h(vec2(floor(uT*24.), 1.));
  float vig = smoothstep(.95, .25, length(c * vec2(1.25, .9)));
  col *= vig * vig;
  vec4 ov = texture(uOv, v);
  col = mix(col, ov.rgb, ov.a);
  col = mix(col, vec3(1.), uFlash);
  o = vec4(col, 1.);
}`;

export type HudState = { elapsed: number; recording: boolean; card: boolean };

export class NightVision {
  gl: WebGL2RenderingContext;
  private prog: WebGLProgram;
  private vidTex: WebGLTexture;
  private ovTex: WebGLTexture;
  private u: Record<string, WebGLUniformLocation | null> = {};
  overlay: HTMLCanvasElement;
  private octx: CanvasRenderingContext2D;
  quality = 1;
  private lastHudKey = "";
  private frameTimes: number[] = [];
  private last = 0;

  constructor(public canvas: HTMLCanvasElement) {
    canvas.width = CAPTURE_W;
    canvas.height = CAPTURE_H;
    const gl = canvas.getContext("webgl2", { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: false });
    if (!gl) throw new Error("webgl2");
    this.gl = gl;
    const sh = (t: number, s: string) => {
      const x = gl.createShader(t)!;
      gl.shaderSource(x, s);
      gl.compileShader(x);
      if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(x) || "shader");
      return x;
    };
    const p = gl.createProgram()!;
    gl.attachShader(p, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(p);
    gl.useProgram(p);
    this.prog = p;
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(p, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    for (const n of ["uVid", "uOv", "uScale", "uOff", "uT", "uQ", "uMirror", "uFlash"]) this.u[n] = gl.getUniformLocation(p, n);
    const mk = () => {
      const t = gl.createTexture()!;
      gl.bindTexture(gl.TEXTURE_2D, t);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      return t;
    };
    this.vidTex = mk();
    this.ovTex = mk();
    gl.uniform1i(this.u.uVid, 0);
    gl.uniform1i(this.u.uOv, 1);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    this.overlay = document.createElement("canvas");
    this.overlay.width = CAPTURE_W;
    this.overlay.height = CAPTURE_H;
    this.octx = this.overlay.getContext("2d")!;
  }

  render(video: HTMLVideoElement, t: number, mirror: boolean, hud: HudState, flash: number) {
    const gl = this.gl;
    const now = performance.now();
    if (this.last) {
      this.frameTimes.push(now - this.last);
      if (this.frameTimes.length > 30) {
        const avg = this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length;
        this.frameTimes = [];
        if (avg > 38 && this.quality > 0) this.quality = 0; // silently drop bloom/grain
      }
    }
    this.last = now;
    if (video.readyState >= 2 && video.videoWidth) {
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.vidTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      const va = video.videoWidth / video.videoHeight;
      const ta = CAPTURE_W / CAPTURE_H;
      if (va > ta) {
        const sx = ta / va;
        gl.uniform2f(this.u.uScale, sx, 1);
        gl.uniform2f(this.u.uOff, (1 - sx) / 2, 0);
      } else {
        const sy = va / ta;
        gl.uniform2f(this.u.uScale, 1, sy);
        gl.uniform2f(this.u.uOff, 0, (1 - sy) / 2);
      }
    }
    const key = `${Math.floor(hud.elapsed)}|${Math.floor(t * 2) % 2}|${hud.recording}|${hud.card}`;
    if (key !== this.lastHudKey) {
      this.lastHudKey = key;
      drawHud(this.octx, hud, Math.floor(t * 2) % 2 === 0);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.ovTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.overlay);
    }
    gl.viewport(0, 0, CAPTURE_W, CAPTURE_H);
    gl.uniform1f(this.u.uT, t);
    gl.uniform1f(this.u.uQ, this.quality);
    gl.uniform1f(this.u.uMirror, mirror ? 1 : 0);
    gl.uniform1f(this.u.uFlash, flash);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  dispose() {
    this.gl.deleteProgram(this.prog);
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}

const GOLD = "#D4AF37";
const GOLD_GLOW = "#FFD86B";
const NV = "#39FF7A";
const REC = "#FF2A2A";
const BONE = "#EDEDED";

export function timecode(s: number) {
  const sec = Math.min(Math.floor(s), 99);
  return `00:00:${String(sec).padStart(2, "0")}`;
}

function drawHud(c: CanvasRenderingContext2D, hud: HudState, blinkOn: boolean) {
  const W = CAPTURE_W, H = CAPTURE_H;
  c.clearRect(0, 0, W, H);
  const mono = (px: number) => `700 ${px}px "Space Mono", monospace`;
  const display = (px: number) => `${px}px "Pirata One", serif`;
  c.textBaseline = "middle";

  if (hud.card) {
    c.fillStyle = "#050505";
    c.fillRect(0, 0, W, H);
    c.textAlign = "center";
    c.shadowColor = GOLD_GLOW;
    c.shadowBlur = 30;
    c.fillStyle = GOLD;
    c.font = display(150);
    c.fillText("I'M", W / 2, H * 0.36);
    c.fillText("FLEXIN", W / 2, H * 0.47);
    c.fillText("UP'", W / 2, H * 0.58);
    c.shadowBlur = 0;
    c.fillStyle = BONE;
    c.font = mono(30);
    c.fillText(site.artists, W / 2, H * 0.68);
    c.fillStyle = NV;
    c.font = mono(34);
    c.fillText(site.url.toUpperCase(), W / 2, H * 0.74);
    return;
  }

  const m = 72; // ~10% safe margin
  const top = 120, bottom = H * 0.76;
  // viewfinder corners
  c.strokeStyle = BONE;
  c.globalAlpha = 0.85;
  c.lineWidth = 4;
  const L = 48;
  const corner = (x: number, y: number, dx: number, dy: number) => {
    c.beginPath();
    c.moveTo(x, y + dy * L); c.lineTo(x, y); c.lineTo(x + dx * L, y);
    c.stroke();
  };
  corner(m, top, 1, 1); corner(W - m, top, -1, 1); corner(m, bottom, 1, -1); corner(W - m, bottom, -1, -1);
  // center crosshair
  c.lineWidth = 2;
  c.beginPath();
  c.moveTo(W / 2 - 20, H * 0.48); c.lineTo(W / 2 + 20, H * 0.48);
  c.moveTo(W / 2, H * 0.48 - 20); c.lineTo(W / 2, H * 0.48 + 20);
  c.stroke();
  c.globalAlpha = 1;

  // REC + timecode
  c.textAlign = "left";
  if (hud.recording && blinkOn) {
    c.fillStyle = REC;
    c.beginPath(); c.arc(m + 30, top + 40, 11, 0, Math.PI * 2); c.fill();
  }
  c.fillStyle = hud.recording ? REC : BONE;
  c.font = mono(26);
  c.fillText(hud.recording ? "REC" : "STBY", m + 50, top + 41);
  c.fillStyle = BONE;
  c.fillText(timecode(hud.elapsed), m + 130, top + 41);

  // battery + ISO
  c.textAlign = "right";
  c.font = mono(22);
  c.fillText("ISO 6400", W - m - 24, top + 80);
  c.strokeStyle = BONE; c.lineWidth = 3;
  c.strokeRect(W - m - 84, top + 26, 52, 26);
  c.fillStyle = BONE;
  c.fillRect(W - m - 32, top + 33, 6, 12);
  c.fillStyle = NV;
  c.fillRect(W - m - 80, top + 30, 34, 18);

  // title
  c.textAlign = "center";
  c.shadowColor = GOLD_GLOW;
  c.shadowBlur = 24;
  c.fillStyle = GOLD;
  c.font = display(104);
  c.fillText("I'M FLEXIN UP'", W / 2, top + 175);
  c.shadowBlur = 0;
  c.fillStyle = BONE;
  c.font = mono(24);
  c.fillText(`Ouça já em ${site.url}`, W / 2, top + 245);

  // bottom
  c.font = mono(22);
  c.textAlign = "left";
  c.fillStyle = NV;
  c.fillText("NIGHT VISION", m + 24, bottom - 34);
  c.textAlign = "right";
  c.fillStyle = BONE;
  c.fillText("✦ 4K/30", W - m - 24, bottom - 34);
  c.textAlign = "center";
  c.font = mono(28);
  c.fillStyle = BONE;
  c.fillText(site.artists, W / 2, bottom + 46);
}

export function pickMime(): { mime: string; ext: "mp4" | "webm" } | null {
  if (typeof MediaRecorder === "undefined") return null;
  const list: [string, "mp4" | "webm"][] = [
    ["video/mp4;codecs=avc1.42E01E,mp4a.40.2", "mp4"],
    ["video/mp4;codecs=avc1,mp4a", "mp4"],
    ["video/mp4", "mp4"],
    ["video/webm;codecs=vp9,opus", "webm"],
    ["video/webm;codecs=vp8,opus", "webm"],
    ["video/webm", "webm"],
  ];
  for (const [m, e] of list) if (MediaRecorder.isTypeSupported(m)) return { mime: m, ext: e };
  return null;
}
