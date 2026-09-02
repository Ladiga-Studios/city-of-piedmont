import '../pages.css';
import './careers.css';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import { createClient } from '@/lib/supabase-server';

// Postings are managed at /admin/careers. Re-check every minute so a
// new posting shows up quickly and an expired one drops off on time.
export const revalidate = 60;

export const metadata = {
  title: 'Careers',
  description:
    'Employment opportunities with the City of Piedmont, Alabama. View current open positions and learn how to apply.',
  alternates: { canonical: 'https://www.piedmontcity.org/careers' },
};

// ------------------------------------------------------------------
// EMPLOYMENT APPLICATION PDF — not currently available.
// When the city provides one, save it as
// public/documents/employment-application.pdf and restore the download
// button in the "Employment Opportunities" block below:
//   <a href="/documents/employment-application.pdf" target="_blank"
//      rel="noopener noreferrer" className="btn btn-primary careers-apply">
//     Application for Employment (PDF)
//   </a>
// ------------------------------------------------------------------

// ------------------------------------------------------------------
// FALLBACK ONLY. Openings now come from the `job_postings` table
// (managed at /admin/careers, see supabase-careers.sql). This array is
// used only if that table doesn't exist yet. Once the SQL has been run
// the database is the source of truth, even when it's empty.
// ------------------------------------------------------------------
const FALLBACK_OPENINGS = [
  {
    title: 'Recreation Coordinator',
    department: 'Parks & Recreation',
    deadline: 'Friday, September 4, 2026 at 5:00 PM',
    announcementPdf: '/images/news/recreation-coordinator-2026.webp',
    summary:
      'Runs Piedmont\u2019s league sports and youth programs end to end: scheduling and registration, recruiting coaches and participants, supervising Aquatic Center staff during swim season, maintaining the Sports Complex, and serving as point of contact for partner leagues.',
    duties: [
      'Organize, schedule, and market league sports, tournaments, and youth clinics',
      'Manage registrations, fees, rosters, and records for each season',
      'Supervise Aquatic Center employees; maintain pool chemical levels; open/close during swim season',
      'Maintain sports equipment, Sports Complex fields and buildings, and the city vehicle',
      'Run the department\u2019s social media; support the Civic Center front desk as needed',
    ],
    benefits:
      'RSA/State Retirement \u00b7 Vacation, sick, and personal time accrued \u00b7 BC/BS health, dental, and vision insurance',
    applyText: (
      <>
        Apply in person at the Piedmont Administration Office, 109 N Center Ave, Piedmont, AL, or
        email City Clerk Tashia Blackerby at{' '}
        <a href="mailto:tashia.blackerby@piedmontcity.org">tashia.blackerby@piedmontcity.org</a>.
      </>
    ),
  },
];

/** Make emails and links in staff-written text clickable. */
function linkify(text) {
  const parts = String(text || '').split(/(\bhttps?:\/\/[^\s)]+|\b[\w.+-]+@[\w-]+\.[\w.-]+\b)/g);
  return parts.map((part, i) => {
    if (/^https?:\/\//.test(part)) return <a key={i} href={part} target="_blank" rel="noopener noreferrer">{part.replace(/^https?:\/\//, '')}</a>;
    if (/^[\w.+-]+@[\w-]+\.[\w.-]+$/.test(part)) return <a key={i} href={`mailto:${part}`}>{part}</a>;
    return part;
  });
}

function longDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

/** Live postings from the database; null if the table isn't there yet. */
async function getOpenings() {
  try {
    const supabase = createClient();
    // RLS already hides unpublished and expired rows from public reads;
    // the date filter is a belt-and-braces guard for cached pages.
    const { data, error } = await supabase
      .from('job_postings')
      .select('id, title, department, deadline_date, deadline_text, summary, duties, benefits, pay, apply_text, file_url, file_kind')
      .order('deadline_date', { ascending: true });
    if (error) return null;
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Chicago' });
    return (data || [])
      .filter((j) => j.deadline_date >= today)
      .map((j) => ({
        key: j.id,
        title: j.title,
        department: j.department,
        deadline: j.deadline_text || longDate(j.deadline_date),
        announcementPdf: j.file_url,
        fileKind: j.file_kind,
        summary: j.summary,
        duties: j.duties || [],
        benefits: j.benefits,
        pay: j.pay,
        applyText: j.apply_text ? linkify(j.apply_text) : null,
      }));
  } catch {
    return null;
  }
}

export default async function CareersPage() {
  const dbOpenings = await getOpenings();
  const OPENINGS = dbOpenings ?? FALLBACK_OPENINGS;
  return (
    <>
      <section className="page-hero">
        <div className="container inner">
          <div className="hero-text-col">
            <nav className="breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Home</Link><span aria-hidden="true">/</span>
              <Link href="/about">About</Link><span aria-hidden="true">/</span>
              <span>Careers</span>
            </nav>
            <p className="eyebrow">Work for the City</p>
            <h1>Careers</h1>
            <p>
              Employment opportunities with the City of Piedmont. Check the current
              openings below and pick up an application at City Hall.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container careers-wrap">
          {/* Employment Opportunities + EEO + application */}
          <div className="careers-block">
            <h2>Employment Opportunities</h2>
            <p className="careers-eeo">
              We consider applicants for all positions without regard to race, color,
              religion, creed, gender, national origin, age, disability, marital or
              veteran status, or any other legally protected status.
            </p>
            <p>
              Employment applications are available at City Hall, {SITE.address},{' '}
              {SITE.cityState}, Monday&ndash;Friday, 8:00 AM&ndash;5:00 PM.
            </p>
          </div>

          {/* Current Positions */}
          <div className="careers-block">
            <h2>Current Positions</h2>
            {OPENINGS.length === 0 ? (
              <div className="empty-note">
                We&rsquo;re sorry, but there are no open positions at this time. Please check back later!
              </div>
            ) : (
              <ul className="job-list">
                {OPENINGS.map((job) => (
                  <li key={job.key || job.title} className="job-card">
                    <div className="job-head">
                      <h3>{job.title}</h3>
                      {job.department && <span className="job-dept">{job.department}</span>}
                    </div>
                    <p className="job-deadline">
                      <strong>Deadline to apply:</strong> {job.deadline}
                    </p>
                    <p>{job.summary}</p>
                    {job.duties.length > 0 && (
                      <>
                        <h4>What you&rsquo;ll do</h4>
                        <ul className="job-duties">
                          {job.duties.map((d) => <li key={d}>{d}</li>)}
                        </ul>
                      </>
                    )}
                    {job.pay && <p className="job-benefits"><strong>Pay:</strong> {job.pay}</p>}
                    {job.benefits && <p className="job-benefits"><strong>Benefits:</strong> {job.benefits}</p>}
                    {job.applyText && <p>{job.applyText}</p>}
                    {job.announcementPdf && (
                      <a
                        href={job.announcementPdf}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline job-pdf"
                      >
                        View Full Job Announcement{job.fileKind === 'pdf' ? ' (PDF)' : ''}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* How to submit */}
          <div className="careers-block">
            <h2>How to Apply</h2>
            <p>
              Pick up an employment application at City Hall, complete it, and return it to{' '}
              {SITE.address}, {SITE.cityState}. For questions about employment, call{' '}
              <a href={SITE.phoneHref}>{SITE.phone}</a> or email{' '}
              <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
