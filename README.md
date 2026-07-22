# SYJ TalentFlow CLI — Website

The official landing page for [SYJ TalentFlow CLI](https://github.com/SHalimoosavi/SYJ-TalentFlow-Cli), built as a zero-dependency static site: plain HTML5, CSS3, and vanilla JavaScript (ES modules). No framework, no bundler, no `npm install`, no build step — open `index.html` and it works.

## Structure

```
.
├── index.html              # the entire site
├── styles.css               # design tokens + all styles
├── script.js                  # hero typing animation, CLI tabs, GitHub stats, search
├── 404.html                # custom not-found page
├── robots.txt
├── sitemap.xml
├── manifest.webmanifest    # PWA manifest
├── site.webmanifest        # alias for tooling that expects this filename
├── browserconfig.xml       # Windows tile config
└── assets/
    ├── logo.svg
    ├── favicon.ico
    ├── favicon-16.png / favicon-32.png
    ├── apple-touch-icon.png
    ├── icon-192.png / icon-512.png / maskable-icon-512.png
    ├── social-preview.png     # 1200×630 Open Graph / Twitter Card image
    └── dashboard-preview.webp / .png   # on-page CLI dashboard screenshot
```

## Deploying to GitHub Pages

1. Push this folder to a repository (or the `docs/` folder / `main` branch of your existing `SYJ-TalentFlow-Cli` repo).
2. In the repo settings → **Pages**, set the source to the branch/folder containing these files.
3. GitHub Pages will serve it at `https://<username>.github.io/<repo>/` — no build step runs.

### If your repo name or username differs

This site was built assuming:

- GitHub user: `SHalimoosavi`
- Repository: `SYJ-TalentFlow-Cli`
- Site URL: `https://shalimoosavi.github.io/SYJ-TalentFlow-Cli/`

If either differs, update these in one pass:

- `index.html` — `<link rel="canonical">`, all `og:url` / `og:image` / `twitter:image` meta tags, all JSON-LD `url`/`@id` fields, and every `github.com/SHalimoosavi/SYJ-TalentFlow-Cli` link
- `404.html` — canonical link and the "Back to homepage" link
- `manifest.webmanifest` / `site.webmanifest` — `start_url` and `scope`
- `sitemap.xml` and `robots.txt` — the sitemap URL
- `browserconfig.xml` — icon paths (only if you move `assets/`)

### Using a custom domain

Add a `CNAME` file at the repo root containing your domain (e.g. `talentflow.dev`), then update the URLs listed above from `https://shalimoosavi.github.io/SYJ-TalentFlow-Cli/` to your custom domain.

## Live GitHub stats

The GitHub section (`#github`) fetches live star/fork/issue/contributor/release counts from the public GitHub REST API client-side (`script.js` → `loadGithubStats()`). No token is required for public read access, and it fails gracefully to static fallback values if the request is rate-limited or offline — this stays a fully static site with no backend.

## Editing content

Everything lives in `index.html` — sections are clearly commented (`<!-- ============ SECTION ============ -->`). Colors, spacing, and typography are all controlled by CSS custom properties at the top of `styles.css`, so a palette or type change only needs to happen in one place.

## Performance & accessibility notes

- Fonts are loaded with `preconnect` + a non-blocking `media="print"` swap trick, with a `<noscript>` fallback.
- The dashboard screenshot is served as WebP with a PNG fallback via `<picture>`, and is `loading="lazy"`.
- All interactive components (CLI demo tabs, FAQ accordion, mobile nav) are built on native semantics (`role="tablist"`, `<details>`, `aria-expanded`) so they work without JavaScript where possible and are fully keyboard-operable.
- `prefers-reduced-motion` is respected throughout — the hero typing animation and scroll-reveal effects are skipped entirely when the user has reduced motion enabled.

## License

MIT — same license as the CLI itself. © SAYANJALI NEXUS PRIVATE LIMITED.
