// POST /api/contact
// Sends the public contact form to the city's main inbox via Resend.
// Body (JSON): { name, email, message }
// Env: RESEND_API_KEY (required), CONTACT_TO (optional, defaults to
// info@piedmontcity.org), CONTACT_FROM (optional).

import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function POST(request) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { ok: false, error: 'Email service is not configured.' },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  const name = String(body?.name || '').trim().slice(0, 200);
  const email = String(body?.email || '').trim().slice(0, 254);
  const message = String(body?.message || '').trim().slice(0, 5000);

  if (!name || !message || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'Please complete every field.' }, { status: 400 });
  }

  const to = process.env.CONTACT_TO || 'info@piedmontcity.org';
  const from = process.env.CONTACT_FROM || 'City of Piedmont Website <contact@piedmontcity.org>';

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: `Website contact form: ${name}`,
      html: `
        <p style="font-family:Arial,sans-serif;font-size:13px;"><b>Name:</b> ${esc(name)}<br/>
        <b>Email:</b> ${esc(email)}</p>
        <p style="font-family:Arial,sans-serif;font-size:13px;white-space:pre-wrap;">${esc(message)}</p>`,
    });
    if (error) throw new Error(error.message || 'send failed');
  } catch {
    return NextResponse.json(
      { ok: false, error: 'The message could not be sent. Please try again.' },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
