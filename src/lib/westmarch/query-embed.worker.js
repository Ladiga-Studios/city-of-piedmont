// Embeds a search query with nomic-embed-text-v1.5 (q8), the encoder the meeting-search
// shards were baked with (Westmarch's embed.js; see embed.js beside this file).
// Runs in a worker so loading the model never freezes the page.

const TRANSFORMERS = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1/dist/transformers.min.js';
const MODEL = 'nomic-ai/nomic-embed-text-v1.5';
const DIM = 256;

let extractor = null;

// Byte totals per file, so one progress number covers the tokenizer, config and model.
const files = new Map();
function report(p) {
  if (p?.status !== 'progress' || !p.file) return;
  files.set(p.file, { loaded: p.loaded || 0, total: p.total || 0 });
  let loaded = 0, total = 0;
  for (const f of files.values()) { loaded += f.loaded; total += f.total; }
  if (total) self.postMessage({ progress: Math.min(1, loaded / total) });
}

function load() {
  extractor ??= (async () => {
    const { pipeline, env } = await import(/* webpackIgnore: true */ TRANSFORMERS);
    env.allowLocalModels = false;
    env.useBrowserCache = true;
    return pipeline('feature-extraction', MODEL, { dtype: 'q8', progress_callback: report });
  })().catch((e) => { extractor = null; throw e; });
  return extractor;
}

/** Standardize over the full vector, slice to DIM, L2-normalize the slice. (Westmarch, verbatim.) */
function matryoshka(vec, dim = DIM) {
  const n = vec.length;
  let mean = 0;
  for (let i = 0; i < n; i++) mean += vec[i];
  mean /= n;
  let varsum = 0;
  for (let i = 0; i < n; i++) varsum += (vec[i] - mean) ** 2;
  const std = Math.sqrt(varsum / n + 1e-5);
  const out = new Array(Math.min(dim, n));
  for (let i = 0; i < out.length; i++) out[i] = (vec[i] - mean) / std;
  let norm = 0;
  for (const x of out) norm += x * x;
  norm = Math.sqrt(norm);
  if (norm) for (let i = 0; i < out.length; i++) out[i] /= norm;
  return out;
}

self.onmessage = async ({ data }) => {
  const { id, type, text } = data;
  try {
    const ex = await load();
    if (type === 'warm') { self.postMessage({ id, result: true }); return; }
    const output = await ex(`search_query: ${text}`, { pooling: 'mean', normalize: false });
    self.postMessage({ id, result: matryoshka(output.data) });
  } catch (e) {
    self.postMessage({ id, error: String(e?.message || e) });
  }
};
