// Server-only Supabase client using the SERVICE ROLE key.
// Bypasses row-level security, so it must only ever be imported from
// server code (route handlers, server components) — never from a
// 'use client' file. Used by the public share page to look up a folder
// by its token and sign short-lived download URLs for a private bucket.

import 'server-only';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export function hasServiceRole() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set on the server.');
  }
  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
