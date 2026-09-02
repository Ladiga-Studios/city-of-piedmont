// Builds a ZIP in the visitor's browser by streaming each file straight
// from Supabase Storage into the archive, then saving it to disk.
//
// Why client-side: a Vercel function would have to pull all 300 photos
// through itself inside its execution time limit. Here nothing goes
// through the server at all; the only ceiling is the visitor's own
// connection. Photos are stored uncompressed (JPEGs don't shrink), so
// the ZIP is finished as fast as it can download.
//
// On Chrome/Edge the archive streams directly to the file the visitor
// picks (near-zero memory). On Safari/Firefox it is buffered as a Blob
// and then saved — fine for a few hundred photos on a laptop.
//
// MUST be called from a click handler: the save-file picker only opens
// during a user gesture.

/**
 * @param {Object}   opts
 * @param {Array<{name:string,url:string,size:number,lastModified?:string}>} opts.files
 * @param {string}   opts.zipName          e.g. "fall-festival-2026.zip"
 * @param {(p:{done:number,total:number,fileIndex:number,fileCount:number})=>void} [opts.onProgress]
 * @returns {Promise<'saved'|'cancelled'>}
 */
export async function downloadFilesAsZip({ files, zipName, onProgress }) {
  if (!files?.length) throw new Error('There are no files to download.');

  // 1) Ask where to save FIRST (must happen inside the user gesture).
  let handle = null;
  if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
    try {
      handle = await window.showSaveFilePicker({
        suggestedName: zipName,
        types: [{ description: 'ZIP archive', accept: { 'application/zip': ['.zip'] } }],
      });
    } catch (err) {
      if (err?.name === 'AbortError') return 'cancelled';
      handle = null; // picker unavailable (e.g. in an iframe) → blob fallback
    }
  }

  // client-zip is browser-only ESM; import lazily so Next never tries
  // to bundle it for the server.
  const { makeZip, predictLength } = await import('client-zip');

  const total = files.reduce((s, f) => s + (Number(f.size) || 0), 0);
  const count = files.length;

  // Exact archive size so progress can hit 100% and the OS shows the
  // right total while writing.
  let predicted = total;
  try {
    predicted = Number(predictLength(files.map((f) => ({ name: f.name, size: Number(f.size) || 0 }))));
  } catch { /* fall back to the raw byte total */ }

  // 2) Lazily fetch each file as the archive asks for it, keeping a few
  //    requests in flight so the stream never waits on latency.
  const LOOKAHEAD = 3;
  const pending = new Map();
  const start = (i) => {
    if (i < count && !pending.has(i)) pending.set(i, fetch(files[i].url));
  };

  let fileIndex = 0;
  async function* entries() {
    for (let i = 0; i < count; i++) {
      for (let k = i; k < i + LOOKAHEAD; k++) start(k);
      const res = await pending.get(i);
      pending.delete(i);
      if (!res.ok) throw new Error(`Could not fetch "${files[i].name}" (HTTP ${res.status}).`);
      fileIndex = i + 1;
      yield {
        name: files[i].name,
        lastModified: files[i].lastModified ? new Date(files[i].lastModified) : new Date(),
        input: res,
        size: Number(files[i].size) || undefined,
      };
    }
  }

  // 3) Count bytes as they pass through for the progress bar.
  let done = 0;
  const counter = new TransformStream({
    transform(chunk, controller) {
      done += chunk.byteLength;
      onProgress?.({ done: Math.min(done, predicted), total: predicted, fileIndex, fileCount: count });
      controller.enqueue(chunk);
    },
  });
  const zipStream = makeZip(entries(), { buffersAreUTF8: true, length: predicted }).pipeThrough(counter);

  // 4) Save.
  if (handle) {
    const writable = await handle.createWritable();
    try {
      await zipStream.pipeTo(writable); // pipeTo closes the writable on success
    } catch (err) {
      try { await writable.abort(); } catch { /* ignore */ }
      throw err;
    }
    return 'saved';
  }

  const blob = await new Response(zipStream, { headers: { 'Content-Type': 'application/zip' } }).blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = zipName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
  return 'saved';
}
