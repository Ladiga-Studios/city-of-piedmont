'use client';

import { useState } from 'react';

/**
 * Newsletter subscribe form. Posts the email to /api/newsletter/subscribe.
 * Shows inline loading / success / error states. Used on the homepage news
 * area and the /news page.
 *
 * Props:
 *   variant   'panel' (boxed, for the news page) or 'inline' (compact strip).
 *             Affects layout class only.
 *   heading   optional heading text
 *   blurb     optional supporting line
 */
export default function NewsletterSignup({ variant = 'panel', heading, blurb }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [message, setMessage] = useState('');

  async function submit(e) {
    e.preventDefault();
    const value = email.trim();
    if (!value) { setStatus('error'); setMessage('Please enter your email address.'); return; }

    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus('error');
        setMessage(data?.error || 'Something went wrong. Please try again.');
        return;
      }
      setStatus('done');
      setMessage(data?.already
        ? 'You\u2019re already on the list \u2014 thanks for your interest!'
        : 'You\u2019re subscribed. Watch your inbox for city news.');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage('Couldn\u2019t reach the server. Please try again.');
    }
  }

  return (
    <div className={`nl nl-${variant}`}>
      <div className="nl-head">
        <span className="nl-icon" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="5" width="18" height="14" rx="2.5" />
            <path d="M3.5 7.5l7.2 5.2a2 2 0 002.6 0l7.2-5.2" />
          </svg>
        </span>
        <div className="nl-text">
          <p className="nl-heading">{heading || 'Stay in the loop'}</p>
          <p className="nl-blurb">{blurb || 'Get city news, events, and announcements delivered to your inbox.'}</p>
        </div>
      </div>

      {status === 'done' ? (
        <p className="nl-success" role="status">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>
          {message}
        </p>
      ) : (
        <form className="nl-form" onSubmit={submit} noValidate>
          <div className="nl-field">
            <input
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (status === 'error') setStatus('idle'); }}
              placeholder="you@example.com"
              aria-label="Email address"
              aria-invalid={status === 'error'}
              disabled={status === 'loading'}
            />
            <button type="submit" className="nl-btn" disabled={status === 'loading'}>
              {status === 'loading' ? 'Subscribing\u2026' : 'Subscribe'}
            </button>
          </div>
          {status === 'error' && <p className="nl-error" role="alert">{message}</p>}
          <p className="nl-fine">We’ll only use your email for city updates. Unsubscribe anytime.</p>
        </form>
      )}
    </div>
  );
}
