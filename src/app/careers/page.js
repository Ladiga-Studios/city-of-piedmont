import '../pages.css';
import './careers.css';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import PageHeroPhoto from '@/components/PageHeroPhoto';

export const metadata = {
  title: 'Careers',
  description:
    'Employment opportunities with the City of Piedmont, Alabama. Download an employment application and view current open positions.',
  alternates: { canonical: 'https://www.piedmontcity.org/careers' },
};

const APPLICATION_PDF =
  'https://www.piedmontcity.org/wp-content/uploads/2021/12/APPLICATION.pdf';

export default function CareersPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container inner has-photo">
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
          <PageHeroPhoto src="/images/photos/downtown-2.jpg" webp="/images/photos/downtown-2.webp" alt="A downtown Piedmont street corner with historic brick buildings" />
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
            <div className="empty-note">
              We&rsquo;re sorry, but there are no open positions at this time. Please check back later!
            </div>
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
