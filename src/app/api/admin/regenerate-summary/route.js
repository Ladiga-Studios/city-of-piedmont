// ============================================================
// POST /api/admin/regenerate-summary
// Re-summarize an existing minutes record (e.g. a failed one,
// or to refresh). Body: { id }
// ============================================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { summarizeMinutesPdf } from '@/lib/summarize';

export const runtime = 'nodejs';

export async function POST(request) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const { id } = await request.json().catch(() => ({}));
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { data: m, error: selErr } = await supabase
    .from('minutes').select('*').eq('id', id).single();
  if (selErr || !m) return NextResponse.json({ error: 'Record not found' }, { status: 404 });

  try {
    const { data: blob, error: dlErr } = await supabase.storage
      .from('minutes').download(m.file_path);
    if (dlErr) throw new Error(dlErr.message);
    const buf = Buffer.from(await blob.arrayBuffer());

    const result = await summarizeMinutesPdf(buf, { title: m.title, meeting_date: m.meeting_date });

    const { data: updated, error: upErr } = await supabase
      .from('minutes')
      .update({ ...result, summary_status: 'ready' })
      .eq('id', id).select().single();
    if (upErr) throw new Error(upErr.message);

    return NextResponse.json({ minute: updated });
  } catch (err) {
    await supabase.from('minutes').update({ summary_status: 'failed' }).eq('id', id);
    return NextResponse.json({ error: err.message || 'Summary failed' }, { status: 500 });
  }
}
