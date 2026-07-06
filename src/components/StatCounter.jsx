'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Count-up animation for a single stat value.
 *
 * Accepts the same display strings used elsewhere on the page — e.g. "4,787",
 * "1888", "5", "30+" — and animates only the numeric portion while preserving
 * any prefix/suffix (the "+" in "30+") and re-inserting thousands separators
 * for values that originally had them.
 *
 * Behaviour:
 *  - Starts only when the element scrolls into view (IntersectionObserver).
 *  - Runs once.
 *  - Reduced-motion users (or browsers without IO) see the final value instantly.
 */
export default function StatCounter({ value, duration = 1600 }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(() => initialText(value));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const { target, hadComma, prefix, suffix } = parse(value);

    // No animation path: just show the final value.
    if (reduce || target == null || !('IntersectionObserver' in window)) {
      setDisplay(value);
      return;
    }

    let raf;
    let started = false;

    const run = () => {
      const startTime = performance.now();
      const tick = (now) => {
        const t = Math.min(1, (now - startTime) / duration);
        // easeOutCubic for a quick start that settles gently.
        const eased = 1 - Math.pow(1 - t, 3);
        const current = Math.round(target * eased);
        setDisplay(prefix + format(current, hadComma) + suffix);
        if (t < 1) raf = requestAnimationFrame(tick);
        else setDisplay(value); // snap to the exact source string at the end
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !started) {
            started = true;
            run();
            io.disconnect();
          }
        });
      },
      { threshold: 0.4 }
    );
    io.observe(el);

    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return <span ref={ref}>{display}</span>;
}

/* ---- helpers ---- */

// Pull the integer out of strings like "4,787", "30+", "1888".
function parse(value) {
  const str = String(value);
  const match = str.match(/[\d,]+/);
  if (!match) return { target: null };
  const numStr = match[0];
  const target = parseInt(numStr.replace(/,/g, ''), 10);
  const hadComma = numStr.includes(',');
  const prefix = str.slice(0, match.index);
  const suffix = str.slice(match.index + numStr.length);
  return { target, hadComma, prefix, suffix };
}

function format(n, withCommas) {
  return withCommas ? n.toLocaleString('en-US') : String(n);
}

// Start value shown before the animation kicks in (keeps layout stable).
function initialText(value) {
  const { target, prefix, suffix, hadComma } = parse(value);
  if (target == null) return String(value);
  return prefix + format(0, hadComma) + suffix;
}
