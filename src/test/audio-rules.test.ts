import { describe, expect, it } from "vitest";
import { audioPlan } from "@/lib/audio-rules";
import entry from "@/assets/flexin-entry.mp3.asset.json";
import instrumental from "@/assets/flexin-instrumental.mp3.asset.json";
import official from "@/assets/flexin-official.mp3.asset.json";
import { site } from "@/config/site";

describe("uploaded audio roles", () => {
  it("plays Cortado only for the non-looping entry", () => {
    expect(audioPlan("intro")).toEqual({ url: entry.url, offset: 0, volume: 1, loop: false });
    expect(audioPlan("full").url).not.toBe(entry.url);
    expect(audioPlan("challenge").url).not.toBe(entry.url);
  });
  it("loops only instrumental as discreet ambience after entry", () => {
    expect(audioPlan("full")).toEqual({ url: instrumental.url, offset: 0, volume: 0.22, loop: true });
  });
  it("uses the official track for the fixed 30-second recording", () => {
    expect(audioPlan("challenge")).toEqual({ url: official.url, offset: 0, volume: 1, loop: false });
    expect(site.challenge.seconds).toBe(30);
  });
});