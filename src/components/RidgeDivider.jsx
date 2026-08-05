// Layered Appalachian ridgeline - the site's signature section transition,
// echoing the hills on the city seal. Purely decorative (aria-hidden).
//
// Usage:
//   <RidgeDivider fill="var(--hx-green)" />          ridge rises INTO a green band
//   <RidgeDivider fill="var(--hx-green)" flip />     green band falls away below
//
// `fill` = the color of the incoming/outgoing band; the divider sits on the
// neighboring section's background, so it needs no background of its own.

export default function RidgeDivider({ fill = 'var(--hx-green)', flip = false, className = '' }) {
  return (
    <div
      className={`ridge ${flip ? 'ridge-flip' : ''} ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 1440 90" preserveAspectRatio="none" focusable="false">
        {/* Back range - soft, distant */}
        <path
          d="M0 90 L0 62 Q120 30 260 52 T560 40 Q700 18 840 44 T1140 34 Q1300 14 1440 46 L1440 90 Z"
          fill={fill}
          opacity=".38"
        />
        {/* Mid range */}
        <path
          d="M0 90 L0 74 Q160 46 330 64 T660 54 Q820 34 980 58 T1290 50 Q1380 42 1440 56 L1440 90 Z"
          fill={fill}
          opacity=".62"
        />
        {/* Front range - solid, meets the band */}
        <path
          d="M0 90 L0 82 Q200 62 380 74 T740 68 Q920 52 1080 70 T1440 66 L1440 90 Z"
          fill={fill}
        />
      </svg>
    </div>
  );
}
