'use client';

// /admin/drive — the File Drive. Staff create a folder, drop in as many
// files as they like (hundreds of photos is the normal case), and hand
// out one link. Anyone with the link sees the folder and can download
// everything as a single ZIP. Files stay here for as long as the folder
// exists, so old folders can be re-shared any time.

import '../admin.css';
import './drive-admin.css';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { useToast } from '@/components/ClientEffects';
import Modal from '@/components/Modal';
import { formatBytes, formatDate } from '@/lib/drive';

export default function DriveAdmin() {
  const supabase = createClient();
  const toast = useToast();
  const router = useRouter();

  const [folders, setFolders] = useState(null); // null = loading
  const [tableMissing, setTableMissing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [nameErr, setNameErr] = useState('');

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('drive_folder_stats')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) { setTableMissing(true); setFolders([]); return; }
    setFolders(data || []);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function createFolder(e) {
    e.preventDefault();
    const n = name.trim();
    if (!n) { setNameErr('Give the folder a name.'); return; }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('drive_folders')
        .insert({ name: n, description: desc.trim() || null, created_by: user?.id || null })
        .select('id')
        .single();
      if (error) throw error;
      toast('Folder created', 'Now add your files.', 'success');
      setCreating(false); setName(''); setDesc(''); setNameErr('');
      router.push(`/admin/drive/${data.id}`);
    } catch (err) {
      toast('Could not create folder', err.message || 'Try again.', 'error');
    } finally {
      setSaving(false);
    }
  }

  const totalFiles = (folders || []).reduce((s, f) => s + (f.file_count || 0), 0);
  const totalBytes = (folders || []).reduce((s, f) => s + Number(f.total_bytes || 0), 0);

  return (
    <div className="adminx-page">
      <header className="adminx-head dr-head">
        <div>
          <h1>File Drive</h1>
          <p>
            Upload a batch of photos or documents into a folder, then send one link. The person you
            send it to can view everything and download it all as a single ZIP.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setCreating(true)} disabled={tableMissing}>
          New folder
        </button>
      </header>

      {tableMissing && (
        <div className="da-setup">
          <strong>One-time setup needed.</strong> Run <code>supabase-drive.sql</code> in the Supabase
          SQL editor, then reload this page.
        </div>
      )}

      {folders === null ? (
        <p className="muted-note">Loading&hellip;</p>
      ) : folders.length === 0 ? (
        !tableMissing && (
          <div className="dr-empty">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
            </svg>
            <strong>No folders yet</strong>
            <p>Create a folder, add your files, and copy the share link from the folder page.</p>
            <button className="btn btn-primary" onClick={() => setCreating(true)}>Create the first folder</button>
          </div>
        )
      ) : (
        <>
          <p className="dr-totals">
            {folders.length} {folders.length === 1 ? 'folder' : 'folders'} · {totalFiles} files · {formatBytes(totalBytes)} stored
          </p>
          <div className="dr-grid">
            {folders.map((f) => (
              <Link key={f.id} href={`/admin/drive/${f.id}`} className="dr-card">
                <span className="dr-card-ico" aria-hidden="true">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
                  </svg>
                </span>
                <span className="dr-card-body">
                  <strong>{f.name}</strong>
                  <small>
                    {f.file_count} {f.file_count === 1 ? 'file' : 'files'} · {formatBytes(f.total_bytes)}
                    {f.last_upload_at ? ` · updated ${formatDate(f.last_upload_at)}` : ` · created ${formatDate(f.created_at)}`}
                  </small>
                </span>
                <span className={`dr-share-pill ${f.share_enabled ? 'on' : 'off'}`}>
                  {f.share_enabled ? 'Link on' : 'Link off'}
                </span>
              </Link>
            ))}
          </div>
        </>
      )}

      <Modal open={creating} onClose={() => !saving && setCreating(false)} title="New folder">
        <form onSubmit={createFolder} noValidate>
          <div className="field">
            <label htmlFor="dr-name">Folder name</label>
            <input
              id="dr-name" type="text" value={name} autoFocus
              onChange={(e) => { setName(e.target.value); setNameErr(''); }}
              placeholder="e.g. Fall Festival 2026 photos"
              aria-invalid={!!nameErr}
            />
            {nameErr && <span className="err">{nameErr}</span>}
            <span className="field-help">The person you share with sees this name and it becomes the ZIP filename.</span>
          </div>
          <div className="field">
            <label htmlFor="dr-desc">Note (optional)</label>
            <textarea
              id="dr-desc" rows={2} value={desc} onChange={(e) => setDesc(e.target.value)}
              placeholder="Shown at the top of the share page, e.g. who took the photos or what they're for."
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-cancel" onClick={() => setCreating(false)} disabled={saving}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Creating…' : 'Create folder'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
