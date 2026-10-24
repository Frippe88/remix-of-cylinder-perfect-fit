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

- All cylinder math lives in src/lib/cylinder.ts (pure, tested); UI only calls it. Why: deterministic, extendable, testable.
- Results presentation lives in src/components/cylinder-results.tsx, with progressive disclosure per side; keep every computed combination accessible without duplicating the recommendation in the alternatives. Why: double-cylinder results must remain scannable without changing the calculation rules.
- Manufacturer manual PDFs are proxied via /api/public/manual/$id (fixed per-lock allowlist in src/lib/lock-cases.ts) and rendered in-app with pdfjs-dist on /manual/$id. Why: mobile webviews show blank pages for external PDFs, and the allowlist stops arbitrary URL proxying.
- Lock-case product photos map by lock id in src/lib/lock-images.ts (CDN assets from official manufacturer sources). Why: keeps catalog data and image pointers separate.
- Sitemap is router-derived: src/lib/sitemap.ts + src/routes/sitemap[.]xml.ts; every route declares staticData.sitemap, guide slugs come from GUIDES. Why: new pages/guides appear automatically.
- Offline support: vite-plugin-pwa generateSW (sw.js in dist/client), registered only via src/lib/register-sw.ts which refuses dev/preview/iframe. Why: preview must never get a stale service worker.
