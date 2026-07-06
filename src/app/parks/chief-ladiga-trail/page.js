import '../../pages.css';
import './park-detail.css';
import Link from 'next/link';
import ParkMap from '@/components/ParkMap';

export const metadata = {
  title: 'Chief Ladiga Trail',
  description:
    "The Chief Ladiga Trail is a 33-mile paved rail-trail through Piedmont, Alabama. It's Alabama's first rails-to-trails project, connecting to Georgia's Silver Comet Trail.",
};

// Eubanks Welcome Center: trailhead / parking for the Piedmont section
const LAT = 33.9226414;
const LNG = -85.6071317;
const DIRECTIONS_URL = `https://www.google.com/maps/dir/?api=1&destination=${LAT},${LNG}`;

export default function Trail() {
  return (
    <>
      <section className="page-hero">
        <div className="container inner">
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link><span aria-hidden="true">/</span>
            <Link href="/parks">Parks &amp; Recreation</Link><span aria-hidden="true">/</span>
            <span>Chief Ladiga Trail</span>
          </nav>
          <p className="eyebrow">Piedmont&rsquo;s Signature</p>
          <h1>Chief Ladiga Trail</h1>
          <p>Alabama&rsquo;s first extended rails-to-trails project, a paved path through the Appalachian foothills.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="pd-layout">
            <div className="pd-main">
              <div className="prose">
                <p>The Chief Ladiga Trail runs about 33 miles through Calhoun and Cleburne counties, connecting Piedmont, Jacksonville, Weaver, and Anniston. The 3.8-mile section through Piedmont winds through foothills, streams, and farmland.</p>
                <h2>Trail facts</h2>
                <ul>
                  <li>Surface: smooth asphalt, roughly 6 to 8 ft wide</li>
                  <li>Use: walking, running, cycling (non-motorized)</li>
                  <li>Connects to Georgia&rsquo;s Silver Comet Trail at the state line</li>
                  <li>Intersects the <Link href="/parks/pinhoti-trail">Pinhoti Trail</Link> north of Piedmont</li>
                </ul>
                <h2>Getting there</h2>
                <p>The Eubanks Welcome Center on Dailey Street serves the Piedmont section, with parking, restrooms, water, and a shaded gazebo for riders. For trail information, call the City of Piedmont at 256-447-3560.</p>
              </div>

              <figure className="photo-figure">
                <picture>
                  <source srcSet="/images/photos/chief-ladiga-trail.webp" type="image/webp" />
                  <img src="/images/photos/chief-ladiga-trail.jpg" alt="The paved Chief Ladiga Trail passing through the wooded foothills near Piedmont" loading="lazy" width="2000" height="1500" />
                </picture>
                <figcaption>
                  <span>The Chief Ladiga Trail through the Piedmont section.</span>
                </figcaption>
              </figure>
            </div>

            <aside className="pd-info">
              <div className="pd-card">
                <h2>Trailhead</h2>
                <div className="pd-row"><span className="pd-label">Parking &amp; Access</span><span>Eubanks Welcome Center</span></div>
                <div className="pd-row"><span className="pd-label">Address</span><span>202 Dailey St, Piedmont, AL 36272</span></div>
                <div className="pd-row"><span className="pd-label">Phone</span><a href="tel:2564473363">(256) 447-3363</a></div>
                <div className="pd-row"><span className="pd-label">On Site</span><span>Restrooms, water, gazebo</span></div>

                <div className="pd-map">
                  <ParkMap lat={LAT} lng={LNG} label="Eubanks Welcome Center, Chief Ladiga Trail, Piedmont, AL" />
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
