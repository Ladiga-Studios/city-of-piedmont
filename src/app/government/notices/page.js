import '../../pages.css';
import './notices.css';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import NoticesList from './NoticesList';

export const metadata = {
  title: 'Public Notices & Bid Requests',
  description:
    'Current City of Piedmont public notices, ordinances, legal announcements, and open bid requests \u2014 download the official PDFs.',
  alternates: { canonical: 'https://www.piedmontcity.org/government/notices' },
};

export const revalidate = 60;

export default async function NoticesPage() {
  let notices = [];
  let bids = [];
  let dbError = false;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('public_notices')
      .select('*')
      .order('posted_date', { ascending: false });
    if (error) dbError = true;
    else {
      const all = data || [];
      notices = all.filter((n) => n.category !== 'bid');
      bids = all.filter((n) => n.category === 'bid');
    }
  } catch {
    dbError = true;
  }

  return (
    <>
      <section className="page-hero">
        <div className="container inner">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span aria-hidden="true">/</span>
            <Link href="/government">Government</Link><span aria-hidden="true">/</span>
            <span>Public Notices &amp; Bids</span>
          </nav>
          <p className="eyebrow">City Government</p>
          <h1>Public Notices &amp; Bid Requests</h1>
          <p>
            Ordinances, legal announcements, and open bid requests from the City of Piedmont.
            Each item links to the official PDF. For questions, call{' '}
            <a href="tel:2564473560" style={{ color: 'var(--amber)', fontWeight: 600 }}>256-447-3560</a>.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {dbError ? (
            <div className="empty-note">
              Public notices are managed in Supabase. Once your database is connected and the{' '}
              <code>public_notices</code> table is created, records will appear here automatically.
            </div>
          ) : (
            <NoticesList notices={notices} bids={bids} />
          )}
        </div>
      </section>
    </>
  );
}
