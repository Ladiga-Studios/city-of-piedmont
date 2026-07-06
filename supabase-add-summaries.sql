-- ============================================================
-- CITY OF PIEDMONT — add AI summary fields to minutes
-- Run this in the Supabase SQL Editor.
-- Safe to run on an existing minutes table (uses IF NOT EXISTS).
-- ============================================================

alter table public.minutes
  add column if not exists summary       text,   -- 2-3 sentence plain-language overview
  add column if not exists decisions     jsonb default '[]'::jsonb,  -- array of key decisions/votes
  add column if not exists action_items  jsonb default '[]'::jsonb,  -- array of action items / next steps
  add column if not exists summary_status text default 'pending';
  -- summary_status: 'pending' (no summary yet) | 'ready' (generated) | 'failed'

-- Existing rows (the 59 you migrated) default to 'pending' so the
-- backfill script knows which ones still need a summary.
