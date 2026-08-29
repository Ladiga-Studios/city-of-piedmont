import '../pages.css';
import './careers.css';
import Link from 'next/link';
import { SITE } from '@/lib/site';

export const metadata = {
  title: 'Careers',
  description:
    'Employment opportunities with the City of Piedmont, Alabama. Download an employment application and view current open positions.',
  alternates: { canonical: 'https://www.piedmontcity.org/careers' },
};

// Self-hosted so the link keeps working after the old WordPress site goes away.
// The PDF lives at public/documents/employment-application.pdf.
const APPLICATION_PDF = '/documents/employment-application.pdf';

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
    announcementPdf: '/documents/recreation-coordinator-job-announcement.pdf',
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
              Employment opportunities with the City of Piedmont. Download an application
              below and check the current openings.
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
            <a
              href={APPLICATION_PDF}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary careers-apply"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" />
              </svg>
              Application for Employment (PDF)
            </a>
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
                      Full Job Announcement (PDF)
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
              Complete the employment application above and return it to City Hall at{' '}
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
