// The parts of @fangorn-network/westmarch@0.0.20-dev src/core/embed.js (MIT, Fangorn Network)
// the minutes page needs: the int8 vector wire format (unpackVec, read by shard.js) and the
// query embedder.
//
// piedmont: the query embedder runs in query-embed.worker.js and loads transformers.js from
// jsDelivr at runtime rather than through the site's bundle, so the ~1 MB runtime and its
// WASM never touch a page that does not search by meaning. The model, the "search_query: "
// prefix and the matryoshka post-processing are Westmarch's exactly: the document vectors in
// the shards came out of the same encoder, and cosine between two encoders is noise.

export const EMBED_MODEL = 'nomic-ai/nomic-embed-text-v1.5';
export const EMBED_DIM = 256;

/** base64 int8 → Float16Array (Float32Array where there is none). Null on anything malformed:
 *  a bad vector must degrade that row to lexical, never throw mid-search. (Westmarch, verbatim.) */
export function unpackVec(b64) {
  try {
    const s = atob(b64);
    const out = new (globalThis.Float16Array ?? Float32Array)(s.length);
    for (let i = 0; i < s.length; i++) {
      const b = s.charCodeAt(i);
      out[i] = (b > 127 ? b - 256 : b) / 127;
    }
    return out.length ? out : null;
  } catch { return null; }
}

// ── the query embedder, off the main thread ─────────────────────────────────────

let worker = null;
let seq = 0;
const pending = new Map();
let ready = null;

function getWorker() {
  if (worker) return worker;
  worker = new Worker(new URL('./query-embed.worker.js', import.meta.url), { type: 'module' });
  worker.onmessage = ({ data }) => {
    const p = pending.get(data.id);
    if (!p) return;
    pending.delete(data.id);
    if (data.error) p.reject(new Error(data.error));
    else p.resolve(data.result);
  };
  worker.onerror = (e) => {
    for (const p of pending.values()) p.reject(new Error(e.message || 'embedder failed'));
    pending.clear();
  };
  return worker;
}

function ask(type, text, onProgress) {
  return new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject });
    const w = getWorker();
    if (onProgress) {
      const listen = ({ data }) => {
        if (data.progress != null) onProgress(data.progress);
        if (data.id === id) w.removeEventListener('message', listen);
      };
      w.addEventListener('message', listen);
    }
    w.postMessage({ id, type, text });
  });
}

/** Load the model (downloads it the first time, then the browser caches it).
 *  `onProgress(0..1)` while it downloads. Rejects if it cannot load: search stays lexical. */
export function warmEmbedder(onProgress) {
  ready ??= ask('warm', '', onProgress).catch((e) => { ready = null; throw e; });
  return ready;
}

/** Free text → 256-d unit vector, the same space as the shards' `v`. */
export async function embedQuery(text) {
  await warmEmbedder();
  return ask('query', text);
}
