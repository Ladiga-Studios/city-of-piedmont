'use client';

import { useEffect, useRef } from 'react';
import { fmtNoticeDate, isBidClosed } from '@/lib/notices-format';

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
    </svg>
  );
}

function NoticeRow({ item, isBid }) {
  const closed = isBid && isBidClosed(item.closes_date);
  return (
    <li className="notice-row reveal">
      <div className="notice-main">
        <span className="notice-date">{fmtNoticeDate(item.posted_date)}</span>
        <h3 className="notice-title">{item.title}</h3>
        {isBid && item.closes_date && (
          <span className={`notice-tag ${closed ? 'closed' : 'open'}`}>
            {closed ? 'Closed' : 'Closes'} {fmtNoticeDate(item.closes_date)}
          </span>
        )}
      </div>
      <a
        href={item.file_url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn-outline notice-dl"
        aria-label={`Download ${item.title} (PDF)`}
      >
        <DownloadIcon />
        <span>PDF</span>
      </a>
    </li>
  );
}

export default function NoticesList({ notices, bids }) {
  const rootRef = useRef(null);

  // Intersection Observer scroll reveals, respecting reduced motion.
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = rootRef.current?.querySelectorAll('.reveal') || [];
    if (reduce) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [notices, bids]);

  return (
    <div className="notices-wrap" ref={rootRef}>
      {/* ---------- Public Notices ---------- */}
      <section className="notice-block" aria-labelledby="pn-head">
        <div className="notice-block-head">
          <h2 id="pn-head">Public Notices</h2>
          <span className="count-pill">{notices.length}</span>
        </div>
        {notices.length === 0 ? (
          <p className="empty-note">No public notices are posted right now. Check back soon.</p>
        ) : (
          <ul className="notice-list">
            {notices.map((n) => <NoticeRow key={n.id} item={n} />)}
          </ul>
        )}
      </section>

      {/* ---------- Bid Requests ---------- */}
      <section className="notice-block" aria-labelledby="bid-head">
        <div className="notice-block-head">
          <h2 id="bid-head">Bid Requests</h2>
          <span className="count-pill">{bids.length}</span>
        </div>
        {bids.length === 0 ? (
          <p className="empty-note">There are no current bid requests at this time.</p>
        ) : (
          <ul className="notice-list">
            {bids.map((b) => <NoticeRow key={b.id} item={b} isBid />)}
          </ul>
        )}
      </section>
    </div>
  );
}
