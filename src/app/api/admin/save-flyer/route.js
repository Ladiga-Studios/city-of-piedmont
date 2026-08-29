// ============================================================
// POST   /api/admin/save-flyer   -> create or update a flyer
// DELETE /api/admin/save-flyer   -> delete a flyer (by id)
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
  const image_url = (body.image_url || '').trim();
  if (!title || !image_url) {
    return NextResponse.json({ error: 'A title and a flyer image are required.' }, { status: 400 });
  }

  const row = {
    title,
    caption: (body.caption || '').trim() || null,
    image_url,
    image_width: Number(body.image_width) || null,
    image_height: Number(body.image_height) || null,
    link_url: (body.link_url || '').trim() || null,
    link_label: (body.link_label || '').trim() || null,
    active: body.active !== false,
  };

  let result;
  if (body.id) {
    result = await supabase.from('flyers').update(row).eq('id', body.id).select().single();
  } else {
    result = await supabase.from('flyers').insert(row).select().single();
  }
  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }
  return NextResponse.json({ flyer: result.data });
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

  const { error } = await supabase.from('flyers').delete().eq('id', body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
