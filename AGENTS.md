<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- All editable launch content (audio URLs, backstage clips, handles, streaming links, dates, prizes) lives in `src/config/site.ts`; components read from it — never hardcode these elsewhere.
- Music goes through the single `audio` engine (`src/lib/audio-engine.ts`) so speakers and the recording MediaStreamDestination share one graph; a synthesized beat is the fallback when no track URL is set.
- The night-vision filter is one WebGL2 fragment pass (`src/lib/night-vision.ts`) with the HUD drawn to a 2D canvas uploaded as a texture only when it changes — keep per-pixel work out of JS.
- Entries are inserted only via the `submitEntry` server function (honeypot + hashed-IP rate limit, admin client); public reads go through the `public_entries`/`entries_count` SECURITY DEFINER RPCs; team access is `user_roles` admin + RLS on `/admin`.
- 3D prizes are lazy-loaded R3F scenes rendering the PNGs as lit stacked planes, mounted only when near the viewport.
- Public editorial presentation uses global semantic tokens and a shared SectionHeading; the recorder and data functions remain isolated so visual revisions cannot alter capture or entry behavior.
