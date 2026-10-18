'use client';

// Search every council meeting: each item of business from the official minutes, ranked by
// meaning in the reader's own browser (Fangorn Westmarch view in public/meeting-search).
// Word matching answers at once; on a capable connection the meaning model loads in the
// background and the same query is re-ranked by meaning. Every hit opens the PDF at its page.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  loadMeetingIndex, loadBuildInfo, searchItems, countBy, queryTerms, snippet, highlight,
  embedQuery, warmEmbedder, registerMeetingTools,
} from '@/lib/meeting-search';
import { fmtMeetingDate } from '@/lib/minutes-format';

const SUGGESTIONS = ['knuckle boom truck', 'Civic Center renovations', 'drainage problems', 'zoning board appointments', 'garbage truck', 'block grant'];
const PAGE = 12;

const KIND_LABEL = {
  'call to order': 'Call to order', ordinance: 'Ordinance', resolution: 'Resolution', bills: 'Bills paid',
  minutes: 'Minutes approved', appointment: 'Appointment', bid: 'Bid', contract: 'Contract', purchase: 'Purchase',
  'public hearing': 'Public hearing', visitors: 'Visitors', reports: 'Reports', adjournment: 'Adjournment', business: 'Business',
};
const kindLabel = (k) => KIND_LABEL[k] || (k ? k[0].toUpperCase() + k.slice(1) : 'Business');

function meaningAllowed() {
  if (typeof window === 'undefined') return false;
  const c = navigator.connection;
  if (c?.saveData) return false;
  if (c?.effectiveType && /(^|-)2g|3g/.test(c.effectiveType)) return false;
  return window.matchMedia('(min-width: 881px)').matches;
}

function Marked({ parts }) {
  return parts.map((p, i) => (p.hit ? <mark key={i}>{p.text}</mark> : <span key={i}>{p.text}</span>));
}

export default function MeetingSearch({ onOpenMeeting, onActiveChange }) {
  const [info, setInfo] = useState(null);           // build.json: counts, last rebuilt
  const [index, setIndex] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [input, setInput] = useState('');
  const [query, setQuery] = useState('');
  const [qv, setQv] = useState(null);                // query vector for `query`, once meaning is ready
  const [meaning, setMeaning] = useState('off');     // off | loading | ready | failed
  const [progress, setProgress] = useState(0);
  const [kind, setKind] = useState(null);
  const [year, setYear] = useState(null);
  const [shown, setShown] = useState(PAGE);
  const [lastQuery, setLastQuery] = useState('');   // to come back to after opening a meeting
  const inputRef = useRef(null);
  const resultsRef = useRef(null);

  // Is there an index at all? Until the first build lands, the page stays exactly as it was.
  useEffect(() => {
    loadBuildInfo().then(setInfo).catch(() => setInfo(null));
  }, []);

  const ensureIndex = useCallback(() => {
    if (index || loadError) return;
    loadMeetingIndex().then(setIndex).catch(() => setLoadError(true));
  }, [index, loadError]);

  // A shared link (?q=…) opens with its search already run.
  useEffect(() => {
    if (!info) return;
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) { setInput(q); setQuery(q); ensureIndex(); }
  }, [info]); // eslint-disable-line react-hooks/exhaustive-deps

  // Agents in this browser get the same search (WebMCP), once the rows are here.
  useEffect(() => (index ? registerMeetingTools(index) : undefined), [index]);

  const startMeaning = useCallback(() => {
    if (meaning === 'loading' || meaning === 'ready') return;
    setMeaning('loading');
    warmEmbedder((p) => setProgress(p))
      .then(() => setMeaning('ready'))
      .catch(() => setMeaning('failed'));
  }, [meaning]);

  // Embed the query once meaning is ready; until then, rank by words.
  useEffect(() => {
    setQv(null);
    if (!query || meaning !== 'ready') return;
    let live = true;
    embedQuery(query).then((v) => { if (live) setQv(v); }).catch(() => {});
    return () => { live = false; };
  }, [query, meaning]);

  useEffect(() => { onActiveChange?.(Boolean(query)); }, [query, onActiveChange]);

  const submit = (q) => {
    const text = (q ?? input).trim();
    setInput(text);
    setQuery(text);
    setKind(null); setYear(null); setShown(PAGE);
    ensureIndex();
    if (text && meaningAllowed()) startMeaning();
    const url = new URL(window.location.href);
    if (text) url.searchParams.set('q', text); else url.searchParams.delete('q');
    window.history.replaceState(null, '', url);
  };

  const clear = ({ focus = true, remember = false } = {}) => {
    setLastQuery(remember ? query : '');
    setInput(''); setQuery(''); setKind(null); setYear(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('q');
    window.history.replaceState(null, '', url);
    if (focus) inputRef.current?.focus();
  };

  const openMeeting = (date) => {
    clear({ focus: false, remember: true });
    onOpenMeeting?.(date);
  };

  const all = useMemo(() => (index && query ? searchItems(index, query, { qv }) : []), [index, query, qv]);
  const results = useMemo(() => all.filter((r) => (!kind || r.kind === kind) && (!year || r.year === year)), [all, kind, year]);
  const kinds = useMemo(() => countBy(all, 'kind').slice(0, 7), [all]);
  const years = useMemo(() => countBy(all, 'year').sort((a, b) => (a[0] < b[0] ? 1 : -1)), [all]);
  const terms = useMemo(() => queryTerms(query), [query]);
  const meetingsHit = useMemo(() => new Set(results.map((r) => r.date)).size, [results]);
  const byMeaning = results.some((r) => r.mode === 'semantic');

  if (!info) return null;

  const updated = info.generated_at ? new Date(info.generated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : null;

  return (
    <section className={`ms ${query ? 'ms-active' : ''}`} aria-label="Search council meetings">
      <form className="ms-bar" role="search" onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <svg className="ms-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" />
        </svg>
        <label htmlFor="ms-input" className="ms-sr">Search every council meeting</label>
        <input
          id="ms-input" ref={inputRef} type="search" value={input} autoComplete="off" enterKeyHint="search"
          placeholder="Search every council meeting since 2024"
          onChange={(e) => setInput(e.target.value)}
          onFocus={ensureIndex}
        />
        {input && (
          <button type="button" className="ms-clear" onClick={() => clear()} aria-label="Clear search">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        )}
        <button type="submit" className="btn btn-primary ms-go">Search</button>
      </form>

      {!query && (
        <div className="ms-hint">
          {lastQuery && (
            <button type="button" className="ms-chip ms-return" onClick={() => submit(lastQuery)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
              Back to results for &ldquo;{lastQuery}&rdquo;
            </button>
          )}
          <span className="ms-hint-label">Try</span>
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" className="ms-chip" onClick={() => submit(s)}>{s}</button>
          ))}
          <p className="ms-meta">
            {info.items.toLocaleString()} items of business from {info.meetings} meetings
            {updated ? <> · updated {updated}</> : null}
          </p>
        </div>
      )}

      {query && (
        <div className="ms-results" ref={resultsRef} aria-live="polite">
          <div className="ms-head">
            <p className="ms-count">
              {!index && !loadError && 'Loading the minutes…'}
              {loadError && 'The search index could not be loaded. Try again in a moment.'}
              {index && (results.length
                ? <><strong>{results.length === 60 && !kind && !year ? '60+' : results.length}</strong> {results.length === 1 ? 'item' : 'items'} in {meetingsHit} {meetingsHit === 1 ? 'meeting' : 'meetings'}</>
                : <>No items match <strong>&ldquo;{query}&rdquo;</strong>{kind || year ? ' with these filters' : ''}.</>)}
            </p>
            <MeaningStatus meaning={meaning} progress={progress} byMeaning={byMeaning} hasResults={index && all.length > 0} onStart={startMeaning} />
            <button type="button" className="ms-back" onClick={() => clear({ focus: false })}>Back to all meetings</button>
          </div>

          {all.length > 0 && (kinds.length > 1 || years.length > 1) && (
            <div className="ms-filters">
              {kinds.length > 1 && (
                <div className="ms-filter" role="group" aria-label="Filter by kind">
                  <button type="button" className={`ms-chip ${!kind ? 'on' : ''}`} aria-pressed={!kind} onClick={() => { setKind(null); setShown(PAGE); }}>All kinds</button>
                  {kinds.map(([k, n]) => (
                    <button key={k} type="button" className={`ms-chip ${kind === k ? 'on' : ''}`} aria-pressed={kind === k}
                      onClick={() => { setKind(kind === k ? null : k); setShown(PAGE); }}>
                      {kindLabel(k)} <span className="ms-n">{n}</span>
                    </button>
                  ))}
                </div>
              )}
              {years.length > 1 && (
                <div className="ms-filter" role="group" aria-label="Filter by year">
                  <button type="button" className={`ms-chip ${!year ? 'on' : ''}`} aria-pressed={!year} onClick={() => { setYear(null); setShown(PAGE); }}>All years</button>
                  {years.map(([y, n]) => (
                    <button key={y} type="button" className={`ms-chip ${year === y ? 'on' : ''}`} aria-pressed={year === y}
                      onClick={() => { setYear(year === y ? null : y); setShown(PAGE); }}>
                      {y} <span className="ms-n">{n}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <ol className="ms-list">
            {results.slice(0, shown).map((r) => (
              <li key={r.id} className="ms-item">
                <div className="ms-item-top">
                  <span className={`ms-kind k-${String(r.kind || 'business').replace(/\s+/g, '-')}`}>{kindLabel(r.kind)}</span>
                  <span className="ms-date">{fmtMeetingDate(r.date)}{r.meeting_type && r.meeting_type !== 'Regular Meeting' ? ` · ${r.meeting_type}` : ''}</span>
                </div>
                <ItemText r={r} terms={terms} />
                <div className="ms-actions">
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="ms-pdf">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" />
                    </svg>
                    Official minutes, page {r.page}
                    <span className="ms-sr"> (opens PDF in a new tab)</span>
                  </a>
                  {onOpenMeeting && (
                    <button type="button" className="ms-open" onClick={() => openMeeting(r.date)}>
                      Meeting summary
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ol>

          {results.length > shown && (
            <button type="button" className="btn btn-outline ms-more" onClick={() => setShown((n) => n + PAGE)}>
              Show more results
            </button>
          )}

          {index && results.length > 0 && (
            <p className="ms-foot">
              Each result is a paragraph of the official minutes, linked to the page it is on.
              The PDF is the authoritative record.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

// The paragraph's first sentence as its title, and the rest as a passage around the words
// searched for. A first sentence too long to be a title was clipped by the source, so then
// the passage itself leads.
function ItemText({ r, terms }) {
  const text = String(r.text || '').trim();
  const heading = String(r.heading || '').trim();
  const clipped = heading.endsWith('…');
  if (!text || text === heading) return <h3 className="ms-title"><Marked parts={highlight(heading || text, terms)} /></h3>;
  if (clipped || !text.startsWith(heading)) {
    return <h3 className="ms-title ms-title-passage"><Marked parts={snippet(text, terms, 320)} /></h3>;
  }
  const rest = text.slice(heading.length).trim();
  return (
    <>
      <h3 className="ms-title"><Marked parts={highlight(heading, terms)} /></h3>
      {rest && <p className="ms-snippet"><Marked parts={snippet(rest, terms)} /></p>}
    </>
  );
}

function MeaningStatus({ meaning, progress, byMeaning, hasResults, onStart }) {
  if (!hasResults) return null;
  if (meaning === 'ready' && byMeaning) return <span className="ms-mode on">Ranked by meaning</span>;
  if (meaning === 'loading') {
    return (
      <span className="ms-mode loading" role="status">
        <span className="ms-meter" aria-hidden="true"><span style={{ width: `${Math.round(progress * 100)}%` }} /></span>
        Learning to search by meaning{progress ? ` · ${Math.round(progress * 100)}%` : '…'}
      </span>
    );
  }
  if (meaning === 'failed') return <span className="ms-mode">Matched by words</span>;
  return (
    <button type="button" className="ms-mode ms-mode-btn" onClick={onStart} title="Downloads a search model once (about 140 MB), then finds related wording too">
      Matched by words · <u>Search by meaning</u>
    </button>
  );
}
