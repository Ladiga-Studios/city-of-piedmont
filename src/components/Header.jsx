'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { SITE, NAV } from '@/lib/site';
import Seal from './Seal';
import HeaderSearch from './HeaderSearch';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setMenuOpen(false);
        setOpenDropdown(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Lock background scroll while the mobile slide-in menu is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <header className={`site-header ${menuOpen ? 'menu-open' : ''}`}>
      <div className="container nav">
        <Link href="/" className="brand" aria-label={`${SITE.name} home`} onClick={() => setMenuOpen(false)}>
          <Seal size={160} />
          <span className="brand-name">
            City of <em>Piedmont</em>
          </span>
        </Link>

        <nav aria-label="Primary" className={`primary-nav ${menuOpen ? 'open' : ''}`}>
          <ul className="nav-links">
            {NAV.map((item) => (
              <li
                key={item.label}
                className={item.children ? 'has-dropdown' : ''}
                onMouseEnter={() => item.children && setOpenDropdown(item.label)}
                onMouseLeave={() => item.children && setOpenDropdown(null)}
              >
                {item.children ? (
                  <>
                    <button
                      className="nav-link"
                      aria-expanded={openDropdown === item.label}
                      onClick={() =>
                        setOpenDropdown(openDropdown === item.label ? null : item.label)
                      }
                    >
                      {item.label}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
                    </button>
                    <ul className={`dropdown ${openDropdown === item.label ? 'show' : ''}`}>
                      <li><Link href={item.href} onClick={() => setMenuOpen(false)}>Overview</Link></li>
                      {item.children.map((c) => (
                        <li key={c.href}><Link href={c.href} onClick={() => setMenuOpen(false)}>{c.label}</Link></li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <Link href={item.href} className="nav-link" onClick={() => setMenuOpen(false)}>
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <HeaderSearch />
          <a href={SITE.payBillUrl} className="btn btn-primary nav-cta" target="_blank" rel="noopener noreferrer">
            Pay My Bill
          </a>
        </nav>

        {/* Mobile-only search toggle, sits in the top bar next to the hamburger. */}
        <div className="hdr-search-mobile">
          <HeaderSearch />
        </div>

        {/* Dim backdrop behind the open off-canvas menu; tap to close. */}
        <div
          className={`nav-backdrop ${menuOpen ? 'show' : ''}`}
          onClick={() => { setMenuOpen(false); setOpenDropdown(null); }}
          aria-hidden="true"
        />

        <button
          className={`hamburger ${menuOpen ? 'active' : ''}`}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => {
            const next = !menuOpen;
            setMenuOpen(next);
            if (!next) setOpenDropdown(null);
          }}
        >
          <span /><span /><span />
        </button>
      </div>
    </header>
  );
}
