// ============================================================
// GET /api/share/[token]
// Returns fresh, short-lived signed URLs for every file in a shared
// folder. The share page calls this when "Download all" is clicked so
// the links are always valid even if the page has been open for hours.
// Requires the folder's share link to be ON; otherwise 404.
// ============================================================

import { NextResponse } from 'next/server';
import { createAdminClient, hasServiceRole } from '@/lib/supabase-admin';
import { DRIVE_BUCKET, naturalCompare } from '@/lib/drive';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TTL = 3600; // one hour is plenty to finish a download

export async function GET(_request, { params }) {
  if (!hasServiceRole()) {
    return NextResponse.json({ error: 'Sharing is not configured on the server.' }, { status: 503 });
  }
  const token = params?.token || '';
  if (!/^[a-z0-9]{16,64}$/i.test(token)) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const admin = createAdminClient();
  const { data: folder } = await admin
    .from('drive_folders')
    .select('id, name, share_enabled')
    .eq('share_token', token)
    .maybeSingle();
  if (!folder || !folder.share_enabled) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  const { data: rows, error } = await admin
    .from('drive_files')
    .select('name, path, size, created_at')
    .eq('folder_id', folder.id);
  if (error) {
    return NextResponse.json({ error: 'Could not load files.' }, { status: 500 });
  }
  const files = (rows || []).sort((a, b) => naturalCompare(a.name, b.name));

  const urls = {};
  for (let i = 0; i < files.length; i += 200) {
    const part = files.slice(i, i + 200).map((f) => f.path);
    const { data } = await admin.storage.from(DRIVE_BUCKET).createSignedUrls(part, TTL);
    for (const s of data || []) if (s.signedUrl && s.path) urls[s.path] = s.signedUrl;
  }

  return NextResponse.json(
    {
      name: folder.name,
      files: files
        .filter((f) => urls[f.path])
        .map((f) => ({ name: f.name, url: urls[f.path], size: Number(f.size) || 0, lastModified: f.created_at })),
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
