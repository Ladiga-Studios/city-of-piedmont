-- ============================================================
-- CITY OF PIEDMONT — File Drive
-- Run in the Supabase SQL editor. Safe to re-run.
--
-- Powers /admin/drive (staff upload folders of photos or any files)
-- and /share/<token> (a public page where anyone with the link can
-- browse the folder and download everything as one ZIP).
--
-- Files live in a PRIVATE bucket called 'drive'. Nothing is reachable
-- by URL guessing: the share page signs short-lived download links
-- server-side using the service-role key. Turning a folder's link off
-- (or regenerating it) cuts off access immediately.
-- ============================================================

-- ---------- FOLDERS ----------
create table if not exists public.drive_folders (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text,
  -- 32-hex-char random token that forms the share link: /share/<token>
  share_token   text not null unique default replace(gen_random_uuid()::text, '-', ''),
  share_enabled boolean not null default true,
  created_by    uuid references auth.users (id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------- FILES ----------
create table if not exists public.drive_files (
  id          uuid primary key default gen_random_uuid(),
  folder_id   uuid not null references public.drive_folders (id) on delete cascade,
  name        text not null,                 -- display / download filename (unique within a folder)
  path        text not null unique,          -- storage object path in the 'drive' bucket
  thumb_path  text,                          -- small JPEG preview for images (nullable)
  size        bigint not null default 0,     -- bytes
  mime        text,
  width       int,
  height      int,
  created_at  timestamptz not null default now()
);

create index if not exists drive_files_folder_idx on public.drive_files (folder_id, name);

-- ---------- FOLDER STATS VIEW (used by the admin list) ----------
create or replace view public.drive_folder_stats
with (security_invoker = true) as
select
  f.*,
  coalesce(count(x.id), 0)::int      as file_count,
  coalesce(sum(x.size), 0)::bigint   as total_bytes,
  max(x.created_at)                  as last_upload_at
from public.drive_folders f
left join public.drive_files x on x.folder_id = f.id
group by f.id;

-- ---------- ROW LEVEL SECURITY ----------
-- Staff (signed-in users) can do everything. There is deliberately NO
-- anonymous policy: the public share page reads through the service
-- role on the server, so share tokens are never listable from a browser.
alter table public.drive_folders enable row level security;
alter table public.drive_files   enable row level security;

drop policy if exists "drive folders staff all" on public.drive_folders;
drop policy if exists "drive files staff all"   on public.drive_files;

create policy "drive folders staff all" on public.drive_folders
  for all to authenticated using (true) with check (true);
create policy "drive files staff all" on public.drive_files
  for all to authenticated using (true) with check (true);

-- ---------- STORAGE BUCKET (private) ----------
insert into storage.buckets (id, name, public)
values ('drive', 'drive', false)
on conflict (id) do update set public = false;

drop policy if exists "drive bucket staff all" on storage.objects;
create policy "drive bucket staff all" on storage.objects
  for all to authenticated
  using (bucket_id = 'drive') with check (bucket_id = 'drive');

-- ---------- keep updated_at fresh ----------
create or replace function public.drive_touch_folder()
returns trigger language plpgsql as $$
begin
  update public.drive_folders set updated_at = now()
  where id = coalesce(new.folder_id, old.folder_id);
  return null;
end $$;

drop trigger if exists drive_files_touch on public.drive_files;
create trigger drive_files_touch
  after insert or delete on public.drive_files
  for each row execute function public.drive_touch_folder();

-- ============================================================
-- NOTES
-- • Per-file upload limit is set project-wide under Storage → Settings
--   ("Global file size limit", default 50 MB). Phone photos are 2–8 MB,
--   so the default is fine. Raise it if staff need to share video.
-- • The share page and /api/share need SUPABASE_SERVICE_ROLE_KEY set in
--   Vercel → Project → Settings → Environment Variables (it is already
--   in your local .env.local).
-- ============================================================
