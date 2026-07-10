# Callout Annotator

A small browser tool for adding numbered callouts to PNG/JPG images — built
for annotating equipment photos and drawings in training content and user
manuals. Numbers renumber automatically as you reorder the list; no manual
relabeling.

## Features

- Click an image to drop a numbered callout; drag the anchor point and the
  label independently.
- Drag-reorder the callout list — numbers recalculate live from a
  configurable starting number.
- Multiple leader lines pointing to a single shared number, for "one part,
  several call-outs" cases.
- Named style presets (line color, weight, cap style — arrow/dot/square/none,
  badge color, font) with a Tailwind color-palette swatch picker built in.
- Zoom control with a 1:1 (96 DPI) view, so you can preview exactly how the
  image will look at native resolution before exporting.
- Export a flattened PNG at a chosen resolution (default: long edge capped at
  800px, matching a common manuals workflow) or at full native resolution.
- Save/reopen a project as JSON (image + callouts + styles), so diagrams stay
  editable instead of being one-shot exports.

## Getting started

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually `http://localhost:5173`).

## Building for production

```bash
npm run build
npm run preview   # sanity-check the production build locally
```

The build output lands in `dist/`.

## Deploying

**GitHub Pages** (uses the included `gh-pages` script):

```bash
npm run build
npm run deploy
```

This pushes `dist/` to a `gh-pages` branch. In the repo's Settings → Pages,
set the source to that branch. `vite.config.js` uses a relative `base: './'`
so this works from a project subpath like
`https://username.github.io/callout-annotator/`.

**Vercel / Netlify**: point either at this repo with build command
`npm run build` and output directory `dist` — no extra config needed.

## Notes on persistence

Style presets and your export-size preference are saved in the browser via
`localStorage` (see `src/storagePolyfill.js`), so they persist across
sessions on the same browser/machine but aren't synced anywhere. Your actual
annotation work (images + callouts) isn't auto-saved — use **Save project**
to download a `.json` file you can reopen later with **Open project**.

## Roadmap ideas

- PDF import (via `pdf.js`) so CAD-drawing PDFs can be annotated directly,
  rendering a page to canvas and feeding it into the same pipeline as an
  uploaded image.
- Optional legend/caption export alongside the flattened PNG.

## License

[CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) —
Attribution-NonCommercial. Anyone's free to use, share, and adapt this,
with credit to Dani Hazen — no selling it or building a paid product/service
on top of it without permission. See `LICENSE` for details.
