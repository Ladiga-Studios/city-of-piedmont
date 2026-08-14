'use client';

// /admin/documents — upload any city document (water quality reports,
// permit forms, applications, policies) and it appears in the Downloads
// area of the department page you pick. Delete removes it from the page
// and from Storage.

import '../admin.css';
import './documents-admin.css';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from '@/lib/supabase-client';
import { useToast } from '@/components/ClientEffects';
import Modal from '@/components/Modal';
import { DEPARTMENTS } from '@/lib/departments';

const BUCKET = 'city-documents';

// Suggested section headings per department, so uploads land in the
// group residents already know (e.g. new water reports join the
// existing "Water Quality Reports" list on the Water & Gas page).
const HEADING_SUGGESTIONS = {
  'water-gas': ['Water Quality Reports', 'Forms & Documents'],
  'revenue': ['Download Forms'],
  'building-inspection': ['Downloads'],
  'administrative': ['Forms & Documents'],
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function DocumentsAdmin() {
  const supabase = createClient();
  const toast = useToast();

  // form state
  const [dept, setDept] = useState('water-gas');
  const [heading, setHeading] = useState('Water Quality Reports');
  const [title, setTitle] = useState('');
  const [postedDate, setPostedDate] = useState(todayISO());
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // list state
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableMissing, setTableMissing] = useState(false);
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('city_documents')
      .select('*')
      .order('posted_date', { ascending: false });
    if (error) setTableMissing(true);
    else setItems(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const byDept = useMemo(() => {
    const map = new Map();
    for (const doc of items) {
      if (!map.has(doc.department_slug)) map.set(doc.department_slug, []);
      map.get(doc.department_slug).push(doc);
    }
    return map;
  }, [items]);

  function deptName(slug) {
    return DEPARTMENTS.find((d) => d.slug === slug)?.name || slug;
  }

  function handleDeptChange(slug) {
    setDept(slug);
    const suggestions = HEADING_SUGGESTIONS[slug];
    if (suggestions?.length) setHeading(suggestions[0]);
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!title.trim() || !postedDate || !file) {
      toast('Missing info', 'Add a title, date, and file first.', 'error');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('title', title.trim());
      fd.append('department_slug', dept);
      fd.append('group_heading', heading.trim() || 'Documents');
      fd.append('posted_date', postedDate);
      fd.append('file', file);

      const res = await fetch('/api/admin/upload-document', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      toast('Posted', `Now showing on the ${deptName(dept)} page.`, 'success');
      setTitle(''); setPostedDate(todayISO()); setFile(null);
      e.target.reset();
      load();
    } catch (err) {
      toast('Upload error', err.message, 'error');
    } finally {
      setUploading(false);
    }
  }

  async function confirmDelete() {
    const doc = toDelete;
    setToDelete(null);
    if (!doc) return;
    try {
      if (doc.file_path) {
        await supabase.storage.from(BUCKET).remove([doc.file_path]);
      }
      const { error } = await supabase.from('city_documents').delete().eq('id', doc.id);
      if (error) throw error;
      toast('Deleted', `Removed \u201C${doc.title}\u201D.`, 'success');
      load();
    } catch (err) {
      toast('Delete failed', err.message || 'Could not delete.', 'error');
    }
  }

  const suggestions = HEADING_SUGGESTIONS[dept] || ['Forms & Documents'];

  return (
    <div className="adminx-page">
      <header className="adminx-head">
        <h1>City Documents</h1>
        <p>
          Upload water quality reports, permit forms, applications, and any other city PDF. Each file
          shows up in the Downloads area of the department page you choose.
        </p>
      </header>

      {tableMissing && (
        <div className="da-setup">
          <strong>One-time setup needed.</strong> The documents table hasn&rsquo;t been created yet — run
          <code> supabase-add-people-documents.sql</code> in the Supabase SQL editor, then reload this page.
        </div>
      )}

      <div className="admin-grid">
        {/* ---------- Upload panel ---------- */}
        <div className="panel">
          <h2>Upload a document</h2>
          <p className="panel-note">
            PDFs work best. Word and Excel files are accepted too. The document goes live on the
            public page within a minute.
          </p>

          <form onSubmit={handleUpload}>
            <div className="field">
              <label htmlFor="d-dept">Show on which page?</label>
              <select id="d-dept" value={dept} onChange={(e) => handleDeptChange(e.target.value)}>
                {DEPARTMENTS.map((d) => <option key={d.slug} value={d.slug}>{d.name}</option>)}
              </select>
            </div>

            <div className="field">
              <label htmlFor="d-heading">Section on that page</label>
              <input
                id="d-heading" type="text" list="heading-suggestions"
                value={heading} onChange={(e) => setHeading(e.target.value)}
              />
              <datalist id="heading-suggestions">
                {suggestions.map((s) => <option key={s} value={s} />)}
              </datalist>
              <span className="field-help">
                Use an existing section name (like &ldquo;Water Quality Reports&rdquo;) to add to that list,
                or type a new name to start a new section.
              </span>
            </div>

            <div className="field">
              <label htmlFor="d-title">Title</label>
              <input
                id="d-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Water Quality Report 2025"
              />
            </div>

            <div className="field">
              <label htmlFor="d-posted">Posted date</label>
              <input id="d-posted" type="date" value={postedDate} onChange={(e) => setPostedDate(e.target.value)} />
            </div>

            <div className="field">
              <label htmlFor="d-file">File</label>
              <input
                id="d-file" type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx,application/pdf"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>

            <button className="btn btn-primary" type="submit" disabled={uploading} style={{ width: '100%' }}>
              {uploading ? 'Uploading\u2026' : 'Post document'}
            </button>
          </form>
        </div>

        {/* ---------- Posted list ---------- */}
        <div className="panel">
          <div className="panel-head">
            <h2>Posted</h2>
            <span className="count-pill">{items.length} documents</span>
          </div>

          {loading ? (
            <p className="muted-note">Loading&hellip;</p>
          ) : items.length === 0 ? (
            <p className="muted-note">
              Nothing uploaded yet. Department pages are showing their original documents — anything you
              add here joins them.
            </p>
          ) : (
            <div className="na-groups">
              {[...byDept.entries()].map(([slug, docs]) => (
                <div className="na-group" key={slug}>
                  <h3 className="na-group-label">{deptName(slug)} <span>{docs.length}</span></h3>
                  <div className="na-items">
                    {docs.map((doc) => (
                      <div key={doc.id} className="na-item">
                        <div className="na-main">
                          <strong>{doc.title}</strong>
                          <div className="na-meta">
                            <span>{doc.group_heading}</span>
                            <span>{doc.posted_date}</span>
                          </div>
                        </div>
                        <div className="na-actions">
                          <a className="na-btn" href={doc.file_url} target="_blank" rel="noopener noreferrer">View</a>
                          <button className="am-del" onClick={() => setToDelete(doc)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ---------- Delete confirmation ---------- */}
      <Modal open={!!toDelete} onClose={() => setToDelete(null)} title="Delete this document?">
        <p style={{ color: 'var(--ink-2)', marginBottom: '1.4rem' }}>
          This permanently removes <strong>{toDelete?.title}</strong> and its file from the{' '}
          {toDelete ? deptName(toDelete.department_slug) : ''} page. This can&rsquo;t be undone.
        </p>
        <div className="modal-actions">
          <button className="btn btn-cancel" onClick={() => setToDelete(null)}>Cancel</button>
          <button className="btn btn-primary" onClick={confirmDelete}>Delete</button>
        </div>
      </Modal>
    </div>
  );
}
