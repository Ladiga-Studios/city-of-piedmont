'use client';

import { useEffect, useRef } from 'react';

/**
 * Cloudflare Turnstile widget. Drop it inside a <form>; Cloudflare adds a
 * hidden `cf-turnstile-response` input to it, so `new FormData(form)` picks
 * the token up with no extra code. Tokens are single use: call
 * resetTurnstile() after every submit attempt.
 */

export const TURNSTILE_SITEKEY = '0x4AAAAAAFS26njn_ycxBtBN';

const SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

function loadScript() {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (!window.__tsLoading) {
    window.__tsLoading = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = SRC;
      s.async = true;
      s.defer = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('turnstile failed to load'));
      document.head.appendChild(s);
    });
  }
  return window.__tsLoading;
}

/** Reset one widget (the element's own) or, with no argument, the default one. */
export function resetTurnstile(form) {
  try {
    const el = form && form.querySelector ? form.querySelector('[data-ts-id]') : null;
    const id = el ? el.getAttribute('data-ts-id') : undefined;
    window.turnstile?.reset(id || undefined);
  } catch {
    /* nothing rendered */
  }
}

export function Turnstile({ sitekey = TURNSTILE_SITEKEY, className, style, theme = 'light' }) {
  const ref = useRef(null);
  useEffect(() => {
    let id;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return;
        id = window.turnstile.render(ref.current, { sitekey, theme, size: 'flexible', appearance: 'always' });
        if (ref.current && id) ref.current.setAttribute('data-ts-id', id);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (id && window.turnstile) window.turnstile.remove(id);
    };
  }, [sitekey, theme]);
  return <div ref={ref} className={className} style={{ minHeight: 65, ...style }} />;
}
