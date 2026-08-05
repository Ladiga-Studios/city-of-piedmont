// ============================================================
// POST /api/admin/upload-minutes
// Server-side: verifies the staff session, uploads the PDF to
// Storage, summarizes it with Claude, and inserts the DB row.
// The Anthropic key never leaves the server.
// ============================================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { summarizeMinutesPdf } from '@/lib/summarize';
import { sha256Of, tryAnchorRecord, minutesPayload } from '@/lib/fangorn-anchor';

export const runtime = 'nodejs'; // needs Node (Buffer + Anthropic fetch)

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
  const meetingDate = (form.get('meeting_date') || '').toString().trim();
  const file = form.get('file');

  if (!title || !meetingDate || !file || typeof file === 'string') {
    return NextResponse.json({ error: 'Title, date, and PDF are all required.' }, { status: 400 });
  }
  if (file.type && file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'File must be a PDF.' }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const path = `${meetingDate}-${safeName}`;

  // Fingerprint the exact bytes being published. This is what gets
  // anchored in the permanent record; the PDF itself stays in Storage.
  const sha256 = sha256Of(bytes);

  // --- upload PDF to storage ---
  const { error: upErr } = await supabase.storage
    .from('minutes')
    .upload(path, bytes, { contentType: 'application/pdf', upsert: false });
  if (upErr) {
    return NextResponse.json({ error: `Upload failed: ${upErr.message}` }, { status: 500 });
  }
  const { data: pub } = supabase.storage.from('minutes').getPublicUrl(path);

  // --- summarize (don't fail the whole upload if summarization breaks) ---
  let summaryFields = { summary: null, decisions: [], action_items: [], summary_status: 'pending' };
  let summaryWarning = null;
  try {
    const result = await summarizeMinutesPdf(bytes, { title, meeting_date: meetingDate });
    summaryFields = { ...result, summary_status: 'ready' };
  } catch (err) {
    // PDF is still saved and posted; summary can be regenerated later.
    summaryWarning = err.message || 'Summary generation failed';
    summaryFields.summary_status = 'failed';
  }

  // --- insert DB row ---
  const { data: inserted, error: insErr } = await supabase
    .from('minutes')
    .insert({
      title,
      meeting_date: meetingDate,
      file_url: pub.publicUrl,
      file_path: path,
      sha256,
      ...summaryFields,
    })
    .select()
    .single();

  if (insErr) {
    // Roll back the orphaned file so storage doesn't drift from the table.
    await supabase.storage.from('minutes').remove([path]);
    return NextResponse.json({ error: `Database insert failed: ${insErr.message}` }, { status: 500 });
  }

  // --- anchor in the permanent record (never fails the upload) ---
  // On failure the row stays 'pending'/'failed' and `npm run anchor`
  // picks it up later.
  const anchor = await tryAnchorRecord(
    supabase, 'minutes', 'minutes', inserted, minutesPayload(inserted)
  );

  return NextResponse.json({
    minute: inserted,
    summaryWarning,
    anchorWarning: anchor.error,
    anchored: anchor.anchored,
  });
}
