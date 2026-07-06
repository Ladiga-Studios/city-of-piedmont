'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase-client';

const ITEMS = [
  { href: '/admin', label: 'Overview', icon: 'M3 12l9-9 9 9M5 10v10h5v-6h4v6h5V10' },
  { href: '/admin/minutes', label: 'Council Minutes', icon: 'M14 3v5h5M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zM9 13h6M9 17h6' },
  { href: '/admin/notices', label: 'Notices & Bids', icon: 'M3 5h18M3 12h18M3 19h12M19 16l2 2-2 2' },
  { href: '/admin/news', label: 'News', icon: 'M4 4h16v16H4zM8 8h8M8 12h8M8 16h5' },
  { href: '/admin/events', label: 'Events', icon: 'M3 4h18v17H3zM3 9h18M8 2v4M16 2v4' },
  { href: '/admin/alerts', label: 'Site Alerts', icon: 'M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L14.7 3.9a2 2 0 00-3.4 0z' },
  { href: '/admin/businesses', label: 'Businesses', icon: 'M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5' },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);

  async function signOut() {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  }

  function isActive(href) {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  }

  return (
    <>
      {/* mobile top bar */}
      <div className="adminx-mobilebar">
        <span className="adminx-brand">City of <em>Piedmont</em></span>
        <button className="adminx-burger" aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)}>
          <span /><span /><span />
        </button>
      </div>

      <aside className={`adminx-sidebar ${open ? 'open' : ''}`}>
        <div className="adminx-logo">
          <span className="adminx-brand">City of <em>Piedmont</em></span>
          <span className="adminx-sub">Admin Console</span>
        </div>
        <nav className="adminx-nav" aria-label="Admin sections">
          {ITEMS.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className={`adminx-link ${isActive(it.href) ? 'active' : ''}`}
              aria-current={isActive(it.href) ? 'page' : undefined}
              onClick={() => setOpen(false)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d={it.icon} /></svg>
              {it.label}
            </Link>
          ))}
        </nav>
        <div className="adminx-foot">
          <Link href="/" className="adminx-link subtle">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M10 19l-7-7 7-7M3 12h18" /></svg>
            View site
          </Link>
          <button className="adminx-link subtle" onClick={signOut}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M16 17l5-5-5-5M21 12H9M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /></svg>
            Sign out
          </button>
        </div>
      </aside>
      {open && <div className="adminx-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />}
    </>
  );
}
