'use client';

import '../admin.css';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useToast } from '@/components/ClientEffects';
import Modal from '@/components/Modal';
import BulkUpload from '../dashboard/BulkUpload';
import { fmtMeetingDate, descriptorFromTitle, buildTitle } from '@/lib/minutes-format';

function yearOf(dateStr) {
  return (dateStr || '').slice(0, 4) || 'Undated';
}

function StatusBadge({ status }) {
  const map = {
    ready: { label: 'Summary ready', cls: 'sb-ready' },
    pending: { label: 'No summary', cls: 'sb-pending' },
    failed: { label: 'Summary failed', cls: 'sb-failed' },
  };
  const s = map[status] || map.pending;
  return <span className={`sum-badge ${s.cls}`}>{s.label}</span>;
}

export default function Dashboard() {
  const supabase = createClient();
  const toast = useToast();

  const [meetingDate, setMeetingDate] = useState('');
  const [isSpecial, setIsSpecial] = useState(false);   // special/organizational meeting
  const [specialLabel, setSpecialLabel] = useState('Special Called Meeting');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [minutes, setMinutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);   // record pending delete confirm
  const [busyId, setBusyId] = useState(null);        // record being regenerated
  const [mode, setMode] = useState('single');        // 'single' | 'bulk' upload
  const [expandedId, setExpandedId] = useState(null); // posted item showing its summary

  const loadMinutes = useCallback(async () => {
    const { data } = await supabase
      .from('minutes')
      .select('*')
      .order('meeting_date', { ascending: false });
    setMinutes(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { loadMinutes(); }, [loadMinutes]);

  // Group by year for a tidy, scannable list.
  const grouped = useMemo(() => {
    const g = {};
    for (const m of minutes) {
      const y = yearOf(m.meeting_date);
      (g[y] = g[y] || []).push(m);
    }
    return Object.entries(g).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [minutes]);

  async function handleUpload(e) {
    e.preventDefault();
    if (!file || !meetingDate) {
      toast('Missing info', 'Add a meeting date and PDF first.', 'error');
      return;
    }
    const descriptor = isSpecial ? specialLabel.trim() : '';
    const title = buildTitle(meetingDate, descriptor);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('meeting_date', meetingDate);
      fd.append('file', file);

      const res = await fetch('/api/admin/upload-minutes', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      if (data.summaryWarning) {
        toast('Uploaded (summary pending)', 'PDF saved. The AI summary didn\u2019t generate \u2014 use Regenerate to retry.', 'info');
      } else {
        toast('Uploaded', 'Minutes posted and summarized.', 'success');
      }
      setMeetingDate(''); setIsSpecial(false); setSpecialLabel('Special Called Meeting'); setFile(null);
      e.target.reset();
      loadMinutes();
    } catch (err) {
      toast('Upload error', err.message, 'error');
    } finally {
      setUploading(false);
    }
  }

  async function confirmDelete() {
    const m = toDelete;
    setToDelete(null);
    if (!m) return;
    try {
      await supabase.storage.from('minutes').remove([m.file_path]);
      const { error } = await supabase.from('minutes').delete().eq('id', m.id);
      if (error) throw error;
      toast('Deleted', `Removed \u201C${m.title}\u201D.`, 'success');
      loadMinutes();
    } catch (err) {
      toast('Delete failed', err.message || 'Could not delete.', 'error');
    }
  }

  async function regenerate(m) {
    setBusyId(m.id);
    try {
      const res = await fetch('/api/admin/regenerate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: m.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast('Summary updated', 'The summary has been rewritten.', 'success');
      loadMinutes();
    } catch (err) {
      toast('Summary failed', err.message, 'error');
    } finally {
      setBusyId(null);
    }
  }

  const readyCount = minutes.filter((m) => m.summary_status === 'ready').length;

  return (
    <div className="adminx-page">
      <header className="adminx-head">
        <h1>Council Minutes</h1>
        <p>Upload meeting minutes and manage AI summaries.</p>
      </header>
      <div className="admin-grid">
          {/* ---------- Upload panel ---------- */}
          <div className="panel">
            <h2>Upload Minutes</h2>
            <div className="upload-tabs" role="tablist" aria-label="Upload mode">
              <button
                role="tab"
                aria-selected={mode === 'single'}
                className={`upload-tab ${mode === 'single' ? 'active' : ''}`}
                onClick={() => setMode('single')}
              >Single</button>
              <button
                role="tab"
                aria-selected={mode === 'bulk'}
                className={`upload-tab ${mode === 'bulk' ? 'active' : ''}`}
                onClick={() => setMode('bulk')}
              >Bulk</button>
            </div>

            {mode === 'single' ? (
              <>
                <p className="panel-note">
                  Upload one PDF and we&rsquo;ll automatically generate a plain-language
                  summary for residents. The public listing shows the meeting date.
                </p>
                <form onSubmit={handleUpload}>
                  <div className="field">
                    <label htmlFor="d">Meeting date</label>
                    <input id="d" type="date" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} />
                  </div>
                  <div className="field">
                    <label className="check-row">
                      <input
                        type="checkbox"
                        checked={isSpecial}
                        onChange={(e) => setIsSpecial(e.target.checked)}
                      />
                      <span>Special or organizational meeting</span>
                    </label>
                    {isSpecial && (
                      <input
                        type="text"
                        value={specialLabel}
                        onChange={(e) => setSpecialLabel(e.target.value)}
                        placeholder="e.g. Special Called Meeting"
                        aria-label="Meeting label"
                        style={{ marginTop: '.5rem' }}
                      />
                    )}
                    <p className="panel-note" style={{ marginTop: '.4rem', marginBottom: 0 }}>
                      Leave unchecked for a regular meeting; it&rsquo;ll list as just the date.
                    </p>
                  </div>
                  <div className="field">
                    <label htmlFor="f">PDF file</label>
                    <input id="f" type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} />
                  </div>
                  <button className="btn btn-primary" type="submit" disabled={uploading} style={{ width: '100%' }}>
                    {uploading ? 'Uploading & summarizing\u2026' : 'Upload Minutes'}
                  </button>
                  {uploading && <p className="panel-note" style={{ marginTop: '.7rem' }}>Generating the AI summary can take a few seconds&hellip;</p>}
                </form>
              </>
            ) : (
              <>
                <p className="panel-note">
                  Drop several PDFs at once. We&rsquo;ll try to read the meeting date from
                  each filename. Check them, then upload. Each file is summarized in turn.
                </p>
                <BulkUpload onComplete={loadMinutes} />
              </>
            )}
          </div>

          {/* ---------- Posted minutes ---------- */}
          <div className="panel">
            <div className="panel-head">
              <h2>Posted Minutes</h2>
              <span className="count-pill">{minutes.length} total &middot; {readyCount} summarized</span>
            </div>

            {loading ? (
              <p className="muted-note">Loading&hellip;</p>
            ) : minutes.length === 0 ? (
              <p className="muted-note">Nothing posted yet.</p>
            ) : (
              <div className="year-groups">
                {grouped.map(([year, items]) => (
                  <div key={year} className="year-group">
                    <h3 className="year-label">{year} <span>{items.length}</span></h3>
                    <div className="admin-minutes">
                      {items.map((m) => {
                        const desc = descriptorFromTitle(m.title);
                        const isOpen = expandedId === m.id;
                        const decisions = Array.isArray(m.decisions) ? m.decisions : [];
                        const actions = Array.isArray(m.action_items) ? m.action_items : [];
                        const hasSummary = m.summary_status === 'ready' && m.summary;
                        return (
                          <div key={m.id} className={`am-item-wrap ${isOpen ? 'open' : ''}`}>
                            <div className="am-item">
                              <div className="am-main">
                                <strong>{fmtMeetingDate(m.meeting_date)}{desc ? `, ${desc}` : ''}</strong>
                                <div className="am-meta">
                                  <StatusBadge status={m.summary_status} />
                                </div>
                              </div>
                              <div className="am-actions">
                                <button
                                  className="am-btn"
                                  onClick={() => setExpandedId(isOpen ? null : m.id)}
                                  aria-expanded={isOpen}
                                >
                                  {isOpen ? 'Hide summary' : 'Show summary'}
                                </button>
                                <button className="am-del" onClick={() => setToDelete(m)}>Delete</button>
                              </div>
                            </div>

                            {isOpen && (
                              <div className="am-summary">
                                {hasSummary ? (
                                  <>
                                    <p className="am-sum-overview">{m.summary}</p>
                                    {decisions.length > 0 && (
                                      <div className="am-sum-block">
                                        <h5>Key decisions</h5>
                                        <ul>{decisions.map((d, i) => <li key={i}>{d}</li>)}</ul>
                                      </div>
                                    )}
                                    {actions.length > 0 && (
                                      <div className="am-sum-block">
                                        <h5>Action items &amp; next steps</h5>
                                        <ul>{actions.map((a, i) => <li key={i}>{a}</li>)}</ul>
                                      </div>
                                    )}
                                  </>
                                ) : (
                                  <p className="am-sum-overview am-sum-none">
                                    No summary yet for this meeting. Click &ldquo;Create summary&rdquo; to generate one from the PDF.
                                  </p>
                                )}
                                <div className="am-sum-foot">
                                  <span className="am-sum-hint">
                                    {hasSummary
                                      ? 'This is what residents see. If it looks wrong, redo it.'
                                      : ''}
                                  </span>
                                  <button
                                    className="am-btn am-redo"
                                    onClick={() => regenerate(m)}
                                    disabled={busyId === m.id}
                                    title="Re-read the PDF and rewrite the summary"
                                  >
                                    {busyId === m.id ? 'Working\u2026' : hasSummary ? 'Redo' : 'Create summary'}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
      </div>

      {/* ---------- Delete confirmation (real modal, no native confirm) ---------- */}
      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete these minutes?">
        <p style={{ color: 'var(--ink-2)', marginBottom: '1.4rem' }}>
          This permanently removes <strong>{toDelete?.title}</strong> ({toDelete?.meeting_date})
          and its PDF. This can&rsquo;t be undone.
        </p>
        <div className="modal-actions">
          <button className="btn btn-cancel" onClick={() => setToDelete(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={confirmDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}
