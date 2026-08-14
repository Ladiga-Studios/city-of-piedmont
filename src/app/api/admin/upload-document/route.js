// ============================================================
// POST /api/admin/upload-document
// Server-side: verifies the staff session, uploads the file to the
// 'city-documents' Storage bucket, and inserts the DB row. The file
// then appears in the Downloads area of the chosen department page.
// Accepts PDFs and Word/Excel documents (water quality reports,
// permit forms, applications, and similar).
// ============================================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export const runtime = 'nodejs';

const ALLOWED_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

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
  const departmentSlug = (form.get('department_slug') || '').toString().trim();
  const groupHeading = (form.get('group_heading') || 'Documents').toString().trim() || 'Documents';
  const postedDate = (form.get('posted_date') || '').toString().trim();
  const file = form.get('file');

  if (!title || !departmentSlug || !postedDate || !file || typeof file === 'string') {
    return NextResponse.json({ error: 'Title, department, date, and file are all required.' }, { status: 400 });
  }
  if (file.type && !ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: 'File must be a PDF, Word, or Excel document.' }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  // Unique-ish path so re-uploading a same-named file won't collide.
  const path = `${departmentSlug}/${postedDate}-${Date.now()}-${safeName}`;

  // --- upload to storage ---
  const { error: upErr } = await supabase.storage
    .from('city-documents')
    .upload(path, bytes, { contentType: file.type || 'application/pdf', upsert: false });
  if (upErr) {
    return NextResponse.json({ error: `Upload failed: ${upErr.message}` }, { status: 500 });
  }
  const { data: pub } = supabase.storage.from('city-documents').getPublicUrl(path);

  // --- insert DB row ---
  const { data: inserted, error: insErr } = await supabase
    .from('city_documents')
    .insert({
      title,
      department_slug: departmentSlug,
      group_heading: groupHeading,
      posted_date: postedDate,
      file_url: pub.publicUrl,
      file_path: path,
    })
    .select()
    .single();

  if (insErr) {
    // Roll back the orphaned file so a failed insert doesn't leave junk.
    await supabase.storage.from('city-documents').remove([path]);
    return NextResponse.json({ error: `Save failed: ${insErr.message}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true, document: inserted });
}
