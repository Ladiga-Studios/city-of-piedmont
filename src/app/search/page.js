import '../pages.css';
import './search.css';
import Link from 'next/link';
import { staticEntries, searchEntries, TYPE_ORDER } from '@/lib/search';
import { createClient } from '@/lib/supabase-server';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Search',
  description: 'Search the City of Piedmont website.',
};

const TYPE_LABEL = {
  Page: 'Pages', Department: 'Departments', Ordinance: 'Ordinances', Park: 'Parks & Recreation',
  News: 'News', Event: 'Events', Business: 'Local Business',
};

function trim(s, n) {
  if (!s) return '';
  const t = String(s).replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 1) + '\u2026' : t;
}

async function runSearch(q) {
  const staticResults = searchEntries(staticEntries(), q, 40);
  const dbResults = [];
  try {
    const supabase = createClient();
    const like = `%${q}%`;
    const [newsRes, eventsRes, bizRes] = await Promise.all([
      supabase.from('news').select('title, slug, body').or(`title.ilike.${like},body.ilike.${like}`).limit(20),
      supabase.from('events').select('title, location, description').or(`title.ilike.${like},location.ilike.${like},description.ilike.${like}`).limit(20),
      supabase.from('businesses').select('name, slug, tagline, category, description').eq('approved', true)
        .or(`name.ilike.${like},tagline.ilike.${like},category.ilike.${like},description.ilike.${like}`).limit(20),
    ]);
    if (!newsRes.error && newsRes.data) newsRes.data.forEach((n) => dbResults.push({ title: n.title, href: '/news', type: 'News', summary: trim(n.body, 140) }));
    if (!eventsRes.error && eventsRes.data) eventsRes.data.forEach((e) => dbResults.push({ title: e.title, href: '/events', type: 'Event', summary: [e.location, trim(e.description, 120)].filter(Boolean).join(' \u00b7 ') }));
    if (!bizRes.error && bizRes.data) bizRes.data.forEach((b) => dbResults.push({ title: b.name, href: b.slug ? `/business/${b.slug}` : '/business', type: 'Business', summary: [b.category, b.tagline || trim(b.description, 120)].filter(Boolean).join(' \u00b7 ') }));
  } catch {
    // static-only
  }
  const seen = new Set();
  const merged = [];
  for (const r of [...staticResults, ...dbResults]) {
    const key = `${r.type}:${r.href}:${r.title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(r);
  }
  return merged;
}

export default async function SearchPage({ searchParams }) {
  const q = (searchParams?.q || '').trim();
  const results = q ? await runSearch(q) : [];

  // Group by type, preserving the canonical order.
  const groups = {};
  for (const r of results) (groups[r.type] ||= []).push(r);
  const orderedTypes = TYPE_ORDER.filter((t) => groups[t] && groups[t].length);

  return (
    <>
      <section className="page-hero">
        <div className="container inner">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span aria-hidden="true">/</span>
            <span>Search</span>
          </nav>
          <p className="eyebrow">Search</p>
          <h1>{q ? `Results for \u201C${q}\u201D` : 'Search the site'}</h1>
          {q && <p>{results.length} {results.length === 1 ? 'result' : 'results'} found.</p>}
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Search box (works from the results page too) */}
          <form className="sr-form" action="/search" method="get" role="search">
            <span className="sr-form-ico" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4-4"/></svg>
            </span>
            <input type="search" name="q" defaultValue={q} placeholder="Search for pages, departments, news, events, businesses…" aria-label="Search" autoFocus />
            <button type="submit" className="btn btn-primary">Search</button>
          </form>

          {!q ? (
            <p className="sr-empty">Type something above to search across pages, departments, parks, news, events, and the business directory.</p>
          ) : results.length === 0 ? (
            <div className="sr-noresults">
              <p className="sr-noresults-title">No results for &ldquo;{q}&rdquo;</p>
              <p className="sr-noresults-sub">Try a different word, or browse from the menu. You can also <Link href="/contact">contact City Hall</Link> for help.</p>
            </div>
          ) : (
            <div className="sr-groups">
              {orderedTypes.map((type) => (
                <div key={type} className="sr-group">
                  <h2 className="sr-group-h">{TYPE_LABEL[type] || type} <span>{groups[type].length}</span></h2>
                  <ul className="sr-list">
                    {groups[type].map((r, i) => {
                      const inner = (
                        <>
                          <span className="sr-item-title">{r.title}</span>
                          {r.summary && <span className="sr-item-sum">{r.summary}</span>}
                        </>
                      );
                      return (
                        <li key={`${r.href}-${i}`} className="sr-item">
                          {r.ext
                            ? <a href={r.href} target="_blank" rel="noopener noreferrer">{inner}</a>
                            : <Link href={r.href}>{inner}</Link>}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
