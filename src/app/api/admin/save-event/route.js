// ============================================================
// POST   /api/admin/save-event   -> create or update an event
// DELETE /api/admin/save-event   -> delete an event (by id)
// Staff-only. JSON body.
// ============================================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

async function requireUser(supabase) {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function POST(request) {
  const supabase = createClient();
  if (!(await requireUser(supabase))) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const title = (body.title || '').trim();
  if (!title || !body.event_date) {
    return NextResponse.json({ error: 'Title and date are required.' }, { status: 400 });
  }
  const validCats = ['community', 'meeting', 'festival', 'recreation', 'holiday'];
  const category = validCats.includes(body.category) ? body.category : 'community';

  const row = {
    title,
    event_date: body.event_date,                 // "2026-07-04T16:00" from datetime-local
    end_date: body.end_date || null,
    location: (body.location || '').trim() || null,
    description: (body.description || '').trim() || null,
    category,
    url: (body.url || '').trim() || null,
    all_day: !!body.all_day,
    is_sample: false,
  };

  let result;
  if (body.id) {
    result = await supabase.from('events').update(row).eq('id', body.id).select().single();
  } else {
    result = await supabase.from('events').insert(row).select().single();
  }
  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }
  return NextResponse.json({ event: result.data });
}

export async function DELETE(request) {
  const supabase = createClient();
  if (!(await requireUser(supabase))) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const { error } = await supabase.from('events').delete().eq('id', body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
