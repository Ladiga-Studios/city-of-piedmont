'use client';

// /admin/careers — post job openings. Upload the announcement (PDF or a
// picture of the flyer), the site reads it and drafts the overview in the
// same style as the Careers page, staff check it and post. Optionally a
// matching News article goes out too. Both come off the public site by
// themselves the day after the application deadline.

import '../admin.css';
import '../notices/notices-admin.css'; // shared list styles (.na-*)
import './careers-admin.css';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useToast } from '@/components/ClientEffects';
import Modal from '@/components/Modal';
import { DEPARTMENTS } from '@/lib/departments';
import { safeFilename, makeThumbnail as resizeImage } from '@/lib/drive';

const BUCKET = 'careers';
const DEPT_SUGGESTIONS = [
  ...DEPARTMENTS.map((d) => d.name),
  'Parks & Recreation', 'Clyde H. Pike Civic Center', 'Police Department', 'Fire Department', 'Aquatic Center',
];

const EMPTY = {
  id: null, title: '', department: '', deadline_date: '', deadline_text: '',
  summary: '', duties: '', pay: '', benefits: '', apply_text: '',
  file_url: '', file_path: '', file_kind: '', file_name: '',
  post_news: true, published: true,
};

function todayISO() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Chicago' });
}
function longDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}
function daysLeft(iso) {
  if (!iso) return 0;
  const [y, m, d] = iso.split('-').map(Number);
  const [ty, tm, td] = todayISO().split('-').map(Number);
  return Math.round((Date.UTC(y, m - 1, d) - Date.UTC(ty, tm - 1, td)) / 86400000);
}
function kindOf(file) {
  if (file.type === 'application/pdf' || /\.pdf$/i.test(file.name)) return 'pdf';
  if (/^image\/(jpeg|png|webp|gif)$/.test(file.type)) return 'image';
  return null;
}

export default function CareersAdmin() {
  const supabase = createClient();
  const toast = useToast();

  const [form, setForm] = useState(EMPTY);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableMissing, setTableMissing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reading, setReading] = useState(false);
  const [readNote, setReadNote] = useState('');
  const [dragging, setDragging] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const inputRef = useRef(null);
  const pendingUpload = useRef(null); // file_path uploaded but not saved (cleaned up if abandoned)

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const setInput = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('job_postings').select('*').order('deadline_date', { ascending: false });
    if (error) setTableMissing(true);
    else setItems(data || []);
    setLoading(false);
  }, [supabase]);
  useEffect(() => { load(); }, [load]);

  const open = useMemo(() => items.filter((j) => daysLeft(j.deadline_date) >= 0), [items]);
  const expired = useMemo(() => items.filter((j) => daysLeft(j.deadline_date) < 0), [items]);

  // ---------- announcement upload + AI read ----------
  async function handleFile(file) {
    if (!file) return;
    const kind = kindOf(file);
    if (!kind) { toast('Wrong file type', 'Upload a PDF, JPG, PNG, or WebP.', 'error'); return; }
    setUploading(true);
    setReadNote('');
    try {
      const year = new Date().getFullYear();
      const path = `${year}/${Date.now()}-${safeFilename(file.name)}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type || undefined, upsert: false });
      if (error) throw new Error(error.message);
      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);

      // Drop any earlier unsaved upload from this session.
      if (pendingUpload.current && pendingUpload.current !== form.file_path) {
        await supabase.storage.from(BUCKET).remove([pendingUpload.current]).catch(() => {});
      }
      pendingUpload.current = path;
      setForm((f) => ({ ...f, file_url: pub.publicUrl, file_path: path, file_kind: kind, file_name: file.name }));
      setUploading(false);

      // Big photos of a flyer: send a smaller copy to be read, keep the original for visitors.
      let readPath = path;
      let readMime = kind === 'pdf' ? 'application/pdf' : file.type;
      let tempPath = null;
      if (kind === 'image' && file.size > 1.5 * 1024 * 1024) {
        const small = await resizeImage(file, 2200).catch(() => null);
        if (small) {
          tempPath = `${path}-read.jpg`;
          const { error: tErr } = await supabase.storage.from(BUCKET).upload(tempPath, small.blob, { contentType: 'image/jpeg' });
          if (!tErr) { readPath = tempPath; readMime = 'image/jpeg'; } else { tempPath = null; }
        }
      }
      await readAnnouncement(readPath, readMime, file.name);
      if (tempPath) await supabase.storage.from(BUCKET).remove([tempPath]).catch(() => {});
    } catch (err) {
      setUploading(false);
      toast('Upload failed', err.message || 'Try again.', 'error');
    }
  }

  async function readAnnouncement(path, mime, filename) {
    setReading(true);
    try {
      const res = await fetch('/api/admin/analyze-job', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, mime, filename }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not read the announcement.');
      const d = data.draft;
      setForm((f) => ({
        ...f,
        title: d.title || f.title,
        department: d.department || f.department,
        deadline_date: d.deadline_date || f.deadline_date,
        deadline_text: d.deadline_text || f.deadline_text,
        summary: d.summary || f.summary,
        duties: d.duties?.length ? d.duties.join('\n') : f.duties,
        pay: d.pay || f.pay,
        benefits: d.benefits || f.benefits,
        apply_text: d.apply_text || f.apply_text,
      }));
      const missing = [!d.title && 'title', !d.deadline_date && 'deadline', !d.summary && 'overview'].filter(Boolean);
      setReadNote(missing.length
        ? `Filled in what the announcement states. It didn’t give a clear ${missing.join(', ')} — add that by hand.`
        : 'Filled in from the announcement. Check it over, then post.');
    } catch (err) {
      setReadNote('');
      toast('Couldn’t read it', err.message, 'error');
    } finally {
      setReading(false);
    }
  }

  function rereadCurrent() {
    if (!form.file_path) return;
    const mime = form.file_kind === 'pdf' ? 'application/pdf'
      : /\.png$/i.test(form.file_path) ? 'image/png' : /\.webp$/i.test(form.file_path) ? 'image/webp' : 'image/jpeg';
    readAnnouncement(form.file_path, mime, form.file_name);
  }

  // ---------- edit / reset ----------
  function startEdit(j) {
    setForm({
      id: j.id, title: j.title || '', department: j.department || '',
      deadline_date: j.deadline_date || '', deadline_text: j.deadline_text || '',
      summary: j.summary || '', duties: (j.duties || []).join('\n'),
      pay: j.pay || '', benefits: j.benefits || '', apply_text: j.apply_text || '',
      file_url: j.file_url || '', file_path: j.file_path || '', file_kind: j.file_kind || '',
      file_name: j.file_path ? j.file_path.split('/').pop().replace(/^\d+-/, '') : (j.file_url ? j.file_url.split('/').pop() : ''),
      post_news: !!j.news_id, published: j.published !== false,
    });
    pendingUpload.current = null;
    setReadNote('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function resetForm() {
    if (pendingUpload.current && !form.id) {
      await supabase.storage.from(BUCKET).remove([pendingUpload.current]).catch(() => {});
    }
    pendingUpload.current = null;
    setForm(EMPTY);
    setReadNote('');
  }

  // ---------- save / delete ----------
  async function handleSave(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.summary.trim() || !form.deadline_date) {
      toast('Missing info', 'A title, an overview, and a deadline date are required.', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        duties: form.duties.split('\n').map((s) => s.replace(/^[-•*]\s*/, '').trim()).filter(Boolean),
      };
      const res = await fetch('/api/admin/save-job', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      pendingUpload.current = null;
      const left = daysLeft(form.deadline_date);
      toast(
        form.id ? 'Saved' : 'Posted',
        left < 0 ? 'The deadline has already passed, so it’s only visible here.'
          : `On the Careers page${form.post_news ? ' and in News' : ''} until ${longDate(form.deadline_date)}.`,
        'success'
      );
      if (data.newsWarning) toast('Heads up', data.newsWarning, 'error');
      setForm(EMPTY); setReadNote('');
      load();
    } catch (err) {
      toast('Save failed', err.message || 'Try again.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    const j = toDelete;
    setToDelete(null);
    if (!j) return;
    try {
      const res = await fetch('/api/admin/save-job', {
        method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: j.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      if (form.id === j.id) setForm(EMPTY);
      toast('Deleted', `“${j.title}” is gone from Careers${j.news_id ? ' and News' : ''}.`, 'success');
      load();
    } catch (err) {
      toast('Delete failed', err.message, 'error');
    }
  }

  const busy = uploading || reading;

  return (
    <div className="adminx-page">
      <header className="adminx-head">
        <h1>Careers</h1>
        <p>
          Post a job opening. Upload the announcement and the site drafts the overview for you to check.
          Postings come off the Careers page (and News) by themselves the day after the deadline.
        </p>
      </header>

      {tableMissing && (
        <div className="ca-setup">
          <strong>One-time setup needed.</strong> Run <code>supabase-careers.sql</code> in the Supabase SQL
          editor, then reload this page.
        </div>
      )}

      <div className="admin-grid">
        {/* ---------- Form ---------- */}
        <div className="panel">
          <div className="panel-head">
            <h2>{form.id ? 'Edit posting' : 'Post a job'}</h2>
            {form.id && <button type="button" className="ca-clear" onClick={resetForm}>+ New posting instead</button>}
          </div>

          <form onSubmit={handleSave}>
            {/* 1. Announcement */}
            <div className="field">
              <label>Job announcement</label>
              {form.file_url ? (
                <div className="ca-file">
                  <span className="ca-file-ico" aria-hidden="true">
                    {form.file_kind === 'pdf'
                      ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M14 3v5h5M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zM9 13h6M9 17h6" /></svg>
                      : <img src={form.file_url} alt="" />}
                  </span>
                  <span className="ca-file-main">
                    <strong>{form.file_name || 'Announcement'}</strong>
                    <small>
                      <a href={form.file_url} target="_blank" rel="noopener noreferrer">Open</a>
                      {' · '}
                      <button type="button" onClick={() => inputRef.current?.click()} disabled={busy}>Replace</button>
                      {' · '}
                      <button type="button" onClick={rereadCurrent} disabled={busy}>{reading ? 'Reading…' : 'Read it again'}</button>
                    </small>
                  </span>
                </div>
              ) : (
                <div
                  className={`bulk-drop ${dragging ? 'drag' : ''} ${busy ? 'disabled' : ''}`}
                  role="button" tabIndex={0}
                  onClick={() => inputRef.current?.click()}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }}
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer?.files?.[0]); }}
                >
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
                    <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                  </svg>
                  <strong>{uploading ? 'Uploading…' : 'Drop the announcement here or click to choose'}</strong>
                  <small>PDF, or a photo/scan of the flyer (JPG, PNG). The overview below fills in automatically.</small>
                </div>
              )}
              <input
                ref={inputRef} type="file" hidden accept=".pdf,image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ''; }}
              />
              {(reading || readNote) && (
                <p className={`ca-read ${reading ? 'busy' : ''}`} role="status">
                  {reading ? 'Reading the announcement…' : readNote}
                </p>
              )}
            </div>

            {/* 2. Details */}
            <div className="field">
              <label htmlFor="j-title">Job title</label>
              <input id="j-title" type="text" value={form.title} onChange={setInput('title')} placeholder="e.g. Recreation Coordinator" />
            </div>
            <div className="field">
              <label htmlFor="j-dept">Department <span className="opt">(optional)</span></label>
              <input id="j-dept" type="text" list="j-dept-list" value={form.department} onChange={setInput('department')} placeholder="e.g. Parks & Recreation" />
              <datalist id="j-dept-list">{DEPT_SUGGESTIONS.map((d) => <option key={d} value={d} />)}</datalist>
            </div>
            <div className="ca-two ca-deadline">
              <div className="field">
                <label htmlFor="j-deadline">Last day to apply</label>
                <input id="j-deadline" type="date" value={form.deadline_date} onChange={setInput('deadline_date')} />
                <span className="field-help">Comes off the site the morning after this date.</span>
              </div>
              <div className="field">
                <label htmlFor="j-deadline-text">Deadline as shown <span className="opt">(optional)</span></label>
                <input id="j-deadline-text" type="text" value={form.deadline_text} onChange={setInput('deadline_text')} placeholder="Friday, September 4, 2026 at 5:00 PM" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="j-summary">Overview</label>
              <textarea id="j-summary" rows={4} value={form.summary} onChange={setInput('summary')} placeholder="2–3 sentences on what the job is day to day." />
            </div>
            <div className="field">
              <label htmlFor="j-duties">What they&rsquo;ll do <span className="opt">(one per line)</span></label>
              <textarea id="j-duties" rows={5} value={form.duties} onChange={setInput('duties')} placeholder={'Organize and schedule league sports\nManage registrations and rosters'} />
            </div>
            <div>
              <div className="field">
                <label htmlFor="j-pay">Pay <span className="opt">(optional)</span></label>
                <input id="j-pay" type="text" value={form.pay} onChange={setInput('pay')} placeholder="$18.50/hour" />
              </div>
              <div className="field">
                <label htmlFor="j-benefits">Benefits <span className="opt">(optional)</span></label>
                <input id="j-benefits" type="text" value={form.benefits} onChange={setInput('benefits')} placeholder="RSA retirement; BC/BS health, dental, vision" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="j-apply">How to apply</label>
              <textarea id="j-apply" rows={2} value={form.apply_text} onChange={setInput('apply_text')} placeholder="Apply in person at City Hall, 109 N Center Ave, or email …" />
              <span className="field-help">Email addresses and web links become clickable on the page.</span>
            </div>

            <div className="field">
              <label className="check-row">
                <input type="checkbox" checked={form.post_news} onChange={(e) => set('post_news')(e.target.checked)} />
                Also post a &ldquo;Now Hiring&rdquo; article to News
              </label>
              <span className="field-help">Same deadline, so it disappears with the posting. Unchecking on an existing posting removes the article.</span>
            </div>
            <div className="field">
              <label className="check-row">
                <input type="checkbox" checked={form.published} onChange={(e) => set('published')(e.target.checked)} />
                Show on the site
              </label>
            </div>

            <button className="btn btn-primary" type="submit" disabled={saving || busy} style={{ width: '100%' }}>
              {saving ? 'Saving…' : form.id ? 'Save changes' : 'Post opening'}
            </button>
          </form>
        </div>

        {/* ---------- List ---------- */}
        <div className="panel">
          <div className="panel-head">
            <h2>Postings</h2>
            <span className="count-pill">{open.length} open</span>
          </div>

          {loading ? (
            <p className="muted-note">Loading&hellip;</p>
          ) : items.length === 0 ? (
            <p className="muted-note">
              {tableMissing ? 'Run the setup SQL to get started.' : 'No postings yet. Upload an announcement on the left.'}
            </p>
          ) : (
            <div className="na-groups">
              <JobGroup heading="Open" rows={open} onEdit={startEdit} onDelete={setToDelete} />
              <JobGroup heading="Expired — hidden from the site" rows={expired} onEdit={startEdit} onDelete={setToDelete} muted />
            </div>
          )}
        </div>
      </div>

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete this posting?">
        <p style={{ color: 'var(--ink-2)', marginBottom: '1.4rem' }}>
          <strong>{toDelete?.title}</strong> is removed from the Careers page{toDelete?.news_id ? ', its News article is deleted,' : ''} and the
          announcement file is deleted. This can&rsquo;t be undone.
        </p>
        <div className="modal-actions">
          <button className="btn btn-cancel" onClick={() => setToDelete(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={confirmDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}

function JobGroup({ heading, rows, onEdit, onDelete, muted }) {
  if (!rows.length) return null;
  return (
    <div className="na-group">
      <h3 className="na-group-label">{heading} <span>{rows.length}</span></h3>
      <div className="na-items">
        {rows.map((j) => {
          const left = daysLeft(j.deadline_date);
          return (
            <div key={j.id} className={`na-item ${muted ? 'ca-muted' : ''}`}>
              <div className="na-main">
                <strong>{j.title}</strong>
                <div className="na-meta">
                  {j.department && <span>{j.department}</span>}
                  <span>Apply by {longDate(j.deadline_date)}</span>
                  {!muted && (
                    <span className={`ca-tag ${left <= 3 ? 'soon' : 'open'}`}>
                      {left === 0 ? 'Last day' : left === 1 ? '1 day left' : `${left} days left`}
                    </span>
                  )}
                  {muted && <span className="ca-tag closed">Expired</span>}
                  {!j.published && <span className="ca-tag closed">Hidden</span>}
                  {j.news_id && <span className="ca-tag news">In News</span>}
                </div>
              </div>
              <div className="na-actions">
                {j.file_url && <a className="na-btn" href={j.file_url} target="_blank" rel="noopener noreferrer">View</a>}
                <button className="na-btn" onClick={() => onEdit(j)}>Edit</button>
                <button className="am-del" onClick={() => onDelete(j)}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
