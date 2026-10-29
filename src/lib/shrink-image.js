// Shrinks a photo in the browser before it is uploaded.
//
// Why: Vercel rejects any request body over 4.5 MB (413
// FUNCTION_PAYLOAD_TOO_LARGE) before our API route even runs, and phone
// photos are often 3 to 10 MB. Resizing to a sensible size keeps every
// upload well under the limit and still plenty sharp for an email.
//
// Returns a JPEG File no larger than `maxBytes` when the browser can decode
// the image, the original file when it is already small enough, or null when
// it cannot be decoded and is too big to send (e.g. HEIC in Chrome).

const DEFAULT_MAX_BYTES = 3.5 * 1024 * 1024;

async function decode(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      /* fall through to <img> */
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode failed')); };
    img.src = url;
  });
}

function toBlob(canvas, quality) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
}

export async function shrinkImage(file, { maxBytes = DEFAULT_MAX_BYTES, maxEdge = 2048 } = {}) {
  if (!file || file.size === 0) return file;

  // Small JPEG/PNG/WebP files go through untouched.
  const easy = /^image\/(jpeg|png|webp|gif)$/i.test(file.type || '');
  if (easy && file.size <= maxBytes) return file;

  let img;
  try {
    img = await decode(file);
  } catch {
    return file.size <= maxBytes ? file : null;
  }

  const w0 = img.width || img.naturalWidth;
  const h0 = img.height || img.naturalHeight;
  if (!w0 || !h0) return file.size <= maxBytes ? file : null;

  let edge = maxEdge;
  for (let attempt = 0; attempt < 5; attempt++) {
    const scale = Math.min(1, edge / Math.max(w0, h0));
    const w = Math.max(1, Math.round(w0 * scale));
    const h = Math.max(1, Math.round(h0 * scale));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; // flatten transparent PNGs onto white
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
    const blob = await toBlob(canvas, attempt === 0 ? 0.82 : 0.75);
    if (blob && blob.size <= maxBytes) {
      if (typeof img.close === 'function') img.close();
      const name = (file.name || 'photo').replace(/\.[^.]+$/, '') + '.jpg';
      return new File([blob], name, { type: 'image/jpeg', lastModified: Date.now() });
    }
    edge = Math.round(edge * 0.75);
  }
  if (typeof img.close === 'function') img.close();
  return file.size <= maxBytes ? file : null;
}
