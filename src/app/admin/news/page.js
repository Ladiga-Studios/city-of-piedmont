'use client';

import '../admin.css';
import './ne-admin.css';
import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useToast } from '@/components/ClientEffects';
import Modal from '@/components/Modal';
import ImageUploader from '@/components/ImageUploader';
import { newsDate } from '@/lib/news-events';

const BLANK = {
  title: '', body: '', content: '', published_at: '',
  image_url: '', image_alt: '',
};

function todayISO() { return new Date().toISOString().slice(0, 10); }

export default function NewsAdmin() {
  const supabase = createClient();
  const toast = useToast();

  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from('news').select('*').order('published_at', { ascending: false });
    setList(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  function startNew() { setEditing('new'); setForm({ ...BLANK, published_at: todayISO() }); }
  function startEdit(n) {
    setEditing(n.id);
    setForm({
      title: n.title || '',
      body: n.body || '',
      content: n.content || '',
      published_at: n.published_at || todayISO(),
      image_url: n.image_url || '',
      image_alt: n.image_alt || '',
    });
  }
  function cancel() { setEditing(null); setForm(BLANK); }
  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function save(ev) {
    ev.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      toast('Missing info', 'A title and summary are required.', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form };
      if (editing && editing !== 'new') payload.id = editing;
      const res = await fetch('/api/admin/save-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Save failed');
      toast('Saved', `Article ${editing === 'new' ? 'published' : 'updated'}.`, 'success');
      cancel();
      load();
    } catch (err) {
      toast('Save failed', err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    const n = toDelete;
    setToDelete(null);
    if (!n) return;
    try {
      const res = await fetch('/api/admin/save-news', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: n.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
      toast('Deleted', `Removed \u201C${n.title}\u201D.`, 'success');
      load();
    } catch (err) {
      toast('Delete failed', err.message, 'error');
    }
  }

  return (
    <div className="adminx-page">
      <header className="adminx-head">
        <h1>News</h1>
        <p>Post announcements and updates. The three most recent show on the homepage; all of them appear on the News page.</p>
      </header>

      <div className="admin-grid">
        {/* form */}
        <div className="panel">
          <div className="panel-head">
            <h2>{editing && editing !== 'new' ? 'Edit Article' : 'Add Article'}</h2>
            {editing && <button className="am-btn" onClick={cancel}>Cancel</button>}
          </div>

          {!editing ? (
            <>
              <p className="panel-note">Write a new article, or pick one from the list to edit.</p>
              <button className="btn btn-primary" onClick={startNew} style={{ width: '100%' }}>New Article</button>
            </>
          ) : (
            <form onSubmit={save}>
              <div className="field">
                <label htmlFor="n-title">Headline</label>
                <input id="n-title" type="text" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. 2026 Street Paving Project Begins" />
                <span className="field-help">Keep it short and specific. This is the big bold line readers see first.</span>
              </div>

              <div className="field">
                <label htmlFor="n-date">Published date</label>
                <input id="n-date" type="date" value={form.published_at} onChange={(e) => set('published_at', e.target.value)} />
              </div>

              <div className="field">
                <label htmlFor="n-body">Summary</label>
                <textarea id="n-body" rows={3} value={form.body} onChange={(e) => set('body', e.target.value)} placeholder="One or two sentences shown in the news card." />
                <span className="field-help">{form.body.length} characters &middot; aim for 1&ndash;2 sentences. This shows on the homepage and news cards.</span>
              </div>

              <div className="field">
                <label htmlFor="n-content">Full article <span className="opt">(optional)</span></label>
                <textarea id="n-content" rows={6} value={form.content} onChange={(e) => set('content', e.target.value)} placeholder="Optional longer text, shown under &ldquo;Read more.&rdquo; Separate paragraphs with blank lines." />
                <span className="field-help">Leave blank to show only the summary. Add longer text here for a full &ldquo;Read more&rdquo; article page.</span>
              </div>

              <div className="field">
                <label>Article image <span className="opt">(optional)</span></label>
                <ImageUploader
                  value={form.image_url}
                  onChange={(url) => set('image_url', url)}
                  endpoint="/api/admin/upload-news-photo"
                  label="Shown on the news card and at the top of the article."
                />
              </div>

              {form.image_url && (
                <div className="field">
                  <label htmlFor="n-alt">Image description <span className="opt">(for accessibility)</span></label>
                  <input id="n-alt" type="text" value={form.image_alt} onChange={(e) => set('image_alt', e.target.value)} placeholder="e.g. Crowd gathered at the Piedmont Sports Complex" />
                  <span className="field-help">A short description read aloud by screen readers and shown if the image fails to load.</span>
                </div>
              )}

              <button className="btn btn-primary" type="submit" disabled={saving} style={{ width: '100%' }}>
                {saving ? 'Saving\u2026' : (editing === 'new' ? 'Publish' : 'Save Changes')}
              </button>
            </form>
          )}
        </div>

        {/* list */}
        <div className="panel">
          <div className="panel-head">
            <h2>Articles</h2>
            <span className="count-pill">{list.length}</span>
          </div>

          {loading ? (
            <p className="muted-note">Loading&hellip;</p>
          ) : list.length === 0 ? (
            <p className="muted-note">No articles yet. Add your first one.</p>
          ) : (
            <div className="ne-items">
              {list.map((n) => (
                <div key={n.id} className={`ne-item${editing === n.id ? ' editing' : ''}`}>
                  <div className="ne-main">
                    <strong>{n.title}</strong>
                    <div className="ne-meta">
                      <span>{newsDate(n.published_at)}</span>
                      {n.is_sample && <span className="ne-tag">Sample</span>}
                      {n.expires_at && new Date(n.expires_at) < new Date() && <span className="ne-tag" title="Past its deadline; hidden from visitors">Expired — hidden</span>}
                      {n.expires_at && new Date(n.expires_at) >= new Date() && <span className="ne-tag">Expires {new Date(n.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                    </div>
                  </div>
                  <div className="ne-actions">
                    <button className="na-btn" onClick={() => startEdit(n)}>Edit</button>
                    <button className="am-del" onClick={() => setToDelete(n)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete this article?">
        <p style={{ color: 'var(--ink-2)', marginBottom: '1.4rem' }}>
          This permanently removes <strong>{toDelete?.title}</strong>. This can&rsquo;t be undone.
        </p>
        <div className="modal-actions">
          <button className="btn btn-cancel" onClick={() => setToDelete(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={confirmDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}
