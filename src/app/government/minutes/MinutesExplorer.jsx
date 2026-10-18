'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { fmtMeetingDate as fmtDate, descriptorFromTitle } from '@/lib/minutes-format';
import AnchorBadge from '@/components/AnchorBadge';
import MeetingSearch from './MeetingSearch';

function yearOf(d) { return (d || '').slice(0, 4) || 'Undated'; }

export default function MinutesExplorer({ minutes }) {
  const grouped = useMemo(() => {
    const g = {};
    for (const m of minutes) (g[yearOf(m.meeting_date)] = g[yearOf(m.meeting_date)] || []).push(m);
    return Object.entries(g).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [minutes]);

  const [selectedId, setSelectedId] = useState(minutes[0]?.id || null);
  const selected = minutes.find((m) => m.id === selectedId) || null;
  const [searching, setSearching] = useState(false);
  const [jumped, setJumped] = useState(0);

  // On mobile, selecting scrolls the detail panel into view.
  useEffect(() => {
    if (selectedId && window.matchMedia('(max-width: 880px)').matches) {
      document.getElementById('minute-detail')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [selectedId]);

  // From a search result to that meeting's summary card.
  const openMeeting = useCallback((date) => {
    const m = minutes.find((x) => x.meeting_date === date);
    if (m) setSelectedId(m.id);
    setJumped((n) => n + 1);
  }, [minutes]);
  useEffect(() => {
    if (!jumped) return;
    requestAnimationFrame(() => {
      const el = document.getElementById(window.matchMedia('(max-width: 880px)').matches ? 'minute-detail' : 'minutes-explorer');
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Bring the chosen meeting into view inside the list, without moving the page again.
      const list = document.querySelector('.mx-list');
      const item = list?.querySelector('.mx-item.active');
      if (list && item) list.scrollTop += item.getBoundingClientRect().top - list.getBoundingClientRect().top - list.clientHeight / 3;
    });
  }, [jumped]);

  if (minutes.length === 0) {
    return <div className="empty-note">No meeting minutes have been posted yet. Check back soon.</div>;
  }

  return (
    <>
    <MeetingSearch onOpenMeeting={openMeeting} onActiveChange={setSearching} />
    <div className="minutes-explorer" id="minutes-explorer" hidden={searching}>
      {/* ---- left: list grouped by year ---- */}
      <div className="mx-list" role="list">
        {grouped.map(([year, items]) => (
          <div key={year} className="mx-year">
            <h2 className="mx-year-label">{year}</h2>
            {items.map((m) => {
              const desc = descriptorFromTitle(m.title);
              return (
                <button
                  key={m.id}
                  role="listitem"
                  className={`mx-item ${m.id === selectedId ? 'active' : ''}`}
                  onClick={() => setSelectedId(m.id)}
                  aria-pressed={m.id === selectedId}
                >
                  <span className="mx-item-title">{fmtDate(m.meeting_date)}</span>
                  {desc && <span className="mx-item-date">{desc}</span>}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* ---- right: detail / AI summary ---- */}
      <div className="mx-detail" id="minute-detail" aria-live="polite">
        {selected && <DetailCard key={selected.id} m={selected} />}
      </div>
    </div>
    </>
  );
}

function DetailCard({ m }) {
  const hasSummary = m.summary_status === 'ready' && m.summary;
  const decisions = Array.isArray(m.decisions) ? m.decisions : [];
  const actions = Array.isArray(m.action_items) ? m.action_items : [];
  const desc = descriptorFromTitle(m.title);

  return (
    <article className="mx-card">
      <div className="mx-card-head">
        <p className="eyebrow">Council Meeting</p>
        <h3>{fmtDate(m.meeting_date)}</h3>
        {desc && <p className="mx-card-desc">{desc}</p>}
      </div>

      {hasSummary ? (
        <>
          <div className="ai-tag">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M12 2l2.4 5.6L20 10l-5.6 2.4L12 18l-2.4-5.6L4 10l5.6-2.4z" />
            </svg>
            AI summary
          </div>
          <p className="mx-summary">{m.summary}</p>

          {decisions.length > 0 && (
            <section className="mx-block">
              <h4>Key decisions</h4>
              <ul className="mx-bullets">
                {decisions.map((d, i) => <li key={i}>{d}</li>)}
              </ul>
            </section>
          )}

          {actions.length > 0 && (
            <section className="mx-block">
              <h4>Action items &amp; next steps</h4>
              <ul className="mx-bullets mx-bullets-action">
                {actions.map((a, i) => <li key={i}>{a}</li>)}
              </ul>
            </section>
          )}

          <p className="mx-disclaimer">
            This summary is AI-generated for quick reference. The official PDF is the authoritative record.
          </p>
        </>
      ) : (
        <p className="mx-summary mx-no-summary">
          A summary for this meeting isn&rsquo;t available yet. You can read the full record in the PDF.
        </p>
      )}

      <a href={m.file_url} target="_blank" rel="noopener noreferrer" className="btn btn-primary mx-download">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
          <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
        </svg>
        Download full minutes (PDF)
      </a>

      <AnchorBadge record={m} />
    </article>
  );
}
