'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';

// One source of truth for how far below the top an anchored section should land,
// so it clears the sticky header. Keep this in sync with scroll-padding-top in
// globals.css (the non-Lenis / reduced-motion fallback).
const HEADER_OFFSET = 90;

export default function SmoothScroll() {
  const lenisRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
      wheelMultiplier: 1,
    });
    lenisRef.current = lenis;

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Smoothly scroll in-page anchor links, accounting for the sticky header.
    // Handles both same-page "#id" links and "/#id" / "/path#id" links that point
    // at a section on the CURRENT page (so we don't do a full navigation + jump).
    function onAnchorClick(e) {
      const link = e.target.closest('a[href*="#"]');
      if (!link) return;
      const href = link.getAttribute('href') || '';
      const hashIndex = href.indexOf('#');
      if (hashIndex === -1) return;

      const hash = href.slice(hashIndex);          // e.g. "#events"
      const path = href.slice(0, hashIndex);       // e.g. "/" or "" or "/residents"
      if (hash.length <= 1) return;                // ignore bare "#"

      // Only intercept when the hash target exists on the page we're already on.
      // (If it's a link to a different page's section, let Next handle the nav;
      //  the route-change effect below will then scroll to the hash.)
      const samePage = path === '' || path === pathname || (path === '/' && pathname === '/');
      if (!samePage) return;

      const target = document.querySelector(hash);
      if (!target) return;

      e.preventDefault();
      lenis.scrollTo(target, { offset: -HEADER_OFFSET });
      // Reflect the hash in the URL without a jump.
      if (history.replaceState) history.replaceState(null, '', hash);
    }
    document.addEventListener('click', onAnchorClick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('click', onAnchorClick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [pathname]);

  // On route change: if the URL has a hash, scroll to that section (below the
  // header); otherwise jump to the top. This makes "/#events" from another page
  // land on the events section instead of the very top.
  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';

    if (hash && hash.length > 1) {
      // Wait a tick for the new page to render the target element.
      const id = hash;
      let tries = 0;
      const tryScroll = () => {
        const target = document.querySelector(id);
        if (target) {
          if (lenisRef.current) {
            lenisRef.current.scrollTo(target, { offset: -HEADER_OFFSET });
          } else {
            const y = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
            window.scrollTo(0, y);
          }
        } else if (tries++ < 10) {
          requestAnimationFrame(tryScroll);
        }
      };
      requestAnimationFrame(tryScroll);
      return;
    }

    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}
