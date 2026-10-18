// Vendored from @fangorn-network/westmarch@0.0.20-dev (MIT, Fangorn Network) — src/core/rank.js.
// Kept byte-for-byte except where marked "piedmont:". Update by copying the file again
// from the same Westmarch version fangorn/package.json builds the view with.

// Ranking a row against a query. Two modes, chosen per row, so search degrades
// rather than breaks: cosine for rows that carry a vector, word-boundary lexical
// for rows that don't (or when the embedder won't load).
//
// Nothing here knows what a row IS. A row is `{ text, vector, norm }` — whatever
// the app's shard put in it. That is why this file is in the library and the
// grouping rules that turn hits into results (series, episodes, cues) are not:
// those are the app's semantics, this is arithmetic.

/** Cosine of a row's vector against a query vector. `row.norm` is precomputed at
 *  parse time (see shard.js `toRow`), `qn` by the caller once per query — the
 *  scan runs per row, so neither belongs inside it.
 *
 *  The shorter of the two lengths wins: vectors are matryoshka prefixes, so a
 *  256-d query and a 768-d row still line up on their leading components. */
export const cosine = (row, qv, qn) => {
    let d = 0;
    for (let i = 0; i < qv.length && i < row.vector.length; i++) d += row.vector[i] * qv[i];
    return d / (row.norm * qn);
};

/** L2 norm, for the query side. */
export const norm = (v) => { let n = 0; for (const x of v) n += x * x; return Math.sqrt(n) || 1; };

/**
 * How far above the corpus mean a cosine has to sit to count as a hit.
 *
 * Raw nomic-256 cosine is offset per query, not per corpus: measured on the
 * fangorn.tv catalog, EVERY row scores 0.38–0.65 against "panama", so `score > 0`
 * admitted all twelve and the one right answer was buried in eleven near-misses
 * that looked, by their printed scores, just as confident. Same measurement in z:
 * the right row lands 2.4σ above that query's own mean, the plausible ones ~1.3σ,
 * the rest below.
 *
 * Lexical scores keep a meaningful zero (a term either matched or it didn't), so
 * this applies to the semantic half only.
 */
export const Z_FLOOR = 1;

/** score ≥ mean + Z_FLOOR·σ, or -Infinity when there's no distribution to speak
 *  of (too few rows, or every row scored the same). */
export function zFloor(scores, z = Z_FLOOR) {
    if (scores.length < 3) return -Infinity;
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const sd = Math.sqrt(scores.reduce((s, x) => s + (x - mean) ** 2, 0) / scores.length);
    return sd > 1e-6 ? mean + z * sd : -Infinity;
}

/**
 * Maximal Marginal Relevance: pick the next-best row that is not already said.
 *
 * Ranking by score alone returns the same thing several times, because in an
 * embedding space near-duplicates sit next to each other by construction. Ask
 * for eight neighbours of Frostpunk and three of them are consecutive episodes
 * of the same cartoon; build a taste from one film and five of the six
 * recommendations are the same series. The list looks confident and says one
 * thing.
 *
 * So: greedily take the row maximising `λ·score − (1−λ)·(closest already taken)`.
 * λ=1 is the old behaviour. Lower trades a little relevance for a list that
 * covers more ground, which for a recommendation IS the relevance.
 *
 * `ranked` is `[{ row, s }]` sorted desc, rows carrying `.vector` and `.norm`.
 * Only the top `pool` are considered — beyond that the scores are noise and the
 * arithmetic is O(limit · pool · dim), about 128k multiplies at the defaults.
 */
export function diversify(ranked, { limit = 10, lambda = 0.7, key = "s" } = {}) {
    if (lambda >= 1 || ranked.length <= 1) return ranked.slice(0, limit);
    const pool = ranked.slice(0, Math.max(limit * 6, 30));
    const out = [];
    while (out.length < limit && pool.length) {
        let at = 0, best = -Infinity;
        for (let i = 0; i < pool.length; i++) {
            let sim = 0;
            // `cosine(a, b.vector, b.norm)` is dot/(a.norm·b.norm) — the same
            // arithmetic as a query, with the other row standing in for one.
            for (const p of out) {
                if (!pool[i].row?.vector || !p.row?.vector) continue;
                const c = cosine(pool[i].row, p.row.vector, p.row.norm);
                if (c > sim) sim = c;
            }
            const val = lambda * pool[i][key] - (1 - lambda) * sim;
            if (val > best) { best = val; at = i; }
        }
        out.push(pool.splice(at, 1)[0]);
    }
    return out;
}

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const wordRe = (s) => new RegExp(`\\b${esc(s)}\\b`);

/**
 * Word-boundary term scoring, normalized to 0..1 so it merges with cosine scores.
 *
 * This used to be a bare `text.includes(q)`, which meant a search for "cat"
 * ranked "intoxi(cat)ed" and "edu(cat)ion" — every short query drowned in
 * substring noise. Terms must now match whole words; the full phrase and an
 * early position are bonuses on top.
 *
 * `q` is expected lowercased — the caller lowercases once per query, not per row.
 */
export function lexScore(row, q) {
    const text = String(row.text ?? "").toLowerCase();
    if (!text) return 0;
    const terms = q.split(/\s+/).filter(Boolean);
    if (!terms.length) return 0;

    let hits = 0;
    for (const t of terms) if (wordRe(t).test(text)) hits++;
    if (!hits) return 0;

    const at = text.indexOf(q);
    return Math.min(1,
        0.5 * (hits / terms.length)                       // how much of the query is present
        + (wordRe(q).test(text) ? 0.35 : 0)               // the whole phrase, intact
        + (at >= 0 ? 0.15 * (1 - at / text.length) : 0)); // earlier beats later
}

/** Of a list of timestamped passages, the one a hit should quote and seek to:
 *  the line that best matches the query, or the first when nothing matches
 *  lexically (a semantic hit on a whole transcript has no single line to point
 *  at). Generic over `{ text }` — cues, chapters, log lines, commit messages. */
export function bestPassage(passages, ql) {
    let best = passages[0], score = 0;
    for (const c of passages) {
        const s = lexScore({ text: c.text }, ql);
        if (s > score) { score = s; best = c; }
    }
    return best;
}

/**
 * Rank catalog entries against a lookahead vector, WITHOUT downloading them.
 *
 * The point is choosing what to pull before the bytes move: a view that watches
 * something big can't be downloaded whole, and the only thing available to decide
 * with is the coverage centroids the bake writes into catalog.json.
 *
 * A domain baked before coverage existed gets `affinity: null` and sorts last —
 * NOT 0, which would claim it was measured and found unrelated.
 */
export function rankDomains(domains = [], q) {
    const qn = norm(q);
    return domains
        .map((d) => {
            const c = d.coverage;
            if (!c?.vectors?.length) return { ...d, affinity: null };
            let best = -1;
            for (const v of c.vectors) {
                let dot = 0, vn = 0;
                for (let i = 0; i < v.length && i < q.length; i++) { dot += v[i] * q[i]; vn += v[i] * v[i]; }
                const score = dot / ((Math.sqrt(vn) || 1) * qn);
                if (score > best) best = score;
            }
            return { ...d, affinity: best };
        })
        .sort((a, b) => (b.affinity ?? -Infinity) - (a.affinity ?? -Infinity));
}

// piedmont: the Node self-check that ends this file upstream is left out of the browser copy
// (it reads process.argv, which a browser does not have). Run it from node_modules instead.
