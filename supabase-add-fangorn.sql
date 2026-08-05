-- ============================================================
-- CITY OF PIEDMONT — Permanent Record (Fangorn) columns
-- Run this in the Supabase SQL editor (Dashboard > SQL Editor).
--
-- Adds anchor-tracking columns to minutes, public_notices, and
-- news. Each published record gets a SHA-256 fingerprint and,
-- once anchored, the Fangorn commit/vertex CIDs and the
-- settlement transaction hash. Safe to re-run.
--
-- anchor_status values:
--   'pending'  — not yet anchored (default; the sweep script or
--                the upload route will anchor it)
--   'anchored' — fingerprint settled on-chain
--   'failed'   — last attempt errored (sweep retries these)
--   'skipped'  — staff chose not to anchor this record
-- ============================================================

-- ---------- COUNCIL MINUTES ----------
alter table public.minutes add column if not exists sha256            text;
alter table public.minutes add column if not exists anchor_status     text not null default 'pending';
alter table public.minutes add column if not exists anchor_commit_cid text;
alter table public.minutes add column if not exists anchor_vertex_cid text;
alter table public.minutes add column if not exists anchor_tx         text;
alter table public.minutes add column if not exists anchored_at       timestamptz;
alter table public.minutes add column if not exists anchor_error      text;

-- ---------- PUBLIC NOTICES ----------
alter table public.public_notices add column if not exists sha256            text;
alter table public.public_notices add column if not exists anchor_status     text not null default 'pending';
alter table public.public_notices add column if not exists anchor_commit_cid text;
alter table public.public_notices add column if not exists anchor_vertex_cid text;
alter table public.public_notices add column if not exists anchor_tx         text;
alter table public.public_notices add column if not exists anchored_at       timestamptz;
alter table public.public_notices add column if not exists anchor_error      text;

-- ---------- NEWS ----------
-- News items are text (not PDFs); the fingerprint covers the
-- canonical published fields. Edits produce a new fingerprint —
-- the previous one stays in the anchored history as an earlier
-- version, so corrections are visible rather than silent.
alter table public.news add column if not exists sha256            text;
alter table public.news add column if not exists anchor_status     text not null default 'pending';
alter table public.news add column if not exists anchor_commit_cid text;
alter table public.news add column if not exists anchor_vertex_cid text;
alter table public.news add column if not exists anchor_tx         text;
alter table public.news add column if not exists anchored_at       timestamptz;
alter table public.news add column if not exists anchor_error      text;
alter table public.news add column if not exists prev_sha256       text;  -- fingerprint this version superseded

-- Existing public-read policies on these tables already expose the
-- new columns; no RLS changes are needed.
