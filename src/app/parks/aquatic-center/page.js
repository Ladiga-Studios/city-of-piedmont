import '../../pages.css';
import './park-detail.css';
import Link from 'next/link';
import ParkMap from '@/components/ParkMap';

export const metadata = {
  title: 'Aquatic Center',
  description:
    'The Piedmont Aquatic Center at 150 Sports Complex Drive: a seasonal outdoor pool with lap lanes, a water slide, a splash area, and plenty of deck seating. Register and buy passes through Piedmont Parks & Recreation.',
};

// Piedmont Aquatic Center: 150 Sports Complex Drive
const LAT = 33.9499;
const LNG = -85.5995;
const ADDRESS = '150 Sports Complex Drive, Piedmont, AL 36272';
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${LAT},${LNG}`;
const RECDESK_URL = 'https://piedmontparkandrec.recdesk.com/Community/Home';
const RECDESK_CALENDAR = 'https://piedmontparkandrec.recdesk.com/Community/Calendar';

export default function AquaticCenter() {
  return (
    <>
      <section className="page-hero">
        <div className="container inner">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span aria-hidden="true">/</span>
            <Link href="/parks">Parks &amp; Recreation</Link><span aria-hidden="true">/</span>
            <span>Aquatic Center</span>
          </nav>
          <p className="eyebrow">Recreation</p>
          <h1>Piedmont Aquatic Center</h1>
          <p>A seasonal outdoor pool with lap lanes, a water slide, and a splash area for the kids. Piedmont&rsquo;s spot to cool off all summer.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Hero panorama */}
          <figure className="photo-figure pd-hero-wide" style={{ marginBottom: 'var(--s5)' }}>
            <picture>
              <source srcSet="/images/photos/aquatic-pano.webp" type="image/webp" />
              <img src="/images/photos/aquatic-pano.jpg" alt="Panorama of the Piedmont Aquatic Center pool with a green water slide and bathhouse" loading="lazy" width="2200" height="475" />
            </picture>
          </figure>

          <div className="pd-layout">
            <div className="pd-main">
              <div className="prose">
                <p>
                  The Piedmont Aquatic Center is the city&rsquo;s outdoor swimming complex, open seasonally
                  through the warmer months. It features a large main pool with lap lanes, a tall water
                  slide, a zero-depth entry with a kids&rsquo; splash area and water-play features, and
                  plenty of deck seating and shade umbrellas for a full day at the pool.
                </p>
                <p>
                  It&rsquo;s a favorite gathering spot for families and a great place to cool off, swim
                  laps, or let the kids play. The center also hosts swim programs during the season.
                </p>
                <h2>At the pool</h2>
                <ul>
                  <li>Large main pool with marked lap lanes</li>
                  <li>Water slide</li>
                  <li>Zero-depth entry with kids&rsquo; splash &amp; water-play features</li>
                  <li>Deck seating, lounge chairs, and shade umbrellas</li>
                  <li>Bathhouse with restrooms and changing areas</li>
                  <li>Lifeguards on duty during open hours</li>
                </ul>
                <h2>Passes &amp; hours</h2>
                <p>
                  Day passes, season passes, and swim programs are handled through Piedmont Parks &amp;
                  Recreation&rsquo;s online portal. Hours are seasonal, so check the current schedule
                  before you go.
                </p>
                <p>
                  <a href={RECDESK_URL} target="_blank" rel="noopener noreferrer" className="pd-cta-link">Register &amp; buy passes &rarr;</a>{' '}
                  <a href={RECDESK_CALENDAR} target="_blank" rel="noopener noreferrer" className="pd-cta-link">View the schedule &rarr;</a>
                </p>
              </div>

              {/* gallery */}
              <div className="cc-gallery" style={{ marginTop: 'var(--s5)' }}>
                <picture>
                  <source srcSet="/images/photos/aquatic-overview.webp" type="image/webp" />
                  <img src="/images/photos/aquatic-overview.jpg" alt="The Piedmont Aquatic Center pool, slide, and rows of lounge chairs on a sunny day" loading="lazy" width="1400" height="1050" />
                </picture>
                <picture>
                  <source srcSet="/images/photos/aquatic-splash.webp" type="image/webp" />
                  <img src="/images/photos/aquatic-splash.jpg" alt="A mushroom water feature in the shallow splash area at the Aquatic Center" loading="lazy" width="720" height="720" />
                </picture>
              </div>
            </div>

            <aside className="pd-info">
              <div className="pd-card">
                <h2>Visit</h2>
                <div className="pd-row"><span className="pd-label">Address</span><span>{ADDRESS}</span></div>
                <div className="pd-row"><span className="pd-label">Season</span><span>Open seasonally (summer)</span></div>
                <div className="pd-row"><span className="pd-label">Hours</span><a href={RECDESK_CALENDAR} target="_blank" rel="noopener noreferrer">See current schedule</a></div>
                <div className="pd-row"><span className="pd-label">Passes</span><a href={RECDESK_URL} target="_blank" rel="noopener noreferrer">Register online</a></div>

                <div className="pd-map">
                  <ParkMap lat={LAT} lng={LNG} label="Piedmont Aquatic Center, 150 Sports Complex Drive, Piedmont, AL" />
                  <a href={DIRECTIONS_URL} target="_blank" rel="noopener noreferrer" className="pd-directions">
                    Get directions &rarr;
                  </a>
                </div>
              </div>
            </aside>
          </div>

          <Link href="/parks" className="pd-back">&larr; Back to Parks &amp; Recreation</Link>
        </div>
      </section>
    </>
  );
}
