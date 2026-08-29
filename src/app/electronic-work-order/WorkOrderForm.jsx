'use client';

import { useRef, useState } from 'react';
import { useToast } from '@/components/ClientEffects';

// Departments a work order can be routed to. Edit this list as needed —
// it only affects this form.
const DEPARTMENTS = [
  'STREET DEPT',
  'WATER & GAS DEPT',
  'POWER & LIGHT DEPT',
  'SANITATION DEPT',
  'PARKS & RECREATION',
  'CEMETERY',
  'PUBLIC WORKS — OTHER',
];

// Who is submitting the order. Matches the old Google Form list.
const REQUESTERS = [
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
];

const MAX_PHOTO_MB = 8;

export default function WorkOrderForm() {
  const toast = useToast();
  const [errs, setErrs] = useState({});
  const [sending, setSending] = useState(false);
  const [photoName, setPhotoName] = useState('');
  const fileRef = useRef(null);

  function onPhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) { setPhotoName(''); return; }
    if (!file.type.startsWith('image/')) {
      setErrs((p) => ({ ...p, photo: 'Please choose an image file (JPG, PNG, HEIC, etc.).' }));
      e.target.value = '';
      setPhotoName('');
      return;
    }
    if (file.size > MAX_PHOTO_MB * 1024 * 1024) {
      setErrs((p) => ({ ...p, photo: `Photo must be under ${MAX_PHOTO_MB} MB.` }));
      e.target.value = '';
      setPhotoName('');
      return;
    }
    setErrs((p) => ({ ...p, photo: undefined }));
    setPhotoName(file.name);
  }

  async function submit(e) {
    e.preventDefault();
    const f = e.target;
    const next = {};
    if (!f.department.value) next.department = 'Select a department.';
    if (!f.date.value) next.date = 'Choose a date.';
    if (!f.customerName.value.trim()) next.customerName = 'Enter the customer name.';
    if (!f.customerAddress.value.trim()) next.customerAddress = 'Enter the customer address.';
    if (!f.customerPhone.value.trim()) next.customerPhone = 'Enter a phone number.';
    if (!f.instructions.value.trim()) next.instructions = 'Describe the work needed.';
    if (!f.requestedBy.value) next.requestedBy = 'Select who is requesting this order.';
    setErrs(next);
    if (Object.keys(next).length > 0) return;

    setSending(true);
    try {
      const data = new FormData(f);
      const res = await fetch('/api/work-order', { method: 'POST', body: data });
      const out = await res.json().catch(() => ({}));
      if (!res.ok || !out.ok) throw new Error(out.error || 'Send failed');
      toast('Work order submitted', 'It has been emailed to the Administration Office.');
      f.reset();
      setPhotoName('');
      if (fileRef.current) fileRef.current.value = '';
    } catch {
      toast(
        'Could not submit',
        'The work order did not go through. Please try again, or call the Administration Office at 256-447-3560.',
        'error'
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="wo-form" onSubmit={submit} noValidate>
      {/* Honeypot — hidden from people, catches naive bots. */}
      <input type="text" name="website" tabIndex="-1" autoComplete="off" className="wo-hp" aria-hidden="true" />

      <div className="wo-grid">
        <div className="field">
          <label htmlFor="wo-department">Department</label>
          <select id="wo-department" name="department" defaultValue="">
            <option value="" disabled>Select a department…</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          {errs.department && <span className="err">{errs.department}</span>}
        </div>

        <div className="field">
          <label htmlFor="wo-date">Date</label>
          <input id="wo-date" name="date" type="date" />
          {errs.date && <span className="err">{errs.date}</span>}
        </div>

        <div className="field">
          <label htmlFor="wo-name">Customer Name</label>
          <input id="wo-name" name="customerName" type="text" autoComplete="name" />
          {errs.customerName && <span className="err">{errs.customerName}</span>}
        </div>

        <div className="field">
          <label htmlFor="wo-phone">Customer Phone Number</label>
          <input id="wo-phone" name="customerPhone" type="tel" autoComplete="tel" />
          {errs.customerPhone && <span className="err">{errs.customerPhone}</span>}
        </div>

        <div className="field wo-full">
          <label htmlFor="wo-address">Customer Address</label>
          <input id="wo-address" name="customerAddress" type="text" autoComplete="street-address" />
          {errs.customerAddress && <span className="err">{errs.customerAddress}</span>}
        </div>

        <div className="field wo-full">
          <label htmlFor="wo-instructions">Instructions</label>
          <textarea id="wo-instructions" name="instructions" rows="5" placeholder="Describe the work needed and any details the crew should know." />
          {errs.instructions && <span className="err">{errs.instructions}</span>}
        </div>

        <div className="field wo-full">
          <label htmlFor="wo-photo">Photo (optional)</label>
          <input
            id="wo-photo"
            ref={fileRef}
            name="photo"
            type="file"
            accept="image/*"
            onChange={onPhotoChange}
          />
          <span className="wo-hint">
            {photoName ? `Attached: ${photoName}` : `One image, up to ${MAX_PHOTO_MB} MB. It will be attached to the email.`}
          </span>
          {errs.photo && <span className="err">{errs.photo}</span>}
        </div>

        <div className="field wo-full">
          <label htmlFor="wo-requested">Work Order Requested By</label>
          <select id="wo-requested" name="requestedBy" defaultValue="">
            <option value="" disabled>Select…</option>
            {REQUESTERS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          {errs.requestedBy && <span className="err">{errs.requestedBy}</span>}
        </div>
      </div>

      <button className="btn btn-primary wo-submit" type="submit" disabled={sending}>
        {sending ? 'Submitting…' : 'Submit Work Order'}
      </button>
    </form>
  );
}
