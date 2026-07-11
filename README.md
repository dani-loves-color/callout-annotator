# Callout Annotator

A small browser tool for adding numbered callouts to PNG/JPG images — built
for annotating photos and drawings in technical content like training guides and user
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
- Turn any callout into a clickable hotspot by giving it a link URL (e.g. a
  store page or a sub-assembly drawing), then export an interactive HTML
  image map — either as a downloadable `.html` file or copied straight to
  the clipboard to paste into your own site's code.
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

## Hotspots / image map export

Any callout can carry an optional link URL (set it in the callout list in
the sidebar; there's a sanity-check button next to the field that opens the
link in a new tab). A URL doesn't need a scheme — `www.example.com` is
automatically treated as `https://www.example.com`, both by the sanity-check
button and in the exported links. Callouts without a URL behave exactly as
before — links are entirely optional, so a drawing can have 30 callouts and
only 5 of them clickable.

Optionally set a **link title** too — it's what shows up on mouse hover.
The callout's notes field is always used as the accessible `alt` text; the
link title defaults to matching it, but you can give the hover text
different wording (e.g. "Buy replacement part" vs. a longer note).

Clicking a badge in the editor always just selects/drags it — links are
never followed there. They only become active in the exported HTML.

Because a flattened PNG can't contain real links, hotspots need a separate
export. Both options produce a native `<img>` + `<map>`/`<area>` — the
pattern from the [W3C WAI image map
tutorial](https://www.w3.org/WAI/tutorials/images/imagemap/) — rather than
absolutely-positioned overlay elements, so each hotspot is a real link with
a proper `alt` the way screen readers and other assistive/text-based tooling
expect. Browsers scale `<area>` coordinates automatically to match however
large the image actually renders, so hotspots stay aligned at any display
width without any extra positioning logic.

- **Export HTML** downloads a single self-contained `.html` file — just the
  `<img>`/`<map>` markup, no `<html>`/`<body>` wrapper — with the flattened,
  annotated image embedded directly, so it always shows correctly with no
  second file to keep track of.
- **Copy HTML** copies the same markup to the clipboard for pasting into
  your own site's code. Since that's meant to drop into a page you already
  control, it references the image by file name only (no embedded image
  data) — make sure a file with that name is present wherever you host the
  snippet, e.g. by using Export PNG first.

Each style preset has its own **Hotspot margin** (0–24px, in the Styles
panel), which pads that style's hotspot radius beyond its visible badge,
since the exact badge circle can be a small target to click precisely.
**Map name** (in the toolbar's export group) sets the exported HTML file's
name and its accessible label; it defaults to the uploaded image's file name
but can be changed independently of the PNG/project file name.

## Notes on persistence

Style presets and your export-size preference are saved in the browser via
`localStorage` (see `src/storagePolyfill.js`), so they persist across
sessions on the same browser/machine but aren't synced anywhere. Your actual
annotation work (images + callouts) isn't auto-saved — use **Save project**
to download a `.json` file you can reopen later with **Open project**.

## Roadmap ideas

- PDF import (via `pdf.js`) so PDFs can be annotated directly,
  rendering a page to canvas and feeding it into the same pipeline as an
  uploaded image.
- Optional legend/caption export alongside the flattened PNG.
- Text annotations
- Additional annotation flag shapes (square, rounded square, etc).

## Ideas to explore (not roadmapped)

- Responsive image + overlay sizing: the editor currently sizes the `<img>`
  with explicit pixel dimensions (`naturalWidth * zoom/100`) rather than
  percentage/CSS-driven sizing. Since the SVG overlay already tracks the
  image's rendered size via a `ResizeObserver` (`CalloutAnnotator.jsx`), a
  percentage-width container should scale image + overlay together with a
  fairly small change — worth prototyping.
- SVG export alongside PNG: the app already builds full SVG markup
  internally for annotations (`buildExportSVGMarkup` in
  `CalloutAnnotator.jsx`) before flattening it onto canvas for PNG export.
  Exposing that SVG directly as an export option would give crisp,
  infinitely-scalable annotations (though the underlying photo stays raster)
  — useful for print/vector-editing workflows, worth exploring separately
  from PNG/HTML export.

## Author

Danielle Hazen — [www.daniellehazen.com](https://www.daniellehazen.com)

## License

[CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) —
Attribution-NonCommercial. Anyone's free to use, share, and adapt this,
with credit to Danielle Hazen — no selling it or building a paid
product/service on top of it without permission. See `LICENSE` for details.
