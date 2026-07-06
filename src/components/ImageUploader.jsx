'use client';

import { useRef, useState } from 'react';

/**
 * Reusable image picker used across the admin.
 *  - Drag a file in, or click to browse, or paste an image URL.
 *  - Shows a live preview and a Remove button.
 *  - Uploads via the given endpoint (FormData with `file`, plus any `extra` fields),
 *    expects { url } back, and calls onChange(url).
 *
 * Props:
 *   value       current image URL ('' when none)
 *   onChange    (url: string) => void
 *   endpoint    upload API path, e.g. '/api/admin/upload-news-photo'
 *   extra       optional object of extra FormData fields (e.g. { slug })
 *   label       small caption under the dropzone
 */
export default function ImageUploader({ value, onChange, endpoint, extra = {}, label, hidePreview = false }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const [err, setErr] = useState('');
  const [showUrl, setShowUrl] = useState(false);

  async function upload(file) {
    if (!file) return;
    setErr('');
    if (!file.type.startsWith('image/')) { setErr('Please choose an image file.'); return; }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      Object.entries(extra).forEach(([k, v]) => fd.append(k, v ?? ''));
      const res = await fetch(endpoint, { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      onChange(data.url);
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  function onDrop(e) {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) upload(file);
  }

  return (
    <div className="imgup">
      {value ? (
        <div className="imgup-have">
          {!hidePreview && <img src={value} alt="" className="imgup-preview" />}
          <div className="imgup-have-actions">
            <button type="button" className="am-btn" onClick={() => inputRef.current?.click()} disabled={busy}>
              {busy ? 'Uploading\u2026' : 'Replace photo'}
            </button>
            <button type="button" className="am-del" onClick={() => { onChange(''); setErr(''); }}>
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`imgup-drop${drag ? ' drag' : ''}${busy ? ' busy' : ''}`}
          onClick={() => !busy && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <path d="M12 16V4M7 9l5-5 5 5" /><path d="M5 20h14" />
          </svg>
          <span className="imgup-drop-main">{busy ? 'Uploading\u2026' : 'Drag an image here, or click to choose'}</span>
          <span className="imgup-drop-sub">{label || 'JPG, PNG, WEBP \u00b7 up to 8 MB'}</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => { upload(e.target.files[0]); e.target.value = ''; }}
      />

      <button type="button" className="imgup-url-toggle" onClick={() => setShowUrl((s) => !s)}>
        {showUrl ? 'Hide URL option' : 'Or paste an image URL'}
      </button>
      {showUrl && (
        <input
          type="url"
          className="imgup-url"
          placeholder="https://\u2026"
          defaultValue={value || ''}
          onBlur={(e) => { const v = e.target.value.trim(); if (v) onChange(v); }}
        />
      )}

      {err && <span className="imgup-err">{err}</span>}
    </div>
  );
}
