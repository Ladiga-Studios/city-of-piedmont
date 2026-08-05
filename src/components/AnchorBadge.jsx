'use client';

// ============================================================
// AnchorBadge - "Filed in the permanent record"
//
// Shown on records that have been anchored. Leads with the plain-
// language promise; the technical proof (fingerprint, commit id,
// settlement transaction) sits one click deep for anyone who wants
// to verify. Renders nothing for unanchored records, so the page
// looks identical when anchoring is off.
// ============================================================

import { useState } from 'react';
import Link from 'next/link';

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return isNaN(d) ? '' : d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function shortHash(h, n = 10) {
  return h && h.length > n * 2 ? `${h.slice(0, n)}…${h.slice(-n)}` : h;
}

export default function AnchorBadge({ record }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!record || record.anchor_status !== 'anchored') return null;

  async function copyHash() {
    try {
      await navigator.clipboard.writeText(record.sha256);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard unavailable - no-op */ }
  }

  return (
    <div className="anchor-badge">
      <button
        type="button"
        className="anchor-badge-line"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
        <span>Filed in the permanent record{record.anchored_at ? ` · ${fmtDate(record.anchored_at)}` : ''}</span>
        <svg
          className={`anchor-caret ${open ? 'open' : ''}`}
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <p className="anchor-credit">
        Preserved in the permanent public record using{' '}
        <a href="https://www.fangorn.network/" target="_blank" rel="noopener noreferrer">Fangorn</a>,
        an open-source verification network.
      </p>

      {open && (
        <div className="anchor-badge-detail">
          <p className="anchor-explain">
            When this document was posted, the city recorded its digital fingerprint in a
            public archive that no one, including the city, can quietly alter. If the
            file ever changed, its fingerprint would no longer match.{' '}
            <Link href="/government/records">How this works</Link>
          </p>
          <dl className="anchor-facts">
            {record.sha256 && (
              <>
                <dt>Fingerprint (SHA-256)</dt>
                <dd>
                  <code>{shortHash(record.sha256)}</code>
                  <button type="button" className="anchor-copy" onClick={copyHash}>
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </dd>
              </>
            )}
            {record.anchor_commit_cid && (
              <>
                <dt>Archive entry</dt>
                <dd><code>{shortHash(record.anchor_commit_cid)}</code></dd>
              </>
            )}
            {record.anchor_tx && (
              <>
                <dt>Public ledger entry</dt>
                <dd>
                  <a
                    href={`https://sepolia.arbiscan.io/tx/${record.anchor_tx}`}
                    target="_blank" rel="noopener noreferrer"
                  >
                    View settlement record ↗
                  </a>
                </dd>
              </>
            )}
          </dl>
        </div>
      )}
    </div>
  );
}
