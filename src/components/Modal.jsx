'use client';

import { useEffect, useRef } from 'react';

export default function Modal({ open, onClose, title, children }) {
  const ref = useRef(null);
  const lastFocus = useRef(null);

  useEffect(() => {
    if (open) {
      lastFocus.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      const focusable = ref.current?.querySelectorAll('button, a, input, textarea, select');
      focusable?.[0]?.focus();
    } else {
      document.body.style.overflow = '';
      lastFocus.current?.focus?.();
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const onKey = (e) => {
      if (!open) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const f = ref.current?.querySelectorAll('button, a, input, textarea, select');
        if (!f || f.length === 0) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <div
      className={`modal-overlay ${open ? 'open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-hidden={!open}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal" ref={ref}>
        <h3 id="modal-title">{title}</h3>
        {children}
      </div>
    </div>
  );
}
