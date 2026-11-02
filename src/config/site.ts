/**
 * FLEXIN UP' — ficheiro único de configuração.
 * Preenche aqui o áudio, vídeos de bastidores, handles, links e datas.
 * Tudo o que estiver vazio ("") usa um placeholder automático.
 */
import entryAudio from "@/assets/flexin-entry.mp3.asset.json";
import instrumentalAudio from "@/assets/flexin-instrumental.mp3.asset.json";
import officialAudio from "@/assets/flexin-official.mp3.asset.json";

export const site = {
  title: "I'M FLEXIN UP'",
  artists: "Khriys x INF8M8US",
  domain: "flexinup.com",
  url: "www.flexinup.com",

  handles: {
    khriys: "khriys", // sem @
    inf8m8us: "inf8m8us",
  },

  links: {
    instagramKhriys: "https://www.instagram.com/khriys",
    instagramInf8m8us: "https://www.instagram.com/inf8m8us",
    spotify: "",
    appleMusic: "",
    youtube: "",
    audiomack: "",
  },

  audio: {
    /** MP3/AAC da faixa completa (ex.: "/audio/flexin-up.mp3"). Vazio = beat gerado. */
    trackUrl: officialAudio.url,
    /** Cortado: apenas na entrada. Instrumental: ambiente após a entrada. */
    introUrl: entryAudio.url,
    ambienceUrl: instrumentalAudio.url,
    ambienceVolume: 0.22,
    introSeconds: 7.992,
    /** Trecho de 30s já cortado para o challenge. Vazio = usa trackUrl a partir de challengeOffset. */
    challengeClipUrl: "",
    /** Segundo onde começa o refrão (se só existir trackUrl). */
    challengeOffset: 0,
    /** BPM do placeholder gerado. */
    bpm: 140,
  },

  challenge: {
    seconds: 30,
    startDate: "2026-11-07",
    endDate: "2026-11-30",
    announceDate: "2026-12-05",
    prizeMoney: "5.000 MT",
    prizeItem: "Bolsa Goyard original",
  },

  /** Vídeos de bastidores. src vazio = placeholder elegante. */
  backstage: [
    { src: "", poster: "", orientation: "vertical", caption: "STUDIO · 03:14AM · TAKE 7" },
    { src: "", poster: "", orientation: "horizontal", caption: "BOOTH · 02:47AM · VOX" },
    { src: "", poster: "", orientation: "vertical", caption: "SET · 01:09AM · FLEX" },
    { src: "", poster: "", orientation: "horizontal", caption: "MIX · 04:20AM · FINAL" },
    { src: "", poster: "", orientation: "vertical", caption: "CAR · 00:33AM · B-ROLL" },
  ] as { src: string; poster: string; orientation: "vertical" | "horizontal"; caption: string }[],
};

export function buildCaption() {
  const { khriys, inf8m8us } = site.handles;
  return `I'M FLEXIN UP' 🔥 @${khriys} x @${inf8m8us} — ouve já em ${site.domain} #FlexinUp #Khriys`;
}

export function formatDatePt(iso: string) {
  const d = new Date(iso + "T12:00:00Z");
  return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
}
