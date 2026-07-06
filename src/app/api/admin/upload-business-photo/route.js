// POST /api/admin/upload-business-photo
// Uploads a business image to the 'business' storage bucket, returns its public URL.
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export const runtime = 'nodejs';

export async function POST(request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  let form;
  try { form = await request.formData(); }
  catch { return NextResponse.json({ error: 'Invalid form data' }, { status: 400 }); }

  const file = form.get('file');
  const slug = (form.get('slug') || 'biz').toString().replace(/[^a-z0-9-]/gi, '');
  if (!file || typeof file === 'string') return NextResponse.json({ error: 'No file' }, { status: 400 });

  const ext = (file.name.split('.').pop() || 'jpg').replace(/[^a-z0-9]/gi, '');
  const path = `${slug}/${Date.now()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from('business')
    .upload(path, bytes, { contentType: file.type || 'image/jpeg', upsert: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: pub } = supabase.storage.from('business').getPublicUrl(path);
  return NextResponse.json({ url: pub.publicUrl, path });
}
