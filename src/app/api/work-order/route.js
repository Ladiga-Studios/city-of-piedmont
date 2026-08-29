// POST /api/work-order
// Receives the Electronic Work Order form (multipart/form-data) and emails it
// to the Administration Office, replicating the old Google Form behaviour.
//
// Fields: department, date, customerName, customerAddress, customerPhone,
//         instructions, requestedBy, photo (optional image), website (honeypot)
//
// Email delivery uses Resend (https://resend.com). Required env vars:
//   RESEND_API_KEY   — API key from the Resend dashboard
//   WORK_ORDER_TO    — optional; defaults to payments@piedmontcity.org
//   WORK_ORDER_FROM  — optional; defaults to workorder@piedmontcity.org
//                      (the sending domain must be verified in Resend)

import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export const runtime = 'nodejs';

const MAX_PHOTO_BYTES = 8 * 1024 * 1024; // keep in sync with the form
const MAX_FIELD = 2000;

// Server-side allow-lists — reject anything the form doesn't offer.
const DEPARTMENTS = new Set([
  'STREET DEPT',
  'WATER & GAS DEPT',
  'POWER & LIGHT DEPT',
  'SANITATION DEPT',
  'PARKS & RECREATION',
  'CEMETERY',
  'PUBLIC WORKS — OTHER',
]);
const REQUESTERS = new Set([
  'MAYOR – KEVIN FARMER',
  'DISTRICT 1 – BRITTNEY WILLIAMS',
  'DISTRICT 2 – KEVIN MCCORD',
  'DISTRICT 3 – FRANK COBB',
  'DISTRICT 4 – MARK EPPS',
  'DISTRICT 5 – GREG SOUTH',
  'DISTRICT 6 – CARLOS FARMER',
  'DISTRICT 7 – MATT ROGERS',
  'ADMINISTRATION OFFICE',
  'POLICE DEPT',
]);

function clean(value) {
  return String(value || '').trim().slice(0, MAX_FIELD);
}

function esc(s) {
  return s
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Renders the email as a simple labeled table, like the old form's emails.
function buildHtml(fields) {
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
      ${row('Department', fields.department)}
      ${row('Customer Name', fields.customerName)}
      ${row('Date', fields.date)}
      ${row('Customer Address', fields.customerAddress)}
      ${row('Customer Phone Number', fields.customerPhone)}
      ${row('Instructions', fields.instructions)}
      ${row('Work Order Requested By', fields.requestedBy)}
    </table>
    <p style="font-family:Arial,sans-serif;font-size:12px;color:#667;">
      Submitted from the Electronic Work Order page on piedmontcity.org.
      ${fields.hasPhoto ? 'A photo is attached to this email.' : 'No photo was attached.'}
    </p>
  </div>`;
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

  // Honeypot: real users never fill this hidden field. Pretend success.
  if (clean(form.get('website'))) {
    return NextResponse.json({ ok: true });
  }

  const fields = {
    department: clean(form.get('department')),
    date: clean(form.get('date')),
    customerName: clean(form.get('customerName')),
    customerAddress: clean(form.get('customerAddress')),
    customerPhone: clean(form.get('customerPhone')),
    instructions: clean(form.get('instructions')),
    requestedBy: clean(form.get('requestedBy')),
  };

  if (
    !DEPARTMENTS.has(fields.department) ||
    !REQUESTERS.has(fields.requestedBy) ||
    !fields.date || !fields.customerName || !fields.customerAddress ||
    !fields.customerPhone || !fields.instructions
  ) {
    return NextResponse.json(
      { ok: false, error: 'Please complete every field.' },
      { status: 400 }
    );
  }

  // Optional photo → email attachment.
  const attachments = [];
  const photo = form.get('photo');
  if (photo && typeof photo === 'object' && typeof photo.arrayBuffer === 'function' && photo.size > 0) {
    if (!String(photo.type || '').startsWith('image/')) {
      return NextResponse.json({ ok: false, error: 'The attachment must be an image.' }, { status: 400 });
    }
    if (photo.size > MAX_PHOTO_BYTES) {
      return NextResponse.json({ ok: false, error: 'Photo must be under 8 MB.' }, { status: 400 });
    }
    const buf = Buffer.from(await photo.arrayBuffer());
    attachments.push({
      filename: photo.name || 'work-order-photo.jpg',
      content: buf.toString('base64'),
    });
  }

  fields.hasPhoto = attachments.length > 0;

  const to = process.env.WORK_ORDER_TO || 'payments@piedmontcity.org';
  const from =
    process.env.WORK_ORDER_FROM || 'City of Piedmont <workorder@piedmontcity.org>';

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from,
      to,
      subject: 'New submission from Online Work Order',
      html: buildHtml(fields),
      attachments,
    });
    if (error) throw new Error(error.message || 'send failed');
  } catch {
    return NextResponse.json(
      { ok: false, error: 'The email could not be sent. Please try again.' },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
