/**
 * Callout Annotator
 * Author: Danielle Hazen
 * License: CC BY-NC 4.0 — Attribution-NonCommercial
 *   https://creativecommons.org/licenses/by-nc/4.0/
 *
 * Free to use, share, and adapt with credit to Danielle Hazen — not for sale,
 * and not for use in a commercial product or paid service, without
 * permission. See LICENSE in the project root for full terms.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Upload,
  Download,
  Save,
  FolderOpen,
  Trash2,
  Plus,
  Minus,
  GripVertical,
  Settings2,
  X,
  Copy,
  Link2,
  ExternalLink,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

const DEFAULT_STYLES = [
  {
    id: 's-1',
    name: 'Style 1',
    stroke: '#2563eb',
    strokeWidth: 2,
    cap: 'arrow',
    badgeFill: '#2563eb',
    badgeText: '#FFFFFF',
    badgeRadius: 18,
    font: 'Inter, system-ui, sans-serif',
    fontSize: 16,
    fontWeight: 700,
    capSize: 8,
    hotspotMarginPx: 8,
  }, // blue-600
  {
    id: 's-2',
    name: 'Style 2',
    stroke: '#fbbf24',
    strokeWidth: 2.5,
    cap: 'dot',
    badgeFill: '#fbbf24',
    badgeText: '#111111',
    badgeRadius: 28,
    font: 'Inter, system-ui, sans-serif',
    fontSize: 16,
    fontWeight: 700,
    capSize: 8,
    hotspotMarginPx: 8,
  }, // amber-400
  {
    id: 's-3',
    name: 'Style 3',
    stroke: '#ef4444',
    strokeWidth: 2.5,
    cap: 'square',
    badgeFill: '#ef4444',
    badgeText: '#FFFFFF',
    badgeRadius: 18,
    font: 'Inter, system-ui, sans-serif',
    fontSize: 16,
    fontWeight: 700,
    capSize: 8,
    hotspotMarginPx: 8,
  }, // red-500
  {
    id: 's-4',
    name: 'Style 4',
    stroke: '#4b5563',
    strokeWidth: 2,
    cap: 'heart',
    badgeFill: '#4b5563',
    badgeText: '#FFFFFF',
    badgeRadius: 18,
    font: 'Inter, system-ui, sans-serif',
    fontSize: 16,
    fontWeight: 700,
    capSize: 12,
    hotspotMarginPx: 8,
  }, // gray-600
  {
    id: 's-5',
    name: 'Style 5',
    stroke: '#4b5563',
    strokeWidth: 2,
    cap: 'flower',
    badgeFill: '#4b5563',
    badgeText: '#FFFFFF',
    badgeRadius: 18,
    font: 'Inter, system-ui, sans-serif',
    fontSize: 16,
    fontWeight: 700,
    capSize: 12,
    hotspotMarginPx: 8,
  }, // gray-600
];

const FONT_OPTIONS = [
  { label: 'Inter (sans)', value: 'Inter, system-ui, sans-serif' },
  { label: 'IBM Plex Mono', value: "'IBM Plex Mono', monospace" },
  { label: 'Georgia (serif)', value: 'Georgia, serif' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
];

const CAP_OPTIONS = ['arrow', 'dot', 'square', 'heart', 'flower', 'none'];
const uid = () => Math.random().toString(36).slice(2, 10);

// Fallback values for any field a saved/loaded style might be missing — keeps
// old localStorage data, opened project files, or hand-duplicated style
// objects from ever producing an undefined value in a controlled input.
const STYLE_FIELD_DEFAULTS = {
  stroke: '#2563eb',
  strokeWidth: 2,
  cap: 'arrow',
  badgeFill: '#2563eb',
  badgeText: '#FFFFFF',
  badgeRadius: 18,
  font: 'Inter, system-ui, sans-serif',
  fontSize: 16,
  fontWeight: 700,
  capSize: 8,
  hotspotMarginPx: 8,
};
function normalizeStyle(s) {
  return { ...STYLE_FIELD_DEFAULTS, ...s };
}

// Given the full canvas size (the image plus any margin added around it)
// and the current export settings, compute the pixel dimensions the
// exported PNG will actually have, plus the scale factor (relative to the
// live canvas) that badge/line/font sizes get multiplied by. Shared between
// the real export and the "preview export size" toggle, so both always agree.
function computeExportDims(
  canvasWidth,
  canvasHeight,
  exportMode,
  exportMaxDim
) {
  let exportWidth = canvasWidth,
    exportHeight = canvasHeight;
  if (exportMode === 'max') {
    const dim = Math.max(1, exportMaxDim);
    if (canvasWidth >= canvasHeight) {
      exportWidth = Math.min(canvasWidth, dim);
      exportHeight = Math.round((exportWidth / canvasWidth) * canvasHeight);
    } else {
      exportHeight = Math.min(canvasHeight, dim);
      exportWidth = Math.round((exportHeight / canvasHeight) * canvasWidth);
    }
  }
  return { exportWidth, exportHeight, exportScale: exportWidth / canvasWidth };
}

// Margin values default to 0 on every side so callers that don't know about
// canvas margins (or old saved projects) get back the plain image size.
const NO_MARGIN = { top: 0, right: 0, bottom: 0, left: 0 };
function canvasDims(image, canvasMargin = NO_MARGIN) {
  return {
    canvasWidth: image.naturalWidth + canvasMargin.left + canvasMargin.right,
    canvasHeight: image.naturalHeight + canvasMargin.top + canvasMargin.bottom,
  };
}

function sanitizeFileName(name) {
  return (name || '').trim().replace(/[\\/:*?"<>|]/g, '-');
}

// Tailwind CSS default color palette (v3), shades used in the swatch picker
const TAILWIND_COLORS = {
  light: {
    300: '#ffffff', //white
    400: '#f3f4f6', //gray 100
    500: '#e5e7eb', //gray 200
    600: '#d1d5db', //gray 300
    700: '#9ca3af', //gray 400
    800: '#6b7280', //gray 500
  },
  dark: {
    300: '#4b5563', //gray 600
    400: '#374151', //gray 700
    500: '#1f2937', //gray 800
    600: '#111827', //gray 900
    700: '#030712', //gray 950
    800: '#000000', //black
  },
  red: {
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
  },
  orange: {
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
  },
  amber: {
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
  },
  yellow: {
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
  },
  lime: {
    300: '#bef264',
    400: '#a3e635',
    500: '#84cc16',
    600: '#65a30d',
    700: '#4d7c0f',
    800: '#3f6212',
  },
  green: {
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
  },
  emerald: {
    300: '#6ee7b7',
    400: '#34d399',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
    800: '#065f46',
  },
  teal: {
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
  },
  cyan: {
    300: '#67e8f9',
    400: '#22d3ee',
    500: '#06b6d4',
    600: '#0891b2',
    700: '#0e7490',
    800: '#155e75',
  },
  sky: {
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
  },
  blue: {
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
  },
  indigo: {
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
  },
  violet: {
    300: '#c4b5fd',
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
    800: '#5b21b6',
  },
  purple: {
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7e22ce',
    800: '#6b21a8',
  },
  fuchsia: {
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
  },
  pink: {
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
  },
  rose: {
    300: '#fda4af',
    400: '#fb7185',
    500: '#f43f5e',
    600: '#e11d48',
    700: '#be123c',
    800: '#9f1239',
  },
};
const TAILWIND_SHADES = [300, 400, 500, 600, 700, 800];

function ColorSwatchPicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button
        type='button'
        onClick={() => setOpen((o) => !o)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          width: '100%',
          background: '#1E2127',
          border: '1px solid #33363E',
          borderRadius: 5,
          padding: '3px 6px',
          marginTop: 2,
          cursor: 'pointer',
        }}>
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: 3,
            background: value,
            border: '1px solid #33363E',
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 10.5, color: '#CFD1D6' }}>{value}</span>
      </button>
      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 19 }}
          />
          <div
            style={{
              position: 'absolute',
              zIndex: 20,
              top: '110%',
              left: 0,
              background: '#1B1D22',
              border: '1px solid #33363E',
              borderRadius: 8,
              padding: 8,
              width: 200,
              boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
            }}>
            {Object.entries(TAILWIND_COLORS).map(([family, shades]) => (
              <div
                key={family}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  marginBottom: 3,
                }}>
                <span
                  style={{
                    width: 40,
                    fontSize: 8.5,
                    color: '#6B707A',
                    textTransform: 'capitalize',
                  }}>
                  {family}
                </span>
                {TAILWIND_SHADES.map((shade) => (
                  <button
                    key={shade}
                    type='button'
                    title={`${family}-${shade}`}
                    onClick={() => {
                      onChange(shades[shade]);
                      setOpen(false);
                    }}
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 3,
                      background: shades[shade],
                      border:
                        value === shades[shade]
                          ? '2px solid #fff'
                          : '1px solid rgba(255,255,255,0.15)',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  />
                ))}
              </div>
            ))}
            <div
              style={{
                marginTop: 6,
                paddingTop: 6,
                borderTop: '1px solid #2A2D34',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}>
              <span style={{ fontSize: 9, color: '#6B707A' }}>Custom</span>
              <input
                type='color'
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                  width: 28,
                  height: 20,
                  padding: 0,
                  border: 'none',
                  background: 'none',
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function markerDefs(styles) {
  return styles.map((s) => {
    if (s.cap === 'none') return null;
    const id = `cap-${s.id}`;
    if (s.cap === 'arrow') {
      return (
        <marker
          key={id}
          id={id}
          viewBox='0 0 10 10'
          refX='8'
          refY='5'
          markerWidth={s.capSize}
          markerHeight={s.capSize}
          orient='auto-start-reverse'>
          <path d='M0,0 L10,5 L0,10 z' fill={s.stroke} />
        </marker>
      );
    }
    if (s.cap === 'dot') {
      return (
        <marker
          key={id}
          id={id}
          viewBox='0 0 10 10'
          refX='5'
          refY='5'
          markerWidth={s.capSize}
          markerHeight={s.capSize}
          orient='auto-start-reverse'>
          <circle cx='5' cy='5' r='4.5' fill={s.stroke} />
        </marker>
      );
    }
    if (s.cap === 'square') {
      return (
        <marker
          key={id}
          id={id}
          viewBox='0 0 10 10'
          refX='5'
          refY='5'
          markerWidth={s.capSize}
          markerHeight={s.capSize}
          orient='auto-start-reverse'>
          <rect x='1' y='1' width='8' height='8' fill={s.stroke} />
        </marker>
      );
    }
    if (s.cap === 'heart') {
      return (
        <marker
          key={id}
          id={id}
          viewBox='0 0 480 480'
          refX='240'
          refY='240'
          markerWidth={s.capSize}
          markerHeight={s.capSize}
          orient='0deg'>
          <path
            d='M438.82 41.18c-54.9-54.9-143.92-54.9-198.82 0-54.9-54.9-143.92-54.9-198.82 0-54.9 54.9-54.9 143.92 0 198.82L240 438.82 438.82 240c54.9-54.9 54.9-143.92 0-198.82Z'
            fill={s.stroke}
          />
        </marker>
      );
    }
    if (s.cap === 'flower') {
      return (
        <marker
          key={id}
          id={id}
          viewBox='0 0 256 256'
          refX='128'
          refY='128'
          markerWidth={s.capSize}
          markerHeight={s.capSize}
          orient='auto-start-reverse'>
          <path
            d='M 128 0 C 147.68 0 164.04 14.213 167.377 32.934 C 182.974 22.055 204.594 23.574 218.51 37.49 C 232.426 51.406 233.944 73.025 223.066 88.622 C 241.787 91.96 256 108.32 256 128 C 256 147.68 241.787 164.04 223.065 167.377 C 233.944 182.974 232.426 204.594 218.51 218.51 C 204.594 232.426 182.974 233.944 167.377 223.065 C 164.04 241.787 147.68 256 128 256 C 108.32 256 91.959 241.787 88.622 223.065 C 73.025 233.944 51.406 232.426 37.49 218.51 C 23.574 204.594 22.055 182.974 32.934 167.377 C 14.213 164.04 0 147.68 0 128 C 0 108.32 14.213 91.96 32.934 88.622 C 22.056 73.025 23.574 51.406 37.49 37.49 C 51.406 23.574 73.025 22.055 88.622 32.934 C 91.96 14.213 108.32 0 128 0 Z'
            fill={s.stroke}
          />
        </marker>
      );
    }
    return null;
  });
}

function buildExportSVGMarkup(callouts, styles, width, height, scale) {
  const styleMap = Object.fromEntries(styles.map((s) => [s.id, s]));
  const defs = styles
    .map((s) => {
      if (s.cap === 'none') return '';
      const id = `cap-${s.id}`;
      if (s.cap === 'arrow')
        return `<marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="${s.capSize}" markerHeight="${s.capSize}" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${s.stroke}"/></marker>`;
      if (s.cap === 'dot')
        return `<marker id="${id}" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="${s.capSize}" markerHeight="${s.capSize}" orient="auto-start-reverse"><circle cx="5" cy="5" r="4.5" fill="${s.stroke}"/></marker>`;
      if (s.cap === 'square')
        return `<marker id="${id}" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="${s.capSize}" markerHeight="${s.capSize}" orient="auto-start-reverse"><rect x="1" y="1" width="8" height="8" fill="${s.stroke}"/></marker>`;
      if (s.cap === 'heart')
        return `<marker id="${id}" viewBox="0 0 480 480" refX="240" refY="240" markerWidth="${s.capSize}" markerHeight="${s.capSize}" orient="0deg"><path d="M438.82 41.18c-54.9-54.9-143.92-54.9-198.82 0-54.9-54.9-143.92-54.9-198.82 0-54.9 54.9-54.9 143.92 0 198.82L240 438.82 438.82 240c54.9-54.9 54.9-143.92 0-198.82Z" fill="${s.stroke}"/></marker>`;
      if (s.cap === 'flower')
        return `<marker id="${id}" viewBox="0 0 256 256" refX="128" refY="128" markerWidth="${s.capSize}" markerHeight="${s.capSize}" orient="auto-start-reverse"><path d="M 128 0 C 147.68 0 164.04 14.213 167.377 32.934 C 182.974 22.055 204.594 23.574 218.51 37.49 C 232.426 51.406 233.944 73.025 223.066 88.622 C 241.787 91.96 256 108.32 256 128 C 256 147.68 241.787 164.04 223.065 167.377 C 233.944 182.974 232.426 204.594 218.51 218.51 C 204.594 232.426 182.974 233.944 167.377 223.065 C 164.04 241.787 147.68 256 128 256 C 108.32 256 91.959 241.787 88.622 223.065 C 73.025 233.944 51.406 232.426 37.49 218.51 C 23.574 204.594 22.055 182.974 32.934 167.377 C 14.213 164.04 0 147.68 0 128 C 0 108.32 14.213 91.96 32.934 88.622 C 22.056 73.025 23.574 51.406 37.49 37.49 C 51.406 23.574 73.025 22.055 88.622 32.934 C 91.96 14.213 108.32 0 128 0 Z" fill="${s.stroke}"/></marker>`;
      return '';
    })
    .join('');

  const body = callouts
    .map((c) => {
      const st = styleMap[c.styleId] || styles[0];
      const bx = c.bx * width,
        by = c.by * height;
      const r = st.badgeRadius * scale;
      const fs = st.fontSize * scale;
      const markerAttr =
        st.cap !== 'none' ? `marker-start="url(#cap-${st.id})"` : '';
      const lines = c.anchors
        .map((a) => {
          const ax = a.ax * width,
            ay = a.ay * height;
          return `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" stroke="${st.stroke}" stroke-width="${st.strokeWidth * scale}" ${markerAttr} />`;
        })
        .join('');
      return `${lines}
        <circle cx="${bx}" cy="${by}" r="${r}" fill="${st.badgeFill}" stroke="${st.stroke}" stroke-width="${2 * scale}" />
        <text x="${bx}" y="${by}" fill="${st.badgeText}" font-family="${st.font}" font-size="${fs}" font-weight="${st.fontWeight}" text-anchor="middle" dominant-baseline="central">${c.number}</text>
      `;
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs>${defs}</defs>${body}</svg>`;
}

// Draws the margin background, the base image (inset by the margin), and
// the annotation overlay onto a canvas at the chosen export resolution, and
// resolves with the flattened PNG data URL. Shared by the PNG export and
// both HTML/image-map exports so all three always agree on what "the
// export" looks like.
function flattenAnnotatedPNG(
  image,
  callouts,
  styles,
  exportMode,
  exportMaxDim,
  canvasMargin = NO_MARGIN,
  marginColor = '#ffffff'
) {
  const { canvasWidth, canvasHeight } = canvasDims(image, canvasMargin);
  const { exportWidth, exportHeight, exportScale } = computeExportDims(
    canvasWidth,
    canvasHeight,
    exportMode,
    exportMaxDim
  );
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = exportWidth;
    canvas.height = exportHeight;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = marginColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const baseImg = new Image();
    baseImg.onload = () => {
      ctx.drawImage(
        baseImg,
        canvasMargin.left * exportScale,
        canvasMargin.top * exportScale,
        image.naturalWidth * exportScale,
        image.naturalHeight * exportScale
      );
      const svgMarkup = buildExportSVGMarkup(
        callouts,
        styles,
        canvas.width,
        canvas.height,
        exportScale
      );
      const svgBlob = new Blob([svgMarkup], {
        type: 'image/svg+xml;charset=utf-8',
      });
      const url = URL.createObjectURL(svgBlob);
      const overlayImg = new Image();
      overlayImg.onload = () => {
        ctx.drawImage(overlayImg, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve({
          dataUrl: canvas.toDataURL('image/png'),
          exportWidth,
          exportHeight,
          exportScale,
        });
      };
      overlayImg.src = url;
    };
    baseImg.src = image.src;
  });
}

// Absolute URLs (with a scheme like http:, https:, mailto:) pass through
// unchanged. A bare domain/path like "www.example.com" is treated as
// relative by the browser (resolving against whatever page it's viewed on)
// unless a scheme is added, so this defaults it to https.
function normalizeUrl(url) {
  const trimmed = (url || '').trim();
  if (!trimmed) return '';
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function slugify(name) {
  return (
    (name || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'image-map'
  );
}

// Builds the "image map" export markup per the W3C WAI image-map pattern
// (https://www.w3.org/WAI/tutorials/images/imagemap/): a plain <img> plus a
// native <map>/<area> — real accessible link semantics, no absolute-position
// hacks. Browsers scale <area> coords automatically to match however large
// the <img> actually renders, so this stays correct at any display width.
// `imageSrc` is either a data URI (self-contained download) or a bare file
// name (lightweight paste target) — the caller decides which.
function buildImageMapHTML({
  imageSrc,
  exportWidth,
  exportHeight,
  callouts,
  styles,
  exportScale,
  mapName,
}) {
  const styleMap = Object.fromEntries(styles.map((s) => [s.id, s]));
  const escapeAttr = (s) =>
    String(s)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;');
  const mapId = `map-${slugify(mapName)}`;

  const areas = callouts
    .map((c) => {
      const url = (c.url || '').trim();
      if (!url) return '';
      const st = styleMap[c.styleId] || styles[0];
      const label = c.text?.trim() || `Callout ${c.number}`;
      const hoverTitle = c.linkTitle?.trim() || label;
      const cx = Math.round(c.bx * exportWidth);
      const cy = Math.round(c.by * exportHeight);
      const r = Math.round(
        st.badgeRadius * exportScale + (st.hotspotMarginPx ?? 8)
      );
      return `  <area shape="circle" coords="${cx},${cy},${r}" href="${escapeAttr(normalizeUrl(url))}" alt="${escapeAttr(label)}" title="${escapeAttr(hoverTitle)}" target="_blank" rel="noopener noreferrer" />`;
    })
    .join('\n');

  const altText = escapeAttr(mapName || 'Annotated diagram');
  return `<img src="${escapeAttr(imageSrc)}" alt="${altText}" usemap="#${mapId}" width="${exportWidth}" height="${exportHeight}" style="max-width:100%;height:auto;" />
<map name="${mapId}">
${areas}
</map>`;
}

export default function CalloutAnnotator() {
  const [image, setImage] = useState(null); // {src, naturalWidth, naturalHeight}
  const [callouts, setCallouts] = useState([]); // {id, anchors:[{id,ax,ay}], bx, by, text, styleId}
  const [styles, setStyles] = useState(DEFAULT_STYLES);
  const [startNumber, setStartNumber] = useState(1);
  const [activeStyleId, setActiveStyleId] = useState(DEFAULT_STYLES[0].id);
  const [showStyleManager, setShowStyleManager] = useState(false);
  const [expandedStyleId, setExpandedStyleId] = useState(null); // which style card is expanded in the Styles panel — accordion, one at a time
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(100);
  const [exportMode, setExportMode] = useState('max'); // 'max' | 'full'
  const [exportMaxDim, setExportMaxDim] = useState(800);
  const [fileBaseName, setFileBaseName] = useState('');
  const [mapName, setMapName] = useState('');
  const [canvasMargin, setCanvasMargin] = useState(NO_MARGIN); // px added around the image so badges have room off the edges
  const [marginColor, setMarginColor] = useState('#ffffff');
  const [copyStatus, setCopyStatus] = useState(null);
  const [dragState, setDragState] = useState(null); // {calloutId, anchorId?, target: 'a'|'b'}
  const [dragRowIndex, setDragRowIndex] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const wrapRef = useRef(null);
  const imgFileRef = useRef(null);
  const projectFileRef = useRef(null);
  const storageLoaded = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get('callout-styles', false);
        if (res && res.value) {
          const parsed = JSON.parse(res.value);
          if (Array.isArray(parsed) && parsed.length)
            setStyles(parsed.map(normalizeStyle));
        }
      } catch (e) {}
      try {
        const res2 = await window.storage.get('callout-export-settings', false);
        if (res2 && res2.value) {
          const parsed2 = JSON.parse(res2.value);
          if (parsed2.exportMode) setExportMode(parsed2.exportMode);
          if (parsed2.exportMaxDim) setExportMaxDim(parsed2.exportMaxDim);
          if (parsed2.fileBaseName) setFileBaseName(parsed2.fileBaseName);
          if (parsed2.mapName) setMapName(parsed2.mapName);
          if (parsed2.canvasMargin)
            setCanvasMargin({ ...NO_MARGIN, ...parsed2.canvasMargin });
          if (parsed2.marginColor) setMarginColor(parsed2.marginColor);
        }
      } catch (e) {}
      storageLoaded.current = true;
    })();
  }, []);

  useEffect(() => {
    if (!storageLoaded.current) return;
    window.storage
      .set('callout-styles', JSON.stringify(styles), false)
      .catch(() => {});
  }, [styles]);

  useEffect(() => {
    if (!storageLoaded.current) return;
    window.storage
      .set(
        'callout-export-settings',
        JSON.stringify({
          exportMode,
          exportMaxDim,
          fileBaseName,
          mapName,
          canvasMargin,
          marginColor,
        }),
        false
      )
      .catch(() => {});
  }, [
    exportMode,
    exportMaxDim,
    fileBaseName,
    mapName,
    canvasMargin,
    marginColor,
  ]);

  // track displayed canvas size (image plus margin) — ResizeObserver catches
  // layout shifts (like the style panel opening/closing) in addition to
  // actual window resizes.
  useEffect(() => {
    if (!image || !wrapRef.current) return;
    const el = wrapRef.current;
    function measure() {
      setDisplaySize({ w: el.clientWidth, h: el.clientHeight });
    }
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [image, showStyleManager, zoom, canvasMargin]);

  // Bring a newly expanded style card into view instead of leaving the user
  // to scroll a long list to find it — matters most right after "New style"
  // appends one at the bottom.
  useEffect(() => {
    if (!expandedStyleId) return;
    document
      .getElementById(`style-card-${expandedStyleId}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [expandedStyleId]);

  const orderedCallouts = callouts.map((c, i) => ({
    ...c,
    number: startNumber + i,
  }));

  // The live canvas is the image plus whatever margin has been added around
  // it — badge/anchor coordinates (bx/by/ax/ay) are fractions of this full
  // canvas, not just the image, so badges can sit in the margin.
  const canvasNaturalWidth = image
    ? image.naturalWidth + canvasMargin.left + canvasMargin.right
    : 0;
  const canvasNaturalHeight = image
    ? image.naturalHeight + canvasMargin.top + canvasMargin.bottom
    : 0;

  // Scale factor applied to badge/line/font sizes in the live, on-screen
  // view. Style values are defined in natural-image pixels, so multiplying
  // by the zoom ratio is what keeps a badge the same size *relative to the
  // image* no matter how far you zoom in or out. Export settings (max
  // dimension, etc.) intentionally don't affect this — annotations always
  // look the same in the editor regardless of what export size is chosen.
  const previewSizeScale = zoom / 100;

  function handleImageFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        setImage({
          src: reader.result,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
        });
        setCallouts([]);
        setZoom(100);
        const stripped = sanitizeFileName(file.name.replace(/\.[^./\\]+$/, ''));
        setFileBaseName(stripped);
        setMapName(stripped);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function handleCanvasClick(e) {
    if (!image) return;
    if (e.target.closest('[data-draggable]')) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const bx = Math.min(0.96, x + 0.08);
    const by = Math.max(0.04, y - 0.08);
    const newCallout = {
      id: uid(),
      anchors: [{ id: uid(), ax: x, ay: y }],
      bx,
      by,
      text: '',
      url: '',
      linkTitle: '',
      styleId: activeStyleId,
    };
    setCallouts((prev) => [...prev, newCallout]);
    setSelectedId(newCallout.id);
  }

  const onDragMove = useCallback(
    (e) => {
      if (!dragState || !wrapRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
      setCallouts((prev) =>
        prev.map((c) => {
          if (c.id !== dragState.calloutId) return c;
          if (dragState.target === 'b') return { ...c, bx: x, by: y };
          return {
            ...c,
            anchors: c.anchors.map((a) =>
              a.id === dragState.anchorId ? { ...a, ax: x, ay: y } : a
            ),
          };
        })
      );
    },
    [dragState]
  );

  useEffect(() => {
    if (!dragState) return;
    function up() {
      setDragState(null);
    }
    window.addEventListener('mousemove', onDragMove);
    window.addEventListener('mouseup', up);
    return () => {
      window.removeEventListener('mousemove', onDragMove);
      window.removeEventListener('mouseup', up);
    };
  }, [dragState, onDragMove]);

  function updateCalloutText(id, text) {
    setCallouts((prev) => prev.map((c) => (c.id === id ? { ...c, text } : c)));
  }
  function updateCalloutUrl(id, url) {
    setCallouts((prev) => prev.map((c) => (c.id === id ? { ...c, url } : c)));
  }
  function updateCalloutLinkTitle(id, linkTitle) {
    setCallouts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, linkTitle } : c))
    );
  }
  function updateCalloutStyle(id, styleId) {
    setCallouts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, styleId } : c))
    );
  }
  function deleteCallout(id) {
    setCallouts((prev) => prev.filter((c) => c.id !== id));
  }
  function reorder(fromIdx, toIdx) {
    setCallouts((prev) => {
      const next = [...prev];
      const [moved] = next.splice(fromIdx, 1);
      next.splice(toIdx, 0, moved);
      return next;
    });
  }
  function addLeader(calloutId) {
    setCallouts((prev) =>
      prev.map((c) => {
        if (c.id !== calloutId) return c;
        const last = c.anchors[c.anchors.length - 1];
        const nx = Math.max(0, Math.min(1, last.ax - 0.06));
        const ny = Math.max(0, Math.min(1, last.ay + 0.06));
        return { ...c, anchors: [...c.anchors, { id: uid(), ax: nx, ay: ny }] };
      })
    );
  }
  function removeLeader(calloutId) {
    setCallouts((prev) =>
      prev.map((c) =>
        c.id === calloutId && c.anchors.length > 1
          ? { ...c, anchors: c.anchors.slice(0, -1) }
          : c
      )
    );
  }

  function updateStyleField(styleId, field, value) {
    setStyles((prev) =>
      prev.map((s) => (s.id === styleId ? { ...s, [field]: value } : s))
    );
  }
  function addStyle() {
    const ns = normalizeStyle({
      ...DEFAULT_STYLES[0],
      id: `s-${uid()}`,
      name: 'New Style',
    });
    setStyles((prev) => [...prev, ns]);
    setExpandedStyleId(ns.id);
  }
  function deleteStyle(styleId) {
    if (styles.length <= 1) return;
    const remaining = styles.filter((s) => s.id !== styleId);
    setStyles(remaining);
    if (expandedStyleId === styleId) setExpandedStyleId(null);
    setCallouts((prev) =>
      prev.map((c) =>
        c.styleId === styleId ? { ...c, styleId: remaining[0].id } : c
      )
    );
    if (activeStyleId === styleId) setActiveStyleId(remaining[0].id);
  }

  async function exportPNG() {
    if (!image) return;
    const { dataUrl, exportWidth, exportHeight } = await flattenAnnotatedPNG(
      image,
      orderedCallouts,
      styles,
      exportMode,
      exportMaxDim,
      canvasMargin,
      marginColor
    );
    const base = sanitizeFileName(fileBaseName) || 'annotated-image';
    const link = document.createElement('a');
    link.download = `${base}-${exportWidth}x${exportHeight}.png`;
    link.href = dataUrl;
    link.click();
  }

  // Export HTML downloads one self-contained file — the flattened annotated
  // image embedded directly (data URI) — so it always shows the correct
  // annotations and never depends on a second, separately-downloaded file
  // actually landing next to it with a matching name.
  async function exportHTML() {
    if (!image) return;
    const { dataUrl, exportWidth, exportHeight, exportScale } =
      await flattenAnnotatedPNG(
        image,
        orderedCallouts,
        styles,
        exportMode,
        exportMaxDim,
        canvasMargin,
        marginColor
      );
    const fragment = buildImageMapHTML({
      imageSrc: dataUrl,
      exportWidth,
      exportHeight,
      exportScale,
      callouts: orderedCallouts,
      styles,
      mapName,
    });
    const base = sanitizeFileName(mapName) || 'image-map';
    const blob = new Blob([fragment], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${base}.html`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Copy HTML is meant to be pasted into a site you already control, so it
  // references the image by file name instead — no flattening needed, just
  // the export dimensions/scale, and you supply the matching PNG yourself
  // (e.g. via Export PNG).
  function copyHTML() {
    if (!image) return;
    const { canvasWidth, canvasHeight } = canvasDims(image, canvasMargin);
    const { exportWidth, exportHeight, exportScale } = computeExportDims(
      canvasWidth,
      canvasHeight,
      exportMode,
      exportMaxDim
    );
    const base = sanitizeFileName(mapName) || 'image-map';
    const fragment = buildImageMapHTML({
      imageSrc: `${base}.png`,
      exportWidth,
      exportHeight,
      exportScale,
      callouts: orderedCallouts,
      styles,
      mapName,
    });
    navigator.clipboard.writeText(fragment);
    setCopyStatus('copied');
    setTimeout(() => setCopyStatus(null), 1500);
  }

  function exportProject() {
    const data = {
      image,
      callouts,
      styles,
      startNumber,
      canvasMargin,
      marginColor,
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const base = sanitizeFileName(fileBaseName) || 'callout-project';
    const link = document.createElement('a');
    link.download = `${base}.json`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  }

  function loadProject(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (data.image) setImage(data.image);
        if (data.callouts)
          setCallouts(
            data.callouts.map((c) => ({ url: '', linkTitle: '', ...c }))
          );
        if (data.styles) setStyles(data.styles.map(normalizeStyle));
        if (data.startNumber) setStartNumber(data.startNumber);
        if (data.canvasMargin)
          setCanvasMargin({ ...NO_MARGIN, ...data.canvasMargin });
        if (data.marginColor) setMarginColor(data.marginColor);
      } catch (e) {
        alert("Couldn't read that project file.");
      }
    };
    reader.readAsText(file);
  }

  const styleMap = Object.fromEntries(styles.map((s) => [s.id, s]));

  return (
    <div
      style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        background: '#14161A',
        minHeight: '100%',
        color: '#E7E8EA',
      }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=IBM+Plex+Mono:wght@400;600&display=swap');`}</style>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '14px 18px',
          borderBottom: '1px solid #2A2D34',
          flexWrap: 'wrap',
        }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 15,
            letterSpacing: 0.2,
            marginRight: 8,
          }}>
          Callout Annotator
        </div>

        {/* Image group */}
        <button
          onClick={() => imgFileRef.current.click()}
          title={
            image
              ? 'Load a different image and clear all current callouts'
              : undefined
          }
          style={btnStyle()}>
          <Upload size={14} />{' '}
          {image ? 'New image (clears callouts)' : 'Upload image'}
        </button>
        <input
          ref={imgFileRef}
          type='file'
          accept='image/png,image/jpeg'
          style={{ display: 'none' }}
          onChange={(e) => handleImageFile(e.target.files[0])}
        />

        <div style={dividerStyle()} />

        {/* Canvas margin group — extra space around the image so badges can
            sit off the edges instead of crowding a tightly cropped image */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12.5,
            color: '#9BA0AA',
          }}>
          Margin
          {[
            { key: 'top', label: 'T' },
            { key: 'right', label: 'R' },
            { key: 'bottom', label: 'B' },
            { key: 'left', label: 'L' },
          ].map(({ key, label }) => (
            <label
              key={key}
              title={`${key} margin (px)`}
              style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <span style={{ fontSize: 10, color: '#6B707A' }}>{label}</span>
              <input
                type='number'
                min={0}
                value={canvasMargin[key]}
                onChange={(e) =>
                  setCanvasMargin((m) => ({
                    ...m,
                    [key]: Math.max(0, parseInt(e.target.value || '0', 10)),
                  }))
                }
                style={{
                  width: 40,
                  background: '#1E2127',
                  border: '1px solid #33363E',
                  borderRadius: 6,
                  color: '#E7E8EA',
                  padding: '4px 4px',
                  fontSize: 11.5,
                }}
              />
            </label>
          ))}
          <span title='Margin fill color' style={{ width: 90 }}>
            <ColorSwatchPicker value={marginColor} onChange={setMarginColor} />
          </span>
        </div>

        <div style={dividerStyle()} />

        {/* Numbering & naming group */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12.5,
            color: '#9BA0AA',
          }}>
          Start #
          <input
            type='number'
            value={startNumber}
            onChange={(e) =>
              setStartNumber(parseInt(e.target.value || '1', 10))
            }
            style={{
              width: 52,
              background: '#1E2127',
              border: '1px solid #33363E',
              borderRadius: 6,
              color: '#E7E8EA',
              padding: '4px 6px',
            }}
          />
        </label>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12.5,
            color: '#9BA0AA',
          }}>
          File name
          <input
            type='text'
            value={fileBaseName}
            onChange={(e) => setFileBaseName(e.target.value)}
            placeholder='annotated-image'
            style={{
              width: 150,
              background: '#1E2127',
              border: '1px solid #33363E',
              borderRadius: 6,
              color: '#E7E8EA',
              padding: '4px 6px',
            }}
          />
        </label>

        <div style={dividerStyle()} />

        {/* Panels & project I/O group */}
        <button
          onClick={() => setShowStyleManager((v) => !v)}
          style={btnStyle(showStyleManager)}>
          <Settings2 size={14} /> Styles
        </button>
        <button onClick={exportProject} style={btnStyle()}>
          <Save size={14} /> Save project
        </button>
        <button
          onClick={() => projectFileRef.current.click()}
          style={btnStyle()}>
          <FolderOpen size={14} /> Open project
        </button>
        <input
          ref={projectFileRef}
          type='file'
          accept='application/json'
          style={{ display: 'none' }}
          onChange={(e) => e.target.files[0] && loadProject(e.target.files[0])}
        />

        <div style={dividerStyle()} />

        {/* Export group */}
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12.5,
            color: '#9BA0AA',
          }}>
          Export
          <select
            value={exportMode}
            onChange={(e) => setExportMode(e.target.value)}
            style={{
              background: '#1E2127',
              border: '1px solid #33363E',
              borderRadius: 6,
              color: '#E7E8EA',
              padding: '4px 6px',
              fontSize: 12,
            }}>
            <option value='max'>Max dimension</option>
            <option value='full'>Full resolution</option>
          </select>
          {exportMode === 'max' && (
            <input
              type='number'
              value={exportMaxDim}
              onChange={(e) =>
                setExportMaxDim(
                  Math.max(1, parseInt(e.target.value || '800', 10))
                )
              }
              title='Longest edge (width or height, whichever is bigger) in pixels'
              style={{
                width: 56,
                background: '#1E2127',
                border: '1px solid #33363E',
                borderRadius: 6,
                color: '#E7E8EA',
                padding: '4px 6px',
              }}
            />
          )}
        </label>
        <button
          onClick={exportPNG}
          disabled={!image}
          style={btnStyle(false, !image)}>
          <Download size={14} /> Export PNG
        </button>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12.5,
            color: '#9BA0AA',
          }}>
          Map name
          <input
            type='text'
            value={mapName}
            onChange={(e) => setMapName(e.target.value)}
            placeholder='image-map'
            style={{
              width: 130,
              background: '#1E2127',
              border: '1px solid #33363E',
              borderRadius: 6,
              color: '#E7E8EA',
              padding: '4px 6px',
            }}
          />
        </label>
        <button
          onClick={exportHTML}
          disabled={!image}
          title='Download a standalone HTML file: the flattened image plus clickable hotspots for any callout with a link'
          style={btnStyle(false, !image)}>
          <Download size={14} /> Export HTML
        </button>
        <button
          onClick={copyHTML}
          disabled={!image}
          title='Copy the same HTML fragment to the clipboard (references the image by file name — pair with Export PNG), ready to paste into your own site'
          style={btnStyle(false, !image)}>
          <Copy size={14} /> {copyStatus === 'copied' ? 'Copied!' : 'Copy HTML'}
        </button>
      </div>

      <div style={{ display: 'flex', minHeight: 560 }}>
        <div
          style={{
            flex: 1,
            minWidth: 0,
            padding: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: '#0E0F12',
          }}>
          {!image ? (
            <div
              style={{ marginTop: 100, textAlign: 'center', color: '#6B707A' }}>
              <div style={{ fontSize: 14 }}>
                Upload a PNG or JPG to start annotating.
              </div>
              <div style={{ fontSize: 12.5, marginTop: 4 }}>
                Click anywhere on the image to drop a callout.
              </div>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 10,
                  fontSize: 11.5,
                  color: '#9BA0AA',
                  flexWrap: 'wrap',
                }}>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  {image.naturalWidth}×{image.naturalHeight}px ·{' '}
                  {(image.naturalWidth / 96).toFixed(2)}"×
                  {(image.naturalHeight / 96).toFixed(2)}" @ 96 DPI
                  {(canvasMargin.top ||
                    canvasMargin.right ||
                    canvasMargin.bottom ||
                    canvasMargin.left) &&
                    ` · canvas ${canvasNaturalWidth}×${canvasNaturalHeight}px`}
                </span>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    marginLeft: 8,
                  }}>
                  <button
                    onClick={() => setZoom((z) => Math.max(25, z - 10))}
                    style={zoomBtnStyle()}>
                    −
                  </button>
                  <input
                    type='number'
                    value={zoom}
                    onChange={(e) =>
                      setZoom(
                        Math.max(
                          10,
                          Math.min(400, parseInt(e.target.value || '100', 10))
                        )
                      )
                    }
                    style={{
                      width: 46,
                      textAlign: 'center',
                      background: '#1E2127',
                      border: '1px solid #33363E',
                      borderRadius: 5,
                      color: '#E7E8EA',
                      padding: '3px 2px',
                      fontSize: 11.5,
                    }}
                  />
                  <span>%</span>
                  <button
                    onClick={() => setZoom((z) => Math.min(400, z + 10))}
                    style={zoomBtnStyle()}>
                    +
                  </button>
                  <button
                    onClick={() => setZoom(100)}
                    title='Actual size — 1 image pixel = 1 screen pixel, matching 96 DPI'
                    style={{
                      ...zoomBtnStyle(),
                      width: 'auto',
                      padding: '0 8px',
                    }}>
                    1:1 (96 DPI)
                  </button>
                </div>
              </div>
              <div
                style={{
                  width: '100%',
                  overflow: 'auto',
                  display: 'flex',
                  justifyContent: zoom <= 100 ? 'center' : 'flex-start',
                }}>
                <div
                  ref={wrapRef}
                  onClick={handleCanvasClick}
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    cursor: 'crosshair',
                    border: '1px solid #2A2D34',
                    boxShadow: '0 0 0 4px #0E0F12',
                    flexShrink: 0,
                    width: (canvasNaturalWidth * zoom) / 100,
                    height: (canvasNaturalHeight * zoom) / 100,
                    background: marginColor,
                  }}>
                  <img
                    src={image.src}
                    alt=''
                    style={{
                      display: 'block',
                      position: 'absolute',
                      left: (canvasMargin.left * zoom) / 100,
                      top: (canvasMargin.top * zoom) / 100,
                      width: (image.naturalWidth * zoom) / 100,
                      height: (image.naturalHeight * zoom) / 100,
                    }}
                  />
                  <svg
                    width={displaySize.w}
                    height={displaySize.h}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      pointerEvents: 'none',
                    }}>
                    <defs>{markerDefs(styles)}</defs>
                    {orderedCallouts.map((c) => {
                      const st = styleMap[c.styleId] || styles[0];
                      const bx = c.bx * displaySize.w,
                        by = c.by * displaySize.h;
                      return (
                        <g key={c.id} style={{ pointerEvents: 'auto' }}>
                          {c.anchors.map((a) => {
                            const ax = a.ax * displaySize.w,
                              ay = a.ay * displaySize.h;
                            return (
                              <React.Fragment key={a.id}>
                                <line
                                  x1={ax}
                                  y1={ay}
                                  x2={bx}
                                  y2={by}
                                  stroke={st.stroke}
                                  strokeWidth={
                                    st.strokeWidth * previewSizeScale
                                  }
                                  markerStart={
                                    st.cap !== 'none'
                                      ? `url(#cap-${st.id})`
                                      : undefined
                                  }
                                />
                                <circle
                                  data-draggable
                                  cx={ax}
                                  cy={ay}
                                  r={5}
                                  fill={st.stroke}
                                  stroke='#fff'
                                  strokeWidth={1.5}
                                  style={{ cursor: 'grab' }}
                                  onMouseDown={(e) => {
                                    e.stopPropagation();
                                    setDragState({
                                      calloutId: c.id,
                                      anchorId: a.id,
                                      target: 'a',
                                    });
                                  }}
                                />
                              </React.Fragment>
                            );
                          })}
                          <circle
                            data-draggable
                            cx={bx}
                            cy={by}
                            r={st.badgeRadius * previewSizeScale}
                            fill={st.badgeFill}
                            stroke={st.stroke}
                            strokeWidth={2 * previewSizeScale}
                            style={{ cursor: 'grab' }}
                            onMouseDown={(e) => {
                              e.stopPropagation();
                              setDragState({ calloutId: c.id, target: 'b' });
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedId(c.id);
                            }}
                          />
                          <text
                            x={bx}
                            y={by}
                            fill={st.badgeText}
                            fontFamily={st.font}
                            fontSize={st.fontSize * previewSizeScale}
                            fontWeight={st.fontWeight}
                            textAnchor='middle'
                            dominantBaseline='central'
                            style={{
                              pointerEvents: 'none',
                              userSelect: 'none',
                            }}>
                            {c.number}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>
            </>
          )}
        </div>

        <div
          style={{
            width: 320,
            flexShrink: 0,
            borderLeft: '1px solid #2A2D34',
            background: '#17191E',
            display: 'flex',
            flexDirection: 'column',
          }}>
          <div
            style={{
              padding: '12px 14px',
              borderBottom: '1px solid #2A2D34',
              fontSize: 11,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: '#6B707A',
            }}>
            Callout list ({orderedCallouts.length})
          </div>

          <div
            style={{
              display: 'flex',
              gap: 6,
              padding: '10px 14px',
              borderBottom: '1px solid #2A2D34',
              flexWrap: 'wrap',
            }}>
            {styles.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveStyleId(s.id)}
                title={`New callouts use "${s.name}"`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 11,
                  padding: '4px 8px',
                  borderRadius: 20,
                  border:
                    activeStyleId === s.id
                      ? `1px solid ${s.stroke}`
                      : '1px solid #33363E',
                  background:
                    activeStyleId === s.id ? '#1E2127' : 'transparent',
                  color: '#CFD1D6',
                  cursor: 'pointer',
                }}>
                <span
                  style={{
                    width: 9,
                    height: 9,
                    borderRadius: 99,
                    background: s.stroke,
                    display: 'inline-block',
                  }}
                />
                {s.name}
              </button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {orderedCallouts.length === 0 && (
              <div style={{ padding: 16, fontSize: 12.5, color: '#6B707A' }}>
                No callouts yet. Click the image to add one.
              </div>
            )}
            {orderedCallouts.map((c, idx) => {
              const st = styleMap[c.styleId] || styles[0];
              return (
                <div
                  key={c.id}
                  draggable
                  onDragStart={() => setDragRowIndex(idx)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (dragRowIndex !== null) reorder(dragRowIndex, idx);
                    setDragRowIndex(null);
                  }}
                  onClick={() => setSelectedId(c.id)}
                  style={{
                    display: 'flex',
                    gap: 8,
                    alignItems: 'flex-start',
                    padding: '10px 14px',
                    borderBottom: '1px solid #22252B',
                    background: selectedId === c.id ? '#1E2127' : 'transparent',
                    cursor: 'grab',
                  }}>
                  <GripVertical
                    size={14}
                    style={{ marginTop: 4, color: '#585C66', flexShrink: 0 }}
                  />
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 99,
                      background: st.badgeFill,
                      color: st.badgeText,
                      fontSize: 11,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 1,
                    }}>
                    {c.number}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <input
                      value={c.text}
                      onChange={(e) => updateCalloutText(c.id, e.target.value)}
                      placeholder='Callout text / notes…'
                      style={{
                        width: '100%',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1px solid #33363E',
                        color: '#E7E8EA',
                        fontSize: 12.5,
                        padding: '2px 0',
                        marginBottom: 6,
                      }}
                    />
                    <div
                      style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <select
                        value={c.styleId}
                        onChange={(e) =>
                          updateCalloutStyle(c.id, e.target.value)
                        }
                        style={{
                          fontSize: 11,
                          background: '#1E2127',
                          border: '1px solid #33363E',
                          borderRadius: 5,
                          color: '#CFD1D6',
                          padding: '2px 4px',
                        }}>
                        {styles.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <span style={{ fontSize: 10.5, color: '#6B707A' }}>
                        {c.anchors.length} leader
                        {c.anchors.length > 1 ? 's' : ''}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addLeader(c.id);
                        }}
                        title='Add another leader line to this number'
                        style={iconBtnStyle()}>
                        <Plus size={11} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeLeader(c.id);
                        }}
                        disabled={c.anchors.length <= 1}
                        title='Remove last leader line'
                        style={iconBtnStyle(c.anchors.length <= 1)}>
                        <Minus size={11} />
                      </button>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        marginTop: 6,
                      }}
                      onClick={(e) => e.stopPropagation()}>
                      <Link2
                        size={11}
                        style={{ color: '#585C66', flexShrink: 0 }}
                      />
                      <input
                        value={c.url || ''}
                        onChange={(e) => updateCalloutUrl(c.id, e.target.value)}
                        placeholder='Link URL (optional)'
                        style={{
                          flex: 1,
                          minWidth: 0,
                          background: '#1E2127',
                          border: '1px solid #33363E',
                          borderRadius: 5,
                          color: '#E7E8EA',
                          fontSize: 11,
                          padding: '2px 4px',
                        }}
                      />
                      <button
                        onClick={() =>
                          window.open(
                            normalizeUrl(c.url),
                            '_blank',
                            'noopener,noreferrer'
                          )
                        }
                        disabled={!c.url?.trim()}
                        title='Open this link in a new tab to sanity-check it'
                        style={iconBtnStyle(!c.url?.trim())}>
                        <ExternalLink size={11} />
                      </button>
                    </div>
                    {c.url?.trim() && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 4,
                          marginTop: 4,
                        }}
                        onClick={(e) => e.stopPropagation()}>
                        <span
                          style={{
                            width: 11,
                            flexShrink: 0,
                          }}
                        />
                        <input
                          value={c.linkTitle || ''}
                          onChange={(e) =>
                            updateCalloutLinkTitle(c.id, e.target.value)
                          }
                          placeholder='Link title (shown on hover)'
                          style={{
                            flex: 1,
                            minWidth: 0,
                            background: '#1E2127',
                            border: '1px solid #33363E',
                            borderRadius: 5,
                            color: '#E7E8EA',
                            fontSize: 11,
                            padding: '2px 4px',
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCallout(c.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#6B707A',
                      cursor: 'pointer',
                      padding: 2,
                    }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {showStyleManager && (
          <div
            style={{
              width: 300,
              flexShrink: 0,
              borderLeft: '1px solid #2A2D34',
              background: '#17191E',
              padding: 14,
              overflowY: 'auto',
              height: '100vh',
            }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 10,
              }}>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  color: '#6B707A',
                }}>
                Style presets
              </div>
              <button
                onClick={() => setShowStyleManager(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6B707A',
                  cursor: 'pointer',
                }}>
                <X size={14} />
              </button>
            </div>
            {styles.map((s) => {
              const isOpen = expandedStyleId === s.id;
              return (
                <div
                  key={s.id}
                  id={`style-card-${s.id}`}
                  style={{
                    border: '1px solid #2A2D34',
                    borderRadius: 8,
                    marginBottom: 8,
                    overflow: 'hidden',
                  }}>
                  <div
                    onClick={() => setExpandedStyleId(isOpen ? null : s.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 10px',
                      cursor: 'pointer',
                      background: isOpen ? '#1E2127' : 'transparent',
                    }}>
                    {isOpen ? (
                      <ChevronDown
                        size={13}
                        style={{ color: '#6B707A', flexShrink: 0 }}
                      />
                    ) : (
                      <ChevronRight
                        size={13}
                        style={{ color: '#6B707A', flexShrink: 0 }}
                      />
                    )}
                    <span
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 99,
                        background: s.stroke,
                        flexShrink: 0,
                      }}
                    />
                    <input
                      value={s.name}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        updateStyleField(s.id, 'name', e.target.value)
                      }
                      style={{ ...inputStyle(), flex: 1, minWidth: 0 }}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteStyle(s.id);
                      }}
                      disabled={styles.length <= 1}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: styles.length <= 1 ? '#3A3D44' : '#9BA0AA',
                        cursor: styles.length <= 1 ? 'default' : 'pointer',
                        flexShrink: 0,
                      }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                  {isOpen && (
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 6,
                        fontSize: 11,
                        color: '#9BA0AA',
                        padding: 10,
                        borderTop: '1px solid #2A2D34',
                      }}>
                      <label>
                        Line/badge outline
                        <ColorSwatchPicker
                          value={s.stroke}
                          onChange={(v) => updateStyleField(s.id, 'stroke', v)}
                        />
                      </label>
                      <label>
                        Badge fill
                        <ColorSwatchPicker
                          value={s.badgeFill}
                          onChange={(v) =>
                            updateStyleField(s.id, 'badgeFill', v)
                          }
                        />
                      </label>
                      <label>
                        Badge text
                        <ColorSwatchPicker
                          value={s.badgeText}
                          onChange={(v) =>
                            updateStyleField(s.id, 'badgeText', v)
                          }
                        />
                      </label>
                      <label>
                        Line weight
                        <input
                          type='number'
                          min='1'
                          max='8'
                          step='0.5'
                          value={s.strokeWidth}
                          onChange={(e) =>
                            updateStyleField(
                              s.id,
                              'strokeWidth',
                              parseFloat(e.target.value)
                            )
                          }
                          style={inputStyle()}
                        />
                      </label>
                      <label>
                        Badge radius
                        <input
                          type='number'
                          min='12'
                          max='72'
                          value={s.badgeRadius}
                          onChange={(e) =>
                            updateStyleField(
                              s.id,
                              'badgeRadius',
                              parseInt(e.target.value, 10)
                            )
                          }
                          style={inputStyle()}
                        />
                      </label>
                      <label>
                        Font size
                        <input
                          type='number'
                          min='9'
                          max='36'
                          value={s.fontSize}
                          onChange={(e) =>
                            updateStyleField(
                              s.id,
                              'fontSize',
                              parseInt(e.target.value, 10)
                            )
                          }
                          style={inputStyle()}
                        />
                      </label>
                      <label>
                        Cap style
                        <select
                          value={s.cap}
                          onChange={(e) =>
                            updateStyleField(s.id, 'cap', e.target.value)
                          }
                          style={{ ...inputStyle(), width: '100%' }}>
                          {CAP_OPTIONS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Cap Size
                        <input
                          type='number'
                          min='8'
                          max='36'
                          value={s.capSize ?? 8}
                          onChange={(e) =>
                            updateStyleField(
                              s.id,
                              'capSize',
                              parseInt(e.target.value, 10)
                            )
                          }
                          style={inputStyle()}
                        />
                      </label>
                      <label title='Extra invisible padding, in exported pixels, added around this style&#39;s badge so its hotspot is easier to click'>
                        Hotspot margin (px)
                        <input
                          type='number'
                          min='0'
                          max='24'
                          value={s.hotspotMarginPx ?? 8}
                          onChange={(e) =>
                            updateStyleField(
                              s.id,
                              'hotspotMarginPx',
                              Math.max(
                                0,
                                Math.min(24, parseInt(e.target.value, 10) || 0)
                              )
                            )
                          }
                          style={inputStyle()}
                        />
                      </label>
                      <label style={{ gridColumn: 'span 2' }}>
                        Font
                        <select
                          value={s.font}
                          onChange={(e) =>
                            updateStyleField(s.id, 'font', e.target.value)
                          }
                          style={{ ...inputStyle(), width: '100%' }}>
                          {FONT_OPTIONS.map((f) => (
                            <option key={f.value} value={f.value}>
                              {f.label}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                  )}
                </div>
              );
            })}
            <button
              onClick={addStyle}
              style={{
                ...btnStyle(),
                width: '100%',
                justifyContent: 'center',
              }}>
              <Plus size={14} /> New style
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function dividerStyle() {
  return {
    width: 1,
    alignSelf: 'stretch',
    background: '#2A2D34',
    margin: '0 2px',
  };
}
function zoomBtnStyle() {
  return {
    width: 20,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#1E2127',
    border: '1px solid #33363E',
    borderRadius: 5,
    color: '#CFD1D6',
    cursor: 'pointer',
    fontSize: 13,
    padding: 0,
  };
}
function btnStyle(active, disabled) {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12.5,
    padding: '6px 10px',
    borderRadius: 6,
    border: active ? '1px solid #4B7BF5' : '1px solid #33363E',
    background: active ? '#1E2A47' : '#1B1D22',
    color: disabled ? '#4A4D54' : '#E7E8EA',
    cursor: disabled ? 'not-allowed' : 'pointer',
  };
}
function iconBtnStyle(disabled) {
  return {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
    height: 16,
    borderRadius: 4,
    border: '1px solid #33363E',
    background: '#1E2127',
    color: disabled ? '#3A3D44' : '#9BA0AA',
    cursor: disabled ? 'default' : 'pointer',
    padding: 0,
  };
}
function inputStyle() {
  return {
    width: '100%',
    background: '#1E2127',
    border: '1px solid #33363E',
    borderRadius: 5,
    color: '#E7E8EA',
    padding: '3px 5px',
    marginTop: 2,
    fontSize: 11.5,
  };
}
