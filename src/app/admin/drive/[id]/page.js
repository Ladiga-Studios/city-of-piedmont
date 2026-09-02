'use client';

// /admin/drive/[id] — one folder in the File Drive.
//
// Uploads go from the browser straight into the private 'drive' bucket
// (not through a Vercel function, which caps request bodies at 4.5 MB
// and would choke on camera photos). For images the browser also makes
// a small JPEG preview so the folder grid and the share page never have
// to load full-size originals.

import '../../admin.css';
import '../drive-admin.css';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';
import { useToast } from '@/components/ClientEffects';
import Modal from '@/components/Modal';
import {
  DRIVE_BUCKET, formatBytes, formatDate, naturalCompare, safeFilename, zipNameFor,
  uniqueName, isImageFile, fileKind, makeThumbnail, runPool, chunk,
} from '@/lib/drive';
import { downloadFilesAsZip } from '@/lib/zip-download';

const UPLOAD_CONCURRENCY = 4;
const THUMB_URL_TTL = 6 * 3600; // seconds

const KIND_ICON = {
  image: 'M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4M15 9h.01',
  video: 'M4 6h12v12H4zM16 10l4-2v8l-4-2',
  pdf: 'M14 3v5h5M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zM9 13h6M9 17h6',
  doc: 'M14 3v5h5M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zM9 12h6M9 16h4',
  sheet: 'M4 4h16v16H4zM4 10h16M4 15h16M10 4v16',
  archive: 'M4 4h16v4H4zM5 8v12h14V8M10 12h4',
  file: 'M14 3v5h5M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z',
};

function uid() {
  return (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)).replace(/-/g, '').slice(0, 20);
}

export default function DriveFolderAdmin() {
  const { id } = useParams();
  const supabase = createClient();
  const toast = useToast();
  const router = useRouter();

  // folder + files
  const [folder, setFolder] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [files, setFiles] = useState([]);
  const [thumbs, setThumbs] = useState({}); // path -> signed url
  const [loading, setLoading] = useState(true);

  // upload queue
  const [queue, setQueue] = useState([]);
  const queueRef = useRef([]);
  const takenRef = useRef(new Set());
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  // selection + actions
  const [selected, setSelected] = useState(() => new Set());
  const [toDelete, setToDelete] = useState(null); // array of file rows
  const [deleting, setDeleting] = useState(false);
  const [zipProgress, setZipProgress] = useState(null); // {done,total,fileIndex,fileCount}

  // settings modal
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sName, setSName] = useState('');
  const [sDesc, setSDesc] = useState('');
  const [sShare, setSShare] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [confirmFolderDelete, setConfirmFolderDelete] = useState(false);
  const [confirmRotate, setConfirmRotate] = useState(false);

  const [origin, setOrigin] = useState('');
  useEffect(() => { setOrigin(window.location.origin); }, []);

  // ---------- load ----------
  const load = useCallback(async () => {
    const [{ data: f, error: fe }, { data: rows }] = await Promise.all([
      supabase.from('drive_folders').select('*').eq('id', id).maybeSingle(),
      supabase.from('drive_files').select('*').eq('folder_id', id),
    ]);
    if (fe || !f) { setNotFound(true); setLoading(false); return; }
    setFolder(f);
    const sorted = (rows || []).sort((a, b) => naturalCompare(a.name, b.name));
    setFiles(sorted);
    takenRef.current = new Set(sorted.map((r) => r.name.toLowerCase()));
    setLoading(false);

    // Signed preview URLs, in one batch per 200 paths.
    const paths = sorted.filter((r) => r.thumb_path).map((r) => r.thumb_path);
    const map = {};
    for (const part of chunk(paths, 200)) {
      const { data } = await supabase.storage.from(DRIVE_BUCKET).createSignedUrls(part, THUMB_URL_TTL);
      for (const s of data || []) if (s.signedUrl && s.path) map[s.path] = s.signedUrl;
    }
    setThumbs(map);
  }, [supabase, id]);

  useEffect(() => { load(); }, [load]);

  const shareUrl = folder && origin ? `${origin}/share/${folder.share_token}` : '';
  const totalBytes = useMemo(() => files.reduce((s, f) => s + Number(f.size || 0), 0), [files]);

  // ---------- share link ----------
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast('Link copied', 'Paste it into an email or text.', 'success');
    } catch {
      toast('Copy failed', 'Select the link and copy it manually.', 'error');
    }
  }

  // ---------- uploads ----------
  function setQueueItem(key, patch) {
    queueRef.current = queueRef.current.map((q) => (q.key === key ? { ...q, ...patch } : q));
    setQueue(queueRef.current);
  }

  function addFiles(list) {
    const incoming = Array.from(list || []).filter((f) => f && f.size >= 0);
    if (!incoming.length) return;
    const items = incoming.map((file) => {
      const name = uniqueName(file.name, takenRef.current);
      takenRef.current.add(name.toLowerCase());
      return { key: uid(), file, name, status: 'queued', note: '' };
    });
    queueRef.current = [...queueRef.current, ...items];
    setQueue(queueRef.current);
    runUploads();
  }

  async function uploadOne(item) {
    setQueueItem(item.key, { status: 'uploading', note: '' });
    const { file, name } = item;
    const key = uid();
    const path = `${id}/${key}-${safeFilename(name)}`;
    const thumbPath = `${id}/thumbs/${key}.jpg`;
    let thumbUploaded = false;
    let width = null;
    let height = null;

    try {
      // 1) original
      const { error: upErr } = await supabase.storage
        .from(DRIVE_BUCKET)
        .upload(path, file, { contentType: file.type || 'application/octet-stream', upsert: false });
      if (upErr) throw new Error(upErr.message);

      // 2) preview (images only; skipped silently if the browser can't decode it)
      if (isImageFile(file)) {
        const thumb = await makeThumbnail(file).catch(() => null);
        if (thumb) {
          width = thumb.width; height = thumb.height;
          const { error: tErr } = await supabase.storage
            .from(DRIVE_BUCKET)
            .upload(thumbPath, thumb.blob, { contentType: 'image/jpeg', upsert: false });
          thumbUploaded = !tErr;
        }
      }

      // 3) database row
      const { data: row, error: insErr } = await supabase
        .from('drive_files')
        .insert({
          folder_id: id, name, path,
          thumb_path: thumbUploaded ? thumbPath : null,
          size: file.size, mime: file.type || null, width, height,
        })
        .select('*')
        .single();
      if (insErr) throw new Error(insErr.message);

      // 4) show it in the grid right away
      setFiles((prev) => [...prev, row].sort((a, b) => naturalCompare(a.name, b.name)));
      if (thumbUploaded) {
        const { data } = await supabase.storage.from(DRIVE_BUCKET).createSignedUrl(thumbPath, THUMB_URL_TTL);
        if (data?.signedUrl) setThumbs((t) => ({ ...t, [thumbPath]: data.signedUrl }));
      }
      setQueueItem(item.key, { status: 'done' });
    } catch (err) {
      // Don't leave orphaned objects behind a failed row insert.
      await supabase.storage.from(DRIVE_BUCKET).remove([path, thumbPath]).catch(() => {});
      setQueueItem(item.key, { status: 'error', note: err.message || 'Upload failed' });
    }
  }

  const runningRef = useRef(false);
  async function runUploads() {
    if (runningRef.current) return;
    runningRef.current = true;
    setUploading(true);
    try {
      // Keep pulling queued items until none remain (new drops can arrive mid-run).
      for (;;) {
        const batch = queueRef.current.filter((q) => q.status === 'queued');
        if (!batch.length) break;
        await runPool(batch, UPLOAD_CONCURRENCY, uploadOne);
      }
      const done = queueRef.current.filter((q) => q.status === 'done').length;
      const failed = queueRef.current.filter((q) => q.status === 'error').length;
      if (failed) toast('Some uploads failed', `${done} uploaded, ${failed} failed. Use “Retry failed”.`, 'error');
      else if (done) toast('Upload complete', `${done} ${done === 1 ? 'file' : 'files'} added to “${folder?.name}”.`, 'success');
    } finally {
      runningRef.current = false;
      setUploading(false);
    }
  }

  function retryFailed() {
    queueRef.current = queueRef.current.map((q) => (q.status === 'error' ? { ...q, status: 'queued', note: '' } : q));
    setQueue(queueRef.current);
    runUploads();
  }

  function clearFinished() {
    queueRef.current = queueRef.current.filter((q) => q.status !== 'done');
    setQueue(queueRef.current);
  }

  function onDrop(e) {
    e.preventDefault(); setDragging(false);
    addFiles(e.dataTransfer?.files);
  }

  const qStats = useMemo(() => {
    const s = { total: queue.length, done: 0, error: 0, active: 0 };
    for (const q of queue) {
      if (q.status === 'done') s.done++;
      else if (q.status === 'error') s.error++;
      else s.active++;
    }
    return s;
  }, [queue]);

  // ---------- open / delete ----------
  async function openFile(row) {
    const { data, error } = await supabase.storage.from(DRIVE_BUCKET).createSignedUrl(row.path, 3600);
    if (error || !data?.signedUrl) { toast('Could not open file', error?.message || 'Try again.', 'error'); return; }
    window.open(data.signedUrl, '_blank', 'noopener');
  }

  async function confirmDelete() {
    const rows = toDelete || [];
    setDeleting(true);
    try {
      const paths = rows.flatMap((r) => [r.path, r.thumb_path].filter(Boolean));
      for (const part of chunk(paths, 100)) {
        const { error } = await supabase.storage.from(DRIVE_BUCKET).remove(part);
        if (error) throw error;
      }
      const ids = rows.map((r) => r.id);
      const { error } = await supabase.from('drive_files').delete().in('id', ids);
      if (error) throw error;
      setFiles((prev) => prev.filter((f) => !ids.includes(f.id)));
      for (const r of rows) takenRef.current.delete(r.name.toLowerCase());
      setSelected(new Set());
      toast('Deleted', `${rows.length} ${rows.length === 1 ? 'file' : 'files'} removed.`, 'success');
    } catch (err) {
      toast('Delete failed', err.message || 'Try again.', 'error');
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  }

  function toggleSelect(fid) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(fid)) next.delete(fid); else next.add(fid);
      return next;
    });
  }

  // ---------- ZIP for staff ----------
  async function downloadZip() {
    if (!files.length || zipProgress) return;
    try {
      const urls = {};
      for (const part of chunk(files.map((f) => f.path), 200)) {
        const { data, error } = await supabase.storage.from(DRIVE_BUCKET).createSignedUrls(part, 3600);
        if (error) throw error;
        for (const s of data || []) if (s.signedUrl) urls[s.path] = s.signedUrl;
      }
      const list = files.map((f) => ({ name: f.name, url: urls[f.path], size: f.size, lastModified: f.created_at }))
        .filter((f) => f.url);
      setZipProgress({ done: 0, total: 1, fileIndex: 0, fileCount: list.length });
      const result = await downloadFilesAsZip({ files: list, zipName: zipNameFor(folder.name), onProgress: setZipProgress });
      if (result === 'saved') toast('ZIP ready', `${list.length} files packed.`, 'success');
    } catch (err) {
      toast('Download failed', err.message || 'Try again.', 'error');
    } finally {
      setZipProgress(null);
    }
  }

  // ---------- settings ----------
  function openSettings() {
    setSName(folder.name); setSDesc(folder.description || ''); setSShare(folder.share_enabled);
    setSettingsOpen(true);
  }

  async function saveSettings(e) {
    e.preventDefault();
    if (!sName.trim()) return;
    setSavingSettings(true);
    try {
      const patch = { name: sName.trim(), description: sDesc.trim() || null, share_enabled: sShare, updated_at: new Date().toISOString() };
      const { data, error } = await supabase.from('drive_folders').update(patch).eq('id', id).select('*').single();
      if (error) throw error;
      setFolder(data);
      setSettingsOpen(false);
      toast('Saved', sShare ? 'The share link is on.' : 'The share link is off — the page now shows “not found”.', 'success');
    } catch (err) {
      toast('Save failed', err.message || 'Try again.', 'error');
    } finally {
      setSavingSettings(false);
    }
  }

  async function rotateLink() {
    setConfirmRotate(false);
    const token = uid() + uid();
    const { data, error } = await supabase.from('drive_folders').update({ share_token: token.slice(0, 32) }).eq('id', id).select('*').single();
    if (error) { toast('Could not change link', error.message, 'error'); return; }
    setFolder(data);
    toast('New link created', 'The old link no longer works.', 'success');
  }

  async function deleteFolder() {
    setConfirmFolderDelete(false);
    setDeleting(true);
    try {
      const paths = files.flatMap((r) => [r.path, r.thumb_path].filter(Boolean));
      for (const part of chunk(paths, 100)) {
        const { error } = await supabase.storage.from(DRIVE_BUCKET).remove(part);
        if (error) throw error;
      }
      const { error } = await supabase.from('drive_folders').delete().eq('id', id);
      if (error) throw error;
      toast('Folder deleted', `“${folder.name}” and its files are gone.`, 'success');
      router.push('/admin/drive');
    } catch (err) {
      toast('Delete failed', err.message || 'Try again.', 'error');
      setDeleting(false);
    }
  }

  // ---------- render ----------
  if (notFound) {
    return (
      <div className="adminx-page">
        <header className="adminx-head">
          <h1>Folder not found</h1>
          <p>It may have been deleted. <Link href="/admin/drive">Back to the File Drive</Link>.</p>
        </header>
      </div>
    );
  }
  if (loading || !folder) {
    return <div className="adminx-page"><p className="muted-note">Loading&hellip;</p></div>;
  }

  const pct = zipProgress ? Math.round((zipProgress.done / Math.max(1, zipProgress.total)) * 100) : 0;

  return (
    <div className="adminx-page">
      <Link href="/admin/drive" className="dr-back">← All folders</Link>

      <header className="adminx-head dr-head">
        <div>
          <h1>{folder.name}</h1>
          <p>
            {files.length} {files.length === 1 ? 'file' : 'files'} · {formatBytes(totalBytes)} · created {formatDate(folder.created_at)}
            {folder.description ? <><br />{folder.description}</> : null}
          </p>
        </div>
        <button className="btn btn-outline" onClick={openSettings}>Folder settings</button>
      </header>

      {/* ---------- Share link ---------- */}
      <section className={`dr-share ${folder.share_enabled ? '' : 'off'}`} aria-labelledby="dr-share-h">
        <div className="dr-share-main">
          <h2 id="dr-share-h">Share link</h2>
          {folder.share_enabled ? (
            <p>Anyone with this link can view the folder and download everything as one ZIP. No login needed.</p>
          ) : (
            <p>The link is switched off. Turn it back on in Folder settings when you&rsquo;re ready to share.</p>
          )}
          <div className="dr-link-row">
            <input type="text" readOnly value={shareUrl} aria-label="Share link" onFocus={(e) => e.target.select()} />
            <button className="btn btn-primary" onClick={copyLink} disabled={!shareUrl}>Copy link</button>
            <a className="btn btn-outline" href={shareUrl || '#'} target="_blank" rel="noopener noreferrer">Open</a>
          </div>
        </div>
      </section>

      <div className="dr-two">
        {/* ---------- Upload ---------- */}
        <div className="panel">
          <h2>Add files</h2>
          <p className="panel-note">
            Photos, PDFs, documents — any type. Drop in as many as you need; they upload a few at a time
            and you can keep working on this page.
          </p>

          <div
            className={`bulk-drop ${dragging ? 'drag' : ''}`}
            role="button" tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
              <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
            </svg>
            <strong>Drop files here or click to choose</strong>
            <small>Select all 300 at once — that&rsquo;s fine.</small>
            <input
              ref={inputRef} type="file" multiple hidden
              onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
            />
          </div>

          {queue.length > 0 && (
            <div className="dr-queue">
              <div className="dr-queue-bar" role="progressbar" aria-valuemin={0} aria-valuemax={qStats.total} aria-valuenow={qStats.done + qStats.error}>
                <span style={{ width: `${((qStats.done + qStats.error) / Math.max(1, qStats.total)) * 100}%` }} />
              </div>
              <div className="dr-queue-meta">
                <span>
                  {uploading
                    ? `Uploading… ${qStats.done} of ${qStats.total}`
                    : `${qStats.done} uploaded${qStats.error ? `, ${qStats.error} failed` : ''}`}
                </span>
                <span className="dr-queue-actions">
                  {qStats.error > 0 && !uploading && <button className="am-btn" onClick={retryFailed}>Retry failed</button>}
                  {qStats.done > 0 && !uploading && <button className="am-btn" onClick={clearFinished}>Clear list</button>}
                </span>
              </div>
              <ul className="dr-queue-list">
                {queue.map((q) => (
                  <li key={q.key} className={`st-${q.status}`}>
                    <span className="dr-q-name">{q.name}</span>
                    <span className="dr-q-size">{formatBytes(q.file.size)}</span>
                    <span className={`bulk-pill ${
                      q.status === 'done' ? 'st-done' : q.status === 'error' ? 'st-err' : q.status === 'uploading' ? 'st-working' : 'st-ready'
                    }`}>
                      {q.status === 'done' ? 'Done' : q.status === 'error' ? 'Failed' : q.status === 'uploading' ? 'Uploading' : 'Waiting'}
                    </span>
                    {q.note && <span className="dr-q-note">{q.note}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* ---------- Files ---------- */}
        <div className="panel dr-files-panel">
          <div className="panel-head">
            <h2>In this folder</h2>
            <div className="dr-files-tools">
              {files.length > 0 && (
                <>
                  <button
                    className="am-btn"
                    onClick={() => setSelected(selected.size === files.length ? new Set() : new Set(files.map((f) => f.id)))}
                  >
                    {selected.size === files.length ? 'Select none' : 'Select all'}
                  </button>
                  {selected.size > 0 && (
                    <button className="am-btn dr-btn-danger" onClick={() => setToDelete(files.filter((f) => selected.has(f.id)))}>
                      Delete {selected.size}
                    </button>
                  )}
                  <button className="am-btn" onClick={downloadZip} disabled={!!zipProgress}>
                    {zipProgress ? `Packing… ${pct}%` : 'Download ZIP'}
                  </button>
                </>
              )}
            </div>
          </div>

          {zipProgress && (
            <div className="dr-queue-bar dr-zip-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
              <span style={{ width: `${pct}%` }} />
            </div>
          )}

          {files.length === 0 ? (
            <p className="muted-note">Nothing here yet. Add files on the left and they&rsquo;ll appear as they finish.</p>
          ) : (
            <ul className="dr-grid-files" aria-label="Files in this folder">
              {files.map((f) => {
                const kind = fileKind(f.name, f.mime || '');
                const src = f.thumb_path ? thumbs[f.thumb_path] : null;
                const isSel = selected.has(f.id);
                return (
                  <li key={f.id} className={`dr-tile ${isSel ? 'sel' : ''}`}>
                    <label className="dr-tile-check">
                      <input type="checkbox" checked={isSel} onChange={() => toggleSelect(f.id)} aria-label={`Select ${f.name}`} />
                    </label>
                    <button type="button" className="dr-tile-media" onClick={() => openFile(f)} title="Open in a new tab">
                      {src ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={src} alt="" loading="lazy" decoding="async" />
                      ) : (
                        <span className="dr-tile-ico" aria-hidden="true">
                          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d={KIND_ICON[kind]} /></svg>
                        </span>
                      )}
                    </button>
                    <div className="dr-tile-meta">
                      <span className="dr-tile-name" title={f.name}>{f.name}</span>
                      <span className="dr-tile-size">{formatBytes(f.size)}</span>
                    </div>
                    <button type="button" className="dr-tile-del" onClick={() => setToDelete([f])} aria-label={`Delete ${f.name}`}>×</button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* ---------- Delete files ---------- */}
      <Modal open={!!toDelete} onClose={() => !deleting && setToDelete(null)} title={toDelete?.length === 1 ? 'Delete this file?' : `Delete ${toDelete?.length} files?`}>
        <p>
          {toDelete?.length === 1
            ? <>This permanently removes <strong>{toDelete[0].name}</strong> from the folder and from storage.</>
            : <>These files are removed from the folder and from storage. Anyone using the share link won&rsquo;t see them any more.</>}
          {' '}This can&rsquo;t be undone.
        </p>
        <div className="modal-actions">
          <button className="btn btn-cancel" onClick={() => setToDelete(null)} disabled={deleting}>Cancel</button>
          <button className="btn btn-primary" onClick={confirmDelete} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete'}</button>
        </div>
      </Modal>

      {/* ---------- Folder settings ---------- */}
      <Modal open={settingsOpen} onClose={() => !savingSettings && setSettingsOpen(false)} title="Folder settings">
        <form onSubmit={saveSettings} noValidate>
          <div className="field">
            <label htmlFor="dr-s-name">Folder name</label>
            <input id="dr-s-name" type="text" value={sName} onChange={(e) => setSName(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="dr-s-desc">Note (optional)</label>
            <textarea id="dr-s-desc" rows={2} value={sDesc} onChange={(e) => setSDesc(e.target.value)} />
          </div>
          <div className="field">
            <label className="check-row">
              <input type="checkbox" checked={sShare} onChange={(e) => setSShare(e.target.checked)} />
              Share link is on
            </label>
            <span className="field-help">Off means the link shows &ldquo;not found&rdquo; until you turn it back on. Files are kept.</span>
          </div>

          <div className="dr-settings-danger">
            <button type="button" className="am-btn" onClick={() => { setSettingsOpen(false); setConfirmRotate(true); }}>Create a new link</button>
            <button type="button" className="am-btn dr-btn-danger" onClick={() => { setSettingsOpen(false); setConfirmFolderDelete(true); }}>Delete folder</button>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-cancel" onClick={() => setSettingsOpen(false)} disabled={savingSettings}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={savingSettings || !sName.trim()}>{savingSettings ? 'Saving…' : 'Save'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={confirmRotate} onClose={() => setConfirmRotate(false)} title="Create a new link?">
        <p>The current link stops working immediately. Anyone you already sent it to will need the new one.</p>
        <div className="modal-actions">
          <button className="btn btn-cancel" onClick={() => setConfirmRotate(false)}>Keep current link</button>
          <button className="btn btn-primary" onClick={rotateLink}>Create new link</button>
        </div>
      </Modal>

      <Modal open={confirmFolderDelete} onClose={() => !deleting && setConfirmFolderDelete(false)} title="Delete this folder?">
        <p>
          <strong>{folder.name}</strong> and all {files.length} {files.length === 1 ? 'file' : 'files'} in it are permanently removed,
          and the share link stops working. This can&rsquo;t be undone.
        </p>
        <div className="modal-actions">
          <button className="btn btn-cancel" onClick={() => setConfirmFolderDelete(false)} disabled={deleting}>Cancel</button>
          <button className="btn btn-primary" onClick={deleteFolder} disabled={deleting}>{deleting ? 'Deleting…' : 'Delete folder'}</button>
        </div>
      </Modal>
    </div>
  );
}
