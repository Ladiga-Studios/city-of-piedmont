'use client';

// Thin forest-green utility bar above the main header:
// live weather · City Hall open/closed · quick links · translate menu.
// Everything is computed/fetched client-side after mount so SSR output is
// stable (no hydration mismatches) and nothing here can block the page.

import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cityHallStatus } from '@/lib/city-hours';
import { useWeather, WeatherGlyph } from '@/lib/use-weather';

// Google Translate's site-proxy (translate.goog) — free, no key, no widget JS.
const TRANSLATE_HOST = 'https://www-piedmontcity-org.translate.goog';
const LANGS = [
  ['es', 'Español'],
  ['zh-CN', '中文'],
  ['vi', 'Tiếng Việt'],
  ['ko', '한국어'],
  ['de', 'Deutsch'],
  ['fr', 'Français'],
];

export default function TopBar() {
  const pathname = usePathname() || '/';
  const [status, setStatus] = useState(null); // set after mount (SSR-safe)
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);
  const { weather } = useWeather();

  // City Hall status: compute on mount, then keep fresh every minute.
  useEffect(() => {
    const update = () => setStatus(cityHallStatus());
    update();
    const id = setInterval(update, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  // Close the translate menu on outside click / Esc.
  useEffect(() => {
    if (!langOpen) return;
    const onDown = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setLangOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [langOpen]);

  const translateHref = (lang) =>
    `${TRANSLATE_HOST}${pathname}?_x_tr_sl=en&_x_tr_tl=${lang}&_x_tr_hl=en`;

  return (
    <div className="topbar" role="navigation" aria-label="Utility">
      <div className="container topbar-inner">
        {/* Left: live City Hall status + weather */}
        <div className="topbar-live">
          {status && (
            <span className={`tb-status ${status.open ? 'is-open' : 'is-closed'}`}>
              <span className="tb-dot" aria-hidden="true" />
              {status.label}
              <span className="tb-status-detail"> · {status.detail}</span>
            </span>
          )}
          {weather && (
            <span className="tb-weather" title={`Feels like ${weather.feels}°`}>
              <WeatherGlyph icon={weather.icon} night={!weather.isDay} size={16} />
              {weather.temp}°F · {weather.label}
            </span>
          )}
        </div>

        {/* Right: translate */}
        <div className="topbar-links">
          <div className="tb-lang" ref={langRef}>
            <button
              className="tb-lang-btn"
              aria-expanded={langOpen}
              aria-haspopup="menu"
              onClick={() => setLangOpen((o) => !o)}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3z" />
              </svg>
              Translate
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
            </button>
            {langOpen && (
              <ul className="tb-lang-menu" role="menu">
                {LANGS.map(([code, label]) => (
                  <li key={code} role="none">
                    <a role="menuitem" href={translateHref(code)} target="_blank" rel="noopener noreferrer">
                      {label}
                    </a>
                  </li>
                ))}
                <li role="none" className="tb-lang-note">Via Google Translate</li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
