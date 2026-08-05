'use client';

import '../admin.css';
import './notices-admin.css';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useToast } from '@/components/ClientEffects';
import Modal from '@/components/Modal';
import { fmtNoticeDate, isBidClosed } from '@/lib/notices-format';

const BUCKET = 'notices-files';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function NoticesAdmin() {
  const supabase = createClient();
  const toast = useToast();

  // form state
  const [category, setCategory] = useState('notice'); // 'notice' | 'bid'
  const [title, setTitle] = useState('');
  const [postedDate, setPostedDate] = useState(todayISO());
  const [closesDate, setClosesDate] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // list state
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('public_notices')
      .select('*')
      .order('posted_date', { ascending: false });
    setItems(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const notices = useMemo(() => items.filter((i) => i.category !== 'bid'), [items]);
  const bids = useMemo(() => items.filter((i) => i.category === 'bid'), [items]);

  function resetForm(formEl) {
    setTitle(''); setPostedDate(todayISO()); setClosesDate(''); setFile(null);
    formEl?.reset();
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!title.trim() || !postedDate || !file) {
      toast('Missing info', 'Add a title, posted date, and PDF first.', 'error');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('title', title.trim());
      fd.append('category', category);
      fd.append('posted_date', postedDate);
      if (category === 'bid' && closesDate) fd.append('closes_date', closesDate);
      fd.append('file', file);

      const res = await fetch('/api/admin/upload-notice', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      toast('Posted', `${category === 'bid' ? 'Bid request' : 'Notice'} is now live.`, 'success');
      resetForm(e.target);
      load();
    } catch (err) {
      toast('Upload error', err.message, 'error');
    } finally {
      setUploading(false);
    }
  }

  async function confirmDelete() {
    const n = toDelete;
    setToDelete(null);
    if (!n) return;
    try {
      // Only remove from Storage if it actually lives in our bucket
      // (seeded items point at external piedmontcity.org URLs).
      if (n.file_path && !n.file_path.startsWith('external/')) {
        await supabase.storage.from(BUCKET).remove([n.file_path]);
      }
      const { error } = await supabase.from('public_notices').delete().eq('id', n.id);
      if (error) throw error;
      toast('Deleted', `Removed \u201C${n.title}\u201D.`, 'success');
      load();
    } catch (err) {
      toast('Delete failed', err.message || 'Could not delete.', 'error');
    }
  }

  return (
    <div className="adminx-page">
      <header className="adminx-head">
        <h1>Public Notices &amp; Bids</h1>
        <p>Upload ordinances, legal notices, and bid requests as PDFs. They appear on the public Notices &amp; Bids page automatically.</p>
      </header>

      <div className="admin-grid">
        {/* ---------- Upload panel ---------- */}
        <div className="panel">
          <h2>Add a Notice or Bid</h2>

          <div className="upload-tabs" role="tablist" aria-label="What are you posting?">
            <button
              role="tab"
              aria-selected={category === 'notice'}
              className={`upload-tab ${category === 'notice' ? 'active' : ''}`}
              onClick={() => setCategory('notice')}
            >Public Notice</button>
            <button
              role="tab"
              aria-selected={category === 'bid'}
              className={`upload-tab ${category === 'bid' ? 'active' : ''}`}
              onClick={() => setCategory('bid')}
            >Bid Request</button>
          </div>

          <p className="panel-note">
            {category === 'bid'
              ? 'Upload a bid request PDF. Optionally add a closing date so residents and vendors see the deadline.'
              : 'Upload an ordinance, legal notice, or announcement as a PDF. The posted date is shown to the public.'}
          </p>

          <form onSubmit={handleUpload}>
            <div className="field">
              <label htmlFor="n-title">Title</label>
              <input
                id="n-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={category === 'bid'
                  ? 'e.g. Bid Request - Center Ave Paving'
                  : 'e.g. Ordinance 641 - Noise Control'}
              />
            </div>

            <div className="field">
              <label htmlFor="n-posted">Posted date</label>
              <input id="n-posted" type="date" value={postedDate} onChange={(e) => setPostedDate(e.target.value)} />
            </div>

            {category === 'bid' && (
              <div className="field">
                <label htmlFor="n-closes">Closing date <span className="opt">(optional)</span></label>
                <input id="n-closes" type="date" value={closesDate} onChange={(e) => setClosesDate(e.target.value)} />
                <p className="panel-note" style={{ marginTop: '.4rem', marginBottom: 0 }}>
                  Leave blank if the bid has no fixed deadline.
                </p>
              </div>
            )}

            <div className="field">
              <label htmlFor="n-file">PDF file</label>
              <input id="n-file" type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} />
            </div>

            <button className="btn btn-primary" type="submit" disabled={uploading} style={{ width: '100%' }}>
              {uploading ? 'Uploading\u2026' : `Post ${category === 'bid' ? 'Bid Request' : 'Notice'}`}
            </button>
          </form>
        </div>

        {/* ---------- Posted list ---------- */}
        <div className="panel">
          <div className="panel-head">
            <h2>Posted</h2>
            <span className="count-pill">{notices.length} notices &middot; {bids.length} bids</span>
          </div>

          {loading ? (
            <p className="muted-note">Loading&hellip;</p>
          ) : items.length === 0 ? (
            <p className="muted-note">Nothing posted yet.</p>
          ) : (
            <div className="na-groups">
              <NaGroup
                heading="Public Notices"
                rows={notices}
                onDelete={setToDelete}
              />
              <NaGroup
                heading="Bid Requests"
                rows={bids}
                isBid
                onDelete={setToDelete}
              />
            </div>
          )}
        </div>
      </div>

      {/* ---------- Delete confirmation (custom modal, no native confirm) ---------- */}
      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete this item?">
        <p style={{ color: 'var(--ink-2)', marginBottom: '1.4rem' }}>
          This permanently removes <strong>{toDelete?.title}</strong>
          {toDelete?.file_path?.startsWith('external/')
            ? ' from the list (the original PDF on piedmontcity.org is left untouched).'
            : ' and its PDF.'}{' '}
          This can&rsquo;t be undone.
        </p>
        <div className="modal-actions">
          <button className="btn btn-cancel" onClick={() => setToDelete(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={confirmDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}

function NaGroup({ heading, rows, isBid, onDelete }) {
  if (rows.length === 0) {
    return (
      <div className="na-group">
        <h3 className="na-group-label">{heading} <span>0</span></h3>
        <p className="muted-note" style={{ fontSize: '.9rem' }}>None posted.</p>
      </div>
    );
  }
  return (
    <div className="na-group">
      <h3 className="na-group-label">{heading} <span>{rows.length}</span></h3>
      <div className="na-items">
        {rows.map((n) => {
          const closed = isBid && isBidClosed(n.closes_date);
          return (
            <div key={n.id} className="na-item">
              <div className="na-main">
                <strong>{n.title}</strong>
                <div className="na-meta">
                  <span>{fmtNoticeDate(n.posted_date)}</span>
                  {isBid && n.closes_date && (
                    <span className={`na-tag ${closed ? 'closed' : 'open'}`}>
                      {closed ? 'Closed' : 'Closes'} {fmtNoticeDate(n.closes_date)}
                    </span>
                  )}
                  {n.file_path?.startsWith('external/') && (
                    <span className="na-tag ext">External PDF</span>
                  )}
                </div>
              </div>
              <div className="na-actions">
                <a className="na-btn" href={n.file_url} target="_blank" rel="noopener noreferrer">View PDF</a>
                <button className="am-del" onClick={() => onDelete(n)}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
