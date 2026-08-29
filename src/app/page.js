import './home.css';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import HeroMedia from '@/components/HeroMedia';
import HeroSearch from '@/components/HeroSearch';
import NewsletterSignup from '@/components/NewsletterSignup';
import TodayPanel from '@/components/TodayPanel';
import { createClient } from '@/lib/supabase-server';
import { newsDate, eventMonthAbbr, eventDayNum, eventTimeRange } from '@/lib/news-events';

export const revalidate = 60;

// Trim a string to ~n characters on a word boundary and append an ellipsis.
function truncate(s, n) {
  if (!s) return '';
  const t = String(s).replace(/\s+/g, ' ').trim();
  if (t.length <= n) return t;
  const cut = t.slice(0, n);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > n * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd() + '\u2026';
}

const Arrow = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);

/* ---- Quick-task strip (6 tiles, matches mockup) ---- */
const TASKS = [
  { label: 'Pay Utilities', href: SITE.payBillUrl, ext: true,
    icon: <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /></> },
  { label: 'Permits & Licenses', href: '/residents#permits',
    icon: <><path d="M14 3v5h5M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" /><path d="M9 13h6M9 17h6" /></> },
  { label: 'Public Safety', href: '/departments/public-safety',
    icon: <path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z" /> },
  { label: 'Jobs', href: '/careers',
    icon: <><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" /></> },
  { label: 'Events', href: '/events',
    icon: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" /></> },
  { label: 'Report an Issue', href: '/contact',
    icon: <><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></> },
];

/* ---- Discover Piedmont (5 photo cards w/ gold icons) ---- */
const DiscoverIcon = {
  downtown: <><path d="M3 21h18M5 21V8l4-2 4 2v13M13 21v-9l6-2v11M8 11h.01M8 15h.01M16 14h.01M16 17h.01" /></>,
  outdoors: <><path d="M12 3l4 6h-3l4 6h-4l3 5H9l3-5H8l4-6H9z" /></>,
  parks: <><path d="M12 22V12M7 9a5 5 0 0110 0M5 13a4 4 0 0114 0M8 22h8" /></>,
  history: <><path d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6M8 12h.01M16 12h.01" /></>,
  community: <><circle cx="9" cy="8" r="3" /><circle cx="17" cy="9" r="2.4" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 20c0-2.4 1.4-4.4 3.5-5.2" /></>,
};
const DISCOVER = [
  { key: 'downtown', tag: 'Downtown', desc: 'Shop, Dine & Support Local', href: '/business', img: '/images/explore/downtown.jpg', alt: 'Downtown Piedmont storefronts' },
  { key: 'outdoors', tag: 'Outdoors', desc: 'Trails, Rivers & Adventure', href: '/parks', img: '/images/explore/trail.jpg', alt: 'The Chief Ladiga Trail near Piedmont' },
  { key: 'parks', tag: 'Parks', desc: 'Spaces to Play and Relax', href: '/parks', img: '/images/explore/parks.jpg', alt: 'Memorial Park in Piedmont' },
  { key: 'history', tag: 'History', desc: 'Our Heritage, Our Story', href: '/about#history', img: '/images/explore/history.jpg', alt: 'A historic early Piedmont building with a crowd gathered out front' },
  { key: 'community', tag: 'Community', desc: 'Stronger Together', href: '/residents', img: '/images/explore/community.jpg', alt: 'The Clyde H. Pike Civic Center' },
];

/* ---- Stats band (real, sourced figures; parks flagged as placeholder) ---- */
const STATS = [
  { value: '4,787', label: 'Call Piedmont Home', sub: '2020 Census', icon: <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 20c0-2.4 1.4-4.4 3.5-5.2"/></> },
  { value: '1888', label: 'Proudly Founded', sub: ['Cross Plains, 1851', 'Hollow Stump, 1848'], icon: <><path d="M3 21h18M5 21V9l7-5 7 5v12M10 21v-6h4v6"/></> },
  { value: '5', label: 'Beautiful City Parks', sub: 'to explore', placeholder: true, icon: <><path d="M12 22V12M12 12L7 8m5 4l5-4M5 12c0-4 3-7 7-7s7 3 7 7"/></> },
  { value: '30+', label: 'Miles of Trails', sub: 'for all to enjoy', icon: <><circle cx="6" cy="17" r="3"/><circle cx="18" cy="17" r="3"/><path d="M6 17l5-7h4M9 10h5l3 7"/></> },
];

export default async function Home() {
  // Pull the latest news and upcoming events from Supabase. If the database
  // isn't reachable or is empty, fall back to the built-in sample arrays so
  // the homepage always renders something sensible.
  // Start empty. Only the database fills these - when there's nothing, the
  // homepage shows a friendly empty state rather than stale sample content.
  let NEWS = [];
  let EVENTS = [];
  try {
    const supabase = createClient();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [newsRes, eventsRes] = await Promise.all([
      supabase.from('news').select('*').order('published_at', { ascending: false }).limit(3),
      supabase.from('events').select('*').order('event_date', { ascending: true }),
    ]);

    if (!newsRes.error && newsRes.data && newsRes.data.length) {
      NEWS = newsRes.data.map((n) => ({
        date: newsDate(n.published_at),
        title: n.title,
        body: truncate(n.body, 120),
        img: n.image_url || null, // null -> show a newspaper icon placeholder
        alt: n.image_alt || n.title,
      }));
    }

    if (!eventsRes.error && eventsRes.data && eventsRes.data.length) {
      const upcoming = eventsRes.data
        .filter((e) => {
          const d = (e.end_date || e.event_date || '').replace(' ', 'T');
          const end = d ? new Date(d) : null;
          return end && end >= todayStart;
        })
        .slice(0, 4);
      if (upcoming.length) {
        EVENTS = upcoming.map((e) => ({
          m: eventMonthAbbr(e.event_date),
          d: eventDayNum(e.event_date),
          title: e.title,
          when: eventTimeRange(e.event_date, e.end_date, e.all_day),
          where: e.location || 'Piedmont',
        }));
      }
    }
  } catch {
    // keep fallbacks
  }

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="hx2-hero" aria-label="Welcome to Piedmont">
        <HeroMedia className="hx2-hero-media" />
        <div className="hx2-hero-scrim" aria-hidden="true" />
        <div className="container hx2-hero-inner">
          <h1><span className="hx2-line">Rooted in History.</span><span className="hx2-line">Focused on Tomorrow.</span></h1>
          <p className="hx2-tagline">Piedmont, Alabama is a proud Appalachian community with a bright future.</p>
          <div className="hx2-hero-actions">
            <Link href="/residents" className="btn btn-gold">Explore Our City <Arrow /></Link>
            <Link href="/departments" className="btn btn-outline-light">City Services</Link>
          </div>
        </div>
        {/* centered search overlapping the bottom */}
        <div className="container hx2-search-dock">
          <HeroSearch />
        </div>
      </section>

      {/* ============ TASK STRIP ============ */}
      <section className="hx2-tasks-sec" aria-label="Quick tasks">
        <div className="container">
          <div className="hx2-tasks hx2-tasks-6">
            {TASKS.map((t) => {
              const inner = (
                <>
                  <span className="hx2-task-ico" aria-hidden="true">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">{t.icon}</svg>
                  </span>
                  <strong>{t.label}</strong>
                </>
              );
              return t.ext
                ? <a key={t.label} href={t.href} className="hx2-task" target="_blank" rel="noopener noreferrer">{inner}</a>
                : <Link key={t.label} href={t.href} className="hx2-task">{inner}</Link>;
            })}
          </div>
        </div>
      </section>

      {/* ============ TODAY IN PIEDMONT (live weather + city hall + next event) ============ */}
      <TodayPanel nextEvent={EVENTS[0] || null} />

      {/* ============ NEWS + EVENTS ============ */}
      <section className="section hx2-ne" id="events">
        <div className="container hx2-ne-grid">
          <div className="hx2-news-panel">
            <div className="hx2-panel-head">
              <p className="hx2-eyebrow-sm">Stay Informed</p>
              <h2>Latest News</h2>
              <Link href="/news" className="hx2-viewall">View all news →</Link>
            </div>
            {NEWS.length > 0 ? (
              <>
                <div className="hx2-news-grid">
                  {NEWS.map((n) =>
                    n.img ? (
                      <article key={n.title} className="hx2-news-card">
                        <a
                          className="hx2-news-img"
                          href={n.img}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`View full-size image: ${n.title}`}
                        >
                          <img src={n.img} alt={n.alt} loading="lazy" />
                        </a>
                        <div className="hx2-news-body">
                          <span className="hx2-news-date">{n.date}</span>
                          <h3>{n.title}</h3>
                          <p>{n.body}</p>
                        </div>
                      </article>
                    ) : (
                      /* No photo: a deliberate "city bulletin" card - deep green,
                         gold date. Text-only news looks
                         designed, not like a missing image. */
                      <article key={n.title} className="hx2-news-card hx2-bulletin">
                        <div className="hx2-bulletin-tag">
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 8.7l5.4-.8z" />
                          </svg>
                          City Bulletin
                        </div>
                        <div className="hx2-news-body">
                          <span className="hx2-news-date">{n.date}</span>
                          <h3>{n.title}</h3>
                          <p>{n.body}</p>
                        </div>
                      </article>
                    )
                  )}
                </div>
                <Link href="/news" className="hx2-viewall hx2-news-foot">View All News →</Link>
              </>
            ) : (
              <div className="hx2-ne-empty">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <path d="M4 5h16v14H4zM4 9h16M8 13h8M8 16h5" />
                </svg>
                <p className="hx2-ne-empty-title">No news just yet</p>
                <p className="hx2-ne-empty-sub">Check back soon for the latest from the City of Piedmont.</p>
              </div>
            )}
            <div className="hx2-news-signup">
              <NewsletterSignup
                variant="inline"
                heading="Get city news by email"
                blurb="Subscribe to the Piedmont newsletter for news, events, and announcements."
              />
            </div>
          </div>

          <aside className="hx2-events-panel">
            <div className="hx2-panel-head">
              <p className="hx2-eyebrow-sm">Get Involved</p>
              <h2>Upcoming Events</h2>
              <Link href="/events" className="hx2-viewall">View calendar →</Link>
            </div>
            {EVENTS.length > 0 ? (
              <>
                <div className="hx2-events-list">
                  {EVENTS.map((e) => (
                    <article key={e.title} className="hx2-event">
                      <div className="hx2-event-date"><span className="m">{e.m}</span><span className="d">{e.d}</span></div>
                      <div>
                        <h3>{e.title}</h3>
                        <p className="hx2-event-when">{e.when}</p>
                        <p className="hx2-event-where">{e.where}</p>
                      </div>
                    </article>
                  ))}
                </div>
                <Link href="/events" className="hx2-viewall hx2-events-foot">View All Events →</Link>
              </>
            ) : (
              <div className="hx2-ne-empty">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="17" rx="2" /><path d="M3 9h18M8 2v4M16 2v4" />
                </svg>
                <p className="hx2-ne-empty-title">No upcoming events</p>
                <p className="hx2-ne-empty-sub">Nothing on the calendar right now. Check back for what&rsquo;s next.</p>
              </div>
            )}
          </aside>
        </div>
      </section>

      {/* ============ DISCOVER PIEDMONT ============ */}
      <section className="section hx2-explore-sec">
        <div className="container">
          <p className="hx2-section-eyebrow hx2-rule-center">Discover Piedmont</p>
          <div className="hx2-explore-grid">
            {DISCOVER.map((x) => (
              <Link key={x.key} href={x.href} className="hx2-explore-card">
                <img src={x.img} alt={x.alt} loading="lazy" />
                <div className="hx2-explore-overlay">
                  <span className="hx2-explore-ico" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">{DiscoverIcon[x.key]}</svg>
                  </span>
                  <h3>{x.tag}</h3>
                  <p>{x.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ WHY PIEDMONT (videos) ============ */}
      <section className="section hx2-why">
        <div className="container">
          <p className="hx2-section-eyebrow hx2-rule-center">Why Piedmont?</p>
          <p className="hx2-why-lead">
            Piedmont offers economic and recreational opportunity for everyone who lives
            here and everyone who visits: a great place to work, to live, and to play,
            with the infrastructure for growth and the Chief Ladiga Trail running right
            through the heart of it.
          </p>
          <div className="hx2-why-videos">
            <div className="hx2-video">
              <iframe
                src="https://www.youtube-nocookie.com/embed/r97ogKHYwvc"
                title="Welcome to Piedmont, Alabama"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="hx2-video">
              <iframe
                src="https://www.youtube-nocookie.com/embed/ZCVyCywlGkY"
                title="Life on the Chief Ladiga Trail"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* ============ BY THE NUMBERS (green band) ============ */}
      <section className="hx2-stats-band" aria-label="Piedmont by the numbers">
        <div className="container">
          <p className="hx2-stats-eyebrow">Piedmont by the Numbers</p>
          <div className="hx2-stats">
            {STATS.map((s) => (
              <div key={s.label} className="hx2-stat">
                <span className="hx2-stat-ico" aria-hidden="true">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">{s.icon}</svg>
                </span>
                <div className="hx2-stat-body">
                  <span className="hx2-stat-val">{s.value}</span>
                  <span className="hx2-stat-label">{s.label}{s.placeholder ? ' *' : ''}</span>
                  {Array.isArray(s.sub)
                    ? s.sub.map((line) => <span key={line} className="hx2-stat-sub">{line}</span>)
                    : <span className="hx2-stat-sub">{s.sub}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CLOSING CTA ============ */}
      <section className="hx2-cta">
        <div className="container hx2-cta-inner">
          <div className="hx2-cta-text">
            <h2>How can we help you today?</h2>
            <p>Pay a bill, apply for a permit, find a meeting agenda, or get in touch with City Hall. Most city services are just a click away.</p>
          </div>
          <div className="hx2-cta-actions">
            <a href={SITE.payBillUrl} className="btn btn-gold">Pay My Bill <Arrow /></a>
            <Link href="/contact" className="btn btn-outline">Contact the City</Link>
          </div>
        </div>
      </section>
    </>
  );
}
