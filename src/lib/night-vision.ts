export const CAPTURE_W = 720;
export const CAPTURE_H = 1280;

const VS = `#version 300 es
in vec2 a; out vec2 v;
void main(){ v = a*0.5+0.5; gl_Position = vec4(a,0.,1.); }`;

// FLEX CAM: low-light consumer DV / CCTV character, tuned for the supplied reference.
// Single pass: dirty green-grey response, clipped olive highlights, sensor grain,
// interlaced scan texture, subtle chroma smear, exposure breathing and beat-led signal hits.
const FS = `#version 300 es
precision mediump float;
uniform sampler2D uVid;
uniform vec2 uScale; uniform vec2 uOff;
uniform float uT; uniform float uQ; uniform float uMirror; uniform float uFlash; uniform float uBeat;
in vec2 v; out vec4 o;
float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123); }
vec2 sourceUV(vec2 p){
  vec2 uv=p*uScale+uOff;
  if(uMirror>.5) uv.x=1.-uv.x;
  return clamp(uv,vec2(0.001),vec2(0.999));
}
float luma(vec2 p){ return dot(texture(uVid,sourceUV(p)).rgb,vec3(.2126,.7152,.0722)); }
void main(){
  vec2 p=v;
  float row=floor(p.y*720.);
  float burst=step(.992,hash(vec2(floor(uT*7.),floor(row/18.))));
  float tear=burst*(hash(vec2(floor(uT*19.),floor(row/5.)))-.5)*(.012+uBeat*.012);
  p.x+=tear;
  p.x+=sin(p.y*95.+uT*2.1)*.00065;
  vec2 centre=p-.5;
  float edge=length(centre*vec2(1.08,.88));
  float chroma=(.0012+edge*.0035);
  float y=luma(p);
  float yR=luma(p+vec2(chroma,0.));
  float yB=luma(p-vec2(chroma*1.3,0.));
  // Slightly underexposed, crushed shadows and dirty, clipped highlights.
  float exposure=1.02+uBeat*.17;
  float signal=clamp((y-.075)*1.52*exposure,0.,1.);
  signal=pow(signal,.78);
  signal=smoothstep(.015,.91,signal);
  float highlight=smoothstep(.57,.98,y);
  vec3 shadow=vec3(.018,.027,.021);
  vec3 mid=vec3(.29,.38,.29);
  vec3 light=vec3(.73,.78,.49);
  vec3 col=mix(shadow,mid,signal);
  col=mix(col,light,highlight*.78);
  col.r+=max(yR-y,0.)*.11;
  col.b+=max(yB-y,0.)*.10;
  // Sensor smear and soft halation around bright points.
  float halo=max(luma(p+vec2(.004,0.))-y,0.)+max(luma(p-vec2(.004,0.))-y,0.);
  col+=vec3(.16,.22,.10)*halo*1.8;
  float grain=hash(floor(p*vec2(720.,1280.))+floor(uT*24.))-0.5;
  col+=grain*(uQ>.5?.105:.065)*(1.+uBeat*.45);
  float scan=0.94+0.06*sin(p.y*1280.*3.14159);
  col*=scan;
  float interlace=mod(floor(p.y*1280.)+floor(uT*24.),2.);
  col*=mix(.985,1.,interlace);
  float flicker=0.975+0.025*hash(vec2(floor(uT*9.),3.));
  col*=flicker*(1.+uBeat*.055);
  float vignette=1.-smoothstep(.28,.78,edge);
  col*=mix(.56,1.,vignette);
  // Brief signal instability follows kick transients, not a constant shake.
  col=mix(col,col*vec3(1.13,1.08,.82),burst*(.12+uBeat*.22));
  col=mix(col,vec3(1.),uFlash);
  o=vec4(clamp(col,0.,1.),1.);
}`;

export class FlexCam {
  gl: WebGL2RenderingContext;
  private prog: WebGLProgram;
  private vidTex: WebGLTexture;
  private u = {} as Record<"uVid" | "uScale" | "uOff" | "uT" | "uQ" | "uMirror" | "uFlash" | "uBeat", WebGLUniformLocation | null>;
  quality = 1;
  private frameTimes: number[] = [];
  private last = 0;

  constructor(public canvas: HTMLCanvasElement) {
    canvas.width = CAPTURE_W;
    canvas.height = CAPTURE_H;
    const gl = canvas.getContext("webgl2", { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: false });
    if (!gl) throw new Error("webgl2");
    this.gl = gl;
    const shader = (type: number, source: string) => {
      const item = gl.createShader(type)!;
      gl.shaderSource(item, source);
      gl.compileShader(item);
      if (!gl.getShaderParameter(item, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(item) || "shader");
      return item;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, shader(gl.VERTEX_SHADER, VS));
    gl.attachShader(program, shader(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || "program");
    gl.useProgram(program);
    this.prog = program;
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
    const attribute = gl.getAttribLocation(program, "a");
    gl.enableVertexAttribArray(attribute);
    gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
    for (const name of ["uVid","uScale","uOff","uT","uQ","uMirror","uFlash","uBeat"] as const) {
      this.u[name] = gl.getUniformLocation(program, name);
    }
    this.vidTex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.vidTex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(this.u.uVid, 0);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  }

  render(video: HTMLVideoElement, t: number, mirror: boolean, flash: number, beat: number) {
    const gl=this.gl;
    const now=performance.now();
    if(this.last){
      this.frameTimes.push(now-this.last);
      if(this.frameTimes.length>=30){
        const avg=this.frameTimes.reduce((sum,value)=>sum+value,0)/this.frameTimes.length;
        this.frameTimes=[];
        if(avg>38) this.quality=0;
        else if(avg<27) this.quality=1;
      }
    }
    this.last=now;
    if(video.readyState>=2 && video.videoWidth){
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D,this.vidTex);
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,video);
      const videoAspect=video.videoWidth/video.videoHeight;
      const targetAspect=CAPTURE_W/CAPTURE_H;
      if(videoAspect>targetAspect){
        const scale=targetAspect/videoAspect;
        gl.uniform2f(this.u.uScale,scale,1);
        gl.uniform2f(this.u.uOff,(1-scale)/2,0);
      }else{
        const scale=videoAspect/targetAspect;
        gl.uniform2f(this.u.uScale,1,scale);
        gl.uniform2f(this.u.uOff,0,(1-scale)/2);
      }
    }
    gl.viewport(0,0,CAPTURE_W,CAPTURE_H);
    gl.uniform1f(this.u.uT,t);
    gl.uniform1f(this.u.uQ,this.quality);
    gl.uniform1f(this.u.uMirror,mirror?1:0);
    gl.uniform1f(this.u.uFlash,flash);
    gl.uniform1f(this.u.uBeat,Math.max(0,Math.min(1,beat)));
    gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
  }

  dispose(){
    this.gl.deleteTexture(this.vidTex);
    this.gl.deleteProgram(this.prog);
  }
}

export function timecode(seconds: number){
  const value=Math.min(Math.floor(seconds),99);
  return `00:00:${String(value).padStart(2,"0")}`;
}

export function pickMime(): { mime: string; ext: "mp4" | "webm" } | null {
  if(typeof MediaRecorder==="undefined") return null;
  const formats:[string,"mp4"|"webm"][]=[
    ["video/mp4;codecs=avc1.42E01E,mp4a.40.2","mp4"],
    ["video/mp4;codecs=avc1,mp4a","mp4"],
    ["video/mp4","mp4"],
    ["video/webm;codecs=vp9,opus","webm"],
    ["video/webm;codecs=vp8,opus","webm"],
    ["video/webm","webm"],
  ];
  for(const [mime,ext] of formats) if(MediaRecorder.isTypeSupported(mime)) return {mime,ext};
  return null;
}
