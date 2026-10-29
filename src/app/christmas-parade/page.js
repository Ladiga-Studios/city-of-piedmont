import '../pages.css';
import '../electronic-work-order/work-order.css';
import './parade.css';
import ParadeEntryForm from './ParadeEntryForm';

// ------------------------------------------------------------------
// HIDDEN PAGE: Christmas Parade Entry Form (requested by Ben Singleton,
// October 2026).
// Deliberately unlisted: not in the nav, not in the sitemap, and marked
// noindex below so search engines skip it. Anyone with the URL can open it.
// Submissions email to amy.rawson@ and jay.wilson@piedmontcity.org via
// /api/parade-entry.
//
// FLYER: when the Christmas flyer is finished, put the image in
// public/images/ and set FLYER below, e.g.
//   const FLYER = { src: '/images/christmas-parade-2026.jpg', alt: '...', width: 1275, height: 1650 };
// ------------------------------------------------------------------

const FLYER = null;

export const metadata = {
  title: 'Christmas Parade Entry Form',
  description: 'Entry form for the City of Piedmont Christmas Parade.',
  robots: { index: false, follow: false },
};

export default function ChristmasParadePage() {
  return (
    <>
      <section className="page-hero">
        <div className="container inner">
          <div className="hero-text-col">
            <p className="eyebrow">City of Piedmont</p>
            <h1>Christmas Parade Entry Form</h1>
            <p>
              Thank you for your interest in Piedmont&rsquo;s Christmas Parade! Fill out the form
              below to enter. Your entry goes straight to City Hall.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container wo-wrap">
          {FLYER && (
            <figure className="pe-flyer">
              <a href={FLYER.src} target="_blank" rel="noopener">
                <img src={FLYER.src} alt={FLYER.alt} width={FLYER.width} height={FLYER.height} />
              </a>
            </figure>
          )}
          <ParadeEntryForm />
        </div>
      </section>
    </>
  );
}
