// ------------------------------------------------------------------
// CITY BULLETIN BOARD — FALLBACK LIST ONLY.
//
// The homepage board is now managed in the admin console at
// /admin/flyers (backed by the Supabase `flyers` table; see
// supabase-flyers.sql). This static list is used only if that table
// doesn't exist yet — once the SQL has been run, the database is the
// source of truth and this file is ignored, even when the table is
// empty.
// ------------------------------------------------------------------

export const FLYERS = [
  {
    title: 'Downtown Trick or Treat',
    caption: 'Oct 31 · 5:00–7:00 PM · Downtown Piedmont',
    image: '/images/flyers/downtown-halloween-2026.webp',
    width: 640,
    height: 828,
    href: '/documents/downtown-halloween-2026-flyer.pdf',
    linkLabel: 'View flyer',
  },
  {
    title: 'Now Hiring: Recreation Coordinator',
    caption: 'Apply by Fri, Sept 4 · Parks & Recreation',
    image: '/images/flyers/recreation-coordinator-2026.webp',
    width: 546,
    height: 900,
    href: '/careers',
    linkLabel: 'See the posting',
  },
];
