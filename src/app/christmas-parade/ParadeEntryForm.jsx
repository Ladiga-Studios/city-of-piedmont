'use client';

import { useState } from 'react';
import { useToast } from '@/components/ClientEffects';
import { Turnstile, resetTurnstile } from '@/components/Turnstile';

// Parade categories. Keep in sync with CATEGORIES in /api/parade-entry/route.js.
const CATEGORIES = [
  'Classic Car/Vehicle/Tractor',
  'Fire Department',
  'Float',
  'Business/School/Church Group',
  'Beauty Pageant Winner',
  'Other',
];

function Req() {
  return <span className="pe-req" aria-hidden="true">*</span>;
}

export default function ParadeEntryForm() {
  const toast = useToast();
  const [errs, setErrs] = useState({});
  const [sending, setSending] = useState(false);
  const [otherOn, setOtherOn] = useState(false);

  async function submit(e) {
    e.preventDefault();
    const f = e.target;
    const cats = new FormData(f).getAll('category');
    const next = {};
    if (!f.orgName.value.trim()) next.orgName = 'Enter the name of the organization or group.';
    if (!f.representative.value.trim()) next.representative = 'Enter the authorized representative.';
    if (!f.contact.value.trim()) next.contact = 'Enter a phone number or email address.';
    if (!f.announcement.value.trim()) next.announcement = 'Tell us how your entry should be announced.';
    if (cats.length === 0) next.category = 'Mark at least one category.';
    else if (cats.includes('Other') && !f.otherCategory.value.trim()) next.other = 'Tell us what "Other" is.';
    setErrs(next);
    if (Object.keys(next).length > 0) {
      const first = f.querySelector('input[aria-invalid="true"], textarea[aria-invalid="true"], .pe-cats[aria-invalid="true"] input');
      first?.focus?.();
      return;
    }

    setSending(true);
    try {
      const res = await fetch('/api/parade-entry', { method: 'POST', body: new FormData(f) });
      const out = await res.json().catch(() => ({}));
      if (res.status === 400 && out.error) {
        toast('Could not submit', out.error, 'error');
        return;
      }
      if (!res.ok || !out.ok) throw new Error(out.error || 'Send failed');
      toast('Entry submitted', 'Thank you! Your parade entry has been sent to City Hall.');
      f.reset();
      setOtherOn(false);
    } catch {
      toast(
        'Could not submit',
        'Your entry did not go through. Please try again, or call City Hall at 256-447-3560.',
        'error'
      );
    } finally {
      resetTurnstile(f);
      setSending(false);
    }
  }

  const inv = (k) => (errs[k] ? { 'aria-invalid': 'true', 'aria-describedby': `pe-${k}-err` } : {});
  const err = (k) => errs[k] && <span className="err" id={`pe-${k}-err`}>{errs[k]}</span>;

  return (
    <form className="wo-form" onSubmit={submit} noValidate>
      <input type="text" name="website" tabIndex="-1" autoComplete="off" className="wo-hp" aria-hidden="true" />

      <p className="pe-legend-note"><Req /> Required</p>

      <div className="wo-grid">
        <div className="field wo-full">
          <label htmlFor="pe-orgName">Name of Organization/Group <Req /></label>
          <input id="pe-orgName" name="orgName" type="text" autoComplete="organization" required {...inv('orgName')} />
          {err('orgName')}
        </div>

        <div className="field wo-full">
          <label htmlFor="pe-orgAddress">Address of Organization/Group</label>
          <input id="pe-orgAddress" name="orgAddress" type="text" autoComplete="street-address" />
        </div>

        <div className="field wo-full">
          <label htmlFor="pe-cityStateZip">City, State and Zip</label>
          <input id="pe-cityStateZip" name="cityStateZip" type="text" placeholder="Piedmont, AL 36272" />
        </div>

        <div className="field">
          <label htmlFor="pe-representative">Authorized Representative <Req /></label>
          <input id="pe-representative" name="representative" type="text" autoComplete="name" required {...inv('representative')} />
          {err('representative')}
        </div>

        <div className="field">
          <label htmlFor="pe-contact">Representative Phone Number or Email Address <Req /></label>
          <input id="pe-contact" name="contact" type="text" autoComplete="tel" required {...inv('contact')} />
          {err('contact')}
        </div>

        <div className="field wo-full">
          <label htmlFor="pe-announcement">How would you like your entry to be announced downtown the night of the parade? <Req /></label>
          <textarea id="pe-announcement" name="announcement" rows="5" required {...inv('announcement')} />
          {err('announcement')}
        </div>

        <fieldset className="pe-cats wo-full" {...inv('category')}>
          <legend>Category for Parade <Req /></legend>
          <p className="wo-hint">Mark all that apply.</p>
          <ul>
            {CATEGORIES.map((c, i) => (
              <li key={c}>
                <label className="pe-check">
                  <input
                    type="checkbox"
                    name="category"
                    value={c}
                    onChange={c === 'Other' ? (e) => setOtherOn(e.target.checked) : undefined}
                  />
                  <span>{c}</span>
                </label>
                {c === 'Other' && (
                  <div className="pe-other" hidden={!otherOn}>
                    <label htmlFor="pe-otherCategory" className="pe-sr">Please list what &ldquo;Other&rdquo; is</label>
                    <input
                      id="pe-otherCategory"
                      name="otherCategory"
                      type="text"
                      placeholder="Please list"
                      disabled={!otherOn}
                      {...inv('other')}
                    />
                    {err('other')}
                  </div>
                )}
              </li>
            ))}
          </ul>
          {err('category')}
        </fieldset>
      </div>

      <Turnstile theme="light" style={{ marginTop: '1.4rem' }} />

      <button className="btn btn-primary wo-submit" type="submit" disabled={sending}>
        {sending ? 'Submitting…' : 'Submit Entry'}
      </button>
    </form>
  );
}
