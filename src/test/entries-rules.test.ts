import { describe, expect, it } from "vitest";
import { entrySchema, isRateLimited } from "@/lib/entries-rules";
import { buildCaption } from "@/config/site";

describe("entry rules", () => {
  it("blocks the 4th submission from the same IP within the hour", () => {
    expect(isRateLimited(2)).toBe(false);
    expect(isRateLimited(3)).toBe(true);
  });
  it("strips @ from the handle", () => {
    const r = entrySchema.parse({ handle: "@Khriys_Say_Chris", postUrl: "https://www.instagram.com/reel/DZHSr3fNAfF/" });
    expect(r.handle).toBe("khriys_say_chris");
  });
  it("rejects non-Instagram/TikTok links", () => {
    expect(entrySchema.safeParse({ handle: "a", postUrl: "https://example.com/x" }).success).toBe(false);
  });
  it("caption tags both artists and the site", () => {
    expect(buildCaption()).toBe("I'M FLEXIN UP' 🔥 @khriys x @inf8m8us — ouve já em flexinup.com #FlexinUp #Khriys");
  });
});
