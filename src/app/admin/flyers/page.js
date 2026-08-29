'use client';

import '../admin.css';
import './flyers-admin.css';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useToast } from '@/components/ClientEffects';
import Modal from '@/components/Modal';

const BLANK = {
  title: '', caption: '', image_url: '', image_width: null, image_height: null,
  link_url: '', link_label: 'View flyer', active: true,
};

// How many active flyers the homepage shows (newest first).
const HOMEPAGE_LIMIT = 3;

export default function FlyersAdmin() {
  const supabase = createClient();
  const toast = useToast();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // 'new' | id | null
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const imgInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from('flyers').select('*').order('created_at', { ascending: false });
    setList(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  function startNew() { setEditing('new'); setForm(BLANK); }
  function startEdit(f) {
    setEditing(f.id);
    setForm({
      title: f.title || '',
      caption: f.caption || '',
      image_url: f.image_url || '',
      image_width: f.image_width || null,
      image_height: f.image_height || null,
      link_url: f.link_url || '',
      link_label: f.link_label || 'View flyer',
      active: f.active !== false,
    });
  }
  function cancel() { setEditing(null); setForm(BLANK); }
  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  // Read pixel dimensions in the browser so the homepage can reserve
  // space for the image (no layout shift).
  function readDimensions(file) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { resolve({ w: img.naturalWidth, h: img.naturalHeight }); URL.revokeObjectURL(url); };
      img.onerror = () => { resolve({ w: null, h: null }); URL.revokeObjectURL(url); };
      img.src = url;
    });
  }

  async function uploadAsset(file, kind) {
    const data = new FormData();
    data.append('file', file);
    data.append('kind', kind);
    const res = await fetch('/api/admin/upload-flyer', { method: 'POST', body: data });
    const out = await res.json();
    if (!res.ok) throw new Error(out.error || 'Upload failed');
    return out.url;
  }

  async function onImagePick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const [{ w, h }, url] = await Promise.all([readDimensions(file), uploadAsset(file, 'image')]);
      setForm((f) => ({ ...f, image_url: url, image_width: w, image_height: h }));
      toast('Image uploaded', 'The flyer preview is ready.', 'success');
    } catch (err) {
      toast('Upload failed', err.message, 'error');
    } finally {
      setUploading(false);
      if (imgInputRef.current) imgInputRef.current.value = '';
    }
  }

  async function onPdfPick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadAsset(file, 'pdf');
      setForm((f) => ({ ...f, link_url: url, link_label: f.link_label || 'View flyer' }));
      toast('PDF uploaded', 'The flyer now links to this PDF.', 'success');
    } catch (err) {
      toast('Upload failed', err.message, 'error');
    } finally {
      setUploading(false);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  }

  async function save(ev) {
    ev.preventDefault();
    if (!form.title.trim()) { toast('Missing info', 'Give the flyer a title.', 'error'); return; }
    if (!form.image_url) { toast('Missing image', 'Upload the flyer image first.', 'error'); return; }
    setSaving(true);
    try {
      const payload = { ...form };
      if (editing && editing !== 'new') payload.id = editing;
      const res = await fetch('/api/admin/save-flyer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      toast('Saved', `Flyer ${editing === 'new' ? 'posted' : 'updated'}.`, 'success');
      cancel();
      load();
    } catch (err) {
      toast('Save failed', err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(f) {
    try {
      const res = await fetch('/api/admin/save-flyer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...f, active: !f.active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      toast(f.active ? 'Taken down' : 'Posted', `\u201C${f.title}\u201D is now ${f.active ? 'hidden' : 'live-eligible'}.`, 'success');
      load();
    } catch (err) {
      toast('Update failed', err.message, 'error');
    }
  }

  async function confirmDelete() {
    const f = toDelete;
    setToDelete(null);
    if (!f) return;
    try {
      const res = await fetch('/api/admin/save-flyer', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: f.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      toast('Deleted', `Removed \u201C${f.title}\u201D.`, 'success');
      load();
    } catch (err) {
      toast('Delete failed', err.message, 'error');
    }
  }

  // The homepage shows the newest HOMEPAGE_LIMIT active flyers.
  const liveIds = new Set(list.filter((f) => f.active).slice(0, HOMEPAGE_LIMIT).map((f) => f.id));

  return (
    <div className="adminx-page">
      <header className="adminx-head">
        <h1>Bulletin Board</h1>
        <p>
          Flyers shown in the &ldquo;On the Bulletin Board&rdquo; section of the homepage.
          The <strong>{HOMEPAGE_LIMIT} newest active flyers</strong> are shown; anything older
          stays here until you need it again. Switch a flyer off to take it down without deleting it.
        </p>
      </header>

      <div className="admin-grid">
        {/* form */}
        <div className="panel">
          <div className="panel-head">
            <h2>{editing && editing !== 'new' ? 'Edit Flyer' : 'Post a Flyer'}</h2>
            {editing && <button className="am-btn" onClick={cancel}>Cancel</button>}
          </div>

          {!editing ? (
            <>
              <p className="panel-note">Post a new flyer, or pick one from the list to edit.</p>
              <button className="btn btn-primary" onClick={startNew} style={{ width: '100%' }}>New Flyer</button>
            </>
          ) : (
            <form onSubmit={save}>
              <div className="field">
                <label htmlFor="f-title">Title</label>
                <input id="f-title" type="text" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Christmas Parade" />
              </div>

              <div className="field">
                <label htmlFor="f-caption">Caption <span className="opt">(one line)</span></label>
                <input id="f-caption" type="text" value={form.caption} onChange={(e) => set('caption', e.target.value)} placeholder="e.g. Dec 12 · 6:00 PM · Center Ave" />
              </div>

              <div className="field">
                <label htmlFor="f-image">Flyer image</label>
                <input id="f-image" ref={imgInputRef} type="file" accept="image/*" onChange={onImagePick} disabled={uploading} />
                <span className="fa-hint">A picture of the flyer (JPG/PNG, up to 8 MB). A phone screenshot of the PDF works.</span>
                {form.image_url && (
                  <img src={form.image_url} alt="Flyer preview" className="fa-preview" />
                )}
              </div>

              <div className="field">
                <label htmlFor="f-pdf">Flyer PDF <span className="opt">(optional)</span></label>
                <input id="f-pdf" ref={pdfInputRef} type="file" accept="application/pdf" onChange={onPdfPick} disabled={uploading} />
                <span className="fa-hint">Uploading a PDF sets the link below to it automatically.</span>
              </div>

              <div className="field">
                <label htmlFor="f-link">Link <span className="opt">(optional)</span></label>
                <input id="f-link" type="text" value={form.link_url} onChange={(e) => set('link_url', e.target.value)} placeholder="https://... or /careers" />
              </div>

              <div className="field">
                <label htmlFor="f-label">Link label</label>
                <input id="f-label" type="text" value={form.link_label} onChange={(e) => set('link_label', e.target.value)} placeholder="View flyer" />
              </div>

              <label className="ne-check">
                <input type="checkbox" checked={form.active} onChange={(e) => set('active', e.target.checked)} />
                <span>Active (eligible to show on the homepage)</span>
              </label>

              <button className="btn btn-primary" type="submit" disabled={saving || uploading} style={{ width: '100%' }}>
                {uploading ? 'Uploading\u2026' : saving ? 'Saving\u2026' : (editing === 'new' ? 'Post Flyer' : 'Save Changes')}
              </button>
            </form>
          )}
        </div>

        {/* list */}
        <div className="panel">
          <div className="panel-head">
            <h2>Flyers</h2>
            <span className="count-pill">{list.filter((f) => f.active).length} active &middot; {list.length} total</span>
          </div>

          {loading ? (
            <p className="muted-note">Loading&hellip;</p>
          ) : list.length === 0 ? (
            <p className="muted-note">
              No flyers yet. Post your first one. (If flyers already show on the homepage,
              they&rsquo;re coming from the built-in fallback list and will be replaced by
              whatever you post here.)
            </p>
          ) : (
            <div className="fa-items">
              {list.map((f) => (
                <div key={f.id} className={`fa-item${editing === f.id ? ' editing' : ''}${f.active ? '' : ' fa-off'}`}>
                  <img src={f.image_url} alt="" className="fa-thumb" loading="lazy" />
                  <div className="fa-main">
                    <strong>{f.title}</strong>
                    <div className="fa-meta">
                      {f.caption && <span>{f.caption}</span>}
                      {liveIds.has(f.id) && <span className="fa-live">On the homepage</span>}
                      {!f.active && <span className="fa-hidden-tag">Hidden</span>}
                    </div>
                  </div>
                  <div className="fa-actions">
                    <button className="na-btn" onClick={() => toggleActive(f)}>{f.active ? 'Take down' : 'Post'}</button>
                    <button className="na-btn" onClick={() => startEdit(f)}>Edit</button>
                    <button className="am-del" onClick={() => setToDelete(f)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete this flyer?">
        <p style={{ color: 'var(--ink-2)', marginBottom: '1.4rem' }}>
          This permanently removes <strong>{toDelete?.title}</strong>. If you might post it
          again later, use &ldquo;Take down&rdquo; instead.
        </p>
        <div className="modal-actions">
          <button className="btn btn-cancel" onClick={() => setToDelete(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={confirmDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}
