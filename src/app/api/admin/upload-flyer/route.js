// POST /api/admin/upload-flyer
// Uploads a flyer asset to the 'flyers' storage bucket, returns its public URL.
// form-data: file (image or PDF), kind ('image' | 'pdf')
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export const runtime = 'nodejs';

const MAX_IMAGE = 8 * 1024 * 1024;   // 8 MB
const MAX_PDF   = 15 * 1024 * 1024;  // 15 MB

export async function POST(request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  let form;
  try { form = await request.formData(); }
  catch { return NextResponse.json({ error: 'Invalid form data' }, { status: 400 }); }

  const file = form.get('file');
  const kind = form.get('kind') === 'pdf' ? 'pdf' : 'image';
  if (!file || typeof file === 'string') return NextResponse.json({ error: 'No file' }, { status: 400 });

  const type = String(file.type || '');
  if (kind === 'image' && !type.startsWith('image/')) {
    return NextResponse.json({ error: 'Please choose an image file.' }, { status: 400 });
  }
  if (kind === 'pdf' && type !== 'application/pdf') {
    return NextResponse.json({ error: 'Please choose a PDF file.' }, { status: 400 });
  }
  if (file.size > (kind === 'pdf' ? MAX_PDF : MAX_IMAGE)) {
    return NextResponse.json(
      { error: `File is too large (max ${kind === 'pdf' ? 15 : 8} MB).` },
      { status: 400 }
    );
  }

  const ext = (file.name.split('.').pop() || (kind === 'pdf' ? 'pdf' : 'jpg')).replace(/[^a-z0-9]/gi, '').toLowerCase();
  const path = `${kind}/${Date.now()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from('flyers')
    .upload(path, bytes, { contentType: type || undefined, upsert: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: pub } = supabase.storage.from('flyers').getPublicUrl(path);
  return NextResponse.json({ url: pub.publicUrl, path });
}
