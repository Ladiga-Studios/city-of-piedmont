import '../pages.css';
import './events.css';
import Link from 'next/link';
import PageHeroPhoto from '@/components/PageHeroPhoto';
import { createClient } from '@/lib/supabase-server';
import {
  eventMonthAbbr, eventDayNum, eventTimeRange, eventLongDate,
  eventCategoryLabel, parseEventDate,
} from '@/lib/news-events';

export const metadata = {
  title: 'Events Calendar',
  description: 'Upcoming events, festivals, and city meetings in Piedmont, Alabama.',
  alternates: { canonical: 'https://www.piedmontcity.org/events' },
};

export const revalidate = 60;

function monthKey(value) {
  const d = parseEventDate(value);
  if (!d) return 'Upcoming';
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default async function EventsPage() {
  let upcoming = [];
  let dbError = false;
  try {
    const supabase = createClient();
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true });
    if (error) dbError = true;
    else {
      upcoming = (data || []).filter((e) => {
        const end = e.end_date ? parseEventDate(e.end_date) : parseEventDate(e.event_date);
        return end && end >= todayStart;
      });
    }
  } catch {
    dbError = true;
  }

  const groups = [];
  for (const e of upcoming) {
    const key = monthKey(e.event_date);
    let g = groups.find((x) => x.key === key);
    if (!g) { g = { key, items: [] }; groups.push(g); }
    g.items.push(e);
  }

  return (
    <>
      <section className="page-hero">
        <div className="container inner has-photo">
          <div className="hero-text-col">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span>
              <span>Events</span>
            </nav>
            <p className="eyebrow">Get Involved</p>
            <h1>Events Calendar</h1>
            <p>
              Festivals, community happenings, and city meetings in Piedmont. For questions,
              call <a href="tel:2564473560" style={{ color: 'var(--amber)', fontWeight: 600 }}>256-447-3560</a>.
            </p>
          </div>
          <PageHeroPhoto src="/images/photos/memorial-park.jpg" webp="/images/photos/memorial-park.webp" alt="Veterans Memorial Park in Piedmont" />
        </div>
      </section>

      <section className="section">
        <div className="container">
          {dbError ? (
            <div className="empty-note">
              Events are managed in Supabase. Once your database is connected and the{' '}
              <code>events</code> table exists, upcoming events will appear here automatically.
            </div>
          ) : groups.length === 0 ? (
            <div className="empty-note">No upcoming events are posted right now. Check back soon.</div>
          ) : (
            <div className="ev-wrap">
              {groups.map((g) => (
                <section key={g.key} className="ev-month" aria-label={g.key}>
                  <h2 className="ev-month-label">{g.key}</h2>
                  <ul className="ev-list">
                    {g.items.map((e) => (
                      <li key={e.id} className="ev-item">
                        <div className="ev-date" aria-hidden="true">
                          <span className="ev-m">{eventMonthAbbr(e.event_date)}</span>
                          <span className="ev-d">{eventDayNum(e.event_date)}</span>
                        </div>
                        <div className="ev-main">
                          <div className="ev-head">
                            <h3>{e.title}</h3>
                            <span className={`ev-tag ev-${e.category || 'community'}`}>
                              {eventCategoryLabel(e.category)}
                            </span>
                          </div>
                          <p className="ev-meta">
                            <span>{eventLongDate(e.event_date)}</span>
                            <span className="ev-dot" aria-hidden="true">·</span>
                            <span>{eventTimeRange(e.event_date, e.end_date, e.all_day)}</span>
                            {e.location && (
                              <>
                                <span className="ev-dot" aria-hidden="true">·</span>
                                <span>{e.location}</span>
                              </>
                            )}
                          </p>
                          {e.description && <p className="ev-desc">{e.description}</p>}
                          {e.url && (
                            <a href={e.url} target="_blank" rel="noopener noreferrer" className="ev-link">
                              More info &rarr;
                            </a>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
