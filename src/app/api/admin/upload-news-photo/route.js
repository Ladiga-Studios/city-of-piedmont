// POST /api/admin/upload-news-photo
// Uploads a news image to the 'news' storage bucket, returns its public URL.
// Staff-only. Mirrors the business-photo upload pattern.
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export const runtime = 'nodejs';

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const OK_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];

export async function POST(request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  let form;
  try { form = await request.formData(); }
  catch { return NextResponse.json({ error: 'Invalid form data' }, { status: 400 }); }

  const file = form.get('file');
  if (!file || typeof file === 'string') return NextResponse.json({ error: 'No file selected.' }, { status: 400 });

  if (file.type && !OK_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Please choose an image (JPG, PNG, WEBP, or GIF).' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'That image is over 8 MB. Please use a smaller one.' }, { status: 400 });
  }

  const ext = (file.name.split('.').pop() || 'jpg').replace(/[^a-z0-9]/gi, '').toLowerCase() || 'jpg';
  const path = `articles/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from('news')
    .upload(path, bytes, { contentType: file.type || 'image/jpeg', upsert: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: pub } = supabase.storage.from('news').getPublicUrl(path);
  return NextResponse.json({ url: pub.publicUrl, path });
}
