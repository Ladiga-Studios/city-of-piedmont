'use client';

import { useState, useEffect, useMemo } from 'react';
import { formatBytes, formatDate, fileKind, zipNameFor } from '@/lib/drive';
import { downloadFilesAsZip } from '@/lib/zip-download';

const KIND_ICON = {
  image: 'M4 5h16v14H4zM4 15l5-5 4 4 3-3 4 4M15 9h.01',
  video: 'M4 6h12v12H4zM16 10l4-2v8l-4-2',
  pdf: 'M14 3v5h5M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zM9 13h6M9 17h6',
  doc: 'M14 3v5h5M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zM9 12h6M9 16h4',
  sheet: 'M4 4h16v16H4zM4 10h16M4 15h16M10 4v16',
  archive: 'M4 4h16v4H4zM5 8v12h14V8M10 12h4',
  file: 'M14 3v5h5M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z',
};

export default function ShareFolder({ token, folder, files }) {
  const [phase, setPhase] = useState('idle'); // idle | preparing | zipping | done | error
  const [progress, setProgress] = useState({ done: 0, total: 0, fileIndex: 0, fileCount: files.length });
  const [errorMsg, setErrorMsg] = useState('');
  const [streams, setStreams] = useState(true); // false on Safari/Firefox (blob fallback)

  useEffect(() => { setStreams('showSaveFilePicker' in window); }, []);

  const totalBytes = useMemo(() => files.reduce((s, f) => s + (f.size || 0), 0), [files]);
  const imageCount = useMemo(() => files.filter((f) => fileKind(f.name, f.mime) === 'image').length, [files]);
  const zipName = zipNameFor(folder.name);

  async function downloadAll() {
    if (phase === 'preparing' || phase === 'zipping') return;
    setErrorMsg('');
    setPhase('preparing');
    try {
      // Fresh signed URLs so the download works no matter how long this page has been open.
      const res = await fetch(`/api/share/${token}`, { cache: 'no-store' });
      if (!res.ok) throw new Error(res.status === 404 ? 'This folder is no longer shared.' : 'Could not reach the server. Check your connection and try again.');
      const data = await res.json();
      if (!data.files?.length) throw new Error('This folder is empty.');

      setPhase('zipping');
      const result = await downloadFilesAsZip({
        files: data.files,
        zipName,
        onProgress: (p) => setProgress(p),
      });
      setPhase(result === 'saved' ? 'done' : 'idle');
    } catch (err) {
      setErrorMsg(err?.message || 'Something went wrong. Try again.');
      setPhase('error');
    }
  }

  const pct = progress.total ? Math.min(100, Math.round((progress.done / progress.total) * 100)) : 0;
  const busy = phase === 'preparing' || phase === 'zipping';

  const summary = files.length === 0
    ? 'Nothing has been added to this folder yet.'
    : `${files.length} ${files.length === 1 ? 'file' : 'files'}${imageCount && imageCount !== files.length ? ` (${imageCount} photos)` : imageCount === files.length ? ' · all photos' : ''} · ${formatBytes(totalBytes)}`;

  return (
    <>
      <section className="page-hero share-hero">
        <div className="container inner">
          <p className="share-from">Shared by the City of Piedmont</p>
          <h1>{folder.name}</h1>
          <p className="share-summary">{summary}{folder.updatedAt ? ` · updated ${formatDate(folder.updatedAt)}` : ''}</p>
          {folder.description && <p className="share-note">{folder.description}</p>}

          {files.length > 0 && (
            <div className="share-dl">
              <button type="button" className="btn btn-primary share-dl-btn" onClick={downloadAll} disabled={busy}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M12 4v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                </svg>
                {phase === 'preparing' ? 'Getting ready…'
                  : phase === 'zipping' ? `Downloading… ${pct}%`
                  : `Download all (${formatBytes(totalBytes)} ZIP)`}
              </button>

              {phase === 'zipping' && (
                <div className="share-progress" role="status">
                  <div className="share-bar" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
                    <span style={{ width: `${pct}%` }} />
                  </div>
                  <p>
                    {progress.fileIndex} of {progress.fileCount} files · {formatBytes(progress.done)} of {formatBytes(progress.total)}
                    {!streams && ' · your browser will save the ZIP once it finishes'}
                  </p>
                </div>
              )}
              {phase === 'done' && (
                <p className="share-status ok" role="status">Saved as <strong>{zipName}</strong>. Check your Downloads folder.</p>
              )}
              {phase === 'error' && (
                <p className="share-status err" role="alert">{errorMsg}</p>
              )}
              {phase === 'idle' && (
                <p className="share-hint">
                  One click, one file. Best on a computer
                  {totalBytes > 300 * 1024 * 1024 ? ' — this one is large for a phone.' : '.'}
                  {' '}Individual files can be opened or saved below.
                </p>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="section share-body">
        <div className="container">
          {files.length === 0 ? (
            <p className="share-empty">Check back later, or ask whoever sent you this link.</p>
          ) : (
            <ul className="share-grid" aria-label="Files">
              {files.map((f) => {
                const kind = fileKind(f.name, f.mime);
                return (
                  <li key={f.id} className="share-tile">
                    <a className="share-tile-media" href={f.url || '#'} target="_blank" rel="noopener noreferrer" title={`Open ${f.name}`}>
                      {f.thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={f.thumb} alt={f.name} loading="lazy" decoding="async"
                          width={f.width || undefined} height={f.height || undefined}
                        />
                      ) : (
                        <span className="share-tile-ico" aria-hidden="true">
                          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d={KIND_ICON[kind]} /></svg>
                        </span>
                      )}
                    </a>
                    <div className="share-tile-meta">
                      <span className="share-tile-name" title={f.name}>{f.name}</span>
                      <span className="share-tile-row">
                        <span>{formatBytes(f.size)}</span>
                        {f.downloadUrl && <a href={f.downloadUrl} download={f.name}>Save</a>}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
