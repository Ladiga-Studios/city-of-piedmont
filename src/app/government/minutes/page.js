import '../../pages.css';
import './minutes.css';
import Link from 'next/link';
import { createClient } from '@/lib/supabase-server';
import MinutesExplorer from './MinutesExplorer';

export const metadata = {
  title: 'Council Meeting Minutes',
  description:
    'Read AI-summarized highlights and download official City of Piedmont City Council meeting minutes: decisions, votes, and action items from every meeting.',
};

export const revalidate = 60;

export default async function MinutesPage() {
  let minutes = [];
  let dbError = false;

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('minutes')
      .select('*')
      .order('meeting_date', { ascending: false });
    if (error) dbError = true;
    else minutes = data || [];
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
            <span>Council Minutes</span>
          </nav>
          <p className="eyebrow">City Government</p>
          <h1>Council Meeting Minutes</h1>
          <p>
            Pick a meeting to see a plain-language summary of what the council decided,
            then download the official record. The City Council meets the 1st and 3rd
            Tuesday of each month; minutes are posted after approval at the following meeting.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {dbError ? (
            <div className="empty-note">
              Minutes are managed in Supabase. Once your database is connected and the{' '}
              <code>minutes</code> table is created, records will appear here automatically.
            </div>
          ) : (
            <MinutesExplorer minutes={minutes} />
          )}
        </div>
      </section>
    </>
  );
}
