// Vendored from @fangorn-network/westmarch@0.0.20-dev (MIT, Fangorn Network) — src/core/roles.js.
// Kept byte-for-byte except where marked "piedmont:". Update by copying the file again
// from the same Westmarch version fangorn/package.json builds the view with.

// What a row means, when nobody wrote code for this dataset.
//
// A generic reader has one hard problem: it has rows, and no idea which field is
// the title. Hardcode `name` and it works on one corpus and returns `undefined`
// on the next — which is exactly what happened the first time the probe was
// pointed at a second bundle.
//
// The answer is already baked. A quickbeam domain manifest carries `role_map`
// (which field is the title, the subtitle, the tags, the prose to search, the
// measures, the location, the link) and `presentation` (an icon, an accent and a
// singular/plural name per entity type, plus per-type external URL templates).
// The publisher declared all of it when they shaped the graph. This file reads
// that declaration, merges it across the domains a view fuses, and falls back to
// sniffing when a domain was baked before role_map existed.
//
// So: a page written against these roles renders any bundle. That is the whole
// point of the file — it is the difference between a demo and a storefront.

/**
 * A field's values, as a list.
 *
 * Bundles are ragged about this in a way that matters: the SAME field arrives as
 * a real array on one row, as `"['Sitcom', 'Comedy']"` on the next, and as
 * `"Documentary,History"` on a third — all three are in one shard here. A reader
 * that passes them through unchanged hands an agent two different shapes for one
 * field and it filters on the wrong one.
 *
 * A comma with NO space after it is the signature of a machine-joined list.
 * Prose keeps its space ("Wilson, Michael G.") and must stay one value.
 *
 * ponytail: a sniff, not a parser. A value it misreads becomes a odd-looking
 * bucket, never a wrong answer to a filter — matching is on whole values.
 */
const BRACKETED = /^\s*[[(].*[\])]\s*$/;
const JOINED = /,(?! )/;
export function values(v) {
    if (Array.isArray(v)) return v.map((x) => String(x));
    const s = String(v ?? "");
    const inner = BRACKETED.test(s) ? s.trim().slice(1, -1) : JOINED.test(s) ? s : null;
    if (inner === null) return s === "" ? [] : [s];
    return inner.split(",").map((x) => x.trim().replace(/^['"]|['"]$/g, "")).filter(Boolean);
}

/** Fields worth sniffing for, in order, when a domain declares no role_map. */
const GUESS = {
    title: ["title", "name", "label", "headline", "path"],
    subtitle: ["subtitle", "primaryType", "entityType", "kind", "series", "creator"],
    text: ["text", "desc", "description", "summary", "body", "abstract"],
};
const first = (fields, candidates) => candidates.find((c) => fields.has(c)) ?? null;
const arr = (v) => (Array.isArray(v) ? v.filter(Boolean) : v ? [v] : []);

/**
 * Merge a view's domain manifests into one presentation contract.
 *
 * A view fuses several publishers' domains and they need not agree — one may
 * call its title `title` and another `name`. Merging rather than picking the
 * first is what lets a fused view render both: `title` becomes an ordered list
 * of candidates and `titleOf` takes whichever a given row actually has.
 *
 * `sample` is any rows already downloaded; it is only consulted for a domain
 * that declared nothing, and an empty sample is fine — the guesses below are
 * ordered by how commonly they mean what they say.
 */
export function rolesFrom(manifests = [], sample = []) {
    const seen = new Set();
    for (const r of sample) for (const k of Object.keys(r)) seen.add(k);

    const title = [], subtitle = [], tags = [], text = [], measures = [], spatial = [], media = [], temporal = [], facets = [];
    const labels = {}, types = {}, fieldLabels = {}, externalUrl = {}, actions = {};
    let launch = null, refers = null;
    const entityTypes = [];
    const gates = [];
    let identity = null, thread = null;

    const push = (into, v) => { for (const x of arr(v)) if (x && !into.includes(x)) into.push(x); };

    for (const m of manifests) {
        const rm = m?.role_map ?? {};
        push(title, rm.title); push(subtitle, rm.subtitle); push(tags, rm.tags);
        push(text, rm.text); push(measures, rm.measures); push(spatial, rm.spatial); push(media, rm.media); push(temporal, rm.temporal);
        identity ??= rm.identity ?? null;
        // The relation that follows one thing across rows: an agenda item's `part_of` names
        // its matter, so the items taken up at a committee and then the council are one thread.
        // view.js writes the target's identity onto the row; a reader groups by it.
        thread ??= rm.thread ?? null;
        // Where a row in THIS corpus points, in someone else's.
        //
        // The 21,131 subtitle rows in the archive bundle each carry the `path`
        // of the film they were transcribed from, and every one of them resolves
        // — a total foreign key across two separately baked, separately priced
        // domains. Without this the consumer shows them as two unrelated
        // shelves, which loses the entire reason the graph holds them together:
        // you search what was SAID and arrive at what was FILMED.
        //
        // Declared, never sniffed. Testing whether one corpus's values happen to
        // be a subset of another's would join two publishers who never agreed to
        // be joined, on a collision.
        if (rm.refers?.field && rm.refers?.corpus && rm.refers?.to) refers ??= { ...rm.refers };
        Object.assign(labels, rm.labels ?? {});
        for (const f of arr(rm.fields)) seen.add(f);

        const pr = m?.presentation ?? {};
        Object.assign(types, pr.types ?? {});
        Object.assign(fieldLabels, pr.fieldLabels ?? {});
        Object.assign(externalUrl, pr.externalUrl ?? {});
        Object.assign(actions, pr.actions ?? {});
        // The fields a reader narrows by first (a town, a genre): the app's to name.
        push(facets, pr.facets);
        // The app's own interface, if it ships one. A url, not markup: it is a
        // separate document with a separate origin, which is the only way a
        // stranger's UI can be run at all.
        // Where the app lives as a page of its own. An index that CONTAINS every
        // app is a portal; one that points at them is a directory — and the
        // choice is forced, not aesthetic: a framed document's modelContext is
        // not the agent's, so hosting a real app deletes every tool it
        // registers. The useful thing an index can do is hand over what it
        // learned and get out of the way. `{taste}` and `{q}` fill at launch.
        launch ??= pr.launch ?? null;
        for (const t of arr(m?.entity_types)) entityTypes.push(t);
        if (m?.paywall) gates.push({ domain: m.name ?? null, ...m.paywall });
    }

    // Only where the manifests said nothing at all. A domain that declared a
    // title must never be second-guessed by a sniff.
    //
    // Fields the sample actually has come first; the rest of the guess list
    // follows. That tail matters more than it looks: sniffing needs a sample,
    // and the one caller who needs roles EARLIEST — `rowText`, which runs per
    // row during parsing — has no sample yet by definition. With the tail, an
    // empty sample still yields usable candidates and `pick` takes whichever the
    // row turns out to have; without it, every row parsed with empty text and
    // lexical search silently matched nothing.
    const guess = (into, candidates) => {
        if (into.length) return;
        push(into, candidates.filter((c) => seen.has(c)));
        push(into, candidates);
    };
    guess(title, GUESS.title);
    guess(subtitle, GUESS.subtitle);
    guess(text, GUESS.text);

    return {
        title, subtitle, tags, text, measures, spatial, media, temporal, facets, identity, thread,
        labels, types, fieldLabels, externalUrl, actions, launch, refers, entityTypes,
        // What this view sells, if anything. A list because a fused view can pull
        // domains from several publishers and they price independently.
        gates,
        // Every field any domain mentions, plus everything the sample carried.
        // This is what a facet picker offers.
        fields: [...seen].sort(),
        // True when at least one domain actually declared its shape, so a caller
        // can say "sniffed" rather than implying the publisher chose this.
        declared: manifests.some((m) => m?.role_map),
    };
}

/**
 * Which collection a row belongs to.
 *
 * `entityType` is quickbeam's own convention — both bundles here carry it, and
 * the manifest's `entity_types` counts are keyed by it — so this is the one
 * field name the format actually fixes. `kind` is the older spelling and is
 * still on-chain in sond3r's vertices, hence the fallback.
 */
export const typeOf = (row) => {
    const t = row?.entityType ?? row?.kind;
    return t == null || t === "" ? null : String(t);
};

/**
 * English plural, for a type whose publisher declared none.
 *
 * ponytail: four rules. It exists because appending a bare "s" produced
 * "subtitless" on a real bundle, which reads as a bug in the page rather than a
 * missing declaration. A publisher who cares about the word declares `plural`
 * in `presentation.types` and none of this runs.
 */
export function pluralize(word) {
    const w = String(word);
    // Already ends in s: assume it is already plural and leave it. Bundles name
    // types like `subtitles` and `series`, and both "subtitless" and
    // "subtitleses" read as a bug in the page. A genuine singular ending in s
    // ("bus") comes out wrong, which is what declaring `plural` is for.
    if (/s$/i.test(w)) return w;
    if (/(x|z|ch|sh)$/i.test(w)) return `${w}es`;
    if (/[^aeiou]y$/i.test(w)) return `${w.slice(0, -1)}ies`;
    return `${w}s`;
}

/**
 * A collection, as the publisher wants it shown: its icon, accent, and the word
 * for one of them and many. `count` comes from the manifest where it was baked
 * and from the rows otherwise — a fused view has manifest counts for some
 * domains and not others, and a browse column that said "—" for half of them
 * would be worse than counting.
 *
 * Everything is optional. A bundle that declared no presentation still browses;
 * it just does so with the raw type name and no icon, which is honest.
 */
export function collections(roles, rows = []) {
    const counted = new Map();
    for (const t of roles.entityTypes) counted.set(t.type, (counted.get(t.type) ?? 0) + (t.count ?? 0));
    if (!counted.size) for (const r of rows) { const t = typeOf(r); if (t) counted.set(t, (counted.get(t) ?? 0) + 1); }
    return [...counted]
        .map(([type, count]) => {
            const p = roles.types[type] ?? {};
            return {
                type, count,
                icon: p.icon ?? null, accent: p.accent ?? null,
                singular: p.singular ?? type,
                plural: p.plural ?? pluralize(p.singular ?? type),
            };
        })
        .sort((a, b) => b.count - a.count);
}

/**
 * What a paid domain is withholding, and what it costs.
 *
 * The shard a reader downloaded is a free INDEX: every row is present, every
 * vector is present, so search and ranking are complete and private. What is
 * absent is a named set of fields. That distinction is the whole offer, and a
 * client that blurs it — "some results may be incomplete" — makes the purchase
 * unjudgeable. Name the fields.
 *
 * `unpublished` marks a gate whose payload has not been sealed and uploaded yet:
 * declared, priced, and nothing to buy. That is a different state from "not yet
 * paid for" and a reader must not offer to sell it.
 */
export function gatesOf(roles) {
    return (roles.gates ?? []).map((g) => ({
        domain: g.domain ?? null,
        locked: [...(g.locked ?? [])],
        free: [...(g.free ?? [])],
        price: String(g.price ?? "0"),
        asset: g.asset ?? "USDC",
        resourceId: g.resourceId ?? null,
        workerUrl: g.workerUrl ?? null,
        files: (g.files ?? []).map((f) => ({ file: f.file, count: f.count, bytes: f.bytes })),
        unpublished: !g.resourceId,
    }));
}

/** Is this field withheld from the free tier anywhere in this view? */
export const isLocked = (field, roles) =>
    (roles.gates ?? []).some((g) => (g.locked ?? []).includes(field));

/** Is this row part of the corpus's free sample — the deterministic slice a
 *  paywalled bake hands over whole so a buyer can read before paying?
 *
 *  The bake picks it by hashing the row's own id (quickbeam `paywall.in_sample`),
 *  which is what stops a seller putting its best rows in the shop window. That
 *  only holds if someone CHECKS, and the check is this function: anyone can
 *  recompute which rows should be free and see whether the shard agrees. */
export async function inSample(trackId, rate) {
    if (!(rate > 0)) return false;
    if (rate >= 1) return true;
    const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(String(trackId)));
    return new DataView(d).getUint32(0) < rate * 2 ** 32;
}

/** Price in whole USDC, for display. Base units are 6-decimal on every network
 *  this settles on; a bare "50000" on a buy button is not a price anyone reads. */
export const priceLabel = (g) =>
    `${(Number(g.price ?? 0) / 1e6).toFixed(g.price % 1000 ? 6 : 2)} ${g.asset ?? "USDC"}`;

/** The first of `candidates` this row actually has. A fused view is why this
 *  takes a list and not a name. */
export const pick = (row, candidates = []) => {
    for (const c of candidates) {
        const v = row?.[c];
        if (v != null && v !== "") return v;
    }
    return null;
};

export const titleOf = (row, roles) => String(pick(row, roles.title) ?? row?.id ?? "untitled");
export const subtitleOf = (row, roles) => { const v = pick(row, roles.subtitle); return v == null ? null : String(v); };

/** The prose a lexical query should match. Every declared text field joined,
 *  not just the first — `text` and `editorialSummary` are both prose and a
 *  query can legitimately hit either. Falls back to the title so a row with no
 *  declared prose is still findable by name. */
export function textOf(row, roles) {
    const parts = roles.text.map((f) => row?.[f]).filter((v) => v != null && v !== "");
    if (parts.length) return parts.join(" ");
    // A LOCKED text role has no text, and the title is not a stand-in for it.
    // This fallback is what let two buying agents rank 21,131 subtitle rows by
    // filename and never learn the dialogue was behind the gate — one bought
    // blind, the other read it as a worthless corpus. Empty is the honest answer:
    // it says "nothing to match here", which is true, instead of quietly
    // substituting a filename that matches nothing anyone would ask.
    if (roles.text.some((f) => isLocked(f, roles))) return "";
    const t = pick(row, roles.title);
    return t ? String(t) : "";
}

/** A compact preview: title, subtitle, and the declared tags/measures. What a
 *  tool result should carry so fifty hits don't spend a whole context window. */
export const BRIEF_CHARS = 160;
/** Tag lists in the wild are not short: this bundle's `categories` runs to fifty
 *  entries per row, so four hits came back as four kilobytes of "Establishment",
 *  "Point Of Interest", "Store". A preview that costs that much is not a preview.
 *  The first few carry the meaning; `get-row` has the rest. */
export const BRIEF_ITEMS = 6;

export function briefOf(row, roles, extra = []) {
    const out = { id: row.id, title: titleOf(row, roles) };
    const sub = subtitleOf(row, roles);
    if (sub) out.subtitle = sub;
    for (const f of [...roles.tags, ...roles.measures, ...extra]) {
        const v = row[f];
        if (v == null || v === "") continue;
        // Tags are normalized to a list whatever shape the shard held them in;
        // measures and everything else pass through as the scalar they are.
        const list = roles.tags.includes(f) ? values(v) : null;
        if (list) {
            out[f] = list.length > BRIEF_ITEMS ? [...list.slice(0, BRIEF_ITEMS), `…+${list.length - BRIEF_ITEMS} more`] : list;
        } else {
            out[f] = typeof v === "string" && v.length > BRIEF_CHARS ? `${v.slice(0, BRIEF_CHARS)}…` : v;
        }
    }
    return out;
}

/** The publisher's own link for this row, from `presentation.externalUrl` —
 *  `{"Business": "{googleMapsUri}"}` keyed by entity type. Null when the type
 *  has no template or the row is missing the field it names. */
export function linkOf(row, roles) {
    const tpl = roles.externalUrl?.[typeOf(row)];
    if (!tpl) return null;
    let missing = false;
    const url = String(tpl).replace(/\{(\w+)\}/g, (_, f) => {
        const v = row?.[f];
        if (v == null || v === "") { missing = true; return ""; }
        return String(v);
    });
    return missing ? null : url;
}

/**
 * What you can DO with this row, as its publisher declared it.
 *
 * `presentation.actions` is `{ <entityType>: [{ kind, label, href }] }`, where
 * `href` is a `{field}` template like `externalUrl`. `kind` says what the thing
 * IS — "video", "audio", "image" get a player, anything else gets a link — so a
 * renderer never has to sniff a file extension or know what archive.org is.
 *
 * The interesting case is a template that names a field THIS TIER DOES NOT HAVE.
 * A film's playable url is exactly what the paywall withholds, so the action
 * comes back with `locked` naming the fields that are missing and why. That is
 * a player with a price on it rather than a broken <video> or, worse, no sign
 * that a player was ever on offer.
 */
export function actionsOf(row, roles) {
    const defs = roles?.actions?.[typeOf(row)] ?? [];
    return defs.map((a) => {
        const locked = [], missing = [];
        const href = String(a.href ?? "").replace(/\{(\w+)\}/g, (_, f) => {
            const v = row?.[f];
            if (v != null && v !== "") return String(v);
            (isLocked(f, roles) ? locked : missing).push(f);
            return "";
        });
        return { kind: a.kind ?? "link", label: a.label ?? a.kind ?? "open", href, locked, missing };
    // An action whose template names a field this bundle simply never had is not
    // a paywall, it is a bad declaration — drop it rather than show a dead
    // button. Locked ones stay: those are on offer.
    }).filter((a) => a.locked.length || !a.missing.length);
}

// piedmont: the Node self-check that ends this file upstream is left out of the browser copy
// (it reads process.argv, which a browser does not have). Run it from node_modules instead.
