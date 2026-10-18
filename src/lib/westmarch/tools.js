// Vendored from @fangorn-network/westmarch@0.0.20-dev (MIT, Fangorn Network) — src/agent/tools.js.
// Kept byte-for-byte except where marked "piedmont:". Update by copying the file again
// from the same Westmarch version fangorn/package.json builds the view with.

// Five verbs over a corpus of rows. Nothing here knows what the rows ARE.
//
// That is the whole demonstration. sond3r's WebMCP surface has nineteen tools
// and most of them are television — capture a frame, program a channel, cut a
// montage. These five are what is left when you take the app out: describe the
// corpus, search it, pull one record, count a field, find neighbours. Point them
// at archival film and they answer questions about archival film; point them at
// an OSM export or a decade of notes and they answer about that, because a row
// is `{ id, ...fields, text, vector, norm }` and nothing below reads a field by
// name that the caller did not name.
//
// Pure functions, so `node tools.js` checks them with no browser and no network.

import { bestPassage, cosine, lexScore, norm, zFloor } from "./rank.js";
import { briefOf, collections, linkOf, pick, subtitleOf, titleOf, typeOf, values } from "./roles.js";

/** Fields that are plumbing rather than content — never worth faceting or
 *  showing as "what this corpus holds". */
const PLUMBING = new Set(["text", "vector", "norm", "id", "owner", "embed"]);

/** A cheap, stable preview of a row for a tool result. The full record is one
 *  `get-row` away, and an agent that gets 50 full rows back has spent its whole
 *  context on one call.
 *
 *  It takes `roles` — the publisher's own declaration of which field is the
 *  title — rather than a list of field names. Hardcoding `name`/`path`/`desc`
 *  worked on the archive bundle and returned `{id, undefined, undefined}` on the
 *  first other dataset it saw. `fields` adds to that, it does not replace it. */
export const brief = (r, roles, fields = []) => {
    const out = briefOf(r, roles, fields);
    const link = linkOf(r, roles);
    return link ? { ...out, url: link } : out;
};

/**
 * What is in here at all — the call an agent makes first, before it knows the
 * shape of anything.
 *
 * Field coverage rather than a schema: these rows come off a publisher's own
 * bundle and nobody promised they are uniform. "`series` on 61% of rows" is the
 * fact an agent needs to decide whether faceting on it means anything, and a
 * declared schema would have said 100% and been wrong.
 */
export function describe(rows) {
    const counts = new Map();
    let vectors = 0, dim = 0;
    for (const r of rows) {
        if (r.vector) { vectors++; dim ||= r.vector.length; }
        for (const k of Object.keys(r)) {
            if (PLUMBING.has(k)) continue;
            if (r[k] == null || r[k] === "") continue;
            counts.set(k, (counts.get(k) ?? 0) + 1);
        }
    }
    return {
        rows: rows.length,
        // Search is only semantic for rows that carry one; the rest fall back to
        // lexical. An agent that gets nonsense from a query deserves to know which
        // half of the corpus it was searching.
        withVectors: vectors, vectorDim: dim,
        owners: [...new Set(rows.map((r) => r.owner).filter(Boolean))],
        fields: [...counts].sort((a, b) => b[1] - a[1])
            .map(([name, n]) => ({ name, on: n, pct: Math.round((100 * n) / (rows.length || 1)) })),
    };
}

/**
 * Rank rows against a query. Semantic where the row has a vector, lexical where
 * it doesn't, and the mode is reported per hit rather than hidden — degrading
 * silently is how "search stopped working" turns into an afternoon.
 *
 * `qv` is passed in, not computed: embedding is async and model-shaped, and
 * keeping it out here is what lets this file be a pure-function self-check.
 */
/** How much an exact word match adds to a cosine. Meaning alone ranks "wisconsin rapids"
 *  by what the towns have in common (every row is in Wisconsin), so an Eau Claire item
 *  about a bike ride "across Wisconsin" beat every Wisconsin Rapids one. The words decide
 *  among rows that mean about the same thing; they never outvote meaning outright.
 *  Measured on Quorum's eval (quorum/eval/search.mjs, 11k rows), top-5 precision / known @1:
 *  0 → towns 92%, topics 88%, @1 91%;  0.1 → 100/94/97;  0.15 → 100/98/98.5;  0.3 → 100/98/97. */
export const LEX_BOOST = 0.15;

// The words a row can be found by: its title, subtitle and tags, not only its prose.
// A town, a body or a kind lives in the tags, and "Plover" should find Plover's items.
const lexCache = new WeakMap();
const lexText = (r, roles) => {
    let t = lexCache.get(r);
    if (t === undefined) {
        t = [titleOf(r, roles), subtitleOf(r, roles) ?? "", ...(roles.tags ?? []).flatMap((f) => values(r[f] ?? "")), r.text ?? ""].join(" ");
        lexCache.set(r, t);
    }
    return t;
};

export function search(rows, query, roles, { qv = null, limit = 10, fields, where, lexBoost = LEX_BOOST } = {}) {
    const ql = query.trim().toLowerCase();
    if (!ql) return [];
    const qn = qv ? norm(qv) : 1;
    // Filtered BEFORE scoring, so the z-floor is measured over the rows that
    // could actually be returned. "sad songs before 1970" floored against the
    // whole corpus admits whatever the corpus is mostly about; floored against
    // pre-1970 rows it separates the sad ones from the rest of that shelf.
    // This is the difference between a search that composes and one that only
    // ever answers the question the way it was asked.
    if (where) rows = rows.filter((r) => matches(r, where));
    const scored = rows.map((r) => (qv && r.vector
        ? { r, score: cosine(r, qv, qn) + (lexBoost ? lexBoost * lexScore({ text: lexText(r, roles) }, ql) : 0), mode: "semantic" }
        : { r, score: lexScore({ text: lexText(r, roles) }, ql), mode: "lexical" }));
    // The floor is per QUERY over the whole corpus, so it is measured before
    // anything is dropped. Raw cosine is offset per query, not per corpus: on this
    // catalog every row scores 0.38–0.65 against anything, and `score > 0` admits
    // all 42,215 of them in confident-looking order.
    const sem = scored.filter((x) => x.mode === "semantic").map((x) => x.score);
    // The best semantic row always survives its own floor. On a big corpus the
    // floor never touches it; on a small one it does — three rows where one is an
    // exact match put the mean so high that the floor lands ABOVE the match, and
    // the corpus answers a question it can answer with nothing at all.
    const floor = Math.min(zFloor(sem), sem.length ? Math.max(...sem) : Infinity);
    return scored
        .filter((x) => (x.mode === "semantic" ? x.score >= floor : x.score > 0))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map(({ r, score, mode }) => ({ ...brief(r, roles, fields), score: Number(score.toFixed(4)), mode }));
}

/**
 * Does a row match every `{field: value}` in `where`?
 *
 * Case-insensitive on purpose. An agent that reads `top: ["comedy"]` off a facet
 * and passes "Comedy" back gets an empty result and no idea why — and one bundle
 * here mixes cases across fields (`genre` lowercase, `subject` title case).
 * Matching is still exact on the WHOLE value, so "comedy" never matches "dark
 * comedy": near-misses are the trap, not near-matches.
 *
 * Shared by facet and browse deliberately. Two copies of a filter that drifted
 * would make "count the Events" and "list the Events" disagree, which is the
 * kind of bug nobody reports because both answers look plausible.
 */
export const matches = (row, where) => !where || Object.entries(where).every(([k, v]) =>
    values(row[k] ?? "").some((x) => x.toLowerCase() === String(v).toLowerCase()));

/**
 * Count a field's values. The verb that makes a corpus legible without reading
 * it — "how many events per season", "which decades", "who published what".
 *
 * Multi-valued fields are split by `values()` in roles.js, which is also what
 * shapes a preview's tags: one definition, so "count the Summer events" and
 * "list the Summer events" cannot disagree about what a Summer event is.
 */
export function facet(rows, field, { limit = 20, where } = {}) {
    const counts = new Map();
    let missing = 0;
    for (const r of rows) {
        if (!matches(r, where)) continue;
        const raw = r[field];
        if (raw == null || raw === "") { missing++; continue; }
        for (const v of values(raw)) counts.set(v, (counts.get(v) ?? 0) + 1);
    }
    const sorted = [...counts].sort((a, b) => b[1] - a[1]);
    return {
        field, distinct: counts.size, missing,
        top: sorted.slice(0, limit).map(([value, count]) => ({ value, count })),
    };
}

/**
 * List a collection, with no query at all.
 *
 * The most basic thing anyone does with a storefront — "show me what's here" —
 * and the only one the other four verbs cannot do: `search` needs a query,
 * `similar-rows` needs a seed id you can only get from a search, and `facet`
 * returns counts rather than rows. Without this an agent's first move on an
 * unfamiliar corpus has to be a guess.
 *
 * `sort` names a field; rows that have it come first, ordered numerically where
 * both values parse as numbers and lexically otherwise, because a bundle's
 * `rating` is the string "4.7" and sorting that as text puts "10" below "9".
 */
export function browse(rows, roles, { type, where, sort, desc = true, limit = 20, offset = 0, fields } = {}) {
    let hits = rows.filter((r) => (!type || typeOf(r)?.toLowerCase() === String(type).toLowerCase()) && matches(r, where));
    const total = hits.length;
    if (sort) {
        const num = (v) => (v == null || v === "" ? null : Number(v));
        hits = [...hits].sort((a, b) => {
            const [x, y] = [a[sort], b[sort]];
            if ((x == null || x === "") !== (y == null || y === "")) return x == null || x === "" ? 1 : -1;
            const [nx, ny] = [num(x), num(y)];
            const c = Number.isFinite(nx) && Number.isFinite(ny) ? nx - ny : String(x ?? "").localeCompare(String(y ?? ""));
            return desc ? -c : c;
        });
    }
    return {
        total, offset, returned: Math.min(limit, Math.max(0, total - offset)),
        collections: type ? undefined : collections(roles, rows).map((c) => ({ type: c.type, plural: c.plural, count: c.count })),
        rows: hits.slice(offset, offset + limit).map((r) => brief(r, roles, fields)),
    };
}

/** Rows nearest a given row, by vector. "More like this", with no query to
 *  write — which is how an agent explores a corpus whose vocabulary it doesn't
 *  know yet. Returns nothing (not an error) for a row with no vector. */
export function neighbors(rows, id, roles, { limit = 10, fields } = {}) {
    const seed = rows.find((r) => r.id === id);
    if (!seed?.vector) return { seed: seed ? brief(seed, roles, fields) : null, near: [] };
    const qn = seed.norm;
    return {
        seed: brief(seed, roles, fields),
        near: rows
            .filter((r) => r.id !== id && r.vector)
            .map((r) => ({ r, score: cosine(r, seed.vector, qn) }))
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(({ r, score }) => ({ ...brief(r, roles, fields), score: Number(score.toFixed(4)) })),
    };
}

/**
 * One thing followed across rows: a matter a committee took up and then the council, as a
 * thread whose steps are in order. Rows group by the declared `thread` role (view.js wrote
 * each row's target onto it); the thread's head is the target row itself, when this corpus
 * holds it. The thread that moved last comes first.
 *
 * A step is one occasion: rows sharing a date and a subtitle (an agenda and its minutes)
 * count once, keeping the one that says the most. `where` narrows the steps, `id` asks for
 * one thread, and `min` (default 2) is how many steps make a thread: a matter taken up once
 * so far is a record, not news.
 *
 * ponytail: the head is found by value (any field of a row that is not itself a step), since
 * a fused view's identity role names one type's field. Index it if corpora get huge.
 */
export function threads(rows, roles, { id, where, min = 2, limit = 20, offset = 0, fields = [] } = {}) {
    const f = roles.thread;
    if (!f) return { total: 0, offset, threads: [], error: "this corpus declares no thread relation" };
    const dateOf = (r) => String(pick(r, roles.temporal) ?? "").slice(0, 10);
    const groups = new Map();
    for (const r of rows) {
        const k = r[f] == null ? "" : String(r[f]);
        if (!k || (id != null && k !== String(id)) || !matches(r, where)) continue;
        const occ = `${dateOf(r)}|${subtitleOf(r, roles) ?? ""}`;
        const g = groups.get(k) ?? groups.set(k, new Map()).get(k);
        const had = g.get(occ);
        if (!had || String(r.text ?? "").length > String(had.text ?? "").length) g.set(occ, r);
    }
    const heads = new Map();
    for (const r of rows) {
        if (r[f] != null) continue;
        for (const v of Object.values(r)) if (typeof v === "string" && groups.has(v) && !heads.has(v)) heads.set(v, r);
    }
    const all = [...groups].map(([k, g]) => {
        const steps = [...g.values()].sort((a, b) => dateOf(a).localeCompare(dateOf(b)));
        const head = heads.get(k), last = steps.at(-1);
        return {
            id: k, title: titleOf(head ?? last, roles), url: linkOf(head ?? last, roles), first: dateOf(steps[0]), date: dateOf(last),
            head: head ? brief(head, roles, fields) : null,
            steps: steps.map((r) => ({ ...brief(r, roles, fields), date: dateOf(r) })),
        };
    }).filter((t) => t.steps.length >= min || id != null).sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
    return { total: all.length, offset, threads: all.slice(offset, offset + limit) };
}

/** One row, whole. Deliberately the only verb that returns everything — the
 *  others preview, so an agent chooses when to spend its context. */
export function getRow(rows, id, roles) {
    // id first, then whatever the publisher calls a title — an agent that read a
    // title off a search result and passed it back must land on the same row.
    if (!id) return null;   // else `x.path === undefined` matches the first row lacking one
    // A view built from commits keys rows by vertex CID, so the publisher's own id
    // (the declared identity field) has to find them too.
    const r = rows.find((x) => x.id === id)
        ?? (roles?.identity ? rows.find((x) => String(x[roles.identity]) === String(id)) : null)
        ?? rows.find((x) => x.path === id || x.name === id || titleOf(x, roles) === id);
    if (!r) return null;
    const { vector, norm: _n, ...rest } = r;
    return { ...rest, hasVector: !!vector, vectorDim: vector?.length ?? 0 };
}

// piedmont: the Node self-check that ends this file upstream is left out of the browser copy
// (it reads process.argv, which a browser does not have). Run it from node_modules instead.
