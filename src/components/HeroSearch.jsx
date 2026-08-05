'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { staticEntries, searchEntries } from '@/lib/search';

const POPULAR = [
  { label: 'Pay my utility bill', href: 'https://piedmontcity.payacp.com/home', ext: true },
  { label: 'Council meeting minutes', href: '/government/minutes' },
  { label: 'Parks & recreation', href: '/parks' },
  { label: 'Local business directory', href: '/business' },
  { label: 'Contact City Hall', href: '/contact' },
];

export default function HeroSearch() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);     // popular menu
  const [focused, setFocused] = useState(false);
  const wrapRef = useRef(null);

  // Instant suggestions from static content (pages/departments/parks). The full
  // results page also searches the database; this is just a fast preview.
  const entries = useMemo(() => staticEntries(), []);
  const suggestions = useMemo(() => {
    const term = q.trim();
    if (term.length < 2) return [];
    return searchEntries(entries, term, 6);
  }, [q, entries]);

  // Close menus on outside click.
  useEffect(() => {
    function onClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setFocused(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  function goSearch(term) {
    const t = (term ?? q).trim();
    if (!t) return;
    router.push(`/search?q=${encodeURIComponent(t)}`);
  }

  function submit(e) {
    e.preventDefault();
    goSearch();
  }

  function pick(s) {
    setFocused(false);
    if (s.ext) { window.location.href = s.href; return; }
    router.push(s.href);
  }

  const showSuggest = focused && suggestions.length > 0;

  return (
    <div className="hx-search-wrap" ref={wrapRef}>
      <form className="hx-search" onSubmit={submit} role="search">
        <span className="hx-search-ico" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
        </span>
        <input
          type="search"
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(false); }}
          onFocus={() => setFocused(true)}
          placeholder="Search for anything: bills, permits, parks, businesses…"
          aria-label="Search the site"
          autoComplete="off"
        />
        <button type="button" className="hx-popular-btn" onClick={() => { setOpen(!open); setFocused(false); }} aria-expanded={open}>
          Popular
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 9l6 6 6-6"/></svg>
        </button>
      </form>

      {/* live suggestions */}
      {showSuggest && (
        <div className="hx-suggest">
          {suggestions.map((s) => (
            <button type="button" key={`${s.type}-${s.href}`} className="hx-suggest-item" onClick={() => pick(s)}>
              <span className="hx-suggest-title">{s.title}</span>
              <span className="hx-suggest-type">{s.type}</span>
            </button>
          ))}
          <button type="button" className="hx-suggest-all" onClick={() => goSearch()}>
            See all results for &ldquo;{q.trim()}&rdquo; &rarr;
          </button>
        </div>
      )}

      {/* popular searches */}
      {open && (
        <div className="hx-popular-menu">
          {POPULAR.map((p) => (
            <a key={p.label} href={p.href} className="hx-popular-item" {...(p.ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{p.label}</a>
          ))}
        </div>
      )}
    </div>
  );
}
