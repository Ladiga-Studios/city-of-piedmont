'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Header search. A magnifying-glass button that, when clicked, drops a full-width
 * search bar DOWN below the header (rather than expanding inline and shoving the
 * nav around). Submitting (Enter or the arrow) goes to /search?q=...
 *
 * The toggle button lives in the header row; the drop-down panel is positioned
 * against the header itself so it spans the full width. Used for both the desktop
 * icon (next to Pay My Bill) and the mobile icon (next to the hamburger).
 */
export default function HeaderSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const inputRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) { if (e.key === 'Escape') setOpen(false); }
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function submit(e) {
    e.preventDefault();
    const t = q.trim();
    if (!t) { inputRef.current?.focus(); return; }
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(t)}`);
  }

  return (
    <div className={`hdr-search ${open ? 'open' : ''}`} ref={wrapRef}>
      <button
        type="button"
        className="hdr-search-toggle"
        aria-label={open ? 'Close search' : 'Search the site'}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M18 6L6 18M6 6l12 12"/></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
        )}
      </button>

      {/* Full-width drop-down panel below the header */}
      <div className="hdr-search-panel" hidden={!open}>
        <div className="container">
          <form className="hdr-search-form" onSubmit={submit} role="search">
            <span className="hdr-search-ico" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
            </span>
            <input
              ref={inputRef}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search for pages, departments, news, events, businesses…"
              aria-label="Search query"
              tabIndex={open ? 0 : -1}
            />
            <button type="submit" className="hdr-search-go" aria-label="Search">
              Search
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
