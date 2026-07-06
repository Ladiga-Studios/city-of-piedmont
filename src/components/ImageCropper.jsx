'use client';

import { useRef, useState, useCallback } from 'react';

/**
 * Non-destructive crop picker for the directory card.
 *
 * Smooth, pixel-based panning. The key subtlety: with object-fit:cover the image
 * already overflows the frame on one axis even at zoom 1 (because its aspect ratio
 * rarely matches the 3:2 card). The pannable distance on each axis is therefore
 * (renderedImageSize - frameSize), where renderedImageSize accounts for BOTH the
 * cover-scaling and the zoom. We measure the image's natural size to compute that
 * exactly, so dragging tracks the cursor 1:1 instead of jumping.
 *
 * We save { x, y, zoom }: x/y are 0-100% focal points, zoom is a scale >= 1 — the
 * same values the public card renders with. The original image is never altered.
 *
 * Props:
 *   src       image URL
 *   value     { x, y, zoom } or null
 *   onChange  (crop) => void
 */
const DEFAULT = { x: 50, y: 50, zoom: 1 };

export default function ImageCropper({ src, value, onChange }) {
  const crop = { ...DEFAULT, ...(value || {}) };
  const frameRef = useRef(null);
  const imgRef = useRef(null);
  const drag = useRef(null);
  const [nat, setNat] = useState(null); // { w, h } natural image size

  const commit = useCallback((patch) => {
    onChange({ ...DEFAULT, ...(value || {}), ...patch });
  }, [onChange, value]);

  // How many pixels the image can travel on each axis at the current zoom.
  // With object-fit:cover the image is scaled so it COVERS the frame, then we
  // additionally multiply by `zoom`. Overflow = renderedSize - frameSize.
  function pannable() {
    const frame = frameRef.current;
    if (!frame || !nat) return { x: 0, y: 0, w: 1, h: 1 };
    const fw = frame.clientWidth, fh = frame.clientHeight;
    // cover scale: the larger of the two ratios so the image covers the frame
    const coverScale = Math.max(fw / nat.w, fh / nat.h);
    const renderW = nat.w * coverScale * crop.zoom;
    const renderH = nat.h * coverScale * crop.zoom;
    return {
      x: Math.max(0, renderW - fw),  // px of horizontal overflow
      y: Math.max(0, renderH - fh),  // px of vertical overflow
      w: fw, h: fh,
    };
  }

  const onPointerDown = (e) => {
    const frame = frameRef.current;
    if (!frame) return;
    frame.setPointerCapture?.(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, x: crop.x, y: crop.y, pan: pannable() };
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const movedX = e.clientX - d.px;
    const movedY = e.clientY - d.py;
    // object-position % maps 0..100 across the overflow distance. So moving the
    // cursor by `movedX` px changes position by (movedX / overflowX) * 100 percent.
    // Dragging right should reveal the left edge -> subtract.
    const nx = d.pan.x > 0 ? clamp(d.x - (movedX / d.pan.x) * 100, 0, 100) : d.x;
    const ny = d.pan.y > 0 ? clamp(d.y - (movedY / d.pan.y) * 100, 0, 100) : d.y;
    commit({ x: nx, y: ny });
  };

  const onPointerUp = (e) => {
    drag.current = null;
    frameRef.current?.releasePointerCapture?.(e.pointerId);
  };

  // Preview uses the EXACT same render the card uses, so it's accurate.
  const imgStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: `${crop.x}% ${crop.y}%`,
    transform: `scale(${crop.zoom})`,
    transformOrigin: `${crop.x}% ${crop.y}%`,
  };

  return (
    <div className="cropper">
      <div
        ref={frameRef}
        className="cropper-frame"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <img
          ref={imgRef}
          src={src}
          alt=""
          style={imgStyle}
          draggable={false}
          onLoad={(e) => setNat({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })}
        />
        <div className="cropper-grid" aria-hidden="true" />
      </div>
      <div className="cropper-controls">
        <label className="cropper-zoom">
          <span>Zoom</span>
          <input
            type="range" min="1" max="3" step="0.01"
            value={crop.zoom}
            onChange={(e) => commit({ zoom: parseFloat(e.target.value) })}
          />
        </label>
        <button type="button" className="am-btn" onClick={() => onChange({ ...DEFAULT })}>Reset</button>
      </div>
      <p className="cropper-hint">Drag the photo to reposition; this is exactly how it appears on the directory card.</p>
    </div>
  );
}

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}
