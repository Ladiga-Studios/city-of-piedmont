// ============================================================
// POST /api/admin/upload-notice
// Server-side: verifies the staff session, uploads the PDF to
// the 'notices-files' Storage bucket, and inserts the DB row in
// public_notices. Mirrors upload-minutes but without AI summary.
// ============================================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { sha256Of, tryAnchorRecord, noticePayload } from '@/lib/fangorn-anchor';

export const runtime = 'nodejs'; // needs Node (Buffer)

const BUCKET = 'notices-files';

export async function POST(request) {
  const supabase = createClient();

  // --- auth: only signed-in staff may upload ---
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // --- parse multipart form ---
  let form;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const title = (form.get('title') || '').toString().trim();
  const category = (form.get('category') || 'notice').toString().trim();
  const postedDate = (form.get('posted_date') || '').toString().trim();
  const closesDate = (form.get('closes_date') || '').toString().trim();
  const file = form.get('file');

  if (!title || !postedDate || !file || typeof file === 'string') {
    return NextResponse.json({ error: 'Title, posted date, and PDF are all required.' }, { status: 400 });
  }
  if (!['notice', 'bid'].includes(category)) {
    return NextResponse.json({ error: 'Invalid category.' }, { status: 400 });
  }
  if (file.type && file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'File must be a PDF.' }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  // Unique-ish path so re-uploading a same-named file won't collide.
  const path = `${category}/${postedDate}-${Date.now()}-${safeName}`;

  // --- upload PDF to storage ---
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, bytes, { contentType: 'application/pdf', upsert: false });
  if (upErr) {
    return NextResponse.json({ error: `Upload failed: ${upErr.message}` }, { status: 500 });
  }
  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);

  // Fingerprint the exact bytes being published - this is what gets
  // anchored in the permanent record.
  const sha256 = sha256Of(bytes);

  // --- insert DB row ---
  const { data: inserted, error: insErr } = await supabase
    .from('public_notices')
    .insert({
      title,
      category,
      posted_date: postedDate,
      closes_date: category === 'bid' && closesDate ? closesDate : null,
      file_url: pub.publicUrl,
      file_path: path,
      sha256,
    })
    .select()
    .single();

  if (insErr) {
    // Roll back the orphaned file so storage doesn't drift from the table.
    await supabase.storage.from(BUCKET).remove([path]);
    return NextResponse.json({ error: `Database insert failed: ${insErr.message}` }, { status: 500 });
  }

  // --- anchor in the permanent record (never fails the upload) ---
  const anchor = await tryAnchorRecord(
    supabase, 'public_notices', 'notices', inserted, noticePayload(inserted)
  );

  return NextResponse.json({ notice: inserted, anchorWarning: anchor.error, anchored: anchor.anchored });
}
