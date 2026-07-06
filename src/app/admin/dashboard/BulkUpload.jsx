'use client';

import { useState, useRef } from 'react';
import { useToast } from '@/components/ClientEffects';
import { buildTitle, fmtMeetingDate } from '@/lib/minutes-format';

const MONTHS = {
  jan:'01',feb:'02',mar:'03',apr:'04',may:'05',jun:'06',
  jul:'07',aug:'08',sep:'09',oct:'10',nov:'11',dec:'12',
};

// Try to pull an ISO date (YYYY-MM-DD) out of a filename.
// Handles "2026-04-07-...", "2026_04_07...", "April-7-2026...", "4-21-2026..."
function guessDate(name) {
  const base = name.replace(/\.pdf$/i, '');
  // 2026-04-07 or 2026_04_07 or 2026/04/07
  let m = base.match(/(20\d{2})[-_/](\d{1,2})[-_/](\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`;
  // Month name + day + year, e.g. "April-7-2026" or "April 7, 2026"
  m = base.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*[-_ ]*(\d{1,2})[,\-_ ]+(20\d{2})/i);
  if (m) return `${m[3]}-${MONTHS[m[1].toLowerCase()]}-${m[2].padStart(2,'0')}`;
  // US M-D-Y, e.g. "4-21-2026"
  m = base.match(/(\d{1,2})[-_/](\d{1,2})[-_/](20\d{2})/);
  if (m) return `${m[3]}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`;
  return '';
}

// Guess a descriptor from the filename if it mentions a special/organizational meeting.
function guessDescriptor(name) {
  const n = name.toLowerCase();
  if (/organizational/.test(n)) return 'Organizational Meeting';
  if (/special[-_ ]*called/.test(n)) return 'Special Called Meeting';
  if (/special/.test(n)) return 'Special Meeting';
  return '';
}

export default function BulkUpload({ onComplete }) {
  const toast = useToast();
  const inputRef = useRef(null);
  const [items, setItems] = useState([]);     // {id,file,title,date,status,note}
  const [running, setRunning] = useState(false);

  function addFiles(fileList) {
    const pdfs = Array.from(fileList).filter(
      (f) => f.type === 'application/pdf' || /\.pdf$/i.test(f.name)
    );
    if (pdfs.length === 0) {
      toast('No PDFs', 'Drop PDF files only.', 'error');
      return;
    }
    const next = pdfs.map((f) => {
      const date = guessDate(f.name);
      const descriptor = guessDescriptor(f.name);
      return {
        id: Math.random().toString(36).slice(2),
        file: f,
        date,
        descriptor,
        status: date ? 'ready' : 'needs-date',
        note: '',
      };
    });
    setItems((prev) => [...prev, ...next]);
  }

  function onDrop(e) {
    e.preventDefault();
    if (running) return;
    addFiles(e.dataTransfer.files);
  }

  function update(id, patch) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  }
  function removeItem(id) {
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  const allHaveDates = items.length > 0 && items.every((it) => it.date);

  async function runQueue() {
    if (!allHaveDates) {
      toast('Missing info', 'Every file needs a meeting date before uploading.', 'error');
      return;
    }
    setRunning(true);
    let ok = 0, failed = 0;

    for (const it of items) {
      // Skip ones already done from a prior partial run.
      if (it.status === 'done') continue;
      update(it.id, { status: 'uploading', note: '' });
      try {
        const fd = new FormData();
        fd.append('title', buildTitle(it.date, it.descriptor));
        fd.append('meeting_date', it.date);
        fd.append('file', it.file);

        const res = await fetch('/api/admin/upload-minutes', { method: 'POST', body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Upload failed');

        if (data.summaryWarning) {
          update(it.id, { status: 'done', note: 'Posted; summary failed, regenerate later' });
        } else {
          update(it.id, { status: 'done', note: 'Posted & summarized' });
        }
        ok++;
      } catch (err) {
        update(it.id, { status: 'error', note: err.message });
        failed++;
      }
    }

    setRunning(false);
    toast(
      failed ? 'Finished with errors' : 'All uploaded',
      `${ok} uploaded${failed ? `, ${failed} failed` : ''}.`,
      failed ? 'info' : 'success'
    );
    onComplete?.();
  }

  const doneCount = items.filter((it) => it.status === 'done').length;

  return (
    <div className="bulk">
      <div
        className={`bulk-drop ${running ? 'disabled' : ''}`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => !running && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !running) inputRef.current?.click(); }}
        aria-label="Add PDF files"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M12 16V4m0 0L8 8m4-4l4 4M4 20h16" />
        </svg>
        <span><strong>Drop PDFs here</strong> or click to choose</span>
        <small>Each file is uploaded and summarized one at a time.</small>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          hidden
          onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
        />
      </div>

      {items.length > 0 && (
        <>
          <div className="bulk-list">
            {items.map((it) => (
              <div key={it.id} className={`bulk-row st-${it.status}`}>
                <div className="bulk-row-main">
                  <div className="bulk-fname" title={it.file.name}>{it.file.name}</div>
                  <div className="bulk-fields">
                    <input
                      type="date"
                      value={it.date}
                      disabled={running}
                      onChange={(e) => update(it.id, {
                        date: e.target.value,
                        status: e.target.value ? (it.status === 'needs-date' ? 'ready' : it.status) : 'needs-date',
                      })}
                      aria-label={`Meeting date for ${it.file.name}`}
                    />
                    <label className="bulk-special">
                      <input
                        type="checkbox"
                        checked={!!it.descriptor}
                        disabled={running}
                        onChange={(e) => update(it.id, { descriptor: e.target.checked ? 'Special Called Meeting' : '' })}
                      />
                      <span>Special / organizational</span>
                    </label>
                  </div>
                  {it.descriptor && !running && (
                    <input
                      type="text"
                      className="bulk-desc-input"
                      value={it.descriptor}
                      placeholder="e.g. Special Called Meeting"
                      onChange={(e) => update(it.id, { descriptor: e.target.value })}
                      aria-label={`Meeting label for ${it.file.name}`}
                    />
                  )}
                  <div className="bulk-preview">
                    Will post as: <strong>{it.date ? fmtMeetingDate(it.date) : '(set a date)'}{it.descriptor ? `, ${it.descriptor}` : ''}</strong>
                  </div>
                  {it.note && <div className="bulk-note">{it.note}</div>}
                </div>
                <div className="bulk-status">
                  <BulkStatus status={it.status} />
                  {!running && it.status !== 'done' && (
                    <button className="bulk-x" onClick={() => removeItem(it.id)} aria-label="Remove">×</button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bulk-actions">
            <span className="bulk-count">
              {items.length} file{items.length !== 1 ? 's' : ''}
              {doneCount > 0 && ` · ${doneCount} done`}
            </span>
            <button
              className="btn btn-primary"
              onClick={runQueue}
              disabled={running || !allHaveDates}
            >
              {running ? 'Uploading…' : `Upload ${items.length} file${items.length !== 1 ? 's' : ''}`}
            </button>
          </div>
          {!allHaveDates && !running && (
            <p className="panel-note" style={{ marginTop: '.5rem' }}>
              Fill in a date and title for every file to enable upload.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function BulkStatus({ status }) {
  const map = {
    'ready':      { t: 'Ready',     c: 'st-ready' },
    'needs-date': { t: 'Need date', c: 'st-needs' },
    'uploading':  { t: 'Working…',  c: 'st-working' },
    'done':       { t: 'Done',      c: 'st-done' },
    'error':      { t: 'Failed',    c: 'st-err' },
  };
  const s = map[status] || map.ready;
  return <span className={`bulk-pill ${s.c}`}>{s.t}</span>;
}
