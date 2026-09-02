// Shared helpers for the File Drive (admin console + public share page).
// Everything in here is safe to import from client components.

export const DRIVE_BUCKET = 'drive';

/** Human-readable byte count: 0 B, 4.2 MB, 1.8 GB. */
export function formatBytes(n) {
  const b = Number(n) || 0;
  if (b < 1024) return `${b} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let v = b / 1024;
  let i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i++; }
  return `${v < 10 ? v.toFixed(1) : Math.round(v)} ${units[i]}`;
}

/** Short date like "Sep 2, 2026". */
export function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/** Sort filenames the way a person expects: IMG_2 before IMG_10. */
export function naturalCompare(a, b) {
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

/** Filename → something safe to use inside a storage object path. */
export function safeFilename(name) {
  return String(name || 'file')
    .normalize('NFKD')
    .replace(/[^\w.\-]+/g, '_')
    .replace(/_+/g, '_')
    .slice(-120);
}

/** Folder name → a nice ZIP filename, e.g. "Fall Festival 2026" → fall-festival-2026.zip */
export function zipNameFor(folderName) {
  const slug = String(folderName || 'files')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return `${slug || 'files'}.zip`;
}

/**
 * Give a filename a unique display name within a set of names already
 * in use: "photo.jpg" → "photo (2).jpg" → "photo (3).jpg" …
 */
export function uniqueName(name, taken) {
  if (!taken.has(name.toLowerCase())) return name;
  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : '';
  let i = 2;
  let candidate = `${base} (${i})${ext}`;
  while (taken.has(candidate.toLowerCase())) {
    i++;
    candidate = `${base} (${i})${ext}`;
  }
  return candidate;
}

export function isImageFile(file) {
  if (file.type && file.type.startsWith('image/')) return true;
  return /\.(jpe?g|png|gif|webp|avif|bmp|heic|heif|tiff?)$/i.test(file.name || '');
}

/** Coarse file "kind" for icons on non-image files. */
export function fileKind(name = '', mime = '') {
  const n = name.toLowerCase();
  if (mime.startsWith('image/') || /\.(jpe?g|png|gif|webp|avif|bmp|heic|heif|tiff?)$/.test(n)) return 'image';
  if (mime.startsWith('video/') || /\.(mp4|mov|m4v|webm|avi)$/.test(n)) return 'video';
  if (mime === 'application/pdf' || n.endsWith('.pdf')) return 'pdf';
  if (/\.(docx?|rtf|odt|txt|md)$/.test(n)) return 'doc';
  if (/\.(xlsx?|csv|ods)$/.test(n)) return 'sheet';
  if (/\.(zip|rar|7z|gz)$/.test(n)) return 'archive';
  return 'file';
}

/**
 * Build a small JPEG thumbnail for an image File in the browser.
 * Returns { blob, width, height } (width/height are the ORIGINAL
 * dimensions) or null when the browser can't decode the file
 * (HEIC on Windows, corrupt file, etc.). Uses createImageBitmap for
 * EXIF-correct orientation, with an <img> fallback.
 */
export async function makeThumbnail(file, maxEdge = 640) {
  let bitmap = null;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    bitmap = await loadViaImg(file).catch(() => null);
  }
  if (!bitmap) return null;

  const ow = bitmap.width;
  const oh = bitmap.height;
  if (!ow || !oh) return null;

  const scale = Math.min(1, maxEdge / Math.max(ow, oh));
  const w = Math.max(1, Math.round(ow * scale));
  const h = Math.max(1, Math.round(oh * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { alpha: false });
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  if (typeof bitmap.close === 'function') bitmap.close();

  const blob = await new Promise((res) => canvas.toBlob(res, 'image/jpeg', 0.82));
  if (!blob) return null;
  return { blob, width: ow, height: oh };
}

function loadViaImg(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode failed')); };
    img.src = url;
  });
}

/**
 * Supabase signed URLs accept a `download` query param that sets
 * Content-Disposition, so the browser saves with the right filename
 * instead of the storage path.
 */
export function withDownloadName(signedUrl, filename) {
  if (!signedUrl) return signedUrl;
  const sep = signedUrl.includes('?') ? '&' : '?';
  return `${signedUrl}${sep}download=${encodeURIComponent(filename)}`;
}

/** Run `worker(item)` over `items` with at most `limit` in flight. */
export async function runPool(items, limit, worker) {
  const queue = [...items];
  const runners = Array.from({ length: Math.min(limit, queue.length) }, async () => {
    while (queue.length) {
      const item = queue.shift();
      await worker(item);
    }
  });
  await Promise.all(runners);
}

export function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
