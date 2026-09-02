// /share/[token] — the page staff send to people. No login. Shows the
// folder's files with previews and a single "Download all" button that
// packs everything into one ZIP in the visitor's browser.
//
// The bucket is private, so this page (server-side, service role) is
// the only thing that can hand out working file URLs. Turning the
// folder's link off makes this page 404 immediately.

import '../../pages.css';
import '../share.css';
import { notFound } from 'next/navigation';
import { createAdminClient, hasServiceRole } from '@/lib/supabase-admin';
import { DRIVE_BUCKET, naturalCompare, withDownloadName } from '@/lib/drive';
import ShareFolder from './ShareFolder';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const FILE_URL_TTL = 12 * 3600;  // seconds — individual "open"/"download" links
const THUMB_URL_TTL = 12 * 3600;

async function loadFolder(token) {
  if (!/^[a-z0-9]{16,64}$/i.test(token || '')) return null;
  const admin = createAdminClient();
  const { data: folder } = await admin
    .from('drive_folders')
    .select('id, name, description, share_enabled, created_at, updated_at')
    .eq('share_token', token)
    .maybeSingle();
  if (!folder || !folder.share_enabled) return null;

  const { data: rows } = await admin
    .from('drive_files')
    .select('id, name, path, thumb_path, size, mime, width, height, created_at')
    .eq('folder_id', folder.id);
  const files = (rows || []).sort((a, b) => naturalCompare(a.name, b.name));
  return { folder, files };
}

async function signAll(admin, paths, ttl) {
  const out = {};
  for (let i = 0; i < paths.length; i += 200) {
    const part = paths.slice(i, i + 200);
    const { data } = await admin.storage.from(DRIVE_BUCKET).createSignedUrls(part, ttl);
    for (const s of data || []) if (s.signedUrl && s.path) out[s.path] = s.signedUrl;
  }
  return out;
}

export async function generateMetadata({ params }) {
  const base = { robots: { index: false, follow: false } };
  if (!hasServiceRole()) return { ...base, title: 'Shared files' };
  const data = await loadFolder(params.token).catch(() => null);
  if (!data) return { ...base, title: 'Shared files' };
  const n = data.files.length;
  return {
    ...base,
    title: `${data.folder.name} · Shared files`,
    description: `${n} ${n === 1 ? 'file' : 'files'} shared by the City of Piedmont. View online or download everything as one ZIP.`,
  };
}

export default async function SharePage({ params }) {
  if (!hasServiceRole()) {
    return (
      <section className="section">
        <div className="container share-setup">
          <h1>Sharing isn&rsquo;t configured yet</h1>
          <p>
            This page needs <code>SUPABASE_SERVICE_ROLE_KEY</code> set in the site&rsquo;s hosting
            environment variables. Add it in Vercel and redeploy.
          </p>
        </div>
      </section>
    );
  }

  const data = await loadFolder(params.token);
  if (!data) notFound();

  const admin = createAdminClient();
  const { folder, files } = data;
  const [fileUrls, thumbUrls] = await Promise.all([
    signAll(admin, files.map((f) => f.path), FILE_URL_TTL),
    signAll(admin, files.filter((f) => f.thumb_path).map((f) => f.thumb_path), THUMB_URL_TTL),
  ]);

  const items = files.map((f) => ({
    id: f.id,
    name: f.name,
    size: Number(f.size) || 0,
    mime: f.mime || '',
    width: f.width,
    height: f.height,
    createdAt: f.created_at,
    url: fileUrls[f.path] || null,
    downloadUrl: fileUrls[f.path] ? withDownloadName(fileUrls[f.path], f.name) : null,
    thumb: f.thumb_path ? thumbUrls[f.thumb_path] || null : null,
  }));

  return (
    <ShareFolder
      token={params.token}
      folder={{ name: folder.name, description: folder.description, createdAt: folder.created_at, updatedAt: folder.updated_at }}
      files={items}
    />
  );
}
