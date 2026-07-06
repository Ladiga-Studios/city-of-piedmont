// ============================================================
// POST   /api/admin/save-news   -> create or update a news item
// DELETE /api/admin/save-news   -> delete a news item (by id)
// Staff-only. JSON body.
// ============================================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { newsSlugify } from '@/lib/news-events';

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
  const summary = (body.body || '').trim();
  if (!title || !summary) {
    return NextResponse.json({ error: 'Title and summary are required.' }, { status: 400 });
  }

  const row = {
    title,
    slug: (body.slug || '').trim() || newsSlugify(title),
    body: summary,
    content: (body.content || '').trim() || null,
    published_at: body.published_at || new Date().toISOString().slice(0, 10),
    image_url: (body.image_url || '').trim() || null,
    image_alt: (body.image_alt || '').trim() || null,
    is_sample: false, // anything saved/edited by staff is no longer a sample
  };

  let result;
  if (body.id) {
    result = await supabase.from('news').update(row).eq('id', body.id).select().single();
  } else {
    result = await supabase.from('news').insert(row).select().single();
  }
  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 });
  }
  return NextResponse.json({ news: result.data });
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

  const { error } = await supabase.from('news').delete().eq('id', body.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
