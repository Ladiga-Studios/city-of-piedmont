'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Business photo gallery.
 *  - Masonry columns (CSS columns) so each photo keeps its real proportions —
 *    nothing is cropped and there are no black letterbox bars.
 *  - Click any photo to open it full-size in a lightbox (Esc or click to close;
 *    arrow keys to move between photos).
 */
export default function BizGallery({ photos = [], name = '' }) {
  const [open, setOpen] = useState(null); // index or null

  const close = useCallback(() => setOpen(null), []);
  const next = useCallback(() => setOpen((i) => (i === null ? i : (i + 1) % photos.length)), [photos.length]);
  const prev = useCallback(() => setOpen((i) => (i === null ? i : (i - 1 + photos.length) % photos.length)), [photos.length]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, close, next, prev]);

  if (!photos.length) return null;

  return (
    <>
      <div className="biz-masonry">
        {photos.map((src, i) => (
          <button
            type="button"
            key={i}
            className="biz-masonry-item"
            onClick={() => setOpen(i)}
            aria-label={`Open photo ${i + 1} of ${photos.length}`}
          >
            <img src={src} alt={`${name} photo ${i + 1}`} loading="lazy" />
          </button>
        ))}
      </div>

      {open !== null && (
        <div className="biz-lightbox" onClick={close} role="dialog" aria-modal="true" aria-label="Photo viewer">
          <button type="button" className="blb-close" onClick={close} aria-label="Close">&times;</button>
          {photos.length > 1 && (
            <button type="button" className="blb-nav blb-prev" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous photo">&#8249;</button>
          )}
          <img
            className="blb-img"
            src={photos[open]}
            alt={`${name} photo ${open + 1}`}
            onClick={(e) => e.stopPropagation()}
          />
          {photos.length > 1 && (
            <button type="button" className="blb-nav blb-next" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next photo">&#8250;</button>
          )}
          {photos.length > 1 && (
            <div className="blb-count">{open + 1} / {photos.length}</div>
          )}
        </div>
      )}
    </>
  );
}
