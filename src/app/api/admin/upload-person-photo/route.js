// POST /api/admin/upload-person-photo
// Uploads a headshot to the 'people-photos' storage bucket and returns
// its public URL. Used by the ImageUploader on /admin/people.
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
  const name = (form.get('name') || 'person').toString().toLowerCase().replace(/[^a-z0-9-]/g, '-');
  if (!file || typeof file === 'string') return NextResponse.json({ error: 'No file' }, { status: 400 });
  if (file.type && !file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'File must be an image.' }, { status: 400 });
  }

  const ext = (file.name.split('.').pop() || 'jpg').replace(/[^a-z0-9]/gi, '');
  const path = `${name}/${Date.now()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from('people-photos')
    .upload(path, bytes, { contentType: file.type || 'image/jpeg', upsert: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: pub } = supabase.storage.from('people-photos').getPublicUrl(path);
  return NextResponse.json({ url: pub.publicUrl, path });
}
