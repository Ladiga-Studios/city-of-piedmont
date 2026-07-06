import { createClient } from '@/lib/supabase-server';
import AlertBar from './AlertBar';

// Server component: fetches active alerts from Supabase, passes to the
// client bar for display + dismissal. Fails silently (no bar) if the DB
// isn't reachable, so the site never breaks over a missing alerts table.
export const revalidate = 30; // refresh alerts at most every 30s

export default async function AlertBarServer() {
  let alerts = [];
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('notices')
      .select('id, title, body, severity, is_active, link_url, link_label')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    if (!error && data) alerts = data;
  } catch {
    // no alert bar if the table/column isn't there yet
  }
  return <AlertBar alerts={alerts} />;
}
