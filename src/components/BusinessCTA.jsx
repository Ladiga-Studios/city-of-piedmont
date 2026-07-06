'use client';

import { useState } from 'react';
import Modal from './Modal';
import { useToast } from './ClientEffects';

export default function BusinessCTA() {
  const [open, setOpen] = useState(false);
  const toast = useToast();

  return (
    <div style={{ marginTop: 'var(--s4)', textAlign: 'center' }}>
      <button className="btn btn-primary" onClick={() => setOpen(true)}>
        List your business
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="List your business">
        <p>
          The Piedmont business directory is open to locally owned businesses. Submit your details and
          city staff will review and publish your listing.
        </p>
        <div className="modal-actions">
          <button className="btn btn-cancel" onClick={() => setOpen(false)}>Close</button>
          <button
            className="btn btn-primary"
            onClick={() => {
              setOpen(false);
              toast('Thanks!', 'A submission form will open here soon.');
            }}
          >
            Notify me
          </button>
        </div>
      </Modal>
    </div>
  );
}
