'use client';

// Back-to-top button with a scroll-progress ring around it.
// Appears after ~600px of scrolling; the gold ring fills as you read.
// rAF-throttled scroll handling; respects prefers-reduced-motion.

import { useEffect, useRef, useState } from 'react';

const R = 20; // ring radius
const CIRC = 2 * Math.PI * R;

export default function BackToTop() {
  const [visible, setVisible] = useState(false);
  const ringRef = useRef(null);
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        setVisible(y > 600);
        if (ringRef.current && max > 0) {
          const p = Math.min(1, y / max);
          ringRef.current.style.strokeDashoffset = String(CIRC * (1 - p));
        }
        ticking.current = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toTop = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <button
      type="button"
      className={`to-top ${visible ? 'show' : ''}`}
      onClick={toTop}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
    >
      <svg className="to-top-ring" width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r={R} fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="2.5" />
        <circle
          ref={ringRef}
          cx="24" cy="24" r={R}
          fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray={CIRC} strokeDashoffset={CIRC}
          transform="rotate(-90 24 24)"
        />
      </svg>
      <svg className="to-top-arrow" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
