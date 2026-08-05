// GET /api/search?q=...
// Searches static site content (pages, departments, parks) PLUS live database
// rows (news, events, businesses). Returns a flat, ranked list of results.
// Public - only surfaces already-public content (published news/events, approved
// businesses).

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { staticEntries, searchEntries } from '@/lib/search';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function norm(s) {
  return (s || '').toLowerCase();
}

export async function GET(request) {
  const q = (new URL(request.url).searchParams.get('q') || '').trim();
  if (!q) return NextResponse.json({ results: [], query: '' });

  // 1) Static content (pages, departments, parks) - always available.
  const staticResults = searchEntries(staticEntries(), q, 40);

  // 2) Database content. Best-effort: if the DB is unreachable, we still return
  //    the static results.
  const dbResults = [];
  try {
    const supabase = createClient();
    const like = `%${q}%`;

    const [newsRes, eventsRes, bizRes] = await Promise.all([
      supabase.from('news').select('title, slug, body, published_at')
        .or(`title.ilike.${like},body.ilike.${like}`).limit(20),
      supabase.from('events').select('title, location, description, event_date')
        .or(`title.ilike.${like},location.ilike.${like},description.ilike.${like}`).limit(20),
      supabase.from('businesses').select('name, slug, tagline, category, description')
        .eq('approved', true)
        .or(`name.ilike.${like},tagline.ilike.${like},category.ilike.${like},description.ilike.${like}`)
        .limit(20),
    ]);

    if (!newsRes.error && newsRes.data) {
      for (const n of newsRes.data) {
        dbResults.push({
          title: n.title,
          href: n.slug ? `/news#${n.slug}` : '/news',
          type: 'News',
          summary: trim(n.body, 140),
        });
      }
    }
    if (!eventsRes.error && eventsRes.data) {
      for (const e of eventsRes.data) {
        dbResults.push({
          title: e.title,
          href: '/events',
          type: 'Event',
          summary: [e.location, trim(e.description, 120)].filter(Boolean).join(' \u00b7 '),
        });
      }
    }
    if (!bizRes.error && bizRes.data) {
      for (const b of bizRes.data) {
        dbResults.push({
          title: b.name,
          href: b.slug ? `/business/${b.slug}` : '/business',
          type: 'Business',
          summary: [b.category, b.tagline || trim(b.description, 120)].filter(Boolean).join(' \u00b7 '),
        });
      }
    }
  } catch {
    // ignore - return static results only
  }

  // Merge, de-dupe by href, keep static (ranked) first then DB matches.
  const seen = new Set();
  const merged = [];
  for (const r of [...staticResults, ...dbResults]) {
    const key = `${r.type}:${r.href}:${r.title}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(r);
  }

  return NextResponse.json({ results: merged, query: q });
}

function trim(s, n) {
  if (!s) return '';
  const t = String(s).replace(/\s+/g, ' ').trim();
  return t.length > n ? t.slice(0, n - 1) + '\u2026' : t;
}
