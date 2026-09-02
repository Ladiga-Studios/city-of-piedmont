// ============================================================
// POST /api/admin/analyze-job
// Body: { path, mime, filename }  — a file already uploaded to the
// 'careers' bucket (the browser uploads directly, so Vercel's 4.5 MB
// request limit never applies). Downloads it server-side, has Claude
// read it, and returns draft posting fields for staff to review.
// ============================================================

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { analyzeJobAnnouncement } from '@/lib/summarize-job';

export const runtime = 'nodejs';
export const maxDuration = 60;

const OK_MIME = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export async function POST(request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not set on the server, so the announcement can’t be read automatically. Fill the fields in by hand.' }, { status: 503 });
  }

  let body;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  const path = (body.path || '').toString();
  const mime = (body.mime || '').toString();
  if (!path || !OK_MIME.has(mime)) {
    return NextResponse.json({ error: 'Upload a PDF, JPG, PNG, or WebP first.' }, { status: 400 });
  }

  try {
    const { data: blob, error: dlErr } = await supabase.storage.from('careers').download(path);
    if (dlErr) throw new Error(dlErr.message);
    const bytes = Buffer.from(await blob.arrayBuffer());
    const draft = await analyzeJobAnnouncement(bytes, mime, {
      filename: body.filename,
      today: new Date().toLocaleDateString('en-CA', { timeZone: 'America/Chicago' }),
    });
    return NextResponse.json({ draft });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Could not read the announcement.' }, { status: 500 });
  }
}
