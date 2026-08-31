# Good Shit identity assets

The canonical production identity is the approved **Detour B — Expressive Soft** direction from the August 2026 brand exploration.

The generated identity boards are design references, not runtime assets. The production files below rebuild the approved winding detour silhouette as compact, deterministic vectors so the UI does not depend on generated raster artwork.

- `good-shit-mark.svg` is the canonical full-colour UI mark.
- `good-shit-mark-mono.svg` is the single-colour fallback for monochrome and mask contexts.
- `favicon.svg` uses the same silhouette with an adaptive single colour for browser-tab legibility.
- `good-shit-app-icon.svg` is the square app/touch treatment derived from the generated home-screen concept.
- `favicon-16.png`, `favicon-32.png`, and `apple-touch-icon.png` are raster platform derivatives.

The mark is appropriate for **identity surfaces**: the site/header lockup, atlas identity, browser/app chrome, footer, editorial eyebrow cues, and branded loading/empty states. It must not replace semantic UI controls, POI/category pictograms, tier labels, map interaction symbols, or accessibility text.

No third-party artwork, font file, remote identity dependency, or catalogue image-pipeline coupling is introduced by these assets.

To regenerate the raster derivatives with Inkscape:

```sh
inkscape site/static/favicon.svg --export-filename=site/static/favicon-16.png --export-width=16 --export-height=16
inkscape site/static/favicon.svg --export-filename=site/static/favicon-32.png --export-width=32 --export-height=32
inkscape site/static/brand/good-shit-app-icon.svg --export-filename=site/static/apple-touch-icon.png --export-width=180 --export-height=180
```
