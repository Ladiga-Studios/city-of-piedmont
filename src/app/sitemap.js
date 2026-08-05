import { DEPARTMENTS } from '@/lib/departments';
import { createClient } from '@/lib/supabase-server';

const BASE = 'https://www.piedmontcity.org';

// Static routes with sensible priorities/change frequencies for SEO.
const STATIC = [
  { path: '', priority: 1.0, changeFrequency: 'daily' },
  { path: '/news', priority: 0.9, changeFrequency: 'daily' },
  { path: '/events', priority: 0.9, changeFrequency: 'daily' },
  { path: '/departments', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/residents', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/government', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/government/council', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/government/minutes', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/government/notices', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/government/records', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/parks', priority: 0.8, changeFrequency: 'monthly' },
  { path: '/parks/chief-ladiga-trail', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/parks/pinhoti-trail', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/parks/terrapin-creek', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/parks/aquatic-center', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/parks/civic-center', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/parks/fagans-park', priority: 0.6, changeFrequency: 'monthly' },
  { path: '/visitors', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/business', priority: 0.8, changeFrequency: 'weekly' },
  { path: '/about', priority: 0.6, changeFrequency: 'yearly' },
  { path: '/history', priority: 0.6, changeFrequency: 'yearly' },
  { path: '/careers', priority: 0.6, changeFrequency: 'weekly' },
  { path: '/contact', priority: 0.6, changeFrequency: 'yearly' },
  { path: '/search', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/privacy', priority: 0.2, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.2, changeFrequency: 'yearly' },
];

export default async function sitemap() {
  const now = new Date();

  const entries = STATIC.map((r) => ({
    url: `${BASE}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Department detail pages (from the departments lib).
  for (const d of DEPARTMENTS) {
    entries.push({
      url: `${BASE}/departments/${d.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  // Approved business detail pages (from the database). Best-effort: if the DB is
  // unreachable, the rest of the sitemap is still returned.
  try {
    const supabase = createClient();
    const { data } = await supabase
      .from('businesses')
      .select('slug, updated_at')
      .eq('approved', true);
    for (const b of data || []) {
      if (!b.slug) continue;
      entries.push({
        url: `${BASE}/business/${b.slug}`,
        lastModified: b.updated_at ? new Date(b.updated_at) : now,
        changeFrequency: 'monthly',
        priority: 0.5,
      });
    }
  } catch {
    // ignore - static + departments still returned
  }

  return entries;
}
