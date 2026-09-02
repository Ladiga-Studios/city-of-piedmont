// Server-side helpers for the admin-managed People and City Documents
// content. Every helper fails soft: if the `people` / `city_documents`
// tables don't exist yet (the SQL migration hasn't been run) or the
// query errors, the caller gets null / [] and the page falls back to
// the static data in departments.js and the council page.

import { createClient } from '@/lib/supabase-server';

/**
 * Mayor + council from the `people` table.
 * Returns { mayor, council } or null when the table is empty/unavailable.
 */
export async function getCouncilPeople() {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('people')
      .select('id, name, role, email, phone, bio, photo_url, featured, sort_order')
      .eq('group_type', 'council')
      .order('sort_order', { ascending: true });
    if (error || !data || data.length === 0) return null;
    const mayor = data.find((p) => p.featured) || null;
    const council = data.filter((p) => !p.featured);
    return { mayor, council };
  } catch {
    return null;
  }
}

/**
 * Staff for one department page, from the `people` table.
 * Returns an array shaped like the static `staff` entries in
 * departments.js, or null when there are no rows for the slug.
 */
export async function getDepartmentStaff(slug) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('people')
      .select('name, role, email, phone, office, sort_order')
      .eq('group_type', 'staff')
      .eq('department_slug', slug)
      .order('sort_order', { ascending: true });
    if (error || !data || data.length === 0) return null;
    return data.map(({ name, role, email, phone, office }) => ({
      name,
      role,
      email: email || undefined,
      phone: phone || undefined,
      office: office || undefined, // sub-office on the page (e.g. 'Fire Department'), if any
    }));
  } catch {
    return null;
  }
}

/**
 * Admin-uploaded documents for one department page, grouped by
 * heading: [{ heading, items: [{ label, href }] }]. Newest first
 * within each group. Returns [] when none.
 */
export async function getDepartmentDocuments(slug) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('city_documents')
      .select('title, group_heading, file_url, posted_date')
      .eq('department_slug', slug)
      .order('posted_date', { ascending: false });
    if (error || !data || data.length === 0) return [];
    const byHeading = new Map();
    for (const doc of data) {
      const heading = doc.group_heading || 'Documents';
      if (!byHeading.has(heading)) byHeading.set(heading, []);
      byHeading.get(heading).push({ label: doc.title, href: doc.file_url });
    }
    return [...byHeading.entries()].map(([heading, items]) => ({ heading, items }));
  } catch {
    return [];
  }
}

/**
 * Merge admin-uploaded document groups into a department's static
 * downloadGroups. Uploaded items land at the top of a static group
 * with the same heading (case-insensitive); new headings become new
 * groups after the static ones.
 */
export function mergeDownloadGroups(staticGroups = [], uploadedGroups = []) {
  if (!uploadedGroups.length) return staticGroups;
  const merged = staticGroups.map((g) => ({ heading: g.heading, items: [...g.items] }));
  for (const up of uploadedGroups) {
    const match = merged.find(
      (g) => g.heading.trim().toLowerCase() === up.heading.trim().toLowerCase()
    );
    if (match) match.items = [...up.items, ...match.items];
    else merged.push(up);
  }
  return merged;
}
