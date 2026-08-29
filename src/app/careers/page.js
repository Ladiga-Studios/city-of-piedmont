import '../pages.css';
import './careers.css';
import Link from 'next/link';
import { SITE } from '@/lib/site';

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
// Current openings. To add or remove a posting, edit this array —
// each entry renders as a card in the "Current Positions" section.
// Drop the full announcement PDF in public/documents/ and reference it
// in `announcementPdf`. Leave the array empty to show the
// "no open positions" note again.
// ------------------------------------------------------------------
const OPENINGS = [
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

export default function CareersPage() {
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
                  <li key={job.title} className="job-card">
                    <div className="job-head">
                      <h3>{job.title}</h3>
                      <span className="job-dept">{job.department}</span>
                    </div>
                    <p className="job-deadline">
                      <strong>Deadline to apply:</strong> {job.deadline}
                    </p>
                    <p>{job.summary}</p>
                    <h4>What you&rsquo;ll do</h4>
                    <ul className="job-duties">
                      {job.duties.map((d) => <li key={d}>{d}</li>)}
                    </ul>
                    <p className="job-benefits"><strong>Benefits:</strong> {job.benefits}</p>
                    <p>{job.applyText}</p>
                    <a
                      href={job.announcementPdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline job-pdf"
                    >
                      View Full Job Announcement
                    </a>
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
