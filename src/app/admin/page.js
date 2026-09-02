'use client';

// Admin Overview - the console home. Shows content counts, a "needs
// attention" panel (things an editor should act on), recent activity
// across every content type, and one-click quick actions.

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-client';

const ICONS = {
  minutes: 'M14 3v5h5M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zM9 13h6M9 17h6',
  notices: 'M3 5h18M3 12h18M3 19h12M19 16l2 2-2 2',
  news: 'M4 4h16v16H4zM8 8h8M8 12h8M8 16h5',
  events: 'M3 4h18v17H3zM3 9h18M8 2v4M16 2v4',
  flyers: 'M12 2v4M12 6l-6 4v10h12V10l-6-4zM9 20v-5h6v5',
  alerts: 'M12 9v4m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L14.7 3.9a2 2 0 00-3.4 0z',
  businesses: 'M3 21h18M5 21V7l7-4 7 4v14M9 21v-5h6v5',
  people: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75',
  documents: 'M14 3v5h5M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2zM12 11v6m0 0l-3-3m3 3l3-3',
  drive: 'M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7zM12 11v5m0 0l-2-2m2 2l2-2',
  careers: 'M3 8h18v12H3zM8 8V5a2 2 0 012-2h4a2 2 0 012 2v3M3 13h18',
};

function Icon({ d, size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function timeAgo(iso) {
  if (!iso) return '';
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  const d = Math.floor(s / 86400);
  return d === 1 ? 'yesterday' : `${d} days ago`;
}

export default function AdminOverview() {
  const supabase = createClient();
  const [hello, setHello] = useState('Welcome back'); // set after mount (SSR-safe)
  const [stats, setStats] = useState({
    minutes: null, notices: null, news: null, events: null,
    alerts: null, businesses: null, draftBiz: null,
    people: null, documents: null, drive: null, jobs: null,
  });
  const [activity, setActivity] = useState(null); // null = loading, [] = none

  useEffect(() => { setHello(greeting()); }, []);

  useEffect(() => {
    (async () => {
      const todayISO = new Date().toISOString();

      // Counts (unchanged queries) + a small recent-activity pull per table.
      const [m, pn, nw, ev, a, b, d, ppl, docs, drv, jobs, rNews, rEvents, rMinutes, rNotices] = await Promise.all([
        supabase.from('minutes').select('id', { count: 'exact', head: true }),
        supabase.from('public_notices').select('id', { count: 'exact', head: true }),
        supabase.from('news').select('id', { count: 'exact', head: true }),
        supabase.from('events').select('id', { count: 'exact', head: true }).gte('event_date', todayISO),
        supabase.from('notices').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('businesses').select('id', { count: 'exact', head: true }).eq('approved', true),
        supabase.from('businesses').select('id', { count: 'exact', head: true }).eq('approved', false),
        supabase.from('people').select('id', { count: 'exact', head: true }),
        supabase.from('city_documents').select('id', { count: 'exact', head: true }),
        supabase.from('drive_folders').select('id', { count: 'exact', head: true }),
        supabase.from('job_postings').select('id', { count: 'exact', head: true }).gte('deadline_date', todayISO.slice(0, 10)),
        supabase.from('news').select('title, created_at').order('created_at', { ascending: false }).limit(3),
        supabase.from('events').select('title, created_at').order('created_at', { ascending: false }).limit(3),
        supabase.from('minutes').select('title, created_at').order('created_at', { ascending: false }).limit(3),
        supabase.from('public_notices').select('title, created_at').order('created_at', { ascending: false }).limit(3),
      ]);

      setStats({
        minutes: m.count ?? 0,
        notices: pn.count ?? 0,
        news: nw.count ?? 0,
        events: ev.count ?? 0,
        alerts: a.count ?? 0,
        businesses: b.count ?? 0,
        draftBiz: d.count ?? 0,
        // null until supabase-add-people-documents.sql has been run
        people: ppl.error ? null : (ppl.count ?? 0),
        documents: docs.error ? null : (docs.count ?? 0),
        // null until supabase-drive.sql has been run
        drive: drv.error ? null : (drv.count ?? 0),
        jobs: jobs.error ? null : (jobs.count ?? 0),
      });

      // Merge the four recent pulls into one feed, newest first.
      const feed = [
        ...(rNews.data || []).map((x) => ({ ...x, type: 'News', href: '/admin/news', icon: ICONS.news })),
        ...(rEvents.data || []).map((x) => ({ ...x, type: 'Event', href: '/admin/events', icon: ICONS.events })),
        ...(rMinutes.data || []).map((x) => ({ ...x, type: 'Minutes', href: '/admin/minutes', icon: ICONS.minutes })),
        ...(rNotices.data || []).map((x) => ({ ...x, type: 'Notice', href: '/admin/notices', icon: ICONS.notices })),
      ]
        .filter((x) => x.created_at)
        .sort((x, y) => new Date(y.created_at) - new Date(x.created_at))
        .slice(0, 6);
      setActivity(feed);
    })();
  }, [supabase]);

  const cards = [
    { href: '/admin/news', label: 'News Articles', value: stats.news, sub: 'published', icon: ICONS.news },
    { href: '/admin/events', label: 'Upcoming Events', value: stats.events, sub: 'on the calendar', icon: ICONS.events },
    { href: '/admin/minutes', label: 'Council Minutes', value: stats.minutes, sub: 'meetings posted', icon: ICONS.minutes },
    { href: '/admin/notices', label: 'Notices & Bids', value: stats.notices, sub: 'posted', icon: ICONS.notices },
    { href: '/admin/businesses', label: 'Businesses', value: stats.businesses, sub: 'in the directory', icon: ICONS.businesses },
    { href: '/admin/alerts', label: 'Active Alerts', value: stats.alerts, sub: 'showing on site', icon: ICONS.alerts },
    { href: '/admin/people', label: 'People', value: stats.people ?? 0, sub: 'council & staff listed', icon: ICONS.people },
    { href: '/admin/documents', label: 'City Documents', value: stats.documents ?? 0, sub: 'uploaded', icon: ICONS.documents },
    { href: '/admin/drive', label: 'File Drive', value: stats.drive ?? 0, sub: 'shared folders', icon: ICONS.drive },
    { href: '/admin/careers', label: 'Job Openings', value: stats.jobs ?? 0, sub: 'accepting applications', icon: ICONS.careers },
  ];

  // Things an editor should look at, derived from the counts.
  const attention = [];
  if (stats.draftBiz > 0) {
    attention.push({
      href: '/admin/businesses',
      tone: 'warn',
      text: `${stats.draftBiz} business ${stats.draftBiz === 1 ? 'listing is' : 'listings are'} waiting for approval`,
      cta: 'Review',
    });
  }
  if (stats.alerts > 0) {
    attention.push({
      href: '/admin/alerts',
      tone: 'info',
      text: `${stats.alerts} site alert${stats.alerts === 1 ? ' is' : 's are'} currently showing to visitors`,
      cta: 'Check',
    });
  }
  if (stats.events === 0) {
    attention.push({
      href: '/admin/events',
      tone: 'warn',
      text: 'The events calendar has nothing upcoming, so the homepage is showing its empty state',
      cta: 'Add an event',
    });
  }
  const loaded = stats.news !== null;

  const quick = [
    { href: '/admin/news', label: 'Post news', desc: 'Publish an article to the homepage and news page', icon: ICONS.news },
    { href: '/admin/events', label: 'Add an event', desc: 'Put something on the community calendar', icon: ICONS.events },
    { href: '/admin/careers', label: 'Post a job opening', desc: 'Upload the announcement; the overview drafts itself', icon: ICONS.careers },
    { href: '/admin/flyers', label: 'Post a flyer', desc: 'Pin a flyer to the homepage bulletin board', icon: ICONS.flyers },
    { href: '/admin/minutes', label: 'Upload minutes', desc: 'Post council meeting minutes (PDF)', icon: ICONS.minutes },
    { href: '/admin/notices', label: 'Post a notice or bid', desc: 'Public notices and bid opportunities', icon: ICONS.notices },
    { href: '/admin/alerts', label: 'Post a site alert', desc: 'Banner across the top of every page', icon: ICONS.alerts },
    { href: '/admin/businesses', label: 'Add a business', desc: 'Grow the local business directory', icon: ICONS.businesses },
    { href: '/admin/documents', label: 'Upload a document', desc: 'Water quality reports, forms, and other city PDFs', icon: ICONS.documents },
    { href: '/admin/people', label: 'Update people', desc: 'Add, edit, or remove council members and staff', icon: ICONS.people },
    { href: '/admin/drive', label: 'Share a batch of files', desc: 'Upload photos or documents and send one download link', icon: ICONS.drive },
  ];

  return (
    <div className="adminx-page">
      <header className="adminx-head">
        <h1>{hello}</h1>
        <p>Here&rsquo;s how the City of Piedmont website looks right now.</p>
      </header>

      {/* Needs attention */}
      {loaded && attention.length > 0 && (
        <div className="adminx-attn" role="status">
          {attention.map((a) => (
            <Link key={a.text} href={a.href} className={`adminx-attn-item tone-${a.tone}`}>
              <span className="adminx-attn-dot" aria-hidden="true" />
              <span className="adminx-attn-text">{a.text}</span>
              <span className="adminx-attn-cta">{a.cta} →</span>
            </Link>
          ))}
        </div>
      )}

      {/* Content counts */}
      <div className="adminx-stats">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="adminx-stat">
            <span className="adminx-stat-ico"><Icon d={c.icon} /></span>
            <span className="adminx-stat-val">{c.value === null ? '–' : c.value}</span>
            <span className="adminx-stat-label">{c.label}</span>
            <span className="adminx-stat-sub">{c.sub}</span>
          </Link>
        ))}
      </div>

      <div className="adminx-two">
        {/* Quick actions */}
        <section className="adminx-quick">
          <h2>Quick actions</h2>
          <div className="adminx-quick-grid">
            {quick.map((q) => (
              <Link key={q.label} href={q.href} className="adminx-quick-tile">
                <span className="adminx-quick-ico"><Icon d={q.icon} /></span>
                <span className="adminx-quick-body">
                  <strong>{q.label}</strong>
                  <small>{q.desc}</small>
                </span>
                <span className="adminx-quick-arrow" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Recent activity */}
        <section className="adminx-activity">
          <h2>Recently added</h2>
          {activity === null ? (
            <p className="adminx-activity-empty">Loading…</p>
          ) : activity.length === 0 ? (
            <p className="adminx-activity-empty">Nothing posted yet. Use a quick action to add your first item.</p>
          ) : (
            <ul className="adminx-feed">
              {activity.map((a, i) => (
                <li key={`${a.type}-${a.title}-${i}`}>
                  <Link href={a.href} className="adminx-feed-item">
                    <span className="adminx-feed-ico"><Icon d={a.icon} size={16} /></span>
                    <span className="adminx-feed-main">
                      <strong>{a.title}</strong>
                      <small>{a.type} · {timeAgo(a.created_at)}</small>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
