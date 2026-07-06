'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { BUSINESS_CATEGORIES } from '@/lib/business';

export default function BusinessDirectory({ businesses }) {
  const [active, setActive] = useState('All');
  const [query, setQuery] = useState('');

  // Only show categories that actually have businesses.
  const usedCategories = useMemo(() => {
    const set = new Set(businesses.map((b) => b.category));
    return BUSINESS_CATEGORIES.filter((c) => set.has(c));
  }, [businesses]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = active === 'All' ? businesses : businesses.filter((b) => b.category === active);
    if (q) {
      list = list.filter((b) => {
        const hay = `${b.name || ''} ${b.tagline || ''} ${b.category || ''}`.toLowerCase();
        return hay.includes(q);
      });
    }
    // Featured first, then alphabetical.
    return [...list].sort((a, b) =>
      (b.featured === a.featured ? a.name.localeCompare(b.name) : (b.featured ? 1 : -1))
    );
  }, [businesses, active, query]);

  if (businesses.length === 0) {
    return (
      <div className="empty-note">
        No businesses are listed yet. Own a business in Piedmont?{' '}
        <Link href="/contact" style={{ color: 'var(--sunset)', fontWeight: 600 }}>Get listed for free →</Link>
      </div>
    );
  }

  return (
    <>
      <div className="biz-search">
        <span className="biz-search-ico" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
        </span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search businesses by name, type, or keyword…"
          aria-label="Search businesses"
        />
        {query && (
          <button type="button" className="biz-search-clear" onClick={() => setQuery('')} aria-label="Clear search">&times;</button>
        )}
      </div>

      <div className="biz-filters" role="tablist" aria-label="Filter by category">
        <button
          role="tab"
          aria-selected={active === 'All'}
          className={`biz-chip ${active === 'All' ? 'active' : ''}`}
          onClick={() => setActive('All')}
        >All</button>
        {usedCategories.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={active === c}
            className={`biz-chip ${active === c ? 'active' : ''}`}
            onClick={() => setActive(c)}
          >{c}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-note">
          No businesses match{query ? ` \u201C${query}\u201D` : ''}{active !== 'All' ? ` in ${active}` : ''}.{' '}
          <button type="button" className="biz-reset-link" onClick={() => { setQuery(''); setActive('All'); }}>Clear filters</button>
        </div>
      ) : (
      <div className="biz-grid">
        {filtered.map((b) => (
          <Link key={b.id} href={`/business/${b.slug}`} className="biz-card">
            <div className="biz-card-img">
              {b.image_url ? (
                (() => {
                  // image_crop is jsonb (an object), but normalize defensively in
                  // case it ever comes back as a JSON string.
                  let crop = b.image_crop;
                  if (typeof crop === 'string') {
                    try { crop = JSON.parse(crop); } catch { crop = null; }
                  }
                  const style = crop && crop.x != null ? {
                    objectPosition: `${crop.x}% ${crop.y}%`,
                    transform: `scale(${crop.zoom ?? 1})`,
                    transformOrigin: `${crop.x}% ${crop.y}%`,
                  } : undefined;
                  return (
                    <img
                      src={b.image_url}
                      alt={`${b.name} in Piedmont, Alabama`}
                      loading="lazy"
                      style={style}
                    />
                  );
                })()
              ) : (
                <div className="biz-card-noimg" aria-hidden="true">
                  <span>{b.name.charAt(0)}</span>
                </div>
              )}
              {b.featured && <span className="biz-feat">Featured</span>}
            </div>
            <div className="biz-card-body">
              <span className="biz-cat">{b.category}</span>
              <h3>{b.name}</h3>
              {b.tagline && <p>{b.tagline}</p>}
            </div>
          </Link>
        ))}
      </div>
      )}
    </>
  );
}
