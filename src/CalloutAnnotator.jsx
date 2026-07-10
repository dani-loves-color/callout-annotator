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

// Fallback values for any field a saved/loaded style might be missing —
// keeps old localStorage data or hand-edited style objects from ever
// producing an undefined value in a controlled input.
const STYLE_FIELD_DEFAULTS = {
  stroke: '#2563eb',
  strokeWidth: 2,
  cap: 'arrow',
  badgeFill: '#ffffff',
  badgeText: '#000000',
  badgeRadius: 18,
  font: 'Inter, system-ui, sans-serif',
  fontSize: 16,
  fontWeight: 700,
  capSize: 8,
};
function normalizeStyle(s) {
  return { ...STYLE_FIELD_DEFAULTS, ...s };
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

export default function CalloutAnnotator() {
  const [image, setImage] = useState(null); // {src, naturalWidth, naturalHeight}
  const [callouts, setCallouts] = useState([]); // {id, anchors:[{id,ax,ay}], bx, by, text, styleId}
  const [styles, setStyles] = useState(DEFAULT_STYLES);
  const [startNumber, setStartNumber] = useState(1);
  const [activeStyleId, setActiveStyleId] = useState(DEFAULT_STYLES[0].id);
  const [showStyleManager, setShowStyleManager] = useState(false);
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 });
  const [zoom, setZoom] = useState(100);
  const [exportMode, setExportMode] = useState('max'); // 'max' | 'full'
  const [exportMaxDim, setExportMaxDim] = useState(800);
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
        JSON.stringify({ exportMode, exportMaxDim }),
        false
      )
      .catch(() => {});
  }, [exportMode, exportMaxDim]);

  // track displayed image size — ResizeObserver catches layout shifts (like the style panel
  // opening/closing) in addition to actual window resizes.
  useEffect(() => {
    if (!image || !wrapRef.current) return;
    const imgEl = wrapRef.current.querySelector('img');
    if (!imgEl) return;
    function measure() {
      setDisplaySize({ w: imgEl.clientWidth, h: imgEl.clientHeight });
    }
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(imgEl);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [image, showStyleManager, zoom]);

  const orderedCallouts = callouts.map((c, i) => ({
    ...c,
    number: startNumber + i,
  }));

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
  }
  function deleteStyle(styleId) {
    if (styles.length <= 1) return;
    const remaining = styles.filter((s) => s.id !== styleId);
    setStyles(remaining);
    setCallouts((prev) =>
      prev.map((c) =>
        c.styleId === styleId ? { ...c, styleId: remaining[0].id } : c
      )
    );
    if (activeStyleId === styleId) setActiveStyleId(remaining[0].id);
  }

  function exportPNG() {
    if (!image) return;
    const { naturalWidth: nw, naturalHeight: nh } = image;
    let exportWidth = nw,
      exportHeight = nh;
    if (exportMode === 'max') {
      const dim = Math.max(1, exportMaxDim);
      if (nw >= nh) {
        exportWidth = Math.min(nw, dim);
        exportHeight = Math.round((exportWidth / nw) * nh);
      } else {
        exportHeight = Math.min(nh, dim);
        exportWidth = Math.round((exportHeight / nh) * nw);
      }
    }
    const exportScale = exportWidth / nw; // proportional to the image, independent of on-screen zoom

    const canvas = document.createElement('canvas');
    canvas.width = exportWidth;
    canvas.height = exportHeight;
    const ctx = canvas.getContext('2d');
    const baseImg = new Image();
    baseImg.onload = () => {
      ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);
      const svgMarkup = buildExportSVGMarkup(
        orderedCallouts,
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
        const link = document.createElement('a');
        link.download = `annotated-image-${exportWidth}x${exportHeight}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      };
      overlayImg.src = url;
    };
    baseImg.src = image.src;
  }

  function exportProject() {
    const data = { image, callouts, styles, startNumber };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'callout-project.json';
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
        if (data.callouts) setCallouts(data.callouts);
        if (data.styles) setStyles(data.styles.map(normalizeStyle));
        if (data.startNumber) setStartNumber(data.startNumber);
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

        <button onClick={() => imgFileRef.current.click()} style={btnStyle()}>
          <Upload size={14} /> {image ? 'Replace image' : 'Upload image'}
        </button>
        <input
          ref={imgFileRef}
          type='file'
          accept='image/png,image/jpeg'
          style={{ display: 'none' }}
          onChange={(e) => handleImageFile(e.target.files[0])}
        />

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

        <div style={{ flex: 1 }} />

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
      </div>

      <div style={{ display: 'flex', minHeight: 560 }}>
        <div
          style={{
            flex: 1,
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
                }}>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
                  {image.naturalWidth}×{image.naturalHeight}px ·{' '}
                  {(image.naturalWidth / 96).toFixed(2)}"×
                  {(image.naturalHeight / 96).toFixed(2)}" @ 96 DPI
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
                  }}>
                  <img
                    src={image.src}
                    alt=''
                    style={{
                      display: 'block',
                      width: (image.naturalWidth * zoom) / 100,
                      height: (image.naturalHeight * zoom) / 100,
                    }}
                    onLoad={(e) =>
                      setDisplaySize({
                        w: e.target.clientWidth,
                        h: e.target.clientHeight,
                      })
                    }
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
                                  strokeWidth={st.strokeWidth}
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
                            r={st.badgeRadius}
                            fill={st.badgeFill}
                            stroke={st.stroke}
                            strokeWidth={2}
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
                            fontSize={st.fontSize}
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
            {styles.map((s) => (
              <div
                key={s.id}
                style={{
                  border: '1px solid #2A2D34',
                  borderRadius: 8,
                  padding: 10,
                  marginBottom: 10,
                }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  <input
                    value={s.name}
                    onChange={(e) =>
                      updateStyleField(s.id, 'name', e.target.value)
                    }
                    style={inputStyle()}
                  />
                  <button
                    onClick={() => deleteStyle(s.id)}
                    disabled={styles.length <= 1}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: styles.length <= 1 ? '#3A3D44' : '#9BA0AA',
                      cursor: styles.length <= 1 ? 'default' : 'pointer',
                    }}>
                    <Trash2 size={13} />
                  </button>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 6,
                    fontSize: 11,
                    color: '#9BA0AA',
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
                      onChange={(v) => updateStyleField(s.id, 'badgeFill', v)}
                    />
                  </label>
                  <label>
                    Badge text
                    <ColorSwatchPicker
                      value={s.badgeText}
                      onChange={(v) => updateStyleField(s.id, 'badgeText', v)}
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
                      max='48'
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
                      max='20'
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
                      max='20'
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
              </div>
            ))}
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
