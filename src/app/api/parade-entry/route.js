// POST /api/parade-entry
// Receives the Christmas Parade Entry Form (hidden page /christmas-parade)
// and emails it to City Hall.
//
// Fields: orgName*, orgAddress, cityStateZip, representative*, contact*,
//         announcement*, category* (one or more), otherCategory (required
//         when "Other" is marked), website (honeypot). * = required.
//
// Env vars:
//   RESEND_API_KEY    required (same key the work order form uses)
//   PARADE_ENTRY_TO   optional, comma separated; defaults to Amy Rawson and Jay Wilson
//   PARADE_ENTRY_FROM optional; defaults to parade@piedmontcity.org

import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { checkTurnstile, clientIp } from '@/lib/turnstile';

export const runtime = 'nodejs';

const MAX_FIELD = 2000;
const DEFAULT_TO = ['amy.rawson@piedmontcity.org', 'jay.wilson@piedmontcity.org'];

// Keep in sync with CATEGORIES in src/app/christmas-parade/ParadeEntryForm.jsx.
const CATEGORIES = new Set([
  'Classic Car/Vehicle/Tractor',
  'Fire Department',
  'Float',
  'Business/School/Church Group',
  'Beauty Pageant Winner',
  'Other',
]);

const clean = (v) => String(v || '').trim().slice(0, MAX_FIELD);
const esc = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function buildHtml(f) {
  const row = (label, value) => `
    <tr>
      <td style="background:#eef3f8;padding:10px 14px;font-weight:bold;font-family:Arial,sans-serif;font-size:13px;border-bottom:1px solid #fff;">${esc(label)}</td>
    </tr>
    <tr>
      <td style="padding:10px 14px 16px;font-family:Arial,sans-serif;font-size:13px;white-space:pre-wrap;">${esc(value) || '&mdash;'}</td>
    </tr>`;
  return `
  <div style="max-width:640px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #dfe5ec;border-radius:6px;overflow:hidden;">
      ${row('Name of Organization/Group', f.orgName)}
      ${row('Address of Organization/Group', f.orgAddress)}
      ${row('City, State and Zip', f.cityStateZip)}
      ${row('Authorized Representative', f.representative)}
      ${row('Representative Phone Number or Email Address', f.contact)}
      ${row('How the entry should be announced downtown', f.announcement)}
      ${row('Category for Parade', f.categoryText)}
    </table>
    <p style="font-family:Arial,sans-serif;font-size:12px;color:#667;">
      Submitted from the Christmas Parade Entry Form on piedmontcity.org.
    </p>
  </div>`;
}

function buildText(f) {
  return [
    `Name of Organization/Group: ${f.orgName}`,
    `Address of Organization/Group: ${f.orgAddress || '-'}`,
    `City, State and Zip: ${f.cityStateZip || '-'}`,
    `Authorized Representative: ${f.representative}`,
    `Representative Phone Number or Email Address: ${f.contact}`,
    `How the entry should be announced downtown:\n${f.announcement}`,
    `Category for Parade: ${f.categoryText}`,
    '',
    'Submitted from the Christmas Parade Entry Form on piedmontcity.org.',
  ].join('\n');
}

export async function POST(request) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { ok: false, error: 'Email service is not configured (missing RESEND_API_KEY).' },
      { status: 500 }
    );
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request.' }, { status: 400 });
  }

  // Honeypot: real people never fill this hidden field. Pretend success.
  if (clean(form.get('website'))) return NextResponse.json({ ok: true });

  const categories = [...new Set(form.getAll('category').map(clean))].filter((c) => CATEGORIES.has(c));
  const f = {
    orgName: clean(form.get('orgName')),
    orgAddress: clean(form.get('orgAddress')),
    cityStateZip: clean(form.get('cityStateZip')),
    representative: clean(form.get('representative')),
    contact: clean(form.get('contact')),
    announcement: clean(form.get('announcement')),
    otherCategory: clean(form.get('otherCategory')),
  };

  if (!f.orgName || !f.representative || !f.contact || !f.announcement) {
    return NextResponse.json({ ok: false, error: 'Please complete every required field.' }, { status: 400 });
  }
  if (categories.length === 0) {
    return NextResponse.json({ ok: false, error: 'Please mark at least one parade category.' }, { status: 400 });
  }
  if (categories.includes('Other') && !f.otherCategory) {
    return NextResponse.json({ ok: false, error: 'Please tell us what "Other" is.' }, { status: 400 });
  }

  f.categoryText = categories
    .map((c) => (c === 'Other' ? `Other: ${f.otherCategory}` : c))
    .join('\n');

  if (!(await checkTurnstile(form.get('cf-turnstile-response'), clientIp(request)))) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Please finish the quick security check above the button, then submit again, or call City Hall at 256-447-3560.',
      },
      { status: 400 }
    );
  }

  const to = process.env.PARADE_ENTRY_TO
    ? process.env.PARADE_ENTRY_TO.split(',').map((s) => s.trim()).filter(Boolean)
    : DEFAULT_TO;
  const from = process.env.PARADE_ENTRY_FROM || 'City of Piedmont <parade@piedmontcity.org>';
  const replyTo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.contact) ? f.contact : undefined;

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from,
      to,
      ...(replyTo ? { replyTo } : {}),
      subject: `Christmas Parade Entry: ${f.orgName}`.slice(0, 200),
      html: buildHtml(f),
      text: buildText(f),
    });
    if (error) throw new Error(error.message || 'send failed');
  } catch (e) {
    console.error('parade-entry send failed:', e && e.message);
    return NextResponse.json(
      { ok: false, error: 'The email could not be sent. Please try again.' },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
