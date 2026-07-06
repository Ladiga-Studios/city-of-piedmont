// POST /api/newsletter/subscribe
// Public endpoint: saves an email address to the `newsletter_subscribers` table.
// Body: { email }
//
// Behaviour:
//   - validates the email format
//   - inserts the row; if the email already exists (unique constraint), treats it
//     as success ("already subscribed") rather than an error
//   - never reveals whether an email was already on the list beyond a friendly note
//
// Requires a `newsletter_subscribers` table (see the SQL in the README).

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const email = String(body?.email || '').trim().toLowerCase();
  if (!email || !EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  try {
    const supabase = createClient();
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email, source: 'website' });

    if (error) {
      // 23505 = unique_violation: the email is already subscribed. That's fine.
      if (error.code === '23505' || /duplicate key|unique/i.test(error.message || '')) {
        return NextResponse.json({ ok: true, already: true });
      }
      // Table missing or other DB issue.
      if (/relation .*newsletter_subscribers.* does not exist/i.test(error.message || '')) {
        return NextResponse.json(
          { error: 'The newsletter isn\u2019t set up yet. Please try again later.' },
          { status: 503 }
        );
      }
      return NextResponse.json({ error: 'Could not subscribe right now. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, already: false });
  } catch {
    return NextResponse.json({ error: 'Could not subscribe right now. Please try again.' }, { status: 500 });
  }
}
