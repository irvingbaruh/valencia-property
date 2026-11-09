'use client';

import { useEffect, useState } from 'react';

// Listing photos sometimes carry white (or black) borders baked into the file.
// This finds those borders in the browser and crops them away so the photo fills its card edge to edge.
// If the browser refuses to read pixels (CORS), it falls back to a plain zoom.
const LIGHT = 238;
const DARK = 18;
const MAX_CROP = 0.3;

function lineIsBorder(data, w, h, vertical, idx) {
  let sum = 0, sq = 0, n = 0;
  const len = vertical ? h : w;
  for (let k = 0; k < len; k += 2) {
    const x = vertical ? idx : k;
    const y = vertical ? k : idx;
    const o = (y * w + x) * 4;
    const v = (data[o] + data[o + 1] + data[o + 2]) / 3;
    sum += v; sq += v * v; n++;
  }
  const mean = sum / n;
  const sd = Math.sqrt(Math.max(0, sq / n - mean * mean));
  return sd < 14 && (mean > LIGHT || mean < DARK);
}

function findBox(data, w, h) {
  let top = 0, bottom = 0, left = 0, right = 0;
  while (top < h * MAX_CROP && lineIsBorder(data, w, h, false, top)) top++;
  while (bottom < h * MAX_CROP && lineIsBorder(data, w, h, false, h - 1 - bottom)) bottom++;
  while (left < w * MAX_CROP && lineIsBorder(data, w, h, true, left)) left++;
  while (right < w * MAX_CROP && lineIsBorder(data, w, h, true, w - 1 - right)) right++;
  // small extra inset to drop the soft, blurred edge next to the border
  const padX = (left || right) ? Math.ceil(w * 0.012) : 0;
  const padY = (top || bottom) ? Math.ceil(h * 0.012) : 0;
  return {
    x0: left ? left + padX : 0,
    y0: top ? top + padY : 0,
    x1: right ? w - right - padX : w,
    y1: bottom ? h - bottom - padY : h,
  };
}

export default function FillImage({ src, alt = '', className = '', loading = 'lazy' }) {
  const [out, setOut] = useState({ src, zoom: false });

  useEffect(() => {
    let dead = false;
    let created = null;
    setOut({ src, zoom: false });
    if (!src) return undefined;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (dead) return;
      try {
        const W = img.naturalWidth, H = img.naturalHeight;
        if (!W || !H) return;
        const sc = Math.min(1, 240 / W);
        const w = Math.max(1, Math.round(W * sc)), h = Math.max(1, Math.round(H * sc));
        const c = document.createElement('canvas');
        c.width = w; c.height = h;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, w, h);
        const box = findBox(ctx.getImageData(0, 0, w, h).data, w, h);
        if (box.x0 === 0 && box.y0 === 0 && box.x1 === w && box.y1 === h) return;
        const sx = box.x0 / w * W, sy = box.y0 / h * H;
        const sw = (box.x1 - box.x0) / w * W, sh = (box.y1 - box.y0) / h * H;
        const outW = Math.min(1200, Math.round(sw)), outH = Math.round(sh * (outW / sw));
        const o = document.createElement('canvas');
        o.width = outW; o.height = outH;
        o.getContext('2d').drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH);
        o.toBlob((b) => {
          if (!b || dead) return;
          created = URL.createObjectURL(b);
          setOut({ src: created, zoom: false });
        }, 'image/jpeg', 0.9);
      } catch (_) {
        if (!dead) setOut({ src, zoom: true });
      }
    };
    img.onerror = () => { if (!dead) setOut({ src, zoom: true }); };
    img.src = src;
    return () => { dead = true; if (created) URL.revokeObjectURL(created); };
  }, [src]);

  return (
    <img
      src={out.src}
      alt={alt}
      loading={loading}
      className={`${className}${out.zoom ? ' scale-[1.3]' : ''}`}
    />
  );
}
