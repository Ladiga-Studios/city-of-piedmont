'use client';

import { useEffect, useState } from 'react';

/**
 * Hybrid hero background:
 *  - Poster image shows instantly (this is the LCP image, fast).
 *  - Muted, looping video lazy-loads on top once the page is interactive.
 *  - Reduced-motion users (or anyone the video fails for) stay on the poster.
 * The video plays at full, normal speed and loops.
 * The gradient scrim for text legibility lives in CSS (.hero-media::after).
 */
export default function HeroMedia({ className = '' }) {
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    // Respect reduced-motion: never load/play the video.
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    // Don't autoplay heavy video on very small screens (saves mobile data).
    const small = window.matchMedia('(max-width: 640px)').matches;
    if (small) return;

    // Defer until the browser is idle so it never competes with first paint.
    const start = () => setShowVideo(true);
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(start, { timeout: 1500 });
      return () => cancelIdleCallback(id);
    }
    const t = setTimeout(start, 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`hero-media ${className}`} aria-hidden="true">
      {/* Poster: always present, instant, and the permanent image on mobile/reduced-motion */}
      <picture className="hero-poster">
        <source srcSet="/images/piedmont-hero-poster.webp" type="image/webp" />
        <img
          src="/images/piedmont-hero-poster.jpg"
          alt=""
          fetchPriority="high"
          decoding="async"
        />
      </picture>

      {/* Video: fades in over the poster once it's buffered enough to play through.
          Plays at full speed and loops. */}
      {showVideo && (
        <video
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlayThrough={revealWhenSmooth}
          onPlaying={revealWhenSmooth}
        >
          <source src="/images/piedmont-hero.webm" type="video/webm" />
          <source src="/images/piedmont-hero.mp4" type="video/mp4" />
        </video>
      )}
    </div>
  );
}

// Only reveal the video once it's genuinely buffered enough to play through
// AND has decoded a real frame, preventing the torn "VHS glitch" first frames.
function revealWhenSmooth(e) {
  const v = e.currentTarget;
  if (v.readyState < 4) return; // HAVE_ENOUGH_DATA; not ready to play through yet
  // Wait for the next painted frame so we never fade in mid-decode.
  const reveal = () => v.classList.add('ready');
  if ('requestVideoFrameCallback' in v) {
    v.requestVideoFrameCallback(reveal);
  } else {
    requestAnimationFrame(reveal);
  }
}
