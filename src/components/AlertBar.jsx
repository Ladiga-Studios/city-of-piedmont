'use client';

import { useState, useEffect } from 'react';

const STYLES = {
  emergency: { cls: 'ab-emergency', label: 'Emergency' },
  advisory:  { cls: 'ab-advisory',  label: 'Advisory' },
  info:      { cls: 'ab-info',      label: 'Notice' },
};

export default function AlertBar({ alerts }) {
  // Track which alerts the visitor has dismissed (this session only).
  const [dismissed, setDismissed] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  if (!alerts || alerts.length === 0) return null;

  const visible = alerts.filter((a) => !dismissed.includes(a.id));
  if (visible.length === 0) return null;

  // Show the highest-severity active alert (emergency > advisory > info).
  const order = { emergency: 0, advisory: 1, info: 2 };
  const a = [...visible].sort((x, y) => (order[x.severity] ?? 9) - (order[y.severity] ?? 9))[0];
  const style = STYLES[a.severity] || STYLES.info;

  return (
    <div className={`alert-bar ${style.cls}`} role="alert" suppressHydrationWarning>
      <div className="container ab-inner">
        <span className="ab-tag" aria-hidden="true">{style.label}</span>
        <span className="ab-msg">
          <strong>{a.title}</strong>
          {a.body ? <span className="ab-body">: {a.body}</span> : null}
          {a.link_url ? (
            <a className="ab-link" href={a.link_url} target="_blank" rel="noopener noreferrer">
              {a.link_label || 'More info'} →
            </a>
          ) : null}
        </span>
        <button
          className="ab-close"
          aria-label="Dismiss this alert"
          onClick={() => setDismissed((d) => [...d, a.id])}
        >
          ×
        </button>
      </div>
    </div>
  );
}
