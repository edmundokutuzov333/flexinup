import { site } from "@/config/site";

export type AudioMode = "intro" | "challenge" | "full";

/** "full" remains the ambient mode so existing recorder callers stay unchanged. */
export function audioPlan(mode: AudioMode) {
  if (mode === "intro") return { url: site.audio.introUrl, offset: 0, volume: 1, loop: false };
  if (mode === "challenge") return {
    url: site.audio.challengeClipUrl || site.audio.trackUrl,
    offset: site.audio.challengeClipUrl ? 0 : site.audio.challengeOffset,
    volume: 1,
    loop: false,
  };
  return { url: site.audio.ambienceUrl, offset: 0, volume: site.audio.ambienceVolume, loop: true };
}