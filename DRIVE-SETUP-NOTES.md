# File Drive — setup notes (Sept 2026)

Adds a Google-Drive-style area to the admin console: staff upload a batch of
files (hundreds of photos is the normal case) into a folder and send one link.
Anyone with the link sees the folder and downloads everything as a single ZIP.

## Files in this update

New
- `supabase-drive.sql`                      run once in the Supabase SQL editor
- `src/app/admin/drive/page.js`             folder list + "New folder"
- `src/app/admin/drive/[id]/page.js`        folder page: upload, manage, share link
- `src/app/admin/drive/drive-admin.css`
- `src/app/share/[token]/page.js`           public share page (server)
- `src/app/share/[token]/ShareFolder.jsx`   public share page (client UI)
- `src/app/share/share.css`
- `src/app/api/share/[token]/route.js`      fresh signed URLs for "Download all"
- `src/lib/drive.js`                        helpers (thumbnails, naming, formatting)
- `src/lib/zip-download.js`                 in-browser streaming ZIP
- `src/lib/supabase-admin.js`               server-only service-role client

Changed
- `src/components/AdminNav.jsx`             "File Drive" nav item
- `src/app/admin/page.js`                   stat card + quick action
- `src/app/robots.js`                       /share/ kept out of search
- `package.json`                            + client-zip, server-only

## Deploy steps

1. Unzip over the project root, then `npm install`.
2. Supabase → SQL Editor → run `supabase-drive.sql`. Creates `drive_folders`,
   `drive_files`, a stats view, RLS, and a PRIVATE `drive` storage bucket.
3. Vercel → Settings → Environment Variables: make sure
   `SUPABASE_SERVICE_ROLE_KEY` is set (it is in your local `.env.local`).
   The share page signs download links for the private bucket with it, and
   shows a plain "not configured" message if it's missing.
4. Push / deploy.

## How it works

- Uploads go from the browser straight into Supabase Storage (not through a
  Vercel function — those cap request bodies at 4.5 MB, smaller than most
  camera photos). Four at a time, with retry for anything that fails.
- For images, the browser makes a ~640px JPEG preview at upload time so the
  admin grid and the share page never load full-size originals.
- The ZIP is assembled in the visitor's browser by streaming each file from
  storage (client-zip, 2.6 KB). Nothing passes through Vercel, so there is no
  function time limit; the only ceiling is the visitor's connection.
  Chrome/Edge stream directly to the chosen file. Safari/Firefox buffer the
  archive in memory first, which is fine for a few hundred photos on a laptop.
- Share links look like `/share/4f0d9a2c…` (32 random hex chars). Turning a
  folder's link off, or creating a new link, cuts off access immediately —
  files in the private bucket are never reachable by URL guessing.

## Limits to know

- Per-file size limit is a project-wide Supabase setting
  (Storage → Settings → "Global file size limit", default 50 MB). Fine for
  photos; raise it if staff ever need to share video.
- HEIC photos straight off an iPhone upload fine but won't get a preview
  on Windows browsers (they can't decode HEIC); they show a file icon and
  are still in the ZIP. Exporting as JPEG from the phone avoids this.
- Files stay until a folder is deleted. Storage usage shows on the drive
  list page.
